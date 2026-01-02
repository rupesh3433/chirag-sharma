
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Award, Star } from 'lucide-react';

const servicesData = [
  {
    id: 1,
    title: "Bridal Makeup",
    description: "Look your absolute best on your special day with our premium bridal makeup services tailored to your style and preferences.",
    image: "https://images.unsplash.com/photo-1594489573233-c2d4e4e5f106?auto=format&fit=crop&q=80&w=2000",
    features: ["Custom look creation", "Premium products", "Trial session", "On-location service"],
    link: "/services"
  },
  {
    id: 2,
    title: "Party Makeup",
    description: "Stand out at any event with stunning party makeup that highlights your features and complements your outfit.",
    image: "https://images.unsplash.com/photo-1588731247530-4076fc99173e?auto=format&fit=crop&q=80&w=2000",
    features: ["Trending looks", "Long-lasting formulas", "Full face service", "Evening glow"],
    link: "/services"
  },
  {
    id: 3,
    title: "Editorial Makeup",
    description: "Create striking, photogenic looks perfect for photoshoots, magazine spreads, and fashion events.",
    image: "https://images.unsplash.com/photo-1542145748-72b2eb8576cd?auto=format&fit=crop&q=80&w=2000",
    features: ["High-fashion looks", "Camera-ready finish", "Creative direction", "Professional touch"],
    link: "/services"
  },
  {
    id: 4,
    title: "Henna Art",
    description: "Adorn your hands with intricate and beautiful henna designs, from traditional to contemporary styles.",
    image: "https://images.unsplash.com/photo-1583266999030-4fba155cca8e?auto=format&fit=crop&q=80&w=2000",
    features: ["Custom designs", "Natural ingredients", "Traditional & modern", "Bridal specialties"],
    link: "/services"
  },
];

// Awards section data
const awardsData = [
  {
    id: 1,
    title: "Best Makeup Artist",
    organization: "Beauty Industry Awards",
    year: "2023",
    icon: "award"
  },
  {
    id: 2,
    title: "Excellence in Bridal Makeup",
    organization: "Wedding Professionals Guild",
    year: "2022",
    icon: "star"
  },
  {
    id: 3,
    title: "Creative Artist of the Year",
    organization: "Fashion & Beauty Association",
    year: "2021",
    icon: "award"
  }
];

const Services = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const awardsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card) => {
      observer.observe(card);
    });
    
    const awards = document.querySelectorAll('.award-item');
    awards.forEach((award) => {
      observer.observe(award);
    });
    
    return () => {
      serviceCards.forEach((card) => observer.unobserve(card));
      awards.forEach((award) => observer.unobserve(award));
    };
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-chirag-pink/5 relative" ref={sectionRef}>
      {/* Background elements */}
      <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-gradient-to-r from-chirag-pink/5 to-chirag-purple/5 blur-3xl"></div>
      <div className="absolute bottom-40 right-20 w-80 h-80 rounded-full bg-gradient-to-l from-chirag-peach/5 to-chirag-pink/5 blur-3xl"></div>
      
      <div className="container-custom">
        <div className="text-center mb-16 relative">
          <div className="inline-block relative">
            <span className="absolute -inset-6 rounded-full bg-gradient-to-r from-chirag-pink/10 to-chirag-peach/10 blur-xl"></span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair relative">
              Our <span className="header-gradient">Services</span>
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our range of premium beauty services designed to enhance your natural beauty and create unforgettable looks.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {servicesData.map((service, index) => (
            <div 
              key={service.id} 
              className="service-card group opacity-0 bg-white hover:bg-gradient-to-br hover:from-white hover:to-chirag-pink/10 transition-all duration-500"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className="h-48 mb-4 overflow-hidden rounded-xl">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-playfair text-chirag-darkPurple">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              
              <ul className="mb-6">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-start mb-2">
                    <CheckCircle size={16} className="text-chirag-pink mt-1 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                to={service.link} 
                className="inline-flex items-center text-chirag-darkPurple font-medium border-b-2 border-chirag-pink pb-1 hover:text-chirag-pink transition-colors group-hover:translate-x-1 duration-300"
              >
                Explore Service
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>

       
          
         
        </div>

    </section>
  );
};

export default Services;
