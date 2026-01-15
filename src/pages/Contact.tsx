import React, { useState } from 'react';
import { toast } from "sonner";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Instagram, MessageSquare, Check, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      console.log('Form submitted:', formData);
      toast.success("Your message has been sent! We'll get back to you soon.");
      setFormSubmitted(true);
      setIsSubmitting(false);

      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: '',
      });

      setTimeout(() => setFormSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-chirag-pink/10 to-white">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-playfair">
            Get in <span className="text-chirag-pink">Touch</span>
          </h1>
          <p className="text-lg text-gray-600">
            Have questions or want to book a consultation? We’d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16 bg-white">
        <div className="container-custom">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">

            {/* Email */}
            <div className="p-8 rounded-xl shadow-md text-center border">
              <Mail size={28} className="mx-auto mb-4 text-chirag-darkPurple" />
              <h3 className="font-semibold mb-2">Email Us</h3>
              <a
                href="mailto:jinni.chirag.mua101@gmail.com"
                className="text-gray-600 hover:text-chirag-pink"
              >
                jinni.chirag.mua101@gmail.com
              </a>
            </div>

            {/* Phone */}
            <div className="p-8 rounded-xl shadow-md text-center border">
              <Phone size={28} className="mx-auto mb-4 text-chirag-darkPurple" />
              <h3 className="font-semibold mb-2">Call Us</h3>
              <a
                href="tel:+9779707613340"
                className="text-gray-600 hover:text-chirag-pink"
              >
                +977 9707613340
              </a>
            </div>

            {/* WhatsApp */}
            <div className="p-8 rounded-xl shadow-md text-center border">
              <MessageSquare size={28} className="mx-auto mb-4 text-chirag-darkPurple" />
              <h3 className="font-semibold mb-2">WhatsApp</h3>
              <a
                href="https://wa.me/9779707613340"
                target="_blank"
                rel="noreferrer"
                className="text-gray-600 hover:text-chirag-pink"
              >
                Message on WhatsApp
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Contact Form */}
            <div className="p-8 rounded-xl shadow-lg border">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Send size={20} className="mr-2 text-chirag-pink" />
                Send Us a Message
              </h2>

              {formSubmitted && (
                <div className="bg-green-50 border p-4 rounded mb-6 flex items-center">
                  <Check size={18} className="mr-2 text-green-600" />
                  Message sent successfully!
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input mb-4"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input mb-4"
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input mb-4"
                />

                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="form-input mb-4"
                >
                  <option value="">Select Service</option>
                  <option value="bridal">Bridal Makeup</option>
                  <option value="party">Party Makeup</option>
                  <option value="editorial">Editorial Makeup</option>
                  <option value="henna">Henna Art</option>
                </select>

                <textarea
                  name="message"
                  rows={4}
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="form-input mb-4"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="button-primary w-full"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

            {/* Map */}
            <div className="p-8 rounded-xl shadow-lg border">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <MapPin size={20} className="mr-2 text-chirag-pink" />
                Visit Our Studio
              </h2>

              <p className="mb-4 text-gray-600">
                Lahan, Siraha District, Madhesh Province, Nepal
              </p>

              <iframe
                src="https://www.google.com/maps?q=Lahan,Nepal&output=embed"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                title="Lahan Nepal"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
