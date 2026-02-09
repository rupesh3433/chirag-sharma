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

      if (total > 0) {
        setScrollProgress((window.scrollY / total) * 100);
      } else {
        setScrollProgress(0);
      }

      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen w-full bg-white overflow-x-clip">
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        <div
          className="h-full bg-gradient-to-r from-chirag-pink via-chirag-peach to-chirag-gold transition-[width] duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <Navbar />

      <main className="relative z-10 w-full flex flex-col">
        <div className="w-full max-w-[100vw] overflow-hidden">
          <Hero />
        </div>

        <div className="w-full max-w-[100vw] overflow-hidden">
          <ServicesSection />
        </div>

        <div className="w-full max-w-[100vw] overflow-hidden">
          <EventsSection scrollY={scrollY} />
        </div>

        <section className="w-full bg-white py-6 sm:py-10 md:py-14 lg:py-20">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SocialMediaPage />
          </div>
        </section>

        <div className="w-full max-w-[100vw] overflow-hidden">
          <Testimonials />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
