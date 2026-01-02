
import React, { useState } from 'react';
import { Play, Instagram, Youtube } from 'lucide-react';

// Video portfolio data
const verticalVideos = [
  {
    id: 1,
    title: "Bridal Transformation",
    category: "bridal",
    thumbnailUrl: "https://images.unsplash.com/photo-1594489573233-c2d4e4e5f106?auto=format&fit=crop&q=80&w=2000",
    videoUrl: "https://www.instagram.com/p/CrGyxUDI7dl/embed",
    instagramLink: "https://www.instagram.com/p/CrGyxUDI7dl/",
    description: "Watch the complete bridal transformation process from start to finish."
  },
  {
    id: 2,
    title: "Makeup Tutorial",
    category: "tutorial",
    thumbnailUrl: "https://images.unsplash.com/photo-1542145748-72b2eb8576cd?auto=format&fit=crop&q=80&w=2000",
    videoUrl: "https://www.instagram.com/p/CqWzc6DIvLp/embed",
    instagramLink: "https://www.instagram.com/p/CqWzc6DIvLp/",
    description: "Learn professional makeup techniques in this step-by-step tutorial."
  },
  {
    id: 3,
    title: "Henna Application",
    category: "henna",
    thumbnailUrl: "https://images.unsplash.com/photo-1583266999030-4fba155cca8e?auto=format&fit=crop&q=80&w=2000",
    videoUrl: "https://www.instagram.com/p/Cp9ZsHIovZ3/embed",
    instagramLink: "https://www.instagram.com/p/Cp9ZsHIovZ3/",
    description: "Watch the intricate process of applying bridal henna designs."
  },
];

const horizontalVideos = [
  {
    id: 1,
    title: "Behind the Scenes - Bridal Photoshoot",
    category: "behind-the-scenes",
    thumbnailUrl: "https://images.unsplash.com/photo-1588731247530-4076fc99173e?auto=format&fit=crop&q=80&w=2000",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Get a glimpse of what happens behind the scenes at a professional bridal photoshoot."
  },
  {
    id: 2,
    title: "Celebrity Makeup Transformation",
    category: "celebrity",
    thumbnailUrl: "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&q=80&w=2000",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Watch the full transformation process for a celebrity client."
  },
];

const VideoPortfolio = () => {
  const [selectedVerticalVideo, setSelectedVerticalVideo] = useState<null | number>(null);
  const [selectedHorizontalVideo, setSelectedHorizontalVideo] = useState<null | number>(null);

  const handleOpenVerticalVideo = (id: number) => {
    setSelectedVerticalVideo(id);
  };

  const handleOpenHorizontalVideo = (id: number) => {
    setSelectedHorizontalVideo(id);
  };

  const handleCloseVideo = () => {
    setSelectedVerticalVideo(null);
    setSelectedHorizontalVideo(null);
  };

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold font-playfair relative inline-block">
            <span className="text-chirag-darkPurple">Video</span> <span className="text-chirag-pink">Portfolio</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-chirag-pink to-chirag-peach rounded-full mx-auto mt-4"></div>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Experience Chirag's artistry in action through these captivating videos
          </p>
        </div>

        {/* Vertical Videos (Instagram Reels) */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-playfair font-bold text-chirag-darkPurple">
              <span className="relative">
                Instagram Reels
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-chirag-pink to-chirag-peach"></span>
              </span>
            </h3>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-chirag-darkPurple hover:text-chirag-pink transition-colors"
            >
              <Instagram size={18} />
              <span className="font-medium">Follow on Instagram</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {verticalVideos.map((video) => (
              <div key={video.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all group">
                <div className="relative aspect-[9/16] w-full">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20"></div>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <button
                      onClick={() => handleOpenVerticalVideo(video.id)}
                      className="w-16 h-16 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 mb-4 group-hover:scale-110"
                    >
                      <Play size={36} className="text-white fill-white ml-1" />
                    </button>
                    
                    <a 
                      href={video.instagramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-chirag-pink to-chirag-peach rounded-full text-white font-medium shadow-md hover:shadow-xl transition-all duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Instagram size={18} />
                      <span>View on Instagram</span>
                    </a>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h4 className="font-bold font-playfair text-lg">{video.title}</h4>
                    <p className="text-white/80 text-sm line-clamp-2">{video.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Horizontal Videos (YouTube) */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-playfair font-bold text-chirag-darkPurple">
              <span className="relative">
                YouTube Videos
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-chirag-pink to-chirag-peach"></span>
              </span>
            </h3>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-chirag-darkPurple hover:text-chirag-pink transition-colors"
            >
              <Youtube size={18} />
              <span className="font-medium">Subscribe on YouTube</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {horizontalVideos.map((video) => (
              <div key={video.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all group">
                <div className="relative aspect-video w-full">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20"></div>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <button
                      onClick={() => handleOpenHorizontalVideo(video.id)}
                      className="w-16 h-16 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 mb-4 group-hover:scale-110"
                    >
                      <Play size={36} className="text-white fill-white ml-1" />
                    </button>
                    
                    <a 
                      href={video.youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 rounded-full text-white font-medium shadow-md hover:shadow-xl transition-all duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Youtube size={18} />
                      <span>View on YouTube</span>
                    </a>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h4 className="font-bold font-playfair text-lg">{video.title}</h4>
                    <p className="text-white/80 text-sm line-clamp-2">{video.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instagram Video Modal */}
        {selectedVerticalVideo && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={handleCloseVideo}>
            <div className="max-w-md w-full bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="aspect-[9/16] w-full relative">
                <iframe 
                  src={verticalVideos.find(v => v.id === selectedVerticalVideo)?.videoUrl} 
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  title="Instagram video"
                ></iframe>
              </div>
              <div className="p-4 flex justify-between items-center">
                <h3 className="font-playfair text-xl text-gray-800">
                  {verticalVideos.find(v => v.id === selectedVerticalVideo)?.title}
                </h3>
                <button 
                  onClick={handleCloseVideo}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* YouTube Video Modal */}
        {selectedHorizontalVideo && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={handleCloseVideo}>
            <div className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="aspect-video w-full relative">
                <iframe 
                  src={horizontalVideos.find(v => v.id === selectedHorizontalVideo)?.videoUrl} 
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  title="YouTube video"
                ></iframe>
              </div>
              <div className="p-4 flex justify-between items-center">
                <h3 className="font-playfair text-xl text-gray-800">
                  {horizontalVideos.find(v => v.id === selectedHorizontalVideo)?.title}
                </h3>
                <button 
                  onClick={handleCloseVideo}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default VideoPortfolio;
