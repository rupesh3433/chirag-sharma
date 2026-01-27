import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import InstagramVideos from "../components/portfolio/InstagramVideos";
import YoutubeVideos from "../components/portfolio/YoutubeVideos";

/* =======================
   TYPES
======================= */
type PortfolioItem = {
  id: number;
  title: string;
  category: "bridal" | "editorial" | "party" | "henna";
  image: string;
  description: string;
};

/* =======================
   FILTER CATEGORIES
======================= */
const categories = [
  { id: "all", name: "All Work" },
  { id: "bridal", name: "Bridal Makeup" },
  { id: "editorial", name: "Editorial" },
  { id: "party", name: "Party Makeup" },
  { id: "henna", name: "Henna Art" },
  { id: "video", name: "Video Content" },
];

/* =======================
   PHOTO PORTFOLIO DATA
======================= */
const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    title: "Traditional Bridal Look",
    category: "bridal",
    image: "/photos/chirag1.PNG",
    description:
      "Classic bridal makeup with traditional elegance and modern sophistication.",
  },
  {
    id: 2,
    title: "Modern Bride",
    category: "bridal",
    image: "/photos/chirag2.PNG",
    description: "Contemporary bridal look with soft glam and natural radiance.",
  },
  {
    id: 3,
    title: "Royal Elegance",
    category: "bridal",
    image: "/photos/chirag3.PNG",
    description:
      "Regal bridal makeup celebrating timeless beauty and cultural heritage.",
  },
  {
    id: 4,
    title: "Bold Editorial",
    category: "editorial",
    image: "/photos/chirag1.PNG",
    description:
      "Striking colors and graphic liner for high-fashion magazine shoot.",
  },
  {
    id: 5,
    title: "Avant-Garde",
    category: "editorial",
    image: "/photos/chirag2.PNG",
    description:
      "Artistic and experimental makeup for creative conceptual photography.",
  },
  {
    id: 6,
    title: "Glam Party Look",
    category: "party",
    image: "/photos/chirag3.PNG",
    description:
      "Glamorous evening makeup with smoky eyes for special celebrations.",
  },
  {
    id: 7,
    title: "Festive Glamour",
    category: "party",
    image: "/photos/chirag1.PNG",
    description:
      "Vibrant and colorful party makeup perfect for festive occasions.",
  },
  {
    id: 8,
    title: "Bridal Henna",
    category: "henna",
    image: "/photos/chirag2.PNG",
    description:
      "Intricate traditional bridal henna with detailed patterns and motifs.",
  },
  {
    id: 9,
    title: "Modern Henna Design",
    category: "henna",
    image: "/photos/chirag3.PNG",
    description:
      "Contemporary henna patterns with modern geometric elements.",
  },
];

/* =======================
   COMPONENT
======================= */
const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] =
    useState<PortfolioItem | null>(null);

  const photoItems =
    activeCategory === "all"
      ? portfolioItems
      : portfolioItems.filter(
          (item) => item.category === activeCategory
        );

  const showVideos =
    activeCategory === "all" || activeCategory === "video";

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-chirag-pink/10 to-white">
        <div className="container-custom text-center max-w-3xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 font-playfair">
            Our{" "}
            <span className="bg-gradient-to-r from-chirag-darkPurple to-chirag-pink bg-clip-text text-transparent">
              Portfolio
            </span>
          </h1>
          <p className="text-gray-600">
            Explore our collection of makeup transformations and artistic
            creations.
          </p>
        </div>
      </section>

      {/* ================= FILTERS ================= */}
      <section className="py-8 bg-white">
        <div className="container-custom px-4">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2 rounded-full transition-all ${
                  activeCategory === cat.id
                    ? "bg-chirag-pink text-chirag-darkPurple shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-chirag-pink/20"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* ================= PHOTO GRID ================= */}
          {activeCategory !== "video" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {photoItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-80 object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-6">
                      <h3 className="text-white text-xl font-playfair">
                        {item.title}
                      </h3>
                      <p className="text-chirag-pink text-sm capitalize">
                        {item.category}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ================= VIDEO SECTION ================= */}
          {showVideos && (
            <div className="space-y-24">
              {/* Instagram FIRST */}
              <InstagramVideos limit={6} />

              {/* YouTube BELOW */}
              <YoutubeVideos limit={6} />
            </div>
          )}
        </div>
      </section>

      {/* ================= LIGHTBOX ================= */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedItem.image}
              alt={selectedItem.title}
              className="w-full max-h-[70vh] object-cover"
            />
            <div className="p-6">
              <h3 className="text-2xl font-playfair mb-2">
                {selectedItem.title}
              </h3>
              <p className="text-chirag-pink mb-3 capitalize">
                {selectedItem.category}
              </p>
              <p className="text-gray-600">
                {selectedItem.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Portfolio;
