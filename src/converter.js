const fs = require('fs');
const path = require('path');

// 使用正規表示式來匹配 "⿱艹" 後面跟著一個字的結構，允許後面有標記如[JK]
const chinesePattern = /^⿱艹(.)(?:\[[A-Z]+\])?$/;

// 統一的檔案讀取和處理函數
function convertFile(inputFilePath, processor, description) {
    const original_chars = [];
    const grass_chars = [];

    console.log(`正在讀取${description}檔案: ${inputFilePath}`);

    try {
        const fileContent = fs.readFileSync(inputFilePath, 'utf-8');
        const lines = fileContent.split(/\r?\n/);

        processor(lines, original_chars, grass_chars);

        console.log(`${description}轉換完成，共處理了 ${original_chars.length} 個字元。`);
        return { original_chars, grass_chars };

    } catch (error) {
        console.error(`${description}處理過程中發生錯誤: ${error.message}`);
        throw error;
    }
}

// 中文處理邏輯
function processChinese(lines, original_chars, grass_chars) {
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
                const match = structure.match(chinesePattern);

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
}

// 拉丁字母處理邏輯
function processLatin(lines, original_chars, grass_chars) {
    lines.forEach(line => {
        if (!line.trim()) {
            return;
        }

        const parts = line.trim().split('\t');

        if (parts.length >= 2) {
            const originalChar = parts[0];
            const variants = parts[1];

            // 每個原始字元重複多次，對應所有變體
            for (const variant of variants) {
                original_chars.push(originalChar);
                grass_chars.push(variant);
            }
        }
    });
}

function convertChinese() {
    const inputFilePath = path.join(__dirname, 'raw_chinese.txt');
    return convertFile(inputFilePath, processChinese, '中文');
}

function convertLatin() {
    const inputFilePath = path.join(__dirname, 'raw_latin.txt');
    return convertFile(inputFilePath, processLatin, '拉丁字母');
}

function generateGrassJS(chineseResult, latinResult) {
    const outputDir = path.join(__dirname, '..', 'app');
    const outputFilePath = path.join(outputDir, 'grass.js');

    // 確保 app 資料夾存在
    fs.mkdirSync(outputDir, { recursive: true });

    // 產生 JavaScript 程式碼
    const chunkSize = 50;
    let js_content = 'const TRIMMED = [];\nconst GRASSED = [];\n\n';

    // 統一的 chunk 產生函數
    function generateChunks(originalChars, grassChars, startIndex) {
        for (let i = 0; i < originalChars.length; i += chunkSize) {
            const original_chunk = originalChars.slice(i, i + chunkSize).join('');
            const grass_chunk = grassChars.slice(i, i + chunkSize).join('');
            const chunk_index = startIndex + Math.floor(i / chunkSize);

            js_content += `TRIMMED[${chunk_index}] = "${original_chunk}";\n`;
            js_content += `GRASSED[${chunk_index}] = "${grass_chunk}";\n\n`;
        }
    }

    // 先處理中文部分
    generateChunks(chineseResult.original_chars, chineseResult.grass_chars, 0);
    
    // 再處理拉丁字母部分
    const chineseChunkCount = Math.ceil(chineseResult.original_chars.length / chunkSize);
    generateChunks(latinResult.original_chars, latinResult.grass_chars, chineseChunkCount);

    js_content += "export const TRIMMED_CHARS = TRIMMED.join('');\n";
    js_content += "export const GRASSED_CHARS = GRASSED.join('');\n";

    fs.writeFileSync(outputFilePath, js_content, 'utf-8');
    console.log(`成功產生檔案: ${outputFilePath}`);
}

function main() {
    console.log('開始建置...');

    try {
        // 轉換中文
        const chineseResult = convertChinese();
        
        // 轉換拉丁字母
        const latinResult = convertLatin();
        
        // 產生最終檔案（分開處理）
        generateGrassJS(chineseResult, latinResult);

        console.log(`總共處理了 ${chineseResult.original_chars.length + latinResult.original_chars.length} 個字元。`);
        console.log(`其中中文: ${chineseResult.original_chars.length} 個，拉丁字母: ${latinResult.original_chars.length} 個`);

    } catch (error) {
        console.error(`處理過程中發生錯誤: ${error.message}`);
        process.exit(1);
    }
}

main();

module.exports = { convertChinese, convertLatin, generateGrassJS, main }; 