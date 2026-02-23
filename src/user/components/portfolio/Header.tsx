// components/portfolio/Header.tsx

import React from "react";

const Header: React.FC = () => {
  return (
    <section className="pt-32 pb-16 bg-gradient-to-b from-chirag-pink/10 to-white relative overflow-hidden">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="absolute -top-10 -left-10 w-64 h-64 rounded-full bg-chirag-pink/20 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full bg-chirag-peach/20 blur-3xl pointer-events-none"
      />

      <div className="container-custom text-center max-w-3xl mx-auto px-4 relative z-10">
        <p className="text-sm uppercase tracking-[0.25em] text-chirag-pink font-semibold mb-3">
          Our Creative Work
        </p>
        <h1 className="text-4xl sm:text-5xl font-playfair font-bold mb-5 leading-tight">
          Our{" "}
          <span className="header-gradient">Portfolio</span>
        </h1>
        <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
          Discover our signature makeup transformations, artistic henna designs,
          and behind-the-scenes video stories — crafted with passion and
          precision.
        </p>
      </div>
    </section>
  );
};

export default Header;