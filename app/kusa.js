import { TRIMMED_CHARS, GRASSED_CHARS } from './grass.js';

class KusaApp {
    constructor() {
        this.state = {
            text: '',
            mode: 'normal', // 'normal', 'grassed', or 'trimmed'
        };

        this.initialize();
    }

    initialize() {
        this.buildMaps();
        this.cacheDom();
        this.bindEvents();
        this.loadFromUrl();
        this.render();
    }

    buildMaps() {
        this.toGrassedMap = {};
        this.toTrimmedMap = {};
        const originalChars = [...TRIMMED_CHARS];
        const grassChars = [...GRASSED_CHARS];

        for (let i = 0; i < originalChars.length; i++) {
            const originalChar = originalChars[i];
            const grassChar = grassChars[i];
            if (!this.toGrassedMap[originalChar]) {
                this.toGrassedMap[originalChar] = grassChar;
            }
            if (!this.toTrimmedMap[grassChar]) {
                this.toTrimmedMap[grassChar] = originalChar;
            }
        }
    }

    cacheDom() {
        this.mainText = document.getElementById('main-text');
        this.grassBtn = document.getElementById('grass-btn');
        this.trimBtn = document.getElementById('degrass-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.copyBtn = document.getElementById('copy-btn');
        this.copyFeedback = document.getElementById('copy-feedback');
        this.headerTitle = document.getElementById('header-title');
        this.originalHeader = this.headerTitle.textContent;
    }

    bindEvents() {
        this.mainText.addEventListener('input', () => {
            this.setState({ text: this.mainText.value });
        });

        this.grassBtn.addEventListener('click', () => {
            this.setState({
                text: this.toGrassed(this.state.text),
                mode: 'grassed',
            });
        });

        this.trimBtn.addEventListener('click', () => {
            this.setState({
                text: this.toTrimmed(this.state.text),
                mode: 'trimmed',
            });
        });

        this.clearBtn.addEventListener('click', () => {
            this.setState({ text: '', mode: 'normal' });
            this.mainText.focus();
        });

        this.copyBtn.addEventListener('click', () => {
            if (this.state.text) {
                navigator.clipboard.writeText(this.state.text).then(() => {
                    this.copyFeedback.style.visibility = 'visible';
                    this.copyFeedback.style.opacity = '1';
                    setTimeout(() => {
                        this.copyFeedback.style.opacity = '0';
                        this.copyFeedback.style.visibility = 'hidden';
                    }, 1500);
                }).catch(err => {
                    console.error('複製失敗:', err);
                });
            }
        });
    }

    loadFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const text = urlParams.get('q') || '';
        const mode = urlParams.get('mode') || 'normal';
        
        let processedText = text;
        if (mode === 'grassed') {
            processedText = this.toGrassed(text);
        } else if (mode === 'trimmed') {
            processedText = this.toTrimmed(text);
        }

        this.setState({ text: processedText, mode });
    }
    
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
        this.updateUrl();
    }

    render() {
        this.mainText.value = this.state.text;

        if (this.state.mode === 'grassed') {
            this.headerTitle.textContent = this.toGrassed(this.originalHeader);
        } else if (this.state.mode === 'trimmed') {
            this.headerTitle.textContent = this.toTrimmed(this.originalHeader);
        } else {
            this.headerTitle.textContent = this.originalHeader;
        }
    }
    
    updateUrl() {
        const params = new URLSearchParams();
        if (this.state.text) {
            params.set('q', this.state.text);
            params.set('mode', this.state.mode);
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        history.replaceState(null, '', newUrl);
    }

    toGrassed(text) {
        return [...text].map(char => this.toGrassedMap[char] || char).join('');
    }

    toTrimmed(text) {
        return [...text].map(char => this.toTrimmedMap[char] || char).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new KusaApp();
});
