import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) =>
    location.pathname === path ? "text-chirag-pink" : "text-chirag-darkPurple";

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "py-3 bg-white shadow-sm" : "py-5 bg-transparent"
      }`}
    >
      <div className="container-custom flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl md:text-3xl font-bold font-playfair">
            Chirag{" "}
            <span className="bg-gradient-to-r from-chirag-darkPurple to-chirag-pink bg-clip-text text-transparent">
              Sharma
            </span>
          </h1>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className={`nav-link ${isActive("/")}`}>Home</Link>
          <Link to="/about" className={`nav-link ${isActive("/about")}`}>About</Link>
          <Link to="/portfolio" className={`nav-link ${isActive("/portfolio")}`}>Portfolio</Link>
          <Link to="/services" className={`nav-link ${isActive("/services")}`}>Services</Link>

          {/* Book Now */}
          <Link
            to="/book"
            className="px-5 py-2 rounded-full font-semibold text-sm bg-gradient-to-r from-chirag-pink to-chirag-peach text-black shadow-md hover:opacity-90 transition"
          >
            Book Now
          </Link>

          <Link to="/contact" className={`nav-link ${isActive("/contact")}`}>
            Contact
          </Link>
        </div>

        {/* Social Icons - Desktop */}
        <div className="hidden md:flex items-center space-x-4 ml-4 text-chirag-darkPurple">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon">
            <FaInstagram size={18} />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon">
            <FaFacebookF size={18} />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-icon">
            <FaYoutube size={18} />
          </a>
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden text-chirag-darkPurple"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg py-6 px-6 z-50">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/about" className="mobile-link" onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link to="/portfolio" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Portfolio</Link>
            <Link to="/services" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Services</Link>

            <Link
              to="/book"
              onClick={() => setIsMenuOpen(false)}
              className="mt-3 text-center px-5 py-3 rounded-xl font-semibold bg-gradient-to-r from-chirag-pink to-chirag-peach text-black shadow-md"
            >
              Book Now
            </Link>

            <Link to="/contact" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
              Contact
            </Link>
          </div>

          {/* Mobile Social */}
          <div className="flex items-center space-x-5 mt-6 text-chirag-darkPurple">
            <FaInstagram size={18} />
            <FaFacebookF size={18} />
            <FaYoutube size={18} />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
