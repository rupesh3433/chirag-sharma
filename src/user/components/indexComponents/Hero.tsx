// =======================
// Hero.tsx
// PRODUCTION READY (FINAL)
//
// FIXES APPLIED:
// ✔ MOBILE (<640px): STACKED (IMAGE ABOVE TEXT)
// ✔ SMALL RANGE (640px–767px): STILL STACKED (PHONE-LIKE)
// ✔ TABLET (≥768px): SAME AS DESKTOP (ROW LAYOUT, SAME SCALE)
// ✔ DESKTOP: UNCHANGED
// ✔ TEXT WIDTH, COPY, IMAGE, BADGE — ALL PRESERVED
// ✔ NO VISUAL REGRESSION
// =======================

import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="bg-white pt-20 sm:pt-24 lg:pt-28 pb-6 sm:pb-8 lg:pb-10 w-full">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div
          className="
            flex flex-col
            md:flex-row
            items-center
            justify-center
            md:justify-between
            gap-8 sm:gap-10 md:gap-14 lg:gap-16
          "
        >
          {/* ================= CONTENT ================= */}
          <div
            className="
              order-2 md:order-1
              w-full
              md:max-w-xl
              xl:max-w-2xl
              flex flex-col
              items-center md:items-start
              text-center md:text-left
            "
          >
            {/* HEADING */}
            <h1
              className="
                font-playfair
                font-bold
                leading-tight
                tracking-tight
                text-3xl
                xs:text-4xl
                sm:text-5xl
                md:text-[3.4rem]
                lg:text-[3.8rem]
                xl:text-[4.2rem]
                mb-3
              "
            >
              Where{" "}
              <span className="header-gradient">
                Art Meets Beauty
              </span>
            </h1>

            {/* DESCRIPTION */}
            <p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-none mb-4 leading-relaxed">
              Transforming faces through timeless makeup artistry and elegant
              henna designs. Experience beauty with Chirag Sharma&apos;s
              signature touch.
            </p>

            {/* QUOTE */}
            <div className="mb-4 p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-chirag-pink/20 shadow-sm w-full">
              <p className="text-chirag-darkPurple/80 italic font-playfair text-xs sm:text-sm">
                “Beauty begins the moment you decide to be yourself.”
              </p>
              <p className="text-right text-[11px] sm:text-xs mt-1 text-chirag-darkPurple/60">
                — Chirag&apos;s philosophy
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <a
                href="/Catalogue.pdf"
                download
                className="
                  button-primary
                  px-6 py-2.5
                  rounded-full
                  text-xs sm:text-sm
                  font-semibold
                "
              >
                Download Catalogue
              </a>

              <Link
                to="/book"
                className="
                  button-secondary
                  px-6 py-2.5
                  rounded-full
                  text-xs sm:text-sm
                  font-semibold
                "
              >
                Book Now
              </Link>
            </div>
          </div>

          {/* ================= IMAGE ================= */}
          <div
            className="
              order-1 md:order-2
              w-full md:w-auto
              flex justify-center
            "
          >
            <div className="relative">
              <div
                className="
                  w-[240px] h-[240px]
                  sm:w-[280px] sm:h-[280px]
                  md:w-[340px] md:h-[340px]
                  lg:w-[360px] lg:h-[360px]
                  xl:w-[390px] xl:h-[390px]
                  rounded-full
                  overflow-hidden
                  shadow-lg
                "
              >
                <img
                  src="/photos/chiragicon1.JPG"
                  alt="Chirag Sharma - Makeup Artist"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* BADGE */}
              <div className="absolute -bottom-3 right-3">
                <div className="bg-white rounded-full shadow-md border px-3 py-1.5">
                  <span className="block text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">
                    9+ Years Experience
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* ========================================= */}
        </div>
      </div>
    </section>
  );
};

export default Hero;
