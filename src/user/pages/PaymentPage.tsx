// src/user/pages/PaymentPage.tsx
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  CreditCard,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Shield,
  ChevronRight,
  Wallet,
  Building2,
  Smartphone,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

interface Booking {
  _id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  package: string;
  date: string;
  address: string;
  pincode: string;
  service_country: string;
  message?: string;
  status: string;
  payment_amount?: number;
  payment_currency?: string;
  payment_order_id?: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

// ============================================================
// API BASE URL
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ============================================================
// RAZORPAY KEY - CRITICAL
// ============================================================

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

if (!RAZORPAY_KEY) {
  console.error("❌ RAZORPAY_KEY_ID is not configured in environment variables");
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log("✅ Razorpay SDK loaded successfully");
      resolve(true);
    };
    script.onerror = () => {
      console.error("❌ Failed to load Razorpay SDK");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const fetchBookingDetails = async (bookingId: string): Promise<Booking> => {
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch booking details");
  }
  const data = await response.json();
  return data.booking;
};

const verifyPayment = async (paymentData: RazorpayResponse): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/bookings/razorpay/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    throw new Error("Payment verification failed");
  }
};

const markPaymentFailed = async (orderId: string, reason: string): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/bookings/razorpay/payment-failed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: orderId,
        reason,
      }),
    });
  } catch (error) {
    console.error("Failed to mark payment as failed:", error);
  }
};

// ============================================================
// PAYMENT PAGE COMPONENT
// ============================================================

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("order_id");
  const bookingId = searchParams.get("booking_id");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");
  const [paymentMessage, setPaymentMessage] = useState("");

  // ============================================================
  // LOAD BOOKING DETAILS
  // ============================================================

  useEffect(() => {
    if (!bookingId || !orderId) {
      setError("Invalid payment link. Missing required parameters.");
      setLoading(false);
      return;
    }

    const loadBooking = async () => {
      try {
        const bookingData = await fetchBookingDetails(bookingId);
        setBooking(bookingData);

        // Validate booking status
        if (bookingData.status !== "approved") {
          setError(
            `Booking status is "${bookingData.status}". Payment is only available for approved bookings.`
          );
        }

        // Validate payment order
        if (bookingData.payment_order_id !== orderId) {
          setError("Payment order mismatch. This link may be invalid or expired.");
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to load booking:", err);
        setError("Failed to load booking details. Please check your link and try again.");
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId, orderId]);

  // ============================================================
  // HANDLE PAYMENT
  // ============================================================

  const handlePayment = async () => {
    if (!booking || !orderId || !RAZORPAY_KEY) {
      setError("Payment configuration error. Please contact support.");
      return;
    }

    setPaymentStatus("processing");
    setPaymentMessage("Initializing secure payment gateway...");

    try {
      // Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Failed to load Razorpay SDK. Please check your internet connection and try again.");
      }

      setPaymentMessage("Opening payment gateway...");

      const amount = booking.payment_amount || 0;
      const currency = booking.payment_currency || "INR";

      // Razorpay Checkout Options
      const options: RazorpayOptions = {
        key: RAZORPAY_KEY,
        amount: amount,
        currency: currency,
        name: "JinniChirag Makeup Artist",
        description: `${booking.service} - ${booking.package}`,
        order_id: orderId,

        // Payment Success Handler
        handler: async (response: RazorpayResponse) => {
          console.log("✅ Payment successful:", response.razorpay_payment_id);
          setPaymentMessage("Verifying payment...");

          try {
            await verifyPayment(response);
            
            setPaymentStatus("success");
            setPaymentMessage("Payment successful! Your booking is confirmed. 🎉");

            // Redirect to success page after 3 seconds
            setTimeout(() => {
              navigate(`/booking-status/${bookingId}`);
            }, 3000);
          } catch (err) {
            console.error("Payment verification failed:", err);
            setPaymentStatus("failed");
            setPaymentMessage("Payment verification failed. Please contact support with your payment ID.");
          }
        },

        // Prefill customer details
        prefill: {
          name: booking.name,
          email: booking.email,
          contact: booking.phone,
        },

        // Theme
        theme: {
          color: "#EC4899", // chirag-pink
        },

        // Modal dismissed handler
        modal: {
          ondismiss: async () => {
            console.log("⚠️ Payment cancelled by user");
            setPaymentStatus("failed");
            setPaymentMessage("Payment cancelled. You can try again anytime.");

            await markPaymentFailed(orderId, "User cancelled payment");
          },
        },
      };

      // Open Razorpay Checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

      // Reset status when modal opens
      setPaymentStatus("idle");
      setPaymentMessage("");

    } catch (err) {
      console.error("Payment initialization error:", err);
      setPaymentStatus("failed");
      
      if (err instanceof Error) {
        setPaymentMessage(err.message);
      } else {
        setPaymentMessage("Failed to initialize payment. Please try again.");
      }
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-chirag-pink" />
            <p className="text-gray-600 font-medium">Loading payment details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error || !booking) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-gray-900">
              Payment Error
            </h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-chirag-pink to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Go to Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ============================================================
  // MAIN PAYMENT PAGE
  // ============================================================

  const amount = (booking.payment_amount || 0) / 100;
  const formattedAmount = amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-pink-50/30 to-pink-100/50">
      <Navbar />

      <main className="flex-grow w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-chirag-pink to-pink-400 shadow-xl">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold text-gray-900">
              Complete Payment
            </h1>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" />
              Secure payment powered by Razorpay
            </p>
          </div>

          {/* Status Messages */}
          {paymentStatus === "processing" && (
            <div className="rounded-2xl bg-blue-50 border-2 border-blue-200 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 flex-shrink-0" />
                <span className="text-blue-900 font-medium">{paymentMessage}</span>
              </div>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                <span className="text-green-900 font-medium">{paymentMessage}</span>
              </div>
            </div>
          )}

          {paymentStatus === "failed" && (
            <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                <span className="text-red-900 font-medium">{paymentMessage}</span>
              </div>
            </div>
          )}

          {/* Amount Card - Prominent */}
          <div className="bg-gradient-to-br from-chirag-pink to-pink-500 rounded-3xl shadow-2xl p-6 sm:p-8 text-white">
            <p className="text-white/90 text-sm sm:text-base font-medium mb-2">Total Amount</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl lg:text-7xl font-bold">₹{formattedAmount.split('.')[0]}</span>
              <span className="text-2xl sm:text-3xl font-semibold">.{formattedAmount.split('.')[1]}</span>
            </div>
            <p className="text-white/80 text-sm mt-2">{booking.payment_currency || 'INR'}</p>
          </div>

          {/* Booking Details Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-gray-50 to-pink-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem label="Name" value={booking.name} />
                <DetailItem label="Email" value={booking.email} />
                <DetailItem label="Phone" value={booking.phone} />
                <DetailItem 
                  label="Date" 
                  value={new Date(booking.date).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })} 
                />
                <DetailItem label="Service" value={booking.service} />
                <DetailItem label="Package" value={booking.package} />
                <DetailItem 
                  label="Location" 
                  value={`${booking.address}, ${booking.pincode}`} 
                  className="sm:col-span-2"
                />
                <DetailItem label="Country" value={booking.service_country} />
              </div>

              {booking.message && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Special Notes:</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{booking.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Secure Payment</h3>
                <p className="text-sm text-gray-600">
                  Your payment is processed securely through Razorpay with 256-bit encryption
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <PaymentMethodBadge icon={Smartphone} label="UPI" />
              <PaymentMethodBadge icon={CreditCard} label="Cards" />
              <PaymentMethodBadge icon={Building2} label="Net Banking" />
              <PaymentMethodBadge icon={Wallet} label="Wallets" />
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={paymentStatus === "processing" || paymentStatus === "success"}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-chirag-pink via-pink-500 to-pink-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-pink-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-2xl py-5 sm:py-6"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-chirag-pink opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative flex items-center justify-center gap-3">
              {paymentStatus === "processing" ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : paymentStatus === "success" ? (
                <>
                  <CheckCircle2 className="h-6 w-6" />
                  <span>Payment Successful</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-6 w-6" />
                  <span>Pay ₹{formattedAmount}</span>
                  <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </button>

          {/* Footer Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>This payment link is valid until you complete the payment</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <AlertCircle className="h-4 w-4" />
              <span>
                Need help? Contact us at{" "}
                <a href="mailto:support@jinnichirag.com" className="text-chirag-pink hover:underline">
                  support@jinnichirag.com
                </a>
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ============================================================
// HELPER COMPONENTS
// ============================================================

const DetailItem = ({ 
  label, 
  value, 
  className = "" 
}: { 
  label: string; 
  value: string; 
  className?: string;
}) => (
  <div className={className}>
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className="text-sm sm:text-base text-gray-900 font-medium break-words">
      {value}
    </p>
  </div>
);

const PaymentMethodBadge = ({ 
  icon: Icon, 
  label 
}: { 
  icon: React.ElementType; 
  label: string;
}) => (
  <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-chirag-pink/50 transition-colors">
    <Icon className="h-6 w-6 text-gray-600" />
    <span className="text-xs font-semibold text-gray-700">{label}</span>
  </div>
);