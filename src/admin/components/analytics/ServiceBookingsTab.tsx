// ================================================================
// ServiceBookingsTab.tsx — Service booking analytics
// ================================================================

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Calendar, CheckCircle, Clock, XCircle, Activity,
  BarChart2, TrendingUp, ArrowUpRight,
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import api from "../../services/api";
import { P, fmt, pct, downloadCSV } from "./constants";
import { Empty, SectionLabel } from "./ui";
import {
  StatCard, ChartCard, DateFilter, DonutWithCenter,
  BarProgress, useChartH, HorizontalBarChart,
} from "./components";
import { CT } from "./ui";

export function ServiceBookingsTab() {
  const { toast } = useToast();
  const [sfrom, setSFrom] = useState("");
  const [sto,   setSTo]   = useState("");
  const [busy,  setBusy]  = useState(false);
  const ch = useChartH(255, 205, 160);

  const { data: svc, isLoading } = useQuery({
    queryKey: ["analytics-svc", sfrom, sto],
    queryFn: () =>
      api.get("/admin/analytics/service-bookings/stats", {
        params: { date_from: sfrom || undefined, date_to: sto || undefined },
      }).then((r) => r.data),
  });

  const { data: bySvc } = useQuery({
    queryKey: ["analytics-by-service"],
    queryFn: () => api.get("/admin/analytics/by-service").then((r) => r.data),
  });

  const handleExport = async () => {
    setBusy(true);
    try {
      const qs = new URLSearchParams();
      if (sfrom) qs.set("date_from", sfrom);
      if (sto)   qs.set("date_to",   sto);
      await downloadCSV(
        `/admin/analytics/export/service-bookings${qs.toString() ? `?${qs}` : ""}`,
        `service_bookings_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      toast({ title: "✅ Downloaded" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const allSvcs      = bySvc?.services ?? svc?.by_service ?? [];
  const totalSvc     = svc?.total ?? 0;
  const completedPct = pct(svc?.by_status?.completed ?? 0, totalSvc);

  const svcStatusPie = Object.entries(svc?.by_status ?? {}).map(([k, v]) => ({
    name:  k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value: v as number,
  }));

  const statusBarData = svcStatusPie.map((d) => ({ name: d.name, value: d.value }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <SectionLabel color={P.coral}>Service Bookings</SectionLabel>

      {/* Date filter + export */}
      <DateFilter
        from={sfrom} to={sto}
        onFrom={setSFrom} onTo={setSTo}
        onExport={handleExport} busy={busy}
        accent={P.coral}
      />

      {/* Primary stats */}
      <div className="rg g4">
        {[
          { label: "Total",     v: totalSvc,                      icon: Calendar,    color: P.coral },
          { label: "Pending",   v: svc?.by_status?.pending   ?? 0, icon: Clock,       color: P.amber },
          { label: "Approved",  v: svc?.by_status?.approved  ?? 0, icon: CheckCircle, color: P.sky   },
          { label: "Completed", v: svc?.by_status?.completed ?? 0, icon: CheckCircle, color: P.teal  },
        ].map(({ label, v, icon: I, color }) => (
          <StatCard key={label} label={label} value={v} color={color} icon={I} loading={isLoading} />
        ))}
      </div>

      {/* Secondary stats */}
      <div className="rg g3">
        {[
          { label: "Cancelled",       v: svc?.by_status?.cancelled ?? 0, color: P.violet,  icon: XCircle,      suffix: ""  },
          { label: "Today",           v: svc?.today_bookings ?? 0,        color: P.orange,  icon: ArrowUpRight, suffix: ""  },
          { label: "Completion Rate", v: completedPct,                    color: P.emerald, icon: Activity,     suffix: "%" },
        ].map(({ label, v, color, icon: I, suffix }) => (
          <div key={label} className="stat-card" style={{ "--stripe": color } as any}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 9.5, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
                  {label}
                </p>
                <p className="mono num-md" style={{ fontWeight: 700, color: "#111827", lineHeight: 1 }}>
                  {isLoading ? "—" : `${fmt(v)}${suffix}`}
                </p>
              </div>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 8 }}>
                <I style={{ width: 14, height: 14, color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="rg g-charts">
        <ChartCard title="Bookings by Service" icon={BarChart2} accentColor={P.coral}>
          {allSvcs.length === 0 ? (
            <Empty icon={Calendar} msg="No service data" />
          ) : (
            <DonutWithCenter
              data={allSvcs.map((s: any) => ({ name: s.service, value: s.count }))}
              total={totalSvc}
              totalLabel="Total"
            />
          )}
        </ChartCard>
        <ChartCard title="Status Breakdown" icon={Activity} accentColor={P.amber}>
          {statusBarData.length === 0 ? (
            <Empty icon={BarChart2} msg="No status data" />
          ) : (
            <HorizontalBarChart data={statusBarData} dataKey="value" nameKey="name" height={ch} />
          )}
        </ChartCard>
      </div>

      {/* Daily trend */}
      {(svc?.daily_trend?.length ?? 0) > 0 && (
        <ChartCard
          title="Daily Service Bookings — Last 30 Days"
          icon={TrendingUp} accentColor={P.coral}
          subtitle="Bookings created per day"
        >
          <ResponsiveContainer width="100%" height={ch}>
            <AreaChart data={svc.daily_trend} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gSD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={P.coral} stopOpacity={0.14} />
                  <stop offset="100%" stopColor={P.coral} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF1FA" vertical={false} />
              <XAxis
                dataKey="date" tickFormatter={(d) => d.slice(5)}
                tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9CA3AF", fontFamily: "DM Mono" }}
                axisLine={false} tickLine={false} allowDecimals={false}
              />
              <Tooltip content={<CT />} />
              <Area
                type="monotone" dataKey="count" name="Bookings"
                stroke={P.coral} fill="url(#gSD)" strokeWidth={2.5}
                dot={false} activeDot={{ r: 5, fill: P.coral, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Funnel */}
      <div className="card" style={{ padding: "18px 16px" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 16 }}>
          Booking Funnel Breakdown
        </p>
        {[
          { label: "Pending",   value: svc?.by_status?.pending   ?? 0, color: P.amber  },
          { label: "Approved",  value: svc?.by_status?.approved  ?? 0, color: P.sky    },
          { label: "Completed", value: svc?.by_status?.completed ?? 0, color: P.teal   },
          { label: "Cancelled", value: svc?.by_status?.cancelled ?? 0, color: P.coral  },
        ].map(({ label, value, color }) => (
          <BarProgress key={label} label={label} value={value} max={totalSvc} color={color} sub={`${pct(value, totalSvc)}%`} />
        ))}
      </div>
    </div>
  );
}