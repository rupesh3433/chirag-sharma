import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Check, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";

const servicesSections = [
  {
    title: "Bridal Makeup Services",
    images: ["/photos/chirag1.PNG", "/photos/chirag2.PNG"],
    packages: [
      {
        name: "Chirag's Signature Bridal Makeup",
        price: "₹99,999",
        popular: true,
        features: [
          "Signature bridal look by Chirag Sharma",
          "Premium international products",
          "Fully customized luxury finish",
          "Excluding travel & accommodation",
        ],
      },
      {
        name: "Luxury Bridal Makeup (HD / Brush)",
        price: "₹79,999",
        popular: false,
        features: [
          "HD / Brush technique",
          "Flawless, photo-ready finish",
          "Luxury bridal look",
          "Excluding travel & accommodation",
        ],
      },
      {
        name: "Reception / Engagement / Cocktail Makeup",
        price: "₹59,999",
        popular: false,
        features: [
          "Glam makeup for wedding events",
          "Customized to outfit & occasion",
          "Premium products",
          "Excluding travel & accommodation",
        ],
      },
    ],
  },
  {
    title: "Party Makeup Services",
    images: ["/photos/chirag4.PNG"],
    packages: [
      {
        name: "Party Makeup – By Chirag Sharma",
        price: "₹19,999",
        popular: true,
        features: [
          "Party makeup by Chirag Sharma",
          "Premium products",
          "Luxury glam finish",
          "Excluding travel & accommodation",
        ],
      },
      {
        name: "Party Makeup – By Senior Artist",
        price: "₹6,999",
        popular: false,
        features: [
          "Party makeup by senior artist",
          "Professional finish",
          "Excluding travel & accommodation",
        ],
      },
    ],
  },
  {
    title: "Henna (Mehendi) Services",
    images: ["/photos/chirag5.PNG"],
    packages: [
      {
        name: "Henna – By Chirag Sharma",
        price: "₹49,999",
        popular: true,
        features: [
          "Intricate bridal henna designs",
          "Premium natural henna",
          "Traditional & modern patterns",
          "Excluding travel & accommodation",
        ],
      },
      {
        name: "Henna – By Senior Artist",
        price: "₹19,999",
        popular: false,
        features: [
          "Professional henna application",
          "Traditional & modern designs",
          "Excluding travel & accommodation",
        ],
      },
    ],
  },
];

const Services = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* NAVBAR */}
      <Navbar />

      {/* MAIN CONTENT */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-32 pb-8 bg-gradient-to-br from-pink-50 via-white to-orange-50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-block mb-1 px-4 py-2 bg-gradient-to-r from-pink-100 to-orange-100 rounded-full">
              <span className="text-sm font-semibold text-pink-600">
                Premium Services
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-900 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              Our Services
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our range of luxury makeup and beauty services, crafted
              to make you look and feel extraordinary.
            </p>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 space-y-32">
            {servicesSections.map((section, idx) => (
              <div key={idx}>
                <div
                  className={`grid lg:grid-cols-2 gap-12 ${
                    idx % 2 === 1 ? "lg:grid-flow-dense" : ""
                  }`}
                >
                  {/* Image Column */}
                  <div className={`${idx % 2 === 1 ? "lg:col-start-2" : ""}`}>
                    {section.images.length === 2 ? (
                      <div className="grid grid-rows-2 gap-4 translate-y-5">
                        {section.images.map((img, imgIdx) => (
                          <div
                            key={imgIdx}
                            className="relative overflow-hidden rounded-3xl shadow-2xl aspect-[9/8]"
                          >
                            <img
                              src={img}
                              alt={`${section.title} ${imgIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="relative overflow-hidden rounded-3xl shadow-2xl aspect-[6/7] bg-white translate-y-6">
                        <img
                          src={section.images[0]}
                          alt={section.title}
                          className=" object-top rounded-2xl -translate-y-[10%]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Content Column */}
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
                          className="relative bg-white p-7 rounded-2xl shadow-lg border border-gray-200 hover:border-pink-300 transition-all"
                        >
                          {pkg.popular && (
                            <span className="absolute -top-3 right-6 bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center shadow-lg">
                              <BadgeCheck size={14} className="mr-1.5" />
                              Most Popular
                            </span>
                          )}

                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-5 gap-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {pkg.name}
                            </h3>
                            <span className="text-2xl font-bold text-pink-600 whitespace-nowrap">
                              {pkg.price}
                            </span>
                          </div>

                          <ul className="space-y-3 mb-6">
                            {pkg.features.map((f, i) => (
                              <li
                                key={i}
                                className="flex items-start text-gray-700"
                              >
                                <Check
                                  size={16}
                                  className="mr-2 text-pink-600 mt-1 flex-shrink-0"
                                />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>

                          <Link
                            to={`/book?service=${encodeURIComponent(
                              section.title
                            )}&package=${encodeURIComponent(pkg.name)}`}
                            className="block w-full text-center bg-gradient-to-r from-purple-900 to-pink-600 hover:from-purple-800 hover:to-pink-500 text-white font-semibold py-3 rounded-xl transition-all"
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

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Services;
