import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  ExternalLink,
  Maximize,
  X,
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

/* =======================
   PLAY ICON (TikTok Style)
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
   TIKTOK EMBED PLAYER (WITH FULLSCREEN)
======================= */
interface TikTokEmbedPlayerProps {
  videoId: string;
  username: string;
  thumbnailUrl: string;
  description: string;
  likeCount?: number;
  commentCount?: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const TikTokEmbedPlayer: React.FC<TikTokEmbedPlayerProps> = ({ 
  videoId, 
  username, 
  thumbnailUrl,
  description,
  likeCount,
  commentCount,
  isFullscreen,
  onToggleFullscreen
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const iframeUrl = `https://www.tiktok.com/player/v1/${videoId}?autoplay=1&loop=1&muted=0`;

  useEffect(() => {
    setIsLoading(true);
    
    const handleMessage = (e: MessageEvent) => {
      if (e.data && typeof e.data === 'object' && e.data['x-tiktok-player']) {
        if (e.data.type === 'onPlayerReady') {
          setIsLoading(false);
          if (iframeRef.current) {
            iframeRef.current.contentWindow?.postMessage(
              { 'x-tiktok-player': true, type: 'unMute' },
              '*'
            );
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [videoId]);

  const toggleMute = () => {
    if (!iframeRef.current) return;
    const command = isMuted ? 'unMute' : 'mute';
    iframeRef.current.contentWindow?.postMessage(
      { 'x-tiktok-player': true, type: command },
      '*'
    );
    setIsMuted(!isMuted);
  };

  const formatNumber = (num?: number): string => {
    if (!num || num === 0) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-white text-sm font-medium">Loading video...</p>
          </div>
        </div>
      )}

      {/* TikTok iframe */}
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        className="absolute inset-0 w-full h-full border-none"
        allow="autoplay; fullscreen; encrypted-media"
        referrerPolicy="strict-origin-when-cross-origin"
        title={`TikTok video by @${username}`}
      />

      {/* Overlay with Instagram-style UI */}
      {!isLoading && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50"></div>

          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-500 to-purple-500 p-0.5">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-700">TK</span>
                </div>
              </div>
              <span className="text-white text-sm font-semibold drop-shadow-lg">
                @{username}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleFullscreen}
                className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all"
              >
                {isFullscreen ? <X className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
              <MoreHorizontal className="text-white drop-shadow-lg" size={20} />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
            <div className="flex items-end justify-between">
              {/* Left - Caption */}
              <div className="flex-1 mr-4">
                <p className="text-white text-sm font-medium mb-2 line-clamp-2 drop-shadow-lg">
                  {description || 'TikTok Video'}
                </p>
              </div>

              {/* Right - Action Buttons */}
              <div className="flex flex-col gap-4 items-center">
                {/* Mute Toggle */}
                <button
                  onClick={toggleMute}
                  className="flex flex-col items-center gap-1"
                >
                  {isMuted ? (
                    <VolumeX className="w-7 h-7 text-white drop-shadow-lg" />
                  ) : (
                    <Volume2 className="w-7 h-7 text-white drop-shadow-lg" />
                  )}
                </button>

                {/* Like */}
                {likeCount && likeCount > 0 && (
                  <div className="flex flex-col items-center gap-1">
                    <Heart className="w-7 h-7 text-white drop-shadow-lg" />
                    <span className="text-white text-xs font-semibold drop-shadow-lg">
                      {formatNumber(likeCount)}
                    </span>
                  </div>
                )}

                {/* Comment */}
                {commentCount && commentCount > 0 && (
                  <div className="flex flex-col items-center gap-1">
                    <MessageCircle className="w-7 h-7 text-white drop-shadow-lg" />
                    <span className="text-white text-xs font-semibold drop-shadow-lg">
                      {formatNumber(commentCount)}
                    </span>
                  </div>
                )}

                {/* Share */}
                <Send className="w-7 h-7 text-white drop-shadow-lg" />

                {/* Bookmark */}
                <Bookmark className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =======================
   MAIN COMPONENT
======================= */
const TikTokVideos: React.FC<TikTokVideosProps> = ({
  username = "_chirag_101",
  limit = 12,
  heading = "Latest TikTok Videos",
}) => {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [user, setUser] = useState<TikTokUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>("");
  const [cacheInfo, setCacheInfo] = useState<{ age_days?: number; cached_at?: string } | null>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  /* =======================
     FORMAT HELPERS
  ======================= */
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
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  }, []);

  /* =======================
     FETCH PROFILE
  ======================= */
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
            description: video.description || '',
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
            cached_at: data.cached_at
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

  /* =======================
     NAVIGATION
  ======================= */
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < videos.length - 1;

  const goToPrev = useCallback(() => {
    if (canGoPrev) {
      setCurrentIndex(prev => prev - 1);
      if (scrollContainerRef.current) {
        const cardWidth = scrollContainerRef.current.offsetWidth;
        scrollContainerRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      }
    }
  }, [canGoPrev]);

  const goToNext = useCallback(() => {
    if (canGoNext) {
      setCurrentIndex(prev => prev + 1);
      if (scrollContainerRef.current) {
        const cardWidth = scrollContainerRef.current.offsetWidth;
        scrollContainerRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }
  }, [canGoNext]);

  /* =======================
     TOUCH/SWIPE HANDLERS
  ======================= */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(distance) > threshold) {
      if (distance > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  /* =======================
     KEYBOARD NAVIGATION
  ======================= */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext, isFullscreen]);

  /* =======================
     VIDEO CONTROLS
  ======================= */
  const handleCardClick = useCallback((videoId: string) => {
    setActiveVideoId(videoId);
  }, []);

  const openTikTok = useCallback((videoId: string) => {
    const url = `https://www.tiktok.com/@${username}/video/${videoId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [username]);

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
  const currentVideo = videos[currentIndex];

  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[1280px] mx-auto px-4">
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
            <h2 className="text-3xl font-bold text-gray-900">{heading}</h2>
            {user && (
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <span className="font-semibold text-gray-900">@{user.username}</span>
                {user.verified && (
                  <svg className="w-4 h-4 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {user.followers_count !== undefined && (
                  <>
                    <span>•</span>
                    <span>{formatNumber(user.followers_count)} followers</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* View Profile Link */}
          <a
            href={`https://www.tiktok.com/@${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 text-white rounded-full hover:shadow-lg transition font-semibold text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
            </svg>
            <span>View Profile</span>
          </a>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500 font-medium">
            {currentIndex + 1} / {videos.length}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={goToPrev}
              disabled={!canGoPrev}
              className="p-2 rounded-full bg-white shadow hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNext}
              disabled={!canGoNext}
              className="p-2 rounded-full bg-white shadow hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div 
          ref={scrollContainerRef}
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-full max-w-md mx-auto">
            <div
              className="bg-white rounded-xl overflow-hidden shadow-xl border border-gray-100"
              onMouseEnter={() => setHoveredId(currentVideo.video_id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Video Container */}
              <div className="relative aspect-[9/16] bg-black overflow-hidden">
                {activeVideoId === currentVideo.video_id ? (
                  <TikTokEmbedPlayer
                    videoId={currentVideo.video_id}
                    username={username}
                    thumbnailUrl={currentVideo.cloudinary?.url || currentVideo.thumbnail_url || ''}
                    description={currentVideo.description}
                    likeCount={currentVideo.like_count}
                    commentCount={currentVideo.comment_count}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                  />
                ) : (
                  <div
                    onClick={() => handleCardClick(currentVideo.video_id)}
                    className="relative w-full h-full cursor-pointer group"
                  >
                    <img
                      src={currentVideo.cloudinary?.url || currentVideo.thumbnail_url}
                      alt={currentVideo.description}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                    {/* Play Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className="transition-all duration-300"
                        style={{
                          transform: hoveredId === currentVideo.video_id ? 'scale(1.2)' : 'scale(1)',
                        }}
                      >
                        <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-2xl border-3 border-white/60">
                          <PlayIcon size={36} className="text-white drop-shadow-lg" />
                        </div>
                      </div>
                    </div>

                    {/* Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white text-sm font-medium mb-2 line-clamp-2 drop-shadow-lg">
                        {currentVideo.description || 'TikTok Video'}
                      </p>
                      <p className="text-white/80 text-xs drop-shadow-lg">
                        {formatDate(currentVideo.create_time)}
                      </p>
                    </div>

                    {/* External Link */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openTikTok(currentVideo.video_id);
                      }}
                      className="absolute top-4 right-4 z-20 p-3 bg-white/90 backdrop-blur-md rounded-full text-gray-900 hover:bg-white transition-all shadow-lg"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Scroll Indicator */}
        <div className="flex justify-center gap-1 mt-6">
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

      {/* Fullscreen Modal */}
      {isFullscreen && activeVideoId && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="w-full h-full max-w-screen-sm">
            <TikTokEmbedPlayer
              videoId={currentVideo.video_id}
              username={username}
              thumbnailUrl={currentVideo.cloudinary?.url || currentVideo.thumbnail_url || ''}
              description={currentVideo.description}
              likeCount={currentVideo.like_count}
              commentCount={currentVideo.comment_count}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen(false)}
            />
          </div>
        </div>
      )}

      {/* CSS */}
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