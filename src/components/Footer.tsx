import React from "react";
import { Link } from "react-router-dom";
import {
  Instagram,
  Facebook,
  Youtube,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-chirag-darkPurple text-white pt-16 pb-8 relative overflow-hidden">
      {/* Decorative accents */}
      <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-r from-chirag-pink to-chirag-peach opacity-20" />
      <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-chirag-pink/10 blur-xl" />
      <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-chirag-peach/10 blur-xl" />

      <div className="container-custom relative">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">

          {/* ================= BRAND ================= */}
          <div>
            <h3 className="text-2xl font-bold font-playfair mb-3">
              Chirag <span className="text-chirag-pink">Sharma</span>
            </h3>

            <p className="text-gray-300 mb-6 text-sm">
              Where Art Meets Beauty
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 mb-6">
              <SocialIcon
                href="https://www.instagram.com/_jinniechiragmua/"
                icon={Instagram}
              />
              <SocialIcon
                href="https://www.facebook.com/chirag.sharma.5477272/"
                icon={Facebook}
              />
              <SocialIcon
                href="https://www.youtube.com/@jinniechiragmua"
                icon={Youtube}
              />
            </div>

            {/* Book Now (below socials — as requested) */}
            <Link
              to="/book"
              className="
                inline-block
                px-5 py-2
                rounded-full
                bg-gradient-to-br from-chirag-pink to-pink-300
                text-chirag-darkPurple
                font-semibold text-sm
                shadow-md
                transition-all duration-200
                hover:brightness-110
                active:scale-[0.98]
              "
            >
              Book Now
            </Link>
          </div>

          {/* ================= QUICK LINKS ================= */}
          <div>
            <h4 className="text-xl font-semibold mb-4 font-playfair">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/about">About</FooterLink>
              <FooterLink to="/portfolio">Portfolio</FooterLink>
              <FooterLink to="/services">Services</FooterLink>
              <FooterLink to="/events">Events</FooterLink>
            </ul>
          </div>

          {/* ================= SERVICES ================= */}
          <div>
            <h4 className="text-xl font-semibold mb-4 font-playfair">
              Services
            </h4>
            <ul className="space-y-3">
              <ServiceItem>Bridal Makeup</ServiceItem>
              <ServiceItem>Party Makeup</ServiceItem>
              <ServiceItem>Editorial Makeup</ServiceItem>
              <ServiceItem>Henna Art</ServiceItem>
              <ServiceItem>Makeup Courses</ServiceItem>
            </ul>
          </div>

          {/* ================= CONTACT ================= */}
          <div>
            <h4 className="text-xl font-semibold mb-4 font-playfair">
              Contact
            </h4>

            <ul className="space-y-4 text-sm">
              <ContactItem
                icon={Mail}
                href="mailto:jinni.chirag.mua101@gmail.com"
                label="jinni.chirag.mua101@gmail.com"
              />
              <ContactItem
                icon={Phone}
                href="tel:+9779707613340"
                label="+977 9707613340"
              />
              <ContactItem
                icon={MessageSquare}
                href="https://wa.me/9779707613340"
                label="Chat on WhatsApp"
                external
              />
              <ContactItem
                icon={MapPin}
                href="https://www.google.com/maps?q=Lahan,Nepal"
                label="Lahan, Siraha District, Nepal"
                external
              />
            </ul>
          </div>
        </div>

        {/* ================= COPYRIGHT ================= */}
        <div className="mt-12 border-t border-gray-700 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Chirag Sharma. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

/* ================= HELPERS ================= */

const SocialIcon = ({ href, icon: Icon }: any) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="text-gray-300 hover:text-chirag-pink transition-colors"
  >
    <Icon size={20} />
  </a>
);

const FooterLink = ({ to, children }: any) => (
  <li>
    <Link
      to={to}
      className="text-gray-300 hover:text-chirag-pink transition-colors flex items-center gap-2"
    >
      <span className="w-1 h-1 bg-chirag-pink rounded-full" />
      {children}
    </Link>
  </li>
);

const ServiceItem = ({ children }: any) => (
  <li className="text-gray-300 flex items-center gap-2">
    <span className="w-1 h-1 bg-chirag-pink rounded-full" />
    {children}
  </li>
);

const ContactItem = ({ icon: Icon, href, label, external }: any) => (
  <li className="flex items-start gap-3">
    <Icon size={18} className="text-chirag-pink mt-0.5" />
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="text-gray-300 hover:text-chirag-pink transition-colors"
    >
      {label}
    </a>
  </li>
);

export default Footer;
