
import React, { useEffect, useState } from 'react';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import Testimonials from '../components/home/Testimonials';
import Portfolio from '../components/home/Portfolio';
import Newsletter from '../components/home/Newsletter';
import FeaturedIn from '../components/home/FeaturedIn';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowUp } from 'lucide-react';

const Index = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate page loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    const handleScroll = () => {
      // Calculate scroll progress percentage
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
      
      // Show scroll to top button after scrolling 300px
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full border-4 border-chirag-pink/30 border-t-chirag-pink animate-spin mb-4"></div>
          <h2 className="text-xl font-playfair text-chirag-darkPurple">Loading beauty...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        <div 
          className="h-full bg-gradient-to-r from-chirag-pink via-chirag-peach to-chirag-gold transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>
      
      {/* Floating Elements - Add subtle background elements for lifestyle feel */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-10 w-24 h-24 rounded-full bg-chirag-pink/10 blur-xl animate-pulse" style={{ animationDuration: '15s' }}></div>
        <div className="absolute bottom-1/3 right-10 w-32 h-32 rounded-full bg-chirag-peach/10 blur-xl animate-pulse" style={{ animationDuration: '20s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-chirag-purple/10 blur-xl animate-pulse" style={{ animationDuration: '25s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-20 h-20 rounded-full bg-chirag-pink/10 blur-xl animate-pulse" style={{ animationDuration: '18s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-28 h-28 rounded-full bg-chirag-gold/10 blur-xl animate-pulse" style={{ animationDuration: '22s' }}></div>
      </div>
      
      {/* Personal Quotes that appear on scroll */}
      <div className="fixed right-8 top-1/3 max-w-xs z-30 pointer-events-none">
        <div 
          className={`bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-chirag-pink/20 transform transition-all duration-500 ${scrollProgress > 20 && scrollProgress < 40 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}
        >
          <p className="text-chirag-darkPurple/80 italic font-playfair text-sm">
            "Makeup is art, beauty is spirit, and I'm here to bring them together."
          </p>
          <p className="text-right text-xs mt-1 text-chirag-darkPurple/60">— Chirag</p>
        </div>
      </div>
      
      <div className="fixed left-8 top-2/3 max-w-xs z-30 pointer-events-none">
        <div 
          className={`bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-chirag-peach/20 transform transition-all duration-500 ${scrollProgress > 50 && scrollProgress < 70 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}
        >
          <p className="text-chirag-darkPurple/80 italic font-playfair text-sm">
            "True beauty emerges when your inner light shines through."
          </p>
          <p className="text-right text-xs mt-1 text-chirag-darkPurple/60">— Chirag</p>
        </div>
      </div>
      
      {/* Scroll to top button */}
      <button 
        className={`fixed bottom-8 right-8 w-12 h-12 rounded-full bg-gradient-to-r from-chirag-pink to-chirag-peach text-white flex items-center justify-center shadow-lg z-40 transition-all duration-300 ${showScrollToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>
      
      <Navbar />
      
      <main className="animate-fade-in">
        <Hero />
        <FeaturedIn />
        <Services />
        <Portfolio />
        <Testimonials />
        <Newsletter />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
