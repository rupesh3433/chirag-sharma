import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Award, Star, Trophy, Medal, Sparkles } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50/30 via-white to-purple-50/30">
      <Navbar />

      <main className="flex-grow">

        {/* ================= HERO ================= */}
        <section className="pt-32 pb-16 bg-gradient-to-br from-pink-100/40 via-purple-50/30 to-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(236,72,153,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.08),transparent_50%)]" />

          <div className="container mx-auto max-w-7xl px-4 relative text-center">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow border border-pink-200/50">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium text-gray-700">
                Beauty Artist & Creative Visionary
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              About{" "}
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Chirag Sharma
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              A journey of passion, artistry, and dedication to transforming
              beauty into an unforgettable experience
            </p>
          </div>
        </section>

        {/* ================= BIO ================= */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">The Journey Begins</h2>

              <p className="text-gray-600 border-l-4 pl-4 border-pink-200">
                My beauty journey started over{" "}
                <span className="font-semibold text-pink-600">9+ years ago</span>{" "}
                with a deep fascination for colors, creativity, and
                transformation.
              </p>

              <p className="text-gray-600 border-l-4 pl-4 border-purple-200">
                After professional training and collaborations with industry
                leaders and celebrities, I developed a signature style blending
                timeless elegance with modern trends.
              </p>

              <p className="text-gray-600 border-l-4 pl-4 border-pink-200">
                Today, I specialize in bridal, editorial, and creative makeup
                artistry, complemented by intricate henna designs.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <Stat value="9+" label="Years Experience" />
                <Stat value="1000+" label="Happy Clients" />
                <Stat value="50+" label="Awards Won" />
              </div>
            </div>

            {/* Real Image */}
            <div className="relative max-w-md mx-auto">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-pink-400/30 via-purple-400/30 to-pink-400/30 blur-3xl animate-pulse" />
              <img
                src="/photos/chiragicon2.JPG"
                alt="Chirag Sharma"
                className="relative z-10 rounded-3xl shadow-2xl w-full border-4 border-white object-cover aspect-[3/4]"
              />
            </div>
          </div>
        </section>

        {/* ================= TIMELINE (ENHANCED ONLY VISUALLY) ================= */}
        <section className="py-24 bg-gradient-to-b from-white to-pink-50/30">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="text-4xl font-bold text-center mb-20">
              Professional{" "}
              <span className="text-pink-500">Milestones</span>
            </h2>

            <div className="relative">
              <div className="hidden md:block absolute left-1/2 top-0 h-full w-1 bg-gradient-to-b from-pink-300 via-purple-300 to-pink-300 -translate-x-1/2 opacity-40" />

              <div className="space-y-16">
                {timeline.map((item, i) => (
                  <div
                    key={i}
                    className={`relative flex ${
                      i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className="md:w-1/2 px-6">
                      <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-pink-100">
                        <span className="inline-block mb-3 px-4 py-1 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold text-sm">
                          {item.year}
                        </span>
                        <h3 className="text-2xl font-bold mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:flex absolute left-1/2 top-10 -translate-x-1/2 w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-400 shadow-xl items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= AWARDS (SAME CONTENT, BETTER INTERACTION) ================= */}
        <section className="py-24 bg-gradient-to-b from-pink-50/30 to-white">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="text-4xl font-bold text-center mb-16">
              Awards & <span className="text-pink-500">Recognition</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-10">
              <AwardCard
                icon={Trophy}
                title="Best Bridal Makeup Artist"
                color="from-yellow-400 to-orange-400"
              />
              <AwardCard
                icon={Award}
                title="Innovation in Makeup"
                color="from-pink-400 to-rose-400"
              />
              <AwardCard
                icon={Medal}
                title="Master Henna Artist"
                color="from-purple-400 to-indigo-400"
              />
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default About;

/* ================= HELPERS ================= */

const Stat = ({ value, label }: any) => (
  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100">
    <div className="text-3xl font-bold text-pink-600">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

const AwardCard = ({ icon: Icon, title, color }: any) => (
  <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-pink-100 text-center">
    <div
      className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform`}
    >
      <Icon className="w-10 h-10 text-white" />
    </div>
    <h3 className="text-xl font-bold">{title}</h3>
  </div>
);

const timeline = [
  {
    year: "2012",
    title: "Educational Foundation",
    description:
      "Graduated from London School of Makeup with distinction, mastering classical and contemporary techniques.",
  },
  {
    year: "2015",
    title: "Celebrity Breakthrough",
    description:
      "First collaboration with top Bollywood celebrities for major film promotions and red carpet events.",
  },
  {
    year: "2018",
    title: "Fashion Week Debut",
    description:
      "Led the makeup team for prestigious designers at India Fashion Week.",
  },
  {
    year: "2021",
    title: "International Recognition",
    description:
      "Featured in Vogue and Elle for innovative makeup techniques and creative vision.",
  },
];
