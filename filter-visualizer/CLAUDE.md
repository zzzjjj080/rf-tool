# フィルター Visualizer — 実装仕様書

## 概要

シングルファイル（HTML + CSS + JS）のアナログフィルター可視化ツール。
GitHub Pages で静的ホスティング。外部フレームワーク・ビルドツール不使用。

デプロイ先: `https://zzzjjj080.github.io/rf-tool/filter-visualizer/filter_visualizer.html`
親ページリンク: `rf-tool/index.html` の⑧番タブから遷移

---

## デザイン方針

- **フォント**: `Space Mono`（数値・コード）+ `Noto Sans JP`（日本語）— Google Fonts
- **UI 言語**: 日本語
- **カラーテーマ**: ライト / ダーク 切り替え対応（CSS custom properties）
- **参考デザイン**: `adc-visualizer/adc_visualizer.html` と CSS 変数・コンポーネントを統一
- **Canvas 描画**: Canvas 2D API、HiDPI 対応（`devicePixelRatio` スケーリング）
- **レスポンシブ**: `max-width: 1140px` コンテナ、`width:100%` キャンバス

---

## パラメータ（state オブジェクト）

```js
const state = {
  filterType: 'LPF',      // 'LPF' | 'HPF' | 'BPF' | 'BSF'
  design: 'butterworth',  // 'butterworth' | 'chebyshev1' | 'chebyshev2' | 'bessel'
  fc: 1000,               // カットオフ / 中心周波数 [Hz]
  N: 4,                   // フィルター次数 1–10
  ripple: 1.0,            // 通過域リップル [dB] (Chebyshev I のみ)
  stopAtten: 40,          // 阻止域減衰 [dB] (Chebyshev II のみ)
  Q: 2.0,                 // Q 値（BPF/BSF のみ）
};
```

### スライダー範囲

| key | min | max | step |
|-----|-----|-----|------|
| fc | 1 | 1e10 | — (log スライダー) |
| N | 1 | 10 | 1 |
| ripple | 0.1 | 3.0 | 0.1 |
| stopAtten | 20 | 80 | 1 |
| Q | 0.5 | 50 | 0.1 |

fc スライダーは `log10` スケール: `value = log10(fc)`, range [0, 10]

---

## 数学的実装方針

### 複素数演算
`{r, i}` オブジェクトでシンプル実装。FFT 不使用。

### プロトタイプフィルター（LPF、ωc=1 rad/s）

**Butterworth 極（−3dB が Ω=1）:**
```
θ_k = π(2k + N + 1) / (2N),  k = 0..N-1
p_k = cos(θ_k) + j·sin(θ_k)
```

**Chebyshev I 極（ −3dB が Ω=1 になるよう極をスケーリング）:**
```
ε = sqrt(10^(Rp/10) - 1)
γ = asinh(1/ε) / N
p_k = −sinh(γ)·sin(θ_k) + j·cosh(γ)·cos(θ_k),  θ_k=(2k−1)π/(2N)
Ω_3dB = cosh(acosh(1/ε) / N)  ← 極をこれで割ってスケール
```

**Chebyshev II（−3dB Ω=1 スケーリング）:**
```
ε = 1/sqrt(10^(Rs/10) - 1)   // Rs = 阻止域減衰 [dB]
γ = asinh(1/ε) / N
p_k^I = Cheb I 極  →  p_k^II = 1/p_k^I
零点: z_k = j/cos((2k−1)π/(2N)),  cos≠0 のみ
DC 利得を 1 に正規化後、数値的に Ω_3dB を探索してスケール
```

**Bessel 極（Durand-Kerner 法で逆ベッセル多項式の根を求める）:**
```
y_N(s) = Σ_{k=0}^{N} a_k · s^k
a_k = (2N−k)! / (2^(N−k) · k! · (N−k)!)
Durand-Kerner 法（200 反復）で根を求め、Re(p) < 0 の根を採用
数値的に Ω_3dB を探索してスケール → −3dB が Ω=1
```

### 周波数変換（LPF プロトタイプ → 各フィルタータイプ）

評価周波数 ω に対してプロトタイプ周波数 Ω を計算（ωc = 2π·fc, BW = ωc/Q）:
```
LPF: Ω = ω / ωc
HPF: Ω = ωc / ω
BPF: Ω = (ω² − ωc²) / (ω · BW)     [BW = ωc/Q]
BSF: Ω = ω · BW / (ωc² − ω²)        [BW = ωc/Q]
```

H(jΩ) = gain · ∏(jΩ − z_k) / ∏(jΩ − p_k) を複素数演算で直接計算。

### 群遅延
```
τ(ω) = −dφ/dω  ← 数値微分（Δω = 1e-4 · ω）
```

---

## Canvas 3 枚構成

### CV_DESIGN_H 定数（高さ管理）
```js
const CV_DESIGN_H = { cvBode: 300, cvPhase: 220, cvGD: 180 };
```

### ① ボード線図 — 振幅特性（高さ 300px）
- 縦軸: 振幅 [dB]、範囲: [−80, +5] 程度
- 横軸: 周波数（対数スケール）`[fc/100, fc*100]`
- **−3dB ライン**: 赤破線
- **fc マーカー**: 縦の点線
- グリッド: 10dB ステップ（縦）× 対数 1 decade（横）

### ② 位相特性（高さ 220px）
- 縦軸: 位相 [°]、範囲: [−200, +20]
- 横軸: 周波数（対数スケール）
- 0°, −90°, −180° グリッドライン（灰色破線）

### ③ 群遅延（高さ 180px）
- 縦軸: 群遅延 [s/µs/ns/ps]（自動スケール）
- 横軸: 周波数（対数スケール）
- Bessel では flat な特性が視覚的にわかること

### 共通
- 左マージン **60px**、右マージン 20px、上下 20px
- HiDPI 対応: `initCanvases()` / `getCtx()` 分離（ADC と同パターン）
- `cv.parentElement.clientWidth` でキャンバス幅取得

---

## 結果カード

| カード名 | 説明 |
|---------|------|
| −3dB 周波数 | 実際の −3dB カットオフ（クリックで詳細） |
| ロールオフ | 理論値 −20×N dB/dec |
| 通過域リップル | Chebyshev I のみ表示 |
| 阻止域減衰 | Chebyshev II のみ、fc×2 の位置 |
| 群遅延 fc | fc 付近の群遅延 |
| フィルター次数 N | 実効次数（BPF/BSF は 2N） |
| 極数 / 零点数 | プロトタイプの極・零点数 |
| フィルタータイプ | LPF/HPF/BPF/BSF |
| 設計手法 | Butterworth/Chebyshev I-II/Bessel |
| 伝達関数 H(s) | 次数 ≤ 4 のとき分子/分母多項式（テキスト表示） |

カードクリック → モーダルで詳細説明・計算過程表示（ADC と同仕様）

---

## Canvas 初期描画パターン（ADC と同一）

```js
const CV_DESIGN_H = { cvBode: 300, cvPhase: 220, cvGD: 180 };

function initCanvases() {
  const dpr = window.devicePixelRatio || 1;
  ['cvBode','cvPhase','cvGD'].forEach(id => {
    const cv = document.getElementById(id);
    const w = cv.parentElement.clientWidth || 600;
    const h = CV_DESIGN_H[id];
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  });
}

function getCtx(cv) {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(cv.width / dpr) || 600;
  const h = Math.round(cv.height / dpr) || 300;
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}
```

ResizeObserver + setTimeout(0) パターン（ADC と同一）。

---

## ファイル構成

```
rf-tool/
├── index.html              ← ⑧ フィルタービジュアライザー ↗ タブ追加
└── filter-visualizer/
    ├── CLAUDE.md           ← 本ファイル
    └── filter_visualizer.html
```

---

## 既知の注意事項

1. **CV_DESIGN_H 定数** — `cv.height = Math.round(h*dpr)` で cv.height が破壊されるため、描画時は定数から読む
2. **Bessel 次数 N=1** — ベッセル多項式は s+1、根は s=−1（通常の1次ローパスと同じ）
3. **BPF/BSF の実効次数** — プロトタイプ N 次 → BPF/BSF は 2N 次になる（結果カードに表示）
4. **BSF Ω=ωc での発散** — ω→ωc 付近の BSF 応答は不連続に見える（正常）
5. **Chebyshev I のみ ripple スライダー表示、Chebyshev II のみ stopAtten スライダー表示**
