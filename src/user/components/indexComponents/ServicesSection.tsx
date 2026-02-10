// =======================
// ServicesSection.tsx
// PRODUCTION READY (FINAL – MATCHES EVENTS BEHAVIOR)
//
// ✔ MOBILE (<640px): SLIDER ONLY
// ✔ SMALL RANGE (640px–767px): GRID, 2 CARDS PER ROW
// ✔ TABLET (≥768px) + DESKTOP: GRID, 4 CARDS PER ROW
// ✔ TABLET LOOKS EXACTLY LIKE DESKTOP (same scale, same layout)
// ✔ HOVER LOGIC RESTORED (TITLE → DETAILS TRANSITION)
// ✔ TEXT ADAPTS CLEANLY (NO CLIPPING / NO JUMPS)
// ✔ WIDTH MATCHES HERO (max-w-7xl)
// ✔ CARD SIZE UNCHANGED
// =======================

import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

const servicesData = [
  {
    id: 1,
    title: "Bridal Makeup",
    description:
      "Luxury bridal makeup services by Celebrity Makeup Artist Chirag Sharma, crafted with premium products and a flawless, long-lasting finish.",
    image: "/photos/chirag1.jpeg",
    features: [
      "Chirag's Signature Bridal Makeup",
      "Luxury Bridal Makeup (HD / Brush)",
      "Reception / Engagement / Cocktail Makeup",
    ],
  },
  {
    id: 2,
    title: "Party Makeup",
    description:
      "Glamorous party makeup for receptions, engagements, cocktails, and celebrations, tailored to your outfit and occasion.",
    image: "/photos/chirag2.jpeg",
    features: [
      "Party Makeup by Chirag Sharma",
      "Party Makeup by Senior Artist",
      "Event-based customization",
    ],
  },
  {
    id: 3,
    title: "Haldi & Mehendi Makeup",
    description:
      "Bright, fresh, and elegant makeup for Haldi and Mehendi ceremonies.",
    image: "/photos/chirag3.jpeg",
    features: [
      "Haldi / Mehendi Makeup by Chirag Sharma",
      "Senior Artist Option",
      "Soft, natural finish",
    ],
  },
  {
    id: 4,
    title: "Groom Makeup",
    description:
      "Professional groom makeup ensuring a sharp, photo-ready look.",
    image: "/photos/chirag4.jpeg",
    features: ["Photo-ready makeup", "Wedding & Reception", "Luxury products"],
  },
];

const ServicesSection = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollToIndex = (i: number) => {
    if (!sliderRef.current) return;
    const clamped = Math.max(0, Math.min(i, servicesData.length - 1));
    sliderRef.current.scrollTo({
      left: sliderRef.current.clientWidth * clamped,
      behavior: "smooth",
    });
    setIndex(clamped);
  };

  return (
    <section className="pt-10 sm:pt-12 lg:pt-14 pb-2 bg-gradient-to-b from-white to-chirag-pink/5 w-full">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* HEADER */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="font-playfair font-bold tracking-tight text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] mb-3">
            Our <span className="header-gradient">Services</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            Premium makeup and henna services by Celebrity Makeup Artist
            Chirag Sharma.
          </p>
        </div>

        {/* MOBILE SLIDER (<640px ONLY) */}
        <div className="sm:hidden relative pb-4">
          <div
            ref={sliderRef}
            className="flex overflow-x-auto snap-x snap-mandatory"
            onScroll={(e) =>
              setIndex(
                Math.round(
                  e.currentTarget.scrollLeft / e.currentTarget.clientWidth
                )
              )
            }
          >
            {servicesData.map((service) => (
              <div key={service.id} className="min-w-full snap-center px-4">
                <div className="bg-white rounded-xl shadow-md h-[480px] overflow-hidden flex flex-col">
                  <div className="relative h-[250px]">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />

                    <button
                      onClick={() => scrollToIndex(index - 1)}
                      className="absolute -bottom-4 left-4 w-7 h-7 rounded-full bg-chirag-pink shadow flex items-center justify-center"
                    >
                      <ChevronLeft size={14} />
                    </button>

                    <button
                      onClick={() => scrollToIndex(index + 1)}
                      className="absolute -bottom-4 right-4 w-7 h-7 rounded-full bg-chirag-pink shadow flex items-center justify-center"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="flex flex-col flex-1 px-4 pt-5 pb-4">
                    <h3 className="font-playfair font-semibold text-sm mb-1.5">
                      {service.title}
                    </h3>

                    <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                      {service.description}
                    </p>

                    <ul className="space-y-1.5 mb-3">
                      {service.features.map((f, i) => (
                        <li key={i} className="flex items-start text-xs">
                          <CheckCircle className="w-3.5 h-3.5 mr-2 text-chirag-pink mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link
                      to="/services"
                      className="text-xs font-semibold text-black mt-auto"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-3">
            {servicesData.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 mx-1 rounded-full ${
                  i === index ? "bg-chirag-pink" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* GRID:
            640–767px → 2 columns
            ≥768px    → 4 columns (tablet = desktop)
        */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {servicesData.map((service) => (
            <div
              key={service.id}
              className="group relative h-[300px] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            >
              <img
                src={service.image}
                alt={service.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-black/35" />

              {/* DEFAULT TITLE */}
              <div className="absolute bottom-4 left-4 right-4 transition-opacity duration-300 group-hover:opacity-0">
                <h3 className="text-white text-base font-playfair font-semibold">
                  {service.title}
                </h3>
              </div>

              {/* HOVER DETAILS */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/85 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-white text-sm font-playfair font-semibold mb-1.5">
                  {service.title}
                </h3>

                <p className="text-white/80 text-xs mb-3 line-clamp-3">
                  {service.description}
                </p>

                <ul className="space-y-1.5 mb-3">
                  {service.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start text-xs text-white/90"
                    >
                      <CheckCircle
                        size={13}
                        className="text-chirag-pink mr-2 mt-0.5"
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/services"
                  className="inline-flex w-fit px-3 py-1 rounded-full bg-white/20 text-white text-xs"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            to="/services"
            className="inline-block px-6 py-2.5 rounded-full font-semibold bg-gradient-to-r from-chirag-pink to-chirag-peach text-black shadow-md hover:shadow-lg transition-all text-xs sm:text-sm"
          >
            Explore All Services
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
