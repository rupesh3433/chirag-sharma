import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Calendar, MapPin, Users, Image as ImageIcon,
  Edit, Share2, Ticket, UserCheck, CheckCircle, Clock,
  XCircle, AlertCircle, QrCode, ChevronLeft, ChevronRight,
  Eye, Copy, Check, Mail, Phone,
} from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';
import { Separator } from '@shared/components/ui/separator';
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
import { Input } from '@shared/components/ui/input';
import { toast } from '@shared/hooks/use-toast';
import { eventsApi, eventBookingsApi } from '../services/api';
import { EventBooking } from '../types';

// ─── Shared status/provider maps ──────────────────────────

const STATUS_CFG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  paid:            { label: 'Paid',      cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <CheckCircle className="h-3 w-3" /> },
  confirmed:       { label: 'Confirmed', cls: 'bg-blue-100 text-blue-800 border-blue-200',          icon: <CheckCircle className="h-3 w-3" /> },
  pending_payment: { label: 'Pending',   cls: 'bg-amber-100 text-amber-800 border-amber-200',       icon: <Clock className="h-3 w-3" /> },
  cancelled:       { label: 'Cancelled', cls: 'bg-red-100 text-red-800 border-red-200',             icon: <XCircle className="h-3 w-3" /> },
  refunded:        { label: 'Refunded',  cls: 'bg-purple-100 text-purple-800 border-purple-200',    icon: <AlertCircle className="h-3 w-3" /> },
};

const PROVIDER_CFG: Record<string, { label: string; cls: string }> = {
  razorpay: { label: 'Razorpay', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  khalti:   { label: 'Khalti',   cls: 'bg-purple-50 text-purple-700 border-purple-200' },
};

const EVENT_STATUS_CFG: Record<string, string> = {
  published: 'bg-green-100 text-green-800',
  draft:     'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

// ─── Ticket verifier modal (event-scoped) ─────────────────

function TicketVerifierModal({ open, onClose, eventId }: { open: boolean; onClose: () => void; eventId: string }) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ booking: EventBooking } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const reset = () => { setCode(''); setResult(null); setError(''); };

  const lookup = async () => {
    if (!code.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await eventBookingsApi.getByTicketCode(code.trim().toUpperCase());
      const b: EventBooking = res.data.booking;
      if (b.event_id !== eventId) {
        setError('This ticket belongs to a different event.');
      } else {
        setResult({ booking: b });
      }
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Ticket not found');
    } finally { setLoading(false); }
  };

  const doCheckIn = async () => {
    if (!result) return;
    setLoading(true);
    try {
      const res = await eventBookingsApi.checkIn(result.booking._id);
      queryClient.invalidateQueries({ queryKey: ['event-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['event-booking-stats'] });
      if (res.data.already_checked_in) {
        toast({ title: 'Already checked in', variant: 'destructive' });
        setResult({ booking: { ...result.booking, checked_in: true } });
      } else {
        setResult({ booking: { ...result.booking, checked_in: true } });
        toast({ title: '✅ Checked in!', description: `${result.booking.name}` });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.detail || 'Failed', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-pink-500" /> Verify Ticket (This Event)
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="EVT-XXXXXXXXXX" value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && lookup()}
              className="font-mono" />
            <Button onClick={lookup} disabled={loading || !code.trim()}>{loading ? '…' : 'Lookup'}</Button>
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
          )}
          {result && (
            <div className={`rounded-xl border p-4 space-y-3 ${result.booking.checked_in ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className="flex items-center gap-2">
                {result.booking.checked_in
                  ? <AlertCircle className="h-5 w-5 text-amber-600" />
                  : <CheckCircle className="h-5 w-5 text-emerald-600" />}
                <span className={`font-semibold text-sm ${result.booking.checked_in ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {result.booking.checked_in ? 'Already Checked In' : '✅ Valid Ticket'}
                </span>
              </div>
              <div className="text-sm space-y-0.5">
                <div className="font-semibold">{result.booking.name}</div>
                <div className="text-muted-foreground text-xs">Category: {result.booking.price_category_name}</div>
                <div className="font-mono text-xs text-muted-foreground">{result.booking.ticket_code}</div>
              </div>
              {!result.booking.checked_in && (
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={doCheckIn} disabled={loading}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  {loading ? 'Checking in…' : 'Mark as Checked In'}
                </Button>
              )}
              <Button variant="ghost" size="sm" className="w-full" onClick={reset}>Check another</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Booking mini-detail modal (reused from EventBookings) ─

function MiniBookingDetail({ bookingId, open, onClose, onCheckIn }: {
  bookingId: string | null; open: boolean; onClose: () => void; onCheckIn: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['event-booking-detail', bookingId],
    queryFn: () => eventBookingsApi.getById(bookingId!),
    enabled: !!bookingId && open,
    select: (r) => r.data,
  });
  const booking: EventBooking | undefined = data?.booking;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-pink-500" /> Booking Details
          </DialogTitle>
        </DialogHeader>
        {isLoading ? <div className="py-6 text-center text-muted-foreground">Loading…</div>
          : !booking ? <div className="py-6 text-center text-muted-foreground">Not found</div>
          : (
            <div className="space-y-4">
              {booking.ticket_code && (
                <div className="rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Ticket Code</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-base tracking-widest text-pink-700 break-all">{booking.ticket_code}</span>
                    <Button size="sm" variant="ghost" onClick={() => {
                      navigator.clipboard.writeText(booking.ticket_code!);
                      setCopied(true); setTimeout(() => setCopied(false), 2000);
                    }}>
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {STATUS_CFG[booking.status] && (
                  <Badge className={`${STATUS_CFG[booking.status].cls} border flex items-center gap-1 text-xs`}>
                    {STATUS_CFG[booking.status].icon} {STATUS_CFG[booking.status].label}
                  </Badge>
                )}
                {booking.checked_in && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border flex items-center gap-1 text-xs">
                    <UserCheck className="h-3 w-3" /> Checked In
                  </Badge>
                )}
              </div>
              <Separator />
              <div className="text-sm space-y-1">
                <div className="font-semibold">{booking.name}</div>
                <div className="flex items-center gap-1.5 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{booking.email}</div>
                <div className="flex items-center gap-1.5 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{booking.phone}</div>
              </div>
              <div className="text-xs text-muted-foreground">Category: {booking.price_category_name}</div>
              {(booking.status === 'paid' || booking.status === 'confirmed') && !booking.checked_in && (
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" size="sm"
                  onClick={() => { onCheckIn(booking._id); onClose(); }}>
                  <UserCheck className="mr-2 h-4 w-4" /> Check In
                </Button>
              )}
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Bookings tab for EventDetail ─────────────────────────

function EventBookingsTab({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checkInConfirm, setCheckInConfirm] = useState<string | null>(null);
  const [verifierOpen, setVerifierOpen] = useState(false);
  const LIMIT = 15;

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['event-bookings', page, 'all', eventId, ''],
    queryFn: () => eventBookingsApi.getAll({ page, limit: LIMIT, event_id: eventId }),
    select: (r) => r.data,
  });

  const { data: statsData } = useQuery({
    queryKey: ['event-booking-stats', eventId],
    queryFn: () => eventBookingsApi.getStats(eventId),
    select: (r) => r.data.stats,
  });

  const checkInMutation = useMutation({
    mutationFn: (id: string) => eventBookingsApi.checkIn(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['event-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['event-booking-stats'] });
      queryClient.invalidateQueries({ queryKey: ['event-booking-detail'] });
      toast({ title: res.data.already_checked_in ? 'Already checked in' : '✅ Checked in!',
        description: res.data.attendee_name,
        variant: res.data.already_checked_in ? 'destructive' : 'default' });
      setCheckInConfirm(null);
    },
    onError: (e: any) => {
      toast({ title: 'Error', description: e.response?.data?.detail || 'Failed', variant: 'destructive' });
      setCheckInConfirm(null);
    },
  });

  const bookings: EventBooking[] = bookingsData?.bookings || [];
  const total = bookingsData?.total || 0;
  const totalPages = bookingsData?.total_pages || 1;
  const byStatus = statsData?.by_status || {};
  const checkedIn = statsData?.checked_in || 0;

  return (
    <div className="space-y-4">
      {/* Mini stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Total', value: statsData?.total || 0, cls: '' },
          { label: 'Paid', value: (byStatus['paid'] || 0) + (byStatus['confirmed'] || 0), cls: 'text-emerald-600' },
          { label: 'Checked In', value: checkedIn, cls: 'text-blue-600' },
          { label: 'Cancelled', value: byStatus['cancelled'] || 0, cls: 'text-red-600' },
        ].map(({ label, value, cls }) => (
          <Card key={label}>
            <CardContent className="pt-3 pb-3">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className={`text-xl font-bold ${cls}`}>{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          Attendees · {total} total
        </h3>
        <Button size="sm" className="bg-pink-600 hover:bg-pink-700" onClick={() => setVerifierOpen(true)}>
          <QrCode className="h-4 w-4 mr-2" /> Verify Ticket
        </Button>
      </div>

      {/* Table */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Attendee</TableHead>
              <TableHead>Ticket</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead className="text-right">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : bookings.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No bookings yet</TableCell></TableRow>
            ) : bookings.map((b) => (
              <TableRow key={b._id} className="hover:bg-muted/30">
                <TableCell className="p-3">
                  <div className="font-medium text-sm">{b.name}</div>
                  <div className="text-xs text-muted-foreground">{b.phone}</div>
                </TableCell>
                <TableCell className="p-3">
                  {b.ticket_code
                    ? <span className="font-mono text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded">{b.ticket_code}</span>
                    : <span className="text-xs text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="p-3">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{b.price_category_name}</span>
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

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {isLoading ? <div className="text-center py-6 text-muted-foreground">Loading…</div>
          : bookings.length === 0 ? <div className="text-center py-6 text-muted-foreground">No bookings yet</div>
          : bookings.map((b) => (
            <Card key={b._id}>
              <CardContent className="p-3">
                <div className="flex justify-between gap-2 mb-1">
                  <div className="font-semibold text-sm">{b.name}</div>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setSelectedId(b._id)}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {STATUS_CFG[b.status] && (
                    <Badge className={`${STATUS_CFG[b.status].cls} border text-xs flex items-center gap-1`}>
                      {STATUS_CFG[b.status].icon} {STATUS_CFG[b.status].label}
                    </Badge>
                  )}
                  {b.checked_in && (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border text-xs">✅ In</Badge>
                  )}
                </div>
                {b.ticket_code && (
                  <div className="font-mono text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded mb-2">{b.ticket_code}</div>
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
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</span>
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

      {/* Modals */}
      <MiniBookingDetail bookingId={selectedId} open={!!selectedId}
        onClose={() => setSelectedId(null)} onCheckIn={(id) => setCheckInConfirm(id)} />

      <TicketVerifierModal open={verifierOpen} onClose={() => setVerifierOpen(false)} eventId={eventId} />

      <AlertDialog open={!!checkInConfirm} onOpenChange={(o) => !o && setCheckInConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Check-In</AlertDialogTitle>
            <AlertDialogDescription>Mark attendee as checked in? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => checkInConfirm && checkInMutation.mutate(checkInConfirm)}
              disabled={checkInMutation.isPending}>
              {checkInMutation.isPending ? 'Checking in…' : 'Yes, Check In'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Main EventDetail page ─────────────────────────────────

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState<'details' | 'bookings'>('details');

  const { data: eventResponse, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getById(id!),
    enabled: !!id,
    select: (r) => r.data,
  });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  if (isLoading) return <div className="flex justify-center p-8">Loading event…</div>;
  if (error || !eventResponse) return <div className="text-red-600 p-8">Event not found</div>;

  const event = eventResponse;
  const allImages = [event.main_poster_url, ...(event.gallery_images || [])].filter(Boolean);

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-4 max-w-full overflow-x-hidden">

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/events')} className="flex-shrink-0">
            <ArrowLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" onClick={() => navigate(`/admin/events/edit/${event._id}`)}>
              <Edit className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          </div>
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight break-words mb-2">{event.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${EVENT_STATUS_CFG[event.status] || 'bg-gray-100 text-gray-800'} text-xs`}>{event.status}</Badge>
            <Badge variant="outline" className={`text-xs ${event.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
              {event.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(['details', 'bookings'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}>
            {t === 'bookings' ? <span className="flex items-center gap-1.5"><Ticket className="h-3.5 w-3.5" />Bookings</span> : 'Details'}
          </button>
        ))}
      </div>

      {/* ── Details tab ── */}
      {tab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Main image */}
            <Card>
              <CardContent className="p-3 sm:p-4 md:p-6">
                {allImages.length > 0 ? (
                  <div className="w-full bg-gray-50 rounded-lg overflow-hidden">
                    <img src={allImages[activeImage]} alt={event.title}
                      className="w-full h-auto object-contain mx-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px]" />
                  </div>
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                    <ImageIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                {allImages.length > 1 && (
                  <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 gap-2">
                    {allImages.map((img, i) => (
                      <button key={i} onClick={() => setActiveImage(i)}
                        className={`aspect-square rounded-md overflow-hidden bg-gray-100 p-0.5 transition-all ${
                          activeImage === i ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-gray-300'
                        }`}>
                        <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base sm:text-lg">Description</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <p className="whitespace-pre-line text-sm leading-relaxed">{event.bio}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base sm:text-lg">Event Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Date & Time</div>
                    <div className="text-xs text-muted-foreground">{formatDate(event.date_from)} – {formatDate(event.date_to)}</div>
                    <div className="text-xs">{event.time_from} – {event.time_to}</div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Location</div>
                    <div className="text-xs break-words">{event.location}</div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Total Seats</div>
                    <div className="text-xs">{event.total_seats}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base sm:text-lg">Price Categories</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-2">
                {event.price_details?.map((cat, i) => (
                  <div key={i} className="flex justify-between items-start gap-3 p-2 border rounded-lg">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm break-words">{cat.name}</div>
                      {cat.description && <div className="text-xs text-muted-foreground">{cat.description}</div>}
                      {cat.available_seats !== undefined && (
                        <div className="text-xs text-muted-foreground">{cat.available_seats} seats left</div>
                      )}
                    </div>
                    <div className="text-lg font-bold flex-shrink-0">₹{cat.price}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base sm:text-lg">Metadata</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-xs pt-0">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Created By</span>
                  <span className="break-words text-right">{event.created_by}</span>
                </div>
                <Separator />
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Created At</span>
                  <span>{new Date(event.created_at).toLocaleDateString()}</span>
                </div>
                {event.updated_at && (
                  <>
                    <Separator />
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Updated At</span>
                      <span>{new Date(event.updated_at).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── Bookings tab ── */}
      {tab === 'bookings' && id && <EventBookingsTab eventId={id} />}
    </div>
  );
};

export default EventDetail;