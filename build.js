const fs = require('fs');
const path = require('path');

console.log('開始建置...');

// 步驟 1: 執行 converter.js 來產生 grass.js
console.log('執行資料轉換...');
require('./src/converter.js');
console.log('資料轉換完成。');

// 步驟 2: 複製 src/index.html 到 dist/
const srcHtmlPath = path.join(__dirname, 'src', 'index.html');
const destHtmlPath = path.join(__dirname, 'dist', 'index.html');

console.log('複製 HTML 檔案...');
fs.copyFileSync(srcHtmlPath, destHtmlPath);
console.log('HTML 檔案複製完成。');

console.log('建置成功！');
