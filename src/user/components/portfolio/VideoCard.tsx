import React, { useMemo } from "react";
import type { VideoItem } from "../../types/portfolio";

interface VideoCardProps {
  item: VideoItem;
}

function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return id.length === 11 ? id : null;
    }

    if (
      parsed.hostname === "www.youtube.com" ||
      parsed.hostname === "youtube.com"
    ) {
      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.split("/embed/")[1]?.split("?")[0];
        return id && id.length === 11 ? id : null;
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/shorts/")[1]?.split("?")[0];
        return id && id.length === 11 ? id : null;
      }

      const v = parsed.searchParams.get("v");
      return v && v.length === 11 ? v : null;
    }
  } catch {
    return null;
  }

  return null;
}

const VideoCard: React.FC<VideoCardProps> = ({ item }) => {
  const videoId = useMemo(() => extractYouTubeId(item.youtubeUrl), [item.youtubeUrl]);

  return (
    <article className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
      <div className="relative w-full" style={{ aspectRatio: "9 / 16" }}>
        {videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full border-0"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400 gap-3 p-4 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 opacity-40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
              />
            </svg>
            <p className="text-xs font-medium">Video unavailable</p>
            <p className="text-xs opacity-70 break-all">{item.youtubeUrl}</p>
          </div>
        )}
      </div>

      <div className="px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {item.title}
        </h3>
        <span className="inline-block mt-1 text-xs uppercase tracking-widest text-chirag-pink font-medium capitalize">
          {item.category}
        </span>
      </div>
    </article>
  );
};

export default VideoCard;