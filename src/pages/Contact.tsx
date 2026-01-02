
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      toast.success("Your message has been sent! We'll get back to you soon.");
      setFormSubmitted(true);
      setIsSubmitting(false);
      
      // Reset form after submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: '',
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setFormSubmitted(false);
      }, 5000);
    }, 1000);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-chirag-pink/10 to-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-10 w-40 h-40 rounded-full bg-chirag-pink/10 blur-3xl"></div>
          <div className="absolute bottom-0 right-10 w-40 h-40 rounded-full bg-chirag-peach/10 blur-3xl"></div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-playfair">
              Get in <span className="bg-gradient-to-r from-chirag-darkPurple to-chirag-pink bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Have questions or ready to book a consultation? We'd love to hear from you. Reach out using any of the methods below.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Email */}
            <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow border border-chirag-pink/20 group hover:-translate-y-1 duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-chirag-pink/20 to-chirag-peach/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-chirag-pink/30 group-hover:to-chirag-peach/30 transition-all duration-300">
                <Mail size={28} className="text-chirag-darkPurple" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-playfair text-chirag-darkPurple">Email Us</h3>
              <a 
                href="mailto:contact@chiragsharma.com" 
                className="text-gray-600 hover:text-chirag-pink transition-colors"
              >
                contact@chiragsharma.com
              </a>
            </div>
            
            {/* Phone */}
            <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow border border-chirag-pink/20 group hover:-translate-y-1 duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-chirag-pink/20 to-chirag-peach/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-chirag-pink/30 group-hover:to-chirag-peach/30 transition-all duration-300">
                <Phone size={28} className="text-chirag-darkPurple" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-playfair text-chirag-darkPurple">Call Us</h3>
              <a 
                href="tel:+1234567890" 
                className="text-gray-600 hover:text-chirag-pink transition-colors"
              >
                +1 (234) 567-890
              </a>
            </div>
            
            {/* WhatsApp */}
            <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow border border-chirag-pink/20 group hover:-translate-y-1 duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-chirag-pink/20 to-chirag-peach/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-chirag-pink/30 group-hover:to-chirag-peach/30 transition-all duration-300">
                <MessageSquare size={28} className="text-chirag-darkPurple" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-playfair text-chirag-darkPurple">WhatsApp</h3>
              <a 
                href="https://wa.me/1234567890" 
                target="_blank" 
                rel="noreferrer"
                className="text-gray-600 hover:text-chirag-pink transition-colors"
              >
                Message on WhatsApp
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-chirag-pink/20 relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-chirag-pink to-chirag-peach rounded-t-xl"></div>
              
              <h2 className="text-2xl font-bold mb-6 font-playfair text-chirag-darkPurple flex items-center">
                <Send size={20} className="mr-2 text-chirag-pink" />
                Send Us a Message
              </h2>
              
              {formSubmitted ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg flex items-center mb-6">
                  <Check size={20} className="mr-2" />
                  <span>Thank you! Your message has been sent successfully. We'll get back to you soon.</span>
                </div>
              ) : null}
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 mb-2">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="form-input focus:border-chirag-pink focus:ring-chirag-pink/30"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-input focus:border-chirag-pink focus:ring-chirag-pink/30"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input focus:border-chirag-pink focus:ring-chirag-pink/30"
                      placeholder="+1 (234) 567-890"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="service" className="block text-gray-700 mb-2">Service Interested In</label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="form-input focus:border-chirag-pink focus:ring-chirag-pink/30"
                    >
                      <option value="">Select a service</option>
                      <option value="bridal">Bridal Makeup</option>
                      <option value="party">Party Makeup</option>
                      <option value="editorial">Editorial Makeup</option>
                      <option value="henna">Henna Art</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 mb-2">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="form-input focus:border-chirag-pink focus:ring-chirag-pink/30"
                    placeholder="Tell us about your needs or questions..."
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="button-primary w-full relative overflow-hidden group"
                  disabled={isSubmitting}
                >
                  <span className="absolute inset-0 w-0 bg-gradient-to-r from-chirag-peach to-chirag-pink group-hover:w-full transition-all duration-500"></span>
                  <span className="relative z-10 flex items-center justify-center">
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      "Send Message"
                    )}
                  </span>
                </button>
              </form>
            </div>
            
            {/* Map & Address */}
            <div>
              <div className="bg-white p-8 rounded-xl shadow-lg border border-chirag-pink/20 mb-8">
                <h2 className="text-2xl font-bold mb-6 font-playfair text-chirag-darkPurple flex items-center">
                  <MapPin size={20} className="mr-2 text-chirag-pink" />
                  Visit Our Studio
                </h2>
                
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-chirag-pink/20 to-chirag-peach/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-chirag-darkPurple" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-chirag-darkPurple">Studio Address</h3>
                    <p className="text-gray-600">123 Beauty Lane, Artistic City, AC 12345</p>
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden border border-chirag-pink/10 shadow-md">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.215673186426!2d-73.98787268469169!3d40.758985842830334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1623324325172!5m2!1sen!2sus" 
                    width="100%" 
                    height="300" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy"
                    title="Studio Location"
                  ></iframe>
                </div>
              </div>
              
              {/* Social Media */}
              <div className="bg-white p-8 rounded-xl shadow-lg border border-chirag-pink/20">
                <h2 className="text-2xl font-bold mb-6 font-playfair text-chirag-darkPurple flex items-center">
                  <Instagram size={20} className="mr-2 text-chirag-pink" />
                  Follow Us
                </h2>
                <p className="text-gray-600 mb-6">Stay updated with our latest work and beauty tips by following us on social media.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Instagram size={20} />
                    <span>Instagram</span>
                  </a>
                  
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center space-x-3 bg-blue-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                    <span>Facebook</span>
                  </a>
                  
                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center space-x-3 bg-red-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                    </svg>
                    <span>YouTube</span>
                  </a>
                </div>
                
                <div className="mt-8 p-4 bg-gradient-to-r from-chirag-pink/10 to-chirag-peach/10 rounded-lg border border-chirag-pink/10">
                  <p className="text-center text-gray-600 italic">
                    "Connect with us on social media to see our latest creations and be inspired by beauty transformations."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8 text-center font-playfair text-chirag-darkPurple">
              Frequently Asked Questions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md border border-chirag-pink/10 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold mb-2 text-lg text-chirag-darkPurple">What services do you offer?</h3>
                <p className="text-gray-600">We specialize in bridal makeup, party makeup, editorial makeup, and henna art. Each service is personalized to match your unique style and preferences.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md border border-chirag-pink/10 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold mb-2 text-lg text-chirag-darkPurple">How far in advance should I book?</h3>
                <p className="text-gray-600">For bridal makeup, we recommend booking 3-6 months in advance. For other services, 2-4 weeks notice is usually sufficient, but availability may vary during peak seasons.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md border border-chirag-pink/10 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold mb-2 text-lg text-chirag-darkPurple">Do you travel for appointments?</h3>
                <p className="text-gray-600">Yes, we offer on-location services for bridal parties and special events. Travel fees may apply depending on the distance from our studio.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md border border-chirag-pink/10 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold mb-2 text-lg text-chirag-darkPurple">What products do you use?</h3>
                <p className="text-gray-600">We use high-quality, professional makeup brands that ensure long-lasting wear and beautiful photography results. All products are cruelty-free.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
