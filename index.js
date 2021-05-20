const puppeteer = require("puppeteer");
const fs = require('fs');
const { time } = require("console");

(async function main() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
      "Mozilla/5.0 (iPad; CPU OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/79.0.3945.73 Mobile/15E148 Safari/604.1"
    );

    await page.goto("https://covidwb.com/plasma");
    const title=await page.title();
    await console.log(`Scraping ${title} for data.....`);
   
    await page.waitForSelector(".container");

    const grabHeaders = await page.evaluate(() => {
      const namelist = document.querySelectorAll(
        ".mb-1.mr-1.row .col div strong"
      );
      const names = [];
      namelist.forEach((element) => {
        names.push(element.innerHTML);
      });
      return names;
    });

    const grabNumbers = await page.evaluate(() => {
      const phonelist = document.querySelectorAll(
        ".mb-1.mr-1.row .col .text-primary.mt-1 div:nth-child(1)"
      );
      const phoneNumbers = [];
      phonelist.forEach((element) => {
        phoneNumbers.push(element.innerHTML);
      });
      return phoneNumbers;
    });
    const grabEmail = await page.evaluate(() => {
        const emaillist = document.querySelectorAll(
          ".mb-1.mr-1.row .col .text-primary.mt-1 div:nth-child(2)"
        );
        const emails = [];
        emaillist.forEach((element) => {
          emails.push(element.innerHTML);
        });
        return emails;
      });

    const grabAddress = await page.evaluate(() => {
      const addresslist = document.querySelectorAll(
        ".m-1.p-2.card-body .row .col [class='text-muted small']"
      );
      const addresses = [];
      addresslist.forEach((element) => {
          addresses.push(element.innerHTML);
      });
      return addresses;
    });

    const grabTime = await page.evaluate(() => {
      const timelist = document.querySelectorAll(
        ".badge-pill.last-updated.p-2.text-muted.small.badge"
      );
      const times = [];
      timelist.forEach((element) => {
        times.push(element.innerHTML);
      });
      return times;
    });
    const headers = await grabHeaders;
    const numbers = await grabNumbers;
    const email = await grabEmail;
    const times = await grabTime;
    const addresses = await grabAddress;

    const rows = [];
    for (let i = 0; i<grabHeaders.length;i++){
        const row = [
            headers[i].replace(/,/g," "),
            numbers[i].replace(/,/g," "),
            email[i].replace(/,/g," "),
            addresses[i].replace(/,/g," "),
            times[i].replace(/,/g," "),
        ]

        console.log(row);
        rows.push(row);
    }
    console.log(rows);
    var csv = 'Name,Phone,Email,Address,Time of Verification\n';  
      
    rows.forEach(function(row) {  
            csv += row.join(',');  
            csv += "\n";  
    });  

    await fs.writeFile("./plasma-wb.csv", csv, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 
    
    await browser.close();
  } catch (e) {
    console.log(e);
  }
})();
