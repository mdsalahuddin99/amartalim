const https = require('https');
const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, 'public', 'fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const fontPath = path.join(fontsDir, 'Kalpurush.ttf');
const url = 'https://raw.githubusercontent.com/w23/Kalpurush-font/master/Kalpurush.ttf';

console.log('Downloading Kalpurush font...');
const file = fs.createWriteStream(fontPath);

https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('✅ Kalpurush font downloaded successfully to public/fonts/Kalpurush.ttf');
  });
}).on('error', (err) => {
  fs.unlink(fontPath, () => {});
  console.error('❌ Error downloading font:', err.message);
});
