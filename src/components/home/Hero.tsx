import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="min-h-screen pt-24 pb-16 relative flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1562887009-92ca32b341c6?auto=format&fit=crop&q=80&w=1974')] bg-cover bg-center opacity-10 z-0"
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white z-10"></div>

      <div className="container-custom relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div
            className="order-2 lg:order-1 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="mb-6 inline-block relative">
              <span className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-gradient-to-br from-chirag-pink/40 to-chirag-peach/40 blur-md animate-pulse"></span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight font-playfair relative">
                Where <span className="header-gradient">Art Meets Beauty</span>
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-lg">
              Transforming faces and creating magic through the artistry of
              makeup and henna. Elevate your beauty with Chirag Sharma's
              signature touch.
            </p>
            <div className="relative mb-8 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-chirag-pink/20 shadow-sm">
              <p className="text-chirag-darkPurple/80 italic font-playfair">
                "Beauty begins the moment you decide to be yourself."
              </p>
              <p className="text-right text-sm mt-2 text-chirag-darkPurple/60">
                — Chirag's philosophy
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Download Catalogue */}
              <a
                href="/Catalogue.pdf"
                download
                className="button-primary text-center group relative overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-chirag-peach to-chirag-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">Download Catalogue</span>
              </a>

              {/* Book Now */}
              <Link to="/book" className="button-secondary text-center">
                Book Now
              </Link>
            </div>
          </div>

          <div
            className="order-1 lg:order-2 flex justify-center animate-fade-in"
            style={{
              animationDelay: "0.4s",
              transform: `translateY(${scrollY * -0.1}px)`,
            }}
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-full  from-chirag-pink to-chirag-peach opacity-100 blur-lg animate-pulse"></div>
              <div className="w-full aspect-square rounded-full overflow-hidden shadow-xl animate-image-glow">
                {" "}
                <img
                  src="/photos/chiragicon1.JPG"
                  alt="Chirag Sharma - Makeup Artist"
                  className="w-full h-full object-cover object-top scale-[1.1] -translate-y-[5%] -translate-x-[4%]"
                />{" "}
              </div>
              <div
                className="absolute -bottom-4 -right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg border border-chirag-pink/30 animate-fade-in"
                style={{ animationDelay: "1s" }}
              >
                <span className="text-chirag-darkPurple font-playfair text-sm px-3 font-bold">
                  9+ Years Experience
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="w-full h-auto"
        >
          <path
            fill="#FFDEE2"
            fillOpacity="0.2"
            d="M0,224L48,224C96,224,192,224,288,208C384,192,480,160,576,165.3C672,171,768,213,864,229.3C960,245,1056,235,1152,208C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
