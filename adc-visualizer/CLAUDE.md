# ADC Visualizer — 実装仕様書

## 概要

シングルファイル（HTML + CSS + JS）の ADC（アナログ-デジタル変換器）可視化ツール。
GitHub Pages で静的ホスティングするため、外部フレームワーク・ビルドツール不使用。

デプロイ先: `https://zzzjjj080.github.io/rf-tool/adc-visualizer/adc_visualizer.html`
親ページリンク: `rf-tool/index.html` の⑦番タブから遷移

---

## デザイン方針

- **フォント**: `Space Mono`（数値・コード）+ `Noto Sans JP`（日本語）— Google Fonts
- **UI 言語**: 日本語
- **カラーテーマ**: ライト / ダーク 切り替え対応（CSS custom properties）
- **参考デザイン**: 同リポジトリの `cordic-visualizer/cordic_visualizer.html` と統一感
- **Canvas 描画**: Canvas 2D API、HiDPI 対応（`devicePixelRatio` スケーリング）
- **レスポンシブ**: `max-width: 1140px` コンテナ、`width:100%` キャンバス

---

## パラメータ（state オブジェクト）

```js
const state = {
  fin:        3,       // 入力周波数 [kHz]
  ain:        0.9,     // 入力振幅 [×Vref]
  fs:         80000,   // サンプリングレート [kHz] = 80 MSPS
  N:          12,      // ビット数
  Vref:       1.0,     // フルスケール電圧 [V]（片側）
  Vcm:        0.9,     // コモンモード電圧 [V]
  inputMode:  'fully-diff',     // 'single-ended' | 'pseudo-diff' | 'fully-diff'
  codeFormat: 'twos-complement', // 'twos-complement' | 'offset-binary'
  preset:     'AD9633-80',
};
```

### スライダー範囲

| key | min | max | step |
|-----|-----|-----|------|
| fin | 0.001 | 20000 | 0.001 |
| ain | 0.05 | 1.0 | 0.01 |
| fs | 0.001 | 200000 | 0.001 |
| N | 1 | 16 | 1 |
| Vref | 0.1 | 5.0 | 0.1 |
| Vcm | 0.0 | 5.0 | 0.1 |

---

## 部品プリセット（初期実装は AD9633-80 のみ）

初期リリースは **AD9633-80** のみ実装。残りはリストアップのみ、将来対応。

```js
const PRESETS = {
  'AD9633-80': { N:12, fs:80000,  Vref:1.0, Vcm:0.9, inputMode:'fully-diff',    codeFormat:'twos-complement' },
  // ── 以下は将来実装予定（今は UI に表示しない or disabled） ──
  // 'AD9233-80':  { N:12, fs:80000,  Vref:1.0,  Vcm:0.5, inputMode:'single-ended', codeFormat:'twos-complement' },
  // 'AD9467-250': { N:16, fs:250000, Vref:1.0,  Vcm:0.9, inputMode:'fully-diff',   codeFormat:'twos-complement' },
  // 'MAX11905':   { N:20, fs:1600,   Vref:2.048,Vcm:0.0, inputMode:'pseudo-diff',  codeFormat:'twos-complement' },
  // 'LTC2387-18': { N:18, fs:15000,  Vref:2.048,Vcm:0.0, inputMode:'pseudo-diff',  codeFormat:'twos-complement' },
  // 'ADS8881':    { N:18, fs:1000,   Vref:5.0,  Vcm:0.0, inputMode:'single-ended', codeFormat:'twos-complement' },
  // 'ADS1115':    { N:16, fs:0.86,   Vref:2.048,Vcm:0.0, inputMode:'single-ended', codeFormat:'twos-complement' },
};
```

デフォルト選択: `AD9633-80`

---

## Canvas 3 枚構成

### ① アナログ入力 & サンプル点（高さ 280px）
- IN+ アナログ正弦波（青）
- IN− 波形（紫、inputMode による）
  - `single-ended`: 描画しない
  - `pseudo-diff`: Vcm の水平破線
  - `fully-diff`: 逆位相正弦波
- サンプル点（緑の縦線 + 点）
- ±Vref 限界線（赤破線）
- 縦軸: 電圧 [V]、固定範囲 `Vcm ± Vref`（スケール変動なし）
- 横軸: 時間（周期数）

### ② 量子化出力・階段波形（高さ 260px）
- アナログ参照波形（薄い青）
- 量子化後の階段波形（赤/橙）
- 縦軸: 電圧 [V]（アナログ入力と同スケール）

### ③ 量子化誤差（高さ 160px）
- 誤差波形（赤/橙）
- ±LSB/2 の限界線（グレー破線）
- 縦軸: 誤差 [V]

### 共通
- 左マージン **60px 以上**（縦軸ラベルが収まるように）
- グリッド線
- 縦軸目盛りラベル（はみ出し禁止 — `textAlign:'right'` で `mx-5` 付近に描画）

---

## ADC 数学

```
effectiveVref = (inputMode === 'fully-diff') ? Vref * 2 : Vref
levels = 2^N
LSB = 2 * effectiveVref / levels

// 量子化
centered = vin - Vcm
clamped  = clamp(centered, -effectiveVref, effectiveVref - LSB)
quantized = round(clamped / LSB) * LSB + Vcm

// SNR / ENOB
sigPow  = (ain * effectiveVref)^2 / 2
noisePow = LSB^2 / 12
SNR     = 10 * log10(sigPow / noisePow)   [dB]
SQNR    = 6.02 * N + 1.76                 [dB]
ENOB    = (SNR - 1.76) / 6.02
```

---

## 結果カード表示

右側パネルにカード一覧：
- SNR [dB]、SQNR [dB]、ENOB
- LSB [mV または V]
- 量子化レベル数
- ナイキスト / エリアシング情報（fin vs fs/2）
- Ain [V]、Ain/Vref [%]
- Vcm [V]、入力レンジ [V]
- 入力モード、コード方式
- デジタル出力コード（10進 / 16進）

---

## バナー

- **エリアシングバナー**: `fin >= fs/2` のとき警告表示、エイリアス周波数も表示
- **クリッピングバナー**: `ain * effectiveVref > effectiveVref` のとき警告

---

## Canvas 初期描画（重要）

```js
// スクリプト末尾（body 閉じタグ直前）
syncUI();
updateResults();

// ResizeObserver で親要素に実サイズが付いてから描画
// コールバック内では setTimeout(0) で一拍置く（layout commit 待ち）
if (window.ResizeObserver) {
  const ro = new ResizeObserver(() => {
    ro.disconnect();
    setTimeout(draw, 0);
  });
  ro.observe(document.getElementById('cvAnalog'));
} else {
  window.addEventListener('load', update);
}

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(draw, 80);
});
```

### resizeCanvas 実装（重要）

```js
function resizeCanvas(cv) {
  const dpr = window.devicePixelRatio || 1;
  const w = cv.parentElement.clientWidth || 600;
  const h = parseInt(cv.getAttribute('height'), 10);
  cv.style.width  = w + 'px';
  cv.style.height = h + 'px';
  cv.width  = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, w, h };
}
```

`cv.style.width` を明示的に設定し、DPR ズレを防ぐ。

---

## ファイル構成

```
rf-tool/
├── index.html                    ← ⑦ ADC ビジュアライザー ↗ タブリンク追加済み
└── adc-visualizer/
    └── adc_visualizer.html       ← シングルファイル（CSS + HTML + JS）
```

---

## UI 構成（日本語）

```
[ヘッダー: ADC ビジュアライザー タイトル]
[サブタイトル: アナログ入力 → サンプリング → 量子化 → デジタル出力]

[説明パネル: ADCとは？]

[パラメータ設定パネル]
  部品プリセット: [AD9633-80 ▼]
  入力周波数 FIN  入力振幅 AIN  サンプリングレート FS  ビット数 N  フルスケール VREF  コモンモード VCM
  入力モード [Fully-Diff ▼]   出力コード方式 [2の補数 ▼]

[アナログ入力 & サンプル点]
  [canvas cvAnalog height=280]
  [凡例]

[量子化出力（階段波形）]
  [canvas cvQuant height=260]
  [凡例]

[量子化誤差]
  [canvas cvError height=160]
  [凡例]

[結果カードグリッド]
```

---

## 既知の問題（新実装で必ず解決すること）

1. **縦軸ラベルのはみ出し** — 左マージンを最低 60px 確保し、ラベルを canvas 内に収める
2. **初期描画ブランク** — ResizeObserver + setTimeout(0) で確実に初回描画
3. **スライダー変更が反映されない** — `updateResults()` が例外でクラッシュしないこと（`isFullyDiff` などのスコープエラーに注意）
