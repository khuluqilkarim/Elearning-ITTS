const puppeteer = require('puppeteer');
const express = require('express');
const app = express();

app.get('/tugas', async (req, res) => {
  const hasil = await Cari_tugas();
  res.send(hasil);
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

async function Cari_tugas() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://elearning.ittelkom-sby.ac.id/login/index.php'); 

  await page.type('input[name="username"]', 'ISI DENGAN NIM');
  await page.type('input[name="password"]', 'ISI DENGAN PASSWD');
  await Promise.all([
    page.waitForNavigation(),
    page.click('button[type="submit"]')
  ]);

  await page.goto('https://elearning.ittelkom-sby.ac.id/calendar/view.php'); 

  const col11Elements = await page.$$eval('.calendarwrapper .eventlist .event .card .description .row .col-xs-11', elements => {
    return elements.map(element => element.textContent.trim());
  });

  const event = col11Elements[1];
  const tugas = "Tugas : " + col11Elements[2];
  const deadline = "Deadline : " + col11Elements[0];
  
  const hasil = {
    event,
    tugas,
    deadline
  };

  await browser.close();

  return hasil;
}
