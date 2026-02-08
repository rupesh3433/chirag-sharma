import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Volume2,
  VolumeX,
  ExternalLink,
  X,
} from "lucide-react";
import { useHorizontalSlider } from "./useHorizontalSlider";
import { CardLayout, SliderContainer } from "./CardLayout";
import PlatformHeader from "./PlatformHeader";
import MediaCardFooter from "./MediaCardFooter";

type TikTokVideo = {
  video_id: string;
  description: string;
  create_time: number;
  duration: number;
  thumbnail_url?: string;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  view_count?: number;
  music_title?: string;
  music_author?: string;
  cloudinary?: {
    url: string;
    public_id: string;
  } | null;
};

type TikTokUser = {
  username: string;
  verified?: boolean;
  followers_count?: number;
  following_count?: number;
  total_likes_count?: number;
  profile_picture_url?: string;
  bio?: string;
  nickname?: string;
};

type TikTokVideosProps = {
  username?: string;
  limit?: number;
  heading?: string;
  cardsPerView?: number;
  gap?: number;
};

const PlayIcon = ({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
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

const TikTokVideos: React.FC<TikTokVideosProps> = ({
  username = "_chirag_101",
  limit = 12,
  heading = "Latest TikTok Videos",
  cardsPerView = 3,
  gap = 16
}) => {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [user, setUser] = useState<TikTokUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>("");
  const [cacheInfo, setCacheInfo] = useState<{
    age_days?: number;
    cached_at?: string;
  } | null>(null);

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const {
    containerRef,
    currentIndex,
    canGoPrev,
    canGoNext,
    handlePrev,
    handleNext,
  } = useHorizontalSlider(cardsPerView, gap, videos.length);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const formatNumber = useCallback((num?: number): string => {
    if (!num || num === 0) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }, []);

  const formatDate = useCallback((timestamp: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }, []);

  const createIframeUrl = useCallback((videoId: string): string => {
    return `https://www.tiktok.com/player/v1/${videoId}?autoplay=1&loop=1&muted=0`;
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `${API_URL}/public/tiktok/profile?username=${username}&count=${limit}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.user && data.videos && data.videos.length > 0) {
        setUser(data.user);

        const validVideos = data.videos
          .map((video: any) => ({
            video_id: video.video_id,
            description: video.description || "",
            create_time: video.create_time || 0,
            duration: video.duration || 0,
            thumbnail_url: video.cloudinary?.url || video.thumbnail_url,
            like_count: video.like_count,
            comment_count: video.comment_count,
            share_count: video.share_count,
            view_count: video.view_count,
            music_title: video.music_title,
            music_author: video.music_author,
            cloudinary: video.cloudinary || null,
          }))
          .filter((video: TikTokVideo) => video.video_id);

        setVideos(validVideos);
        setDataSource(data.source || "unknown");

        if (data.cache_age_days !== undefined && data.cached_at) {
          setCacheInfo({
            age_days: data.cache_age_days,
            cached_at: data.cached_at,
          });
        }
      } else {
        setError(data.error || "No videos available");
        setVideos([]);
        setUser(null);
      }
    } catch (err) {
      setError("Failed to connect to server");
      setVideos([]);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username, limit]);

  useEffect(() => {
    if (!activeVideoId) return;

    setIsLoading(true);

    const handleMessage = (e: MessageEvent) => {
      if (e.data && typeof e.data === "object" && e.data["x-tiktok-player"]) {
        if (e.data.type === "onPlayerReady") {
          setIsLoading(false);

          if (iframeRef.current) {
            iframeRef.current.contentWindow?.postMessage(
              { "x-tiktok-player": true, type: "unMute" },
              "*"
            );
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [activeVideoId]);

  const handleCardClick = useCallback(
    (videoId: string) => {
      if (activeVideoId === videoId) return;

      setIsMuted(false);
      setActiveVideoId(videoId);
      setIframeUrl(createIframeUrl(videoId));
    },
    [activeVideoId, createIframeUrl]
  );

  const handleCloseVideo = useCallback(() => {
    setActiveVideoId(null);
    setIframeUrl("");
    setIsLoading(false);
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (!iframeRef.current) return;

    const command = isMuted ? "unMute" : "mute";
    iframeRef.current.contentWindow?.postMessage(
      { "x-tiktok-player": true, type: command },
      "*"
    );
    setIsMuted(!isMuted);
  }, [isMuted]);

  const openTikTok = useCallback(
    (videoId: string) => {
      const url = `https://www.tiktok.com/@${username}/video/${videoId}`;
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [username]
  );

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading TikTok videos...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="text-center py-20">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Videos Available
            </h3>
            <p className="text-gray-600 mb-4">
              {error || "Unable to load TikTok videos at this time"}
            </p>
            <button
              onClick={fetchProfile}
              className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition font-semibold"
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
        {(dataSource === "mongodb_cache_locked" ||
          dataSource === "mongodb_cache_fallback") &&
          cacheInfo && (
            <div className="mb-6 border rounded-lg p-4 flex items-center gap-3 bg-amber-50 border-amber-200 text-amber-700">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm font-medium">
                {dataSource === "mongodb_cache_locked"
                  ? `🔄 Refresh in progress - showing cached data (${cacheInfo.age_days} days old)`
                  : `⚠️ Using cached data (${cacheInfo.age_days} days old) - API temporarily unavailable`}
              </p>
            </div>
          )}

        {user && (
          <PlatformHeader
            platform="tiktok"
            heading={heading}
            user={{
              username: user.username,
              isVerified: user.verified,
              followersCount: user.followers_count,
              followingCount: user.following_count,
              totalLikes: user.total_likes_count,
              bio: user.bio
            }}
            onPrev={handlePrev}
            onNext={handleNext}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            profileUrl={`https://www.tiktok.com/@${username}`}
          />
        )}

        <div className="relative">
          <SliderContainer gap={gap} containerRef={containerRef}>
            {videos.map((video) => {
              const thumbnailUrl =
                video.cloudinary?.url || video.thumbnail_url || "";
              const isActive = activeVideoId === video.video_id;

              return (
                <CardLayout
                  key={video.video_id}
                  width={cardWidth}
                  aspectRatio="9/16"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 w-full h-full">
                    <div className="relative w-full h-full bg-black overflow-hidden">
                      {isActive && iframeUrl && (
                        <div className="absolute inset-0 w-full h-full z-10">
                          <iframe
                            ref={iframeRef}
                            src={iframeUrl}
                            className="absolute inset-0 w-full h-full border-none"
                            allow="autoplay; fullscreen; encrypted-media"
                            referrerPolicy="strict-origin-when-cross-origin"
                            title={`TikTok video by @${username}`}
                          />

                          <div className="absolute top-4 right-4 flex flex-col gap-3 z-20 pointer-events-auto">
                            <button
                              onClick={handleCloseVideo}
                              className="p-2.5 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-all shadow-lg"
                              aria-label="Close video"
                            >
                              <X className="w-5 h-5" />
                            </button>

                            <button
                              onClick={toggleMute}
                              className="p-2.5 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-all shadow-lg relative"
                              aria-label={isMuted ? "Unmute" : "Mute"}
                            >
                              {isMuted ? (
                                <>
                                  <VolumeX className="w-5 h-5" />
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                                </>
                              ) : (
                                <Volume2 className="w-5 h-5" />
                              )}
                            </button>
                          </div>

                          {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                              <div className="text-center">
                                <div className="w-16 h-16 border-4 border-white/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-white text-sm font-medium">
                                  Loading video...
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {!isActive && (
                        <div
                          onClick={() => handleCardClick(video.video_id)}
                          className="relative w-full h-full cursor-pointer group"
                          onMouseEnter={() => setHoveredId(video.video_id)}
                          onMouseLeave={() => setHoveredId(null)}
                        >
                          <img
                            src={thumbnailUrl}
                            alt={video.description}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            loading="lazy"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className="transition-all duration-300 w-1/4 aspect-square"
                              style={{
                                transform:
                                  hoveredId === video.video_id
                                    ? "scale(1.2)"
                                    : "scale(1)",
                              }}
                            >
                              <div className="w-full h-full rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-2xl border-3 border-white/60">
                                <PlayIcon
                                  className="text-white drop-shadow-lg w-1/2 h-1/2"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between z-10">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-500 to-purple-500 p-0.5">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                  <span className="text-xs font-bold text-gray-700">
                                    TK
                                  </span>
                                </div>
                              </div>
                              <span className="text-white text-sm font-semibold drop-shadow-lg">
                                @{username}
                              </span>
                            </div>
                            <MoreHorizontal
                              className="text-white drop-shadow-lg"
                              size={20}
                            />
                          </div>

                          <MediaCardFooter
                            description={video.description || undefined}
                            dateText={formatDate(video.create_time)}
                            actions={[
                              {
                                id: "likes",
                                icon: <Heart />,
                                count: formatNumber(video.like_count),
                                onClick: (e) => {
                                  e.stopPropagation();
                                }
                              },
                              {
                                id: "comments",
                                icon: <MessageCircle />,
                                count: formatNumber(video.comment_count),
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

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openTikTok(video.video_id);
                            }}
                            className="absolute top-2 right-2 z-20 p-1.5 bg-black/50 backdrop-blur-sm rounded-md text-white hover:bg-black/70 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardLayout>
              );
            })}
          </SliderContainer>
        </div>

        <div className="md:hidden flex justify-center gap-1 mt-6">
          {Array.from({ length: Math.ceil(videos.length / cardsPerView) }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all ${
                idx === Math.floor(currentIndex / cardsPerView) ? 'w-8 bg-cyan-500' : 'w-1 bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="md:hidden text-center mt-8">
          <a
            href={`https://www.tiktok.com/@${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-semibold rounded-full hover:shadow-lg transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
            </svg>
            View Profile on TikTok
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

export default TikTokVideos;