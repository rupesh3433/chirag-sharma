
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from "sonner";

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thanks for subscribing to our newsletter!");
    setEmail('');
  };

  return (
    <footer className="bg-chirag-darkPurple text-white pt-16 pb-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-r from-chirag-pink to-chirag-peach opacity-20"></div>
      <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-chirag-pink/10 blur-xl"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-chirag-peach/10 blur-xl"></div>
      
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Brand and Info */}
          <div className="md:col-span-1 lg:col-span-1">
            <h3 className="text-2xl font-bold font-playfair mb-4">
              Chirag <span className="text-chirag-pink">Sharma</span>
            </h3>
            <p className="text-gray-300 mb-6">Where Art Meets Beauty</p>
            <div className="flex space-x-4 mb-6">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-white hover:text-chirag-pink transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white hover:text-chirag-pink transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-white hover:text-chirag-pink transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1 lg:col-span-1">
            <h4 className="text-xl font-semibold mb-4 font-playfair">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-chirag-pink transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-chirag-pink transition-all duration-300 group-hover:w-2"></span>
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-chirag-pink transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-chirag-pink transition-all duration-300 group-hover:w-2"></span>
                  <span>About</span>
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="text-gray-300 hover:text-chirag-pink transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-chirag-pink transition-all duration-300 group-hover:w-2"></span>
                  <span>Portfolio</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-chirag-pink transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-chirag-pink transition-all duration-300 group-hover:w-2"></span>
                  <span>Services</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-chirag-pink transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-chirag-pink transition-all duration-300 group-hover:w-2"></span>
                  <span>Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="md:col-span-1 lg:col-span-1">
            <h4 className="text-xl font-semibold mb-4 font-playfair">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/services" className="text-gray-300 hover:text-chirag-pink transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-chirag-pink transition-all duration-300 group-hover:w-2"></span>
                  <span>Bridal Makeup</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-chirag-pink transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-chirag-pink transition-all duration-300 group-hover:w-2"></span>
                  <span>Party Makeup</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-chirag-pink transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-chirag-pink transition-all duration-300 group-hover:w-2"></span>
                  <span>Editorial Makeup</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-chirag-pink transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-chirag-pink transition-all duration-300 group-hover:w-2"></span>
                  <span>Henna Art</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-chirag-pink transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-chirag-pink transition-all duration-300 group-hover:w-2"></span>
                  <span>Makeup Courses</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-1 lg:col-span-1">
            <h4 className="text-xl font-semibold mb-4 font-playfair">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 group">
                <Mail size={18} className="mt-1 text-chirag-pink group-hover:scale-110 transition-transform" />
                <a href="mailto:contact@chiragsharma.com" className="text-gray-300 hover:text-chirag-pink transition-colors">
                  contact@chiragsharma.com
                </a>
              </li>
              <li className="flex items-start space-x-3 group">
                <Phone size={18} className="mt-1 text-chirag-pink group-hover:scale-110 transition-transform" />
                <a href="tel:+1234567890" className="text-gray-300 hover:text-chirag-pink transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start space-x-3 group">
                <MapPin size={18} className="mt-1 text-chirag-pink group-hover:scale-110 transition-transform" />
                <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-chirag-pink transition-colors">
                  123 Beauty Lane, Artistic City, AC 12345
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 border-t border-gray-700 pt-8">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-xl font-semibold mb-3 font-playfair">Subscribe to Our Newsletter</h4>
            <p className="text-gray-300 mb-4">Get beauty tips, exclusive offers, and updates directly to your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <div className="flex-grow relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full bg-gray-800 text-white px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-chirag-pink"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Send size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
              <button className="bg-chirag-pink hover:bg-chirag-peach text-chirag-darkPurple font-medium py-2 px-6 rounded-lg transition-all duration-300">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-gray-700 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Chirag Sharma. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-4">
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
