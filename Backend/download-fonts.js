// This script downloads standard font files for pdf.js/pdf-parse
// Run: node download-fonts.js

const https = require('https');
const fs = require('fs');
const path = require('path');

const fontFiles = [
  'Times-Roman.afm',
  'Times-Bold.afm',
  'Times-Italic.afm',
  'Times-BoldItalic.afm',
  'Helvetica.afm',
  'Helvetica-Bold.afm',
  'Helvetica-Oblique.afm',
  'Helvetica-BoldOblique.afm',
  'Courier.afm',
  'Courier-Bold.afm',
  'Courier-Oblique.afm',
  'Courier-BoldOblique.afm',
  'Symbol.afm',
  'ZapfDingbats.afm',
];

const baseUrl = 'https://raw.githubusercontent.com/mozilla/pdfjs-dist/master/standard_fonts/';
const destDir = path.join(__dirname, 'public', 'standard_fonts');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function downloadFont(font) {
  return new Promise((resolve, reject) => {
    const url = baseUrl + font;
    const dest = path.join(destDir, font);
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

(async () => {
  for (const font of fontFiles) {
    try {
      console.log(`Downloading ${font}...`);
      await downloadFont(font);
      console.log(`Downloaded ${font}`);
    } catch (err) {
      console.error(`Error downloading ${font}:`, err.message);
    }
  }
  console.log('All fonts processed.');
})();
