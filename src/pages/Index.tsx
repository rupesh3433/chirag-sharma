import React, { useEffect, useState, lazy, Suspense } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowUp } from 'lucide-react';

/* ✅ Lazy load heavy sections */
const Hero = lazy(() => import('../components/home/Hero'));
const Services = lazy(() => import('../components/home/Services'));
const Portfolio = lazy(() => import('../components/home/Portfolio'));
const Testimonials = lazy(() => import('../components/home/Testimonials'));

const Index = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  /* ✅ Optimized scroll handler (throttled using requestAnimationFrame) */
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight =
            document.documentElement.scrollHeight - window.innerHeight;

          const progress = totalHeight > 0
            ? (window.scrollY / totalHeight) * 100
            : 0;

          setScrollProgress(progress);
          setShowScrollToTop(window.scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative">

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        <div
          className="h-full bg-gradient-to-r from-chirag-pink via-chirag-peach to-chirag-gold"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Background Blobs (lighter & fewer) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-10 w-24 h-24 bg-chirag-pink/10 blur-xl rounded-full animate-pulse" />
        <div className="absolute bottom-1/3 right-10 w-32 h-32 bg-chirag-peach/10 blur-xl rounded-full animate-pulse" />
      </div>

      {/* Scroll To Top */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-8 right-8 w-12 h-12 rounded-full bg-gradient-to-r from-chirag-pink to-chirag-peach text-white flex items-center justify-center shadow-lg z-40 transition-all duration-300 ${
          showScrollToTop
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <ArrowUp size={20} />
      </button>

      <Navbar />

      {/* ✅ Lazy-loaded content */}
      <main className="relative z-10">
        <Suspense fallback={<PageSkeleton />}>
          <Hero />
          <Services />
          <Portfolio />
          <Testimonials />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

/* ---------------- Skeleton Loader ---------------- */
const PageSkeleton = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-16 h-16 rounded-full border-4 border-chirag-pink/30 border-t-chirag-pink animate-spin" />
  </div>
);
