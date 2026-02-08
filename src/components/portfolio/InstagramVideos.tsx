import React, { useEffect, useState } from "react";
import { 
  Heart, 
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Eye
} from "lucide-react";
import { useHorizontalSlider } from "./useHorizontalSlider";
import { CardLayout, SliderContainer } from "./CardLayout";
import PlatformHeader from "./PlatformHeader";
import MediaCardFooter from "./MediaCardFooter";

type InstagramReel = {
  id: string;
  code: string;
  title: string;
  caption: string;
  thumbnail: string;
  cloudinary?: {
    url: string;
    public_id: string;
  } | null;
  postUrl: string;
  embedUrl: string;
  likeCount: number;
  commentCount: number;
  playCount: number;
  takenAt: number;
  mediaType?: number;
  productType?: string;
};

type InstagramApiResponse = {
  success: boolean;
  source:
    | "mongodb_cache"
    | "rapidapi_fresh"
    | "mongodb_cache_locked"
    | "mongodb_cache_fallback"
    | "none";
  cached_at?: string;
  cache_age_days?: number;
  cache_age_seconds?: number;
  user?: {
    username: string;
    full_name?: string;
    bio?: string;
    followers_count?: number;
    following_count?: number;
    posts_count?: number;
    is_verified?: boolean;
    profile_picture_url?: string;
  };
  reels: InstagramReel[];
  metrics?: {
    cloudinary_uploads: number;
    cloudinary_deletes: number;
    failed_deletes: number;
    queued_for_retry: number;
    duration_seconds: number;
  };
  message?: string;
  warning?: string;
  error?: string;
  timestamp: string;
};

type InstagramVideosProps = {
  username?: string;
  limit?: number;
  heading?: string;
  cardsPerView?: number;
  gap?: number;
};

const PlayIcon = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className={className}
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

const InstagramVideos = ({
  username = "_jinniechiragmua",
  limit = 12,
  heading = "Latest Instagram Reels",
  cardsPerView = 3,
  gap = 16
}: InstagramVideosProps) => {
  const [reels, setReels] = useState<InstagramReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<InstagramApiResponse["user"] | null>(null);
  const [dataSource, setDataSource] = useState<string>("");
  const [cacheInfo, setCacheInfo] = useState<{ age_days?: number; cached_at?: string } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const {
    containerRef,
    currentIndex,
    canGoPrev,
    canGoNext,
    handlePrev,
    handleNext,
  } = useHorizontalSlider(cardsPerView, gap, reels.length);

  const API_URL = import.meta.env.VITE_API_URL;

  const formatNumber = (num: number): string => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const fetchReels = async () => {
    setLoading(true);
    setError(null);

    if (!API_URL) {
      setError("API URL not configured");
      setLoading(false);
      return;
    }

    try {
      const url = `${API_URL}/public/instagram/profile?username=${username}&count=${limit}`;
      const response = await fetch(url);
      const data: InstagramApiResponse = await response.json();

      if (data.success && Array.isArray(data.reels)) {
        setReels(data.reels);
        setDataSource(data.source);
        setProfile(data.user ?? null);
        
        if (data.cache_age_days !== undefined && data.cached_at) {
          setCacheInfo({
            age_days: data.cache_age_days,
            cached_at: data.cached_at
          });
        }
      } else if (data.success === false) {
        setError(data.error || "Failed to fetch reels");
        setReels([]);
      }
    } catch (err) {
      setError("Failed to connect to server");
      setReels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, [username, limit]);

  const openInstagram = (postUrl: string) => {
    window.open(postUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Instagram reels...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (reels.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reels Available</h3>
            <p className="text-gray-600 mb-4">{error || "Unable to load Instagram reels at this time"}</p>
            <button 
              onClick={fetchReels}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  const cardWidth = `calc((100% - ${gap * (cardsPerView - 1)}px) / ${cardsPerView})`;

  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[1280px] mx-auto px-4">
        {(dataSource === "mongodb_cache_locked" || dataSource === "mongodb_cache_fallback") && cacheInfo && (
          <div className="mb-6 border rounded-lg p-4 flex items-center gap-3 bg-amber-50 border-amber-200 text-amber-700">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium">
              {dataSource === "mongodb_cache_locked" 
                ? `🔄 Refresh in progress - showing cached data (${cacheInfo.age_days} days old)`
                : `⚠️ Using cached data (${cacheInfo.age_days} days old) - API temporarily unavailable`
              }
            </p>
          </div>
        )}

        {profile && (
          <PlatformHeader
            platform="instagram"
            heading={heading}
            user={{
              username: profile.username,
              isVerified: profile.is_verified,
              followersCount: profile.followers_count,
              followingCount: profile.following_count,
              bio: profile.bio
            }}
            onPrev={handlePrev}
            onNext={handleNext}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            profileUrl={`https://www.instagram.com/${profile.username}/`}
          />
        )}

        <div className="relative">
          <SliderContainer gap={gap} containerRef={containerRef}>
            {reels.map((reel) => {
              const thumbnailUrl = reel.cloudinary?.url || reel.thumbnail;
              
              return (
                <CardLayout
                  key={reel.id}
                  width={cardWidth}
                  aspectRatio="9/16"
                >
                  <div 
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 w-full h-full"
                    onClick={() => openInstagram(reel.postUrl)}
                    onMouseEnter={() => setHoveredId(reel.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="relative w-full h-full bg-black overflow-hidden group">
                      <img
                        src={thumbnailUrl}
                        alt={reel.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                        onError={(e) => {
                          if (e.currentTarget.src !== reel.thumbnail) {
                            e.currentTarget.src = reel.thumbnail;
                          }
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div 
                          className="transition-all duration-300 w-1/4 aspect-square"
                          style={{
                            transform: hoveredId === reel.id ? 'scale(1.2)' : 'scale(1)',
                            opacity: hoveredId === reel.id ? 1 : 0.9
                          }}
                        >
                          <div className="w-full h-full rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-2xl"
                               style={{ border: '3px solid rgba(255, 255, 255, 0.6)' }}>
                            <PlayIcon className="text-white drop-shadow-lg w-1/2 h-1/2" />
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-0.5">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-700">JC</span>
                            </div>
                          </div>
                          <span className="text-white text-sm font-semibold drop-shadow-lg">
                            {username}
                          </span>
                        </div>
                        <MoreHorizontal className="text-white drop-shadow-lg" size={20} />
                      </div>

                      <MediaCardFooter
                        description={reel.caption || reel.title}
                        dateText={formatDate(reel.takenAt)}
                        actions={[
                          {
                            id: "likes",
                            icon: <Heart />,
                            count: formatNumber(reel.likeCount),
                            onClick: (e) => {
                              e.stopPropagation();
                            }
                          },
                          {
                            id: "comments",
                            icon: <MessageCircle />,
                            count: formatNumber(reel.commentCount),
                            onClick: (e) => {
                              e.stopPropagation();
                            }
                          },
                          {
                            id: "views",
                            icon: <Eye />,
                            count: formatNumber(reel.playCount),
                            onClick: (e) => {
                              e.stopPropagation();
                            }
                          },
                          {
                            id: "share",
                            icon: <Send />,
                            onClick: (e) => {
                              e.stopPropagation();
                            }
                          },
                          {
                            id: "save",
                            icon: <Bookmark />,
                            onClick: (e) => {
                              e.stopPropagation();
                            }
                          },
                        ]}
                      />
                    </div>
                  </div>
                </CardLayout>
              );
            })}
          </SliderContainer>
        </div>

        <div className="md:hidden flex justify-center gap-1 mt-6">
          {Array.from({ length: Math.ceil(reels.length / cardsPerView) }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all ${
                idx === Math.floor(currentIndex / cardsPerView) ? 'w-8 bg-pink-500' : 'w-1 bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="md:hidden text-center mt-8">
          <a
            href={`https://www.instagram.com/${username}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-semibold rounded-full hover:shadow-lg transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            View Profile on Instagram
          </a>
        </div>
      </div>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default InstagramVideos;