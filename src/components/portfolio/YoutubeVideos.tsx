import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Youtube, Play } from "lucide-react";

/* =======================
   TYPES
======================= */
type Video = {
  id: string;
  title: string;
  thumbnail: string;
};

/* =======================
   CONFIG
======================= */
const CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

/* =======================
   COMPONENT
======================= */
const YoutubeVideos = ({ limit = 12 }: { limit?: number }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const touchStartX = useRef<number | null>(null);

  /* =======================
     RESPONSIVE
  ======================= */
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else setVisibleCount(3); // desktop
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* =======================
     FETCH RSS (WORKING)
  ======================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(CORS_PROXY + encodeURIComponent(RSS_URL));
        const xml = await res.text();
        const doc = new DOMParser().parseFromString(xml, "text/xml");

        const entries = Array.from(doc.getElementsByTagName("entry")).slice(
          0,
          limit
        );

        const parsed: Video[] = entries.map((entry) => {
          const id =
            entry.getElementsByTagName("yt:videoId")[0]?.textContent || "";
          const title =
            entry.getElementsByTagName("title")[0]?.textContent || "";

          return {
            id,
            title,
            thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
          };
        });

        setVideos(parsed);
      } catch (err) {
        console.error("YouTube RSS error:", err);
      }
    };

    load();
  }, [limit]);

  /* =======================
     CONTROLS
  ======================= */
  const next = () => {
    if (index < videos.length - visibleCount) setIndex(index + 1);
  };

  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };

  /* =======================
     TOUCH
  ======================= */
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) next();
    if (diff < -50) prev();
    touchStartX.current = null;
  };

  if (!videos.length) {
    return (
      <p className="text-center text-gray-500">
        No YouTube videos available.
      </p>
    );
  }

  return (
    <section>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-playfair font-bold text-chirag-darkPurple ">
          YouTube Reels
        </h2>

        <div className="flex items-center gap-3">
          <button
            onClick={prev}
            disabled={index === 0}
            className="p-2 bg-white rounded-full shadow disabled:opacity-30"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={next}
            disabled={index >= videos.length - visibleCount}
            className="p-2 bg-white rounded-full shadow disabled:opacity-30"
          >
            <ChevronRight />
          </button>

          <a
            href={`https://www.youtube.com/channel/${CHANNEL_ID}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-red-600 font-semibold"
          >
            <Youtube size={20} />
            View Youtube
          </a>
        </div>
      </div>

      {/* REELS SLIDER */}
      <div
        className="overflow-hidden "
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out "
          style={{
            transform: `translateX(-${(100 / visibleCount) * index}%)`,
          }}
        >
          {videos.map((v) => (
            <div
              key={v.id}
              style={{ flex: `0 0 ${100 / visibleCount}%` }}
              className="px-3 mb-5 "
            >
              {/* BIG REEL CARD */}
              <div className="relative h-[770px] rounded-2xl overflow-hidden shadow-2xl bg-black ">
                {activeVideoId === v.id ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${v.id}?autoplay=1&playsinline=1&modestbranding=1`}
                    className="absolute inset-0 w-full h-full object-cover"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={v.title}
                  />
                ) : (
                  <button
                    onClick={() => setActiveVideoId(v.id)}
                    className="absolute inset-0"
                  >
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Play */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl">
                        <Play className="text-red-600 ml-1" />
                      </div>
                    </div>

                    {/* Title */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/85 to-transparent">
                      <p className="text-white text-sm leading-snug line-clamp-2">
                        {v.title}
                      </p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default YoutubeVideos;
