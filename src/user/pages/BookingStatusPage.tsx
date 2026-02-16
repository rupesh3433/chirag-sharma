// src/user/pages/BookingStatusPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Package,
  CreditCard,
  AlertCircle,
  Home,
} from "lucide-react";
import {
  bookingAPI,
  APIError,
  type Booking,
  type PaymentStatus as PaymentStatusType,
} from "@user/services/api";

export default function BookingStatusPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError("Invalid booking ID");
      setLoading(false);
      return;
    }

    const loadBookingData = async () => {
      try {
        // Load booking details
        const bookingResponse = await bookingAPI.getBookingStatus(bookingId);
        setBooking(bookingResponse.booking);

        // Load payment status if booking is approved or confirmed
        if (
          bookingResponse.booking.status === "approved" ||
          bookingResponse.booking.status === "confirmed" ||
          bookingResponse.booking.status === "completed"
        ) {
          try {
            const paymentResponse = await bookingAPI.getPaymentStatus(bookingId);
            setPaymentStatus(paymentResponse);
          } catch (err) {
            // Payment info not available yet
            console.log("Payment info not available");
          }
        }

        setLoading(false);
      } catch (err) {
        if (err instanceof APIError) {
          setError(err.message);
        } else {
          setError("Failed to load booking details");
        }
        setLoading(false);
      }
    };

    loadBookingData();

    // Poll for updates every 10 seconds
    const interval = setInterval(loadBookingData, 10000);

    return () => clearInterval(interval);
  }, [bookingId]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: <Clock className="h-6 w-6" />,
          color: "bg-yellow-100 text-yellow-800 border-yellow-300",
          label: "Pending Approval",
          description: "Your booking is awaiting admin approval.",
        };
      case "approved":
        return {
          icon: <CheckCircle2 className="h-6 w-6" />,
          color: "bg-blue-100 text-blue-800 border-blue-300",
          label: "Approved",
          description: "Your booking has been approved. Please complete payment to confirm.",
        };
      case "confirmed":
        return {
          icon: <CheckCircle2 className="h-6 w-6" />,
          color: "bg-green-100 text-green-800 border-green-300",
          label: "Confirmed",
          description: "Your booking is confirmed! Payment successful.",
        };
      case "completed":
        return {
          icon: <CheckCircle2 className="h-6 w-6" />,
          color: "bg-green-100 text-green-800 border-green-300",
          label: "Completed",
          description: "Service completed. Thank you for choosing JinniChirag!",
        };
      case "cancelled":
        return {
          icon: <XCircle className="h-6 w-6" />,
          color: "bg-red-100 text-red-800 border-red-300",
          label: "Cancelled",
          description: "This booking has been cancelled.",
        };
      default:
        return {
          icon: <AlertCircle className="h-6 w-6" />,
          color: "bg-gray-100 text-gray-800 border-gray-300",
          label: status,
          description: "",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-chirag-pink" />
            <p className="mt-4 text-gray-600">Loading booking details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-chirag-pink text-white rounded-lg hover:bg-pink-600"
            >
              <Home className="h-4 w-4" />
              Go to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusInfo = getStatusInfo(booking.status);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-chirag-pink/10">
      <Navbar />

      <main className="flex-grow w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-playfair font-bold mb-2">
              Booking Status
            </h1>
            <p className="text-gray-600">Track your booking progress</p>
          </div>

          {/* Status Card */}
          <div className={`mb-6 rounded-2xl border-2 p-6 ${statusInfo.color}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">{statusInfo.icon}</div>
              <div className="flex-grow">
                <h2 className="text-xl font-bold mb-1">{statusInfo.label}</h2>
                <p className="text-sm opacity-90">{statusInfo.description}</p>
              </div>
            </div>
          </div>

          {/* Payment Required Alert */}
          {booking.status === "approved" && !booking.payment_id && (
            <div className="mb-6 rounded-xl bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Payment Required
                  </p>
                  <p className="text-sm text-blue-800 mb-3">
                    Your booking has been approved! Please check your WhatsApp for the payment link or click below to complete payment.
                  </p>
                  <button
                    onClick={() => {
                      // If we have payment_order_id, redirect to payment page
                      if (booking.payment_order_id) {
                        navigate(`/payment?order_id=${booking.payment_order_id}&booking_id=${bookingId}`);
                      } else {
                        alert("Payment link will be sent to your WhatsApp shortly.");
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
                  >
                    <CreditCard className="inline h-4 w-4 mr-1" />
                    Complete Payment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Booking Details Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-chirag-pink to-pink-400 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Booking Details</h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem icon={<Calendar className="h-4 w-4" />} label="Booking ID" value={booking._id} />
                <DetailItem icon={<Calendar className="h-4 w-4" />} label="Date" value={new Date(booking.date).toLocaleDateString()} />
                <DetailItem icon={<Package className="h-4 w-4" />} label="Service" value={booking.service} />
                <DetailItem icon={<Package className="h-4 w-4" />} label="Package" value={booking.package} />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailItem icon={<Mail className="h-4 w-4" />} label="Email" value={booking.email} />
                  <DetailItem icon={<Phone className="h-4 w-4" />} label="Phone" value={booking.phone} />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Service Location</h3>
                <DetailItem
                  icon={<MapPin className="h-4 w-4" />}
                  label="Address"
                  value={`${booking.address}, ${booking.pincode}, ${booking.service_country}`}
                />
              </div>

              {booking.message && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">{booking.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details Card */}
          {paymentStatus && paymentStatus.payment && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Payment Details</h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailItem
                    icon={<CreditCard className="h-4 w-4" />}
                    label="Amount"
                    value={`₹${(paymentStatus.payment.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  />
                  <DetailItem
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label="Status"
                    value={paymentStatus.payment.status.replace('_', ' ').toUpperCase()}
                  />
                  {paymentStatus.payment.method && (
                    <DetailItem
                      icon={<CreditCard className="h-4 w-4" />}
                      label="Method"
                      value={paymentStatus.payment.method.toUpperCase()}
                    />
                  )}
                  {paymentStatus.payment.payment_id && (
                    <DetailItem
                      icon={<Package className="h-4 w-4" />}
                      label="Payment ID"
                      value={paymentStatus.payment.payment_id}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/"
              className="flex-1 min-h-[3rem] flex items-center justify-center gap-2 px-6 py-3 bg-white text-chirag-pink border-2 border-chirag-pink rounded-xl font-semibold hover:bg-chirag-pink hover:text-white transition-colors"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              to="/book"
              className="flex-1 min-h-[3rem] flex items-center justify-center gap-2 px-6 py-3 bg-chirag-pink text-white rounded-xl font-semibold hover:bg-pink-600 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              New Booking
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div>
    <p className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
      {icon}
      {label}
    </p>
    <p className="text-sm text-gray-900 break-words">{value}</p>
  </div>
);