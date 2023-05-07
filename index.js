const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3030;

let hasilTerakhir; // nampung nilai yang di load selama 1 menit

app.get('/tugas', async (req, res) => {
  // Jika hasilTerakhir kosong, panggil fungsi Cari_tugas untuk mendapatkan hasil terbaru
  if (!hasilTerakhir) {
    const nilai = await Cari_tugas();
    return res.send(nilai); 
  }

  // Kirim hasilTerakhir jika sudah tersedia
  if (hasilTerakhir) {
    return res.send(JSON.stringify(hasilTerakhir));
  } else {
    // Jika hasilTerakhir masih kosong, kirimkan pesan error
    return res.status(500).send('Gagal mendapatkan hasil tugas terbaru');
  }
});

app.get('/', async (req, res) => {
  res.send('Hallo kak')
});


app.listen(PORT, () => {
  console.log('Server started on port 3000');
});

setInterval(async () => {
  hasilTerakhir = await Cari_tugas();
  console.log('Hasil terakhir:', hasilTerakhir);
}, 60 * 1000); // 1 menit dalam milidetik

async function Cari_tugas() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'], cache: false });
  const page = await browser.newPage();

  await page.goto('https://elearning.ittelkom-sby.ac.id/login/index.php'); 

  await page.type('input[name="username"]', 'NIM');
  await page.type('input[name="password"]', 'PASSWD');
  await Promise.all([
    page.waitForNavigation(),
    page.click('button[type="submit"]')
  ]);

  await page.goto('https://elearning.ittelkom-sby.ac.id/calendar/view.php'); 

  const data = await page.$$eval('.calendarwrapper .eventlist .event .card', elements => {
    return elements.map(element => {
      const title = element.querySelector('h3').textContent.trim();
      const description = element.querySelector('.description .row .col-xs-11').textContent.trim();
      return { title, description};
    });
  });
  
  await browser.close();

  const json = JSON.stringify(data);

  return json;
}
