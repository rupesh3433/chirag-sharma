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
  X,
  Play,
  Pause,
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  // ✅ SINGLE IFRAME STATE
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // ✅ Start muted (BROWSER POLICY)
  const [isPaused, setIsPaused] = useState(false);
  const [hasUserUnmuted, setHasUserUnmuted] = useState(false); // ✅ Track if user has unmuted
  
  // ✅ Video progress tracking
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

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
     GET VIDEO NUMBER FOR LOGGING
  ======================= */
  const getVideoNumber = useCallback((videoId: string): string => {
    const index = videos.findIndex(v => v.video_id === videoId);
    return index !== -1 ? `Video ${index + 1}` : 'Unknown Video';
  }, [videos]);

  /* =======================
     CREATE IFRAME URL - MUST START MUTED (BROWSER POLICY)
  ======================= */
  const createIframeUrl = useCallback((videoId: string): string => {
    // ✅ MUTED AUTOPLAY ONLY (browser policy)
    return `https://www.tiktok.com/player/v1/${videoId}?autoplay=1&loop=1&muted=1`;
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
     SCROLL & SNAP (NAVIGATION ONLY)
  ======================= */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;
        
        let closestCard: HTMLDivElement | null = null;
        let closestDistance = Infinity;
        let closestIndex = 0;
        
        videos.forEach((video, index) => {
          const card = cardRefs.current.get(video.video_id);
          if (!card) return;
          
          const cardRect = card.getBoundingClientRect();
          const cardCenter = cardRect.left + cardRect.width / 2;
          const distance = Math.abs(containerCenter - cardCenter);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestCard = card;
            closestIndex = index;
          }
        });
        
        if (closestCard) {
          // ✅ SWIPE = NAVIGATION ONLY
          closestCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          setCurrentIndex(closestIndex);
        }
      }, 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [videos]);

  /* =======================
     VIDEO PROGRESS TRACKER
  ======================= */
  useEffect(() => {
    if (activeVideoId && !isPaused) {
      // Simulate progress (TikTok iframe doesn't expose real-time progress)
      const video = videos.find(v => v.video_id === activeVideoId);
      const duration = video?.duration || 15; // Default 15s if not available
      
      setVideoDuration(duration);
      setVideoProgress(0);
      
      // Update progress every 100ms
      let elapsed = 0;
      progressInterval.current = setInterval(() => {
        elapsed += 0.1;
        const progress = (elapsed / duration) * 100;
        
        if (progress >= 100) {
          setVideoProgress(100);
          if (progressInterval.current) {
            clearInterval(progressInterval.current);
          }
        } else {
          setVideoProgress(progress);
        }
      }, 100);
      
      return () => {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      };
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }
  }, [activeVideoId, isPaused, videos]);

  /* =======================
     HANDLE CARD CLICK
  ======================= */
  const handleCardClick = useCallback((videoId: string) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`👆 USER CLICKED ${getVideoNumber(videoId)}`);
    console.log(`   Current Active: ${activeVideoId ? getVideoNumber(activeVideoId) : 'none'}`);
    console.log(`${'='.repeat(60)}`);
    
    // Same card - do nothing
    if (activeVideoId === videoId) {
      console.log(`✅ Same video already playing`);
      return;
    }
    
    // Different card - create new iframe
    console.log(`🎬 Creating iframe for ${getVideoNumber(videoId)}`);
    
    if (activeVideoId) {
      console.log(`🗑️ Destroying existing iframe for ${getVideoNumber(activeVideoId)}`);
    }
    
    setIsLoading(true);
    setIsPaused(false);
    setIsMuted(true); // ✅ Reset to muted for new video (browser policy)
    setHasUserUnmuted(false); // ✅ Reset unmute state
    setVideoProgress(0);
    
    setActiveVideoId(videoId);
    setIframeUrl(createIframeUrl(videoId));
    
    setTimeout(() => {
      setIsLoading(false);
      console.log(`✅ Iframe ready for ${getVideoNumber(videoId)} (muted by default)`);
    }, 1500);
  }, [activeVideoId, getVideoNumber, createIframeUrl]);

  /* =======================
     CLOSE VIDEO
  ======================= */
  const handleCloseVideo = useCallback(() => {
    console.log(`❌ Closing video - destroying iframe`);
    setActiveVideoId(null);
    setIframeUrl("");
    setIsLoading(false);
    setIsPaused(false);
    setIsMuted(true);
    setHasUserUnmuted(false);
    setVideoProgress(0);
    
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  }, []);

  /* =======================
     TOGGLE PLAY/PAUSE
  ======================= */
  const togglePlayPause = useCallback(() => {
    if (!iframeRef.current) return;
    
    const command = isPaused ? 'play' : 'pause';
    iframeRef.current.contentWindow?.postMessage(
      { 'x-tiktok-player': true, type: command },
      '*'
    );
    setIsPaused(!isPaused);
    console.log(`⏯️ ${command.toUpperCase()}`);
  }, [isPaused]);

  /* =======================
     TOGGLE MUTE - NOW WORKS (user gesture required)
  ======================= */
  const toggleMute = useCallback(() => {
    if (!iframeRef.current) return;
    
    const command = isMuted ? 'unMute' : 'mute';
    iframeRef.current.contentWindow?.postMessage(
      { 'x-tiktok-player': true, type: command },
      '*'
    );
    setIsMuted(!isMuted);
    setHasUserUnmuted(!isMuted); // ✅ Track user's unmute action
    console.log(`🔊 ${command.toUpperCase()} (user gesture)`);
  }, [isMuted]);

  const openTikTok = useCallback((videoId: string) => {
    const url = `https://www.tiktok.com/@${username}/video/${videoId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [username]);

  /* =======================
     NAVIGATION
  ======================= */
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < videos.length - 1;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const newIndex = direction === 'left' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(videos.length - 1, currentIndex + 1);
    
    const targetVideo = videos[newIndex];
    if (!targetVideo) return;
    
    const targetCard = cardRefs.current.get(targetVideo.video_id);
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      setCurrentIndex(newIndex);
    }
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

        {/* Header with User Info */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{heading}</h2>
            {user && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-semibold text-gray-900 text-lg">@{user.username}</span>
                  {user.verified && (
                    <svg className="w-5 h-5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                
                {/* ✅ Followers Info */}
                <div className="flex items-center gap-4 text-sm">
                  {user.followers_count !== undefined && (
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-gray-900">{formatNumber(user.followers_count)}</span>
                      <span className="text-gray-600">Followers</span>
                    </div>
                  )}
                  {user.following_count !== undefined && (
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-gray-900">{formatNumber(user.following_count)}</span>
                      <span className="text-gray-600">Following</span>
                    </div>
                  )}
                  {user.total_likes_count !== undefined && (
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      <span className="font-bold text-gray-900">{formatNumber(user.total_likes_count)}</span>
                      <span className="text-gray-600">Likes</span>
                    </div>
                  )}
                </div>
                
                {user.bio && (
                  <p className="text-sm text-gray-700 max-w-2xl">{user.bio}</p>
                )}
              </div>
            )}
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => scroll('left')}
              disabled={!canGoPrev}
              className="p-2 rounded-full bg-white shadow hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canGoNext}
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
              <span>View Profile</span>
            </a>
          </div>
        </div>

        {/* Reels Container */}
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide smooth-scroll"
            style={{
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {videos.map((video, index) => {
              const thumbnailUrl = video.cloudinary?.url || video.thumbnail_url || '';
              const isActive = activeVideoId === video.video_id;
              
              return (
                <div
                  key={video.video_id}
                  ref={(el) => {
                    if (el) cardRefs.current.set(video.video_id, el);
                  }}
                  className="flex-shrink-0 w-full md:w-[calc(33.333%-11px)] snap-center slide-item"
                  style={{ scrollSnapAlign: 'center' }}
                  onMouseEnter={() => setHoveredId(video.video_id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                    <div className="relative aspect-[9/16] bg-black overflow-hidden">
                      
                      {/* ✅ SINGLE IFRAME - With Controls */}
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
                          
                          {/* ✅ Progress Bar */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-black/30 z-30">
                            <div 
                              className="h-full bg-cyan-500 transition-all duration-100"
                              style={{ width: `${videoProgress}%` }}
                            />
                          </div>
                          
                          {/* Overlay UI */}
                          <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50"></div>

                            <div className="absolute top-0 left-0 right-0 p-4 pt-6 flex items-center justify-between pointer-events-auto z-20">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-500 to-purple-500 p-0.5">
                                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                    <span className="text-xs font-bold text-gray-700">TK</span>
                                  </div>
                                </div>
                                <span className="text-white text-sm font-semibold drop-shadow-lg">@{username}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={handleCloseVideo}
                                  className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            </div>

                            {/* ✅ Play/Pause Overlay (Center) */}
                            <div 
                              className="absolute inset-0 flex items-center justify-center pointer-events-auto"
                              onClick={togglePlayPause}
                            >
                              {isPaused && (
                                <div className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in">
                                  <Play className="w-10 h-10 text-white ml-1" />
                                </div>
                              )}
                            </div>

                            {/* ✅ "Tap for Sound" Message (only when muted) */}
                            {isMuted && !hasUserUnmuted && (
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                <div className="flex flex-col items-center animate-pulse">
                                  <div className="bg-black/60 backdrop-blur-sm rounded-full p-3 mb-2">
                                    <VolumeX className="w-8 h-8 text-white" />
                                  </div>
                                  <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
                                    <p className="text-white text-sm font-semibold whitespace-nowrap">
                                      Tap speaker icon for sound
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
                              <div className="flex items-end justify-between">
                                <div className="flex-1 mr-4">
                                  <p className="text-white text-sm font-medium mb-2 line-clamp-2 drop-shadow-lg">
                                    {video.description || 'TikTok Video'}
                                  </p>
                                </div>

                                <div className="flex flex-col gap-4 items-center">
                                  {/* ✅ Play/Pause Button */}
                                  <button onClick={togglePlayPause} className="hover:scale-110 transition-transform">
                                    {isPaused ? (
                                      <Play className="w-7 h-7 text-white drop-shadow-lg fill-white" />
                                    ) : (
                                      <Pause className="w-7 h-7 text-white drop-shadow-lg fill-white" />
                                    )}
                                  </button>

                                  {/* ✅ Mute/Unmute Button with visual feedback */}
                                  <button 
                                    onClick={toggleMute} 
                                    className="hover:scale-110 transition-transform relative"
                                  >
                                    {isMuted ? (
                                      <>
                                        <VolumeX className="w-7 h-7 text-white drop-shadow-lg" />
                                        {!hasUserUnmuted && (
                                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center animate-pulse">
                                            <span className="text-[10px] font-bold text-white">!</span>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <Volume2 className="w-7 h-7 text-white drop-shadow-lg" />
                                    )}
                                  </button>

                                  {video.like_count && video.like_count > 0 && (
                                    <div className="flex flex-col items-center gap-1">
                                      <Heart className="w-7 h-7 text-white drop-shadow-lg" />
                                      <span className="text-white text-xs font-semibold drop-shadow-lg">
                                        {formatNumber(video.like_count)}
                                      </span>
                                    </div>
                                  )}

                                  {video.comment_count && video.comment_count > 0 && (
                                    <div className="flex flex-col items-center gap-1">
                                      <MessageCircle className="w-7 h-7 text-white drop-shadow-lg" />
                                      <span className="text-white text-xs font-semibold drop-shadow-lg">
                                        {formatNumber(video.comment_count)}
                                      </span>
                                    </div>
                                  )}

                                  <Send className="w-7 h-7 text-white drop-shadow-lg" />
                                  <Bookmark className="w-7 h-7 text-white drop-shadow-lg" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Thumbnail + Play button */}
                      {!isActive && (
                        <div
                          onClick={() => handleCardClick(video.video_id)}
                          className="relative w-full h-full cursor-pointer group"
                        >
                          <img
                            src={thumbnailUrl}
                            alt={video.description}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                          <div className="absolute inset-0 flex items-center justify-center">
                            <div 
                              className="transition-all duration-300"
                              style={{
                                transform: hoveredId === video.video_id ? 'scale(1.2)' : 'scale(1)',
                              }}
                            >
                              <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-2xl border-3 border-white/60">
                                <PlayIcon size={36} className="text-white drop-shadow-lg" />
                              </div>
                            </div>
                          </div>

                          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-500 to-purple-500 p-0.5">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                  <span className="text-xs font-bold text-gray-700">TK</span>
                                </div>
                              </div>
                              <span className="text-white text-sm font-semibold drop-shadow-lg">{username}</span>
                            </div>
                            <MoreHorizontal className="text-white drop-shadow-lg" size={20} />
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <div className="flex items-end justify-between">
                              <div className="flex-1 mr-4">
                                <p className="text-white text-sm font-medium mb-2 line-clamp-2 drop-shadow-lg">
                                  {video.description || 'TikTok Video'}
                                </p>
                                <p className="text-white/80 text-xs drop-shadow-lg">
                                  {formatDate(video.create_time)}
                                </p>
                              </div>

                              <div className="flex flex-col gap-4">
                                {video.like_count && video.like_count > 0 && (
                                  <div className="flex flex-col items-center">
                                    <Heart size={28} className="text-white drop-shadow-lg" />
                                    <span className="text-white text-xs font-semibold mt-1 drop-shadow-lg">
                                      {formatNumber(video.like_count)}
                                    </span>
                                  </div>
                                )}

                                {video.comment_count && video.comment_count > 0 && (
                                  <div className="flex flex-col items-center">
                                    <MessageCircle size={28} className="text-white drop-shadow-lg" />
                                    <span className="text-white text-xs font-semibold mt-1 drop-shadow-lg">
                                      {formatNumber(video.comment_count)}
                                    </span>
                                  </div>
                                )}

                                <Send size={28} className="text-white drop-shadow-lg" />
                                <Bookmark size={28} className="text-white drop-shadow-lg" />
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openTikTok(video.video_id);
                            }}
                            className="absolute top-4 right-4 z-20 p-3 bg-white/90 backdrop-blur-md rounded-full text-gray-900 hover:bg-white transition-all shadow-lg"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </button>
                        </div>
                      )}

                      {/* Loading Overlay */}
                      {isActive && isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                          <div className="text-center">
                            <div className="w-16 h-16 border-4 border-white/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-white text-sm font-medium">Loading video...</p>
                          </div>
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
        <div className="md:hidden flex justify-center gap-1 mt-6">
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

      {/* ✅ Enhanced CSS with smooth transitions */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .smooth-scroll {
          scroll-behavior: smooth;
          transition: scroll-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .slide-item {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        /* ✅ Mobile swipe optimization */
        @media (max-width: 768px) {
          .smooth-scroll {
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          
          .slide-item {
            scroll-snap-align: center;
            scroll-snap-stop: always;
          }
        }
      `}</style>
    </section>
  );
};

export default TikTokVideos;