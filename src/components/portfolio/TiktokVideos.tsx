import React, { useEffect, useRef, useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Play,
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
  music_title?: string;
  music_author?: string;
};

type TikTokUser = {
  username: string;
  verified?: boolean;
  followers_count?: number;
  profile_picture_url?: string;
};

type TikTokVideosProps = {
  username?: string;
  count?: number;
  heading?: string;
};

type EmbedStatus = 'loading' | 'success' | 'failed';

/* =======================
   COMPONENT
======================= */
const TikTokVideos = ({
  username = "_chirag_101",
  count = 12,
  heading = "Latest TikTok Videos",
}: TikTokVideosProps) => {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [user, setUser] = useState<TikTokUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>("");
  const [cacheInfo, setCacheInfo] = useState<{ age_days?: number; cached_at?: string } | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const [embedStatus, setEmbedStatus] = useState<Map<string, EmbedStatus>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const embedTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  /* =======================
     LOAD TIKTOK EMBED SCRIPT (CRITICAL)
  ======================= */
  useEffect(() => {
    // Only load script once - NEVER remove it
    if (document.getElementById("tiktok-embed-script")) return;

    const script = document.createElement("script");
    script.id = "tiktok-embed-script";
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
    
    // NO CLEANUP - TikTok embeds are global and must persist
  }, []);

  /* =======================
     FORMAT HELPERS
  ======================= */
  const formatNumber = (num?: number): string => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "";
    const diff = Math.floor((Date.now() - timestamp * 1000) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
    return `${Math.floor(diff / 30)} months ago`;
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return "0s";
    return `${seconds}s`;
  };

  /* =======================
     FETCH PROFILE
  ======================= */
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🚀 Fetching TikTok profile from: ${API_URL}/public/tiktok/profile?username=${username}&count=${count}`);
      
      const response = await fetch(`${API_URL}/public/tiktok/profile?username=${username}&count=${count}`);
      const data = await response.json();

      console.log("📦 TikTok API Response:", data);

      if (data.success && data.user && data.videos && data.videos.length > 0) {
        setUser(data.user);
        
        // ✅ CRITICAL FIX: Only filter by video_id (NOT video_url or thumbnail_url)
        // TikTok embed doesn't need video_url - it only needs video_id
        const validVideos = data.videos
          .map((video: any, index: number) => ({
            ...video,
            video_id: video.video_id || `video_${index}_${Date.now()}`
          }))
          .filter((video: any) => video.video_id); // Only require video_id
        
        console.log(`✅ Filtered ${validVideos.length} valid videos from ${data.videos.length} total`);
        
        setVideos(validVideos);
        setDataSource(data.source || "unknown");
        
        // Store cache info
        if (data.cache_age_days !== undefined && data.cached_at) {
          setCacheInfo({
            age_days: data.cache_age_days,
            cached_at: data.cached_at
          });
        }
        
        // Show banner for fresh API data
        if (data.source === "rapidapi_fresh") {
          console.log("✅ Fresh data from RapidAPI - showing banner");
          setShowBanner(true);
          
          if (data.metrics) {
            console.log("📊 Refresh Metrics:", data.metrics);
          }
          
          setTimeout(() => {
            setShowBanner(false);
          }, 3000);
        } else {
          setShowBanner(false);
        }
        
        // Log source-specific info
        if (data.source === "mongodb_cache") {
          console.log(`✅ Loaded from MongoDB cache (age: ${data.cache_age_days} days)`);
        } else if (data.source === "mongodb_cache_locked") {
          console.warn(`🔒 Using cache while refresh in progress (age: ${data.cache_age_days} days)`);
        } else if (data.source === "mongodb_cache_fallback") {
          console.warn(`⚠️ API failed, using old cache (age: ${data.cache_age_days} days)`);
          if (data.warning) {
            setError(data.warning);
          }
        }
      } else if (data.success === false) {
        console.error("❌ TikTok API returned error:", data.error);
        setError(data.error || "Failed to fetch TikTok profile");
        setVideos([]);
        setUser(null);
      } else {
        console.warn("⚠️ TikTok API returned no videos");
        setError("No videos available");
        setVideos([]);
        setUser(null);
      }
    } catch (err) {
      console.error("❌ Failed to fetch TikTok profile:", err);
      setError("Failed to connect to server");
      setVideos([]);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username, count]);

  /* =======================
     RE-INITIALIZE TIKTOK EMBEDS AFTER VIDEOS LOAD
  ======================= */
  useEffect(() => {
    if (!videos.length) return;

    // Initialize all videos as loading
    const newStatus = new Map<string, EmbedStatus>();
    videos.forEach(video => {
      newStatus.set(video.video_id, 'loading');
    });
    setEmbedStatus(newStatus);

    // Let DOM paint first, then tell TikTok to process new embeds
    const timer = setTimeout(() => {
      (window as any).tiktokEmbed?.load();
      
      // After 3 seconds, check which embeds failed and mark them
      const checkTimer = setTimeout(() => {
        const statusUpdate = new Map(newStatus);
        videos.forEach(video => {
          const embedElement = document.querySelector(
            `blockquote[data-video-id="${video.video_id}"]`
          );
          
          // Check if TikTok actually rendered the iframe
          const hasIframe = embedElement?.querySelector('iframe');
          
          if (hasIframe) {
            statusUpdate.set(video.video_id, 'success');
          } else {
            statusUpdate.set(video.video_id, 'failed');
          }
        });
        setEmbedStatus(statusUpdate);
      }, 3000);
      
      embedTimeouts.current.set('check', checkTimer);
    }, 0);

    embedTimeouts.current.set('init', timer);

    return () => {
      embedTimeouts.current.forEach(timeout => clearTimeout(timeout));
      embedTimeouts.current.clear();
    };
  }, [videos]);

  /* =======================
     SCROLL HANDLERS
  ======================= */
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = 380; // Fixed scroll amount for card width
    
    if (direction === 'left') {
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    } else {
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
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
     RENDER
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

  if (videos.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Videos Available in TikTok</h3>
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
            <h2 className="text-3xl font-bold text-gray-900">{heading}</h2>
            {user && (
              <div className="flex items-center gap-3 text-gray-600 mt-1">
                <span className="font-semibold text-gray-900">@{user.username}</span>
                {user.verified && (
                  <svg className="w-4 h-4 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {user.followers_count && (
                  <>
                    <span>•</span>
                    <span>{formatNumber(user.followers_count)} followers</span>
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
            
            {/* View on TikTok Button */}
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
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {videos.map((video) => {
              const status = embedStatus.get(video.video_id) || 'loading';
              const showFallback = status === 'failed';
              
              return (
                <div
                  key={video.video_id}
                  className="snap-start w-[360px] flex-shrink-0"
                >
                  <div className="rounded-xl border shadow bg-white overflow-hidden">
                    {/* VIDEO CONTAINER */}
                    <div className="relative bg-black" style={{ aspectRatio: '9/16' }}>
                      {/* ✅ OFFICIAL TIKTOK EMBED (always render, hide if failed) */}
                      <div className={showFallback ? 'hidden' : 'block'}>
                        <blockquote
                          className="tiktok-embed w-[360px]"
                          cite={`https://www.tiktok.com/@${username}/video/${video.video_id}`}
                          data-video-id={video.video_id}
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

                      {/* 🎯 FALLBACK: Thumbnail + Play Button (if embed fails) */}
                      {showFallback && video.thumbnail_url && (
                        <div 
                          className="absolute inset-0 cursor-pointer group"
                          onClick={() => openTikTok(video.video_id)}
                        >
                          {/* Thumbnail */}
                          <img
                            src={video.thumbnail_url}
                            alt={video.description || 'TikTok Video'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />

                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                          {/* Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                              <Play size={36} className="text-gray-900 ml-1" fill="currentColor" />
                            </div>
                          </div>

                          {/* Top Bar */}
                          <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-2">
                            {user?.profile_picture_url ? (
                              <img 
                                src={user.profile_picture_url} 
                                alt={user.username}
                                className="w-8 h-8 rounded-full border-2 border-white"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center border-2 border-white">
                                <span className="text-xs font-bold text-white">
                                  {username.slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="text-white text-sm font-semibold drop-shadow-lg">
                              @{username}
                            </span>
                          </div>

                          {/* Bottom Info */}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <p className="text-white text-sm font-medium line-clamp-2 drop-shadow-lg mb-1">
                              {video.description || 'TikTok Video'}
                            </p>
                            <p className="text-white/90 text-xs drop-shadow">
                              {formatDate(video.create_time)} • {formatDuration(video.duration)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Loading State */}
                      {status === 'loading' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <div className="w-12 h-12 border-4 border-gray-300 border-t-cyan-500 rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    {/* Video Info Card Below */}
                    <div className="p-4 bg-white">
                      {/* User Info */}
                      <div className="flex items-center gap-2 mb-3">
                        {user?.profile_picture_url ? (
                          <img 
                            src={user.profile_picture_url} 
                            alt={user.username}
                            className="w-8 h-8 rounded-full border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {username.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            @{username}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(video.create_time)} • {formatDuration(video.duration)}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {video.description || "TikTok Video"}
                      </p>

                      {/* Music Info */}
                      {video.music_title && (
                        <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
                          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                          </svg>
                          <p className="truncate">
                            {video.music_title} {video.music_author && `- ${video.music_author}`}
                          </p>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                        {video.like_count !== undefined && video.like_count > 0 && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Heart size={16} />
                            <span className="text-xs font-semibold">
                              {formatNumber(video.like_count)}
                            </span>
                          </div>
                        )}

                        {video.comment_count !== undefined && video.comment_count > 0 && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <MessageCircle size={16} />
                            <span className="text-xs font-semibold">
                              {formatNumber(video.comment_count)}
                            </span>
                          </div>
                        )}

                        {video.share_count !== undefined && video.share_count > 0 && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Share2 size={16} />
                            <span className="text-xs font-semibold">
                              {formatNumber(video.share_count)}
                            </span>
                          </div>
                        )}

                        <button
                          onClick={() => openTikTok(video.video_id)}
                          className="ml-auto text-gray-600 hover:text-cyan-500 transition"
                        >
                          <Bookmark size={16} />
                        </button>
                      </div>
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

      {/* CSS for animations and styles */}
      <style>{`
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
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

        /* TikTok embed styling */
        .tiktok-embed {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </section>
  );
};

export default TikTokVideos;