// src/user/pages/BookPage.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import { bookingAPI, APIError, type BookingRequest } from "@user/services/api";

const SERVICES: Record<string, string[]> = {
  "Bridal Makeup Services": [
    "Chirag's Signature Bridal Makeup",
    "Luxury Bridal Makeup (HD / Brush)",
    "Reception / Engagement / Cocktail Makeup",
  ],
  "Party Makeup Services": [
    "Party Makeup – By Chirag Sharma",
    "Party Makeup – By Senior Artist",
  ],
  "Haldi & Mehendi Makeup Services": [
    "Haldi / Mehendi Makeup – By Chirag Sharma",
    "Haldi / Mehendi Makeup – By Senior Artist",
  ],
  "Groom Makeup Services": [
    "Picture Perfect Photo-Ready Makeup",
    "Wedding Reception Groom Makeup",
  ],
};

const COUNTRIES = ["Nepal", "India", "Pakistan", "Bangladesh", "Dubai"];

const COUNTRY_CODES: Record<string, string> = {
  Nepal: "+977",
  India: "+91",
  Pakistan: "+92",
  Bangladesh: "+880",
  Dubai: "+971",
};

type FormState = {
  service: string;
  package: string;
  name: string;
  email: string;
  phone_country: string;
  phone_number: string;
  service_country: string;
  address: string;
  pincode: string;
  date: string;
  message: string;
};

export default function BookPage() {
  const navigate = useNavigate();
  
  const emptyForm: FormState = {
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

  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  const otpInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: value,
      ...(name === "service" ? { package: "" } : {}),
    }));
  };

  const fullPhone =
    COUNTRY_CODES[formData.phone_country] + formData.phone_number;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOtpError("");

    try {
      const requestData: BookingRequest = {
        service: formData.service,
        package: formData.package,
        name: formData.name,
        email: formData.email,
        phone: fullPhone,
        phone_country: formData.phone_country,
        service_country: formData.service_country,
        address: formData.address,
        pincode: formData.pincode,
        date: formData.date,
        message: formData.message || undefined,
      };

      const data = await bookingAPI.requestBooking(requestData);

      setBookingId(data.booking_id);
      setShowOtpModal(true);
      setResendTimer(30);
      setCanResend(false);
    } catch (err) {
      if (err instanceof APIError) {
        alert(err.message);
      } else {
        alert("Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!bookingId || otp.length !== 6) return;

    try {
      const data = await bookingAPI.verifyOTP({
        booking_id: bookingId,
        otp,
      });

      setShowOtpModal(false);
      setShowSuccess(true);
      setConfirmedBookingId(data.booking_id);
      setFormData(emptyForm);
      setOtp("");
      setBookingId(null);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        // Optionally navigate to booking status page
        // navigate(`/booking-status/${data.booking_id}`);
      }, 5000);
    } catch (err) {
      if (err instanceof APIError) {
        setOtpError(err.message);
      } else {
        setOtpError("Invalid OTP. Please try again.");
      }
    }
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtp("");
    setBookingId(null);
    setOtpError("");
  };

  useEffect(() => {
    if (!showOtpModal) return;
    otpInputRef.current?.focus();
  }, [showOtpModal]);

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
      const requestData: BookingRequest = {
        service: formData.service,
        package: formData.package,
        name: formData.name,
        email: formData.email,
        phone: fullPhone,
        phone_country: formData.phone_country,
        service_country: formData.service_country,
        address: formData.address,
        pincode: formData.pincode,
        date: formData.date,
        message: formData.message || undefined,
        booking_id: bookingId,
      };

      await bookingAPI.requestBooking(requestData);
    } catch (err) {
      setOtpError("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navbar />

      <main className="flex-grow w-full">
        <section className="pt-[min(20vh,5rem)] pb-4 bg-white">
          <div className="max-w-screen-md mx-auto px-[clamp(0.75rem,4vw,1.25rem)] text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-chirag-pink to-pink-200 border border-chirag-pink/40 shadow-lg">
              <Sparkles className="h-7 w-7 text-chirag-darkPurple" />
            </div>

            <h1 className="text-[clamp(1.5rem,4vw,2.5rem)] font-playfair font-bold leading-tight">
              Book Your <span className="header-gradient">Service</span>
            </h1>

            <p className="mt-2 text-[clamp(0.75rem,2.5vw,1rem)] text-gray-600 max-w-prose mx-auto">
              Fill in the details below to confirm your personalized makeup experience.
            </p>
          </div>
        </section>

        <section className="pb-12 bg-gradient-to-b from-white to-chirag-pink/10">
          <div className="max-w-screen-md mx-auto px-[clamp(0.75rem,4vw,1.25rem)]">
            {showSuccess && (
              <div className="mb-4 rounded-xl bg-green-100 border border-green-300 px-4 py-3">
                <div className="flex items-center justify-center gap-2 text-green-800 font-semibold text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Booking confirmed! We'll notify you once approved.</span>
                </div>
                {confirmedBookingId && (
                  <div className="mt-2 text-center">
                    <button
                      onClick={() => navigate(`/booking-status/${confirmedBookingId}`)}
                      className="text-xs text-green-700 underline hover:text-green-900"
                    >
                      View booking status
                    </button>
                  </div>
                )}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-xl p-[clamp(0.75rem,3vw,1.5rem)] space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SelectField
                  label="Service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
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
                  required
                >
                  <option value="">Select Package</option>
                  {formData.service &&
                    SERVICES[formData.service].map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                </SelectField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField
                  label="Full Name"
                  name="name"
                  icon={<User className="h-4 w-4" />}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  icon={<Mail className="h-4 w-4" />}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-1 text-xs font-semibold">
                  <Phone className="h-4 w-4" /> Phone
                </label>
                <div className="grid grid-cols-[minmax(4.5rem,6rem)_1fr] gap-2">
                  <select
                    className="min-h-[2.75rem] w-full rounded-lg border px-2 text-sm focus:border-chirag-pink focus:outline-none"
                    value={formData.phone_country}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        phone_country: e.target.value,
                      }))
                    }
                    required
                  >
                    {Object.keys(COUNTRY_CODES).map((c) => (
                      <option key={c} value={c}>
                        {COUNTRY_CODES[c]}
                      </option>
                    ))}
                  </select>

                  <input
                    className="min-h-[2.75rem] w-full rounded-lg border px-3 text-sm focus:border-chirag-pink focus:outline-none"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        phone_number: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    inputMode="numeric"
                    placeholder="Mobile number"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <SelectField
                  label="Country"
                  name="service_country"
                  value={formData.service_country}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </SelectField>

                <InputField
                  label="Pincode"
                  name="pincode"
                  icon={<MapPin className="h-4 w-4" />}
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                />

                <InputField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <InputField
                label="Date"
                name="date"
                type="date"
                icon={<Calendar className="h-4 w-4" />}
                value={formData.date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />

              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1">Notes (Optional)</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="min-h-[5rem] w-full rounded-lg border px-3 py-2 text-sm resize-none focus:border-chirag-pink focus:outline-none"
                />
              </div>

              <button
                disabled={loading}
                className="min-h-[3rem] w-full rounded-lg font-semibold text-sm button-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Sending OTP..." : "Request Booking"}
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />

      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <button
              onClick={closeOtpModal}
              className="absolute right-3 top-3 rounded-lg p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="mb-4 text-center text-lg font-semibold">
              Enter OTP
            </h3>

            <input
              ref={otpInputRef}
              className="mb-2 w-full rounded-lg border-2 px-3 py-3 text-center text-xl font-semibold tracking-widest focus:border-chirag-pink focus:outline-none"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ""));
                setOtpError("");
              }}
              maxLength={6}
              inputMode="numeric"
            />

            {otpError && (
              <p className="mb-2 text-center text-xs text-red-500">
                {otpError}
              </p>
            )}

            <button
              onClick={verifyOtp}
              disabled={otp.length !== 6}
              className={`min-h-[3rem] w-full rounded-lg font-semibold text-sm ${
                otp.length !== 6
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "button-primary"
              }`}
            >
              Verify OTP
            </button>

            <div className="mt-3 text-center text-xs text-gray-600">
              {canResend ? (
                <button
                  onClick={resendOtp}
                  className="font-semibold text-chirag-pink hover:underline"
                >
                  Resend OTP
                </button>
              ) : (
                <>Resend in {resendTimer}s</>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const InputField = ({
  label,
  icon,
  ...props
}: {
  label: string;
  icon?: React.ReactNode;
  [key: string]: any;
}) => (
  <div className="flex flex-col gap-1">
    <label className="flex items-center gap-1 text-xs font-semibold">
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label}
    </label>
    <input
      {...props}
      className="min-h-[2.75rem] w-full rounded-lg border px-3 text-sm focus:border-chirag-pink focus:outline-none"
    />
  </div>
);

const SelectField = ({
  label,
  children,
  ...props
}: {
  label: string;
  children: React.ReactNode;
  [key: string]: any;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold">{label}</label>
    <select
      {...props}
      className="min-h-[2.75rem] w-full rounded-lg border px-3 text-sm focus:border-chirag-pink focus:outline-none"
    >
      {children}
    </select>
  </div>
);