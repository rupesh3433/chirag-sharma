
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VideoPortfolio from '../components/portfolio/VideoPortfolio';
import { Play, Instagram } from 'lucide-react';

const categories = [
  { id: 'all', name: 'All Work' },
  { id: 'bridal', name: 'Bridal Makeup' },
  { id: 'editorial', name: 'Editorial' },
  { id: 'party', name: 'Party Makeup' },
  { id: 'henna', name: 'Henna Art' },
  { id: 'video', name: 'Video Content' },
];

const portfolioItems = [
  {
    id: 1,
    title: "Traditional Bridal Look",
    category: "bridal",
    image: "https://images.unsplash.com/photo-1594489573233-c2d4e4e5f106?auto=format&fit=crop&q=80&w=2000",
    description: "Classic red bridal makeup with gold accents for a traditional wedding ceremony."
  },
  {
    id: 2,
    title: "Minimal Bride",
    category: "bridal",
    image: "https://plus.unsplash.com/premium_photo-1661775074133-3138a35e8669?auto=format&fit=crop&q=80&w=2000",
    description: "Light and natural bridal makeup for the modern minimalist bride."
  },
  {
    id: 3,
    title: "Bold Editorial",
    category: "editorial",
    image: "https://images.unsplash.com/photo-1542145748-72b2eb8576cd?auto=format&fit=crop&q=80&w=2000",
    description: "Striking colors and graphic liner for a high-fashion magazine shoot."
  },
  {
    id: 4,
    title: "Avant-Garde",
    category: "editorial",
    image: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=2000",
    description: "Artistic and experimental makeup for creative conceptual photography."
  },
  {
    id: 5,
    title: "Glam Party Look",
    category: "party",
    image: "https://images.unsplash.com/photo-1588731247530-4076fc99173e?auto=format&fit=crop&q=80&w=2000",
    description: "Glamorous evening makeup with smoky eyes and nude lip for special events."
  },
  {
    id: 6,
    title: "Colorful Party",
    category: "party",
    image: "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&q=80&w=2000",
    description: "Vibrant and colorful party makeup with a pop of pink and purple."
  },
  {
    id: 7,
    title: "Bridal Henna",
    category: "henna",
    image: "https://images.unsplash.com/photo-1583266999030-4fba155cca8e?auto=format&fit=crop&q=80&w=2000",
    description: "Intricate traditional bridal henna with detailed patterns."
  },
  {
    id: 8,
    title: "Modern Henna Design",
    category: "henna",
    image: "https://images.unsplash.com/photo-1592951481330-a28ea28a9110?auto=format&fit=crop&q=80&w=2000",
    description: "Contemporary henna patterns with modern geometric elements."
  },
];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<null | number>(null);

  const filteredItems = activeCategory === 'all' || activeCategory === 'video'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-chirag-pink/10 to-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-playfair">
              Our <span className="bg-gradient-to-r from-chirag-darkPurple to-chirag-pink bg-clip-text text-transparent">Portfolio</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Explore our collection of makeup transformations and artistic creations that showcase our expertise and passion.
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio Filters */}
      <section className="py-8 bg-white">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-chirag-pink text-chirag-darkPurple shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-chirag-pink/20'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Photo Portfolio Grid */}
          {activeCategory !== 'video' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className="portfolio-item group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  onClick={() => setSelectedItem(item.id)}
                >
                  <div className="relative overflow-hidden rounded-xl shadow-md">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <h3 className="text-white text-xl font-semibold font-playfair">{item.title}</h3>
                      <p className="text-chirag-pink">{categories.find(cat => cat.id === item.category)?.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Video Portfolio Section */}
          {(activeCategory === 'all' || activeCategory === 'video') && (
            <VideoPortfolio />
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedItem !== null && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <img 
                src={portfolioItems.find(item => item.id === selectedItem)?.image} 
                alt={portfolioItems.find(item => item.id === selectedItem)?.title}
                className="w-full h-auto max-h-[70vh] object-cover"
              />
              <button 
                className="absolute top-4 right-4 bg-white rounded-full p-2 text-gray-800 hover:text-chirag-pink"
                onClick={() => setSelectedItem(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2 font-playfair">
                {portfolioItems.find(item => item.id === selectedItem)?.title}
              </h3>
              <p className="text-chirag-pink mb-4">
                {categories.find(cat => cat.id === portfolioItems.find(item => item.id === selectedItem)?.category)?.name}
              </p>
              <p className="text-gray-600">
                {portfolioItems.find(item => item.id === selectedItem)?.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Portfolio;
