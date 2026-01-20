import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Calendar,
  Mail,
  User,
  MapPin,
  Sparkles,
  CheckCircle2,
  Phone,
  X,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

/* -------------------- */
/* DATA */
/* -------------------- */

const SERVICES: Record<string, string[]> = {
  "Bridal Makeup": [
    "Chirag's Signature Bridal Makeup",
    "Luxury Bridal Makeup (HD / Brush)",
    "Reception / Engagement / Cocktail Makeup",
  ],
  "Party Makeup": [
    "Party Makeup – By Chirag Sharma",
    "Party Makeup – By Senior Artist",
  ],
  "Henna Art": ["Henna – By Chirag Sharma", "Henna – By Senior Artist"],
};

const COUNTRIES = ["Nepal", "India", "Pakistan", "Bangladesh", "Dubai"];

const COUNTRY_CODES: Record<string, string> = {
  Nepal: "+977",
  India: "+91",
  Pakistan: "+92",
  Bangladesh: "+880",
  Dubai: "+971",
};

export default function Book() {
  const emptyForm = {
    service: "",
    package: "",
    name: "",
    email: "",
    phone_country: "India",
    phone_number: "",
    service_country: "",
    address: "",
    pincode: "",
    date: "",
    message: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  /* -------------------- */
  /* HANDLERS */
  /* -------------------- */

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: value,
      ...(name === "service" ? { package: "" } : {}),
    }));
  };

  const fullPhone =
    COUNTRY_CODES[formData.phone_country] + formData.phone_number;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setOtpError("");

    try {
      const res = await fetch(`${API_BASE}/bookings/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phone: fullPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to send OTP");

      setBookingId(data.booking_id);
      setShowOtpModal(true);
      setResendTimer(30);
      setCanResend(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!bookingId || otp.length !== 6) return;

    try {
      const res = await fetch(`${API_BASE}/bookings/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: bookingId,
          otp,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invalid OTP");

      setShowOtpModal(false);
      setShowSuccess(true);
      setFormData(emptyForm);
      setOtp("");
      setBookingId(null);

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      setOtpError(err.message || "Invalid OTP");
    }
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtp("");
    setBookingId(null);
    setOtpError("Booking request was not completed.");
  };

  /* -------------------- */
  /* RESEND TIMER */
  /* -------------------- */

  useEffect(() => {
    if (!showOtpModal || canResend) return;

    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showOtpModal, canResend]);

  const resendOtp = async () => {
    if (!bookingId) return;

    setCanResend(false);
    setResendTimer(30);
    setOtp("");
    setOtpError("");

    try {
      await fetch(`${API_BASE}/bookings/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          booking_id: bookingId,
          phone: fullPhone,
        }),
      });
    } catch {
      setOtpError("Failed to resend OTP");
    }
  };

  /* -------------------- */
  /* UI */
  /* -------------------- */

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <section className="pt-28 pb-16 bg-gradient-to-br from-pink-50 via-white to-purple-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full mb-4 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Book Your Service
              </h1>
              <p className="text-gray-600 mt-2">
                Fill in the details to complete your booking
              </p>
            </div>

            {showSuccess && (
              <div className="mb-6 rounded-xl bg-green-100 border border-green-300 px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2 text-green-800 font-semibold">
                  <CheckCircle2 /> Booking confirmed successfully!
                </div>
              </div>
            )}

            {otpError && !showOtpModal && (
              <div className="mb-6 rounded-xl bg-red-100 border border-red-300 px-6 py-3 text-center text-red-700">
                {otpError}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl space-y-8"
            >
              {/* Service */}
              <div className="grid md:grid-cols-2 gap-6">
                <SelectField
                  label="Service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                >
                  <option value="">Select Service</option>
                  {Object.keys(SERVICES).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </SelectField>

                <SelectField
                  label="Package"
                  name="package"
                  value={formData.package}
                  onChange={handleChange}
                >
                  <option value="">Select Package</option>
                  {formData.service &&
                    SERVICES[formData.service].map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                </SelectField>
              </div>

              {/* Personal */}
              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  icon={<User />}
                  onChange={handleChange}
                />

                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  icon={<Mail />}
                  onChange={handleChange}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <Phone /> Phone Number
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-3">
                  <select
                    className="border rounded-xl px-3 py-3"
                    value={formData.phone_country}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        phone_country: e.target.value,
                      }))
                    }
                  >
                    {Object.keys(COUNTRY_CODES).map((c) => (
                      <option key={c} value={c}>
                        {COUNTRY_CODES[c]} {c}
                      </option>
                    ))}
                  </select>

                  <input
                    className="border rounded-xl px-4 py-3"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        phone_number: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="Mobile number"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid md:grid-cols-3 gap-6 items-start">
                <SelectField
                  label="Service Country"
                  name="service_country"
                  value={formData.service_country}
                  onChange={handleChange}
                >
                  <option value="">Select Country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </SelectField>

                <InputField
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  icon={<MapPin />}
                  onChange={handleChange}
                />

                <InputField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <InputField
                label="Preferred Date"
                name="date"
                type="date"
                value={formData.date}
                icon={<Calendar />}
                onChange={handleChange}
              />

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Additional notes"
                className="w-full border rounded-xl p-4 min-h-[120px]"
              />

              <button
                disabled={loading}
                className="w-full bg-pink-400 hover:bg-pink-500 disabled:opacity-60 text-white py-4 rounded-xl font-semibold"
              >
                {loading ? "Sending OTP..." : "Request Booking"}
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />

      {/* OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 relative">
            <button onClick={closeOtpModal} className="absolute top-3 right-3">
              <X />
            </button>

            <h3 className="font-semibold mb-4 text-center">Enter OTP</h3>

            <input
              className="w-full border p-3 rounded mb-2 text-center tracking-widest"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ""));
                setOtpError("");
              }}
              maxLength={6}
            />

            {otpError && (
              <p className="text-red-500 text-sm text-center mb-2">
                {otpError}
              </p>
            )}

            <button
              onClick={verifyOtp}
              disabled={otp.length !== 6}
              className={`w-full py-2 rounded font-semibold ${
                otp.length !== 6
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-pink-400 hover:bg-pink-500 text-white"
              }`}
            >
              Verify OTP
            </button>

            <div className="text-center mt-4 text-sm text-gray-600">
              {canResend ? (
                <button
                  onClick={resendOtp}
                  className="text-pink-500 font-semibold"
                >
                  Resend OTP
                </button>
              ) : (
                <>Resend OTP in {resendTimer}s</>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- */
/* COMPONENTS */
/* -------------------- */

const InputField = ({ label, icon, value, ...props }: any) => (
  <div className="flex flex-col">
    <label className="flex items-center gap-2 text-sm font-semibold mb-2 min-h-[24px]">
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label}
    </label>

    <input
      {...props}
      value={value}
      className="w-full border rounded-xl px-4 py-3"
    />
  </div>
);


const SelectField = ({ label, children, ...props }: any) => (
  <div className="flex flex-col">
    <label className="text-sm font-semibold mb-2 min-h-[24px]">
      {label}
    </label>

    <select {...props} className="w-full border rounded-xl px-4 py-3">
      {children}
    </select>
  </div>
);
