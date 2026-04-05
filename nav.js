/**
 * nav.js — RF計算ツール 共通ナビゲーション
 * 各ビジュアライザーページに include してタブバーを共有する
 *
 * 使い方（ページの <body> 直後に記述）:
 *   <script>var RF_ACTIVE_TAB = 'cordic';</script>
 *   <script src="../nav.js"></script>
 *
 * RF_ACTIVE_TAB に設定できる値:
 *   'mod1'〜'mod5' | 'cordic' | 'adc' | 'filter' | 'pid'
 *   | 'fft' | 'na' | 'pa' | 'pll' | 'matching'
 */
(function () {
  /* ── ベースURL を script src から自動算出 ── */
  const scriptSrc = (document.currentScript || {}).src || '';
  const baseUrl   = scriptSrc ? scriptSrc.replace(/nav\.js.*$/, '') : '/';

  const active = (typeof RF_ACTIVE_TAB !== 'undefined') ? RF_ACTIVE_TAB : '';

  /* ── タブ定義 ── */
  const tabs = [
    { id: 'mod1',     label: '① 方向性結合器',     href: baseUrl + 'index.html?tab=mod1' },
    { id: 'mod2',     label: '② VIセンサー',         href: baseUrl + 'index.html?tab=mod2' },
    { id: 'mod3',     label: '③ スミスチャート解析', href: baseUrl + 'index.html?tab=mod3', featured: true },
    { id: 'mod4',     label: '④ 電力単位換算',       href: baseUrl + 'index.html?tab=mod4' },
    { id: 'mod5',     label: '⑤ ケーブル損失補正',   href: baseUrl + 'index.html?tab=mod5' },
    { id: 'cordic',   label: '⑥ CORDIC ↗',           href: baseUrl + 'cordic-visualizer/cordic_visualizer.html' },
    { id: 'adc',      label: '⑦ ADC ↗',              href: baseUrl + 'adc-visualizer/adc_visualizer.html' },
    { id: 'filter',   label: '⑧ フィルター ↗',        href: baseUrl + 'digital-filter-designer/digital_filter_designer.html' },
    { id: 'pid',      label: '⑨ PID制御 ↗',           href: baseUrl + 'pid-visualizer/pid-visualizer.html' },
    { id: 'fft',      label: '⑩ FFT ↗',              href: baseUrl + 'fft-visualizer/fft-visualizer.html', featured: true },
    { id: 'na',       label: '⑪ NA入門 ↗',            href: baseUrl + 'network-analyzer-tutorial/network_analyzer_tutorial.html' },
    { id: 'pa',       label: '⑫ パワーアンプ ↗',      href: baseUrl + 'power-amp-simulator/power_amp_simulator.html' },
    { id: 'pll',      label: '⑬ PLL ↗',              href: baseUrl + 'pll-simulator/pll_simulator.html' },
    { id: 'matching', label: '⑭ 負荷変動 ↗',          href: baseUrl + 'matching/index.html', featured: true },
  ];

  /* ── CSS — index.html の header/.tab-btn と完全一致させる ── */
  const css = `
#rf-nav {
  /* ページ固有フォントの影響を受けないよう明示的に指定 */
  font-family: 'Noto Sans JP', 'Segoe UI', sans-serif !important;
  font-size: 14px !important;
  line-height: 1.4;
  position: sticky; top: 0; z-index: 9999;
}
#rf-nav-header {
  background: #1a6fa8; color: #fff;
  padding: 14px 24px;                  /* index.html と同値 */
  display: flex; align-items: center; gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  box-sizing: border-box;
}
#rf-nav-title {
  font-size: 20px !important;          /* index.html header h1 と同値 */
  font-weight: 700; letter-spacing: 0.5px; flex: 1;
  font-family: 'Noto Sans JP', 'Segoe UI', sans-serif !important;
}
#rf-nav-dark {
  padding: 6px 14px; border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.35);
  background: rgba(255,255,255,0.1); color: #fff;
  cursor: pointer; font-size: 11px !important; font-weight: 600;
  font-family: 'Noto Sans JP', 'Segoe UI', sans-serif !important;
  transition: background 0.2s; white-space: nowrap;
}
#rf-nav-dark:hover { background: rgba(255,255,255,0.22); }
#rf-nav-tabs {
  display: flex; flex-wrap: wrap;
  background: #145a8a; overflow-x: auto;
}
.rftab {
  padding: 8px 16px !important;        /* index.html .tab-btn と同値 */
  color: rgba(255,255,255,0.75);
  border: none; background: none; cursor: pointer;
  font-size: 11px !important;          /* index.html .tab-btn と同値 */
  font-family: 'Noto Sans JP', 'Segoe UI', sans-serif !important;
  white-space: nowrap;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  text-decoration: none; display: inline-block;
  box-sizing: border-box;
}
.rftab:hover { color: #fff !important; background: rgba(255,255,255,0.08); }
.rftab.rftab-active {
  color: #fff !important; border-bottom-color: #e67e22 !important;
  background: rgba(255,255,255,0.1);
}
.rftab.rftab-featured {
  color: #fcd34d !important; background: rgba(251,191,36,0.12);
  border-bottom-color: #f59e0b !important; font-weight: 700 !important;
}
.rftab.rftab-featured:hover { background: rgba(251,191,36,0.22); color: #fde68a !important; }
.rftab.rftab-featured.rftab-active {
  color: #fff !important; font-weight: 700 !important;
  background: rgba(255,255,255,0.1); border-bottom-color: #e67e22 !important;
}
`;

  /* ── タブ HTML ── */
  const tabsHtml = tabs.map(t => {
    const cls = ['rftab',
      t.id === active   ? 'rftab-active'   : '',
      t.featured        ? 'rftab-featured'  : '',
    ].filter(Boolean).join(' ');
    return `<a class="${cls}" href="${t.href}">${t.label}</a>`;
  }).join('');

  /* ── DOM 注入 ── */
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  const navEl = document.createElement('div');
  navEl.id = 'rf-nav';
  navEl.innerHTML =
    `<div id="rf-nav-header">` +
      `<span id="rf-nav-title">RF計算ツール</span>` +
      `<button id="rf-nav-dark" onclick="rfNavDark()">🌙 ダーク</button>` +
    `</div>` +
    `<nav id="rf-nav-tabs">${tabsHtml}</nav>`;
  document.body.insertBefore(navEl, document.body.firstChild);

  /* ── ダークモード切替 ── */
  // ページ固有の toggleTheme() があればそれを呼ぶ。なければ汎用処理。
  window.rfNavDark = function () {
    if (typeof toggleTheme === 'function') {
      toggleTheme();
      return;
    }
    if (typeof toggleDark === 'function') {
      toggleDark();
      return;
    }
    // 汎用: data-theme 属性を切り替える
    const html = document.documentElement;
    const isDark = html.dataset.theme === 'dark';
    html.dataset.theme = isDark ? 'light' : 'dark';
    const btn = document.getElementById('rf-nav-dark');
    if (btn) btn.textContent = isDark ? '🌙 ダーク' : '☀️ ライト';
  };
})();
