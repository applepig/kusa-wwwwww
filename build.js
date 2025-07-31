const fs = require('fs');
const path = require('path');

console.log('開始建置...');

// 執行 converter.js 來產生 grass.js
console.log('執行資料轉換...');
require('./src/converter.js');
console.log('資料轉換完成。');

console.log('建置成功！');
