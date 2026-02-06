import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
} from "lucide-react";

/* =======================
   TYPES
======================= */
type TikTokVideo = {
  video_id: string;  // ✅ ONLY USE THIS FOR PLAYBACK
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
  // ❌ BACKEND MAY SEND THESE, BUT WE IGNORE THEM:
  video_url?: string;  // NEVER USE FOR PLAYBACK
  play_url?: string;   // NEVER USE FOR PLAYBACK
  mp4_url?: string;    // NEVER USE FOR PLAYBACK
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
   SAFETY GUARD: EXPLICIT TYPE FILTER
======================= */
const safeVideoForPlayback = (video: any): TikTokVideo => {
  // Extract only safe fields for playback
  return {
    video_id: video.video_id || `video_${Date.now()}`,
    description: video.description || '',
    create_time: video.create_time || 0,
    duration: video.duration || 0,
    thumbnail_url: video.thumbnail_url || video.cloudinary?.url,
    like_count: video.like_count,
    comment_count: video.comment_count,
    share_count: video.share_count,
    view_count: video.view_count,
    music_title: video.music_title,
    music_author: video.music_author,
    cloudinary: video.cloudinary || null,
  };
};

/* =======================
   TIKTOK EMBED PLAYER COMPONENT (OFFICIAL & STABLE)
======================= */
interface TikTokEmbedPlayerProps {
  videoId: string;  // ✅ ONLY USE THIS
  username: string;
  thumbnailUrl: string;
  isVisible: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  onPlayerReady?: () => void;
}

const TikTokEmbedPlayer = React.forwardRef<HTMLIFrameElement, TikTokEmbedPlayerProps>(
  ({
    videoId,
    username,
    thumbnailUrl,
    isVisible,
    isPlaying,
    isMuted,
    onPlayerReady,
  }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [playerReady, setPlayerReady] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Combine refs
    React.useImperativeHandle(ref, () => iframeRef.current!);

    // 🎯 STEP 1: Build Embed Player URL (CORRECT FORMAT)
    const iframeUrl = useMemo(() => {
      const baseUrl = `https://www.tiktok.com/player/v1/${videoId}`;
      const params = new URLSearchParams();
      
      // ✅ CLEAN UI PARAMETERS (HIDE TIKTOK UI)
      const config = {
        autoplay: 0,          // Don't autoplay - we control via postMessage
        loop: 1,              // Loop videos
        controls: 0,          // Hide TikTok controls
        play_button: 0,       // Hide play button
        volume_control: 0,    // Hide volume control
        fullscreen_button: 0, // Hide fullscreen button
        music_info: 0,        // Hide music info
        description: 0,       // Hide description
        rel: 0,              // No related videos
        timestamp: 0,         // Hide timestamp
        progress_bar: 0,      // Hide progress bar
        closed_caption: 0,    // Hide closed caption
        native_context_menu: 0 // Hide context menu
      };
      
      // Add all parameters
      Object.entries(config).forEach(([key, value]) => {
        params.append(key, value ? '1' : '0');
      });
      
      return `${baseUrl}?${params.toString()}`;
    }, [videoId]);

    // 🎯 STEP 2: Wait for onPlayerReady (MANDATORY)
    useEffect(() => {
      const handler = (e: MessageEvent) => {
        // Check if this is a TikTok player message
        if (!e.data || typeof e.data !== 'object' || !e.data['x-tiktok-player']) {
          return;
        }

        const { type } = e.data;
        
        if (type === 'onPlayerReady') {
          console.log(`🎬 TikTok Player Ready: ${videoId}`);
          setPlayerReady(true);
          if (onPlayerReady) onPlayerReady();
        }
        
        // Optional: Listen for other player events
        if (type === 'onPlay') {
          console.log(`▶️ TikTok Video Playing: ${videoId}`);
        }
        if (type === 'onPause') {
          console.log(`⏸️ TikTok Video Paused: ${videoId}`);
        }
        if (type === 'onEnd') {
          console.log(`🏁 TikTok Video Ended: ${videoId}`);
        }
      };

      window.addEventListener('message', handler);
      return () => window.removeEventListener('message', handler);
    }, [videoId, onPlayerReady]);

    // 🎯 STEP 3: Control play/pause correctly
    useEffect(() => {
      if (!playerReady || !iframeRef.current || !isVisible) return;

      try {
        const message = {
          'x-tiktok-player': true,
          type: isPlaying ? 'play' : 'pause',
          value: undefined
        };
        
        iframeRef.current.contentWindow?.postMessage(message, '*');
      } catch (err) {
        console.error('Failed to control TikTok playback:', err);
      }
    }, [isPlaying, playerReady, isVisible]);

    // 🎯 STEP 4: Control mute/unmute
    useEffect(() => {
      if (!playerReady || !iframeRef.current || !isVisible) return;

      try {
        const message = {
          'x-tiktok-player': true,
          type: isMuted ? 'mute' : 'unMute',
          value: undefined
        };
        
        iframeRef.current.contentWindow?.postMessage(message, '*');
      } catch (err) {
        console.error('Failed to control TikTok mute:', err);
      }
    }, [isMuted, playerReady, isVisible]);

    // 🎯 STEP 5: Initial mute for autoplay compliance
    useEffect(() => {
      if (!playerReady || !iframeRef.current || !isVisible) return;

      // Always start muted to comply with browser autoplay policies
      try {
        const muteMessage = {
          'x-tiktok-player': true,
          type: 'mute',
          value: undefined
        };
        
        iframeRef.current.contentWindow?.postMessage(muteMessage, '*');
      } catch (err) {
        console.error('Failed to initial mute TikTok:', err);
      }
    }, [playerReady, isVisible]);

    // Loading state (when not visible or player not ready)
    if (!isVisible || !playerReady) {
      return (
        <div 
          className="relative w-full h-full bg-black overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={thumbnailUrl}
            alt={`TikTok by @${username}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-6 h-6 text-white ml-0.5" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="relative w-full h-full bg-black overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 🎯 STEP 6: TikTok Embed Player iframe (CRITICAL) */}
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          className="absolute inset-0 w-full h-full border-none"
          allow="autoplay; fullscreen"  // ✅ Essential permissions
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
          title={`TikTok video by @${username}`}
          sandbox="allow-scripts allow-same-origin allow-presentation"
        />
        
        {/* Custom overlay controls */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${
          isHovered || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Top gradient */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black/70 to-transparent" />
          
          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Center play button (when not playing) */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="transition-transform duration-300"
                style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
              >
                <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center shadow-2xl border-2 border-white/50">
                  <Play className="w-7 h-7 text-white ml-1" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

TikTokEmbedPlayer.displayName = 'TikTokEmbedPlayer';

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
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [mutedVideos, setMutedVideos] = useState<Set<string>>(new Set());
  const [visibleVideos, setVisibleVideos] = useState<Set<string>>(new Set());
  const [playerReadyVideos, setPlayerReadyVideos] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, React.RefObject<HTMLIFrameElement>>>(new Map());

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // 🎯 Intersection Observer for lazy loading
  useEffect(() => {
    if (!videos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoId = entry.target.getAttribute('data-video-id');
          if (!videoId) return;

          if (entry.isIntersecting) {
            setVisibleVideos(prev => new Set(prev).add(videoId));
          } else {
            setVisibleVideos(prev => {
              const next = new Set(prev);
              next.delete(videoId);
              return next;
            });
            
            // Pause video when it's not visible
            if (playingVideo === videoId) {
              setPlayingVideo(null);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    // Observe all video containers
    const containers = document.querySelectorAll('[data-video-id]');
    containers.forEach(container => observer.observe(container));

    return () => observer.disconnect();
  }, [videos, playingVideo]);

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

  const formatDuration = useCallback((seconds: number): string => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  }, []);

  /* =======================
     FETCH PROFILE (SAFE VERSION)
  ======================= */
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/public/tiktok/profile?username=${username}&count=${limit}`);
      const data = await response.json();

      if (data.success && data.user && data.videos && data.videos.length > 0) {
        setUser(data.user);
        
        // 🎯 CRITICAL: Filter to only safe video data
        const validVideos = data.videos
          .map((video: any) => safeVideoForPlayback(video))
          .filter((video: TikTokVideo) => video.video_id);
        
        setVideos(validVideos);
        setDataSource(data.source || "unknown");
        
        if (data.cache_age_days !== undefined && data.cached_at) {
          setCacheInfo({
            age_days: data.cache_age_days,
            cached_at: data.cached_at
          });
        }
        
        console.log(`✅ Loaded ${validVideos.length} TikTok videos using ${data.source}`);
        
        // 🚨 SAFETY WARNING: Log if backend sends dangerous URLs
        data.videos.forEach((video: any) => {
          if (video.video_url || video.mp4_url) {
            console.warn(
              `🚨 Backend sent video_url/mp4_url for ${video.video_id}. ` +
              `Frontend is IGNORING these for playback (using Embed Player instead).`
            );
          }
        });
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
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username, limit]);

  /* =======================
     VIDEO CONTROLS
  ======================= */
  const toggleVideoPlayback = useCallback((videoId: string) => {
    if (playingVideo === videoId) {
      setPlayingVideo(null);
    } else {
      // Ensure only one video plays at a time
      if (playingVideo) {
        setPlayingVideo(null);
      }
      // Wait a frame to ensure previous video is paused
      requestAnimationFrame(() => {
        setPlayingVideo(videoId);
      });
    }
  }, [playingVideo]);

  const toggleMute = useCallback((videoId: string) => {
    setMutedVideos(prev => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }
      return next;
    });
  }, []);

  const handlePlayerReady = useCallback((videoId: string) => {
    setPlayerReadyVideos(prev => new Set(prev).add(videoId));
  }, []);

  /* =======================
     SCROLL HANDLERS
  ======================= */
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = container.offsetWidth / 3;
    const newIndex = direction === 'left' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(videos.length - 3, currentIndex + 1);
    
    setCurrentIndex(newIndex);
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, [currentIndex, videos.length]);

  /* =======================
     OPEN TIKTOK
  ======================= */
  const openTikTok = useCallback((videoId: string) => {
    window.open(`https://www.tiktok.com/@${username}/video/${videoId}`, '_blank', 'noopener,noreferrer');
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
              const thumbnailUrl = video.cloudinary?.url || video.thumbnail_url || '';
              const isVisible = visibleVideos.has(video.video_id);
              const isPlaying = playingVideo === video.video_id;
              const isMuted = mutedVideos.has(video.video_id);
              const isPlayerReady = playerReadyVideos.has(video.video_id);
              
              // Get or create ref for this video
              if (!videoRefs.current.has(video.video_id)) {
                videoRefs.current.set(video.video_id, React.createRef());
              }
              const videoRef = videoRefs.current.get(video.video_id);
              
              return (
                <div
                  key={video.video_id}
                  data-video-id={video.video_id}
                  className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[calc(33.333%-11px)] snap-start"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                    {/* Video Container */}
                    <div 
                      className="relative aspect-[9/16] bg-black overflow-hidden cursor-pointer"
                      onClick={() => toggleVideoPlayback(video.video_id)}
                    >
                      <TikTokEmbedPlayer
                        ref={videoRef}
                        videoId={video.video_id}  // ✅ ONLY USE video_id FOR PLAYBACK
                        username={username}
                        thumbnailUrl={thumbnailUrl}
                        isVisible={isVisible}
                        isPlaying={isPlaying}
                        isMuted={isMuted}
                        onPlayerReady={() => handlePlayerReady(video.video_id)}
                      />
                      
                      {/* Status Indicator */}
                      {isVisible && !isPlayerReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                      
                      {/* Quick Actions */}
                      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMute(video.video_id);
                          }}
                          className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition"
                          aria-label={isMuted ? "Unmute" : "Mute"}
                        >
                          {isMuted ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openTikTok(video.video_id);
                          }}
                          className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition"
                          aria-label="Open on TikTok"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        {/* Description */}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 text-sm font-medium mb-1 line-clamp-2">
                            {video.description || 'TikTok Video'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{formatDate(video.create_time)}</span>
                            <span>•</span>
                            <span>{formatDuration(video.duration)}</span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-col items-end gap-1">
                          {(video.like_count || 0) > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Heart size={14} className="text-red-500" />
                              <span>{formatNumber(video.like_count)}</span>
                            </div>
                          )}
                          {(video.comment_count || 0) > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <MessageCircle size={14} className="text-blue-500" />
                              <span>{formatNumber(video.comment_count)}</span>
                            </div>
                          )}
                          <button
                            onClick={() => openTikTok(video.video_id)}
                            className="text-xs text-cyan-600 hover:text-cyan-700 font-medium mt-1 flex items-center gap-1"
                          >
                            <ExternalLink size={12} />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* 🎯 IMPORTANT: No pointer-events: none on iframe */
        .tiktok-embed iframe {
          pointer-events: auto !important;
        }
      `}</style>
    </section>
  );
};

export default TikTokVideos;