import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Check, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";

const servicesSections = [
  {
    title: "Bridal Makeup Services",
    images: ["/photos/chirag1.PNG", "/photos/chirag2.PNG"],
    imageHeight: "h-[520px] lg:h-[520px]",
    packages: [
      {
        name: "Chirag’s Signature Bridal Makeup",
        price: "₹99,999",
        popular: true,
        features: [
          "Signature bridal look by Chirag",
          "Premium luxury products",
          "Fully customized luxury finish",
          "Complimentary mini touch-up kit",
          "Excluding travel & accommodation",
        ],
      },
      {
        name: "Luxury Bridal Makeup (HD / Brush)",
        price: "₹79,999",
        popular: false,
        features: [
          "HD / Brush technique",
          "Flawless, long-wear, photo-ready finish",
          "Excluding travel & accommodation",
        ],
      },
      {
        name: "Reception / Engagement / Cocktail Makeup",
        price: "₹59,999",
        popular: false,
        features: [
          "Glam makeup for wedding events",
          "Customized per outfit & occasion",
          "Excluding travel & accommodation",
        ],
      },
    ],
  },

  {
    title: "Party Makeup Services",
    images: ["/photos/chirag4.PNG"],
    imageHeight: "h-[460px] lg:h-[540px]",
    imagePosition: "50% 35%",
    packages: [
      {
        name: "Party Makeup – By Chirag Sharma",
        price: "₹19,999",
        popular: true,
        features: ["Excluding travel & accommodation"],
      },
      {
        name: "Party Makeup – By Senior Artist",
        price: "₹6,999",
        popular: false,
        features: ["Excluding travel & accommodation"],
      },
    ],
  },

  {
    title: "Haldi & Mehendi Makeup Services",
    images: ["/photos/chirag5.PNG"],
    imageHeight: "h-[440px] lg:h-[540px]",
    imagePosition: "50% 18%",
    packages: [
      {
        name: "Haldi / Mehendi – By Chirag Sharma",
        price: "₹44,999",
        popular: true,
        features: ["Excluding travel & accommodation"],
      },
      {
        name: "Haldi / Mehendi – By Senior Artist",
        price: "₹19,999",
        popular: false,
        features: ["Excluding travel & accommodation"],
      },
    ],
  },

  {
    title: "Groom Makeup Services",
    images: ["/photos/chirag3.PNG"],
    imageHeight: "h-[420px] lg:h-[670px]",
    imagePosition: "50% 25%",
    packages: [
      {
        name: "Picture Perfect Photo-Ready Makeup",
        price: "₹14,999",
        popular: true,
        features: [
          "Luxury high-end products",
          "Hairstyling included",
          "Excluding travel & accommodation",
        ],
      },
      {
        name: "Wedding Reception Groom Makeup",
        price: "₹19,999",
        popular: false,
        features: [
          "Soft, flawless HD finish",
          "Hairstyling included",
          "Excluding travel & accommodation",
        ],
      },
    ],
  },
];

const Services = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow">
{/* ================= HERO ================= */}
<section className="pt-28 pb-5 bg-white">
  <div className="container-custom text-center">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-playfair font-bold leading-tight mb-6">
        Our <span className="header-gradient">Services</span>
      </h1>

      <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
        Premium makeup services crafted with luxury, elegance, and artistry —
        designed to make every moment unforgettable.
      </p>
  </div>
</section>


        {/* SERVICES */}
        <section className="py-19 bg-gradient-to-b from-white to-chirag-pink/10">
          <div className="max-w-7xl mx-auto px-4 space-y-36 mb-20">
            {servicesSections.map((section, idx) => (
              <div key={idx}>
                <div
                  className={`grid lg:grid-cols-2 gap-16 items-center ${
                    idx % 2 === 1 ? "lg:grid-flow-dense" : ""
                  }`}
                >
                  {/* IMAGE */}
                  <div className={idx % 2 === 1 ? "lg:col-start-2" : ""}>
                    {section.images.length === 2 ? (
                      <div className="grid grid-rows-2 gap-6">
                        {section.images.map((img, i) => (
                          <div
                            key={i}
                            className={`overflow-hidden rounded-3xl shadow-2xl ${section.imageHeight}`}
                          >
                            <img
                              src={img}
                              alt={section.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className={`overflow-hidden rounded-3xl shadow-2xl ${section.imageHeight}`}
                      >
                        <img
                          src={section.images[0]}
                          alt={section.title}
                          className="w-full h-full object-cover"
                          style={{
                            objectPosition:
                              section.imagePosition || "50% 30%",
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className={idx % 2 === 1 ? "lg:col-start-1" : ""}>
                    <h2 className="text-4xl font-bold mb-12 text-chirag-darkPurple">
                      {section.title}
                    </h2>

                    <div className="space-y-8">
                      {section.packages.map((pkg) => (
                        <div
                          key={pkg.name}
                          className="relative bg-white/90 backdrop-blur
                          p-8 rounded-2xl shadow-lg border border-chirag-pink/20
                          hover:shadow-2xl transition"
                        >
                          {pkg.popular && (
                            <span className="absolute -top-4 right-6
                              bg-gradient-to-r from-chirag-pink to-chirag-peach
                              text-black text-xs font-bold px-4 py-1.5 rounded-full
                              flex items-center shadow-xl ring-1 ring-white/40">
                              <BadgeCheck size={14} className="mr-1.5" />
                              Most Popular
                            </span>
                          )}

                          <div className="flex justify-between items-start gap-4 mb-4">
                            <h3 className="text-xl font-bold text-chirag-darkPurple">
                              {pkg.name}
                            </h3>
                            <span className="text-2xl font-bold text-chirag-darkPurple">
                              {pkg.price}
                            </span>
                          </div>

                          <ul className="space-y-3 mb-6 text-gray-700">
                            {pkg.features.map((f, i) => (
                              <li key={i} className="flex items-start">
                                <Check size={16} className="mr-2 text-chirag-pink mt-1" />
                                {f}
                              </li>
                            ))}
                          </ul>

                          <Link
                            to={`/book?service=${encodeURIComponent(
                              section.title
                            )}&package=${encodeURIComponent(pkg.name)}`}
                            className="block w-full text-center py-3 rounded-xl
                            bg-gradient-to-r from-chirag-pink to-chirag-peach
                            text-black font-semibold hover:shadow-xl transition"
                          >
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
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
