import InstagramVideos from "./InstagramVideos";
import YoutubeVideos from "./YoutubeVideos";

const VideoPortfolio = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container-custom space-y-24">
        <InstagramVideos />
        <YoutubeVideos />
      </div>
    </section>
  );
};

export default VideoPortfolio;
