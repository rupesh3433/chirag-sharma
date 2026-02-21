// src/user/pages/BookingStatusPage.tsx
// ============================================================
// Enhanced Booking Status Page
// ✅ Navbar overlap fixed (pt-20 safe area)
// ✅ Fully responsive — mobile, tablet, desktop
// ✅ PDF Receipt download via jsPDF  →  npm install jspdf
// ✅ Status timeline, auto-refresh every 15s
// ✅ Types and API calls UNCHANGED
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jsPDF } from "jspdf";
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
  Wallet,
  Download,
  RefreshCw,
  ChevronRight,
  Sparkles,
  BadgeCheck,
  Banknote,
  Receipt,
} from "lucide-react";
import {
  bookingAPI,
  APIError,
  type Booking,
  type PaymentStatus as PaymentStatusType,
} from "@user/services/api";

// ============================================================
// TYPES
// ============================================================

type BookingStatusKey =
  | "pending"
  | "approved"
  | "confirmed"
  | "completed"
  | "cancelled";

// ============================================================
// CONSTANTS
// ============================================================

const STATUS_STEPS: { key: BookingStatusKey; label: string }[] = [
  { key: "pending", label: "Requested" },
  { key: "approved", label: "Approved" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
];

const STATUS_ORDER: Record<BookingStatusKey, number> = {
  pending: 0,
  approved: 1,
  confirmed: 2,
  completed: 3,
  cancelled: -1,
};

// ============================================================
// FORMAT HELPERS
// ============================================================

const formatAmount = (
  amount: number | null,
  currency: string | null
): string => {
  if (!amount) return "—";
  const val = amount / 100;
  if (currency === "NPR")
    return `NPR ${val.toLocaleString("en-NP", { minimumFractionDigits: 2 })}`;
  return `INR ${val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
};

const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatDateTime = (dateStr: string): string =>
  new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ============================================================
// PDF RECEIPT — jsPDF
// Generates and triggers download of a styled A4 PDF receipt.
// Requires:  npm install jspdf
// ============================================================

type PaymentData = NonNullable<PaymentStatusType["payment"]>;

function downloadReceiptPDF(booking: Booking, payment: PaymentData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // ── Dimensions ───────────────────────────────────────────
  const W = 210; // A4 width
  const mx = 16; // horizontal margin
  const cw = W - mx * 2; // content width = 178 mm

  // ── Colour palette (R,G,B tuples for jsPDF) ──────────────
  type RGB = [number, number, number];
  const C: Record<string, RGB> = {
    pink: [236, 72, 153],
    darkPink: [219, 39, 119],
    lightPink: [253, 242, 248],
    midPink: [251, 207, 232],
    dark: [15, 23, 42],
    gray: [107, 114, 128],
    lightGray: [243, 244, 246],
    borderGray: [229, 231, 235],
    green: [5, 150, 105],
    lightGreen: [209, 250, 229],
    white: [255, 255, 255],
  };

  // Shorthands
  const fill = (k: string) => doc.setFillColor(...C[k]);
  const stroke = (k: string) => doc.setDrawColor(...C[k]);
  const text = (k: string) => doc.setTextColor(...C[k]);

  const amountStr = formatAmount(
    payment.amount ?? null,
    payment.currency ?? null
  );
  const providerLbl = payment.provider === "khalti" ? "Khalti" : "Razorpay";
  const paidOn = payment.processed_at
    ? formatDateTime(payment.processed_at)
    : formatDateTime(new Date().toISOString());
  const receiptNum = `#${booking._id.slice(-8).toUpperCase()}`;

  // ╔═══════════════════════════════════════════════════════╗
  // ║  HEADER                                               ║
  // ╚═══════════════════════════════════════════════════════╝

  // Main pink banner
  fill("pink");
  doc.rect(0, 0, W, 56, "F");

  // Thin accent stripe at top
  fill("darkPink");
  doc.rect(0, 0, W, 3.5, "F");

  // Left decorative bar (runs full page height)
  fill("darkPink");
  doc.rect(0, 0, 4, 297, "F");

  // Brand name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(23);
  text("white");
  doc.text("JinniChirag", W / 2, 22, { align: "center" });

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 210, 235);
  doc.text("MAKEUP ARTIST  ·  OFFICIAL PAYMENT RECEIPT", W / 2, 30, {
    align: "center",
  });

  // "Payment Confirmed" pill
  const pillX = W / 2 - 32;
  fill("midPink");
  doc.roundedRect(pillX, 36, 64, 12, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  text("darkPink");
  // slight left padding inside pill
  doc.text("✓  PAYMENT CONFIRMED", pillX + 8, 44);

  // ╔═══════════════════════════════════════════════════════╗
  // ║  META ROW  (Receipt #  /  Issued on)                  ║
  // ╚═══════════════════════════════════════════════════════╝

  let y = 68;

  // Left — Receipt #
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  text("gray");
  doc.text("RECEIPT NO.", mx, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  text("pink");
  doc.text(receiptNum, mx, y + 8);

  // Right — Issued on
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  text("gray");
  doc.text("ISSUED ON", W - mx, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  text("dark");
  doc.text(paidOn, W - mx, y + 8, { align: "right" });

  y += 16;

  // Thin divider
  stroke("borderGray");
  doc.setLineWidth(0.3);
  doc.line(mx, y, W - mx, y);
  y += 8;

  // ╔═══════════════════════════════════════════════════════╗
  // ║  AMOUNT BLOCK                                         ║
  // ╚═══════════════════════════════════════════════════════╝

  fill("lightPink");
  doc.roundedRect(mx, y, cw, 32, 5, 5, "F");
  stroke("midPink");
  doc.setLineWidth(0.5);
  doc.roundedRect(mx, y, cw, 32, 5, 5, "S");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  text("gray");
  doc.text("TOTAL AMOUNT PAID", W / 2, y + 9, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  text("dark");
  doc.text(amountStr, W / 2, y + 21, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  text("gray");
  doc.text(`via ${providerLbl}`, W / 2, y + 28, { align: "center" });

  y += 40;

  // ╔═══════════════════════════════════════════════════════╗
  // ║  HELPER: section title                                ║
  // ╚═══════════════════════════════════════════════════════╝

  const sectionTitle = (title: string, yPos: number): number => {
    fill("lightGray");
    doc.rect(mx, yPos, cw, 7.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    text("gray");
    doc.text(title, mx + 3, yPos + 5.2);
    return yPos + 11;
  };

  // ╔═══════════════════════════════════════════════════════╗
  // ║  HELPER: table row  (label  |  value)                 ║
  // ╚═══════════════════════════════════════════════════════╝

  const tableRow = (
    label: string,
    value: string,
    yPos: number,
    bold = false
  ): number => {
    const maxW = cw - 65;
    const lines = doc.splitTextToSize(value || "—", maxW);
    const rowH = Math.max(lines.length * 4.8 + 2, 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    text("gray");
    doc.text(label, mx + 2, yPos + 5);

    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(8.5);
    text("dark");
    doc.text(lines, W - mx - 2, yPos + 5, { align: "right" });

    stroke("lightGray");
    doc.setLineWidth(0.15);
    doc.line(mx, yPos + rowH, W - mx, yPos + rowH);

    return yPos + rowH + 2;
  };

  // ╔═══════════════════════════════════════════════════════╗
  // ║  BOOKING DETAILS                                      ║
  // ╚═══════════════════════════════════════════════════════╝

  y = sectionTitle("BOOKING DETAILS", y);
  y = tableRow("Service", booking.service, y);
  y = tableRow("Package", booking.package, y);
  y = tableRow("Event Date", formatDate(booking.date), y, true);
  y = tableRow("Location", `${booking.address}, ${booking.pincode}`, y);
  if (booking.service_country) {
    y = tableRow("Country", booking.service_country, y);
  }

  y += 5;

  // ╔═══════════════════════════════════════════════════════╗
  // ║  CLIENT DETAILS                                       ║
  // ╚═══════════════════════════════════════════════════════╝

  y = sectionTitle("CLIENT DETAILS", y);
  y = tableRow("Name", booking.name, y);
  y = tableRow("Email", booking.email, y);
  y = tableRow("Phone", booking.phone, y);

  y += 5;

  // ╔═══════════════════════════════════════════════════════╗
  // ║  PAYMENT DETAILS                                      ║
  // ╚═══════════════════════════════════════════════════════╝

  y = sectionTitle("PAYMENT DETAILS", y);

  // Status row — "PAID" in a green pill
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  text("gray");
  doc.text("Status", mx + 2, y + 5);

  fill("lightGreen");
  doc.roundedRect(W - mx - 19, y + 0.8, 17, 6.5, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  text("green");
  doc.text("✓  PAID", W - mx - 10.5, y + 5.5, { align: "center" });

  stroke("lightGray");
  doc.setLineWidth(0.15);
  doc.line(mx, y + 9, W - mx, y + 9);
  y += 11;

  y = tableRow("Payment Provider", providerLbl, y);

  if (payment.provider === "khalti" && payment.pidx) {
    y = tableRow("Khalti PIDX", payment.pidx, y);
  }
  if (payment.payment_id) {
    y = tableRow("Transaction ID", payment.payment_id, y);
  }
  if (payment.method) {
    y = tableRow("Payment Method", payment.method.toUpperCase(), y);
  }
  if (payment.processed_at) {
    y = tableRow("Paid On", formatDateTime(payment.processed_at), y, true);
  }

  // ╔═══════════════════════════════════════════════════════╗
  // ║  FOOTER                                               ║
  // ╚═══════════════════════════════════════════════════════╝

  const footerY = Math.max(y + 10, 262);

  // Pink rule
  fill("pink");
  doc.setDrawColor(...C.pink);
  doc.setLineWidth(0.6);
  doc.line(mx, footerY, W - mx, footerY);

  // Brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  text("pink");
  doc.text("JinniChirag Makeup Artist", W / 2, footerY + 9, {
    align: "center",
  });

  // Note
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  text("gray");
  doc.text(
    "This is your official payment receipt. Please keep it for your records.",
    W / 2,
    footerY + 15,
    { align: "center" }
  );
  doc.text("Questions? Contact  support@jinnichirag.com", W / 2, footerY + 20, {
    align: "center",
  });

  // Page number
  doc.setFontSize(7);
  doc.setTextColor(...C.borderGray);
  doc.text("Page 1 of 1", W - mx, footerY + 20, { align: "right" });

  // ── SAVE ─────────────────────────────────────────────────
  doc.save(`Receipt-JinniChirag-${booking._id.slice(-8).toUpperCase()}.pdf`);
}

// ============================================================
// PROVIDER BADGE
// ============================================================

const ProviderBadge = ({ provider }: { provider: string | null }) => {
  if (!provider) return null;
  const isKhalti = provider === "khalti";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
        isKhalti
          ? "bg-purple-100 text-purple-700 border-purple-200"
          : "bg-blue-100 text-blue-700 border-blue-200"
      }`}
    >
      {isKhalti ? (
        <Wallet className="h-3 w-3" />
      ) : (
        <CreditCard className="h-3 w-3" />
      )}
      {isKhalti ? "Khalti" : "Razorpay"}
    </span>
  );
};

// ============================================================
// STATUS TIMELINE
// ============================================================

const StatusTimeline = ({ status }: { status: BookingStatusKey }) => {
  const isCancelled = status === "cancelled";
  const currentStep = STATUS_ORDER[status] ?? 0;

  return (
    <div className="flex items-center justify-between w-full px-1 sm:px-4">
      {STATUS_STEPS.map((step, idx) => {
        const isCompleted = !isCancelled && idx < currentStep;
        const isActive = !isCancelled && idx === currentStep;

        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-green-500 border-green-500 shadow-lg shadow-green-200"
                    : isActive
                    ? "bg-chirag-pink border-chirag-pink shadow-lg shadow-pink-200 ring-4 ring-pink-100"
                    : isCancelled && idx === 0
                    ? "bg-red-500 border-red-500"
                    : "bg-white border-gray-200"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                ) : isActive ? (
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                ) : isCancelled && idx === 0 ? (
                  <XCircle className="h-4 w-4 text-white" />
                ) : (
                  <span className="text-xs font-bold text-gray-300">
                    {idx + 1}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-semibold text-center leading-tight max-w-[56px] sm:max-w-[72px] ${
                  isCompleted
                    ? "text-green-600"
                    : isActive
                    ? "text-chirag-pink"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 sm:mx-2 rounded-full transition-all duration-500 ${
                  isCompleted ? "bg-green-400" : "bg-gray-100"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// BOOKING STATUS PAGE
// ============================================================

export default function BookingStatusPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusType | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // ── Data loader ──────────────────────────────────────────
  const loadBookingData = useCallback(
    async (silent = false) => {
      if (!bookingId) {
        setError("Invalid booking ID");
        setLoading(false);
        return;
      }
      try {
        if (!silent) setLoading(true);
        const { booking: data } = await bookingAPI.getBookingStatus(bookingId);
        setBooking(data);

        if (["approved", "confirmed", "completed"].includes(data.status)) {
          try {
            const paymentResponse = await bookingAPI.getPaymentStatus(
              bookingId
            );
            setPaymentStatus(paymentResponse);
          } catch {
            /* not available yet — not an error */
          }
        }

        setLastRefreshed(new Date());
        setError(null);
      } catch (err) {
        if (!silent)
          setError(
            err instanceof APIError
              ? err.message
              : "Failed to load booking details"
          );
      } finally {
        if (!silent) setLoading(false);
        setRefreshing(false);
      }
    },
    [bookingId]
  );

  useEffect(() => {
    loadBookingData();
    const iv = setInterval(() => loadBookingData(true), 15000);
    return () => clearInterval(iv);
  }, [loadBookingData]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadBookingData(true);
  };

  const handleDownloadReceipt = () => {
    if (!booking || !paymentStatus?.payment) return;
    setDownloadingReceipt(true);
    try {
      downloadReceiptPDF(booking, paymentStatus.payment);
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setTimeout(() => setDownloadingReceipt(false), 1400);
    }
  };

  // ── Status banner config ─────────────────────────────────
  const getStatusConfig = (status: string) => {
    const map: Record<
      string,
      {
        icon: React.ReactNode;
        bg: string;
        border: string;
        iconBg: string;
        text: string;
        label: string;
        description: string;
      }
    > = {
      pending: {
        icon: <Clock className="h-5 w-5 sm:h-6 sm:w-6" />,
        bg: "from-amber-50 to-yellow-50",
        border: "border-amber-200",
        iconBg: "bg-amber-100 text-amber-600",
        text: "text-amber-800",
        label: "Pending Approval",
        description:
          "Your booking is in the queue. We'll notify you via WhatsApp once approved.",
      },
      approved: {
        icon: <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />,
        bg: "from-blue-50 to-indigo-50",
        border: "border-blue-200",
        iconBg: "bg-blue-100 text-blue-600",
        text: "text-blue-800",
        label: "Approved — Payment Pending",
        description:
          "Great news! Your booking is approved. Complete payment to confirm your slot.",
      },
      confirmed: {
        icon: <BadgeCheck className="h-5 w-5 sm:h-6 sm:w-6" />,
        bg: "from-emerald-50 to-green-50",
        border: "border-emerald-200",
        iconBg: "bg-emerald-100 text-emerald-600",
        text: "text-emerald-800",
        label: "Confirmed ✓",
        description:
          "You're all set! Payment received. Your booking is officially confirmed.",
      },
      completed: {
        icon: <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />,
        bg: "from-purple-50 to-pink-50",
        border: "border-purple-200",
        iconBg: "bg-purple-100 text-purple-600",
        text: "text-purple-800",
        label: "Service Completed",
        description:
          "Thank you for choosing JinniChirag! We hope you loved the service. 💄",
      },
      cancelled: {
        icon: <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />,
        bg: "from-red-50 to-rose-50",
        border: "border-red-200",
        iconBg: "bg-red-100 text-red-500",
        text: "text-red-700",
        label: "Cancelled",
        description: "This booking has been cancelled.",
      },
    };
    return (
      map[status] ?? {
        icon: <AlertCircle className="h-5 w-5" />,
        bg: "from-gray-50 to-gray-50",
        border: "border-gray-200",
        iconBg: "bg-gray-100 text-gray-500",
        text: "text-gray-700",
        label: status,
        description: "",
      }
    );
  };

  // ── LOADING ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-pink-50/20 to-pink-100/30">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-20">
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-pink-100 animate-ping opacity-60" />
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-chirag-pink/10">
                <Loader2 className="h-7 w-7 animate-spin text-chirag-pink" />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">
              Loading your booking...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── ERROR ────────────────────────────────────────────────
  if (error || !booking) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-pink-50/20 to-pink-100/30">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-20 px-4">
          <div className="max-w-sm w-full text-center space-y-5">
            <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Booking Not Found
              </h2>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-chirag-pink text-white text-sm font-semibold rounded-xl hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200"
            >
              <Home className="h-4 w-4" /> Go to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Derived flags ─────────────────────────────────────────
  const statusConfig = getStatusConfig(booking.status);
  const needsPayment =
    booking.status === "approved" && booking.payment_status !== "paid";
  const paymentInitiated = booking.payment_status === "payment_pending";
  const isPaid =
    booking.status === "confirmed" || booking.status === "completed";
  const hasReceipt = isPaid && paymentStatus?.payment != null;

  // ── MAIN RENDER ──────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-pink-50/20 to-pink-100/30">
      <Navbar />

      {/* pt-20 — clears fixed navbar */}
      <main className="flex-grow w-full pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-5">
          {/* ── PAGE HEADER ── */}
          <div className="text-center pt-6 sm:pt-8 pb-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-playfair font-bold text-gray-900 mb-2">
              Booking Status
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-gray-400">
              <span>ID: #{booking._id.slice(-10).toUpperCase()}</span>
              <span>·</span>
              <button
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-1 hover:text-chirag-pink transition-colors"
              >
                <RefreshCw
                  className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">
                Updated {formatDateTime(lastRefreshed.toISOString())}
              </span>
            </div>
          </div>

          {/* ── STATUS BANNER ── */}
          <div
            className={`rounded-2xl border bg-gradient-to-br ${statusConfig.bg} ${statusConfig.border} p-4 sm:p-6`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${statusConfig.iconBg}`}
              >
                {statusConfig.icon}
              </div>
              <div className="flex-grow min-w-0">
                <h2
                  className={`text-base sm:text-lg font-bold mb-0.5 ${statusConfig.text}`}
                >
                  {statusConfig.label}
                </h2>
                <p className={`text-sm opacity-80 ${statusConfig.text}`}>
                  {statusConfig.description}
                </p>
              </div>
            </div>
          </div>

          {/* ── TIMELINE ── */}
          {booking.status !== "cancelled" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">
                Progress
              </p>
              <StatusTimeline status={booking.status as BookingStatusKey} />
            </div>
          )}

          {/* ── PAYMENT ACTION BANNER ── */}
          {needsPayment && (
            <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3 flex items-center gap-2">
                <Banknote className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">
                  Payment Required
                </span>
                {booking.payment_amount && (
                  <span className="ml-auto text-white font-bold text-sm">
                    {formatAmount(
                      booking.payment_amount,
                      booking.payment_currency
                    )}
                  </span>
                )}
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-gray-600 mb-4">
                  {paymentInitiated
                    ? "A previous payment session was not completed. Start a new one below."
                    : "Your booking has been approved! Check your WhatsApp for the payment link, or proceed below."}
                </p>
                <button
                  onClick={() => navigate(`/payment?booking_id=${bookingId}`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 hover:shadow-xl"
                >
                  <CreditCard className="h-4 w-4" />
                  {paymentInitiated ? "Retry Payment" : "Complete Payment"}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── PDF RECEIPT DOWNLOAD ── */}
          {hasReceipt && (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-grow">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Receipt className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-800">
                      PDF Receipt Ready
                    </p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      Download your official receipt for{" "}
                      {formatAmount(
                        paymentStatus!.payment!.amount,
                        paymentStatus!.payment!.currency
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadReceipt}
                  disabled={downloadingReceipt}
                  className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                >
                  {downloadingReceipt ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {downloadingReceipt ? "Generating PDF..." : "Download PDF"}
                </button>
              </div>
            </div>
          )}

          {/* ── BOOKING DETAILS CARD ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-chirag-pink to-pink-400 px-5 py-4 sm:px-6">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Booking Details
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="px-5 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem
                  icon={<Package className="h-3.5 w-3.5" />}
                  label="Service"
                  value={booking.service}
                />
                <DetailItem
                  icon={<Package className="h-3.5 w-3.5" />}
                  label="Package"
                  value={booking.package}
                />
                <DetailItem
                  icon={<Calendar className="h-3.5 w-3.5" />}
                  label="Event Date"
                  value={formatDate(booking.date)}
                  highlight
                />
                <DetailItem
                  icon={<MapPin className="h-3.5 w-3.5" />}
                  label="Location"
                  value={`${booking.address}, ${booking.pincode}`}
                />
              </div>
              <div className="px-5 sm:px-6 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Contact Info
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailItem
                    icon={<Mail className="h-3.5 w-3.5" />}
                    label="Email"
                    value={booking.email}
                  />
                  <DetailItem
                    icon={<Phone className="h-3.5 w-3.5" />}
                    label="Phone"
                    value={booking.phone}
                  />
                </div>
              </div>
              {booking.message && (
                <div className="px-5 sm:px-6 py-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Notes
                  </p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl leading-relaxed">
                    {booking.message}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── PAYMENT DETAILS CARD ── */}
          {paymentStatus?.payment && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-5 py-4 sm:px-6 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Payment Details
                </h2>
                <ProviderBadge
                  provider={paymentStatus.payment.provider ?? null}
                />
              </div>
              <div className="px-5 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem
                  icon={<Banknote className="h-3.5 w-3.5" />}
                  label="Amount Paid"
                  value={formatAmount(
                    paymentStatus.payment.amount,
                    paymentStatus.payment.currency
                  )}
                  highlight
                />
                <DetailItem
                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  label="Status"
                  value={paymentStatus.payment.status
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                />
                {paymentStatus.payment.method && (
                  <DetailItem
                    icon={<CreditCard className="h-3.5 w-3.5" />}
                    label="Method"
                    value={paymentStatus.payment.method.toUpperCase()}
                  />
                )}
                {paymentStatus.payment.processed_at && (
                  <DetailItem
                    icon={<Calendar className="h-3.5 w-3.5" />}
                    label="Paid On"
                    value={formatDateTime(paymentStatus.payment.processed_at)}
                  />
                )}
                {paymentStatus.payment.provider === "khalti" &&
                  paymentStatus.payment.pidx && (
                    <DetailItem
                      icon={<Wallet className="h-3.5 w-3.5" />}
                      label="Khalti PIDX"
                      value={paymentStatus.payment.pidx}
                      mono
                    />
                  )}
                {paymentStatus.payment.payment_id && (
                  <DetailItem
                    icon={<Package className="h-3.5 w-3.5" />}
                    label="Transaction ID"
                    value={paymentStatus.payment.payment_id}
                    mono
                  />
                )}
              </div>
            </div>
          )}

          {/* ── ACTION BUTTONS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 h-12 px-6 bg-white text-chirag-pink border-2 border-chirag-pink rounded-xl text-sm font-bold hover:bg-chirag-pink hover:text-white transition-all duration-200 shadow-sm"
            >
              <Home className="h-4 w-4" /> Back to Home
            </Link>
            <Link
              to="/book"
              className="flex items-center justify-center gap-2 h-12 px-6 bg-gradient-to-r from-chirag-pink to-pink-500 text-white rounded-xl text-sm font-bold hover:from-pink-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-pink-200 hover:shadow-xl"
            >
              <Calendar className="h-4 w-4" /> New Booking
            </Link>
          </div>

          <p className="text-center text-xs text-gray-400 pb-2">
            Page auto-refreshes every 15 seconds
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ============================================================
// DETAIL ITEM
// ============================================================

const DetailItem = ({
  icon,
  label,
  value,
  highlight = false,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
}) => (
  <div className="space-y-1 min-w-0">
    <p className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
      <span className="text-gray-300">{icon}</span>
      {label}
    </p>
    <p
      className={`text-sm break-words leading-snug ${
        highlight
          ? "font-bold text-gray-900"
          : mono
          ? "font-mono text-xs text-gray-600 break-all"
          : "font-medium text-gray-700"
      }`}
    >
      {value || "—"}
    </p>
  </div>
);
