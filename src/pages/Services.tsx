import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Check, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";

const servicesSections = [
  /* ================= BRIDAL ================= */
  {
    title: "Bridal Makeup Services",
    images: ["/photos/chirag1.PNG", "/photos/chirag2.PNG"],
    imageHeight: "h-[520px] lg:h-[500px]",
    packages: [
      {
        name: "Chirag’s Signature Bridal Makeup",
        price: "₹99,999",
        popular: true,
        features: [
          "Signature bridal look by Chirag",
          "Everything high quality, premium products",
          "Fully customized luxury finish",
          "Complimentary mini touch-up kit for the bride",
          "Excluding travel & accommodation",
        ],
      },
      {
        name: "Luxury Bridal Makeup (HD / Brush)",
        price: "₹79,999",
        popular: false,
        features: [
          "HD brush technique",
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
          "Customized according to outfit & occasion",
          "Excluding travel & accommodation",
        ],
      },
    ],
  },

  /* ================= PARTY ================= */
  {
    title: "Party Makeup Services",
    images: ["/photos/chirag4.PNG"],
    imageHeight: "h-[420px] lg:h-[520px]",
    imagePosition: "50% 40%",
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

  /* ================= HALDI & MEHENDI ================= */
  {
    title: "Haldi & Mehendi Makeup Services",
    images: ["/photos/chirag5.PNG"],
    imageHeight: "h-[400px] lg:h-[520px]",
    imagePosition: "50% 15%",
    packages: [
      {
        name: "Haldi / Mehendi Makeup – By Chirag Sharma",
        price: "₹44,999",
        popular: true,
        features: ["Excluding travel & accommodation"],
      },
      {
        name: "Haldi / Mehendi Makeup – By Senior Artist",
        price: "₹19,999",
        popular: false,
        features: ["Excluding travel & accommodation"],
      },
    ],
  },

  /* ================= GROOM ================= */
  {
    title: "Groom Makeup Services",
    images: ["/photos/chirag3.PNG"],
    imageHeight: "h-[380px] lg:h-[650px]",
    imagePosition: "50% 20%",
    packages: [
      {
        name: "Picture Perfect Photo-Ready Makeup",
        price: "₹14,999",
        popular: true,
        features: [
          "Luxury high-end products only",
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
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* HERO */}
        <section className="pt-32 pb-8 bg-gradient-to-br from-pink-50 via-white to-orange-50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-900 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              Our Services
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our range of luxury makeup and beauty services.
            </p>
          </div>
        </section>

        {/* SERVICES */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 space-y-32">
            {servicesSections.map((section, idx) => (
              <div key={idx}>
                <div
                  className={`grid lg:grid-cols-2 gap-12 ${
                    idx % 2 === 1 ? "lg:grid-flow-dense" : ""
                  }`}
                >
                  {/* IMAGE COLUMN */}
                  <div className={`${idx % 2 === 1 ? "lg:col-start-2" : ""}`}>
                    {section.images.length === 2 ? (
                      <div className="grid grid-rows-2 gap-4">
                        {section.images.map((img, i) => (
                          <div
                            key={i}
                            className={`relative overflow-hidden rounded-3xl shadow-2xl ${section.imageHeight}`}
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
                        className={`relative overflow-hidden rounded-3xl shadow-2xl ${section.imageHeight}`}
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

                  {/* CONTENT COLUMN */}
                  <div
                    className={`${
                      idx % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""
                    }`}
                  >
                    <h2 className="text-4xl font-bold mb-10 text-purple-900">
                      {section.title}
                    </h2>

                    <div className="space-y-6">
                      {section.packages.map((pkg) => (
                        <div
                          key={pkg.name}
                          className="relative bg-white p-7 rounded-2xl shadow-lg border border-gray-200"
                        >
                          {pkg.popular && (
                            <span className="absolute -top-3 right-6 bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center">
                              <BadgeCheck size={14} className="mr-1.5" />
                              Most Popular
                            </span>
                          )}

                          <div className="flex justify-between mb-4">
                            <h3 className="text-xl font-bold">
                              {pkg.name}
                            </h3>
                            <span className="text-2xl font-bold text-pink-600">
                              {pkg.price}
                            </span>
                          </div>

                          <ul className="space-y-2 mb-6">
                            {pkg.features.map((f, i) => (
                              <li key={i} className="flex items-start">
                                <Check
                                  size={16}
                                  className="mr-2 text-pink-600 mt-1"
                                />
                                {f}
                              </li>
                            ))}
                          </ul>

                          <Link
                            to={`/book?service=${encodeURIComponent(
                              section.title
                            )}&package=${encodeURIComponent(pkg.name)}`}
                            className="block w-full text-center bg-gradient-to-r from-purple-900 to-pink-600 text-white py-3 rounded-xl"
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
