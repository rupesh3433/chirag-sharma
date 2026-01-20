import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="pt-28 pb-20 bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* TEXT SECTION */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-playfair font-bold leading-tight mb-6">
              Where <span className="header-gradient">Art Meets Beauty</span>
            </h1>

            <p className="text-gray-600 text-lg max-w-xl mx-auto lg:mx-0 mb-6">
              Transforming faces through timeless makeup artistry and elegant
              henna designs. Experience beauty with Chirag Sharma’s signature
              touch.
            </p>

            {/* QUOTE BOX (RESTORED) */}
            <div className="relative mb-8 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-chirag-pink/20 shadow-sm max-w-xl mx-auto lg:mx-0">
              <p className="text-chirag-darkPurple/80 italic font-playfair">
                "Beauty begins the moment you decide to be yourself."
              </p>
              <p className="text-right text-sm mt-2 text-chirag-darkPurple/60">
                — Chirag's philosophy
              </p>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="/Catalogue.pdf"
                download
                className="button-primary text-center"
              >
                Download Catalogue
              </a>

              <Link to="/book" className="button-secondary text-center">
                Book Now
              </Link>
            </div>
          </div>

          {/* IMAGE SECTION */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative">

              {/* IMAGE WRAPPER — RESPONSIVE & LARGE ON LAPTOP */}
              <div
                className="
                  w-[220px]
                  sm:w-[260px]
                  md:w-[300px]
                  lg:w-[500px]
                  xl:w-[580px] 
                  2xl:w-[620px]
                  aspect-square
                  rounded-full
                  overflow-hidden
                  shadow-xl
                "
              >
                <img
                  src="/photos/chiragicon1.JPG"
                  alt="Chirag Sharma - Makeup Artist"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* EXPERIENCE BADGE */}
              <div className="absolute -bottom-4 -right-4 bg-white px-4 py-2 rounded-full shadow-md border">
                <span className="text-sm font-semibold text-gray-800">
                  9+ Years Experience
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
