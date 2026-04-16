/**
 * nav.js — RFツール 共通ナビゲーション
 * 各ビジュアライザーページに include してタブバーを共有する
 *
 * 使い方（ページの <body> 直後に記述）:
 *   <script>var RF_ACTIVE_TAB = 'cordic';</script>
 *   <script src="../nav.js"></script>
 *
 * RF_ACTIVE_TAB に設定できる値:
 *   'mod1'〜'mod5' | 'cordic' | 'adc' | 'filter' | 'pid'
 *   | 'fft' | 'na' | 'pa' | 'pll' | 'matching' | 'abcd' | 'fir' | 'hilbert'
 */
(function () {
  const scriptSrc = (document.currentScript || {}).src || '';
  const baseUrl   = scriptSrc ? scriptSrc.replace(/nav\.js.*$/, '') : '/';
  const active    = (typeof RF_ACTIVE_TAB !== 'undefined') ? RF_ACTIVE_TAB : '';

  /* ── グループ定義 ── */
  const groups = [
    {
      id: 'rf', label: 'RF計測・解析', cls: 'tg-rf',
      tabs: [
        { id: 'mod1',     label: '① 方向性結合器',     href: baseUrl + 'index.html?tab=mod1' },
        { id: 'mod2',     label: '② VIセンサー',         href: baseUrl + 'index.html?tab=mod2' },
        { id: 'mod3',     label: '③ スミスチャート解析', href: baseUrl + 'index.html?tab=mod3', featured: true },
        { id: 'na',       label: '⑪ NA入門',            href: baseUrl + 'network-analyzer-tutorial/network_analyzer_tutorial.html' },
        { id: 'matching', label: '⑭ 負荷変動',          href: baseUrl + 'matching/index.html', featured: true },
        { id: 'abcd',     label: '⑮ ABCD',             href: baseUrl + 'abcd/abcd.html' },
      ],
    },
    {
      id: 'pwr', label: '電力・伝送', cls: 'tg-pwr',
      tabs: [
        { id: 'mod4', label: '④ 電力単位換算',     href: baseUrl + 'index.html?tab=mod4' },
        { id: 'mod5', label: '⑤ ケーブル損失補正', href: baseUrl + 'index.html?tab=mod5' },
        { id: 'pa',   label: '⑫ パワーアンプ',    href: baseUrl + 'power-amp-simulator/power_amp_simulator.html' },
      ],
    },
    {
      id: 'dsp', label: 'デジタル信号処理', cls: 'tg-dsp',
      tabs: [
        { id: 'cordic',  label: '⑥ CORDIC',        href: baseUrl + 'cordic-visualizer/cordic_visualizer.html' },
        { id: 'adc',     label: '⑦ ADC',            href: baseUrl + 'adc-visualizer/adc_visualizer.html' },
        { id: 'filter',  label: '⑧ フィルター概要',  href: baseUrl + 'digital-filter-designer/digital_filter_designer.html' },
        { id: 'fir',     label: '⑯ フィルター設計',  href: baseUrl + 'fir-designer/fir_designer.html' },
        { id: 'hilbert', label: '⑰ ヒルベルト変換', href: baseUrl + 'hilbert-visualizer/hilbert_visualizer.html' },
        { id: 'fft',     label: '⑩ FFT',            href: baseUrl + 'fft-visualizer/fft-visualizer.html', featured: true },
      ],
    },
    {
      id: 'ctrl', label: '制御系', cls: 'tg-ctrl',
      tabs: [
        { id: 'pid', label: '⑨ PID制御', href: baseUrl + 'pid-visualizer/pid-visualizer.html' },
        { id: 'pll', label: '⑬ PLL',     href: baseUrl + 'pll-simulator/pll_simulator.html' },
      ],
    },
    {
      id: 'other', label: 'その他', cls: 'tg-other',
      tabs: [
        { id: 'mod99', label: '㊾ 数学メモ', href: baseUrl + 'index.html?tab=mod99' },
      ],
    },
  ];

  /* ── CSS ── */
  const css = `
#rf-nav {
  font-family: 'Noto Sans JP', 'Segoe UI', sans-serif !important;
  font-size: 14px !important;
  line-height: 1.4;
  position: sticky; top: 0; z-index: 9999;
}
#rf-nav-header {
  background: #1a6fa8; color: #fff;
  padding: 14px 24px;
  display: flex; align-items: center; gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  box-sizing: border-box;
}
#rf-nav-title {
  font-size: 20px !important;
  font-weight: 700; letter-spacing: 0.5px; flex: 1;
  font-family: 'Noto Sans JP', 'Segoe UI', sans-serif !important;
}
#rf-nav-dark {
  padding: 6px 14px; border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.35);
  background: rgba(255,255,255,0.1); color: #fff;
  cursor: pointer; font-size: 13px !important; font-weight: 600;
  font-family: 'Noto Sans JP', 'Segoe UI', sans-serif !important;
  transition: background 0.2s; white-space: nowrap;
}
#rf-nav-dark:hover { background: rgba(255,255,255,0.22); }
#rf-nav-tabs {
  background: #145a8a;
  display: flex; flex-wrap: wrap; align-items: stretch;
}
.rftab-group {
  display: flex; flex-direction: column;
  border-right: 1px solid rgba(255,255,255,0.08);
}
.rftab-group:last-child { border-right: none; }
.rftab-group-label {
  font-size: 9px !important; font-weight: 700; letter-spacing: 1.2px;
  text-transform: uppercase; padding: 4px 10px 2px;
  white-space: nowrap;
  font-family: 'Noto Sans JP', 'Segoe UI', sans-serif !important;
}
.rftab-group-buttons { display: flex; flex-wrap: wrap; }
/* グループ別カラー */
.tg-rf   .rftab-group-label { color: #60a5fa; border-bottom: 2px solid #2563eb; }
.tg-pwr  .rftab-group-label { color: #fb923c; border-bottom: 2px solid #ea580c; }
.tg-dsp  .rftab-group-label { color: #34d399; border-bottom: 2px solid #059669; }
.tg-ctrl .rftab-group-label { color: #c084fc; border-bottom: 2px solid #9333ea; }
.tg-rf   .rftab.rftab-active { border-bottom-color: #60a5fa !important; }
.tg-pwr  .rftab.rftab-active { border-bottom-color: #fb923c !important; }
.tg-dsp  .rftab.rftab-active { border-bottom-color: #34d399 !important; }
.tg-ctrl  .rftab.rftab-active { border-bottom-color: #c084fc !important; }
.tg-other .rftab-group-label { color: #f9a8d4; border-bottom: 2px solid #db2777; }
.tg-other .rftab.rftab-active { border-bottom-color: #f9a8d4 !important; }
/* タブ共通 */
.rftab {
  padding: 6px 14px !important;
  color: rgba(255,255,255,0.72);
  border: none; background: none; cursor: pointer;
  font-size: 11px !important;
  font-family: 'Noto Sans JP', 'Segoe UI', sans-serif !important;
  white-space: nowrap;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  text-decoration: none; display: inline-block;
  box-sizing: border-box;
}
.rftab:hover { color: #fff !important; background: rgba(255,255,255,0.08); }
.rftab.rftab-active {
  color: #fff !important;
  background: rgba(255,255,255,0.1);
}
.rftab.rftab-featured { font-weight: 700 !important; }
.rftab.rftab-featured.rftab-active {
  color: #fff !important; font-weight: 700 !important;
  background: rgba(255,255,255,0.1);
}
`;

  /* ── HTML生成 ── */
  const groupsHtml = groups.map(g => {
    const btns = g.tabs.map(t => {
      const cls = ['rftab',
        t.id === active  ? 'rftab-active'  : '',
        t.featured       ? 'rftab-featured' : '',
      ].filter(Boolean).join(' ');
      return `<a class="${cls}" href="${t.href}">${t.label}</a>`;
    }).join('');
    return `<div class="rftab-group ${g.cls}">` +
      `<div class="rftab-group-label">${g.label}</div>` +
      `<div class="rftab-group-buttons">${btns}</div>` +
      `</div>`;
  }).join('');

  /* ── DOM注入 ── */
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  const navEl = document.createElement('div');
  navEl.id = 'rf-nav';
  navEl.innerHTML =
    `<div id="rf-nav-header">` +
      `<span id="rf-nav-title">RFツール</span>` +
      `<button id="rf-nav-dark" onclick="rfNavDark()">🌙 ダーク</button>` +
    `</div>` +
    `<nav id="rf-nav-tabs">${groupsHtml}</nav>`;
  document.body.insertBefore(navEl, document.body.firstChild);

  /* ── ダークモード切替 ── */
  window.rfNavDark = function () {
    if (typeof toggleTheme === 'function') { toggleTheme(); return; }
    if (typeof toggleDark  === 'function') { toggleDark();  return; }
    const html = document.documentElement;
    const isDark = html.dataset.theme === 'dark';
    html.dataset.theme = isDark ? 'light' : 'dark';
    const btn = document.getElementById('rf-nav-dark');
    if (btn) btn.textContent = isDark ? '🌙 ダーク' : '☀️ ライト';
  };
})();
