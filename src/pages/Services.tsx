
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Check, Award, Star, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const servicesData = [
  {
    id: 1,
    title: "Bridal Makeup",
    description: "Make your special day unforgettable with our premium bridal makeup services. We create flawless, long-lasting looks that highlight your natural beauty and complement your wedding aesthetic.",
    image: "https://images.unsplash.com/photo-1594489573233-c2d4e4e5f106?auto=format&fit=crop&q=80&w=2000",
    packages: [
      {
        name: "Classic Bridal",
        features: [
          "Personalized consultation",
          "Bridal makeup application",
          "Premium quality products",
          "Consultation and trial session",
          "Lashes included",
          "Touch-up kit"
        ],
        popular: false
      },
      {
        name: "Premium Bridal",
        features: [
          "In-depth beauty consultation",
          "Luxury bridal makeup application",
          "High-end, long-lasting products",
          "Deluxe trial session",
          "Premium lashes and hair styling",
          "Comprehensive touch-up kit",
          "On-site assistant for 4 hours"
        ],
        popular: true
      }
    ]
  },
  {
    id: 2,
    title: "Party Makeup",
    description: "Stand out at any event with our stunning party makeup services. We offer glamorous and sophisticated looks tailored to your personal style and the occasion, ensuring you look and feel your absolute best.",
    image: "https://images.unsplash.com/photo-1588731247530-4076fc99173e?auto=format&fit=crop&q=80&w=2000",
    packages: [
      {
        name: "Classic Glam",
        features: [
          "Personalized look creation",
          "Party makeup application",
          "Quality products",
          "Lashes included",
          "1 hour service"
        ],
        popular: false
      },
      {
        name: "Premium Glam",
        features: [
          "Customized beauty consultation",
          "High-end party makeup application",
          "Premium products and lashes",
          "Hair styling included",
          "Touch-up tips and techniques",
          "1.5 hour service"
        ],
        popular: true
      }
    ]
  },
  {
    id: 3,
    title: "Editorial Makeup",
    description: "Create striking, photogenic looks perfect for photoshoots, magazine spreads, and fashion events. Our editorial makeup pushes creative boundaries while ensuring you look flawless both in person and on camera.",
    image: "https://images.unsplash.com/photo-1542145748-72b2eb8576cd?auto=format&fit=crop&q=80&w=2000",
    packages: [
      {
        name: "Standard Editorial",
        features: [
          "Creative concept development",
          "Editorial makeup application",
          "Photography-ready finish",
          "Basic touch-ups",
          "2 hour service"
        ],
        popular: false
      },
      {
        name: "Avant-Garde Editorial",
        features: [
          "Comprehensive creative direction",
          "Advanced editorial techniques",
          "Special effects and embellishments",
          "High-definition finish",
          "Multiple look changes",
          "Continuous touch-ups",
          "3 hour service"
        ],
        popular: true
      }
    ]
  },
  {
    id: 4,
    title: "Henna Art",
    description: "Add elegance and beauty with our intricate henna designs. We offer both traditional and contemporary styles for weddings, parties, and special occasions, creating personalized art that tells your unique story.",
    image: "https://images.unsplash.com/photo-1583266999030-4fba155cca8e?auto=format&fit=crop&q=80&w=2000",
    packages: [
      {
        name: "Simple Henna",
        features: [
          "Custom design consultation",
          "Simple pattern application",
          "Natural henna paste",
          "Aftercare instructions",
          "1 hour service"
        ],
        popular: false
      },
      {
        name: "Bridal Henna",
        features: [
          "Extensive design consultation",
          "Intricate designs on hands and feet",
          "Premium natural henna",
          "Traditional and modern motifs",
          "Aftercare kit provided",
          "Free touch-ups",
          "3+ hour service"
        ],
        popular: true
      }
    ]
  }
];

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Bride",
    quote: "Chirag transformed me into the bride I always dreamed of being. His attention to detail and understanding of my style was exceptional.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=688"
  },
  {
    id: 2,
    name: "Ananya Patel",
    role: "Fashion Model",
    quote: "Working with Chirag for my editorial shoots has been amazing. He creates looks that photograph beautifully and truly understand the vision.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=764"
  }
];

const Services = () => {
  useEffect(() => {
    // Animation for services on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const services = document.querySelectorAll('.service-animation');
    services.forEach((service) => {
      observer.observe(service);
    });
    
    return () => {
      services.forEach((service) => observer.unobserve(service));
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-chirag-pink/10 to-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-playfair">
              Our <span className="header-gradient">Services</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Discover our range of premium beauty services designed to enhance your natural beauty and create unforgettable looks for any occasion.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="space-y-24">
            {servicesData.map((service, index) => (
              <div key={service.id} className="service-animation opacity-0" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className={`${index % 2 === 1 ? 'order-1 lg:order-2' : ''}`}>
                    <div className="relative">
                      <div className="absolute -inset-4 rounded-xl bg-gradient-to-br from-chirag-pink to-chirag-peach opacity-20 blur-lg"></div>
                      <img 
                        src={service.image} 
                        alt={service.title} 
                        className="rounded-xl shadow-xl w-full h-80 object-cover transform transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </div>
                  
                  <div className={`${index % 2 === 1 ? 'order-2 lg:order-1' : ''}`}>
                    <div className="flex items-center mb-4">
                      <div className="mr-3 p-1.5 rounded-full bg-gradient-to-r from-chirag-pink to-chirag-peach">
                        <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full">
                          <span className="text-chirag-darkPurple font-bold">{index + 1}</span>
                        </div>
                      </div>
                      <h2 className="text-3xl font-bold font-playfair">{service.title}</h2>
                    </div>
                    <p className="text-gray-600 mb-8">{service.description}</p>
                    
                    <div className="space-y-6">
                      {service.packages.map((pkg) => (
                        <div 
                          key={pkg.name} 
                          className={`relative bg-white p-6 rounded-xl shadow-md border ${pkg.popular ? 'border-chirag-pink' : 'border-chirag-pink/20'} hover:shadow-lg transition-all transform hover:-translate-y-1`}
                        >
                          {pkg.popular && (
                            <div className="absolute -top-3 right-4 bg-gradient-to-r from-chirag-pink to-chirag-peach text-black text-xs font-medium px-3 py-1 rounded-full flex items-center">
                              <BadgeCheck size={14} className="mr-1" />
                              Most Popular
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold font-playfair">{pkg.name}</h3>
                            <div className="text-xl font-bold text-chirag-darkPurple">{pkg.price}</div>
                          </div>
                          
                          <ul className="space-y-2 mb-6">
                            {pkg.features.map((feature, i) => (
                              <li key={i} className="flex items-start">
                                <Check size={18} className="text-chirag-pink mt-1 mr-2 flex-shrink-0" />
                                <span className="text-gray-600">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          
                          <Link to="/contact" className={`button-primary inline-block w-full text-center ${pkg.popular ? 'bg-gradient-to-r from-chirag-pink to-chirag-peach' : ''}`}>
                            Book Now
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gradient-to-b from-white to-chirag-pink/5">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4 font-playfair">
              Why Choose <span className="header-gradient">Our Services</span>
            </h2>
            <p className="text-lg text-gray-600">
              With 5+ years of industry experience, we pride ourselves on excellence in every aspect of our work.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-chirag-pink/10 hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-chirag-pink/10 flex items-center justify-center">
                  <Award size={28} className="text-chirag-pink" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center font-playfair">Award-Winning</h3>
              <p className="text-gray-600 text-center">
                Recognized by industry experts for exceptional artistry and innovation in makeup.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-chirag-pink/10 hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-chirag-peach/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-chirag-peach">
                    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center font-playfair">Personalized Care</h3>
              <p className="text-gray-600 text-center">
                Tailored services focused on your individual style, preferences, and unique features.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-chirag-pink/10 hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-chirag-purple/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-chirag-purple">
                    <circle cx="12" cy="12" r="8"></circle>
                    <path d="m12 8 4 4"></path>
                    <path d="M12 16V8"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center font-playfair">Premium Products</h3>
              <p className="text-gray-600 text-center">
                Only using high-quality, professional-grade products for flawless, long-lasting results.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-chirag-pink/10 hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-chirag-gold/10 flex items-center justify-center">
                  <Star size={28} className="text-chirag-gold" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center font-playfair">5+ Years Experience</h3>
              <p className="text-gray-600 text-center">
                Drawing from extensive industry experience to deliver exceptional results for every client.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="py-16 bg-chirag-pink/5">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 font-playfair">Client Testimonials</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear what our clients have to say about their experiences with our services.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-6 rounded-xl shadow-md border border-chirag-pink/10 hover:shadow-lg transition-all">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-14 h-14 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-chirag-darkPurple">{testimonial.name}</h3>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                
                <div className="mt-4 flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-chirag-gold fill-chirag-gold mr-1" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Services */}
      <section className="py-16 bg-gradient-to-r from-chirag-pink/10 to-chirag-peach/10">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 font-playfair">
              Need a <span className="header-gradient">Custom Service?</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Can't find what you're looking for? We offer personalized services tailored to your specific needs and occasion.
            </p>
            <Link to="/contact" className="button-primary relative overflow-hidden group">
              <span className="absolute inset-0 w-0 bg-gradient-to-r from-chirag-peach to-chirag-pink group-hover:w-full transition-all duration-500"></span>
              <span className="relative z-10">Request a Custom Quote</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
