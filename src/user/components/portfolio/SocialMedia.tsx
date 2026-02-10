import { useEffect, useState } from "react";
import InstagramVideos from "./InstagramVideos";
import TikTokVideos from "./TiktokVideos";
import YoutubeVideos from "./YoutubeVideos";

function useCardsPerView(): number {
  const getCardsPerView = (): number => {
    const width = window.innerWidth;
    if (width < 640) return 1;
    if (width < 768) return 2;
    if (width < 924) return 4;
    return 5;
  };

  const [cardsPerView, setCardsPerView] = useState<number>(
    typeof window !== "undefined" ? getCardsPerView() : 4
  );

  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return cardsPerView;
}

export default function SocialMediaPage() {
  const cardsPerView = useCardsPerView();

  return (
    <div className="w-full bg-white">
<div className="w-full max-w-7xl mx-auto">
{/* TikTok */}
        <section className="pb-4 sm:pb-6">
          <TikTokVideos
            username="_chirag_101"
            limit={12}
            heading="Latest TikTok Videos"
            cardsPerView={cardsPerView}
            gap={12}
          />
        </section>

        {/* Instagram */}
        <section className="pb-4 sm:pb-6">
          <InstagramVideos
            heading="Latest Instagram Reels"
            username="_jinniechiragmua"
            limit={12}
            cardsPerView={cardsPerView}
            gap={12}
          />
        </section>

        {/* YouTube */}
        <section className="pb-2">
          <YoutubeVideos
            heading="Latest YouTube Videos"
            limit={12}
            cardsPerView={cardsPerView}
            gap={12}
          />
        </section>
      </div>
    </div>
  );
}
