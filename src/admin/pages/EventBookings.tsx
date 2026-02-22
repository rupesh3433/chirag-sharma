import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, RefreshCw, X, CheckCircle, Clock, XCircle,
  Ticket, UserCheck, Copy, Check, QrCode, ChevronLeft,
  ChevronRight, AlertCircle, Phone, Mail, Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Badge } from '@shared/components/ui/badge';
import { Input } from '@shared/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@shared/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@shared/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@shared/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@shared/components/ui/alert-dialog';
import { Separator } from '@shared/components/ui/separator';
import { toast } from '@shared/hooks/use-toast';
import { eventBookingsApi } from '../services/api';
import { EventBooking } from '../types';

// ─── Status / provider config ──────────────────────────────

const STATUS_CFG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  paid:            { label: 'Paid',            cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <CheckCircle className="h-3 w-3" /> },
  confirmed:       { label: 'Confirmed',       cls: 'bg-blue-100 text-blue-800 border-blue-200',          icon: <CheckCircle className="h-3 w-3" /> },
  pending_payment: { label: 'Pending',         cls: 'bg-amber-100 text-amber-800 border-amber-200',       icon: <Clock className="h-3 w-3" /> },
  cancelled:       { label: 'Cancelled',       cls: 'bg-red-100 text-red-800 border-red-200',             icon: <XCircle className="h-3 w-3" /> },
  refunded:        { label: 'Refunded',        cls: 'bg-purple-100 text-purple-800 border-purple-200',    icon: <AlertCircle className="h-3 w-3" /> },
};

const PROVIDER_CFG: Record<string, { label: string; cls: string }> = {
  razorpay: { label: 'Razorpay', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  khalti:   { label: 'Khalti',   cls: 'bg-purple-50 text-purple-700 border-purple-200' },
};

// ─── Booking detail modal ──────────────────────────────────

function BookingDetailModal({
  bookingId, open, onClose, onCheckIn,
}: {
  bookingId: string | null;
  open: boolean;
  onClose: () => void;
  onCheckIn: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['event-booking-detail', bookingId],
    queryFn: () => eventBookingsApi.getById(bookingId!),
    enabled: !!bookingId && open,
    select: (r) => r.data,
  });

  const booking: EventBooking | undefined = data?.booking;
  const paymentInfo = data?.payment_info;

  const copyTicket = () => {
    if (!booking?.ticket_code) return;
    navigator.clipboard.writeText(booking.ticket_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-pink-500" /> Booking Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading…</div>
        ) : !booking ? (
          <div className="py-8 text-center text-muted-foreground">Not found</div>
        ) : (
          <div className="space-y-4">
            {/* Ticket code banner */}
            {booking.ticket_code && (
              <div className="rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 p-4">
                <p className="text-xs text-muted-foreground mb-1">Ticket Code</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-lg tracking-widest text-pink-700 break-all">
                    {booking.ticket_code}
                  </span>
                  <Button size="sm" variant="ghost" onClick={copyTicket} className="flex-shrink-0">
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                {booking.checked_in && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
                    <UserCheck className="h-3.5 w-3.5" />
                    Checked in {booking.checked_in_at
                      ? new Date(booking.checked_in_at).toLocaleString() : ''}
                  </div>
                )}
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {booking.status && STATUS_CFG[booking.status] && (
                <Badge className={`${STATUS_CFG[booking.status].cls} border flex items-center gap-1`}>
                  {STATUS_CFG[booking.status].icon} {STATUS_CFG[booking.status].label}
                </Badge>
              )}
              {booking.payment_provider && PROVIDER_CFG[booking.payment_provider] && (
                <Badge className={`${PROVIDER_CFG[booking.payment_provider].cls} border text-xs`}>
                  {PROVIDER_CFG[booking.payment_provider].label}
                </Badge>
              )}
              {booking.checked_in && (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border flex items-center gap-1">
                  <UserCheck className="h-3 w-3" /> Checked In
                </Badge>
              )}
            </div>

            <Separator />

            {/* Attendee */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Attendee</p>
              <div className="space-y-1.5">
                <div className="font-semibold">{booking.name}</div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" /> {booking.email}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" /> {booking.phone}
                </div>
                {booking.message && (
                  <div className="text-sm text-muted-foreground italic">"{booking.message}"</div>
                )}
              </div>
            </div>

            <Separator />

            {/* Event */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Event</p>
              <div className="space-y-1 text-sm">
                <div className="font-medium">{booking.event_title}</div>
                <div className="text-muted-foreground">
                  Category: <span className="text-foreground">{booking.price_category_name}</span>
                </div>
                <div className="text-muted-foreground">
                  Price: <span className="text-foreground font-medium">
                    {booking.base_currency} {((booking.base_amount || 0) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment info */}
            {paymentInfo && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Payment</p>
                  <div className="space-y-1 text-sm">
                    {[
                      ['Provider', <span className="capitalize">{paymentInfo.provider}</span>],
                      ['Amount', `${paymentInfo.currency} ${((paymentInfo.amount || 0) / 100).toFixed(2)}`],
                      ['Status', paymentInfo.status],
                      ['Order ID', paymentInfo.order_id ? <span className="font-mono text-xs">{paymentInfo.order_id}</span> : null],
                      ['PIDX', paymentInfo.pidx ? <span className="font-mono text-xs">{paymentInfo.pidx}</span> : null],
                      ['Verified', paymentInfo.verified_via_api ? '✅ Yes' : '❌ No'],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={String(k)} className="flex justify-between gap-2">
                        <span className="text-muted-foreground flex-shrink-0">{String(k)}</span>
                        <span className="text-right">{v as React.ReactNode}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />
            <div className="text-xs text-muted-foreground">
              Booked: {new Date(booking.created_at).toLocaleString()}
            </div>

            {(booking.status === 'paid' || booking.status === 'confirmed') && !booking.checked_in && (
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={() => { onCheckIn(booking._id); onClose(); }}
              >
                <UserCheck className="mr-2 h-4 w-4" /> Check In Attendee
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Quick Ticket Verifier ─────────────────────────────────

function QuickTicketVerifier({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ booking: EventBooking; alreadyIn: boolean } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const reset = () => { setCode(''); setResult(null); setError(''); };

  const lookup = async () => {
    if (!code.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await eventBookingsApi.getByTicketCode(code.trim().toUpperCase());
      setResult({ booking: res.data.booking, alreadyIn: false });
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Ticket not found');
    } finally { setLoading(false); }
  };

  const doCheckIn = async () => {
    if (!result) return;
    setLoading(true);
    try {
      const res = await eventBookingsApi.checkIn(result.booking._id);
      if (res.data.already_checked_in) {
        setResult({ ...result, alreadyIn: true });
        toast({ title: 'Already checked in', description: 'This ticket was already used.', variant: 'destructive' });
      } else {
        queryClient.invalidateQueries({ queryKey: ['event-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['event-booking-stats'] });
        setResult({ booking: { ...result.booking, checked_in: true }, alreadyIn: false });
        toast({ title: '✅ Checked in!', description: `${result.booking.name} — ${result.booking.event_title}` });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.detail || 'Check-in failed', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-pink-500" /> Verify Ticket
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Enter the ticket code to look up an attendee and check them in.</p>

          <div className="flex gap-2">
            <Input
              placeholder="EVT-XXXXXXXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && lookup()}
              className="font-mono"
            />
            <Button onClick={lookup} disabled={loading || !code.trim()}>
              {loading ? '…' : 'Lookup'}
            </Button>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">
              <XCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          {result && (
            <div className={`rounded-xl border p-4 space-y-3 ${
              result.booking.checked_in
                ? 'bg-amber-50 border-amber-200'
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className="flex items-center gap-2">
                {result.booking.checked_in
                  ? <AlertCircle className="h-5 w-5 text-amber-600" />
                  : <CheckCircle className="h-5 w-5 text-emerald-600" />}
                <span className={`font-semibold text-sm ${result.booking.checked_in ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {result.booking.checked_in ? 'Already Checked In' : '✅ Valid Ticket'}
                </span>
              </div>

              <div className="space-y-0.5 text-sm">
                <div className="font-semibold">{result.booking.name}</div>
                <div className="text-muted-foreground">{result.booking.event_title}</div>
                <div className="text-muted-foreground text-xs">Category: {result.booking.price_category_name}</div>
                <div className="font-mono text-xs text-muted-foreground">{result.booking.ticket_code}</div>
              </div>

              {!result.booking.checked_in && (
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={doCheckIn}
                  disabled={loading}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  {loading ? 'Checking in…' : 'Mark as Checked In'}
                </Button>
              )}
            </div>
          )}

          {result && (
            <Button variant="ghost" size="sm" className="w-full" onClick={reset}>
              Verify Another Ticket
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ─────────────────────────────────────────────

const EventBookings = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [verifierOpen, setVerifierOpen] = useState(false);
  const [checkInConfirm, setCheckInConfirm] = useState<string | null>(null);
  const LIMIT = 20;

  // Bookings list
  const { data: bookingsData, isLoading, refetch } = useQuery({
    queryKey: ['event-bookings', page, statusFilter, eventFilter, search],
    queryFn: () =>
      eventBookingsApi.getAll({
        page,
        limit: LIMIT,
        status: statusFilter === 'all' ? undefined : statusFilter,
        event_id: eventFilter || undefined,
        search: search || undefined,
      }),
    select: (r) => r.data,
  });

  // Stats
  const { data: statsData } = useQuery({
    queryKey: ['event-booking-stats'],
    queryFn: () => eventBookingsApi.getStats(),
    select: (r) => r.data.stats,
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (id: string) => eventBookingsApi.checkIn(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['event-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['event-booking-stats'] });
      queryClient.invalidateQueries({ queryKey: ['event-booking-detail'] });
      if (res.data.already_checked_in) {
        toast({ title: 'Already checked in', description: 'Attendee was already checked in.', variant: 'destructive' });
      } else {
        toast({ title: '✅ Checked in!', description: `${res.data.attendee_name} has been checked in.` });
      }
      setCheckInConfirm(null);
    },
    onError: (e: any) => {
      toast({ title: 'Error', description: e.response?.data?.detail || 'Check-in failed', variant: 'destructive' });
      setCheckInConfirm(null);
    },
  });

  const bookings: EventBooking[] = bookingsData?.bookings || [];
  const total = bookingsData?.total || 0;
  const totalPages = bookingsData?.total_pages || 1;
  const byStatus = statsData?.by_status || {};
  const checkedIn = statsData?.checked_in || 0;
  const totalPaid = (byStatus['paid'] || 0) + (byStatus['confirmed'] || 0);

  return (
    <div className="w-full px-3 sm:px-4 py-3 sm:py-6 space-y-4 md:space-y-6 max-w-full overflow-x-hidden">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Event Bookings</h1>
          <p className="text-sm text-muted-foreground">Manage attendees · verify tickets · check-in</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button size="sm" className="bg-pink-600 hover:bg-pink-700" onClick={() => setVerifierOpen(true)}>
            <QrCode className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Verify Ticket</span>
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Total',      value: statsData?.total || 0,         icon: <Ticket className="h-6 w-6 text-pink-500" />,    cls: '' },
          { label: 'Paid',       value: totalPaid,                      icon: <CheckCircle className="h-6 w-6 text-emerald-500" />, cls: 'text-emerald-600' },
          { label: 'Checked In', value: checkedIn,                      icon: <UserCheck className="h-6 w-6 text-blue-500" />, cls: 'text-blue-600' },
          { label: 'Cancelled',  value: byStatus['cancelled'] || 0,     icon: <XCircle className="h-6 w-6 text-red-500" />,   cls: 'text-red-600' },
        ].map(({ label, value, icon, cls }) => (
          <Card key={label}>
            <CardContent className="pt-4 sm:pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <h3 className={`text-xl sm:text-2xl font-bold ${cls}`}>{value}</h3>
                </div>
                {icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filters ── */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Name, email, phone, ticket…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending_payment">Pending Payment</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by Event ID (optional)"
              value={eventFilter}
              onChange={(e) => { setEventFilter(e.target.value); setPage(1); }}
            />
            <Button variant="outline" onClick={() => { setSearch(''); setStatusFilter('all'); setEventFilter(''); setPage(1); }}>
              <X className="h-4 w-4 mr-2" /> Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Table ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center justify-between">
            <span>Bookings</span>
            <span className="text-sm font-normal text-muted-foreground">
              {total} total · page {page}/{totalPages}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">

          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>
                ) : bookings.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-10 text-muted-foreground">No bookings found</TableCell></TableRow>
                ) : bookings.map((b) => (
                  <TableRow key={b._id} className="hover:bg-muted/30">
                    <TableCell className="p-3">
                      <div className="font-medium text-sm">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{b.email}</div>
                      <div className="text-xs text-muted-foreground">{b.phone}</div>
                    </TableCell>
                    <TableCell className="p-3 max-w-[160px]">
                      <div className="text-sm line-clamp-2">{b.event_title}</div>
                    </TableCell>
                    <TableCell className="p-3">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{b.price_category_name}</span>
                    </TableCell>
                    <TableCell className="p-3">
                      {b.ticket_code
                        ? <span className="font-mono text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded">{b.ticket_code}</span>
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="p-3">
                      {STATUS_CFG[b.status]
                        ? <Badge className={`${STATUS_CFG[b.status].cls} border flex items-center gap-1 w-fit text-xs`}>
                            {STATUS_CFG[b.status].icon} {STATUS_CFG[b.status].label}
                          </Badge>
                        : <span className="text-xs">{b.status}</span>}
                    </TableCell>
                    <TableCell className="p-3">
                      {b.payment_provider && PROVIDER_CFG[b.payment_provider]
                        ? <Badge className={`${PROVIDER_CFG[b.payment_provider].cls} border text-xs`}>{PROVIDER_CFG[b.payment_provider].label}</Badge>
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="p-3">
                      {b.checked_in
                        ? <div className="flex items-center gap-1 text-emerald-600 text-xs"><UserCheck className="h-3.5 w-3.5" /> Done</div>
                        : (b.status === 'paid' || b.status === 'confirmed')
                          ? <Button size="sm" variant="outline"
                              className="h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                              onClick={() => setCheckInConfirm(b._id)}>
                              Check In
                            </Button>
                          : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(b.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="p-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedId(b._id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3 p-3">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading…</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No bookings found</div>
            ) : bookings.map((b) => (
              <Card key={b._id}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{b.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{b.email}</div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 flex-shrink-0" onClick={() => setSelectedId(b._id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground mb-2 line-clamp-1">{b.event_title}</div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {STATUS_CFG[b.status] && (
                      <Badge className={`${STATUS_CFG[b.status].cls} border flex items-center gap-1 text-xs`}>
                        {STATUS_CFG[b.status].icon} {STATUS_CFG[b.status].label}
                      </Badge>
                    )}
                    {b.payment_provider && PROVIDER_CFG[b.payment_provider] && (
                      <Badge className={`${PROVIDER_CFG[b.payment_provider].cls} border text-xs`}>
                        {PROVIDER_CFG[b.payment_provider].label}
                      </Badge>
                    )}
                    {b.checked_in && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border text-xs flex items-center gap-1">
                        <UserCheck className="h-3 w-3" /> In
                      </Badge>
                    )}
                  </div>

                  {b.ticket_code && (
                    <div className="font-mono text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded mb-2">{b.ticket_code}</div>
                  )}

                  {!b.checked_in && (b.status === 'paid' || b.status === 'confirmed') && (
                    <Button size="sm" className="w-full h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => setCheckInConfirm(b._id)}>
                      <UserCheck className="mr-1 h-3.5 w-3.5" /> Check In
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-xs text-muted-foreground">
                {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Modals ── */}
      <BookingDetailModal
        bookingId={selectedId}
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        onCheckIn={(id) => setCheckInConfirm(id)}
      />

      <QuickTicketVerifier open={verifierOpen} onClose={() => setVerifierOpen(false)} />

      <AlertDialog open={!!checkInConfirm} onOpenChange={(o) => !o && setCheckInConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Check-In</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the attendee as checked in at the event. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => checkInConfirm && checkInMutation.mutate(checkInConfirm)}
              disabled={checkInMutation.isPending}
            >
              {checkInMutation.isPending ? 'Checking in…' : 'Yes, Check In'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventBookings;