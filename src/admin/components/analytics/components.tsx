// ================================================================
// components.tsx — Reusable composite components (schema-agnostic)
// These never need to change when backend schema changes.
// ================================================================

import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Download, RefreshCw } from "lucide-react";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { P, CHART_COLORS, fmt } from "./constants";
import { Skel, Num, CT, Empty } from "./ui";

// ── Responsive chart height hook ─────────────────────────────────
export function useChartH(d = 280, t = 220, p = 160) {
  const [h, setH] = useState(d);
  useEffect(() => {
    const fn = () =>
      setH(window.innerWidth <= 640 ? p : window.innerWidth <= 1024 ? t : d);
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [d, t, p]);
  return h;
}

// ── Generic stat card ─────────────────────────────────────────────
export function StatCard({
  label, value, color, icon: Icon, sub, loading, big,
}: {
  label: string; value: number; color: string;
  icon: React.ElementType; sub?: string; loading?: boolean; big?: boolean;
}) {
  return (
    <div className="stat-card" style={{ "--stripe": color } as any}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 9.5, fontWeight: 800, color,
            textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 11,
          }}>
            {label}
          </p>
          {loading ? <Skel h={36} w={65} /> : (
            <p className="mono num-lg" style={{ fontWeight: 700, color: "#111827", lineHeight: 1, margin: "0 0 6px" }}>
              <Num v={value} big={big} />
            </p>
          )}
          {sub && <p style={{ fontSize: 10.5, color: "#9CA3AF", margin: 0 }}>{sub}</p>}
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${color}14`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginLeft: 8,
        }}>
          <Icon style={{ width: 16, height: 16, color }} />
        </div>
      </div>
    </div>
  );
}

// ── Chart card wrapper ────────────────────────────────────────────
export function ChartCard({
  title, children, action, icon: Icon, accentColor = P.coral, subtitle,
}: {
  title: string; children: React.ReactNode; action?: React.ReactNode;
  icon?: React.ElementType; accentColor?: string; subtitle?: string;
}) {
  return (
    <div className="card" style={{ padding: "20px 16px 16px" }}>
      <div className="chart-card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 9, flex: 1, minWidth: 0 }}>
          {Icon && (
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: `${accentColor}14`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Icon style={{ width: 14, height: 14, color: accentColor }} />
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize: 13.5, fontWeight: 700, color: "#111827",
              margin: 0, overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {title}
            </p>
            {subtitle && (
              <p style={{ fontSize: 10.5, color: "#9CA3AF", margin: "2px 0 0" }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div className="chart-card-action">{action}</div>}
      </div>
      {children}
    </div>
  );
}

// ── Segment control ───────────────────────────────────────────────
export function Seg<T extends string>({
  opts, v, onChange, color = P.coral,
}: {
  opts: readonly T[]; v: T; onChange: (x: T) => void; color?: string;
}) {
  const hex = color.replace("#", "");
  const shadow = `rgba(${parseInt(hex.slice(0,2),16)},${parseInt(hex.slice(2,4),16)},${parseInt(hex.slice(4,6),16)},.3)`;
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {opts.map((o) => (
        <button
          key={o}
          className={`seg${v === o ? " on" : ""}`}
          style={{ "--sc": color, "--sc-shadow": shadow } as any}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// ── Bar progress row ──────────────────────────────────────────────
export function BarProgress({
  label, value, max, color, sub,
}: {
  label: string; value: number; max: number; color: string; sub?: string;
}) {
  const p = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "baseline", marginBottom: 6,
      }}>
        <span
          className="bar-label"
          style={{
            fontSize: 13, color: "#4B5563",
            overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: "nowrap", maxWidth: "60%", flexShrink: 1,
          }}
        >
          {label}
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5, flexShrink: 0 }}>
          <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
            {fmt(value)}
          </span>
          {sub && <span style={{ fontSize: 10, color: "#9CA3AF" }}>{sub}</span>}
        </div>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${p}%`, background: color }} />
      </div>
    </div>
  );
}

// ── Date range filter + CSV export ────────────────────────────────
export function DateFilter({
  from, to, onFrom, onTo, onExport, busy, accent = P.coral,
}: {
  from: string; to: string; onFrom: (v: string) => void; onTo: (v: string) => void;
  onExport: () => void; busy: boolean; accent?: string;
}) {
  return (
    <div className="card" style={{ padding: "16px" }}>
      <div className="date-filter-row">
        {(["From", "To"] as const).map((lbl, idx) => (
          <div key={lbl} className="date-filter-field">
            <Label style={{
              fontSize: 10, color: "#9CA3AF", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: ".07em",
              display: "block", marginBottom: 5, fontFamily: "DM Sans",
            }}>
              {lbl}
            </Label>
            <Input
              type="date"
              value={idx === 0 ? from : to}
              onChange={(e) => (idx === 0 ? onFrom : onTo)(e.target.value)}
              style={{
                height: 36, fontSize: 13, width: "100%",
                borderRadius: 10, border: "1px solid #E5E9F4", color: "#111827",
              }}
            />
          </div>
        ))}
        <button
          onClick={onExport}
          disabled={busy}
          className="date-filter-btn"
          style={{
            height: 36, padding: "0 16px", fontSize: 11, fontWeight: 700,
            letterSpacing: ".05em", textTransform: "uppercase", borderRadius: 10,
            cursor: busy ? "not-allowed" : "pointer", border: "none", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontFamily: "DM Sans",
            background: busy ? "#C4CCDF" : accent,
            boxShadow: busy ? "none" : `0 4px 12px ${accent}48`,
            transition: "all .2s", whiteSpace: "nowrap",
          }}
        >
          <Download style={{ width: 12, height: 12 }} />
          {busy ? "Exporting…" : "Export CSV"}
        </button>
      </div>
    </div>
  );
}

// ── Donut chart with center label ─────────────────────────────────
export function DonutWithCenter({
  data, total, totalLabel = "Total", colors = CHART_COLORS,
}: {
  data: { name: string; value: number }[];
  total: number; totalLabel?: string; colors?: string[];
}) {
  const h = useChartH(255, 215, 190);
  const outerR = h <= 190 ? 65 : 95;
  const innerR = h <= 190 ? 38 : 58;
  return (
    <div style={{ position: "relative" }}>
      <ResponsiveContainer width="100%" height={h}>
        <PieChart>
          <Pie
            data={data} dataKey="value" nameKey="name"
            cx="50%" cy="50%"
            outerRadius={outerR} innerRadius={innerR}
            paddingAngle={3}
          >
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#fff", border: "1px solid #E5E9F4",
              borderRadius: 12, fontSize: 12,
            }}
          />
          <Legend
            iconSize={8}
            wrapperStyle={{ fontSize: 11, color: "#4B5563", fontFamily: "DM Sans,sans-serif" }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center" style={{ top: `${h / 2 - 14}px` }}>
        <p className="mono" style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1 }}>
          {fmt(total)}
        </p>
        <p style={{
          fontSize: 9, color: "#9CA3AF", margin: "3px 0 0",
          fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em",
        }}>
          {totalLabel}
        </p>
      </div>
    </div>
  );
}

// ── Refresh icon button ───────────────────────────────────────────
export function RefreshBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 30, height: 30, borderRadius: 9,
        border: "1px solid #E5E9F4", background: "#fff",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <RefreshCw style={{ width: 11, height: 11, color: "#9CA3AF" }} />
    </button>
  );
}

// ── Horizontal bar chart (reusable) ───────────────────────────────
export function HorizontalBarChart({
  data, dataKey, nameKey, height, colors = CHART_COLORS,
}: {
  data: any[]; dataKey: string; nameKey: string; height: number; colors?: string[];
}) {
  if (!data.length) return <Empty icon={(() => null) as any} msg="No data" />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 14, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEF1FA" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: "#9CA3AF", fontFamily: "DM Mono" }}
          axisLine={false} tickLine={false} allowDecimals={false}
        />
        <YAxis
          type="category" dataKey={nameKey}
          tick={{ fontSize: 11, fill: "#4B5563", fontFamily: "DM Sans" }}
          axisLine={false} tickLine={false} width={80}
        />
        <Tooltip content={<CT />} />
        <Bar dataKey={dataKey} name={dataKey} radius={[0, 6, 6, 0]}>
          {data.map((_: any, i: number) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}