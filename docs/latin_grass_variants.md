# 英文字母草體化研究

本專案原先只處理「加草字頭」的中文轉換。為了評估英文字母是否也能以類似的方式呈現草感，先蒐集可能與「草」形狀接近的變體。此處整理部分常見拉丁字母加上變音符號後的字元，可作為未來實作的參考。

| 原字母 | 可能的草感變體 | Unicode 名稱 |
|-------|----------------|-------------|
| A | Ǎ, Ã, Ā | A with caron / tilde / macron |
| B | Ḃ, Ƀ | B with dot above / barred B |
| C | Č, Ĉ | C with caron / circumflex |
| D | Ď | D with caron |
| E | Ě, Ē, Ë | E with caron / macron / diaeresis |
| F | Ƒ, Ḟ | Hooked F / F with dot above |
| G | Ǧ, Ğ | G with caron / breve |
| H | Ȟ, Ĥ | H with caron / circumflex |
| I | Ĭ, Ĩ, Ï | I with breve / tilde / diaeresis |
| J | Ĵ | J with circumflex |
| K | Ǩ, Ķ | K with caron / cedilla |
| L | Ĺ, Ḷ | L with acute / dot below |
| M | Ḿ, Ṁ | M with acute / dot above |
| N | Ń, Ñ | N with acute / tilde |
| O | Ō, Õ, Ő | O with macron / tilde / double acute |
| P | Ṕ, Ṗ | P with acute / dot above |
| Q | Ɋ, Ǫ | Q with hook tail / ogonek |
| R | Ř, Ŕ | R with caron / acute |
| S | Š, Ŝ | S with caron / circumflex |
| T | Ť, Ṫ | T with caron / dot above |
| U | Ũ, Ů, Ű | U with tilde / ring above / double acute |
| V | Ṽ | V with tilde |
| W | Ŵ | W with circumflex |
| X | Ẍ, X̂ | X with diaeresis / circumflex (組合字) |
| Y | Ŷ, Ẏ | Y with circumflex / dot above |
| Z | Ž, Ż | Z with caron / dot above |

上述字元多使用上方的變音符號（例如 caron、tilde、circumflex）產生類似枝葉的視覺效果，多少有點「長草」的感覺。部分字母沒有現成的帶草感的預組字，可考慮以「字元＋結合用變音符號」的方式組合，例如 `B̌` (B + U+030C)。

這些資料僅供參考，實際挑選時可以根據視覺效果與可讀性再做調整。未來若要在程式中支援英文字母的草體化，可建立 A–Z 與這些變體之間的對應表，類似現有中文轉換的實作方式。
