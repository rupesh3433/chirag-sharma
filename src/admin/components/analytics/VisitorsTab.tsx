// ================================================================
// VisitorsTab.tsx — Detailed visitor analytics
// ================================================================

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  Clock, Eye, TrendingUp, Globe, Activity, MousePointer2,
  Link, Zap, Timer, Flame, Star,
} from "lucide-react";
import api from "../../services/api";
import { P, CHART_COLORS, fmt, fmtDur } from "./constants";
import { Skel, Empty, SectionLabel } from "./ui";
import { CT } from "./ui";
import { Seg, ChartCard, BarProgress, useChartH, RefreshBtn } from "./components";
import { LiveViewersPanel } from "./LiveViewersPanel";
import { TabShell } from "./TabShell";
import { useTabData } from "./useTabData";

type VisitView = "daily" | "monthly" | "yearly";

// ── Period row ────────────────────────────────────────────────────
function PeriodRow({ vd, loading }: { vd: any; loading: boolean }) {
  const rows = [
    { label: "This Hour",  sub: "Unique sessions (rolling)",           v: vd?.unique_hour  ?? 0, color: P.sky,    icon: Clock      },
    { label: "Today",      sub: "New sessions since midnight UTC",     v: vd?.unique_today ?? 0, color: P.teal,   icon: Eye        },
    { label: "This Week",  sub: "Includes revisits after 30 min gap",  v: vd?.unique_week  ?? 0, color: P.violet, icon: Activity   },
    { label: "This Month", sub: "Includes revisits after 30 min gap",  v: vd?.unique_month ?? 0, color: P.coral,  icon: TrendingUp },
    { label: "This Year",  sub: "Includes revisits after 30 min gap",  v: vd?.unique_year  ?? 0, color: P.orange, icon: Star       },
    { label: "All Time",   sub: "Total sessions (90-day TTL window)",  v: vd?.unique_total ?? 0, color: P.indigo, icon: Globe, big: true },
  ];
  return (
    <div className="rg g6">
      {rows.map(({ label, sub, v, color, icon: I, big }: any) => (
        <div key={label} className="stat-card" style={{ "--stripe": color, padding: "16px 13px 13px" } as any}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: `${color}14`,
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 9,
          }}>
            <I style={{ width: 13, height: 13, color }} />
          </div>
          <p style={{ fontSize: 8.5, color: "#9CA3AF", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>
            {label}
          </p>
          {loading ? <Skel h={22} w={48} /> : (
            <p className="mono num-period" style={{ fontWeight: 700, color: "#111827", lineHeight: 1, margin: "0 0 5px" }}>
              {big ? (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v) : v.toLocaleString()}
            </p>
          )}
          <p style={{ fontSize: 9.5, color: "#9CA3AF", margin: 0, lineHeight: 1.4 }}>{sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── Counter stats strip ───────────────────────────────────────────
function CounterStatsRow({ cs, loading }: { cs: any; loading: boolean }) {
  return (
    <div className="rg g4">
      {[
        { lbl: "This Hour",    v: cs?.this_hour ?? 0, color: P.sky,    sub: "atomic counter"     },
        { lbl: "Today",        v: cs?.today     ?? 0, color: P.teal,   sub: "resets midnight UTC" },
        { lbl: "Last 24 Hrs",  v: cs?.last_24h  ?? 0, color: P.violet, sub: "rolling 24h sum"     },
        { lbl: "Last 30 Days", v: cs?.last_30d  ?? 0, color: P.indigo, sub: "rolling 30d sum"     },
      ].map(({ lbl, v, color, sub }) => (
        <div key={lbl} className="stat-card" style={{ "--stripe": color } as any}>
          <p style={{ fontSize: 9.5, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
            {lbl}
          </p>
          {loading ? <Skel h={30} w={55} /> : (
            <p className="mono num-sm" style={{ fontWeight: 700, color: "#111827", lineHeight: 1, margin: "0 0 5px" }}>
              {v.toLocaleString()}
            </p>
          )}
          <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0 }}>{sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main tab ─────────────────────────────────────────────────────
export function VisitorsTab() {
  const [view, setView] = useState<VisitView>("daily");

  // Primary data — drives the TabShell loader/timeout
  const {
    data: vd,
    loading,
    timedOut,
  } = useTabData(
    ["analytics-visitors"] as const,
    () => api.get("/admin/analytics/visitors").then((r) => r.data),
  );

  // Counter stats — secondary, shown with its own skeleton inside content
  const { data: cs, isLoading: csL } = useQuery({
    queryKey: ["analytics-counter-stats"],
    queryFn: () => api.get("/admin/analytics/counter-stats").then((r) => r.data),
    refetchInterval: 60_000,
  });

  // Expose refetch for the manual refresh button
  const { refetch } = useQuery({
    queryKey: ["analytics-visitors"],
    queryFn: () => api.get("/admin/analytics/visitors").then((r) => r.data),
    refetchInterval: 60_000,
    enabled: false,
  });

  const handleViewChange = useCallback((x: VisitView) => setView(x), []);
  const ch  = useChartH(310, 240, 170);
  const chS = useChartH(235, 195, 155);

  const vdAny = vd as any;

  const trendData =
    view === "daily"   ? (vdAny?.daily_trend   ?? []).slice(-30) :
    view === "monthly" ? (vdAny?.monthly_trend ?? []) :
                         (vdAny?.yearly_trend  ?? []);
  const trendKey = view === "daily" ? "date" : "label";
  const tickFmt  = (v: string) => view === "daily" ? v.slice(5) : v;

  return (
    <TabShell loading={loading} timedOut={timedOut} accentColor={P.teal}>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

        {/* Live viewers */}
        <SectionLabel color={P.teal}>Live Viewers</SectionLabel>
        <LiveViewersPanel />

        {/* Period stats */}
        <SectionLabel color={P.sky}>Unique Visitors by Period (Sessions)</SectionLabel>
        <PeriodRow vd={vdAny} loading={loading} />

        {/* Atomic counters */}
        <SectionLabel color={P.indigo}>Atomic Visit Counters</SectionLabel>
        <CounterStatsRow cs={cs} loading={csL} />

        {/* Session quality */}
        <SectionLabel color={P.violet}>Session Quality · Today</SectionLabel>
        <div className="rg g4">
          {[
            { lbl: "Avg Duration",    val: fmtDur(vdAny?.avg_duration_seconds ?? 0), icon: Timer,  color: P.violet, sub: "per session"       },
            { lbl: "Longest Session", val: fmtDur(vdAny?.max_duration_seconds ?? 0), icon: Star,   color: P.amber,  sub: "today"             },
            { lbl: "Bounced",         val: fmt(vdAny?.bounce_count_today ?? 0),       icon: Zap,    color: P.coral,  sub: "left after 1 page" },
            { lbl: "Power Users",     val: fmt(vdAny?.power_count_today ?? 0),        icon: Flame,  color: P.teal,   sub: "4+ pages · 2min+"  },
          ].map(({ lbl, val, icon: I, color, sub }) => (
            <div key={lbl} className="stat-card" style={{ "--stripe": color } as any}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 9.5, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
                    {lbl}
                  </p>
                  <p className="mono num-qual" style={{ fontWeight: 700, color: "#111827", lineHeight: 1, margin: "0 0 5px" }}>
                    {val}
                  </p>
                  <p style={{ fontSize: 10.5, color: "#9CA3AF" }}>{sub}</p>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 8 }}>
                  <I style={{ width: 15, height: 15, color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hourly bar */}
        {(vdAny?.hourly_today?.length ?? 0) > 0 && (
          <ChartCard
            title="Sessions by Hour · Today"
            icon={Clock}
            accentColor={P.violet}
            subtitle="Visitor distribution across hours today (UTC)"
          >
            <ResponsiveContainer width="100%" height={chS}>
              <BarChart data={vdAny.hourly_today} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1FA" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tickFormatter={(h) => `${h}:00`}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  axisLine={false} tickLine={false}
                  interval={window.innerWidth <= 640 ? 3 : 1}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9CA3AF", fontFamily: "DM Mono" }}
                  axisLine={false} tickLine={false} allowDecimals={false}
                />
                <Tooltip content={<CT />} />
                <Bar dataKey="unique" name="Sessions" radius={[5, 5, 0, 0]}>
                  {(vdAny.hourly_today ?? []).map((_: any, i: number) => (
                    <Cell key={i} fill={P.violet} fillOpacity={0.25 + (i / (vdAny.hourly_today.length || 1)) * 0.75} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Trend chart */}
        <ChartCard
          title="Visitor Trend"
          icon={TrendingUp}
          accentColor={P.coral}
          subtitle="Unique sessions over selected time range"
          action={
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <Seg<VisitView>
                opts={["daily", "monthly", "yearly"] as const}
                v={view}
                onChange={handleViewChange}
                color={P.coral}
              />
              <RefreshBtn onClick={() => refetch()} />
            </div>
          }
        >
          {trendData.length === 0 ? <Empty icon={Eye} msg="No visitor data yet" /> : (
            <ResponsiveContainer width="100%" height={ch}>
              <AreaChart data={trendData} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gVT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={P.coral} stopOpacity={0.14} />
                    <stop offset="100%" stopColor={P.coral} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1FA" vertical={false} />
                <XAxis
                  dataKey={trendKey}
                  tickFormatter={tickFmt}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9CA3AF", fontFamily: "DM Mono" }}
                  axisLine={false} tickLine={false} allowDecimals={false}
                />
                <Tooltip content={<CT />} />
                <Area
                  type="monotone" dataKey="unique" name="Unique Sessions"
                  stroke={P.coral} fill="url(#gVT)" strokeWidth={2.5}
                  dot={false} activeDot={{ r: 5, fill: P.coral, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Top pages + referrers */}
        <div className="rg g-charts">
          <ChartCard title="Top Pages · Last 30 Days" icon={MousePointer2} accentColor={P.sky}>
            {(vdAny?.top_pages?.length ?? 0) === 0 ? (
              <Empty icon={MousePointer2} msg="No page data yet" />
            ) : (
              vdAny.top_pages.map((p: any, i: number) => (
                <BarProgress
                  key={i} label={p.page} value={p.views}
                  max={vdAny.top_pages[0].views}
                  color={CHART_COLORS[i % CHART_COLORS.length]}
                />
              ))
            )}
          </ChartCard>
          <ChartCard title="Top Referrers · Last 30 Days" icon={Link} accentColor={P.fuchsia}>
            {(vdAny?.top_referrers?.length ?? 0) === 0 ? (
              <Empty icon={Link} msg="No referrer data yet" />
            ) : (
              vdAny.top_referrers.map((r: any, i: number) => (
                <BarProgress
                  key={i} label={r.referrer || "Direct / None"}
                  value={r.count} max={vdAny.top_referrers[0].count}
                  color={CHART_COLORS[i % CHART_COLORS.length]}
                />
              ))
            )}
          </ChartCard>
        </div>
      </div>
    </TabShell>
  );
}