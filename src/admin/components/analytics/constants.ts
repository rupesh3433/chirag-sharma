// ================================================================
// constants.ts — Shared palette, CSS injection, and types
// ================================================================

export const P = {
    coral:   "#FF4757",
    indigo:  "#3742FA",
    teal:    "#2ED573",
    amber:   "#FFA502",
    violet:  "#8B5CF6",
    sky:     "#0EA5E9",
    rose:    "#F43F5E",
    lime:    "#84CC16",
    orange:  "#F97316",
    cyan:    "#06B6D4",
    emerald: "#10B981",
    fuchsia: "#D946EF",
  } as const;
  
  export const CHART_COLORS = [
    P.coral, P.indigo, P.teal, P.amber, P.violet,
    P.sky, P.rose, P.lime, P.orange, P.cyan,
  ];
  
  export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,700;1,600&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    min-width: 0;
  }

  html, body {
    overflow-x: clip;
    max-width: 100%;
  }

  /* Root container — NO overflow set (would break fixed positioning context) */
  .an {
    font-family: 'DM Sans', system-ui, sans-serif;
    color: #111827;
    background: #F4F6FB;
    -webkit-font-smoothing: antialiased;
    width: 100%;
    min-height: 100vh;
  }

  .mono { font-family: 'DM Mono', 'Fira Code', monospace; }

  /* Content clip — only on the scrolling content, not the fixed bar */
  .an-content-clip {
    overflow-x: clip;
    /* Full bleed background — no white gutters */
    background: #F4F6FB;
    width: 100%;
  }

  .card {
    background: #FFF; border: 1px solid #E5E9F4; border-radius: 20px;
    box-shadow: 0 1px 4px rgba(17,24,39,.04), 0 4px 16px rgba(17,24,39,.03);
    transition: box-shadow .22s, transform .2s, border-color .2s;
    min-width: 0; overflow: hidden;
  }
  .card:hover {
    box-shadow: 0 4px 24px rgba(17,24,39,.08);
    border-color: #D1D8EF; transform: translateY(-1px);
  }
  .stat-card {
    background: #FFF; border: 1px solid #E5E9F4; border-radius: 20px;
    box-shadow: 0 1px 4px rgba(17,24,39,.04);
    padding: 22px 18px 18px; position: relative; overflow: hidden;
    transition: box-shadow .22s, transform .2s;
    min-width: 0; word-break: break-word;
  }
  .stat-card:hover { box-shadow: 0 6px 28px rgba(17,24,39,.09); transform: translateY(-2px); }
  .stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: var(--stripe, #E5E9F4); border-radius: 20px 20px 0 0;
  }

  .tab-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 12px 18px; font-size: 13px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; background: transparent;
    border: none; cursor: pointer; color: #9CA3AF;
    border-bottom: 2.5px solid transparent;
    transition: color .18s, border-color .18s;
    white-space: nowrap; flex-shrink: 0; margin-bottom: -1px;
  }
  .tab-btn:hover:not(.on) { color: #4B5563; }
  .tab-btn.on { color: var(--tc, #FF4757); border-bottom-color: var(--tc, #FF4757); }

  .seg {
    padding: 5px 11px; font-size: 10.5px; font-weight: 700;
    letter-spacing: .06em; text-transform: uppercase;
    border-radius: 9px; border: 1.5px solid #E5E9F4;
    color: #9CA3AF; cursor: pointer; background: #fff;
    transition: all .14s; font-family: 'DM Sans', sans-serif;
  }
  .seg:hover:not(.on) { border-color: #C4CCDF; color: #4B5563; }
  .seg.on {
    background: var(--sc, #FF4757); border-color: transparent; color: #fff;
    box-shadow: 0 3px 12px var(--sc-shadow, rgba(255,71,87,.3));
  }

  .section-label {
    font-size: 10px; font-weight: 800; text-transform: uppercase;
    letter-spacing: .15em; color: #9CA3AF;
    display: flex; align-items: center; gap: 14px; margin: 0;
    min-width: 0; overflow: hidden;
  }
  .section-label::after {
    content: ''; flex: 1; height: 1px;
    background: linear-gradient(90deg, #E5E9F4, transparent);
    min-width: 0;
  }

  .bar-track { height: 7px; background: #EEF1FA; border-radius: 99px; overflow: hidden; }
  .bar-fill  { height: 100%; border-radius: 99px; transition: width .85s cubic-bezier(.23,1,.32,1); }

  @keyframes livePulse { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.5);opacity:.6;} }
  .live-dot { animation: livePulse 2s ease-in-out infinite; }

  @keyframes shimmer { from{background-position:-1400px 0} to{background-position:1400px 0} }
  .skel {
    background: linear-gradient(90deg,#EEF1FA 25%,#E4E9F5 50%,#EEF1FA 75%);
    background-size: 2800px 100%; animation: shimmer 1.5s infinite linear; border-radius: 10px;
  }

  @keyframes countFade { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
  .countup { animation: countFade .45s cubic-bezier(.23,1,.32,1) both; }

  .ct-box {
    background:#fff; border:1px solid #E5E9F4; border-radius:14px;
    padding:12px 16px; box-shadow:0 8px 30px rgba(17,24,39,.12);
    font-family:'DM Sans',sans-serif; font-size:12px;
  }
  .donut-center {
    position:absolute; top:50%; left:50%;
    transform:translate(-50%,-50%); text-align:center; pointer-events:none;
  }

  .tip-wrap { position:relative; display:inline-flex; cursor:help; }
  .tip-box {
    position:absolute; bottom:calc(100% + 8px); left:50%;
    transform:translateX(-50%); background:#1A1A2E; color:#fff;
    border-radius:10px; padding:8px 12px; font-size:11px; line-height:1.5;
    white-space:normal; pointer-events:none; opacity:0;
    transition:opacity .15s; z-index:200; width:200px; text-align:center;
  }
  .tip-wrap:hover .tip-box { opacity:1; }

  /* Recharts containment */
  .recharts-wrapper, .recharts-surface { max-width: 100% !important; overflow: hidden; }
  .recharts-wrapper svg { max-width: 100%; }

  /* ── Grid ── */
  .rg { display: grid; width: 100%; }
  .g4 { grid-template-columns: repeat(4,1fr); gap: 18px; }
  .g3 { grid-template-columns: repeat(3,1fr); gap: 18px; }
  .g2 { grid-template-columns: 1fr 1fr; gap: 20px; }
  .g6 { grid-template-columns: repeat(6,1fr); gap: 14px; }
  .g-live { grid-template-columns: 1fr 1fr 1.4fr; gap: 22px; }
  .g-hero { grid-template-columns: repeat(4,1fr); gap: 18px; }
  .g-charts { grid-template-columns: 1fr 1fr; gap: 22px; }

  /* ── Layout wrappers ──
     an-wrap: used inside the FIXED header bar
     an-content: used for scrolling tab content
     Both share the same horizontal padding so content aligns. */
  /* an-wrap and an-content use identical horizontal padding.
     NO max-width or margin:auto — the fixed bar already spans
     sidebar-edge to right:0, so centering would cause misalignment. */
  .an-wrap {
    padding: 0 28px;
    width: 100%; box-sizing: border-box;
  }
  .an-content {
    padding: 24px 28px 0;
    width: 100%; box-sizing: border-box;
  }

  /* ── Number sizes ── */
  .num-hero   { font-size: 62px; }
  .num-live   { font-size: 74px; }
  .num-lg     { font-size: 40px; }
  .num-md     { font-size: 34px; }
  .num-sm     { font-size: 28px; }
  .num-qual   { font-size: 30px; }
  .num-period { font-size: 26px; }

  /* ── Live panel ── */
  .live-info-row { display: flex; align-items: flex-start; gap: 7px; margin-bottom: 5px; min-width: 0; }

  /* ── DateFilter ── */
  .date-filter-row { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px; width: 100%; }
  .date-filter-field { flex: 1 1 120px; min-width: 110px; }
  .date-filter-btn   { flex-shrink: 0; }

  /* ── ChartCard header ── */
  .chart-card-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 18px; gap: 10px; flex-wrap: wrap; min-width: 0;
  }
  .chart-card-action { flex-shrink: 0; }
  .chart-card-action > div { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }

  /* ── Active pages ── */
  .active-page-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 13px; border-radius: 11px; min-width: 0;
  }
  .active-page-label { display: flex; align-items: center; gap: 9px; min-width: 0; flex: 1; overflow: hidden; }
  .active-page-label span:last-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* ══════════════════════════════════════════
     RESPONSIVE BREAKPOINTS
  ══════════════════════════════════════════ */

  /* Tablet ≤1024px */
  @media (max-width: 1024px) {
    .an-wrap, .an-content { padding-left: 20px; padding-right: 20px; }
    .an-content { padding-top: 20px; }
    .g4 { grid-template-columns: 1fr 1fr; }
    .g-hero { grid-template-columns: 1fr 1fr; }
    .g6 { grid-template-columns: repeat(3,1fr); gap: 12px; }
    .g-live { grid-template-columns: 1fr 1fr; }
    .g-live > *:last-child { grid-column: 1 / -1; }
    .num-hero   { font-size: 50px; }
    .num-live   { font-size: 60px; }
    .num-lg     { font-size: 34px; }
    .num-md     { font-size: 28px; }
    .num-sm     { font-size: 24px; }
    .num-qual   { font-size: 26px; }
    .num-period { font-size: 22px; }
  }

  /* Mobile ≤640px */
  @media (max-width: 640px) {
    .an-wrap, .an-content { padding-left: 14px; padding-right: 14px; }
    .an-content { padding-top: 18px; }
    .g4 { grid-template-columns: 1fr 1fr; gap: 12px; }
    .g3 { grid-template-columns: 1fr 1fr; gap: 12px; }
    .g2 { grid-template-columns: 1fr; gap: 12px; }
    .g6 { grid-template-columns: 1fr 1fr; gap: 10px; }
    .g-live { grid-template-columns: 1fr; gap: 14px; }
    .g-hero { grid-template-columns: 1fr 1fr; gap: 12px; }
    .g-charts { grid-template-columns: 1fr; gap: 16px; }
    .num-hero   { font-size: 38px; }
    .num-live   { font-size: 44px; }
    .num-lg     { font-size: 28px; }
    .num-md     { font-size: 24px; }
    .num-sm     { font-size: 20px; }
    .num-qual   { font-size: 22px; }
    .num-period { font-size: 18px; }
    .stat-card  { padding: 16px 13px 14px; }
    .tab-btn    { padding: 10px 11px; font-size: 11.5px; gap: 4px; }
    .seg        { padding: 4px 9px; font-size: 10px; }
    .card, .stat-card { border-radius: 16px; }
    .date-filter-btn { width: 100%; justify-content: center; }
    .chart-card-action > div { justify-content: flex-start; }
    .bar-label  { max-width: 55% !important; }
  }

  /* Small mobile ≤400px */
  @media (max-width: 400px) {
    .an-wrap, .an-content { padding-left: 10px; padding-right: 10px; }
    .g4 { grid-template-columns: 1fr 1fr; gap: 9px; }
    .g6 { grid-template-columns: 1fr 1fr; gap: 8px; }
    .g3 { grid-template-columns: 1fr; gap: 10px; }
    .tab-btn    { padding: 9px 8px; font-size: 11px; }
    .num-hero   { font-size: 34px; }
    .num-live   { font-size: 38px; }
    .num-lg     { font-size: 26px; }
    .num-md     { font-size: 22px; }
    .num-period { font-size: 16px; }
    .stat-card  { padding: 14px 11px 12px; }
    .date-filter-field { flex: 1 1 100%; }
  }
  `;

  export const fmt = (n: number) => (n ?? 0).toLocaleString();
  export const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
  export function shortNum(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
    return String(n ?? 0);
  }
  export function fmtDur(s: number) {
    if (!s) return "—";
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60), sec = s % 60;
    if (m < 60) return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
    const h = Math.floor(m / 60), rm = m % 60;
    return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
  }

  export async function downloadCSV(path: string, filename: string) {
    const API_BASE = (import.meta.env.VITE_API_URL ?? "") as string;
    const token = localStorage.getItem("admin_token");
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }