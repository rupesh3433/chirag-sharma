import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { CheckCircle, Star, ChevronLeft, ChevronRight } from "lucide-react";

import InstagramVideos from "../components/portfolio/InstagramVideos";
import YoutubeVideos from "../components/portfolio/YoutubeVideos";

/* -------------------- DATA -------------------- */

const servicesData = [
  {
    id: 1,
    title: "Bridal Makeup",
    description:
      "Luxury bridal makeup services by Celebrity Makeup Artist Chirag Sharma, crafted with premium products and a flawless, long-lasting finish.",
    image: "/photos/chirag1.PNG",
    features: [
      "Chirag’s Signature Bridal Makeup",
      "Luxury Bridal Makeup (HD / Brush)",
      "Reception / Engagement / Cocktail Makeup",
      "Fully customized luxury finish",
    ],
  },
  {
    id: 2,
    title: "Party Makeup",
    description:
      "Glamorous party makeup for receptions, engagements, cocktails, and celebrations, tailored to your outfit and occasion.",
    image: "/photos/chirag2.PNG",
    features: [
      "Party Makeup by Chirag Sharma",
      "Party Makeup by Senior Artist",
      "Event-based customization",
      "Excluding travel & accommodation",
    ],
  },
  {
    id: 3,
    title: "Haldi & Mehendi Makeup",
    description:
      "Bright, fresh, and elegant makeup for Haldi and Mehendi ceremonies, designed to enhance natural beauty.",
    image: "/photos/chirag3.PNG",
    features: [
      "Haldi / Mehendi Makeup by Chirag Sharma",
      "Haldi / Mehendi Makeup by Senior Artist",
      "Soft, natural, ceremony-ready finish",
      "Excluding travel & accommodation",
    ],
  },
  {
    id: 4,
    title: "Groom Makeup",
    description:
      "Professional groom makeup services ensuring a sharp, photo-ready look for weddings and receptions.",
    image: "/photos/chirag4.PNG",
    features: [
      "Picture Perfect Photo-Ready Makeup",
      "Wedding Reception Groom Makeup",
      "Luxury high-end products only",
      "Hairstyling included",
    ],
  },
];


const eventDummyImages = [
  "/photos/chirag1.PNG",
  "/photos/chirag2.PNG",
  "/photos/chirag3.PNG",
  "/photos/chirag4.PNG",
];

const portfolioItems = [
  {
    id: 1,
    title: "Bridal Elegance",
    category: "Bridal Makeup",
    image:
      "https://images.unsplash.com/photo-1594489573233-c2d4e4e5f106?auto=format&fit=crop&q=80&w=2000",
    description: "Crafting timeless bridal looks with a touch of magic",
  },
  {
    id: 2,
    title: "Editorial Dream",
    category: "Editorial Makeup",
    image:
      "https://images.unsplash.com/photo-1542145748-72b2eb8576cd?auto=format&fit=crop&q=80&w=2000",
    description: "Bold, creative looks for photoshoots and fashion events",
  },
  {
    id: 3,
    title: "Glamorous Evening",
    category: "Party Makeup",
    image:
      "https://images.unsplash.com/photo-1588731247530-4076fc99173e?auto=format&fit=crop&q=80&w=2000",
    description: "Stunning looks that last throughout your special night",
  },
  {
    id: 4,
    title: "Intricate Henna",
    category: "Henna Art",
    image:
      "https://images.unsplash.com/photo-1583266999030-4fba155cca8e?auto=format&fit=crop&q=80&w=2000",
    description: "Beautiful designs that tell your unique story",
  },
];

const videoPortfolioItems = [
  {
    id: 1,
    title: "Bridal Transformation",
    videoUrl: "https://www.instagram.com/p/CrGyxUDI7dl/embed",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1594489573233-c2d4e4e5f106?auto=format&fit=crop&q=80&w=2000",
    instagramLink: "https://www.instagram.com/p/CrGyxUDI7dl/",
  },
  {
    id: 2,
    title: "Makeup Tutorial",
    videoUrl: "https://www.instagram.com/p/CqWzc6DIvLp/embed",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1542145748-72b2eb8576cd?auto=format&fit=crop&q=80&w=2000",
    instagramLink: "https://www.instagram.com/p/CqWzc6DIvLp/",
  },
  {
    id: 3,
    title: "Behind the Scenes",
    videoUrl: "https://www.instagram.com/p/Cp9ZsHIovZ3/embed",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1588731247530-4076fc99173e?auto=format&fit=crop&q=80&w=2000",
    instagramLink: "https://www.instagram.com/p/Cp9ZsHIovZ3/",
  },
];

const testimonials = [
  {
    id: 1,
    name: "Priya Singh",
    role: "Bride",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1974",
    quote:
      "Chirag transformed me into the bride I always dreamed of becoming. The makeup was flawless and lasted throughout my wedding day. Highly recommend!",
    rating: 5,
  },
  {
    id: 2,
    name: "Aisha Kapoor",
    role: "Fashion Model",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=1974",
    quote:
      "Working with Chirag for my editorial shoots has been amazing. His artistic vision and attention to detail are unmatched in the industry.",
    rating: 5,
  },
  {
    id: 3,
    name: "Neha Sharma",
    role: "Celebrity",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1974",
    quote:
      "Chirag has been my go-to makeup artist for all my public appearances. His ability to create unique looks that complement my style is extraordinary.",
    rating: 5,
  },
  {
    id: 4,
    name: "Mira Patel",
    role: "Regular Client",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=1974",
    quote:
      "The henna designs Chirag created for my sister's wedding were breathtaking. Everyone couldn't stop complimenting the intricate patterns.",
    rating: 5,
  },
];

/* -------------------- COMPONENT -------------------- */

const Index = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const sectionRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLElement>(null);
  const portfolioRef = useRef<HTMLElement>(null);

  /* Scroll tracking */
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const total =
            document.documentElement.scrollHeight - window.innerHeight;
          setScrollProgress((window.scrollY / total) * 100);
          setScrollY(window.scrollY);

          // EVENTS scroll animation (FIXED)
          if (eventsRef.current) {
            const rect = eventsRef.current.getBoundingClientRect();

            if (rect.top < window.innerHeight && rect.bottom > 0) {
              const items =
                eventsRef.current.querySelectorAll(".portfolio-item");

              items.forEach((item) => {
                const element = item as HTMLElement;
                element.style.opacity = "1";
                element.classList.add("animate-fade-in");
              });
            }
          }

          // Services scroll animation
          if (sectionRef.current) {
            const items = sectionRef.current.querySelectorAll(".service-card");
            items.forEach((item) => {
              const rect = item.getBoundingClientRect();
              if (rect.top < window.innerHeight * 0.8) {
                item.classList.add("animate-fade-in");
              }
            });
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePlayVideo = (id: number) => setActiveVideo(id);
  const handleCloseVideo = () => setActiveVideo(null);

  const nextTestimonial = () =>
    setTestimonialIndex((i) => (i === testimonials.length - 1 ? 0 : i + 1));

  const prevTestimonial = () =>
    setTestimonialIndex((i) => (i === 0 ? testimonials.length - 1 : i - 1));

  return (
    <div className="min-h-screen relative">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        <div
          className="h-full bg-gradient-to-r from-chirag-pink via-chirag-peach to-chirag-gold transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-10 w-24 h-24 bg-chirag-pink/10 blur-xl rounded-full animate-pulse" />
        <div className="absolute bottom-1/3 right-10 w-32 h-32 bg-chirag-peach/10 blur-xl rounded-full animate-pulse" />
      </div>

      <Navbar />

      <main className="relative z-10">
        {/* ================= HERO ================= */}
        <section className="pt-28 pb-20 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-playfair font-bold leading-tight mb-6">
                  Where{" "}
                  <span className="header-gradient">Art Meets Beauty</span>
                </h1>

                <p className="text-gray-600 text-lg max-w-xl mx-auto lg:mx-0 mb-6">
                  Transforming faces through timeless makeup artistry and
                  elegant henna designs. Experience beauty with Chirag Sharma's
                  signature touch.
                </p>

                <div className="relative mb-8 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-chirag-pink/20 shadow-sm max-w-xl mx-auto lg:mx-0">
                  <p className="text-chirag-darkPurple/80 italic font-playfair">
                    "Beauty begins the moment you decide to be yourself."
                  </p>
                  <p className="text-right text-sm mt-2 text-chirag-darkPurple/60">
                    — Chirag's philosophy
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  {/* HERO BUTTON FIXED */}
                  <a
                    href="/Catalogue.pdf"
                    download
                    className="button-primary text-center"
                  >
                    Download Catalogue
                  </a>
                  <Link to="/book" className="button-secondary text-center">
                    Book Now
                  </Link>
                </div>
              </div>

              <div className="order-1 lg:order-2 flex justify-center">
                <div className="relative">
                  <div className="w-[220px] sm:w-[260px] md:w-[300px] lg:w-[500px] xl:w-[580px] 2xl:w-[620px] aspect-square rounded-full overflow-hidden shadow-xl">
                    <img
                      src="/photos/chiragicon1.JPG"
                      alt="Chirag Sharma - Makeup Artist"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-white px-4 py-2 rounded-full shadow-md border">
                    <span className="text-sm font-semibold text-gray-800">
                      9+ Years Experience
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SERVICES ================= */}
        <section
          ref={sectionRef}
          className="relative py-24 bg-gradient-to-b from-white to-chirag-pink/10"
        >
          <div className="container-custom">
            {/* Header */}
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold font-playfair mb-6">
                Our <span className="header-gradient">Services</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Premium makeup and henna services crafted by Celebrity Makeup
                Artist Chirag Sharma.
              </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {servicesData.map((service) => (
                <div
                  key={service.id}
                  className="group relative h-[420px] rounded-2xl overflow-hidden
          shadow-lg hover:shadow-2xl transition-all duration-500"
                >
                  {/* Background Image */}
                  <img
                    src={service.image}
                    alt={service.title}
                    className="absolute inset-0 w-full h-full object-cover
            transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Dark overlay (always present) */}
                  <div className="absolute inset-0 bg-black/35" />

                  {/* Default content (title only) */}
                  <div
                    className="absolute bottom-6 left-6 right-6 transition-all duration-500
            group-hover:opacity-0 group-hover:translate-y-4"
                  >
                    <h3 className="text-white text-2xl font-playfair font-semibold">
                      {service.title}
                    </h3>
                  </div>

                  {/* Hover content */}
                  <div
                    className="absolute inset-0 flex flex-col justify-end p-6
            bg-gradient-to-t from-black/85 via-black/60 to-transparent
            opacity-0 group-hover:opacity-100
            transition-all duration-500"
                  >
                    <h3 className="text-white text-xl font-playfair font-semibold mb-2">
                      {service.title}
                    </h3>

                    <p className="text-white/80 text-sm mb-4 line-clamp-3">
                      {service.description}
                    </p>

                    <ul className="space-y-2 mb-5">
                      {service.features.slice(0, 3).map((f, i) => (
                        <li
                          key={i}
                          className="flex items-start text-sm text-white/90"
                        >
                          <CheckCircle
                            size={16}
                            className="text-chirag-pink mr-2 mt-1 flex-shrink-0"
                          />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link
                      to="/services"
                      className="inline-flex w-fit items-center gap-2 px-5 py-2
              rounded-full bg-white/20 backdrop-blur-md text-white text-sm
              hover:bg-white/30 transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {/* 👇 ADD HERE */}
<div className="mt-20 text-center">
  <Link
    to="/services"
    className="inline-block px-10 py-4 rounded-full font-semibold
    bg-gradient-to-r from-chirag-pink to-chirag-peach
    text-black shadow-lg hover:shadow-xl hover:scale-101
    transition-all duration-300"
  >
    Explore All Services
  </Link>
</div>
          </div>

          
        </section>

        {/* ================= EVENTS ================= */}
        <section
          ref={eventsRef}
          className="relative py-24 overflow-hidden bg-gradient-to-b from-white via-white to-chirag-pink/10"
        >
          {/* Decorative blobs */}
          <div
            className="absolute -top-48 -right-48 w-[32rem] h-[32rem] rounded-full bg-gradient-to-br from-chirag-purple/20 to-chirag-pink/20 blur-3xl opacity-60"
            style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          />
          <div
            className="absolute -bottom-48 -left-48 w-[32rem] h-[32rem] rounded-full bg-gradient-to-tr from-chirag-peach/20 to-chirag-pink/20 blur-3xl opacity-60"
            style={{ transform: `translateY(${scrollY * -0.1}px)` }}
          />

          <div className="container-custom relative z-10">
            {/* Header */}
            <div className="text-center mb-20">
              <div className="inline-block relative mb-6">
                <div className="absolute inset-0 -m-6 bg-gradient-to-r from-chirag-pink/30 to-chirag-peach/30 blur-2xl rounded-full" />
                <h2 className="relative text-4xl md:text-5xl font-bold font-playfair">
                  Upcoming <span className="header-gradient">Events</span>
                </h2>
              </div>

              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Discover our upcoming bridal looks, fashion shoots, celebrity
                makeovers, and premium henna showcases.
              </p>
            </div>

            {/* Event Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {portfolioItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative"
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div
                    className={`relative h-[420px] rounded-2xl overflow-hidden
              shadow-lg transition-all duration-500
              ${
                activeIndex === index
                  ? "shadow-2xl -translate-y-2"
                  : "shadow-md"
              }`}
                  >
                    {/* Image */}
                    <img
                      src={eventDummyImages[index % eventDummyImages.length]}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover
              transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90" />

                    {/* Content */}
                    <div
                      className="absolute inset-0 flex flex-col justify-end p-6
              transition-all duration-500"
                    >
                      <span className="text-chirag-pink text-xs uppercase tracking-widest mb-2">
                        {item.category}
                      </span>

                      <h3 className="text-white text-xl font-semibold font-playfair leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-white/80 text-sm mt-2 line-clamp-3">
                        {item.description}
                      </p>

                      {/* CTA */}
                      <div
                        className="mt-5 transform translate-y-6 opacity-0
                group-hover:translate-y-0 group-hover:opacity-100
                transition-all duration-500"
                      >
                        <Link
                          to="/events"
                          className="inline-flex items-center gap-2 px-5 py-2
                  rounded-full bg-white/20 backdrop-blur-md text-white text-sm
                  hover:bg-white/30 transition-colors"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center">
              <Link
                to="/events"
                className="inline-block px-10 py-4 rounded-full font-semibold
        bg-gradient-to-r from-chirag-pink to-chirag-peach
        text-black shadow-lg hover:shadow-xl hover:scale-101
        transition-all duration-300"
              >
                Explore All Events
              </Link>
            </div>
          </div>
        </section>

        {/* ================= VIDEO SECTION (NEW) ================= */}
        <section ref={portfolioRef} className="py-20 bg-white">
          <div className="container-custom space-y-24">
            {/* Instagram FIRST */}
            <InstagramVideos limit={6} />

            {/* YouTube BELOW */}
            <YoutubeVideos limit={12} />


          </div>
          <div className="py-10 text-center">
              <Link to="/portfolio" className="button-primary">
                Explore Full Portfolio
              </Link>
            </div>
        </section>

        {/* ================= TESTIMONIALS ================= */}
        <section className="py-10 bg-chirag-pink/5">
          <div className="container-custom relative">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
                Client <span className="header-gradient">Testimonials</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Hear what our clients have to say about their experience working
                with Chirag Sharma.
              </p>
            </div>

            <div className="relative">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${testimonialIndex * 100}%)`,
                  }}
                >
                  {testimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="w-full flex-shrink-0 px-4"
                    >
                      <div className="testimonial-card max-w-3xl mx-auto text-center">
                        <div className="w-20 h-20 mx-auto mb-6 overflow-hidden rounded-full border-4 border-chirag-pink/20">
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex justify-center mb-4">
                          {Array.from({ length: testimonial.rating }).map(
                            (_, i) => (
                              <Star
                                key={i}
                                size={20}
                                className="fill-chirag-gold text-chirag-gold"
                              />
                            )
                          )}
                        </div>

                        <blockquote className="text-lg md:text-xl text-gray-700 italic mb-6">
                          "{testimonial.quote}"
                        </blockquote>

                        <cite className="block not-italic">
                          <span className="block text-lg font-semibold font-playfair text-chirag-darkPurple">
                            {testimonial.name}
                          </span>
                          <span className="text-chirag-gray">
                            {testimonial.role}
                          </span>
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
                  onClick={() => setTestimonialIndex(index)}
                  className={`w-3 h-3 mx-1 rounded-full transition-all ${
                    index === testimonialIndex
                      ? "bg-chirag-pink scale-125"
                      : "bg-gray-300 hover:bg-chirag-pink/50"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
