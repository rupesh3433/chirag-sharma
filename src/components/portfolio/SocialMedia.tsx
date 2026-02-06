// src/pages/SocialMedia.tsx

import InstagramVideos from "./InstagramVideos";
import TikTokVideos from "./TiktokVideos";
import YoutubeVideos from "./YoutubeVideos";

export default function SocialMediaPage() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* TikTok Section */}
      <section>
        <TikTokVideos 
          username="_chirag_101"
          count={12}
          heading="Latest TikTok Videos"
        />
      </section>
            {/* Instagram Section */}
            <section>
        <InstagramVideos 
          username="_jinniechiragmua"
          limit={12}
          heading="Latest Instagram Reels"
        />
      </section>
        
        {/* YouTube Videos Section*/}
      <section>
        <YoutubeVideos limit={12} />
      </section>
    </main>
  );
}