import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
  MessageSquare,
  Shield,
  CreditCard,
  Ticket,
  CheckCircle,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  Globe,
  Tag,
} from "lucide-react";
import type { EventItem } from "../../types/event";

const API_BASE = import.meta.env.VITE_API_URL;

// ─── Types ──────────────────────────────────────────────────────────────────

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  phone_country: string;
  price_category_name: string;
  message: string;
}

interface BookingSession {
  booking_id: string;
  base_amount: number;
  base_currency: string;
}

interface PaymentOption {
  provider: "razorpay" | "khalti";
  currency: string;
  amount: number;
  amount_display: string;
  label: string;
  description: string;
}

interface TicketInfo {
  booking_id: string;
  ticket_code: string;
  event_title: string;
  price_category: string;
}

type Step = "form" | "otp" | "payment" | "ticket";

interface EventBookingModalProps {
  event: EventItem;
  onClose: () => void;
}

// ─── Country Options ─────────────────────────────────────────────────────────

const COUNTRIES = [
  { label: "India", code: "+91", flag: "🇮🇳" },
  { label: "Nepal", code: "+977", flag: "🇳🇵" },
  { label: "USA", code: "+1", flag: "🇺🇸" },
  { label: "UK", code: "+44", flag: "🇬🇧" },
  { label: "UAE", code: "+971", flag: "🇦🇪" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const s = document.createElement("script");
    s.id = "razorpay-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

const EventBookingModal: React.FC<EventBookingModalProps> = ({
  event,
  onClose,
}) => {
  const [step, setStep] = useState<Step>("form");
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Form
  const [form, setForm] = useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    phone_country: "India",
    price_category_name:
      event.price_details?.[0]?.name ?? "",
    message: "",
  });
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryDrop, setShowCountryDrop] = useState(false);

  // OTP
  const [tempBookingId, setTempBookingId] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Payment
  const [session, setSession] = useState<BookingSession | null>(null);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  // Ticket
  const [ticket, setTicket] = useState<TicketInfo | null>(null);

  // ── OTP countdown ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (otpResendTimer <= 0) return;
    const t = setInterval(() => {
      setOtpResendTimer((p) => Math.max(0, p - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [otpResendTimer]);

  // ── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 220);
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  function validateForm(): string {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Valid email is required";
    if (!form.phone.trim()) return "Phone number is required";
    if (!form.price_category_name) return "Please select a price category";
    return "";
  }

  // ── Step 1: Submit booking request ────────────────────────────────────────
  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateForm();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    try {
      const phone = `${selectedCountry.code}${form.phone.replace(/\D/g, "")}`;
      const res = await fetch(`${API_BASE}/public/events/bookings/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id,
          price_category_name: form.price_category_name,
          name: form.name,
          email: form.email,
          phone,
          phone_country: selectedCountry.label,
          message: form.message,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to send OTP");
      setTempBookingId(data.booking_id);
      setOtpResendTimer(300);
      setStep("otp");
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    const otpStr = otp.join("");
    if (otpStr.length !== 6) { setError("Enter all 6 digits"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/public/events/bookings/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: tempBookingId, otp: otpStr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invalid OTP");
      setSession({
        booking_id: data.booking_id,
        base_amount: data.base_amount,
        base_currency: data.base_currency,
      });
      // Fetch payment options
      const bookRes = await fetch(
        `${API_BASE}/public/events/bookings/${data.booking_id}`
      );
      const bookData = await bookRes.json();
      setPaymentOptions(bookData.payment_options || []);
      setStep("payment");
    } catch (e: any) {
      setError(e.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (otpResendTimer > 0) return;
    setError("");
    setLoading(true);
    try {
      const phone = `${selectedCountry.code}${form.phone.replace(/\D/g, "")}`;
      const res = await fetch(`${API_BASE}/public/events/bookings/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id,
          price_category_name: form.price_category_name,
          name: form.name,
          email: form.email,
          phone,
          phone_country: selectedCountry.label,
          message: form.message,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to resend OTP");
      setTempBookingId(data.booking_id);
      setOtpResendTimer(300);
      setOtp(["", "", "", "", "", ""]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── OTP input handling ─────────────────────────────────────────────────────
  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  }

  // ── Step 3: Create payment ────────────────────────────────────────────────
  async function handlePayment(provider: "razorpay" | "khalti") {
    if (!session) return;
    setPaymentLoading(provider);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/public/events/bookings/${session.booking_id}/create-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Payment creation failed");

      if (provider === "razorpay") {
        await initiateRazorpay(data);
      } else {
        // Khalti — redirect
        if (data.payment_url) {
          window.location.href = data.payment_url;
        } else {
          throw new Error("No payment URL received from Khalti");
        }
      }
    } catch (e: any) {
      setError(e.message || "Payment failed");
    } finally {
      setPaymentLoading(null);
    }
  }

  async function initiateRazorpay(data: any) {
    const loaded = await loadRazorpayScript();
    if (!loaded) { setError("Failed to load Razorpay. Please try again."); return; }

    const rzp = new (window as any).Razorpay({
      key: data.key_id,
      amount: data.amount,
      currency: data.currency,
      name: "JinniChirag",
      description: event.title,
      order_id: data.order_id,
      prefill: { name: form.name, email: form.email, contact: `${selectedCountry.code}${form.phone}` },
      theme: { color: "#ec4899" },
      handler: async (response: any) => {
        await verifyRazorpay(response, data.booking_id || session!.booking_id);
      },
      modal: {
        ondismiss: async () => {
          try {
            await fetch(`${API_BASE}/public/events/bookings/payment-failed`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                booking_id: session!.booking_id,
                reason: "User dismissed payment modal",
                provider: "razorpay",
              }),
            });
          } catch {}
          setError("Payment was cancelled. You can try again.");
          setPaymentLoading(null);
        },
      },
    });
    rzp.open();
  }

  async function verifyRazorpay(response: any, bookingId: string) {
    setPaymentLoading("verifying");
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/public/events/bookings/razorpay/verify-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            booking_id: bookingId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Payment verification failed");
      setTicket({
        booking_id: bookingId,
        ticket_code: data.ticket_code,
        event_title: event.title,
        price_category: form.price_category_name,
      });
      setStep("ticket");
    } catch (e: any) {
      setError(e.message || "Payment verification failed");
    } finally {
      setPaymentLoading(null);
    }
  }

  function handleCopyTicket() {
    if (!ticket) return;
    navigator.clipboard.writeText(ticket.ticket_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const steps: Step[] = ["form", "otp", "payment", "ticket"];
  const stepIndex = steps.indexOf(step);

  const stepLabels = ["Details", "Verify", "Payment", "Ticket"];

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-220 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative z-10 w-full sm:max-w-lg bg-gray-950 border-0 sm:border sm:border-white/10 sm:rounded-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] shadow-2xl transition-all duration-220 ${
          isClosing
            ? "translate-y-full sm:translate-y-4 sm:opacity-0"
            : "translate-y-0 sm:opacity-100"
        }`}
        style={{
          boxShadow: "0 0 60px rgba(236,72,153,0.15), 0 25px 60px rgba(0,0,0,0.8)",
        }}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-white/5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
              {step === "ticket" ? "Your Ticket 🎫" : "Book Your Seat"}
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-0.5 truncate max-w-[260px]">
              {event.title}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2.5 rounded-full bg-white/5 hover:bg-red-500/80 text-gray-400 hover:text-white transition-all active:scale-90 border border-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator */}
        {step !== "ticket" && (
          <div className="flex-shrink-0 px-5 sm:px-6 pt-4 pb-2">
            <div className="flex items-center gap-0">
              {stepLabels.slice(0, 3).map((label, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                        i < stepIndex
                          ? "bg-pink-500 border-pink-500 text-white"
                          : i === stepIndex
                          ? "bg-pink-500/20 border-pink-500 text-pink-400"
                          : "bg-white/5 border-white/10 text-gray-500"
                      }`}
                    >
                      {i < stepIndex ? <Check size={12} /> : i + 1}
                    </div>
                    <span
                      className={`text-[10px] font-medium ${
                        i <= stepIndex ? "text-pink-400" : "text-gray-600"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      className={`flex-1 h-px mx-1 mb-4 transition-all ${
                        i < stepIndex ? "bg-pink-500" : "bg-white/10"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-5 sm:mx-6 mt-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* ── STEP 1: Form ── */}
          {step === "form" && (
            <form onSubmit={handleFormSubmit} className="px-5 sm:px-6 py-4 space-y-4">
              {/* Price Category */}
              {event.price_details && event.price_details.length > 1 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                    Select Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {event.price_details.map((cat) => (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() =>
                          setForm((p) => ({ ...p, price_category_name: cat.name }))
                        }
                        className={`p-3 rounded-xl border text-left transition-all ${
                          form.price_category_name === cat.name
                            ? "bg-pink-500/20 border-pink-500 text-white"
                            : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Tag size={12} className="text-pink-400" />
                          <span className="text-xs font-bold">{cat.name}</span>
                        </div>
                        <div className="text-pink-400 font-bold text-base">
                          ₹{cat.price.toLocaleString()}
                        </div>
                        {cat.available_seats !== undefined && (
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            {cat.available_seats} seats left
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {event.price_details?.length === 1 && (
                <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium">
                      {event.price_details[0].name}
                    </span>
                    <span className="text-pink-400 font-bold text-lg">
                      ₹{event.price_details[0].price.toLocaleString()}
                    </span>
                  </div>
                  {event.price_details[0].available_seats !== undefined && (
                    <div className="text-gray-400 text-xs mt-1">
                      {event.price_details[0].available_seats} seats available
                    </div>
                  )}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your full name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:bg-pink-500/5 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:bg-pink-500/5 transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  WhatsApp Number
                </label>
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDrop((p) => !p)}
                      className="flex items-center gap-1.5 px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white hover:border-white/20 transition-all whitespace-nowrap"
                    >
                      <span>{selectedCountry.flag}</span>
                      <span className="text-gray-300">{selectedCountry.code}</span>
                    </button>
                    {showCountryDrop && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-gray-900 border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl">
                        {COUNTRIES.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c);
                              setForm((p) => ({ ...p, phone_country: c.label }));
                              setShowCountryDrop(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all text-left"
                          >
                            <span>{c.flag}</span>
                            <span>{c.label}</span>
                            <span className="text-gray-500 ml-auto">{c.code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative flex-1">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          phone: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      placeholder="9876543210"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:bg-pink-500/5 transition-all"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-gray-600 mt-1.5 flex items-center gap-1">
                  <Globe size={10} />
                  OTP will be sent to this WhatsApp number
                </p>
              </div>

              {/* Message (optional) */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Message{" "}
                  <span className="text-gray-600 normal-case font-normal">
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <MessageSquare
                    size={15}
                    className="absolute left-3.5 top-3.5 text-gray-500"
                  />
                  <textarea
                    value={form.message}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, message: e.target.value }))
                    }
                    placeholder="Any special requirements..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:bg-pink-500/5 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="pb-2" />
            </form>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="px-5 sm:px-6 py-6">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <Shield size={22} className="text-green-400" />
                </div>
                <p className="text-white font-semibold">Verify Your Number</p>
                <p className="text-gray-400 text-sm mt-1">
                  OTP sent to WhatsApp:{" "}
                  <span className="text-white font-medium">
                    {selectedCountry.code} {form.phone}
                  </span>
                </p>
              </div>

              {/* OTP Inputs */}
              <div
                className="flex justify-center gap-2 sm:gap-3 mb-6"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-11 h-14 sm:w-12 sm:h-16 rounded-xl border text-center text-xl font-bold text-white bg-white/5 focus:outline-none transition-all ${
                      digit
                        ? "border-pink-500 bg-pink-500/10"
                        : "border-white/10 focus:border-pink-500/50"
                    }`}
                  />
                ))}
              </div>

              {/* Resend */}
              <div className="text-center mb-6">
                {otpResendTimer > 0 ? (
                  <p className="text-gray-500 text-sm">
                    Resend in{" "}
                    <span className="text-pink-400 font-bold">
                      {Math.floor(otpResendTimer / 60)}:
                      {String(otpResendTimer % 60).padStart(2, "0")}
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-pink-400 text-sm hover:text-pink-300 mx-auto transition-colors"
                  >
                    <RefreshCw size={14} />
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep("form")}
                className="flex items-center gap-1 text-gray-500 text-sm hover:text-gray-300 transition-colors mb-4"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            </form>
          )}

          {/* ── STEP 3: Payment ── */}
          {step === "payment" && (
            <div className="px-5 sm:px-6 py-5">
              <div className="mb-5">
                <p className="text-white font-semibold mb-1">Choose Payment Method</p>
                <p className="text-gray-400 text-sm">
                  Select how you'd like to pay for your seat.
                </p>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Event</span>
                  <span className="text-white text-sm font-medium truncate max-w-[180px]">
                    {event.title}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Category</span>
                  <span className="text-white text-sm">{form.price_category_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Attendee</span>
                  <span className="text-white text-sm">{form.name}</span>
                </div>
              </div>

              {/* Payment Options */}
              <div className="space-y-3">
                {paymentOptions.map((opt) => (
                  <button
                    key={opt.provider}
                    onClick={() => handlePayment(opt.provider)}
                    disabled={!!paymentLoading}
                    className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:border-pink-500/40 hover:bg-pink-500/5 transition-all text-left group disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                          <CreditCard size={18} className="text-pink-400" />
                        </div>
                        <div>
                          <div className="text-white font-semibold text-sm">
                            {opt.label}
                          </div>
                          <div className="text-gray-400 text-xs">{opt.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-pink-400 font-bold text-base">
                          {opt.amount_display}
                        </div>
                        {paymentLoading === opt.provider ? (
                          <Loader2 size={16} className="text-pink-400 animate-spin ml-auto mt-0.5" />
                        ) : (
                          <ChevronRight
                            size={16}
                            className="text-gray-600 group-hover:text-pink-400 ml-auto mt-0.5 transition-colors"
                          />
                        )}
                      </div>
                    </div>
                  </button>
                ))}

                {paymentLoading === "verifying" && (
                  <div className="flex items-center justify-center gap-2 py-4 text-gray-400 text-sm">
                    <Loader2 size={18} className="animate-spin text-pink-400" />
                    Verifying payment...
                  </div>
                )}

                {paymentOptions.length === 0 && !paymentLoading && (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    No payment options available. Please contact support.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 4: Ticket ── */}
          {step === "ticket" && ticket && (
            <div className="px-5 sm:px-6 py-6">
              {/* Success */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-3 animate-bounce-once">
                  <CheckCircle size={28} className="text-green-400" />
                </div>
                <h3 className="text-white font-bold text-lg">Booking Confirmed!</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Your ticket has been sent to your WhatsApp.
                </p>
              </div>

              {/* Ticket Card */}
              <div
                className="relative rounded-2xl overflow-hidden border border-pink-500/20 mb-5"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(168,85,247,0.08) 100%)",
                  boxShadow: "0 0 40px rgba(236,72,153,0.1)",
                }}
              >
                {/* Dotted divider */}
                <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-white/10" />
                <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-950 border border-white/10" />
                <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-950 border border-white/10" />

                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Ticket size={14} className="text-pink-400" />
                    <span className="text-pink-400 text-xs font-bold uppercase tracking-widest">
                      Event Ticket
                    </span>
                  </div>
                  <h4 className="text-white font-bold text-base leading-tight mb-1">
                    {ticket.event_title}
                  </h4>
                  <p className="text-gray-400 text-sm">{ticket.price_category}</p>
                  <p className="text-gray-500 text-sm">{form.name}</p>
                </div>

                <div className="border-t border-dashed border-white/10 px-5 py-4">
                  <p className="text-gray-500 text-xs mb-1.5">Ticket Code</p>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-xl font-bold tracking-widest"
                      style={{
                        background: "linear-gradient(90deg, #ec4899, #a855f7)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {ticket.ticket_code}
                    </span>
                    <button
                      onClick={handleCopyTicket}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-90"
                    >
                      {copied ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  <p className="text-gray-600 text-xs mt-2">
                    Show this code at the event entry
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Footer CTA (only for form/otp steps) */}
        {(step === "form" || step === "otp") && (
          <div className="flex-shrink-0 px-5 sm:px-6 py-4 border-t border-white/5 bg-gray-950">
            <button
              onClick={
                step === "form"
                  ? handleFormSubmit as any
                  : handleOtpSubmit as any
              }
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {step === "form" ? "Sending OTP..." : "Verifying..."}
                </>
              ) : (
                <>
                  {step === "form" ? "Get OTP on WhatsApp" : "Verify & Continue"}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventBookingModal;