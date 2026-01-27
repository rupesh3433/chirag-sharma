import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Youtube } from "lucide-react";

/* =======================
   TYPES
======================= */
type YoutubeVideosProps = {
  limit?: number;
};

type YoutubeVideo = {
  id: { videoId: string };
  snippet: {
    title: string;
  };
};

/* =======================
   CONFIG
======================= */
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

/* =======================
   COMPONENT
======================= */
const YoutubeVideos = ({ limit = 6 }: YoutubeVideosProps) => {
  const [videos, setVideos] = useState<YoutubeVideo[]>([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  /* =======================
     RESPONSIVE COUNT
  ======================= */
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  /* =======================
     FETCH VIDEOS
  ======================= */
  useEffect(() => {
    fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=${limit}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.items) {
          setVideos(data.items.filter((v: any) => v.id.videoId));
        }
      })
      .catch(console.error);
  }, [limit]);

  /* =======================
     CONTROLS
  ======================= */
  const next = () => {
    if (index < videos.length - visibleCount) {
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
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-playfair font-bold text-chirag-darkPurple">
          YouTube Videos
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
                disabled={index >= videos.length - visibleCount}
                className="p-2 bg-white rounded-full shadow disabled:opacity-30"
              >
                <ChevronRight />
              </button>
            </>
          )}

          <a
            href="https://www.youtube.com/@jinniechiragmua"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-red-600 font-semibold ml-2"
          >
            <Youtube size={20} />
            Visit YouTube
          </a>
        </div>
      </div>

      {/* ===== VIEWPORT ===== */}
      <div
        className="overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* ===== TRACK ===== */}
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${(100 / visibleCount) * index}%)`,
          }}
        >
          {videos.map((video) => (
            <div
              key={video.id.videoId}
              style={{ flex: `0 0 ${100 / visibleCount}%` }}
              className="px-3"
            >
              <div className="rounded-2xl overflow-hidden shadow-lg border bg-white">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id.videoId}`}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title={video.snippet.title}
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold line-clamp-2">
                    {video.snippet.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default YoutubeVideos;
