import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="bg-white pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16 lg:pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:grid lg:grid-cols-2 items-center gap-8 sm:gap-10 lg:gap-12">
          <div className="order-1 lg:order-2 w-full flex justify-center">
            <div className="relative">
              <div className="w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] md:w-[360px] md:h-[360px] lg:w-[480px] lg:h-[480px] xl:w-[540px] xl:h-[540px] rounded-full overflow-hidden shadow-xl">
                <img
                  src="/photos/chiragicon1.JPG"
                  alt="Chirag Sharma - Makeup Artist"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="absolute -bottom-2 right-2 sm:-bottom-3 sm:right-3 lg:-bottom-5 lg:right-6">
                <div className="bg-white rounded-full shadow-lg border px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3">
                  <span className="block text-[11px] sm:text-xs lg:text-base font-semibold text-gray-800 whitespace-nowrap">
                    9+ Years Experience
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="order-2 lg:order-1 w-full text-center lg:text-left">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-playfair font-bold leading-tight mb-4 sm:mb-5 lg:mb-6">
              Where <span className="header-gradient">Art Meets Beauty</span>
            </h1>

            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-xl mx-auto lg:mx-0 mb-4 sm:mb-5 lg:mb-6">
              Transforming faces through timeless makeup artistry and elegant
              henna designs. Experience beauty with Chirag Sharma&apos;s
              signature touch.
            </p>

            <div className="relative mb-5 sm:mb-6 lg:mb-8 p-3 sm:p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-chirag-pink/20 shadow-sm max-w-xl mx-auto lg:mx-0">
              <p className="text-chirag-darkPurple/80 italic font-playfair text-sm sm:text-base">
                "Beauty begins the moment you decide to be yourself."
              </p>
              <p className="text-right text-xs sm:text-sm mt-1 sm:mt-2 text-chirag-darkPurple/60">
                — Chirag&apos;s philosophy
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <a
                href="/Catalogue.pdf"
                download
                className="button-primary px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base text-center"
              >
                Download Catalogue
              </a>
              <Link
                to="/book"
                className="button-secondary px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base text-center"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
