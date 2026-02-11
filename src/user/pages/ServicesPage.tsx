import React, { useRef, useState, useEffect, memo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { Link } from "react-router-dom";

/* ===================== DATA ===================== */

type Package = {
  name: string;
  price: string;
  features: string[];
};

type ServiceSection = {
  title: string;
  images: string[];
  packages: Package[];
};

const servicesSections: ServiceSection[] = [
  {
    title: "Bridal Makeup Services",
    images: ["/photos/chirag1.jpeg", "/photos/chirag2.jpeg"],
    packages: [
      {
        name: "Chirag's Signature Bridal Makeup",
        price: "₹99,999",
        features: [
          "Signature bridal look by Chirag",
          "Premium luxury products",
          "Fully customized luxury finish",
          "Complimentary mini touch-up kit",
        ],
      },
      {
        name: "Luxury Bridal Makeup (HD / Brush)",
        price: "₹79,999",
        features: ["HD / Brush technique", "Flawless photo-ready finish"],
      },
    ],
  },
  {
    title: "Party Makeup Services",
    images: ["/photos/chirag4.jpeg"],
    packages: [
      {
        name: "Party Makeup – By Chirag Sharma",
        price: "₹19,999",
        features: ["Luxury products", "Event-specific styling"],
      },
      {
        name: "Party Makeup – By Senior Artist",
        price: "₹6,999",
        features: ["Professional party look"],
      },
    ],
  },
  {
    title: "Haldi & Mehendi Makeup Services",
    images: ["/photos/chirag5.jpeg"],
    packages: [
      {
        name: "Haldi / Mehendi – By Chirag Sharma",
        price: "₹44,999",
        features: ["Fresh festive look", "Sweat-resistant finish"],
      },
      {
        name: "Haldi / Mehendi – By Senior Artist",
        price: "₹19,999",
        features: ["Soft traditional makeup"],
      },
    ],
  },
  {
    title: "Groom Makeup Services",
    images: ["/photos/chirag3.jpeg"],
    packages: [
      {
        name: "Picture Perfect Photo-Ready Makeup",
        price: "₹14,999",
        features: ["Natural HD finish", "Hairstyling included"],
      },
      {
        name: "Wedding Reception Groom Makeup",
        price: "₹19,999",
        features: ["Camera-ready look", "Luxury products"],
      },
    ],
  },
];

const silkEase = "cubic-bezier(0.22,1,0.36,1)";

/* ===================== TOGGLE ===================== */

const ModeToggle = memo(
  ({
    mode,
    setMode,
  }: {
    mode: "details" | "images";
    setMode: (m: "details" | "images") => void;
  }) => (
    <div
      className="
        relative w-[168px] h-10 rounded-full p-1
        bg-gradient-to-b from-pink-100 to-pink-50
        shadow-inner flex items-center
      "
    >
      <div
        className="
          absolute top-1 left-1 h-8 w-[78px]
          rounded-full
          bg-gradient-to-r from-pink-500 to-pink-600
          shadow-[0_6px_18px_rgba(219,39,119,0.45)]
          transition-transform duration-500
        "
        style={{
          transform: mode === "images" ? "translateX(80px)" : "translateX(0)",
          transitionTimingFunction: silkEase,
        }}
      />
      <button
        onClick={() => setMode("details")}
        className={`relative z-10 flex-1 text-[13px] font-semibold transition-colors ${
          mode === "details" ? "text-white" : "text-pink-700"
        }`}
      >
        Details
      </button>
      <button
        onClick={() => setMode("images")}
        className={`relative z-10 flex-1 text-[13px] font-semibold transition-colors ${
          mode === "images" ? "text-white" : "text-pink-700"
        }`}
      >
        Images
      </button>
    </div>
  )
);

/* ===================== IMAGE MODAL ===================== */

const ImageModal = ({
  images,
  index,
  onClose,
}: {
  images: string[];
  index: number;
  onClose: () => void;
}) => {
  const [current, setCurrent] = useState(index);
  const startX = useRef<number | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const next = () => setCurrent((c) => (c + 1) % images.length);
  const prev = () =>
    setCurrent((c) => (c - 1 + images.length) % images.length);

  const onTouchStart = (e: React.TouchEvent) =>
    (startX.current = e.touches[0].clientX);

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!startX.current) return;
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    startX.current = null;
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/95
        flex items-center justify-center
        backdrop-blur-[2px]
      "
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <img
        src={images[current]}
        alt=""
        className="
          max-h-[90vh] max-w-[92vw]
          object-contain
          transition-all duration-700
          drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)]
        "
        style={{ transitionTimingFunction: silkEase }}
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="
              absolute left-6
              text-white
              opacity-80 hover:opacity-100
              transition
            "
          >
            <ChevronLeft size={36} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="
              absolute right-6
              text-white
              opacity-80 hover:opacity-100
              transition
            "
          >
            <ChevronRight size={36} />
          </button>
        </>
      )}

      <button
        onClick={onClose}
        className="
          absolute top-6 right-6
          text-white
          opacity-80 hover:opacity-100
          transition
        "
      >
        <X size={30} />
      </button>
    </div>
  );
};

/* ===================== IMAGE PANEL ===================== */

const ImagePanel = ({
  images,
  onOpen,
}: {
  images: string[];
  onOpen: (i: number) => void;
}) => {
  const [index, setIndex] = useState(0);

  return (
    <div
      className="
        relative w-full h-[270px]
        rounded-2xl overflow-hidden
        bg-gradient-to-b from-black to-neutral-900
        ring-1 ring-white/5
        flex items-center justify-center
      "
    >
      <div
        className="flex h-full w-full transition-transform duration-700"
        style={{
          transform: `translateX(-${index * 100}%)`,
          transitionTimingFunction: silkEase,
        }}
      >
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => onOpen(i)}
            className="w-full h-full flex-shrink-0 flex items-center justify-center"
          >
            <img
              src={img}
              alt=""
              className="
                max-h-full max-w-full
                object-contain
                transition-transform duration-500
                hover:scale-[1.02]
              "
            />
          </button>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={() =>
              setIndex((i) => (i - 1 + images.length) % images.length)
            }
            className="
              absolute left-3 top-1/2 -translate-y-1/2
              bg-white/90
              p-2.5 rounded-full
              shadow-md
              transition hover:bg-white
            "
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              bg-white/90
              p-2.5 rounded-full
              shadow-md
              transition hover:bg-white
            "
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}
    </div>
  );
};

/* ===================== SERVICE CARD ===================== */

const ServiceCard = ({
  section,
  index,
}: {
  section: ServiceSection;
  index: number;
}) => {
  const isEvenRow = Math.floor(index / 2) % 2 === 0;
  const isLeftCard = index % 2 === 0;

  const defaultMode: "details" | "images" =
    (isEvenRow && isLeftCard) || (!isEvenRow && !isLeftCard)
      ? "images"
      : "details";

  const [mode, setMode] = useState<"details" | "images">(defaultMode);
  const [modal, setModal] = useState<number | null>(null);

  return (
    <div
      className="
        bg-white rounded-[28px]
        min-h-[480px]
        flex flex-col
        border border-pink-100
        shadow-[0_14px_42px_rgba(219,39,119,0.2)]
        transition-shadow duration-500
        hover:shadow-[0_22px_60px_rgba(219,39,119,0.28)]
      "
    >
      <div className="px-8 py-5 flex items-center justify-between">
        <h2 className="font-playfair font-bold text-[1.45rem] text-chirag-darkPurple tracking-tight">
          {section.title}
        </h2>
        <ModeToggle mode={mode} setMode={setMode} />
      </div>

      <div className="px-8 pb-3 flex-1">
        {mode === "images" ? (
          <ImagePanel images={section.images} onOpen={setModal} />
        ) : (
          <div className="space-y-6">
            {section.packages.map((pkg) => (
              <div key={pkg.name} className="group">
                <div className="flex justify-between gap-4">
                  <span className="font-semibold text-[0.95rem] text-gray-900 group-hover:text-pink-700 transition-colors">
                    {pkg.name}
                  </span>
                  <span className="font-bold text-pink-600">
                    {pkg.price}
                  </span>
                </div>
                <ul className="mt-2.5 space-y-2">
                  {pkg.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex text-[0.8rem] text-gray-600 leading-relaxed"
                    >
                      <Check
                        size={14}
                        className="mr-2 mt-0.5 text-pink-500"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-8 py-5 mt-auto">
        <Link
          to={`/book?service=${encodeURIComponent(section.title)}`}
          className="
            block w-full text-center
            bg-gradient-to-r from-pink-500 to-pink-600
            text-white font-semibold text-[0.95rem]
            py-3.5 rounded-2xl
            shadow-[0_10px_30px_rgba(219,39,119,0.4)]
            transition-all duration-500
            hover:shadow-[0_18px_44px_rgba(219,39,119,0.55)]
          "
        >
          Book This Service
        </Link>
      </div>

      {modal !== null && (
        <ImageModal
          images={section.images}
          index={modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

/* ===================== PAGE ===================== */

const ServicesPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow max-w-[1400px] mx-auto px-8 py-24">
  {/* HEADER */}
  <div className="text-center mb-12">
    <h1 className="text-4xl md:text-[2.8rem] font-playfair font-bold leading-tight">
      Our <span className="header-gradient">Services</span>
    </h1>

    <p className="mt-4 text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
      Premium makeup services crafted with
      <span className="font-medium text-gray-800"> luxury</span>,
      <span className="font-medium text-gray-800"> elegance</span>, and
      <span className="font-medium text-gray-800"> artistry</span> designed
      to make every moment truly unforgettable.
    </p>
  </div>

  {/* SERVICES GRID */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
    {servicesSections.map((section, i) => (
      <ServiceCard key={section.title} section={section} index={i} />
    ))}
  </div>
</main>


      <Footer />
    </div>
  );
};

export default ServicesPage;
