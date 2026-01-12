import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Check, Award, Star, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";

const servicesData = [
  {
    id: 1,
    title: "Bridal Makeup",
    description:
      "Make your special day unforgettable with our premium bridal makeup services. We create flawless, long-lasting looks that highlight your natural beauty and complement your wedding aesthetic.",
    image:
      "https://images.unsplash.com/photo-1594489573233-c2d4e4e5f106?auto=format&fit=crop&q=80&w=2000",
    packages: [
      {
        name: "Classic Bridal",
        price: "₹8,000",
        popular: false,
        features: [
          "Personalized consultation",
          "Bridal makeup application",
          "Premium quality products",
          "Consultation and trial session",
          "Lashes included",
          "Touch-up kit",
        ],
      },
      {
        name: "Premium Bridal",
        price: "₹15,000",
        popular: true,
        features: [
          "In-depth beauty consultation",
          "Luxury bridal makeup application",
          "High-end, long-lasting products",
          "Deluxe trial session",
          "Premium lashes and hair styling",
          "Comprehensive touch-up kit",
          "On-site assistant for 4 hours",
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Party Makeup",
    description:
      "Stand out at any event with our stunning party makeup services.",
    image:
      "https://images.unsplash.com/photo-1588731247530-4076fc99173e?auto=format&fit=crop&q=80&w=2000",
    packages: [
      {
        name: "Classic Glam",
        price: "₹3,000",
        popular: false,
        features: [
          "Personalized look creation",
          "Party makeup application",
          "Quality products",
          "Lashes included",
          "1 hour service",
        ],
      },
      {
        name: "Premium Glam",
        price: "₹5,000",
        popular: true,
        features: [
          "Customized beauty consultation",
          "High-end party makeup application",
          "Premium products and lashes",
          "Hair styling included",
          "Touch-up tips and techniques",
          "1.5 hour service",
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Editorial Makeup",
    description:
      "Create striking, photogenic looks perfect for photoshoots.",
    image:
      "https://images.unsplash.com/photo-1542145748-72b2eb8576cd?auto=format&fit=crop&q=80&w=2000",
    packages: [
      {
        name: "Standard Editorial",
        price: "₹7,000",
        popular: false,
        features: [
          "Creative concept development",
          "Editorial makeup application",
          "Photography-ready finish",
          "Basic touch-ups",
          "2 hour service",
        ],
      },
      {
        name: "Avant-Garde Editorial",
        price: "₹12,000",
        popular: true,
        features: [
          "Comprehensive creative direction",
          "Advanced editorial techniques",
          "Special effects and embellishments",
          "High-definition finish",
          "Multiple look changes",
          "Continuous touch-ups",
          "3 hour service",
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Henna Art",
    description:
      "Add elegance and beauty with our intricate henna designs.",
    image:
      "https://images.unsplash.com/photo-1583266999030-4fba155cca8e?auto=format&fit=crop&q=80&w=2000",
    packages: [
      {
        name: "Simple Henna",
        price: "₹2,000",
        popular: false,
        features: [
          "Custom design consultation",
          "Simple pattern application",
          "Natural henna paste",
          "Aftercare instructions",
          "1 hour service",
        ],
      },
      {
        name: "Bridal Henna",
        price: "₹6,000",
        popular: true,
        features: [
          "Extensive design consultation",
          "Intricate designs on hands and feet",
          "Premium natural henna",
          "Traditional and modern motifs",
          "Aftercare kit provided",
          "Free touch-ups",
          "3+ hour service",
        ],
      },
    ],
  },
];

const Services = () => {
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
      { threshold: 0.1 }
    );

    document
      .querySelectorAll(".service-animation")
      .forEach((el) => observer.observe(el));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-to-b from-chirag-pink/10 to-white">
        <div className="container-custom space-y-24">
          {servicesData.map((service) => (
            <div key={service.id} className="service-animation opacity-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <img
                  src={service.image}
                  alt={service.title}
                  className="rounded-xl shadow-xl h-80 w-full object-cover"
                />

                <div>
                  <h2 className="text-3xl font-bold mb-4 font-playfair">
                    {service.title}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {service.description}
                  </p>

                  {service.packages.map((pkg) => (
                    <div
                      key={pkg.name}
                      className="relative bg-white p-6 mb-6 rounded-xl shadow-md border"
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 right-4 bg-gradient-to-r from-chirag-pink to-chirag-peach text-black text-xs px-3 py-1 rounded-full flex items-center">
                          <BadgeCheck size={14} className="mr-1" />
                          Most Popular
                        </div>
                      )}

                      <div className="flex justify-between mb-4">
                        <h3 className="text-xl font-semibold">
                          {pkg.name}
                        </h3>
                        <span className="font-bold text-chirag-darkPurple">
                          {pkg.price}
                        </span>
                      </div>

                      <ul className="space-y-2 mb-4">
                        {pkg.features.map((f, i) => (
                          <li key={i} className="flex items-start">
                            <Check size={16} className="mr-2 text-chirag-pink" />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <Link
                        to={`/book?service=${encodeURIComponent(
                          service.title
                        )}&package=${encodeURIComponent(pkg.name)}`}
                        className="button-primary w-full text-center inline-block"
                      >
                        Book Now
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
