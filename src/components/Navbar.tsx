import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";

/* ================= NAVBAR ================= */

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

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
        className={`fixed top-0 w-full z-50 transition-all duration-200 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm py-3"
            : "bg-white/90 backdrop-blur-sm py-4"
        }`}
      >
        <div className="container-custom flex items-center justify-between">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <h1 className="text-2xl sm:text-3xl font-playfair font-bold leading-none">
              <span className="text-chirag-darkPurple group-hover:text-chirag-peach">Chirag</span>{" "}
              <span className="bg-gradient-to-r from-chirag-pink via-chirag-peach to-chirag-pink group-hover:text-chirag-darkPurple bg-clip-text text-transparent">
                Sharma
              </span>
            </h1>

            {/* Sparkle icon – always visible */}
            <Sparkles className="w-4 h-4 text-chirag-pink group-hover:text-chirag-darkPurple transition-colors duration-200" />
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden lg:flex items-center gap-7">
            <NavLink to="/" active={isActive("/")}>Home</NavLink>
            <NavLink to="/services" active={isActive("/services")}>Services</NavLink>
            <NavLink to="/portfolio" active={isActive("/portfolio")}>Portfolio</NavLink>
            <NavLink to="/events" active={isActive("/events")}>Events</NavLink>

            {/* BOOK NOW – BEFORE ABOUT */}
            <Link
              to="/book"
              className="
                px-6 py-2 rounded-full
                font-semibold text-sm
                bg-chirag-pink/80
                text-chirag-darkPurple
                shadow-sm
                transition-all duration-200
                hover:bg-chirag-peach
                hover:shadow-md
              "
            >
              Book Now
            </Link>

            <NavLink to="/about" active={isActive("/about")}>About</NavLink>
          </div>

          {/* SOCIAL ICONS */}
          <div className="hidden lg:flex items-center gap-4 ml-4">
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
        className={`fixed top-0 right-0 h-full w-[300px] bg-white z-50 shadow-xl
        transition-transform duration-200 lg:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <span className="text-xl font-playfair font-bold text-chirag-darkPurple">
              Menu
            </span>
            <X
              size={26}
              className="cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
            />
          </div>

          <nav className="flex flex-col gap-2">
            <MobileLink to="/" active={isActive("/")}>Home</MobileLink>
            <MobileLink to="/services" active={isActive("/services")}>Services</MobileLink>
            <MobileLink to="/portfolio" active={isActive("/portfolio")}>Portfolio</MobileLink>
            <MobileLink to="/events" active={isActive("/events")}>Events</MobileLink>

            <Link
              to="/book"
              className="
                mt-6 text-center px-5 py-3 rounded-xl
                font-semibold
                bg-chirag-pink/80
                text-chirag-darkPurple
                transition-all duration-200
                hover:bg-chirag-peach
              "
            >
              Book Now
            </Link>

            <MobileLink to="/about" active={isActive("/about")}>About</MobileLink>
          </nav>

          <div className="mt-auto pt-8 flex gap-5">
            <SocialIcon href="https://www.instagram.com/_jinniechiragmua/" icon={FaInstagram} />
            <SocialIcon href="https://www.facebook.com/chirag.sharma.5477272/" icon={FaFacebookF} />
            <SocialIcon href="https://www.youtube.com/@jinniechiragmua" icon={FaYoutube} />
          </div>
        </div>
      </aside>
    </>
  );
};

/* ================= HELPERS ================= */

const NavLink = ({ to, active, children }: any) => (
  <Link
    to={to}
    className="relative font-medium text-chirag-darkPurple transition-colors duration-200 hover:text-chirag-pink"
  >
    {children}
    <span
      className={`absolute -bottom-1 left-0 h-[2px] bg-chirag-pink transition-all duration-200 ${
        active ? "w-full" : "w-0 hover:w-full"
      }`}
    />
  </Link>
);

const MobileLink = ({ to, active, children }: any) => (
  <Link
    to={to}
    className={`px-4 py-3 rounded-lg font-medium transition duration-200 ${
      active
        ? "bg-chirag-pink/80 text-chirag-darkPurple"
        : "text-chirag-darkPurple hover:bg-chirag-pink/15"
    }`}
  >
    {children}
  </Link>
);

const SocialIcon = ({ href, icon: Icon }: any) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="text-chirag-darkPurple hover:text-chirag-pink transition-colors duration-200"
  >
    <Icon size={18} />
  </a>
);

export default Navbar;
