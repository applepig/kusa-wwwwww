const fs = require('fs');
const path = require('path');

// 定義檔案路徑
const outputDir = path.join(__dirname, '..', 'app');
const inputFilePath = path.join(__dirname, 'raw_data.txt');
const outputFilePath = path.join(outputDir, 'grass.js');

// 確保 app 資料夾存在
fs.mkdirSync(outputDir, { recursive: true });

// 使用正規表示式來匹配 "⿱艹" 後面跟著一個字的結構，允許後面有標記如[JK]
const pattern = /^⿱艹(.)(?:\[[A-Z]+\])?$/;

console.log(`正在讀取檔案: ${inputFilePath}`);

try {    const fileContent = fs.readFileSync(inputFilePath, 'utf-8');    const lines = fileContent.split(/\r?\n/);    const original_chars = [];
    const grass_chars = [];
    const seen_keys = new Set();

    lines.forEach(line => {
        if (!line.trim()) {
            return;
        }

        const parts = line.trim().split('\t');

        if (parts.length >= 2) {
            const character = parts[1];

            // 檢查所有欄位（從第3欄開始）是否有匹配的結構
            for (let i = 2; i < parts.length; i++) {
                const structure = parts[i];
                const match = structure.match(pattern);

                if (match) {
                    const key = match[1];
                    if (!seen_keys.has(key)) {
                        original_chars.push(key);
                        grass_chars.push(character);
                        seen_keys.add(key);
                    }
                    break; // 找到一個匹配就停止檢查後續欄位
                }
            }
        }
    });

    const chunkSize = 50;
    let js_content = 'const TRIMMED = [];\nconst GRASSED = [];\n\n';

    for (let i = 0; i < original_chars.length; i += chunkSize) {
        const original_chunk = original_chars.slice(i, i + chunkSize).join('');
        const grass_chunk = grass_chars.slice(i, i + chunkSize).join('');
        const chunk_index = Math.floor(i / chunkSize);

        js_content += `TRIMMED[${chunk_index}] = "${original_chunk}";\n`;
        js_content += `GRASSED[${chunk_index}] = "${grass_chunk}";\n\n`;
    }

    js_content += "export const TRIMMED_CHARS = TRIMMED.join('');\n";
    js_content += "export const GRASSED_CHARS = GRASSED.join('');\n";

    fs.writeFileSync(outputFilePath, js_content, 'utf-8');

    console.log(`成功產生檔案: ${outputFilePath}`);
    console.log(`共處理了 ${original_chars.length} 個字元。`);

} catch (error) {
    console.error(`處理過程中發生錯誤: ${error.message}`);
    process.exit(1);
}
