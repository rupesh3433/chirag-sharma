// Analytics.tsx
// Tabs: Overview · Visitors · Service Bookings · Event Bookings

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import {
  Download, Calendar, CheckCircle, Clock, XCircle,
  Users, Eye, TrendingUp, Ticket, UserCheck, CreditCard,
  Globe, RefreshCw, Activity, BarChart2,
} from 'lucide-react';
import { Button }   from '@shared/components/ui/button';
import { Input }    from '@shared/components/ui/input';
import { Label }    from '@shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Badge }    from '@shared/components/ui/badge';
import api          from '../services/api';
import { useToast } from '@/shared/hooks/use-toast';

const P        = ['#F43F5E','#8B5CF6','#10B981','#F59E0B','#3B82F6','#EC4899','#06B6D4','#84CC16'];
const API_BASE = (import.meta.env.VITE_API_URL ?? '') as string;

// ── helpers ───────────────────────────────────────────────
type Accent = 'rose'|'purple'|'emerald'|'amber'|'blue'|'cyan';

async function downloadCSV(path: string, filename: string) {
  const token = localStorage.getItem('admin_token');
  const res   = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── StatCard ──────────────────────────────────────────────
function StatCard({ title, value, sub, icon: Icon, accent = 'rose', highlight = false }: {
  title: string; value: string|number; sub?: string;
  icon: React.ElementType; accent?: Accent; highlight?: boolean;
}) {
  const CLS: Record<Accent,string> = {
    rose:    'bg-rose-50 text-rose-600',
    purple:  'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50 text-amber-600',
    blue:    'bg-blue-50 text-blue-600',
    cyan:    'bg-cyan-50 text-cyan-600',
  };
  return (
    <Card className={highlight ? 'ring-2 ring-rose-300' : ''}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{title}</p>
            <p className="text-2xl font-bold mt-0.5 tabular-nums leading-none">{value ?? '—'}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg flex-shrink-0 ${CLS[accent]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── ChartCard ─────────────────────────────────────────────
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">{children}</CardContent>
    </Card>
  );
}

// ── SectionHeading ────────────────────────────────────────
function SH({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 mt-1">
      {children}
    </h3>
  );
}

// ── Tooltip ───────────────────────────────────────────────
const CT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded-lg shadow-lg p-2.5 text-xs">
      <p className="font-semibold text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

// ── DateFilterBar ─────────────────────────────────────────
function DateFilterBar({ dateFrom, dateTo, onFrom, onTo, onExport, label, busy }: {
  dateFrom: string; dateTo: string;
  onFrom: (v: string) => void; onTo: (v: string) => void;
  onExport: () => void; label: string; busy: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs">From</Label>
            <Input type="date" value={dateFrom} onChange={e => onFrom(e.target.value)} className="h-8 text-sm w-36" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">To</Label>
            <Input type="date" value={dateTo} onChange={e => onTo(e.target.value)} className="h-8 text-sm w-36" />
          </div>
          <Button size="sm" onClick={onExport} disabled={busy}
            className="bg-rose-600 hover:bg-rose-700 text-white h-8">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {busy ? 'Downloading…' : label}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── BarProgress ───────────────────────────────────────────
function BarProgress({ label, value, max, color = 'bg-rose-400' }: {
  label: string; value: number; max: number; color?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2 mb-1">
          <span className="text-xs truncate">{label}</span>
          <span className="text-xs font-semibold flex-shrink-0 tabular-nums">{value.toLocaleString()}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${max > 0 ? (value/max)*100 : 0}%` }} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB — VISITORS
// ═══════════════════════════════════════════════════════════
function VisitorsTab() {
  const [view, setView] = useState<'daily'|'monthly'|'yearly'>('daily');

  const { data: ov, isLoading: ovL } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn:  () => api.get('/admin/analytics/overview').then(r => r.data),
    refetchInterval: 30_000,
  });

  const { data: vd, isLoading: vdL, refetch } = useQuery({
    queryKey: ['analytics-visitors'],
    queryFn:  () => api.get('/admin/analytics/visitors').then(r => r.data),
    refetchInterval: 60_000,
  });

  const loading = ovL || vdL;

  const trendData =
    view === 'daily'   ? (vd?.daily_trend   ?? []).slice(-30) :
    view === 'monthly' ? (vd?.monthly_trend  ?? []) :
                         (vd?.yearly_trend   ?? []);

  const trendKey  = view === 'daily' ? 'date' : 'label';
  const tickFmt   = (v: string) => view === 'daily' ? v.slice(5) : v;

  const periods: Array<{period:string; pageviews:number; unique:number}> =
    vd?.period_counts ?? [];

  // Build summary cards from overview for the 5 period cards
  const periodCards = [
    { label: 'Today',      pv: ov?.visits_today  ?? 0, uq: ov?.unique_today  ?? 0, hi: true  },
    { label: 'This Week',  pv: ov?.visits_week   ?? 0, uq: ov?.unique_week   ?? 0, hi: false },
    { label: 'This Month', pv: ov?.visits_month  ?? 0, uq: ov?.unique_month  ?? 0, hi: false },
    { label: 'This Year',  pv: ov?.visits_year   ?? 0, uq: ov?.unique_year   ?? 0, hi: false },
    { label: 'All Time',   pv: ov?.visits_total  ?? 0, uq: ov?.unique_total  ?? 0, hi: false },
  ];

  return (
    <div className="space-y-5">
      {/* 5 Period cards */}
      <SH>Visits by Period</SH>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {loading
          ? Array.from({length:5}).map((_,i) => (
              <Card key={i}><CardContent className="pt-4 pb-4"><div className="h-14 bg-muted animate-pulse rounded" /></CardContent></Card>
            ))
          : periodCards.map(p => (
              <Card key={p.label} className={p.hi ? 'ring-2 ring-rose-300' : ''}>
                <CardContent className="pt-3 pb-3">
                  <p className="text-xs font-semibold text-muted-foreground">{p.label}</p>
                  <p className="text-xl font-bold tabular-nums mt-0.5 leading-none">{p.pv.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-semibold text-foreground">{p.uq.toLocaleString()}</span> unique
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Pageviews Today"    value={loading?'…':(ov?.visits_today ??0).toLocaleString()} sub={`${(ov?.unique_today??0).toLocaleString()} unique`} icon={Eye}      accent="rose"    highlight />
        <StatCard title="Pageviews This Week" value={loading?'…':(ov?.visits_week ??0).toLocaleString()} sub={`${(ov?.unique_week??0).toLocaleString()} unique`} icon={Activity}  accent="blue"    />
        <StatCard title="Pageviews This Month" value={loading?'…':(ov?.visits_month??0).toLocaleString()} sub={`${(ov?.unique_month??0).toLocaleString()} unique`} icon={Users}   accent="purple"  />
        <StatCard title="Total All Time"       value={loading?'…':(ov?.visits_total??0).toLocaleString()} sub={`${(ov?.unique_total??0).toLocaleString()} unique`} icon={Globe}   accent="emerald" />
      </div>

      {/* Trend chart */}
      <ChartCard title="Visitor Trend">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(['daily','monthly','yearly'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                view === v
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'border-input text-muted-foreground hover:border-rose-300'
              }`}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
          <button onClick={() => refetch()} title="Refresh"
            className="ml-auto p-1.5 rounded border text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {trendData.length === 0 ? (
          <div className="h-52 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Eye className="h-10 w-10 opacity-20" />
            <div className="text-center">
              <p className="text-sm font-medium">No visitor data yet</p>
              <p className="text-xs mt-1 max-w-xs">
                Make sure <code className="bg-muted px-1 rounded text-xs">visitor_tracking.py</code> is
                set up in <code className="bg-muted px-1 rounded text-xs">app.py</code> and your server
                has been restarted.
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gPV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gUQ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F43F5E" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={trendKey} tick={{ fontSize: 10 }} tickFormatter={tickFmt} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CT />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="pageviews" name="Pageviews" stroke="#3B82F6" fill="url(#gPV)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="unique"    name="Unique"    stroke="#F43F5E" fill="url(#gUQ)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Top pages + referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Top Pages (Last 30 Days)">
          {(vd?.top_pages?.length ?? 0) === 0
            ? <p className="text-sm text-muted-foreground py-6 text-center">No data yet</p>
            : (
              <div className="space-y-3">
                {vd.top_pages.map((p: any, i: number) => (
                  <BarProgress key={i} label={p.page} value={p.views}
                    max={vd.top_pages[0].views} color="bg-blue-400" />
                ))}
              </div>
            )}
        </ChartCard>

        <ChartCard title="Top Referrers (Last 30 Days)">
          {(vd?.top_referrers?.length ?? 0) === 0
            ? <p className="text-sm text-muted-foreground py-6 text-center">No referrer data yet</p>
            : (
              <div className="space-y-3">
                {vd.top_referrers.map((r: any, i: number) => (
                  <BarProgress key={i} label={r.referrer} value={r.count}
                    max={vd.top_referrers[0].count} color="bg-purple-400" />
                ))}
              </div>
            )}
        </ChartCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB — OVERVIEW
// ═══════════════════════════════════════════════════════════
function OverviewTab() {
  const { data: ov, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn:  () => api.get('/admin/analytics/overview').then(r => r.data),
    refetchInterval: 60_000,
  });
  const { data: bm } = useQuery({
    queryKey: ['analytics-by-month'],
    queryFn:  () => api.get('/admin/analytics/by-month').then(r => r.data),
  });

  const monthlyChart = (bm?.monthly_data ?? [])
    .map((m: any) => ({
      name: `${String(m.month).padStart(2,'0')}/${String(m.year).slice(2)}`,
      Bookings: m.count,
    }))
    .reverse();

  return (
    <div className="space-y-5">
      <SH>Website Visitors</SH>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Today',     pv: ov?.visits_today,  uq: ov?.unique_today,  hi: true  },
          { label: 'This Week', pv: ov?.visits_week,   uq: ov?.unique_week,   hi: false },
          { label: 'This Month',pv: ov?.visits_month,  uq: ov?.unique_month,  hi: false },
          { label: 'This Year', pv: ov?.visits_year,   uq: ov?.unique_year,   hi: false },
          { label: 'All Time',  pv: ov?.visits_total,  uq: ov?.unique_total,  hi: false },
        ].map(p => (
          <Card key={p.label} className={p.hi ? 'ring-2 ring-rose-300' : ''}>
            <CardContent className="pt-3 pb-3">
              <p className="text-xs font-semibold text-muted-foreground">{p.label}</p>
              <p className="text-xl font-bold tabular-nums mt-0.5 leading-none">
                {isLoading ? '…' : (p.pv ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="font-semibold text-foreground">
                  {isLoading ? '…' : (p.uq ?? 0).toLocaleString()}
                </span> unique
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <SH>Service Bookings</SH>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total"     value={isLoading?'…':(ov?.total_bookings??0)}     sub={`${ov?.today_bookings??0} today`} icon={Calendar}    accent="rose"    />
        <StatCard title="Pending"   value={isLoading?'…':(ov?.pending_bookings??0)}                                         icon={Clock}       accent="amber"   />
        <StatCard title="Completed" value={isLoading?'…':(ov?.completed_bookings??0)}                                       icon={CheckCircle} accent="emerald" />
        <StatCard title="Cancelled" value={isLoading?'…':(ov?.cancelled_bookings??0)}                                       icon={XCircle}     accent="purple"  />
      </div>

      <SH>Event Bookings</SH>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total"        value={isLoading?'…':(ov?.total_event_bookings??0)}    sub={`${ov?.today_event_bookings??0} today`} icon={Ticket}     accent="rose"    />
        <StatCard title="Paid"         value={isLoading?'…':(ov?.paid_event_bookings??0)}                                                  icon={CreditCard} accent="emerald" />
        <StatCard title="Checked In"   value={isLoading?'…':(ov?.checked_in_count??0)}                                                     icon={UserCheck}  accent="blue"    />
        <StatCard title="Cancelled"    value={isLoading?'…':(ov?.cancelled_event_bookings??0)}                                             icon={XCircle}    accent="amber"   />
      </div>

      <ChartCard title="Service Bookings — Monthly Trend">
        {monthlyChart.length === 0
          ? <div className="h-44 flex items-center justify-center text-muted-foreground text-sm">No booking data yet</div>
          : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyChart}>
                <defs>
                  <linearGradient id="gOv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F43F5E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CT />} />
                <Area type="monotone" dataKey="Bookings" stroke="#F43F5E" fill="url(#gOv)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
      </ChartCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB — SERVICE BOOKINGS
// ═══════════════════════════════════════════════════════════
function ServiceBookingsTab() {
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [busy,     setBusy]     = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['analytics-service-stats', dateFrom, dateTo],
    queryFn:  () => api.get('/admin/analytics/service-bookings/stats', {
      params: { date_from: dateFrom || undefined, date_to: dateTo || undefined },
    }).then(r => r.data),
  });
  const { data: bySvc } = useQuery({
    queryKey: ['analytics-by-service'],
    queryFn:  () => api.get('/admin/analytics/by-service').then(r => r.data),
  });

  const handleExport = async () => {
    setBusy(true);
    try {
      const qs = new URLSearchParams();
      if (dateFrom) qs.set('date_from', dateFrom);
      if (dateTo)   qs.set('date_to',   dateTo);
      await downloadCSV(
        `/admin/analytics/export/service-bookings${qs.toString() ? `?${qs}` : ''}`,
        `service_bookings_${new Date().toISOString().slice(0,10)}.csv`,
      );
      toast({ title: '✅ Downloaded', description: 'Service bookings CSV exported.' });
    } catch { toast({ title: 'Export failed', variant: 'destructive' }); }
    finally  { setBusy(false); }
  };

  const statusData  = Object.entries(data?.by_status  ?? {}).map(([k,v]) => ({
    name: k.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase()), value: v as number,
  }));
  const allServices = bySvc?.services ?? data?.by_service ?? [];

  return (
    <div className="space-y-5">
      <DateFilterBar dateFrom={dateFrom} dateTo={dateTo} onFrom={setDateFrom} onTo={setDateTo}
        onExport={handleExport} label="Export CSV" busy={busy} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total"     value={isLoading?'…':(data?.total??0)}                        icon={Calendar}    accent="rose"    />
        <StatCard title="Pending"   value={isLoading?'…':(data?.by_status?.pending??0)}           icon={Clock}       accent="amber"   />
        <StatCard title="Completed" value={isLoading?'…':(data?.by_status?.completed??0)}         icon={CheckCircle} accent="emerald" />
        <StatCard title="Cancelled" value={isLoading?'…':(data?.by_status?.cancelled??0)}         icon={XCircle}     accent="purple"  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="By Service">
          {allServices.length === 0
            ? <div className="h-44 flex items-center justify-center text-muted-foreground text-sm">No data</div>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={allServices} dataKey="count" nameKey="service" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                    {allServices.map((_:any,i:number) => <Cell key={i} fill={P[i%P.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v:any,_:any,props:any) => [v, props.payload.service]} />
                  <Legend iconSize={10} wrapperStyle={{fontSize:11}} formatter={(_:any,e:any) => e.payload.service} />
                </PieChart>
              </ResponsiveContainer>
            )}
        </ChartCard>

        <ChartCard title="Status Breakdown">
          {statusData.length === 0
            ? <div className="h-44 flex items-center justify-center text-muted-foreground text-sm">No data</div>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{fontSize:11}} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{fontSize:11}} width={80} />
                  <Tooltip content={<CT />} />
                  <Bar dataKey="value" name="Bookings" radius={[0,4,4,0]}>
                    {statusData.map((_:any,i:number) => <Cell key={i} fill={P[i%P.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
        </ChartCard>
      </div>

      {(data?.daily_trend?.length ?? 0) > 0 && (
        <ChartCard title="Daily Bookings — Last 30 Days">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.daily_trend}>
              <defs>
                <linearGradient id="gSvc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F43F5E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{fontSize:10}} />
              <YAxis tick={{fontSize:11}} allowDecimals={false} />
              <Tooltip content={<CT />} />
              <Area type="monotone" dataKey="count" name="Bookings" stroke="#F43F5E" fill="url(#gSvc)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB — EVENT BOOKINGS
// ═══════════════════════════════════════════════════════════
function EventBookingsTab() {
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [busy,     setBusy]     = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['analytics-event-stats', dateFrom, dateTo],
    queryFn:  () => api.get('/admin/analytics/event-bookings/stats', {
      params: { date_from: dateFrom || undefined, date_to: dateTo || undefined },
    }).then(r => r.data),
  });

  const handleExport = async () => {
    setBusy(true);
    try {
      const qs = new URLSearchParams();
      if (dateFrom) qs.set('date_from', dateFrom);
      if (dateTo)   qs.set('date_to',   dateTo);
      await downloadCSV(
        `/admin/analytics/export/event-bookings${qs.toString() ? `?${qs}` : ''}`,
        `event_bookings_${new Date().toISOString().slice(0,10)}.csv`,
      );
      toast({ title: '✅ Downloaded', description: 'Event bookings CSV exported.' });
    } catch { toast({ title: 'Export failed', variant: 'destructive' }); }
    finally  { setBusy(false); }
  };

  const statusData   = Object.entries(data?.by_status ?? {}).map(([k,v]) => ({
    name: k.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase()), value: v as number,
  }));
  const providerData = (data?.by_provider ?? []).map((p:any) => ({
    name:  (!p.provider || p.provider==='None') ? 'Unknown' : p.provider.charAt(0).toUpperCase()+p.provider.slice(1),
    value: p.count,
  }));
  const paidCount = (data?.by_status?.paid ?? 0) + (data?.by_status?.confirmed ?? 0);

  return (
    <div className="space-y-5">
      <DateFilterBar dateFrom={dateFrom} dateTo={dateTo} onFrom={setDateFrom} onTo={setDateTo}
        onExport={handleExport} label="Export CSV" busy={busy} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total"          value={isLoading?'…':(data?.total??0)}                                      icon={Ticket}     accent="rose"    />
        <StatCard title="Paid/Confirmed" value={isLoading?'…':paidCount}                                             icon={CreditCard} accent="emerald" />
        <StatCard title="Cancelled"      value={isLoading?'…':(data?.by_status?.cancelled??0)}                       icon={XCircle}    accent="amber"   />
        <StatCard title="Revenue Units"  value={isLoading?'…':((data?.total_revenue_units??0)/100).toFixed(0)}        icon={TrendingUp} accent="purple"  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Status Breakdown">
          {statusData.length === 0
            ? <div className="h-44 flex items-center justify-center text-muted-foreground text-sm">No data</div>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                    {statusData.map((_:any,i:number) => <Cell key={i} fill={P[i%P.length]} />)}
                  </Pie>
                  <Tooltip /><Legend iconSize={10} wrapperStyle={{fontSize:11}} />
                </PieChart>
              </ResponsiveContainer>
            )}
        </ChartCard>

        <ChartCard title="Payment Provider Split">
          {providerData.length === 0
            ? <div className="h-44 flex items-center justify-center text-muted-foreground text-sm">No data</div>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={providerData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    {providerData.map((_:any,i:number) => <Cell key={i} fill={P[i%P.length]} />)}
                  </Pie>
                  <Tooltip /><Legend iconSize={10} wrapperStyle={{fontSize:11}} />
                </PieChart>
              </ResponsiveContainer>
            )}
        </ChartCard>
      </div>

      {(data?.by_event?.length ?? 0) > 0 && (
        <ChartCard title="Bookings by Event">
          <div className="space-y-3">
            {data.by_event.slice(0,8).map((e:any,i:number) => (
              <BarProgress key={i} label={e.event} value={e.count}
                max={data.by_event[0].count} color="bg-rose-400" />
            ))}
          </div>
        </ChartCard>
      )}

      {(data?.daily_trend?.length ?? 0) > 0 && (
        <ChartCard title="Daily Event Bookings — Last 30 Days">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.daily_trend}>
              <defs>
                <linearGradient id="gEvt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{fontSize:10}} />
              <YAxis tick={{fontSize:11}} allowDecimals={false} />
              <Tooltip content={<CT />} />
              <Area type="monotone" dataKey="count" name="Bookings" stroke="#10B981" fill="url(#gEvt)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
const TABS = [
  { key: 'overview', label: 'Overview',         icon: BarChart2 },
  { key: 'visitors', label: 'Visitors',          icon: Eye       },
  { key: 'service',  label: 'Service Bookings',  icon: Calendar  },
  { key: 'events',   label: 'Event Bookings',    icon: Ticket    },
] as const;
type TabKey = typeof TABS[number]['key'];

const AnalyticsPage = () => {
  const [tab, setTab] = useState<TabKey>('overview');
  return (
    <div className="w-full px-3 sm:px-4 md:px-6 py-4 md:py-6 space-y-5 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Visitors · Service Bookings · Event Bookings</p>
        </div>
        <Badge variant="outline" className="self-start sm:self-auto text-xs gap-1.5 px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
          Live · auto-refreshes
        </Badge>
      </div>

      <div className="flex gap-0 border-b overflow-x-auto pb-px">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-medium
              whitespace-nowrap border-b-2 transition-colors flex-shrink-0
              ${tab === key
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'visitors' && <VisitorsTab />}
      {tab === 'service'  && <ServiceBookingsTab />}
      {tab === 'events'   && <EventBookingsTab />}
    </div>
  );
};

export default AnalyticsPage;