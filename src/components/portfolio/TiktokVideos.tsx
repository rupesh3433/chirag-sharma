import React, { useEffect, useRef, useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Play,
  Eye,
  MoreHorizontal,
  Send,
} from "lucide-react";

/* =======================
   TYPES
======================= */
type TikTokVideo = {
  video_id: string;
  description: string;
  create_time: number;
  duration: number;
  thumbnail_url?: string;
  video_url?: string;
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
  profile_picture_url?: string;
};

type TikTokVideosProps = {
  username?: string;
  limit?: number;
  heading?: string;
};

type EmbedStatus = 'loading' | 'success' | 'failed';

/* =======================
   WINDOW TYPE EXTENSION
======================= */
declare global {
  interface Window {
    tiktokEmbed?: any;
  }
}

/* =======================
   PLAY ICON COMPONENT
======================= */
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

/* =======================
   MAIN COMPONENT
======================= */
const TikTokVideos = ({
  username = "_chirag_101",
  limit = 12,
  heading = "Latest TikTok Videos",
}: TikTokVideosProps) => {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [user, setUser] = useState<TikTokUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>("");
  const [cacheInfo, setCacheInfo] = useState<{ age_days?: number; cached_at?: string } | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [embedStatus, setEmbedStatus] = useState<Map<string, EmbedStatus>>(new Map());
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const embedCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  /* =======================
     FORMAT HELPERS
  ======================= */
  const formatNumber = (num?: number): string => {
    if (!num || num === 0) return "0";
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

  const formatDuration = (seconds: number): string => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  /* =======================
     FETCH PROFILE
  ======================= */
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/public/tiktok/profile?username=${username}&count=${limit}`);
      const data = await response.json();

      if (data.success && data.user && data.videos && data.videos.length > 0) {
        setUser(data.user);
        
        const validVideos = data.videos
          .map((video: any, index: number) => ({
            ...video,
            video_id: video.video_id || `video_${index}_${Date.now()}`
          }))
          .filter((video: any) => video.video_id);
        
        setVideos(validVideos);
        setDataSource(data.source || "unknown");
        
        if (data.cache_age_days !== undefined && data.cached_at) {
          setCacheInfo({
            age_days: data.cache_age_days,
            cached_at: data.cached_at
          });
        }
        
        if (data.source === "rapidapi_fresh") {
          setShowBanner(true);
          setTimeout(() => setShowBanner(false), 3000);
        }
      } else if (data.success === false) {
        setError(data.error || "Failed to fetch TikTok profile");
        setVideos([]);
        setUser(null);
      } else {
        setError("No videos available");
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

  /* =======================
     LOAD TIKTOK EMBEDS - USE FALLBACK ALWAYS
  ======================= */
  useEffect(() => {
    if (!videos.length) return;

    console.log("📹 Using custom video player (TikTok embed disabled due to network restrictions)");
    
    // Mark all as failed immediately to use custom player
    const failedStatus = new Map<string, EmbedStatus>();
    videos.forEach(video => {
      failedStatus.set(video.video_id, 'failed');
    });
    setEmbedStatus(failedStatus);

    /* 
    // TikTok embed code disabled due to connection issues
    // Keeping for reference if you want to enable it later
    
    const newStatus = new Map<string, EmbedStatus>();
    videos.forEach(video => {
      newStatus.set(video.video_id, 'loading');
    });
    setEmbedStatus(newStatus);

    if (!document.getElementById("tiktok-embed-script")) {
      const script = document.createElement("script");
      script.id = "tiktok-embed-script";
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      
      script.onload = () => {
        console.log("✅ TikTok embed.js loaded");
        setTimeout(() => checkEmbedStatus(), 2000);
      };
      
      script.onerror = () => {
        console.warn("❌ TikTok embed.js failed to load");
        const failedStatus = new Map<string, EmbedStatus>();
        videos.forEach(video => {
          failedStatus.set(video.video_id, 'failed');
        });
        setEmbedStatus(failedStatus);
      };
      
      document.body.appendChild(script);
    } else {
      setTimeout(() => checkEmbedStatus(), 1000);
    }

    function checkEmbedStatus() {
      if (embedCheckTimeoutRef.current) {
        clearTimeout(embedCheckTimeoutRef.current);
      }

      embedCheckTimeoutRef.current = setTimeout(() => {
        const statusUpdate = new Map(newStatus);
        videos.forEach(video => {
          const embedElement = document.querySelector(
            `blockquote[data-video-id="${video.video_id}"]`
          );
          const hasIframe = embedElement?.querySelector('iframe');
          
          if (hasIframe) {
            statusUpdate.set(video.video_id, 'success');
          } else {
            statusUpdate.set(video.video_id, 'failed');
          }
        });
        setEmbedStatus(statusUpdate);
      }, 4000);
    }
    */

    return () => {
      if (embedCheckTimeoutRef.current) {
        clearTimeout(embedCheckTimeoutRef.current);
      }
    };
  }, [videos]);

  /* =======================
     VIDEO PLAYBACK
  ======================= */
  const toggleVideoPlayback = (videoId: string) => {
    const videoElement = videoRefs.current.get(videoId);
    if (!videoElement) return;

    if (playingVideo === videoId) {
      // Pause current video
      videoElement.pause();
      setPlayingVideo(null);
    } else {
      // Pause any currently playing video
      if (playingVideo) {
        const currentVideo = videoRefs.current.get(playingVideo);
        if (currentVideo) {
          currentVideo.pause();
          currentVideo.currentTime = 0;
        }
      }
      
      // Play new video
      videoElement.play().then(() => {
        setPlayingVideo(videoId);
      }).catch(err => {
        console.error("Playback failed:", err);
      });
    }
  };

  /* =======================
     SCROLL HANDLERS
  ======================= */
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = container.offsetWidth / 3;
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setCurrentIndex(Math.min(videos.length - 3, currentIndex + 1));
    }
  };

  /* =======================
     OPEN TIKTOK
  ======================= */
  const openTikTok = (videoId: string) => {
    window.open(`https://www.tiktok.com/@${username}/video/${videoId}`, '_blank', 'noopener,noreferrer');
  };

  /* =======================
     RENDER: LOADING
  ======================= */
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

  /* =======================
     RENDER: ERROR / EMPTY
  ======================= */
  if (videos.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Videos Available</h3>
            <p className="text-gray-600 mb-4">{error || "Unable to load TikTok videos at this time"}</p>
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

  /* =======================
     RENDER: MAIN CONTENT
  ======================= */
  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[1280px] mx-auto px-4">
        {/* Fresh Data Banner */}
        {showBanner && dataSource === "rapidapi_fresh" && (
          <div className="mb-6 border rounded-lg p-4 flex items-center gap-3 bg-blue-50 border-blue-200 text-blue-700 animate-fade-in">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium">🆕 Fresh from TikTok API</p>
          </div>
        )}

        {/* Cache Info Banner */}
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

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{heading}</h2>
            {user && (
              <div className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-gray-600 mt-1">
                <span className="font-semibold text-gray-900">@{user.username}</span>
                {user.verified && (
                  <svg className="w-4 h-4 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {user.followers_count !== undefined && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{formatNumber(user.followers_count)} followers</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => scroll('left')}
              disabled={currentIndex === 0}
              className="p-2 rounded-full bg-white shadow hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={currentIndex >= videos.length - 3}
              className="p-2 rounded-full bg-white shadow hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
            
            <a
              href={`https://www.tiktok.com/@${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 text-white rounded-full hover:shadow-lg transition font-semibold text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
              <span className="hidden lg:inline">View Profile</span>
            </a>
          </div>
        </div>

        {/* Videos Container */}
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide"
          >
            {videos.map((video) => {
              const status = embedStatus.get(video.video_id) || 'loading';
              const isEmbedSuccess = status === 'success';
              const isEmbedFailed = status === 'failed';
              const isPlaying = playingVideo === video.video_id;
              const thumbnailUrl = video.cloudinary?.url || video.thumbnail_url || '';
              
              return (
                <div
                  key={video.video_id}
                  className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[calc(33.333%-11px)] snap-start"
                  onMouseEnter={() => setHoveredId(video.video_id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                    {/* Video Container */}
                    <div className="relative aspect-[9/16] bg-black overflow-hidden group">
                      
                      {/* TikTok Embed (if successful) */}
                      {isEmbedSuccess && (
                        <div className="w-full h-full">
                          <blockquote
                            className="tiktok-embed"
                            cite={`https://www.tiktok.com/@${username}/video/${video.video_id}`}
                            data-video-id={video.video_id}
                            style={{ 
                              maxWidth: '605px',
                              minWidth: '325px',
                              margin: '0 auto'
                            }}
                          >
                            <section>
                              <a 
                                target="_blank" 
                                rel="noopener noreferrer"
                                href={`https://www.tiktok.com/@${username}/video/${video.video_id}`}
                              >
                                @{username}
                              </a>
                            </section>
                          </blockquote>
                        </div>
                      )}
                      
                      {/* Custom Fallback Player (if embed failed) */}
                      {isEmbedFailed && (
                        <>
                          {/* Thumbnail Background */}
                          {thumbnailUrl && !isPlaying && (
                            <img
                              src={thumbnailUrl}
                              alt={video.description || 'TikTok Video'}
                              className="w-full h-full object-cover absolute inset-0"
                              loading="lazy"
                            />
                          )}
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                          
                          {/* Video Element */}
                          {video.video_url && (
                            <video
                              ref={(el) => {
                                if (el) {
                                  videoRefs.current.set(video.video_id, el);
                                } else {
                                  videoRefs.current.delete(video.video_id);
                                }
                              }}
                              src={video.video_url}
                              poster={thumbnailUrl}
                              className={`w-full h-full object-cover ${isPlaying ? 'block' : 'hidden'}`}
                              playsInline
                              loop
                              controls={isPlaying}
                              preload="metadata"
                              crossOrigin="anonymous"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleVideoPlayback(video.video_id);
                              }}
                              onError={(e) => {
                                console.warn(`❌ Video load error for ${video.video_id}:`, e);
                                // Pause and reset on error
                                const videoEl = e.currentTarget;
                                videoEl.pause();
                                setPlayingVideo(null);
                              }}
                            />
                          )}
                          
                          {/* Play Button */}
                          {!isPlaying && (
                            <div 
                              className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                              onClick={() => {
                                // Try to play video, if it fails open TikTok
                                const videoElement = videoRefs.current.get(video.video_id);
                                if (videoElement && video.video_url) {
                                  toggleVideoPlayback(video.video_id);
                                } else {
                                  // No video URL or element, open TikTok directly
                                  openTikTok(video.video_id);
                                }
                              }}
                            >
                              <div 
                                className="transition-all duration-300"
                                style={{
                                  transform: hoveredId === video.video_id ? 'scale(1.2)' : 'scale(1)',
                                  opacity: hoveredId === video.video_id ? 1 : 0.9
                                }}
                              >
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-2xl border-2 border-white/60">
                                  <PlayIcon size={28} className="text-white drop-shadow-lg ml-1" />
                                </div>
                              </div>
                              
                              {/* Click to view on TikTok hint */}
                              {!video.video_url && (
                                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                  <span className="text-xs text-white/80 bg-black/50 px-3 py-1 rounded-full drop-shadow-lg">
                                    Click to view on TikTok
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Top Bar */}
                          <div className="absolute top-0 left-0 right-0 p-3 md:p-4 flex items-center justify-between z-20">
                            <div className="flex items-center gap-2">
                              {user?.profile_picture_url ? (
                                <img 
                                  src={user.profile_picture_url}
                                  alt={user.username}
                                  className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white"
                                />
                              ) : (
                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 p-0.5">
                                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                    <span className="text-xs font-bold text-gray-700">
                                      {username.slice(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              )}
                              <span className="text-white text-xs md:text-sm font-semibold drop-shadow-lg">
                                @{username}
                              </span>
                            </div>
                            <button 
                              className="text-white hover:opacity-80 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                openTikTok(video.video_id);
                              }}
                            >
                              <MoreHorizontal size={18} className="md:w-5 md:h-5" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                            </button>
                          </div>
                          
                          {/* Bottom Info */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 z-20">
                            <div className="flex items-end justify-between gap-2">
                              {/* Caption */}
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs md:text-sm font-medium mb-1 line-clamp-2 drop-shadow-lg">
                                  {video.description || 'TikTok Video'}
                                </p>
                                <p className="text-white/80 text-xs drop-shadow">
                                  {formatDate(video.create_time)} • {formatDuration(video.duration)}
                                </p>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex flex-col gap-3 items-center">
                                {(video.like_count || 0) > 0 && (
                                  <div className="flex flex-col items-center">
                                    <Heart size={24} className="text-white drop-shadow-lg" />
                                    <span className="text-white text-xs font-semibold mt-0.5 drop-shadow">
                                      {formatNumber(video.like_count)}
                                    </span>
                                  </div>
                                )}
                                
                                {(video.comment_count || 0) > 0 && (
                                  <div className="flex flex-col items-center">
                                    <MessageCircle size={24} className="text-white drop-shadow-lg" />
                                    <span className="text-white text-xs font-semibold mt-0.5 drop-shadow">
                                      {formatNumber(video.comment_count)}
                                    </span>
                                  </div>
                                )}
                                
                                <button 
                                  className="text-white hover:scale-110 transition-transform"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openTikTok(video.video_id);
                                  }}
                                >
                                  <Share2 size={24} className="drop-shadow-lg" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {/* Loading State */}
                      {status === 'loading' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-gray-300 border-t-cyan-500 rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Scroll Indicator */}
        <div className="flex md:hidden justify-center gap-1 mt-6">
          {videos.slice(0, Math.min(videos.length, 5)).map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all ${
                idx === currentIndex ? 'w-8 bg-cyan-500' : 'w-1 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Mobile View Profile Link */}
        <div className="md:hidden text-center mt-8">
          <a
            href={`https://www.tiktok.com/@${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-semibold rounded-full hover:shadow-lg transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
            </svg>
            View Profile on TikTok
          </a>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .tiktok-embed {
          margin: 0 !important;
        }
      `}</style>
    </section>
  );
};

export default TikTokVideos;