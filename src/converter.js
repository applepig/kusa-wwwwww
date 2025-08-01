const fs = require('fs');
const path = require('path');

const chinesePattern = /^⿱艹(.)(?:\[[A-Z]+\])?$/;

function parse(filePath, handler) {
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  const original = [];
  const grass = [];
  handler(lines, original, grass);
  return { original, grass };
}

function parseChinese(lines, original, grass) {
  const seen = new Set();
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.trim().split('\t');
    if (parts.length >= 2) {
      const character = parts[1];
      for (let i = 2; i < parts.length; i++) {
        const match = parts[i].match(chinesePattern);
        if (match) {
          const key = match[1];
          if (!seen.has(key)) {
            original.push(key);
            grass.push(character);
            seen.add(key);
          }
          break;
        }
      }
    }
  }
}

function parseLatin(lines, original, grass) {
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.trim().split('\t');
    if (parts.length >= 2) {
      const originalChar = parts[0];
      const variants = parts[1];
      for (const variant of variants) {
        original.push(originalChar);
        grass.push(variant);
      }
    }
  }
}

function format(parsed, startIndex) {
  const chunkSize = 50;
  const { original, grass } = parsed;
  let result = '';
  for (let i = 0; i < original.length; i += chunkSize) {
    const oChunk = original.slice(i, i + chunkSize).join('');
    const gChunk = grass.slice(i, i + chunkSize).join('');
    const index = startIndex + Math.floor(i / chunkSize);
    result += `TRIMMED[${index}] = "${oChunk}";\n`;
    result += `GRASSED[${index}] = "${gChunk}";\n\n`;
  }
  const chunkCount = Math.ceil(original.length / chunkSize);
  return { text: result, chunks: chunkCount };
}

function main() {
  console.log('開始建置...');
  const chineseFile = path.join(__dirname, 'raw_chinese.txt');
  const latinFile = path.join(__dirname, 'raw_latin.txt');
  const outputDir = path.join(__dirname, '..', 'app');
  const outputFile = path.join(outputDir, 'grass.js');
  fs.mkdirSync(outputDir, { recursive: true });

  let result = 'const TRIMMED = [];\nconst GRASSED = [];\n\n';

  const chineseData = parse(chineseFile, parseChinese);
  const chineseRes = format(chineseData, 0);
  result += chineseRes.text;

  const latinData = parse(latinFile, parseLatin);
  const latinRes = format(latinData, chineseRes.chunks);
  result += latinRes.text;

  result += "export const TRIMMED_CHARS = TRIMMED.join('');\n";
  result += "export const GRASSED_CHARS = GRASSED.join('');\n";

  fs.writeFileSync(outputFile, result, 'utf8');

  console.log(`成功產生檔案: ${outputFile}`);
  console.log(`總共處理了 ${chineseData.original.length + latinData.original.length} 個字元。`);
  console.log(`其中中文: ${chineseData.original.length} 個，拉丁字母: ${latinData.original.length} 個`);
}

main();
