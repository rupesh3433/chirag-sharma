import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-chirag-darkPurple text-white pt-16 pb-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-r from-chirag-pink to-chirag-peach opacity-20"></div>
      <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-chirag-pink/10 blur-xl"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-chirag-peach/10 blur-xl"></div>

      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold font-playfair mb-4">
              Chirag <span className="text-chirag-pink">Sharma</span>
            </h3>
            <p className="text-gray-300 mb-6">Where Art Meets Beauty</p>

            <div className="flex space-x-4">
              <a href="https://www.instagram.com/_jinniechiragmua/" target="_blank" rel="noreferrer" className="hover:text-chirag-pink">
                <Instagram size={20} />
              </a>
              <a href="https://www.facebook.com/chirag.sharma.5477272/" target="_blank" rel="noreferrer" className="hover:text-chirag-pink">
                <Facebook size={20} />
              </a>
              <a href="https://www.youtube.com/@jinniechiragmua" target="_blank" rel="noreferrer" className="hover:text-chirag-pink">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold mb-4 font-playfair">Quick Links</h4>
            <ul className="space-y-3">
              {["/", "/about", "/portfolio", "/services", "/contact"].map((path, i) => (
                <li key={i}>
                  <Link
                    to={path}
                    className="text-gray-300 hover:text-chirag-pink transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-chirag-pink rounded-full"></span>
                    {path === "/" ? "Home" : path.replace("/", "").charAt(0).toUpperCase() + path.slice(2)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xl font-semibold mb-4 font-playfair">Services</h4>
            <ul className="space-y-3">
              {["Bridal Makeup", "Party Makeup", "Editorial Makeup", "Henna Art", "Makeup Courses"].map(
                (service, i) => (
                  <li key={i}>
                    <Link
                      to="/services"
                      className="text-gray-300 hover:text-chirag-pink transition-colors flex items-center gap-2"
                    >
                      <span className="w-1 h-1 bg-chirag-pink rounded-full"></span>
                      {service}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-semibold mb-4 font-playfair">Contact Us</h4>
            <ul className="space-y-4">

              {/* Email */}
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-chirag-pink mt-1" />
                <a
                  href="mailto:jinni.chirag.mua101@gmail.com"
                  className="text-gray-300 hover:text-chirag-pink"
                >
                  jinni.chirag.mua101@gmail.com
                </a>
              </li>

              {/* Phone */}
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-chirag-pink mt-1" />
                <a
                  href="tel:+9779707613340"
                  className="text-gray-300 hover:text-chirag-pink"
                >
                  +977 9707613340
                </a>
              </li>

              {/* WhatsApp */}
              <li className="flex items-start gap-3">
                <MessageSquare size={18} className="text-chirag-pink mt-1" />
                <a
                  href="https://wa.me/9779707613340"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-300 hover:text-chirag-pink"
                >
                  Chat on WhatsApp
                </a>
              </li>

              {/* Location */}
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-chirag-pink mt-1" />
                <a
                  href="https://www.google.com/maps?q=Lahan,Nepal"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-300 hover:text-chirag-pink"
                >
                  Lahan, Siraha District, Nepal
                </a>
              </li>

            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-gray-700 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Chirag Sharma. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
