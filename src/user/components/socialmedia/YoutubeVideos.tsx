import React, { useEffect, useState } from "react";
import { Eye, ThumbsUp, MessageCircle, Share2, Maximize, ExternalLink, MoreHorizontal } from "lucide-react";
import { useHorizontalSlider } from "./useHorizontalSlider";
import { CardLayout, SliderContainer } from "./CardLayout";
import PlatformHeader from "./PlatformHeader";
import MediaCardFooter from "./MediaCardFooter";
import MediaCardHeader from "./MediaCardHeader";

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  viewCount?: string;
  likeCount?: string;
  publishedAt?: string;
};

type ChannelInfo = {
  title: string;
  subscriberCount?: string;
  thumbnail?: string;
};

const CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

const PlayTriangleIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

const YoutubeVideos = ({
  limit = 12,
  heading = "Latest YouTube Videos",
  cardsPerView = 3,
  gap = 16,
}: {
  limit?: number;
  heading?: string;
  cardsPerView?: number;
  gap?: number;
}) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [channel, setChannel] = useState<ChannelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const {
    containerRef,
    currentIndex,
    canGoPrev,
    canGoNext,
    handlePrev,
    handleNext,
  } = useHorizontalSlider(cardsPerView, gap, videos.length);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(CORS_PROXY + encodeURIComponent(RSS_URL));
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        const entries = Array.from(xmlDoc.getElementsByTagName("entry")).slice(
          0,
          limit
        );

        const parsedVideos: Video[] = entries.map((entry) => {
          const videoId =
            entry.getElementsByTagName("yt:videoId")[0]?.textContent || "";
          const title =
            entry.getElementsByTagName("title")[0]?.textContent ||
            "Untitled Video";
          const published =
            entry.getElementsByTagName("published")[0]?.textContent || "";

          const mediaGroup = entry.getElementsByTagName("media:group")[0];
          const viewCount =
            mediaGroup
              ?.getElementsByTagName("media:community")?.[0]
              ?.getElementsByTagName("media:statistics")?.[0]
              ?.getAttribute("views") || undefined;

          return {
            id: videoId,
            title,
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            viewCount,
            publishedAt: published,
          };
        });

        setVideos(parsedVideos);
      } catch (err) {
        setError("Failed to load YouTube videos");
      } finally {
        setLoading(false);
      }
    };

    if (CHANNEL_ID) {
      fetchVideos();
    } else {
      setError("YouTube Channel ID not configured");
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!API_KEY || !CHANNEL_ID) return;

    const fetchChannelInfo = async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/channels` +
            `?part=snippet,statistics` +
            `&id=${CHANNEL_ID}` +
            `&key=${API_KEY}`
        );
        const data = await res.json();
        if (!data.items || !data.items[0]) return;

        const item = data.items[0];
        setChannel({
          title: item.snippet.title,
          subscriberCount: item.statistics?.subscriberCount,
          thumbnail: item.snippet.thumbnails?.high?.url,
        });
      } catch (err) {
        console.error("Failed to fetch channel info:", err);
      }
    };

    fetchChannelInfo();
  }, []);

  const formatNumber = (num: string | number | undefined): string => {
    if (!num) return "0";
    const n = typeof num === "string" ? parseInt(num) : num;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
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
  };

  const formatSubscribers = (count?: string) => {
    if (!count) return null;
    const n = parseInt(count, 10);
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  const playVideo = (videoId: string) => {
    setActiveVideoId(videoId);
  };

  const closeVideo = () => {
    setActiveVideoId(null);
  };

  const openYouTube = (videoId: string) => {
    window.open(
      `https://www.youtube.com/watch?v=${videoId}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading YouTube videos...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || videos.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="text-center py-20">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-red-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Videos Available
            </h3>
            <p className="text-gray-600 mb-4">
              {error || "Unable to load YouTube videos at this time"}
            </p>
            {CHANNEL_ID && (
              <a
                href={`https://www.youtube.com/channel/${CHANNEL_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
                Visit YouTube Channel
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  const cardWidth = `calc((100% - ${
    gap * (cardsPerView - 1)
  }px) / ${cardsPerView})`;

  return (
    <section className="pt-5 pb-0 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[1280px] mx-auto px-2">
        <PlatformHeader
          platform="youtube"
          heading={heading}
          user={{
            username: channel?.title || "YouTube",
            title: channel?.title,
            subscribers: channel?.subscriberCount
              ? formatSubscribers(channel.subscriberCount)
              : undefined,
          }}
          onPrev={handlePrev}
          onNext={handleNext}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          profileUrl={`https://www.youtube.com/channel/${CHANNEL_ID}`}
        />

        <div className="relative">
          <SliderContainer gap={gap} containerRef={containerRef}>
            {videos.map((video) => (
              <CardLayout
                key={video.id}
                width={cardWidth}
                aspectRatio="9/16"
                paddingY="0em"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 w-full h-full">
                  <div className="relative w-full h-full bg-black overflow-hidden group">
                    {activeVideoId === video.id ? (
                      <div className="absolute inset-0">
                        <iframe
                          src={`https://www.youtube.com/embed/${
                            video.id
                          }?autoplay=1&playsinline=1&modestbranding=1&rel=0${
                            isMuted ? "&mute=1" : ""
                          }`}
                          className="absolute inset-0 w-full h-full border-none"
                          allow="autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                          title={video.title}
                        />

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeVideo();
                          }}
                          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => playVideo(video.id)}
                        className="absolute inset-0 w-full h-full"
                        onMouseEnter={() => setHoveredId(video.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes("hqdefault")) {
                              target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                            }
                          }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div
                            className="transition-all duration-300 w-1/4 aspect-square"
                            style={{
                              transform:
                                hoveredId === video.id
                                  ? "scale(1.15)"
                                  : "scale(1)",
                              opacity: hoveredId === video.id ? 1 : 0.95,
                            }}
                          >
                            <div className="w-full h-full rounded-full bg-red-600/90 backdrop-blur-sm flex items-center justify-center shadow-2xl border-3 border-white/30">
                              <PlayTriangleIcon className="text-white drop-shadow-lg w-1/2 h-1/2 ml-0.5" />
                            </div>
                          </div>
                        </div>

                        <MediaCardHeader
                          logo={
                            <div className="w-full h-full rounded-full overflow-hidden bg-black/40">
                              {channel?.thumbnail ? (
                                <img
                                  src={channel.thumbnail}
                                  alt={channel.title}
                                  className="block w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full bg-red-600 flex items-center justify-center">
                                  <svg
                                    className="w-[6cqi] h-[6cqi] text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          }
                          title={channel?.title || "YouTube"}
                          actions={[
                            {
                              id: "open-original",
                              icon: <ExternalLink />,
                              onClick: (e) => {
                                e.stopPropagation();
                                window.open(
                                  `https://www.youtube.com/watch?v=${video.id}`,
                                  "_blank",
                                  "noopener,noreferrer"
                                );
                              },
                            },
                          ]}
                          paddingCqi={5}
                          gapCqi={2}
                        />
                      </button>
                    )}

                    <MediaCardFooter
                      description={video.title}
                      dateText={formatDate(video.publishedAt)}
                      actions={[
                        {
                          id: "likes",
                          icon: <ThumbsUp />,
                          onClick: (e) => {
                            e.stopPropagation();
                            openYouTube(video.id);
                          },
                        },
                        {
                          id: "comments",
                          icon: <MessageCircle />,
                          onClick: (e) => {
                            e.stopPropagation();
                            openYouTube(video.id);
                          },
                        },
                        {
                          id: "views",
                          icon: <Eye />,
                          count: formatNumber(video.viewCount),
                          onClick: (e) => {
                            e.stopPropagation();
                            openYouTube(video.id);
                          },
                        },
                        {
                          id: "share",
                          icon: <Share2 />,
                          onClick: (e) => {
                            e.stopPropagation();
                            if (navigator.share) {
                              navigator.share({
                                title: video.title,
                                url: `https://www.youtube.com/watch?v=${video.id}`,
                              });
                            }
                          },
                        },
                      ]}
                    />
                  </div>
                </div>
              </CardLayout>
            ))}
          </SliderContainer>
        </div>

        <div className="md:hidden flex justify-center gap-1 mt-6">
          {Array.from({ length: Math.ceil(videos.length / cardsPerView) }).map(
            (_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx === Math.floor(currentIndex / cardsPerView)
                    ? "w-8 bg-red-600"
                    : "w-1 bg-gray-300"
                }`}
              />
            )
          )}
        </div>

        {CHANNEL_ID && (
          <div className="md:hidden text-center my-6">
            <a
              href={`https://www.youtube.com/channel/${CHANNEL_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-all shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
              View Channel on YouTube
            </a>
          </div>
        )}
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

export default YoutubeVideos;
