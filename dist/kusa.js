document.addEventListener('DOMContentLoaded', () => {
    // --- 動態建立對照表 ---
    const TO_GRASSED_MAP = {};
    const TO_TRIMMED_MAP = {};

    if (typeof TRIMMED_CHARS !== 'undefined' && typeof GRASSED_CHARS !== 'undefined') {
        // 使用 Array.from 或 [...string] 來正確處理 UTF-16 surrogate pairs
        const originalChars = [...TRIMMED_CHARS];
        const grassChars = [...GRASSED_CHARS];

        for (let i = 0; i < originalChars.length; i++) {
            const originalChar = originalChars[i];
            const grassChar = grassChars[i];

            // 只有當該字符還沒有對照關係時才建立，避免重複覆蓋
            if (!TO_GRASSED_MAP[originalChar]) {
                TO_GRASSED_MAP[originalChar] = grassChar;
            }
            if (!TO_TRIMMED_MAP[grassChar]) {
                TO_TRIMMED_MAP[grassChar] = originalChar;
            }
        }
    } else {
        console.error('grass.js 載入失敗或資料不正確。');
    }

    // --- DOM 元素 ---
    const mainText = document.getElementById('main-text');
    const grassBtn = document.getElementById('grass-btn');
    const degrassBtn = document.getElementById('degrass-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const copyFeedback = document.getElementById('copy-feedback');

    const headerTitle = document.querySelector('.app-container > header');
    const grassBtnLabel = grassBtn.querySelectorAll('span')[1];
    const copyBtnLabel = copyBtn.querySelectorAll('span')[1];
    const degrassBtnLabel = degrassBtn.querySelectorAll('span')[1];
    const clearBtnLabel = clearBtn.querySelectorAll('span')[1];

    const ORIGINAL_TEXTS = {
        header: headerTitle.textContent,
        grass: grassBtnLabel.textContent,
        copy: copyBtnLabel.textContent,
        degrass: degrassBtnLabel.textContent,
        clear: clearBtnLabel.textContent,
    };

    let TRIMMED_TEXTS = {};
    let GRASSED_TEXTS = {};

    function applyUiTexts(texts) {
        const t = texts || TRIMMED_TEXTS;
        headerTitle.textContent = t.header;
        grassBtnLabel.textContent = t.grass;
        copyBtnLabel.textContent = t.copy;
        degrassBtnLabel.textContent = t.degrass;
        clearBtnLabel.textContent = t.clear;
    }

    // --- 核心轉換功能 ---
    function toGrassed(text) {
        let result = '';
        for (const char of text) {
            result += TO_GRASSED_MAP[char] || char;
        }
        return result;
    }

    function toTrimmed(text) {
        let result = '';
        for (const char of text) {
            result += TO_TRIMMED_MAP[char] || char;
        }
        return result;
    }

    TRIMMED_TEXTS = {
        header: toTrimmed(ORIGINAL_TEXTS.header),
        grass: toTrimmed(ORIGINAL_TEXTS.grass),
        copy: toTrimmed(ORIGINAL_TEXTS.copy),
        degrass: toTrimmed(ORIGINAL_TEXTS.degrass),
        clear: toTrimmed(ORIGINAL_TEXTS.clear),
    };

    GRASSED_TEXTS = {
        header: toGrassed(ORIGINAL_TEXTS.header),
        grass: toGrassed(ORIGINAL_TEXTS.grass),
        copy: toGrassed(ORIGINAL_TEXTS.copy),
        degrass: toGrassed(ORIGINAL_TEXTS.degrass),
        clear: toGrassed(ORIGINAL_TEXTS.clear),
    };

    // --- 事件監聽 ---
    function updateUrl(mode, text) {
        const params = new URLSearchParams();
        if (mode) {
            params.set('mode', mode);
        }
        if (text) {
            params.set('q', text);
        }
        const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
        history.replaceState(null, '', newUrl);
    }

    grassBtn.addEventListener('click', () => {
        const currentText = mainText.value;
        if (currentText) {
            mainText.value = toGrassed(currentText);
        }
        applyUiTexts(GRASSED_TEXTS);
        updateUrl('grassed', mainText.value);
    });

    degrassBtn.addEventListener('click', () => {
        const currentText = mainText.value;
        if (currentText) {
            mainText.value = toTrimmed(currentText);
        }
        applyUiTexts(TRIMMED_TEXTS);
        updateUrl('trimmed', mainText.value);
    });

    clearBtn.addEventListener('click', () => {
        mainText.value = '';
        mainText.focus();
        applyUiTexts(ORIGINAL_TEXTS);
        updateUrl();
    });

    copyBtn.addEventListener('click', () => {
        if (mainText.value) {
            navigator.clipboard.writeText(mainText.value).then(() => {
                copyFeedback.style.visibility = 'visible';
                copyFeedback.style.opacity = '1';
                setTimeout(() => {
                    copyFeedback.style.opacity = '0';
                    copyFeedback.style.visibility = 'hidden';
                }, 1500);
            }).catch(err => {
                console.error('複製失敗:', err);
            });
        }
    });

    // --- 初始載入 ---
    const urlParams = new URLSearchParams(window.location.search);
    const urlText = urlParams.get('q');
    const urlMode = urlParams.get('mode');

    if (urlText) {
        mainText.value = urlText;
        if (urlMode === 'grassed') {
            mainText.value = toGrassed(mainText.value);
        } else if (urlMode === 'trimmed') {
            mainText.value = toTrimmed(mainText.value);
        }
    }

    if (urlMode === 'grassed') {
        applyUiTexts(GRASSED_TEXTS);
    } else if (urlMode === 'trimmed') {
        applyUiTexts(TRIMMED_TEXTS);
    } else {
        applyUiTexts(ORIGINAL_TEXTS);
    }

    mainText.focus();
});
