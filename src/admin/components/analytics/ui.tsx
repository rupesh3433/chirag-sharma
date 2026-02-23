// ================================================================
// ui.tsx — Primitive UI components (schema-agnostic, never change)
// ================================================================

import { useEffect, useState, useRef, memo } from "react";
import { Info } from "lucide-react";
import { CSS, fmt, shortNum } from "./constants";

// ── CSS Injector ─────────────────────────────────────────────────
export function InjectCSS() {
  useEffect(() => {
    const id = "an-styles-v7";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);
  return null;
}

// ── Skeleton loader ───────────────────────────────────────────────
export function Skel({ h = 16, w = "100%" }: { h?: number; w?: number | string }) {
  return <div className="skel" style={{ height: h, width: w }} />;
}

// ── Animated counter ──────────────────────────────────────────────
export function Num({ v, big = false }: { v: number; big?: boolean }) {
  const [d, setD] = useState(v);
  const r = useRef<number | null>(null);
  useEffect(() => {
    const s = d, e = v, t0 = performance.now();
    const go = (now: number) => {
      const p = Math.min((now - t0) / 650, 1);
      setD(s + (e - s) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) r.current = requestAnimationFrame(go);
    };
    r.current = requestAnimationFrame(go);
    return () => { if (r.current) cancelAnimationFrame(r.current); };
  }, [v]); // eslint-disable-line
  return (
    <span className="countup mono">
      {big ? shortNum(Math.round(d)) : Math.round(d).toLocaleString()}
    </span>
  );
}

// ── Chart tooltip ─────────────────────────────────────────────────
export const CT = memo(({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ct-box">
      <p style={{ color: "#9CA3AF", fontWeight: 700, marginBottom: 8, fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".06em" }}>
        {label}
      </p>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 18, marginBottom: 4, alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#4B5563" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, display: "inline-block" }} />
            {p.name}
          </span>
          <span className="mono" style={{ fontWeight: 700, color: "#111827", fontSize: 13 }}>
            {(p.value ?? 0).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
});

// ── Tooltip icon with hover text ──────────────────────────────────
export function TipIcon({ text }: { text: string }) {
  return (
    <span className="tip-wrap">
      <Info style={{ width: 12, height: 12, color: "#C4CCDF" }} />
      <span className="tip-box">{text}</span>
    </span>
  );
}

// ── Empty state ───────────────────────────────────────────────────
export function Empty({ icon: Icon, msg }: { icon: React.ElementType; msg: string }) {
  return (
    <div style={{ height: 150, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <div style={{ width: 46, height: 46, borderRadius: 14, background: "#EEF1FA", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon style={{ width: 19, height: 19, color: "#C4CCDF" }} />
      </div>
      <p style={{ fontSize: 12.5, color: "#C4CCDF", margin: 0, fontWeight: 600 }}>{msg}</p>
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────
export function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <p className="section-label" style={{ color }}>
      {children}
    </p>
  );
}