import React, { useEffect, useState } from "react";
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
   PHOTO DATA
======================= */
const portfolioItems: PortfolioItem[] = [
  { id: 1, title: "Traditional Bridal Look", category: "bridal", image: "/photos/chirag1.PNG", description: "" },
  { id: 2, title: "Modern Bride Elegance", category: "bridal", image: "/photos/chirag2.PNG", description: "" },
  { id: 3, title: "Royal Wedding Glam", category: "bridal", image: "/photos/chirag3.PNG", description: "" },
  { id: 4, title: "Classic Red Bridal", category: "bridal", image: "/photos/chirag1.PNG", description: "" },
  { id: 5, title: "Soft Glam Bride", category: "bridal", image: "/photos/chirag2.PNG", description: "" },
  { id: 6, title: "North Indian Bridal Look", category: "bridal", image: "/photos/chirag3.PNG", description: "" },
  { id: 7, title: "South Indian Bridal Style", category: "bridal", image: "/photos/chirag1.PNG", description: "" },
  { id: 8, title: "Minimal Bridal Makeup", category: "bridal", image: "/photos/chirag2.PNG", description: "" },

  { id: 9, title: "Bold Editorial Glam", category: "editorial", image: "/photos/chirag3.PNG", description: "" },
  { id: 10, title: "High Fashion Editorial", category: "editorial", image: "/photos/chirag1.PNG", description: "" },
  { id: 11, title: "Magazine Cover Look", category: "editorial", image: "/photos/chirag2.PNG", description: "" },
  { id: 12, title: "Avant-Garde Editorial", category: "editorial", image: "/photos/chirag3.PNG", description: "" },
  { id: 13, title: "Runway Inspired Makeup", category: "editorial", image: "/photos/chirag1.PNG", description: "" },
  { id: 14, title: "Creative Editorial Shoot", category: "editorial", image: "/photos/chirag2.PNG", description: "" },
  { id: 15, title: "Studio Fashion Look", category: "editorial", image: "/photos/chirag3.PNG", description: "" },

  { id: 16, title: "Glam Party Look", category: "party", image: "/photos/chirag1.PNG", description: "" },
  { id: 17, title: "Cocktail Party Glam", category: "party", image: "/photos/chirag2.PNG", description: "" },
  { id: 18, title: "Evening Reception Look", category: "party", image: "/photos/chirag3.PNG", description: "" },
  { id: 19, title: "Festive Party Makeup", category: "party", image: "/photos/chirag1.PNG", description: "" },
  { id: 20, title: "Sangeet Night Glam", category: "party", image: "/photos/chirag2.PNG", description: "" },
  { id: 21, title: "Engagement Party Look", category: "party", image: "/photos/chirag3.PNG", description: "" },
  { id: 22, title: "Birthday Party Makeup", category: "party", image: "/photos/chirag1.PNG", description: "" },

  { id: 23, title: "Traditional Bridal Henna", category: "henna", image: "/photos/chirag2.PNG", description: "" },
  { id: 24, title: "Modern Henna Design", category: "henna", image: "/photos/chirag3.PNG", description: "" },
  { id: 25, title: "Arabic Henna Style", category: "henna", image: "/photos/chirag1.PNG", description: "" },
  { id: 26, title: "Minimal Henna Art", category: "henna", image: "/photos/chirag2.PNG", description: "" },
  { id: 27, title: "Full Hand Bridal Henna", category: "henna", image: "/photos/chirag3.PNG", description: "" },
  { id: 28, title: "Contemporary Henna Pattern", category: "henna", image: "/photos/chirag1.PNG", description: "" },
  { id: 29, title: "Festival Henna Design", category: "henna", image: "/photos/chirag2.PNG", description: "" },
  { id: 30, title: "Custom Henna Artwork", category: "henna", image: "/photos/chirag3.PNG", description: "" },
];

/* =======================
   COMPONENT
======================= */
const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] =
    useState<PortfolioItem | null>(null);

  /* 🔥 ROW-BASED PAGINATION STATE */
  const [visibleRows, setVisibleRows] = useState(2);

  /* Reset rows on category change */
  useEffect(() => {
    setVisibleRows(2);
  }, [activeCategory]);

  /* Filter photos */
  const filteredPhotos =
    activeCategory === "all"
      ? portfolioItems
      : portfolioItems.filter(
          (item) => item.category === activeCategory
        );

  /* Columns per breakpoint */
  const columns =
    window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;

  const itemsPerPage = visibleRows * columns;
  const visiblePhotos = filteredPhotos.slice(0, itemsPerPage);

  const hasMore = visiblePhotos.length < filteredPhotos.length;

  const showVideos =
    activeCategory === "all" || activeCategory === "video";

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-chirag-pink/10 to-white">
        <div className="container-custom text-center max-w-3xl mx-auto px-4">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            Our <span className="header-gradient">Portfolio</span>
          </h1>
          <p className="text-gray-600">
            Explore our makeup transformations and artistic creations.
          </p>
        </div>
      </section>

{/* ================= CONTENT ================= */}
<section className="py-10 bg-white">
  <div className="container-custom px-4">
    {/* ================= FILTERS ================= */}
    <div className="flex flex-wrap justify-center gap-4 mb-12">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setActiveCategory(cat.id)}
          className={`px-6 py-2 rounded-full transition ${
            activeCategory === cat.id
              ? "bg-chirag-pink text-chirag-darkPurple shadow"
              : "bg-gray-100 text-gray-600 hover:bg-chirag-pink/20"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>

    {/* ================= PHOTO GRID ================= */}
    {activeCategory !== "video" && (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {visiblePhotos.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl transition"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-72 object-cover"
              />
            </div>
          ))}
        </div>

        {/* ================= CONTROLS ================= */}
        <div className="text-center mb-20 space-x-4">
          {hasMore && (
            <button
              onClick={() => setVisibleRows((r) => r + 2)}
              className="px-8 py-3 rounded-full font-semibold
              bg-gradient-to-r from-chirag-pink to-chirag-peach
              text-black shadow hover:shadow-lg transition"
            >
              View More
            </button>
          )}

          {visibleRows > 2 && (
            <button
              onClick={() => setVisibleRows(2)}
              className="px-8 py-3 rounded-full font-semibold
              bg-gray-200 text-gray-800 shadow hover:shadow-lg transition"
            >
              View Less
            </button>
          )}
        </div>
      </>
    )}

    {/* ================= VIDEO SECTION ================= */}
    {(activeCategory === "all" || activeCategory === "video") && (
      <section className="mt-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold">
            Video <span className="header-gradient">Portfolio</span>
          </h2>
          <p className="text-gray-600 mt-3">
            Watch our latest makeup transformations & tutorials
          </p>
        </div>

        <div className="space-y-32 mb-16">
          {/* Instagram */}
          <InstagramVideos limit={6} />
          <YoutubeVideos limit={12} />
        </div>
      </section>
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
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Portfolio;
