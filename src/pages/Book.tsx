import { useSearchParams } from "react-router-dom";
import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "sonner";
import { Calendar, Mail, Phone, User } from "lucide-react";

/* -------------------- */
/* Services Data */
/* -------------------- */
const SERVICES = {
  "Bridal Makeup": ["Classic Bridal", "Premium Bridal"],
  "Party Makeup": ["Classic Glam", "Premium Glam"],
  "Editorial Makeup": ["Standard Editorial", "Avant-Garde Editorial"],
  "Henna Art": ["Simple Henna", "Bridal Henna"],
};

interface BookingFormData {
  service: string;
  package: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  message: string;
}

const Book = (): JSX.Element => {
  const [params] = useSearchParams();

  const serviceParam = params.get("service") || "";
  const packageParam = params.get("package") || "";
  const isDirectBooking = !serviceParam;

  const [formData, setFormData] = useState<BookingFormData>({
    service: serviceParam,
    package: packageParam,
    name: "",
    email: "",
    phone: "",
    date: "",
    message: "",
  });

  /* -------------------- */
  /* Handlers */
  /* -------------------- */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "service" ? { package: "" } : {}),
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.service || !formData.package) {
      toast.error("Please select service and package");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/bookings`, formData);
      toast.success("✨ Booking request submitted successfully");

      setFormData((prev) => ({
        ...prev,
        name: "",
        email: "",
        phone: "",
        date: "",
        message: "",
      }));
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-0 bg-gradient-to-r from-chirag-pink/10 to-chirag-peach/10">
        <div className="container-custom text-center max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold">
            Book Your Appointment
          </h1>
          <p className="text-gray-600 mt-3">
            Choose your service, date and share your details
          </p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-8">
        <div className="container-custom max-w-4xl">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-2xl p-10 md:p-14 space-y-10 border border-chirag-pink/20"
          >
            {/* SERVICE & PACKAGE */}
            {isDirectBooking ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SelectField
                  label="Select Service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                >
                  <option value="">Choose a service</option>
                  {Object.keys(SERVICES).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </SelectField>

                <SelectField
                  label="Select Package"
                  name="package"
                  value={formData.package}
                  onChange={handleChange}
                  disabled={!formData.service}
                >
                  <option value="">Choose a package</option>
                  {formData.service &&
                    SERVICES[formData.service as keyof typeof SERVICES].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                </SelectField>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Summary label="Service" value={formData.service} />
                <Summary label="Package" value={formData.package} />
              </div>
            )}

            {/* PERSONAL DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputField
                label="Full Name"
                name="name"
                icon={<User size={18} />}
                value={formData.name}
                onChange={handleChange}
              />

              <InputField
                label="Email Address"
                name="email"
                type="email"
                icon={<Mail size={18} />}
                value={formData.email}
                onChange={handleChange}
              />

              <InputField
                label="Phone Number"
                name="phone"
                icon={<Phone size={18} />}
                value={formData.phone}
                onChange={handleChange}
              />

              <InputField
                label="Preferred Date"
                name="date"
                type="date"
                icon={<Calendar size={18} />}
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            {/* MESSAGE */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <textarea
                name="message"
                rows={4}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-chirag-pink"
                placeholder="Any special requests or details..."
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl text-lg font-semibold bg-gradient-to-r from-chirag-pink to-chirag-peach text-black shadow-lg hover:opacity-90 transition"
            >
              Confirm Booking ✨
            </button>

            <p className="text-xs text-center text-gray-500">
              We’ll contact you shortly to confirm availability.
            </p>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
};

/* -------------------- */
/* Reusable Components */
/* -------------------- */

const InputField = ({
  label,
  icon,
  ...props
}: {
  label: string;
  icon: React.ReactNode;
  [key: string]: any;
}) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </span>
      <input
        {...props}
        required
        className="w-full h-12 rounded-xl border border-gray-300 pl-11 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-chirag-pink"
      />
    </div>
  </div>
);

const SelectField = ({ label, children, ...props }: any) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-gray-700">
      {label}
    </label>
    <select
      {...props}
      required
      className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-chirag-pink"
    >
      {children}
    </select>
  </div>
);

const Summary = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-gray-100 px-6 py-4">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-semibold text-gray-800">{value}</p>
  </div>
);

export default Book;
