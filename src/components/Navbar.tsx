import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  /* Scroll shadow */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close menu on route change */
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  /* Lock body scroll (FIXED TS ISSUE) */
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-md py-3"
            : "bg-white/85 backdrop-blur-sm py-4"
        }`}
      >
        <div className="container-custom flex items-center justify-between px-4 md:px-6">
          {/* LOGO */}
          <Link to="/" className="group">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-playfair font-bold flex items-center gap-2">
              <span className="text-chirag-darkPurple group-hover:text-chirag-pink transition">
                Chirag
              </span>
              <span className="bg-gradient-to-r from-chirag-darkPurple to-chirag-pink bg-clip-text text-transparent">
                Sharma
              </span>
              <Sparkles className="w-4 h-4 text-chirag-pink opacity-0 group-hover:opacity-100 transition" />
            </h1>
          </Link>

          {/* DESKTOP / TABLET MENU */}
          <div className="hidden lg:flex items-center gap-6">
            <NavLink to="/" active={isActive("/")}>Home</NavLink>
            <NavLink to="/about" active={isActive("/about")}>About</NavLink>
            <NavLink to="/portfolio" active={isActive("/portfolio")}>Portfolio</NavLink>
            <NavLink to="/services" active={isActive("/services")}>Services</NavLink>

            {/* BOOK NOW (UNCHANGED STYLE) */}
            <Link
              to="/book"
              className="px-4 xl:px-5 py-2 rounded-full font-semibold text-sm bg-gradient-to-r from-chirag-pink to-chirag-peach text-white shadow-md hover:opacity-90 transition"
            >
              Book Now
            </Link>

            <NavLink to="/contact" active={isActive("/contact")}>Contact</NavLink>
          </div>

          {/* SOCIAL ICONS */}
          <div className="hidden lg:flex items-center gap-3 ml-4">
            <SocialIcon href="https://www.instagram.com/_jinniechiragmua/" icon={FaInstagram} />
            <SocialIcon href="https://www.facebook.com/chirag.sharma.5477272/" icon={FaFacebookF} />
            <SocialIcon href="https://www.youtube.com/@jinniechiragmua" icon={FaYoutube} />
          </div>

          {/* MOBILE BUTTON */}
          <button
            className="lg:hidden text-chirag-darkPurple p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* OVERLAY */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* MOBILE MENU */}
      <aside
        className={`fixed top-0 right-0 h-full w-[280px] bg-white shadow-xl z-50 lg:hidden transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-playfair font-bold text-chirag-darkPurple">
              Menu
            </span>
            <X size={24} onClick={() => setIsMenuOpen(false)} className="cursor-pointer" />
          </div>

          <nav className="flex flex-col gap-2">
            <MobileLink to="/" active={isActive("/")}>Home</MobileLink>
            <MobileLink to="/about" active={isActive("/about")}>About</MobileLink>
            <MobileLink to="/portfolio" active={isActive("/portfolio")}>Portfolio</MobileLink>
            <MobileLink to="/services" active={isActive("/services")}>Services</MobileLink>
            <MobileLink to="/contact" active={isActive("/contact")}>Contact</MobileLink>

            <Link
              to="/book"
              className="mt-4 text-center px-5 py-3 rounded-xl bg-gradient-to-r from-chirag-pink to-chirag-peach text-white font-semibold shadow-md"
            >
              Book Now
            </Link>
          </nav>

          <div className="mt-auto pt-6 flex gap-4">
            <SocialIcon href="https://www.instagram.com/_jinniechiragmua/" icon={FaInstagram} />
            <SocialIcon href="https://www.facebook.com/chirag.sharma.5477272/" icon={FaFacebookF} />
            <SocialIcon href="https://www.youtube.com/@jinniechiragmua" icon={FaYoutube} />
          </div>
        </div>
      </aside>
    </>
  );
};

/* ---------- HELPERS ---------- */

const NavLink = ({ to, active, children }: any) => (
  <Link
    to={to}
    className={`relative font-medium transition ${
      active ? "text-chirag-pink" : "text-chirag-darkPurple hover:text-chirag-pink"
    }`}
  >
    {children}
    <span
      className={`absolute -bottom-1 left-0 h-0.5 bg-chirag-pink transition-all duration-300 ${
        active ? "w-full" : "w-0 hover:w-full"
      }`}
    />
  </Link>
);

const MobileLink = ({ to, active, children }: any) => (
  <Link
    to={to}
    className={`px-4 py-3 rounded-lg font-medium transition ${
      active
        ? "bg-chirag-pink text-white"
        : "text-chirag-darkPurple hover:bg-chirag-pink/10"
    }`}
  >
    {children}
  </Link>
);

const SocialIcon = ({ href, icon: Icon }: any) => (
  <a href={href} target="_blank" rel="noreferrer" className="hover:text-chirag-pink transition">
    <Icon size={18} />
  </a>
);

export default Navbar;
