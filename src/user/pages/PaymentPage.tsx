// src/user/pages/PaymentPage.tsx
// ============================================================
// Multi-Provider Payment Page
// Flow: Load booking → Show provider options → User selects →
//       createPayment API → Razorpay checkout OR Khalti redirect
// ============================================================

import { useState, useEffect, useCallback } from "react";
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
import {
  paymentAPI,
  bookingAPI,
  loadRazorpayScript,
  APIError,
  type Booking,
  type PaymentOption,
  type RazorpayOrderResponse,
  type KhaltiOrderResponse,
  type RazorpayResponse,
} from "@user/services/api";

// ============================================================
// ENV
// ============================================================

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

if (!RAZORPAY_KEY) {
  console.error("❌ VITE_RAZORPAY_KEY_ID is not set in environment variables");
}

// ============================================================
// TYPES
// ============================================================

type PaymentStep = "loading" | "select" | "processing" | "success" | "failed";
type ProviderChoice = "razorpay" | "khalti";

// ============================================================
// CURRENCY HELPERS
// ============================================================

/**
 * Format an amount (in smallest currency unit) for display.
 *
 * Always use the provider option's own currency — never infer from
 * booking.payment_currency. Backend has already done any conversion.
 *
 * @param amountInSmallestUnit - paise (INR) or paisa (NPR)
 * @param currency - "INR" | "NPR"
 */
const formatCurrency = (
  amountInSmallestUnit: number,
  currency: string
): string => {
  const amount = amountInSmallestUnit / 100;
  if (currency === "NPR") {
    return `NPR ${amount.toLocaleString("en-NP", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// ============================================================
// PAYMENT PAGE COMPONENT
// ============================================================

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get("booking_id");

  const [step, setStep] = useState<PaymentStep>("loading");
  const [booking, setBooking] = useState<Booking | null>(null);
  // payment_options lives at TOP LEVEL of the API response, not inside booking
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderChoice | null>(null);

  // ============================================================
  // LOAD BOOKING
  // ============================================================

  useEffect(() => {
    if (!bookingId) {
      setError("Invalid payment link. Missing booking_id parameter.");
      setStep("failed");
      return;
    }

    const load = async () => {
      try {
        // API returns { success, booking, payment_options }
        // payment_options is TOP LEVEL — not nested inside booking
        const response = await bookingAPI.getBookingStatus(bookingId);
        const data = response.booking;
        const options = response.payment_options ?? [];

        console.log("[PaymentPage] Booking status:", data.status);
        console.log("[PaymentPage] Payment options (with converted amounts):", options);

        setBooking(data);
        setPaymentOptions(options);

        if (data.status !== "approved") {
          setError(
            `Booking status is "${data.status}". Payment is only available for approved bookings.`
          );
          setStep("failed");
          return;
        }

        if (!data.payment_amount) {
          setError(
            "Payment amount has not been set yet. Please wait for admin confirmation."
          );
          setStep("failed");
          return;
        }

        if (options.length === 0) {
          setError(
            "No payment methods are available for this booking. Please contact support."
          );
          setStep("failed");
          return;
        }

        setStep("select");
      } catch (err) {
        console.error("[PaymentPage] Failed to load booking:", err);
        setError(
          err instanceof APIError
            ? err.message
            : "Failed to load booking details. Please check your link and try again."
        );
        setStep("failed");
      }
    };

    load();
  }, [bookingId]);

  // ============================================================
  // RAZORPAY HANDLER
  // ============================================================

  const handleRazorpay = useCallback(
    async (orderData: RazorpayOrderResponse) => {
      if (!booking || !bookingId) return;

      setStatusMessage("Loading payment gateway...");

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error(
          "Failed to load Razorpay SDK. Please check your internet connection."
        );
      }

      return new Promise<void>((resolve, reject) => {
        const options = {
          key: RAZORPAY_KEY,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "JinniChirag Makeup Artist",
          description: `${booking.service} - ${booking.package}`,
          order_id: orderData.order_id,

          handler: async (response: RazorpayResponse) => {
            setStatusMessage("Verifying payment...");
            try {
              await paymentAPI.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              resolve();
            } catch {
              reject(
                new Error(
                  "Payment verification failed. Please contact support with your payment ID."
                )
              );
            }
          },

          prefill: {
            name: booking.name,
            email: booking.email,
            contact: booking.phone,
          },

          theme: { color: "#EC4899" },

          modal: {
            ondismiss: async () => {
              try {
                await paymentAPI.markRazorpayFailed({
                  order_id: orderData.order_id,
                  reason: "User cancelled payment",
                });
              } catch (e) {
                console.warn("[PaymentPage] Failed to mark Razorpay failed:", e);
              }
              reject(new Error("Payment cancelled. You can try again anytime."));
            },
          },
        };

        setStatusMessage("Opening payment gateway...");
        const rzp = new (window as any).Razorpay(options);
        rzp.open();

        // Clear processing state while Razorpay modal is open
        setStep("select");
        setStatusMessage("");
      });
    },
    [booking, bookingId]
  );

  // ============================================================
  // KHALTI HANDLER
  // ============================================================

  const handleKhalti = useCallback(async (orderData: KhaltiOrderResponse) => {
    setStatusMessage("Redirecting to Khalti...");
    // Redirect user to Khalti's hosted payment page.
    // Khalti will call our return_url (KhaltiCallbackPage) after payment.
    window.location.href = orderData.payment_url;
  }, []);

  // ============================================================
  // MAIN PAY HANDLER
  // ============================================================

  const handlePay = async (provider: ProviderChoice) => {
    if (!booking || !bookingId) return;

    setSelectedProvider(provider);
    setStep("processing");
    setStatusMessage("Creating payment session...");

    try {
      // Backend computes amount from admin-set base, returns flat response
      const orderData = await paymentAPI.createPayment(bookingId, provider);
      console.log(`[PaymentPage] ${provider} order created:`, orderData);

      if (orderData.provider === "razorpay") {
        await handleRazorpay(orderData as RazorpayOrderResponse);
        setStep("success");
        setStatusMessage("Payment successful! Your booking is confirmed. 🎉");
        setTimeout(() => navigate(`/booking-status/${bookingId}`), 3000);
      } else {
        await handleKhalti(orderData as KhaltiOrderResponse);
        // Execution does not return here — page navigates to Khalti
      }
    } catch (err) {
      console.error("[PaymentPage] Payment error:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Payment failed. Please try again.";
      setStep("failed");
      setStatusMessage(message);
    }
  };

  const handleRetry = () => {
    setStep("select");
    setSelectedProvider(null);
    setStatusMessage("");
    setError(null);
  };

  // ============================================================
  // RENDER: LOADING
  // ============================================================

  if (step === "loading") {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-chirag-pink" />
            <p className="text-gray-600 font-medium">Loading payment details...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  // ============================================================
  // RENDER: HARD ERROR (before any payment attempt)
  // ============================================================

  if (step === "failed" && !selectedProvider) {
    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center space-y-6 py-16">
          <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-playfair font-bold text-gray-900">
            Payment Error
          </h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-gradient-to-r from-chirag-pink to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Go to Home
          </button>
        </div>
      </PageShell>
    );
  }

  if (!booking) return null;

  // ============================================================
  // RENDER: PROCESSING
  // ============================================================

  if (step === "processing") {
    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center space-y-6 py-16">
          <Loader2 className="h-14 w-14 animate-spin mx-auto text-chirag-pink" />
          <h2 className="text-xl font-semibold text-gray-800">
            {statusMessage || "Processing payment..."}
          </h2>
          <p className="text-sm text-gray-500">
            Please do not close or refresh this page.
          </p>
        </div>
      </PageShell>
    );
  }

  // ============================================================
  // RENDER: SUCCESS
  // ============================================================

  if (step === "success") {
    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center space-y-6 py-16">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-playfair font-bold text-gray-900">
            Payment Successful!
          </h2>
          <p className="text-gray-600">{statusMessage}</p>
          <p className="text-sm text-gray-400">
            Redirecting to your booking status...
          </p>
        </div>
      </PageShell>
    );
  }

  // ============================================================
  // RENDER: PAYMENT FAILED (after attempting payment)
  // ============================================================

  if (step === "failed" && selectedProvider) {
    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center space-y-6 py-16">
          <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-playfair font-bold text-gray-900">
            Payment Failed
          </h2>
          <p className="text-gray-600">{statusMessage}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-8 py-3 bg-gradient-to-r from-chirag-pink to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(`/booking-status/${bookingId}`)}
              className="px-8 py-3 bg-white text-gray-700 border border-gray-300 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              View Booking
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  // ============================================================
  // RENDER: PROVIDER SELECTION
  // ============================================================

  const hasMultipleProviders = paymentOptions.length > 1;

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto space-y-6 py-8 sm:py-12 px-4 sm:px-6">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-chirag-pink to-pink-400 shadow-xl">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold text-gray-900">
            Complete Payment
          </h1>
          <p className="text-gray-500 flex items-center justify-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            Secure payment via trusted providers
          </p>
        </div>

        {/* Booking Summary */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-gray-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Booking Summary</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SummaryItem label="Name" value={booking.name} />
              <SummaryItem label="Email" value={booking.email} />
              <SummaryItem label="Phone" value={booking.phone} />
              <SummaryItem
                label="Date"
                value={new Date(booking.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
              <SummaryItem label="Service" value={booking.service} />
              <SummaryItem label="Package" value={booking.package} />
              <SummaryItem
                label="Location"
                value={`${booking.address}, ${booking.pincode}`}
                className="sm:col-span-2"
              />
            </div>
            {booking.message && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Notes
                </p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {booking.message}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Provider Selection */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-gray-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">
              {hasMultipleProviders ? "Choose Payment Method" : "Payment Method"}
            </h2>
            {hasMultipleProviders && (
              <p className="text-xs text-gray-500 mt-0.5">
                Select your preferred payment provider
              </p>
            )}
          </div>

          <div className="p-6 space-y-4">
            {/*
              ✅ Each option.amount is the CONVERTED amount in option.currency.
              Backend computed these conversions — frontend just displays them.
              Never use booking.payment_amount here.
            */}
            {paymentOptions.map((option) => (
              <ProviderCard
                key={option.provider}
                provider={option.provider}
                currency={option.currency}
                label={
                  option.label ??
                  (option.provider === "razorpay" ? "Razorpay" : "Khalti")
                }
                description={
                  option.description ??
                  (option.provider === "razorpay"
                    ? "Pay via UPI, Cards, Net Banking, Wallets"
                    : "Pay via Khalti Wallet, eBanking, Cards")
                }
                // ✅ CORRECT: use option.amount (backend-converted for this provider)
                // ❌ WRONG was: formatCurrency(baseAmount, option.currency)
                formattedAmount={formatCurrency(option.amount, option.currency)}
                onPay={() => handlePay(option.provider)}
              />
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="space-y-2 pb-4">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            <span>
              Khalti payment links expire in 60 minutes. Complete payment promptly.
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>
              Need help?{" "}
              <a
                href="mailto:support@jinnichirag.com"
                className="text-chirag-pink hover:underline"
              >
                support@jinnichirag.com
              </a>
            </span>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ============================================================
// PROVIDER CARD
// ============================================================

const ProviderCard = ({
  provider,
  currency,
  label,
  description,
  formattedAmount,
  onPay,
}: {
  provider: "razorpay" | "khalti";
  currency: string;
  label: string;
  description: string;
  /** Pre-formatted amount string using the provider's own currency */
  formattedAmount: string;
  onPay: () => void;
}) => {
  const isRazorpay = provider === "razorpay";

  return (
    <div className="rounded-2xl border-2 border-gray-200 hover:border-chirag-pink/40 transition-colors overflow-hidden">
      {/* Provider Header */}
      <div
        className={`px-5 py-3 flex items-center gap-3 ${
          isRazorpay
            ? "bg-blue-50 border-b border-blue-100"
            : "bg-purple-50 border-b border-purple-100"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
            isRazorpay ? "bg-blue-600" : "bg-purple-600"
          }`}
        >
          {isRazorpay ? "R" : "K"}
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className="ml-auto">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isRazorpay
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {currency}
          </span>
        </div>
      </div>

      {/* Payment Methods Row */}
      <div className="px-5 py-3 bg-white flex flex-wrap items-center gap-2 border-b border-gray-100">
        {isRazorpay ? (
          <>
            <PayMethodBadge icon={Smartphone} label="UPI" />
            <PayMethodBadge icon={CreditCard} label="Cards" />
            <PayMethodBadge icon={Building2} label="Net Banking" />
            <PayMethodBadge icon={Wallet} label="Wallets" />
          </>
        ) : (
          <>
            <PayMethodBadge icon={Wallet} label="Khalti Wallet" />
            <PayMethodBadge icon={Building2} label="eBanking" />
            <PayMethodBadge icon={CreditCard} label="Cards" />
          </>
        )}
      </div>

      {/* Pay Button */}
      <div className="px-5 py-4 bg-white">
        <button
          onClick={onPay}
          className={`w-full group flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-white text-base shadow-lg hover:shadow-xl transition-all ${
            isRazorpay
              ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
              : "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
          }`}
        >
          {isRazorpay ? (
            <CreditCard className="h-5 w-5" />
          ) : (
            <Wallet className="h-5 w-5" />
          )}
          <span>Pay {formattedAmount}</span>
          <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

// ============================================================
// HELPER COMPONENTS
// ============================================================

const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-pink-50/30 to-pink-100/50">
    <Navbar />
    <main className="flex-grow w-full">{children}</main>
    <Footer />
  </div>
);

const SummaryItem = ({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) => (
  <div className={className}>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className="text-sm text-gray-900 font-medium break-words">{value}</p>
  </div>
);

const PayMethodBadge = ({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) => (
  <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
    <Icon className="h-3 w-3" />
    <span>{label}</span>
  </div>
);