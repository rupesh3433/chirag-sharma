import React from "react";
import { ChevronLeft, ChevronRight, Verified } from "lucide-react";

interface PlatformHeaderProps {
  platform: "instagram" | "tiktok" | "youtube";
  heading: string;
  user: {
    username: string;
    isVerified?: boolean;
    followersCount?: number;
    followingCount?: number;
    totalLikes?: number;
    subscribers?: string;
    bio?: string;
    title?: string;
  };
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  profileUrl: string;
}

const PlatformHeader: React.FC<PlatformHeaderProps> = ({
  platform,
  heading,
  user,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
  profileUrl,
}) => {
  const formatNumber = (num?: number): string => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const platformColors = {
    instagram: "from-purple-500 via-pink-500 to-orange-500",
    tiktok: "from-cyan-500 to-pink-500",
    youtube: "bg-red-600",
  };

  const platformIcons = {
    instagram: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    tiktok: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
      </svg>
    ),
    youtube: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
      </svg>
    ),
  };

  const isYouTube = platform === "youtube";

  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div className="flex-1">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{heading}</h2>

        {user && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-lg">
                {isYouTube ? user.username : `@${user.username}`}
              </span>
              {user.isVerified && (
                <Verified className="w-5 h-5 text-blue-500" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              {user.followersCount !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="font-bold text-gray-900">
                    {formatNumber(user.followersCount)}
                  </span>
                  <span className="text-gray-600">Followers</span>
                </div>
              )}
              {user.followingCount !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="font-bold text-gray-900">
                    {formatNumber(user.followingCount)}
                  </span>
                  <span className="text-gray-600">Following</span>
                </div>
              )}
              {user.totalLikes !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="font-bold text-gray-900">
                    {formatNumber(user.totalLikes)}
                  </span>
                  <span className="text-gray-600">Likes</span>
                </div>
              )}
              {user.subscribers && (
                <div className="flex items-center gap-1">
                  <span className="font-bold text-gray-900">
                    {user.subscribers}
                  </span>
                  <span className="text-gray-600">Subscribers</span>
                </div>
              )}
            </div>

            {user.bio && (
              <p className="text-sm text-gray-700 max-w-2xl">{user.bio}</p>
            )}
            {!isYouTube && user.title && (
              <p className="text-sm text-gray-700 font-medium">{user.title}</p>
            )}
          </div>
        )}
      </div>

      <div className="hidden md:flex items-center gap-3">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className="p-2 rounded-full bg-white shadow hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          aria-label="Previous"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="p-2 rounded-full bg-white shadow hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          aria-label="Next"
        >
          <ChevronRight size={20} />
        </button>

        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-4 py-2 ${
            platform === "youtube"
              ? platformColors.youtube
              : `bg-gradient-to-r ${platformColors[platform]}`
          } text-white rounded-full hover:shadow-lg transition font-semibold text-sm`}
        >
          {platformIcons[platform]}
          <span className="hidden lg:inline">View Profile</span>
        </a>
      </div>
    </div>
  );
};

export default PlatformHeader;
