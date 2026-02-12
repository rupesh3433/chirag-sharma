// =======================
// Index.tsx
// MOBILE = your given logic
// TABLET + DESKTOP = full-width, no cut, no extra gaps
// =======================

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import Hero from "../components/indexComponents/Hero";
import EventsSection from "../components/indexComponents/EventsSection";
import Testimonials from "../components/indexComponents/Testimonials";

import SocialMediaPage from "../components/portfolio/SocialMedia";
import ServicesSection from "../components/indexComponents/ServicesSection";

const Index = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const total =
        document.documentElement.scrollHeight - window.innerHeight;

      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen w-full bg-white overflow-x-clip">
      {/* SCROLL PROGRESS */}
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        <div
          className="h-full bg-gradient-to-r from-chirag-pink via-chirag-peach to-chirag-gold transition-[width] duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <Navbar />

      <main className="relative z-10 w-full flex flex-col">
        {/* HERO */}
        {/* Mobile: your logic | Desktop: no height cut */}
        <section className="w-full overflow-hidden lg:overflow-visible lg:max-h-none">
          <div className="w-full max-w-[100vw] lg:max-w-none">
            <Hero />
          </div>
        </section>

        {/* SERVICES */}
        {/* Mobile: same logic | Desktop: tight spacing */}
        <section className="w-full overflow-hidden lg:overflow-visible lg:py-0">
          <div className="w-full max-w-[100vw] lg:max-w-none">
            <ServicesSection />
          </div>
        </section>

        {/* EVENTS */}
        <section className="w-full overflow-hidden lg:overflow-visible">
          <div className="w-full max-w-[100vw] lg:max-w-none">
            <EventsSection scrollY={scrollY} />
          </div>
        </section>

        {/* SOCIAL */}
        {/* Mobile padding kept | Desktop tightened */}
        <section className="w-full bg-white py-4 sm:py-6 lg:py-8">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SocialMediaPage />
          </div>
        </section>
        
        {/* TESTIMONIALS */}
        <section className="w-full overflow-hidden lg:overflow-visible">
          <div className="w-full max-w-[100vw] lg:max-w-none">
            <Testimonials />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
