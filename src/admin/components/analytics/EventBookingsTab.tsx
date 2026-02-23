// ================================================================
// EventBookingsTab.tsx — Event booking analytics
// ================================================================

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Ticket, CreditCard, UserCheck, XCircle, TrendingUp, Star,
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import api from "../../services/api";
import { P, CHART_COLORS, fmt, pct, downloadCSV } from "./constants";
import { Skel, Empty, SectionLabel } from "./ui";
import {
  StatCard, ChartCard, DateFilter, DonutWithCenter,
  BarProgress, useChartH,
} from "./components";
import { CT } from "./ui";

export function EventBookingsTab() {
  const { toast } = useToast();
  const [efrom, setEFrom] = useState("");
  const [eto,   setETo]   = useState("");
  const [busy,  setBusy]  = useState(false);
  const ch = useChartH(255, 205, 160);

  const { data: evt, isLoading } = useQuery({
    queryKey: ["analytics-evt", efrom, eto],
    queryFn: () =>
      api.get("/admin/analytics/event-bookings/stats", {
        params: { date_from: efrom || undefined, date_to: eto || undefined },
      }).then((r) => r.data),
  });

  const handleExport = async () => {
    setBusy(true);
    try {
      const qs = new URLSearchParams();
      if (efrom) qs.set("date_from", efrom);
      if (eto)   qs.set("date_to",   eto);
      await downloadCSV(
        `/admin/analytics/export/event-bookings${qs.toString() ? `?${qs}` : ""}`,
        `event_bookings_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      toast({ title: "✅ Downloaded" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const totalEvt   = evt?.total ?? 0;
  const paidEvt    = (evt?.by_status?.paid ?? 0) + (evt?.by_status?.confirmed ?? 0);
  const revDisplay = Math.round((evt?.total_revenue_units ?? 0) / 100);
  const convRate   = pct(paidEvt, totalEvt);

  const evtStatusPie = Object.entries(evt?.by_status ?? {}).map(([k, v]) => ({
    name:  k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value: v as number,
  }));

  const providerD = (evt?.by_provider ?? []).map((p: any) => ({
    name:  !p.provider || p.provider === "None"
      ? "Unknown"
      : p.provider.charAt(0).toUpperCase() + p.provider.slice(1),
    value: p.count,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <SectionLabel color={P.violet}>Event Bookings</SectionLabel>

      {/* Date filter + export */}
      <DateFilter
        from={efrom} to={eto}
        onFrom={setEFrom} onTo={setETo}
        onExport={handleExport} busy={busy}
        accent={P.violet}
      />

      {/* Primary stats */}
      <div className="rg g4">
        {[
          { label: "Total",            v: totalEvt,                             icon: Ticket,    color: P.violet },
          { label: "Paid / Confirmed", v: paidEvt,                              icon: CreditCard,color: P.teal   },
          { label: "Checked In",       v: evt?.by_status?.["checked_in"] ?? 0, icon: UserCheck, color: P.sky    },
          { label: "Cancelled",        v: evt?.by_status?.cancelled ?? 0,       icon: XCircle,   color: P.coral  },
        ].map(({ label, v, icon: I, color }) => (
          <StatCard key={label} label={label} value={v} color={color} icon={I} loading={isLoading} />
        ))}
      </div>

      {/* Secondary stats */}
      <div className="rg g3">
        {[
          { label: "Total Revenue",          val: fmt(revDisplay),                     color: P.amber,   sub: "Revenue units ÷ 100 (NPR / INR)" },
          { label: "Conversion Rate",        val: `${convRate}%`,                      color: P.emerald, sub: "Paid / Confirmed out of total"    },
          { label: "Today's Event Bookings", val: fmt(evt?.today_event_bookings ?? 0), color: P.fuchsia, sub: "New event bookings today"         },
        ].map(({ label, val, color, sub }) => (
          <div key={label} className="stat-card" style={{ "--stripe": color } as any}>
            <p style={{ fontSize: 9.5, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
              {label}
            </p>
            <p className="mono num-md" style={{ fontWeight: 700, color: "#111827", lineHeight: 1, margin: "0 0 5px" }}>
              {isLoading ? "—" : val}
            </p>
            <p style={{ fontSize: 10.5, color: "#9CA3AF" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Status + provider donuts */}
      <div className="rg g-charts">
        <ChartCard title="Event Status Breakdown" icon={Ticket} accentColor={P.violet}>
          {evtStatusPie.length === 0 ? (
            <Empty icon={Ticket} msg="No event data" />
          ) : (
            <DonutWithCenter data={evtStatusPie} total={totalEvt} totalLabel="Events" />
          )}
        </ChartCard>
        <ChartCard title="Payment Provider Split" icon={CreditCard} accentColor={P.sky}>
          {providerD.length === 0 ? (
            <Empty icon={CreditCard} msg="No payment data" />
          ) : (
            <DonutWithCenter
              data={providerD} total={totalEvt} totalLabel="Payments"
              colors={[P.sky, P.violet, P.teal, P.amber]}
            />
          )}
        </ChartCard>
      </div>

      {/* Top events */}
      {(evt?.by_event?.length ?? 0) > 0 && (
        <ChartCard
          title="Bookings by Event" icon={Star}
          accentColor={P.fuchsia}
          subtitle="Top events ranked by booking count"
        >
          {evt.by_event.slice(0, 8).map((e: any, i: number) => (
            <BarProgress
              key={i}
              label={e.event}
              value={e.count}
              max={evt.by_event[0].count}
              color={CHART_COLORS[i % CHART_COLORS.length]}
              sub={`${fmt(Math.round(e.revenue / 100))} rev`}
            />
          ))}
        </ChartCard>
      )}

      {/* Daily trend charts */}
      {(evt?.daily_trend?.length ?? 0) > 0 && (
        <div className="rg g-charts">
          <ChartCard
            title="Daily Event Bookings · Last 30 Days"
            icon={TrendingUp} accentColor={P.violet}
            subtitle="New event bookings per day"
          >
            <ResponsiveContainer width="100%" height={ch}>
              <AreaChart data={evt.daily_trend} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gED" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={P.violet} stopOpacity={0.14} />
                    <stop offset="100%" stopColor={P.violet} stopOpacity={0} />
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
                  type="monotone" dataKey="count" name="Event Bookings"
                  stroke={P.violet} fill="url(#gED)" strokeWidth={2.5}
                  dot={false} activeDot={{ r: 5, fill: P.violet, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Revenue Trend · Last 30 Days"
            icon={TrendingUp} accentColor={P.amber}
            subtitle="Revenue units per day (÷100 for currency)"
          >
            <ResponsiveContainer width="100%" height={ch}>
              <AreaChart
                data={(evt.daily_trend ?? []).map((d: any) => ({
                  ...d,
                  revenueDisplay: Math.round((d.revenue ?? 0) / 100),
                }))}
                margin={{ top: 8, right: 4, bottom: 0, left: -20 }}
              >
                <defs>
                  <linearGradient id="gRD" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={P.amber} stopOpacity={0.14} />
                    <stop offset="100%" stopColor={P.amber} stopOpacity={0} />
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
                  type="monotone" dataKey="revenueDisplay" name="Revenue"
                  stroke={P.amber} fill="url(#gRD)" strokeWidth={2.5}
                  dot={false} activeDot={{ r: 5, fill: P.amber, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}