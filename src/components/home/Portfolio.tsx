
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Instagram } from 'lucide-react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';

const portfolioItems = [
  {
    id: 1,
    title: "Bridal Elegance",
    category: "Bridal Makeup",
    image: "https://images.unsplash.com/photo-1594489573233-c2d4e4e5f106?auto=format&fit=crop&q=80&w=2000",
    description: "Crafting timeless bridal looks with a touch of magic"
  },
  {
    id: 2,
    title: "Editorial Dream",
    category: "Editorial Makeup",
    image: "https://images.unsplash.com/photo-1542145748-72b2eb8576cd?auto=format&fit=crop&q=80&w=2000",
    description: "Bold, creative looks for photoshoots and fashion events"
  },
  {
    id: 3,
    title: "Glamorous Evening",
    category: "Party Makeup",
    image: "https://images.unsplash.com/photo-1588731247530-4076fc99173e?auto=format&fit=crop&q=80&w=2000",
    description: "Stunning looks that last throughout your special night"
  },
  {
    id: 4,
    title: "Intricate Henna",
    category: "Henna Art",
    image: "https://images.unsplash.com/photo-1583266999030-4fba155cca8e?auto=format&fit=crop&q=80&w=2000",
    description: "Beautiful designs that tell your unique story"
  },
];

const videoPortfolioItems = [
  {
    id: 1,
    title: "Bridal Transformation",
    videoUrl: "https://www.instagram.com/p/CrGyxUDI7dl/embed",
    thumbnailUrl: "https://images.unsplash.com/photo-1594489573233-c2d4e4e5f106?auto=format&fit=crop&q=80&w=2000",
    instagramLink: "https://www.instagram.com/p/CrGyxUDI7dl/"
  },
  {
    id: 2,
    title: "Makeup Tutorial",
    videoUrl: "https://www.instagram.com/p/CqWzc6DIvLp/embed",
    thumbnailUrl: "https://images.unsplash.com/photo-1542145748-72b2eb8576cd?auto=format&fit=crop&q=80&w=2000",
    instagramLink: "https://www.instagram.com/p/CqWzc6DIvLp/"
  },
  {
    id: 3,
    title: "Behind the Scenes",
    videoUrl: "https://www.instagram.com/p/Cp9ZsHIovZ3/embed",
    thumbnailUrl: "https://images.unsplash.com/photo-1588731247530-4076fc99173e?auto=format&fit=crop&q=80&w=2000",
    instagramLink: "https://www.instagram.com/p/Cp9ZsHIovZ3/"
  }
];

const Portfolio = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Add parallax effect
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const sectionTop = rect.top;
          const viewportHeight = window.innerHeight;
          const scrollPercentage = 1 - (sectionTop / viewportHeight);
          
          // Apply animations based on scroll position
          const items = sectionRef.current.querySelectorAll('.portfolio-item');
          items.forEach((item, index) => {
            const delay = index * 0.1;
            const element = item as HTMLElement;
            if (scrollPercentage > 0.1 + delay) {
              element.classList.add('animate-fade-in');
              element.style.opacity = '1';
            }
          });
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handlePlayVideo = (id: number) => {
    setActiveVideo(id);
  };

  const handleCloseVideo = () => {
    setActiveVideo(null);
  };

  return (
    <section ref={sectionRef} className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-chirag-pink/10 pointer-events-none"></div>
      
      <div 
        className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-chirag-purple/10 to-chirag-pink/10 blur-3xl opacity-70"
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      ></div>
      
      <div className="container-custom relative">
        <div className="text-center mb-16">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-chirag-pink/20 to-chirag-peach/20 blur-xl -m-4 rounded-full"></div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair relative">
              Featured <span className="header-gradient">Work</span>
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse through some of our best makeup transformations and henna designs.
          </p>
        </div>

        {/* Image Portfolio */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {portfolioItems.map((item, index) => (
            <div 
              key={item.id} 
              className="portfolio-item group opacity-0"
              style={{ 
                transform: `translateY(${activeIndex === index ? -5 : 0}px)`,
                transition: 'all 0.3s ease-out'
              }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                <div className="absolute inset-0 flex flex-col justify-end p-6 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-chirag-pink text-sm uppercase tracking-wider mb-1">{item.category}</span>
                  <h3 className="text-white text-xl font-semibold font-playfair">{item.title}</h3>
                  <p className="text-white/80 text-sm mt-2 line-clamp-2">{item.description}</p>
                  <div className="h-0 group-hover:h-8 overflow-hidden transition-all duration-300 mt-2">
                    <Link to="/portfolio" className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm hover:bg-white/30 transition-colors">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Portfolio */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold font-playfair relative inline-block">
              <span className="relative z-10">Watch Transformations</span>
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-chirag-pink to-chirag-peach"></span>
            </h3>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
              See Chirag's artistry in action through these captivating videos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {videoPortfolioItems.map((video) => (
              <div key={video.id} className="video-portfolio-item group animate-fade-in">
                <div className="relative overflow-hidden rounded-xl shadow-lg">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title} 
                    className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <button 
                      onClick={() => handlePlayVideo(video.id)}
                      className="w-16 h-16 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 group-hover:scale-110"
                    >
                      <Play size={30} className="text-white fill-white ml-1" />
                    </button>
                    
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <a 
                          href={video.instagramLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-chirag-pink to-chirag-peach rounded-full text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <Instagram size={18} />
                          <span>View on Instagram</span>
                        </a>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 p-0 overflow-hidden">
                        <div className="p-4 bg-gradient-to-br from-chirag-pink/20 to-chirag-peach/20">
                          <p className="text-sm text-gray-700">See more beautiful transformations and behind-the-scenes content on Chirag's Instagram profile.</p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 w-full p-4">
                    <h4 className="text-white font-playfair text-xl">{video.title}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Modal */}
        {activeVideo && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={handleCloseVideo}>
            <div className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="relative pt-[56.25%] w-full">
                <iframe 
                  src={videoPortfolioItems.find(v => v.id === activeVideo)?.videoUrl} 
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  title="Instagram video"
                ></iframe>
              </div>
              <div className="p-4 flex justify-between items-center">
                <h3 className="font-playfair text-xl text-gray-800">
                  {videoPortfolioItems.find(v => v.id === activeVideo)?.title}
                </h3>
                <button 
                  onClick={handleCloseVideo}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/portfolio" className="button-primary relative group overflow-hidden">
            <span className="absolute inset-0 w-0 bg-gradient-to-r from-chirag-peach to-chirag-pink group-hover:w-full transition-all duration-700"></span>
            <span className="relative z-10">Explore Full Portfolio</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
