
import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Priya Singh",
    role: "Bride",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1974",
    quote: "Chirag transformed me into the bride I always dreamed of becoming. The makeup was flawless and lasted throughout my wedding day. Highly recommend!",
    rating: 5
  },
  {
    id: 2,
    name: "Aisha Kapoor",
    role: "Fashion Model",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=1974",
    quote: "Working with Chirag for my editorial shoots has been amazing. His artistic vision and attention to detail are unmatched in the industry.",
    rating: 5
  },
  {
    id: 3,
    name: "Neha Sharma",
    role: "Celebrity",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1974",
    quote: "Chirag has been my go-to makeup artist for all my public appearances. His ability to create unique looks that complement my style is extraordinary.",
    rating: 5
  },
  {
    id: 4,
    name: "Mira Patel",
    role: "Regular Client",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=1974",
    quote: "The henna designs Chirag created for my sister's wedding were breathtaking. Everyone couldn't stop complimenting the intricate patterns.",
    rating: 5
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((current) => (current === testimonials.length - 1 ? 0 : current + 1));
  };

  const prevTestimonial = () => {
    setActiveIndex((current) => (current === 0 ? testimonials.length - 1 : current - 1));
  };

  return (
    <section className="py-20 bg-chirag-pink/5">
      <div className="container-custom relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            Client <span className="header-gradient">Testimonials</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hear what our clients have to say about their experience working with Chirag Sharma.
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="testimonial-card max-w-3xl mx-auto text-center">
                    <div className="w-20 h-20 mx-auto mb-6 overflow-hidden rounded-full border-4 border-chirag-pink/20">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex justify-center mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} size={20} className="fill-chirag-gold text-chirag-gold" />
                      ))}
                    </div>
                    
                    <blockquote className="text-lg md:text-xl text-gray-700 italic mb-6">
                      "{testimonial.quote}"
                    </blockquote>
                    
                    <cite className="block not-italic">
                      <span className="block text-lg font-semibold font-playfair text-chirag-darkPurple">{testimonial.name}</span>
                      <span className="text-chirag-gray">{testimonial.role}</span>
                    </cite>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-md hover:bg-chirag-pink/10 transition-colors z-10"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} className="text-chirag-darkPurple" />
          </button>
          
          <button 
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-md hover:bg-chirag-pink/10 transition-colors z-10"
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} className="text-chirag-darkPurple" />
          </button>
        </div>

        <div className="flex justify-center mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 mx-1 rounded-full transition-all ${
                index === activeIndex ? 'bg-chirag-pink scale-125' : 'bg-gray-300 hover:bg-chirag-pink/50'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
