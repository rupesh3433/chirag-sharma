import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  X,
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
  Trash2,
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
import { Booking, PaymentDetails } from '../../types';
import { bookingsApi } from '../../services/api';
import { useToast } from '@/shared/hooks/use-toast';

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (bookingId: string, newStatus: string) => void;
  onRefresh?: () => void;
}

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
  const [isApproving, setIsApproving] = useState(false);
  
  // Refund form
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
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
      // Reset state when modal closes
      setFullBooking(null);
      setPaymentHistory([]);
      setShowApprovalForm(false);
      setPaymentAmount('');
    }
  }, [isOpen, booking]);

  const loadFullBookingDetails = async () => {
    if (!booking) return;

    setIsLoading(true);
    try {
      // Load booking details with payment info
      const [bookingRes, historyRes] = await Promise.all([
        bookingsApi.getById(booking._id),
        bookingsApi.getPaymentHistory(booking._id).catch(() => ({ data: { payments: [] } })),
      ]);

      setFullBooking(bookingRes.data.booking);
      setPaymentHistory(historyRes.data.payments || []);
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: 'Failed to load booking details.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!fullBooking) return;

    const amountInPaise = parseFloat(paymentAmount) * 100;

    if (!paymentAmount || amountInPaise <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid payment amount.',
        variant: 'destructive',
      });
      return;
    }

    setIsApproving(true);
    try {
      await bookingsApi.updateStatus(
        fullBooking._id,
        'approved',
        Math.round(amountInPaise)
      );

      toast({
        title: 'Booking Approved',
        description: 'Payment link has been sent to customer.',
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

  const handleRefund = async () => {
    if (!fullBooking || !fullBooking.payment_details) return;

    const amountInPaise = refundAmount ? parseFloat(refundAmount) * 100 : undefined;

    if (amountInPaise !== undefined && amountInPaise <= 0) {
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
        amountInPaise ? Math.round(amountInPaise) : undefined,
        refundReason
      );

      toast({
        title: 'Refund Processed',
        description: amountInPaise ? 'Partial refund completed.' : 'Full refund completed.',
      });

      onRefresh?.();
      loadFullBookingDetails();
      setShowRefundDialog(false);
      setRefundAmount('');
      setRefundReason('');
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

  // Calculate refundable amount
  const totalPaid = paymentDetails?.amount || 0;
  const alreadyRefunded = paymentDetails?.amount_refunded || 0;
  const refundableAmount = totalPaid - alreadyRefunded;

  // Business rules - using string literals instead of enum values
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
              {/* Status Section */}
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">Booking Status:</span>
                    <StatusBadge status={currentStatus} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Payment Status:</span>
                    <PaymentStatusBadge status={paymentStatus} />
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>ID: #{displayBooking._id.slice(-6).toUpperCase()}</div>
                  <div>Created: {format(new Date(displayBooking.created_at), 'MMM d, yyyy HH:mm')}</div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{displayBooking.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </p>
                    <p className="font-medium break-all">{displayBooking.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      Phone
                    </p>
                    <p className="font-medium">{displayBooking.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phone Country</p>
                    <p className="font-medium">{displayBooking.phone_country}</p>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Service Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Service</p>
                    <p className="font-medium">{displayBooking.service}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Package</p>
                    <p className="font-medium">{displayBooking.package}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Date
                    </p>
                    <p className="font-medium">{displayBooking.date}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Service Country</p>
                    <p className="font-medium">{displayBooking.service_country}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Address
                    </p>
                    <p className="font-medium">{displayBooking.address}, {displayBooking.pincode}</p>
                  </div>
                  {displayBooking.message && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Message
                      </p>
                      <p className="font-medium text-sm">{displayBooking.message}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              {(paymentDetails || displayBooking.payment_order_id) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    {paymentDetails && (
                      <>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Order ID:</span>
                            <p className="font-mono font-medium break-all">{paymentDetails.order_id}</p>
                          </div>
                          {paymentDetails.payment_id && (
                            <div>
                              <span className="text-muted-foreground">Payment ID:</span>
                              <p className="font-mono font-medium break-all">{paymentDetails.payment_id}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <p className="font-medium">₹{(paymentDetails.amount / 100).toFixed(2)} {paymentDetails.currency}</p>
                          </div>
                          {paymentDetails.method && (
                            <div>
                              <span className="text-muted-foreground">Method:</span>
                              <p className="font-medium capitalize">{paymentDetails.method}</p>
                            </div>
                          )}
                          {paymentDetails.fee && paymentDetails.fee > 0 && (
                            <div>
                              <span className="text-muted-foreground">Fee:</span>
                              <p className="font-medium">₹{(paymentDetails.fee / 100).toFixed(2)}</p>
                            </div>
                          )}
                          {paymentDetails.amount_refunded && paymentDetails.amount_refunded > 0 && (
                            <div>
                              <span className="text-muted-foreground">Refunded:</span>
                              <p className="font-medium text-destructive">₹{(paymentDetails.amount_refunded / 100).toFixed(2)}</p>
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
                      </>
                    )}

                    {!paymentDetails && displayBooking.payment_order_id && (
                      <div className="text-sm text-muted-foreground">
                        Order created: {displayBooking.payment_order_id}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment History Timeline */}
              {paymentHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Payment History
                  </h3>
                  <div className="space-y-2">
                    {paymentHistory.map((payment) => (
                      <div
                        key={payment._id}
                        className="border rounded-lg p-3 text-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <PaymentStatusBadge status={payment.status} />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(payment.created_at), 'MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>Order: {payment.order_id.slice(-8)}</div>
                          {payment.payment_id && <div>Payment: {payment.payment_id.slice(-8)}</div>}
                        </div>
                        {payment.refunds && payment.refunds.length > 0 && (
                          <div className="mt-2 pt-2 border-t space-y-1">
                            <div className="font-medium text-xs">Refunds:</div>
                            {payment.refunds.map((refund) => (
                              <div key={refund.refund_id} className="text-xs text-muted-foreground">
                                ₹{(refund.amount / 100).toFixed(2)} - {format(new Date(refund.created_at), 'MMM d, yyyy')}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval Form */}
              {canApprove && (
                <div className="border-t pt-4">
                  {!showApprovalForm ? (
                    <Button
                      onClick={() => setShowApprovalForm(true)}
                      className="w-full"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Create Payment
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Payment Amount (₹)
                        </label>
                        <Input
                          type="number"
                          placeholder="Enter amount in rupees (e.g., 5000)"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          min="1"
                          step="0.01"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          This will create a Razorpay payment order and send payment link to customer.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleApprove}
                          disabled={isApproving || !paymentAmount}
                          className="flex-1"
                        >
                          {isApproving && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                          Approve Booking
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowApprovalForm(false);
                            setPaymentAmount('');
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

              {/* Action Buttons */}
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
                    Process Refund (₹{(refundableAmount / 100).toFixed(2)} available)
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

      {/* Refund Dialog */}
      <AlertDialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process Refund</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Process refund for this booking.</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <div>Total Paid: ₹{(totalPaid / 100).toFixed(2)}</div>
                  <div>Already Refunded: ₹{(alreadyRefunded / 100).toFixed(2)}</div>
                  <div className="font-semibold">Available: ₹{(refundableAmount / 100).toFixed(2)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Refund Amount (₹) - Leave empty for full refund
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter amount or leave empty for full"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    min="1"
                    max={refundableAmount / 100}
                    step="0.01"
                  />
                </div>
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
              {isRefunding && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Process Refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {targetStatus === 'completed' ? 'Mark as Completed?' : 'Cancel Booking?'}
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
              className={targetStatus === 'cancelled' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {isUpdatingStatus && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BookingDetailsModal;