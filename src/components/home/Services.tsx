import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const servicesData = [
  {
    id: 1,
    title: "Bridal Makeup",
    description:
      "Luxury bridal makeup by Celebrity Makeup Artist Chirag Sharma with premium products and flawless finish.",
    image: "/photos/chirag1.PNG",
    features: [
      "Signature bridal looks",
      "HD / Brush technique",
      "Luxury international products",
      "Fully customized finish",
    ],
  },
  {
    id: 2,
    title: "Party Makeup",
    description:
      "Glam makeup for receptions, engagements, cocktails, and special events.",
    image: "/photos/chirag2.PNG",
    features: [
      "By Chirag Sharma or Senior Artist",
      "Event-based customization",
      "Long-lasting glam",
      "Premium products",
    ],
  },
  {
    id: 3,
    title: "Henna (Mehendi)",
    description:
      "Intricate bridal and party henna using premium natural henna.",
    image: "/photos/chirag3.PNG",
    features: [
      "By Chirag or Senior Artist",
      "Traditional & modern designs",
      "Bridal henna available",
      "Natural ingredients",
    ],
  },
  {
    id: 4,
    title: "Celebrity Makeup",
    description:
      "High-end celebrity makeup services delivered with VIP standards.",
    image: "/photos/chirag4.PNG",
    features: [
      "Celebrity MUA",
      "9+ years experience",
      "Luxury service standards",
      "Event & bridal focus",
    ],
  },
];

const Services = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    document
      .querySelectorAll(".service-card")
      .forEach((el) => observer.observe(el));
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-white to-chirag-pink/5"
    >
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-4">
            Our <span className="header-gradient">Services</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Premium makeup and henna services by Celebrity Makeup Artist Chirag
            Sharma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {servicesData.map((service) => (
            <div
              key={service.id}
              className="service-card opacity-0 bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all"
            >
              <div className="h-44 mb-4 overflow-hidden rounded-lg">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>

              <h3 className="text-xl font-semibold font-playfair mb-2">
                {service.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {service.description}
              </p>

              <ul className="space-y-2 mb-6">
                {service.features.map((f, i) => (
                  <li key={i} className="flex items-start text-sm">
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
                className="inline-block font-medium text-chirag-darkPurple border-b-2 border-chirag-pink hover:text-chirag-pink"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
