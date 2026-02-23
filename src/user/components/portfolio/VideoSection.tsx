import React from "react";
import type { Tab } from "../../types/portfolio";
import { useVideos } from "./useVideos";
import VideoCard from "./VideoCard";

interface VideoSectionProps {
  activeTab: Tab;
}

function SkeletonVideoCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-md bg-gray-200 animate-pulse"
      style={{ aspectRatio: "9 / 16" }}
    />
  );
}

const VideoSection: React.FC<VideoSectionProps> = ({ activeTab }) => {
  // Show videos on "all", "video", or any specific category tab
  const isVisible = true;

  // "video" tab → show all videos (no category filter)
  // "all" tab → show all videos (no category filter)
  // any slug tab → filter videos by that slug
  const categoryParam =
    activeTab === "all" || activeTab === "video" ? undefined : activeTab;

  const { videos, loadingState, error, refetch } = useVideos(categoryParam);

  return (
    <section className="mb-20" aria-label="Video Portfolio">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-playfair font-bold">
          Video{" "}
          <span className="header-gradient">Portfolio</span>
        </h2>
        <p className="text-gray-500 mt-3 text-sm sm:text-base">
          Watch our latest makeup transformations &amp; tutorials
        </p>
      </div>

      {loadingState === "loading" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonVideoCard key={i} />
          ))}
        </div>
      )}

      {loadingState === "error" && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
          <p className="text-gray-600 max-w-xs">
            {error ?? "Failed to load videos. Please try again."}
          </p>
          <button
            onClick={refetch}
            className="mt-2 px-6 py-2 rounded-full bg-chirag-pink text-chirag-darkPurple
              font-semibold text-sm hover:shadow-md transition"
          >
            Try Again
          </button>
        </div>
      )}

      {loadingState === "success" && videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-gray-300"
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
          <p className="text-gray-400 text-sm">
            No videos uploaded yet. Check back soon!
          </p>
        </div>
      )}

      {loadingState === "success" && videos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {videos.map((video) => (
            <VideoCard key={video.id} item={video} />
          ))}
        </div>
      )}
    </section>
  );
};

export default VideoSection;