import React, { useEffect, useState } from "react";
import { Play, Instagram, Youtube } from "lucide-react";

/* ================================
   CONFIGURATION
================================ */

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

// Instagram reels (manual thumbnails – REQUIRED)
const instagramPosts = [
  {
    id: 1,
    title: "Bridal Transformation Reel",
    thumbnail: "/photos/chirag1.PNG",
    embedUrl: "https://www.instagram.com/reel/DNUzqQBJTwq/embed",
    postUrl: "https://www.instagram.com/reel/DNUzqQBJTwq/",
  },
  {
    id: 2,
    title: "Party Glam Look Reel",
    thumbnail: "/photos/chirag2.PNG",
    embedUrl: "https://www.instagram.com/reel/DSfN92BCRbH/embed",
    postUrl: "https://www.instagram.com/reel/DSfN92BCRbH/",
  },
  {
    id: 3,
    title: "Henna Art Reel",
    thumbnail: "/photos/chirag3.PNG",
    embedUrl: "https://www.instagram.com/reel/DRRCn-ADGPe/embed",
    postUrl: "https://www.instagram.com/reel/DRRCn-ADGPe/",
  },
];

const VideoPortfolio = () => {
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>([]);
  const [activeInstagram, setActiveInstagram] = useState<any | null>(null);

  /* ================================
     FETCH LATEST YOUTUBE VIDEOS
  ================================ */
  useEffect(() => {
    fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=6`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          const videos = data.items
            .filter((v: any) => v.id.videoId)
            .slice(0, 4);

          setYoutubeVideos(videos);
        }
      })
      .catch((err) => console.error("YouTube fetch error:", err));
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="container-custom space-y-24">

        {/* ================= INSTAGRAM ================= */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-playfair font-bold text-chirag-darkPurple">
              Instagram Reels
            </h2>
            <a
              href="https://www.instagram.com/_jinniechiragmua/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-chirag-darkPurple font-semibold"
            >
              <Instagram size={20} />
              Visit Instagram
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {instagramPosts.map((post) => (
              <div
                key={post.id}
                className="group cursor-pointer rounded-2xl overflow-hidden shadow-lg border"
                onClick={() => setActiveInstagram(post)}
              >
                <div className="relative aspect-[9/16]">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <Play size={36} className="text-white fill-white ml-1" />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white flex justify-between items-center">
                  <span className="font-medium">{post.title}</span>
                  <a
                    href={post.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-chirag-pink font-semibold"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= YOUTUBE ================= */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-playfair font-bold text-chirag-darkPurple">
              YouTube Videos
            </h2>
            <a
              href="https://www.youtube.com/@jinniechiragmua"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-red-600 font-semibold"
            >
              <Youtube size={20} />
              Visit YouTube
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {youtubeVideos.map((video) => (
              <div
                key={video.id.videoId}
                className="rounded-2xl overflow-hidden shadow-lg border"
              >
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id.videoId}`}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title={video.snippet.title}
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold line-clamp-2">
                    {video.snippet.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ================= INSTAGRAM MODAL ================= */}
      {activeInstagram && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setActiveInstagram(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-[9/16]">
              <iframe
                src={activeInstagram.embedUrl}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={activeInstagram.title}
              />
            </div>

            <div className="p-4 flex justify-between items-center">
              <span className="font-semibold">{activeInstagram.title}</span>
              <button
                onClick={() => setActiveInstagram(null)}
                className="text-sm font-semibold text-chirag-pink"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VideoPortfolio;
