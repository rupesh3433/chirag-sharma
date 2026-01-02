
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Instagram, Facebook, Youtube } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'py-3 bg-white shadow-sm' : 'py-5 bg-transparent'}`}>
      <div className="container-custom flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl md:text-3xl font-bold font-playfair">
            Chirag <span className="bg-gradient-to-r from-chirag-darkPurple to-chirag-pink bg-clip-text text-transparent">Sharma</span>
          </h1>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="font-medium text-chirag-darkPurple hover:text-chirag-pink transition-colors">Home</Link>
          <Link to="/about" className="font-medium text-chirag-darkPurple hover:text-chirag-pink transition-colors">About</Link>
          <Link to="/portfolio" className="font-medium text-chirag-darkPurple hover:text-chirag-pink transition-colors">Portfolio</Link>
          <Link to="/services" className="font-medium text-chirag-darkPurple hover:text-chirag-pink transition-colors">Services</Link>
          <Link to="/contact" className="font-medium text-chirag-darkPurple hover:text-chirag-pink transition-colors">Contact</Link>
        </div>

        {/* Social Links - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-chirag-darkPurple hover:text-chirag-pink transition-colors" aria-label="Instagram">
            <Instagram size={20} />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-chirag-darkPurple hover:text-chirag-pink transition-colors" aria-label="Facebook">
            <Facebook size={20} />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-chirag-darkPurple hover:text-chirag-pink transition-colors" aria-label="YouTube">
            <Youtube size={20} />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-chirag-darkPurple"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg py-6 px-4 z-50 animate-fade-in">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="font-medium text-chirag-darkPurple hover:text-chirag-pink transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/about" className="font-medium text-chirag-darkPurple hover:text-chirag-pink transition-colors" onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link to="/portfolio" className="font-medium text-chirag-darkPurple hover:text-chirag-pink transition-colors" onClick={() => setIsMenuOpen(false)}>Portfolio</Link>
            <Link to="/services" className="font-medium text-chirag-darkPurple hover:text-chirag-pink transition-colors" onClick={() => setIsMenuOpen(false)}>Services</Link>
            <Link to="/contact" className="font-medium text-chirag-darkPurple hover:text-chirag-pink transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</Link>
          </div>
          <div className="flex items-center space-x-4 mt-6">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-chirag-darkPurple hover:text-chirag-pink transition-colors" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-chirag-darkPurple hover:text-chirag-pink transition-colors" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-chirag-darkPurple hover:text-chirag-pink transition-colors" aria-label="YouTube">
              <Youtube size={20} />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
