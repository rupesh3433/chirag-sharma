// ================================================================
// OverviewTab.tsx — High-level summary with per-tab loader/timeout
// ================================================================

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  Calendar, CheckCircle, Clock, XCircle, Eye, TrendingUp, Ticket,
  UserCheck, CreditCard, Globe, Activity, MousePointer2, Zap, Timer,
  BarChart2
} from "lucide-react";
import api from "../../services/api";
import { P, CHART_COLORS, fmt, pct, fmtDur } from "./constants";
import { Num, Skel, Empty, SectionLabel } from "./ui";
import { StatCard, ChartCard, DonutWithCenter, useChartH } from "./components";
import { CT } from "./ui";
import { TabShell } from "./TabShell";

// ── tiny hook: 60-second timeout per query ────────────────────────
function useWithTimeout<T>(queryResult: { data: T | undefined; isLoading: boolean }) {
  const { data, isLoading } = queryResult;
  const [timedOut, setTimedOut] = useState(false);
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTimedOut(false);
    ref.current = setTimeout(() => setTimedOut(true), 60_000);
    return () => { if (ref.current) clearTimeout(ref.current); };
  }, []);

  useEffect(() => {
    if (data && ref.current) { clearTimeout(ref.current); ref.current = null; setTimedOut(false); }
  }, [data]);

  return { loading: isLoading && !timedOut, timedOut: timedOut && !data };
}

export function OverviewTab() {

  const WS_BASE =
    (import.meta.env.VITE_WS_URL ??
      import.meta.env.VITE_API_URL?.replace(/^http/, "ws") ??
      "") as string;

  const [liveCount, setLiveCount] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let destroyed = false;
    const clearPing = () => { if (pingRef.current) { clearInterval(pingRef.current); pingRef.current = null; } };
    const clearReconnect = () => { if (reconnectTimeoutRef.current) { clearTimeout(reconnectTimeoutRef.current); reconnectTimeoutRef.current = null; } };
    const connect = () => {
      if (destroyed || !WS_BASE) return;
      try {
        const ws = new WebSocket(`${WS_BASE}/ws/live`);
        wsRef.current = ws;
        ws.onopen = () => {
          clearPing();
          pingRef.current = setInterval(() => { if (ws.readyState === WebSocket.OPEN) ws.send("ping"); }, 15000);
        };
        ws.onmessage = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.type === "live_count" && typeof data.count === "number") setLiveCount(data.count);
          } catch { return; }
        };
        ws.onclose = () => { clearPing(); wsRef.current = null; if (!destroyed) { clearReconnect(); reconnectTimeoutRef.current = setTimeout(connect, 3000); } };
        ws.onerror = () => ws.close();
      } catch { if (!destroyed) { clearReconnect(); reconnectTimeoutRef.current = setTimeout(connect, 5000); } }
    };
    connect();
    return () => { destroyed = true; clearPing(); clearReconnect(); if (wsRef.current) { wsRef.current.close(); wsRef.current = null; } };
  }, [WS_BASE]);

  const ovQ = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => api.get("/admin/analytics/overview").then((r) => r.data),
    refetchInterval: 60000,
  });
  const vdQ = useQuery({
    queryKey: ["analytics-visitors"],
    queryFn: () => api.get("/admin/analytics/visitors").then((r) => r.data),
    refetchInterval: 60000,
  });
  const bmQ = useQuery({
    queryKey: ["analytics-by-month"],
    queryFn: () => api.get("/admin/analytics/by-month").then((r) => r.data),
  });
  const csQ = useQuery({
    queryKey: ["analytics-counter-stats"],
    queryFn: () => api.get("/admin/analytics/counter-stats").then((r) => r.data),
    refetchInterval: 60000,
  });

  // Use the slowest of the four queries to gate the shell
  const { loading: ovL, timedOut: ovTO } = useWithTimeout(ovQ);
  const { loading: vdL, timedOut: vdTO } = useWithTimeout(vdQ);

  const loading   = ovL || vdL;
  const timedOut  = (ovTO || vdTO) && !ovQ.data && !vdQ.data;

  const ov = ovQ.data as any;
  const vd = vdQ.data as any;
  const bm = bmQ.data as any;
  const cs = csQ.data as any;

  const ch  = useChartH(290, 230, 170);
  const chS = useChartH(250, 200, 160);

  const monthlyChart = (bm?.monthly_data ?? [])
    .map((m: any) => ({
      name: `${String(m.month).padStart(2, "0")}/${String(m.year).slice(2)}`,
      Bookings: m.count,
    }))
    .reverse();

  const svcPie = [
    { name: "Completed", value: ov?.completed_bookings ?? 0 },
    { name: "Approved",  value: ov?.approved_bookings  ?? 0 },
    { name: "Pending",   value: ov?.pending_bookings   ?? 0 },
    { name: "Cancelled", value: ov?.cancelled_bookings ?? 0 },
  ].filter((d) => d.value > 0);

  const evtPie = [
    { name: "Paid",       value: ov?.paid_event_bookings    ?? 0 },
    { name: "Checked In", value: ov?.checked_in_count       ?? 0 },
    { name: "Cancelled",  value: ov?.cancelled_event_bookings ?? 0 },
  ].filter((d) => d.value > 0);

  const totalSvc = ov?.total_bookings       ?? 0;
  const totalEvt = ov?.total_event_bookings ?? 0;

  return (
    <TabShell loading={loading} timedOut={timedOut} accentColor={P.coral}>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

        {/* ── Hero row ─────────────────────────────────────────── */}
        <div className="rg g-hero">
          <div className="stat-card" style={{ "--stripe": P.teal } as any}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
              <div className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: P.teal }} />
              <span style={{ fontSize: 9.5, fontWeight: 800, color: P.teal, textTransform: "uppercase", letterSpacing: ".1em" }}>Live Now</span>
            </div>
            <p className="mono num-hero" style={{ fontWeight: 700, color: "#111827", lineHeight: 1, margin: "0 0 6px" }}>{liveCount}</p>
            <p style={{ fontSize: 12, color: "#6B7280" }}>Verified active viewers</p>
          </div>

          {[
            { lbl: "Visitors Today",      v: ov?.unique_today ?? 0, color: P.indigo, icon: Eye      },
            { lbl: "Visitors This Month", v: ov?.unique_month ?? 0, color: P.violet, icon: Activity },
            { lbl: "All Time Visitors",   v: ov?.unique_total ?? 0, color: P.coral,  icon: Globe, big: true },
          ].map(({ lbl, v, color, icon: I, big }: any) => (
            <div key={lbl} className="stat-card" style={{ "--stripe": color } as any}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <span style={{ fontSize: 9.5, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: ".1em", flex: 1, paddingRight: 8 }}>{lbl}</span>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <I style={{ width: 14, height: 14, color }} />
                </div>
              </div>
              {loading ? <Skel h={48} w={80} /> : (
                <p className="mono num-hero" style={{ fontWeight: 700, color: "#111827", lineHeight: 1, margin: "0 0 6px" }}>
                  <Num v={v} big={big} />
                </p>
              )}
              <p style={{ fontSize: 12, color: "#6B7280" }}>Unique visitors</p>
            </div>
          ))}
        </div>

        {/* ── Atomic counters ──────────────────────────────────── */}
        <SectionLabel color={P.indigo}>Atomic Visit Counters</SectionLabel>
        <div className="rg g4">
          {[
            { lbl: "Total (All Time)", v: cs?.total     ?? 0, color: P.indigo, icon: Globe    },
            { lbl: "Today (UTC)",      v: cs?.today     ?? 0, color: P.teal,   icon: Calendar },
            { lbl: "This Hour (UTC)",  v: cs?.this_hour ?? 0, color: P.sky,    icon: Clock    },
            { lbl: "Last 24 Hours",    v: cs?.last_24h  ?? 0, color: P.violet, icon: TrendingUp },
          ].map(({ lbl, v, color, icon: I }) => (
            <div key={lbl} className="stat-card" style={{ "--stripe": color } as any}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 9.5, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: ".1em", margin: "0 0 11px" }}>{lbl}</p>
                  {!cs ? <Skel h={34} w={60} /> : (
                    <p className="mono num-md" style={{ fontWeight: 700, color: "#111827", lineHeight: 1, margin: "0 0 5px" }}><Num v={v} /></p>
                  )}
                  <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0 }}>atomic $inc · no dupes</p>
                </div>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 8 }}>
                  <I style={{ width: 14, height: 14, color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quality stats ─────────────────────────────────────── */}
        <div className="rg g4">
          {[
            { label: "Avg Duration",      v: fmtDur(ov?.avg_duration_seconds ?? 0), icon: Timer,         color: P.violet },
            { label: "Bounce Rate",       v: `${ov?.bounce_rate_today ?? 0}%`,      icon: Zap,           color: P.coral  },
            { label: "Avg Pages/Session", v: `${ov?.avg_pages_per_session ?? 0}`,   icon: MousePointer2, color: P.sky    },
            { label: "Today's Bookings",  v: fmt(ov?.today_bookings ?? 0),          icon: Calendar,      color: P.amber  },
          ].map(({ label, v, icon: I, color }) => (
            <div key={label} className="stat-card" style={{ "--stripe": color } as any}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 9.5, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>{label}</p>
                  <p className="mono num-qual" style={{ fontWeight: 700, color: "#111827", margin: 0 }}>{loading ? "—" : v}</p>
                </div>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 8 }}>
                  <I style={{ width: 14, height: 14, color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Visitor trend ─────────────────────────────────────── */}
        <ChartCard title="Visitor Trend — Last 30 Days" icon={TrendingUp} accentColor={P.indigo} subtitle="Unique sessions per calendar day">
          {(vd?.daily_trend?.length ?? 0) === 0 ? <Empty icon={Eye} msg="No visitor data yet" /> : (
            <ResponsiveContainer width="100%" height={ch}>
              <AreaChart data={(vd?.daily_trend ?? []).slice(-30)} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gOv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={P.indigo} stopOpacity={0.14} />
                    <stop offset="100%" stopColor={P.indigo} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1FA" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CT />} />
                <Area type="monotone" dataKey="unique" name="Unique Sessions" stroke={P.indigo} fill="url(#gOv)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: P.indigo, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* ── Service Bookings ──────────────────────────────────── */}
        <SectionLabel color={P.coral}>Service Bookings</SectionLabel>
        <div className="rg g4">
          {[
            { label: "Total",     v: totalSvc,                    color: P.coral,  icon: Calendar    },
            { label: "Pending",   v: ov?.pending_bookings   ?? 0, color: P.amber,  icon: Clock       },
            { label: "Completed", v: ov?.completed_bookings ?? 0, color: P.teal,   icon: CheckCircle },
            { label: "Cancelled", v: ov?.cancelled_bookings ?? 0, color: P.violet, icon: XCircle     },
          ].map(({ label, v, color, icon: I }) => (
            <StatCard key={label} label={label} value={v} color={color} icon={I} loading={loading} />
          ))}
        </div>

        <div className="rg g-charts">
          <ChartCard title="Status Distribution" icon={BarChart2} accentColor={P.coral}>
            {svcPie.length === 0 ? <Empty icon={Calendar} msg="No data yet" /> : (
              <DonutWithCenter data={svcPie} total={totalSvc} totalLabel="Bookings" />
            )}
          </ChartCard>
          <ChartCard title="Monthly Service Bookings" icon={Calendar} accentColor={P.coral}>
            {monthlyChart.length === 0 ? <Empty icon={Calendar} msg="No history yet" /> : (
              <ResponsiveContainer width="100%" height={chS}>
                <BarChart data={monthlyChart} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF1FA" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9CA3AF", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CT />} />
                  <Bar dataKey="Bookings" radius={[6, 6, 0, 0]}>
                    {monthlyChart.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* ── Event Bookings ────────────────────────────────────── */}
        <SectionLabel color={P.violet}>Event Bookings</SectionLabel>
        <div className="rg g4">
          {[
            { label: "Total",      v: totalEvt,                          color: P.violet, icon: Ticket     },
            { label: "Paid",       v: ov?.paid_event_bookings    ?? 0,   color: P.teal,   icon: CreditCard },
            { label: "Checked In", v: ov?.checked_in_count       ?? 0,   color: P.sky,    icon: UserCheck  },
            { label: "Cancelled",  v: ov?.cancelled_event_bookings ?? 0, color: P.coral,  icon: XCircle    },
          ].map(({ label, v, color, icon: I }) => (
            <div key={label} className="stat-card" style={{ "--stripe": color } as any}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 9.5, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>{label}</p>
                  {loading ? <Skel h={34} w={55} /> : (
                    <p className="mono num-lg" style={{ fontWeight: 700, color: "#111827", lineHeight: 1, margin: "0 0 4px" }}><Num v={v} /></p>
                  )}
                  <p style={{ fontSize: 10.5, color: "#9CA3AF" }}>{pct(v, totalEvt)}% of total</p>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 8 }}>
                  <I style={{ width: 15, height: 15, color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {evtPie.length > 0 && (
          <ChartCard title="Event Status Distribution" icon={Ticket} accentColor={P.violet}>
            <DonutWithCenter data={evtPie} total={totalEvt} totalLabel="Events" colors={[P.teal, P.indigo, P.coral]} />
          </ChartCard>
        )}
      </div>
    </TabShell>
  );
}