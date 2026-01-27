import React, { useEffect, useRef, useState } from "react";
import { Play, Instagram, ChevronLeft, ChevronRight } from "lucide-react";

/* =======================
   TYPES
======================= */
type InstagramPost = {
  id: number;
  title: string;
  thumbnail: string;
  embedUrl: string;
  postUrl: string;
};

type InstagramVideosProps = {
  limit?: number;
  heading?: string;
};

/* =======================
   DATA
======================= */
const instagramPosts: InstagramPost[] = [
  {
    id: 1,
    title: "Bridal Transformation Reel",
    thumbnail: "/photos/chirag1.PNG",
    embedUrl: "https://www.instagram.com/reel/DNUzqQBJTwq/embed",
    postUrl: "https://www.instagram.com/reel/DNUzqQBJTwq/",
  },
  {
    id: 2,
    title: "Party Glam Look Reel",
    thumbnail: "/photos/chirag2.PNG",
    embedUrl: "https://www.instagram.com/reel/DSfN92BCRbH/embed",
    postUrl: "https://www.instagram.com/reel/DSfN92BCRbH/",
  },
  {
    id: 3,
    title: "Henna Art Reel",
    thumbnail: "/photos/chirag3.PNG",
    embedUrl: "https://www.instagram.com/reel/DRRCn-ADGPe/embed",
    postUrl: "https://www.instagram.com/reel/DRRCn-ADGPe/",
  },
  {
    id: 4,
    title: "Creative Reel",
    thumbnail: "/photos/chirag1.PNG",
    embedUrl: "https://www.instagram.com/reel/DRRCn-ADGPe/embed",
    postUrl: "https://www.instagram.com/reel/DRRCn-ADGPe/",
  },
  {
    id: 5,
    title: "Glam Reel",
    thumbnail: "/photos/chirag2.PNG",
    embedUrl: "https://www.instagram.com/reel/DRRCn-ADGPe/embed",
    postUrl: "https://www.instagram.com/reel/DRRCn-ADGPe/",
  },
  {
    id: 6,
    title: "Artistic Reel",
    thumbnail: "/photos/chirag3.PNG",
    embedUrl: "https://www.instagram.com/reel/DRRCn-ADGPe/embed",
    postUrl: "https://www.instagram.com/reel/DRRCn-ADGPe/",
  },
];

/* =======================
   COMPONENT
======================= */
const InstagramVideos = ({
  limit = 6,
  heading = "Instagram Reels",
}: InstagramVideosProps) => {
  const [visibleCount, setVisibleCount] = useState(3);
  const [index, setIndex] = useState(0);
  const [activePost, setActivePost] = useState<InstagramPost | null>(null);
  const touchStartX = useRef<number | null>(null);

  const posts = instagramPosts.slice(0, limit);

  /* =======================
     RESPONSIVE COUNT
  ======================= */
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* =======================
     CONTROLS
  ======================= */
  const next = () => {
    if (index < posts.length - visibleCount) {
      setIndex(index + 1);
    }
  };

  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };

  /* =======================
     TOUCH (MOBILE)
  ======================= */
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;

    if (diff > 50) next();
    if (diff < -50) prev();

    touchStartX.current = null;
  };

  return (
    <section>
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-playfair font-bold text-chirag-darkPurple">
          {heading}
        </h2>

        <div className="flex items-center gap-3">
          {visibleCount > 1 && (
            <>
              <button
                onClick={prev}
                disabled={index === 0}
                className="p-2 bg-white rounded-full shadow disabled:opacity-30"
              >
                <ChevronLeft />
              </button>

              <button
                onClick={next}
                disabled={index >= posts.length - visibleCount}
                className="p-2 bg-white rounded-full shadow disabled:opacity-30"
              >
                <ChevronRight />
              </button>
            </>
          )}

          <a
            href="https://www.instagram.com/_jinniechiragmua/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-chirag-darkPurple font-semibold ml-2"
          >
            <Instagram size={20} />
            Visit Instagram
          </a>
        </div>
      </div>

      {/* ===== Slider ===== */}
      <div
        className="overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${(100 / visibleCount) * index}%)`,
          }}
        >
          {posts.map((post) => (
            <div
              key={post.id}
              style={{ flex: `0 0 ${100 / visibleCount}%` }}
              className="px-3"
            >
              <div
                className="group cursor-pointer rounded-2xl overflow-hidden shadow-lg border bg-white"
                onClick={() => setActivePost(post)}
              >
                <div className="relative aspect-[9/16]">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <Play size={36} className="text-white fill-white ml-1" />
                    </div>
                  </div>
                </div>

                <div className="p-4 flex justify-between items-center">
                  <span className="font-medium line-clamp-1">
                    {post.title}
                  </span>
                  <a
                    href={post.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-chirag-pink font-semibold"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Modal ===== */}
      {activePost && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setActivePost(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-[9/16]">
              <iframe
                src={activePost.embedUrl}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={activePost.title}
              />
            </div>

            <div className="p-4 flex justify-between items-center">
              <span className="font-semibold">{activePost.title}</span>
              <button
                onClick={() => setActivePost(null)}
                className="text-sm font-semibold text-chirag-pink"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default InstagramVideos;
