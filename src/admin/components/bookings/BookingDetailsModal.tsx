import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  MessageSquare,
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Wallet,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Textarea } from '@shared/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@shared/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';
import StatusBadge from './StatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';
import { Booking, PaymentDetails, PaymentProvider } from '../../types';
import { bookingsApi } from '../../services/api';
import { useToast } from '@/shared/hooks/use-toast';

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (bookingId: string, newStatus: string) => void;
  onRefresh?: () => void;
}

// ============================================================
// PROVIDER BADGE
// ============================================================

const ProviderBadge = ({ provider }: { provider: PaymentProvider }) => {
  if (!provider) return null;
  const isKhalti = provider === 'khalti';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        isKhalti ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
      }`}
    >
      {isKhalti ? <Wallet className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
      {isKhalti ? 'Khalti (NPR)' : 'Razorpay (INR)'}
    </span>
  );
};

// ============================================================
// CURRENCY-AWARE FORMATTER
// ============================================================

const formatAmount = (
  amount: number | null | undefined,
  currency: string | null | undefined
): string => {
  if (!amount) return '—';
  const val = (amount / 100).toFixed(2);
  if (currency === 'NPR') return `NPR ${val}`;
  return `₹${val}`;
};

// ============================================================
// BOOKING DETAILS MODAL
// ============================================================

const BookingDetailsModal = ({
  booking,
  isOpen,
  onClose,
  onStatusUpdate,
  onRefresh,
}: BookingDetailsModalProps) => {
  const { toast } = useToast();

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [fullBooking, setFullBooking] = useState<Booking | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentDetails[]>([]);

  // Approval form
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentCurrency, setPaymentCurrency] = useState<'INR' | 'NPR'>('INR');
  const [isApproving, setIsApproving] = useState(false);

  // Refund form
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundMobile, setRefundMobile] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);

  // Cancel/Complete dialog
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [targetStatus, setTargetStatus] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Load full booking details when modal opens
  useEffect(() => {
    if (isOpen && booking) {
      loadFullBookingDetails();
    } else {
      setFullBooking(null);
      setPaymentHistory([]);
      setShowApprovalForm(false);
      setPaymentAmount('');
      setPaymentCurrency('INR');
    }
  }, [isOpen, booking]);

  const loadFullBookingDetails = async () => {
    if (!booking) return;
    setIsLoading(true);
    try {
      const [bookingRes, historyRes] = await Promise.all([
        bookingsApi.getById(booking._id),
        bookingsApi
          .getPaymentHistory(booking._id)
          .catch(() => ({ data: { payments: [] } })),
      ]);
      setFullBooking(bookingRes.data.booking);
      setPaymentHistory(historyRes.data.payments || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load booking details.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // APPROVE — sends amount + currency in request body
  // ============================================================

  const handleApprove = async () => {
    if (!fullBooking) return;

    const amountFloat = parseFloat(paymentAmount);
    if (!paymentAmount || isNaN(amountFloat) || amountFloat <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid payment amount.',
        variant: 'destructive',
      });
      return;
    }

    if (!paymentCurrency) {
      toast({
        title: 'Validation Error',
        description: 'Please select a currency (INR or NPR).',
        variant: 'destructive',
      });
      return;
    }

    // Convert to smallest unit (paise / paisa)
    const amountInSmallestUnit = Math.round(amountFloat * 100);

    setIsApproving(true);
    try {
      await bookingsApi.updateStatus(fullBooking._id, 'approved', {
        payment_amount: amountInSmallestUnit,
        payment_currency: paymentCurrency,
      });
      toast({
        title: 'Booking Approved ✅',
        description: `Payment link (${paymentCurrency} ${amountFloat.toFixed(2)}) sent to customer via WhatsApp. Customer selects Razorpay or Khalti.`,
      });
      onStatusUpdate(fullBooking._id, 'approved');
      onRefresh?.();
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Approval Failed',
        description: err.response?.data?.detail || 'Failed to approve booking.',
        variant: 'destructive',
      });
    } finally {
      setIsApproving(false);
    }
  };

  // ============================================================
  // REFUND
  // ============================================================

  const handleRefund = async () => {
    if (!fullBooking || !fullBooking.payment_details) return;

    const amountInSmallestUnit = refundAmount
      ? Math.round(parseFloat(refundAmount) * 100)
      : undefined;

    if (amountInSmallestUnit !== undefined && amountInSmallestUnit <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid refund amount.',
        variant: 'destructive',
      });
      return;
    }

    if (!refundReason.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a refund reason.',
        variant: 'destructive',
      });
      return;
    }

    setIsRefunding(true);
    try {
      await bookingsApi.refund(
        fullBooking._id,
        amountInSmallestUnit,
        refundReason,
        refundMobile || undefined
      );

      toast({
        title: 'Refund Processed',
        description: amountInSmallestUnit ? 'Partial refund completed.' : 'Full refund completed.',
      });

      onRefresh?.();
      loadFullBookingDetails();
      setShowRefundDialog(false);
      setRefundAmount('');
      setRefundReason('');
      setRefundMobile('');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Refund Failed',
        description: err.response?.data?.detail || 'Failed to process refund.',
        variant: 'destructive',
      });
    } finally {
      setIsRefunding(false);
    }
  };

  // ============================================================
  // STATUS CHANGE
  // ============================================================

  const handleStatusChange = async () => {
    if (!fullBooking || !targetStatus) return;
    setIsUpdatingStatus(true);
    try {
      await bookingsApi.updateStatus(fullBooking._id, targetStatus);
      toast({
        title: 'Status Updated',
        description: `Booking status changed to ${targetStatus}.`,
      });
      onStatusUpdate(fullBooking._id, targetStatus);
      onRefresh?.();
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Update Failed',
        description: err.response?.data?.detail || 'Failed to update status.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStatus(false);
      setShowStatusDialog(false);
      setTargetStatus(null);
    }
  };

  const initiateStatusChange = (status: string) => {
    setTargetStatus(status);
    setShowStatusDialog(true);
  };

  if (!booking) return null;

  const displayBooking = fullBooking || booking;
  const currentStatus = displayBooking.status;
  const paymentStatus = displayBooking.payment_status;
  const paymentDetails = displayBooking.payment_details;
  const provider = paymentDetails?.provider ?? displayBooking.payment_provider ?? null;
  const isKhalti = provider === 'khalti';
  const currency = paymentDetails?.currency ?? displayBooking.payment_currency ?? (isKhalti ? 'NPR' : 'INR');

  // Refund math
  const totalPaid = paymentDetails?.amount || 0;
  const alreadyRefunded = paymentDetails?.amount_refunded || 0;
  const refundableAmount = totalPaid - alreadyRefunded;

  // Business rules
  const canApprove = currentStatus === 'pending';
  const canCancel = currentStatus !== 'cancelled' && currentStatus !== 'completed';
  const canComplete = currentStatus === 'confirmed';
  const canRefund = paymentStatus === 'paid' && refundableAmount > 0;
  const isPaid = paymentStatus === 'paid';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Booking Details</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadFullBookingDetails}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">

              {/* ================================================ */}
              {/* STATUS SECTION                                      */}
              {/* ================================================ */}
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Booking:</span>
                    <StatusBadge status={currentStatus} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Payment:</span>
                    <PaymentStatusBadge status={paymentStatus} />
                    {provider && <ProviderBadge provider={provider} />}
                  </div>
                  {/* Show admin-set base amount/currency if approved but not yet paid */}
                  {currentStatus === 'approved' && displayBooking.payment_amount && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Base amount:</span>
                      <span className="font-medium">
                        {formatAmount(displayBooking.payment_amount, displayBooking.payment_currency)}
                      </span>
                      <span className="text-xs">
                        (customer selects provider)
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>ID: #{displayBooking._id.slice(-6).toUpperCase()}</div>
                  <div>
                    Created:{' '}
                    {format(new Date(displayBooking.created_at), 'MMM d, yyyy HH:mm')}
                  </div>
                </div>
              </div>

              {/* ================================================ */}
              {/* CUSTOMER INFORMATION                                */}
              {/* ================================================ */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Name" value={displayBooking.name} />
                  <Field
                    label="Email"
                    icon={<Mail className="h-3.5 w-3.5" />}
                    value={displayBooking.email}
                    mono
                  />
                  <Field
                    label="Phone"
                    icon={<Phone className="h-3.5 w-3.5" />}
                    value={displayBooking.phone}
                  />
                  <Field label="Phone Country" value={displayBooking.phone_country} />
                </div>
              </div>

              {/* ================================================ */}
              {/* SERVICE DETAILS                                     */}
              {/* ================================================ */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Service Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Service" value={displayBooking.service} />
                  <Field label="Package" value={displayBooking.package} />
                  <Field
                    label="Date"
                    icon={<Calendar className="h-3.5 w-3.5" />}
                    value={displayBooking.date}
                  />
                  <Field label="Service Country" value={displayBooking.service_country} />
                  <div className="col-span-2">
                    <Field
                      label="Address"
                      icon={<MapPin className="h-3.5 w-3.5" />}
                      value={`${displayBooking.address}, ${displayBooking.pincode}`}
                    />
                  </div>
                  {displayBooking.message && (
                    <div className="col-span-2">
                      <Field
                        label="Message"
                        icon={<MessageSquare className="h-3.5 w-3.5" />}
                        value={displayBooking.message}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ================================================ */}
              {/* PAYMENT INFORMATION                                 */}
              {/* ================================================ */}
              {(paymentDetails || displayBooking.payment_order_id || displayBooking.payment_pidx) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                    {provider && (
                      <span className="ml-1">
                        <ProviderBadge provider={provider} />
                      </span>
                    )}
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    {paymentDetails ? (
                      <>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Order ID:</span>
                            <p className="font-mono font-medium break-all text-xs">
                              {paymentDetails.order_id}
                            </p>
                          </div>

                          {isKhalti && paymentDetails.pidx && (
                            <div>
                              <span className="text-muted-foreground">PIDX:</span>
                              <p className="font-mono font-medium break-all text-xs">
                                {paymentDetails.pidx}
                              </p>
                            </div>
                          )}

                          {paymentDetails.payment_id && (
                            <div>
                              <span className="text-muted-foreground">
                                {isKhalti ? 'Transaction ID:' : 'Payment ID:'}
                              </span>
                              <p className="font-mono font-medium break-all text-xs">
                                {paymentDetails.payment_id}
                              </p>
                            </div>
                          )}

                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <p className="font-medium">
                              {formatAmount(paymentDetails.amount, currency)}
                            </p>
                          </div>

                          {paymentDetails.method && (
                            <div>
                              <span className="text-muted-foreground">Method:</span>
                              <p className="font-medium capitalize">{paymentDetails.method}</p>
                            </div>
                          )}

                          {paymentDetails.fee != null && paymentDetails.fee > 0 && (
                            <div>
                              <span className="text-muted-foreground">Fee:</span>
                              <p className="font-medium">
                                {formatAmount(paymentDetails.fee, currency)}
                              </p>
                            </div>
                          )}

                          {paymentDetails.amount_refunded != null &&
                            paymentDetails.amount_refunded > 0 && (
                              <div>
                                <span className="text-muted-foreground">Refunded:</span>
                                <p className="font-medium text-destructive">
                                  {formatAmount(paymentDetails.amount_refunded, currency)}
                                </p>
                              </div>
                            )}
                        </div>

                        {paymentDetails.verified_via_api && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>Verified via API</span>
                          </div>
                        )}

                        {paymentDetails.fraud_flag && (
                          <div className="flex items-center gap-2 text-sm text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Fraud flag detected</span>
                          </div>
                        )}

                        {paymentDetails.failure_reason && (
                          <div className="text-sm text-destructive">
                            <span className="font-medium">Failure reason: </span>
                            {paymentDetails.failure_reason}
                          </div>
                        )}

                        {isKhalti &&
                          paymentDetails.payment_url &&
                          paymentStatus === 'payment_pending' && (
                            <div className="flex items-center gap-2 text-sm">
                              <ExternalLink className="h-4 w-4 text-purple-600" />
                              <a
                                href={paymentDetails.payment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:underline font-medium"
                              >
                                Open Khalti Checkout →
                              </a>
                            </div>
                          )}
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground space-y-1">
                        {displayBooking.payment_order_id && (
                          <div>
                            Order ID:{' '}
                            <span className="font-mono">
                              {displayBooking.payment_order_id}
                            </span>
                          </div>
                        )}
                        {displayBooking.payment_pidx && (
                          <div>
                            Khalti PIDX:{' '}
                            <span className="font-mono">
                              {displayBooking.payment_pidx}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================================================ */}
              {/* PAYMENT HISTORY TIMELINE                            */}
              {/* ================================================ */}
              {paymentHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Payment History
                  </h3>
                  <div className="space-y-2">
                    {paymentHistory.map((payment) => {
                      const pCurrency =
                        payment.currency ?? (payment.provider === 'khalti' ? 'NPR' : 'INR');
                      return (
                        <div key={payment._id} className="border rounded-lg p-3 text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <PaymentStatusBadge status={payment.status} />
                              <ProviderBadge provider={payment.provider} />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(payment.created_at), 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>Order: {payment.order_id.slice(-8)}</div>
                            {payment.payment_id && (
                              <div>
                                {payment.provider === 'khalti' ? 'Txn: ' : 'Payment: '}
                                {payment.payment_id.slice(-8)}
                              </div>
                            )}
                            {payment.pidx && (
                              <div>PIDX: {payment.pidx.slice(-8)}</div>
                            )}
                            <div>
                              Amount: {formatAmount(payment.amount, pCurrency)}
                            </div>
                          </div>
                          {payment.refunds && payment.refunds.length > 0 && (
                            <div className="mt-2 pt-2 border-t space-y-1">
                              <div className="font-medium text-xs">Refunds:</div>
                              {payment.refunds.map((refund) => (
                                <div
                                  key={refund.refund_id}
                                  className="text-xs text-muted-foreground"
                                >
                                  {formatAmount(refund.amount, pCurrency)} —{' '}
                                  {format(new Date(refund.created_at), 'MMM d, yyyy')}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ================================================ */}
              {/* APPROVAL FORM                                       */}
              {/* ================================================ */}
              {canApprove && (
                <div className="border-t pt-4">
                  {!showApprovalForm ? (
                    <Button
                      onClick={() => setShowApprovalForm(true)}
                      className="w-full"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Booking & Set Amount
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Approve Booking</h4>

                      {/* Currency + Amount row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium block">
                            Base Currency
                          </label>
                          <Select
                            value={paymentCurrency}
                            onValueChange={(v) => setPaymentCurrency(v as 'INR' | 'NPR')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INR">
                                INR — Indian Rupee (₹)
                              </SelectItem>
                              <SelectItem value="NPR">
                                NPR — Nepalese Rupee
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium block">
                            Amount ({paymentCurrency})
                          </label>
                          <Input
                            type="number"
                            placeholder={
                              paymentCurrency === 'INR'
                                ? 'e.g. 5000 for ₹5000'
                                : 'e.g. 8000 for NPR 8000'
                            }
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            min="1"
                            step="0.01"
                          />
                        </div>
                      </div>

                      {/* Preview */}
                      {paymentAmount && parseFloat(paymentAmount) > 0 && (
                        <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                          <p className="font-medium">Preview — what customer sees:</p>
                          <div className="text-muted-foreground space-y-0.5 text-xs">
                            <div>
                              💳 Razorpay: ₹
                              {paymentCurrency === 'INR'
                                ? parseFloat(paymentAmount).toFixed(2)
                                : (parseFloat(paymentAmount) / 1.6).toFixed(2)}
                            </div>
                            <div>
                              🔵 Khalti: NPR{' '}
                              {paymentCurrency === 'NPR'
                                ? parseFloat(paymentAmount).toFixed(2)
                                : (parseFloat(paymentAmount) * 1.6).toFixed(2)}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Backend converts automatically. Customer picks their preferred provider.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={handleApprove}
                          disabled={isApproving || !paymentAmount || parseFloat(paymentAmount) <= 0}
                          className="flex-1"
                        >
                          {isApproving && (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          )}
                          Approve & Send Payment Link
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowApprovalForm(false);
                            setPaymentAmount('');
                            setPaymentCurrency('INR');
                          }}
                          disabled={isApproving}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ================================================ */}
              {/* ACTION BUTTONS                                       */}
              {/* ================================================ */}
              <div className="border-t pt-4 space-y-2">
                {canComplete && (
                  <Button
                    onClick={() => initiateStatusChange('completed')}
                    variant="outline"
                    className="w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Completed
                  </Button>
                )}

                {canRefund && (
                  <Button
                    onClick={() => setShowRefundDialog(true)}
                    variant="outline"
                    className="w-full text-orange-600 hover:text-orange-700"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Process Refund (
                    {formatAmount(refundableAmount, currency)} available)
                  </Button>
                )}

                {canCancel && (
                  <Button
                    onClick={() => initiateStatusChange('cancelled')}
                    variant="outline"
                    className="w-full text-destructive hover:text-destructive"
                    disabled={isPaid}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Booking {isPaid && '(Refund Required)'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* REFUND DIALOG                                                  */}
      {/* ============================================================ */}
      <AlertDialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              Process Refund
              {provider && <ProviderBadge provider={provider} />}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <div>Total Paid: {formatAmount(totalPaid, currency)}</div>
                  <div>Already Refunded: {formatAmount(alreadyRefunded, currency)}</div>
                  <div className="font-semibold">
                    Available: {formatAmount(refundableAmount, currency)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Refund Amount — Leave empty for full refund
                  </label>
                  <Input
                    type="number"
                    placeholder={`Enter amount or leave empty for full (${currency})`}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    min="1"
                    max={refundableAmount / 100}
                    step="0.01"
                  />
                </div>

                {isKhalti && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Customer Mobile (optional — required for Khalti bank refunds)
                    </label>
                    <Input
                      type="tel"
                      placeholder="e.g. 9841234567"
                      value={refundMobile}
                      onChange={(e) => setRefundMobile(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty for Khalti wallet refund. Enter mobile for bank account refund.
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Refund Reason *
                  </label>
                  <Textarea
                    placeholder="Enter reason for refund..."
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRefunding}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRefund}
              disabled={isRefunding || !refundReason.trim()}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRefunding && (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              )}
              Process Refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ============================================================ */}
      {/* STATUS CHANGE CONFIRMATION DIALOG                              */}
      {/* ============================================================ */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {targetStatus === 'completed'
                ? 'Mark as Completed?'
                : 'Cancel Booking?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {targetStatus === 'completed'
                ? 'This will mark the booking as completed. The customer will receive a thank you message.'
                : 'This will cancel the booking. Are you sure you want to proceed?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingStatus}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              disabled={isUpdatingStatus}
              className={
                targetStatus === 'cancelled'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : ''
              }
            >
              {isUpdatingStatus && (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              )}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BookingDetailsModal;

// ============================================================
// FIELD HELPER
// ============================================================

const Field = ({
  label,
  value,
  icon,
  mono = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  mono?: boolean;
}) => (
  <div className="space-y-1">
    <p className="text-sm text-muted-foreground flex items-center gap-1">
      {icon}
      {label}
    </p>
    <p className={`font-medium break-all ${mono ? 'font-mono text-xs' : ''}`}>
      {value}
    </p>
  </div>
);