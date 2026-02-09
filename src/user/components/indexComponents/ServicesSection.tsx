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

  const next = () => scrollToIndex(index + 1);
  const prev = () => scrollToIndex(index - 1);

  return (
    <section className="py-10 sm:py-10 lg:py-10 bg-gradient-to-b from-white to-chirag-pink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-playfair font-bold mb-4">
            Our <span className="header-gradient">Services</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto">
            Premium makeup and henna services crafted by Celebrity Makeup Artist
            Chirag Sharma.
          </p>
        </div>

        {/* MOBILE SLIDER (ONLY MOBILE) */}
        <div className="md:hidden relative pb-4">
          <div
            ref={sliderRef}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-x overscroll-x-contain scrollbar-hide pb-3"
            onScroll={(e) => {
              const el = e.currentTarget;
              const i = Math.round(el.scrollLeft / el.clientWidth);
              setIndex(i);
            }}
          >
            {servicesData.map((service) => (
              <div key={service.id} className="min-w-full snap-center px-3">
                <div className="bg-white rounded-2xl shadow-md flex flex-col h-[590px] overflow-y-auto touch-pan-y">
                <div className="relative min-h-[320px]">
                <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />

                    <button
                      onClick={prev}
                      className="absolute -bottom-4 left-0 z-20 w-9 h-9 rounded-full bg-gradient-to-r from-chirag-pink to-chirag-peach shadow-xl flex items-center justify-center"
                    >
                      <ChevronLeft size={20} className="text-black" />
                    </button>

                    <button
                      onClick={next}
                      className="absolute -bottom-4 right-0 z-20 w-9 h-9 rounded-full bg-gradient-to-r from-chirag-pink to-chirag-peach shadow-xl flex items-center justify-center"
                    >
                      <ChevronRight size={20} className="text-black" />
                    </button>
                  </div>

                  <div className="flex flex-col flex-1 px-4 pt-6 pb-4">
                  <h3 className="font-playfair font-semibold text-lg mb-2">
                      {service.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {service.description}
                    </p>

                    <ul className="space-y-2 mb-3 overflow-hidden">
                      {service.features.map((f, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <CheckCircle className="w-4 h-4 mr-2 text-chirag-pink mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to="/services"
                      className="text-sm font-semibold text-black mt-auto py-1"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-2">
            {servicesData.map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 mx-1 rounded-full transition-all ${
                  i === index
                    ? "bg-chirag-pink scale-125"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* TABLET + DESKTOP GRID */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {servicesData.map((service) => (
            <div
              key={service.id}
              className="group relative h-[420px] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <img
                src={service.image}
                alt={service.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/35" />

              <div className="absolute bottom-6 left-6 right-6 transition-all duration-500 group-hover:opacity-0">
                <h3 className="text-white text-2xl font-playfair font-semibold">
                  {service.title}
                </h3>
              </div>

              <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/85 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                <h3 className="text-white text-xl font-playfair font-semibold mb-2">
                  {service.title}
                </h3>
                <p className="text-white/80 text-sm mb-4 line-clamp-3">
                  {service.description}
                </p>
                <ul className="space-y-2 mb-5">
                  {service.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start text-sm text-white/90"
                    >
                      <CheckCircle
                        size={16}
                        className="text-chirag-pink mr-2 mt-1"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/services"
                  className="inline-flex w-fit px-5 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-sm"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 lg:mt-10 text-center">
          <Link
            to="/services"
            className="inline-block px-8 lg:px-10 py-3 lg:py-4 rounded-full font-semibold bg-gradient-to-r from-chirag-pink to-chirag-peach text-black shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Explore All Services
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
