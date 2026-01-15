import { useSearchParams } from "react-router-dom";
import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "sonner";
import { Calendar, Mail, User, MapPin } from "lucide-react";

/* -------------------- */
/* Data */
/* -------------------- */
const SERVICES = {
  "Bridal Makeup": ["Classic Bridal", "Premium Bridal"],
  "Party Makeup": ["Classic Glam", "Premium Glam"],
  "Editorial Makeup": ["Standard Editorial", "Avant-Garde Editorial"],
  "Henna Art": ["Simple Henna", "Bridal Henna"],
};

const COUNTRIES = ["Nepal", "India", "Pakistan", "Bangladesh", "Dubai"];

const COUNTRY_CODES: Record<string, string> = {
  Nepal: "+977",
  India: "+91",
  Pakistan: "+92",
  Bangladesh: "+880",
  Dubai: "+971",
};

interface BookingFormData {
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
}

const Book = (): JSX.Element => {
  const [params] = useSearchParams();

  const emptyForm: BookingFormData = {
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

  const [formData, setFormData] = useState<BookingFormData>({
    ...emptyForm,
    service: params.get("service") || "",
    package: params.get("package") || "",
  });

  const [otp, setOtp] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const fullPhone =
      COUNTRY_CODES[formData.phone_country] + formData.phone_number;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/bookings/request`,
        { ...formData, phone: fullPhone }
      );

      setBookingId(res.data.booking_id);
      setShowOtpModal(true);
      toast.success("OTP sent to your WhatsApp number");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/bookings/verify-otp`,
        { booking_id: bookingId, otp }
      );

      setShowOtpModal(false);
      setShowSuccess(true);
      setFormData(emptyForm);
      setOtp("");
      setBookingId("");

      setTimeout(() => setShowSuccess(false), 2500);
    } catch {
      toast.error("Invalid OTP");
    }
  };

  return (
    <>
      <Navbar />

      <section className="pt-28 pb-10">
        <div className="container-custom max-w-4xl">
          {showSuccess && (
            <div className="mb-6 rounded-xl bg-green-100 border border-green-300 px-6 py-4 text-green-800 text-center font-medium">
              🎉 Your booking request has been sent successfully!
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl space-y-8"
          >
            {/* Service */}
            <div className="grid md:grid-cols-2 gap-6">
              <SelectField label="Service" name="service" value={formData.service} onChange={handleChange}>
                <option value="">Select Service</option>
                {Object.keys(SERVICES).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </SelectField>

              <SelectField label="Package" name="package" value={formData.package} onChange={handleChange}>
                <option value="">Select Package</option>
                {formData.service &&
                  SERVICES[formData.service as keyof typeof SERVICES].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
              </SelectField>
            </div>

            {/* Personal */}
            <div className="grid md:grid-cols-2 gap-6">
              <InputField label="Full Name" name="name" value={formData.name} icon={<User size={16} />} onChange={handleChange} />
              <InputField label="Email" name="email" value={formData.email} type="email" icon={<Mail size={16} />} onChange={handleChange} />
            </div>

            {/* Phone — FIXED */}
            <div>
              <label className="text-sm">Phone Number</label>

              <div className="grid grid-cols-[110px_1fr] gap-2 w-full">
                <select
                  className="w-full min-w-0 border rounded-xl px-2 py-2 text-sm truncate appearance-none bg-white"
                  value={formData.phone_country}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone_country: e.target.value,
                    }))
                  }
                >
                  {Object.keys(COUNTRY_CODES).map((c) => (
                    <option key={c} value={c}>
                      {COUNTRY_CODES[c]}
                    </option>
                  ))}
                </select>

                <input
                  className="w-full min-w-0 border rounded-xl px-4 py-2"
                  placeholder="Enter phone number"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone_number: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid md:grid-cols-3 gap-6">
              <SelectField label="Service Country" name="service_country" value={formData.service_country} onChange={handleChange}>
                <option value="">Select Country</option>
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </SelectField>

              <InputField label="Pincode" name="pincode" value={formData.pincode} icon={<MapPin size={16} />} onChange={handleChange} />
              <InputField label="Address" name="address" value={formData.address} onChange={handleChange} />
            </div>

            <InputField label="Date" name="date" type="date" value={formData.date} icon={<Calendar size={16} />} onChange={handleChange} />

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Additional notes"
              className="w-full border rounded-xl p-3"
            />

            <button className="w-full bg-pink-400 py-3 rounded-xl font-semibold">
              Request Booking
            </button>
          </form>
        </div>
      </section>

      {/* OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-80">
            <h3 className="font-semibold mb-4">Enter OTP</h3>
            <input
              className="w-full border p-2 rounded mb-4"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={verifyOtp} className="w-full bg-pink-400 py-2 rounded">
              Verify OTP
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Book;

/* -------------------- */
/* Helpers */
/* -------------------- */

const InputField = ({ label, icon, value, ...props }: any) => (
  <div>
    <label className="text-sm">{label}</label>
    <div className="relative">
      {icon && <span className="absolute left-3 top-3">{icon}</span>}
      <input
        {...props}
        value={value}
        required
        className="w-full border rounded-xl px-10 py-2"
      />
    </div>
  </div>
);

const SelectField = ({ label, children, ...props }: any) => (
  <div>
    <label className="text-sm">{label}</label>
    <select {...props} required className="w-full border rounded-xl px-4 py-2">
      {children}
    </select>
  </div>
);
