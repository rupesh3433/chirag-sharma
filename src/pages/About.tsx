import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Award,
  Trophy,
  Medal,
  Sparkles,
  Heart,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Check,
  Send,
  Star,
  Users,
  Palette,
  Zap,
  Target,
} from "lucide-react";
import { toast } from "sonner";

/* ================= COMPONENT ================= */

const About = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      toast.success("Your message has been sent! We'll get back to you soon.");
      setFormSubmitted(true);
      setIsSubmitting(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: "",
      });
      setTimeout(() => setFormSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-grow">
        {/* ================= HERO ================= */}
        <section className="pt-32 pb-20 bg-gradient-to-br from-chirag-pink/10 via-background to-chirag-peach/10 relative overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-chirag-pink/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-chirag-peach/20 rounded-full blur-3xl" />

          <div className="container-custom text-center max-w-4xl mx-auto relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-2xl bg-gradient-to-br from-chirag-pink to-pink-200 border border-chirag-pink/40 shadow-lg">
              <Sparkles className="w-10 h-10 text-chirag-darkPurple" />
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6">
              About <span className="header-gradient">Chirag Sharma</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
              A journey of passion, artistry, and dedication to transforming
              beauty into an unforgettable experience.
            </p>

            <div className="mt-14 flex flex-wrap justify-center gap-6 ">
              <Badge icon={Star} label="5.0 Rating" />
              <Badge icon={Users} label="1000+ Clients" />
              <Badge icon={Award} label="50+ Awards" />
            </div>
          </div>
        </section>

        {/* ================= BIO ================= */}
        <section className="py-24 bg-background">
          <div className="container-custom grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-5xl font-bold">
                The <span className="header-gradient">Journey</span> Begins
              </h2>

              <p className="border-l-4 border-chirag-pink pl-6 font-medium text-enhanced-contrast">
                My beauty journey started over <b>9+ years ago</b> with a deep
                fascination for colors, creativity, and transformation.
              </p>

              <p className="border-l-4 border-chirag-peach pl-6 font-medium text-enhanced-contrast">
                After professional training and collaborations with industry
                leaders and celebrities, I developed a signature style blending
                timeless elegance with modern trends.
              </p>

              <p className="border-l-4 border-chirag-pink pl-6 font-medium text-enhanced-contrast">
                Today, I specialize in bridal, editorial, and creative makeup
                artistry, complemented by intricate henna designs.
              </p>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <Stat value="9+" label="Years Experience" icon={Target} />
                <Stat value="1K+" label="Happy Clients" icon={Users} />
                <Stat value="50+" label="Awards Won" icon={Trophy} />
              </div>
            </div>

            <div className="relative max-w-md mx-auto">
              <div className="absolute -inset-8 rounded-3xl bg-chirag-pink/25 blur-3xl animate-image-glow" />
              <img
                src="/photos/chiragicon2.JPG"
                alt="Chirag Sharma"
                className="relative rounded-3xl shadow-2xl border-4 border-white object-cover aspect-[3/4]"
              />
              <div className="absolute -bottom-6 -right-6 bg-white px-6 py-4 rounded-2xl shadow-xl border">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-chirag-pink fill-chirag-pink" />
                  <span className="font-bold">Certified Artist</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PHILOSOPHY ================= */}
        <section className="py-24 bg-muted/40">
          <div className="container-custom max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold">
                My <span className="header-gradient">Philosophy</span>
              </h2>
              <p className="text-muted-foreground text-xl mt-4">
                Core values that guide every brushstroke
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <PhilosophyCard icon={Palette} title="Artistry First" />
              <PhilosophyCard icon={Heart} title="Client Connection" />
              <PhilosophyCard icon={Zap} title="Innovation" />
            </div>
          </div>
        </section>

        {/* ================= PROFESSIONAL MILESTONES ================= */}
        <section className="py-24 bg-background">
          <div className="container-custom max-w-6xl">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-bold">
                Professional <span className="header-gradient">Milestones</span>
              </h2>
              <p className="text-muted-foreground text-xl mt-4">
                A decade of dedication, growth, and artistic excellence.
              </p>
            </div>

            <div className="relative">
              <div className="hidden md:block absolute left-1/2 top-0 h-full w-1 bg-chirag-pink/40 -translate-x-1/2 rounded-full" />

              <div className="space-y-20">
                {timeline.map((item, i) => (
                  <div
                    key={i}
                    className={`relative flex ${
                      i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className="md:w-1/2 px-6">
                      <div className="service-card hover-lift">
                        <span className="inline-block mb-4 px-4 py-2 rounded-full bg-chirag-pink text-chirag-darkPurple font-bold">
                          {item.year}
                        </span>
                        <h3 className="text-2xl font-bold mb-2">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground font-medium">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:flex absolute left-1/2 top-10 -translate-x-1/2 w-12 h-12 rounded-2xl bg-chirag-pink shadow-xl items-center justify-center ring-4 ring-background">
                      <div className="w-3 h-3 rounded-full bg-chirag-darkPurple" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= GET IN TOUCH ================= */}
        <section className="py-24 bg-muted/40">
          <div className="container-custom max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold">
                Get in <span className="header-gradient">Touch</span>
              </h2>
              <p className="text-muted-foreground text-xl mt-4">
                Have questions or want to book a consultation?
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <ContactCard icon={Mail} title="Email" value="jinni.chirag.mua101@gmail.com" href="mailto:jinni.chirag.mua101@gmail.com" />
              <ContactCard icon={Phone} title="Call" value="+977 9707613340" href="tel:+9779707613340" />
              <ContactCard icon={MessageSquare} title="WhatsApp" value="Message Us" href="https://wa.me/9779707613340" />
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="testimonial-card">
                <h3 className="text-3xl font-bold mb-6 flex items-center">
                  <Send className="mr-3 text-chirag-pink" />
                  Send Message
                </h3>

                {formSubmitted && (
                  <div className="bg-green-50 border border-green-300 p-4 rounded-xl mb-6 flex items-center">
                    <Check className="mr-2 text-green-600" />
                    Message sent successfully!
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input className="form-input" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
                  <input className="form-input" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                  <textarea className="form-input" rows={4} name="message" placeholder="Message" value={formData.message} onChange={handleChange} required />
                  <button className="button-primary w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>

              <div className="testimonial-card">
                <h3 className="text-3xl font-bold mb-4 flex items-center">
                  <MapPin className="mr-3 text-chirag-pink" />
                  Visit Studio
                </h3>
                <p className="text-muted-foreground mb-4">
                  Lahan, Siraha District, Madhesh Province, Nepal
                </p>
                <iframe
                  src="https://www.google.com/maps?q=Lahan,Nepal&output=embed"
                  width="100%"
                  height="320"
                  style={{ border: 0 }}
                  loading="lazy"
                />
              </div>
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

const Badge = ({ icon: Icon, label }: any) => (
  <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow border">
    <Icon className="text-chirag-pink" />
    <span className="font-bold">{label}</span>
  </div>
);

const Stat = ({ value, label, icon: Icon }: any) => (
  <div className="text-center p-6 bg-white rounded-2xl shadow-md border hover-lift">
    <Icon className="w-8 h-8 mx-auto mb-2 text-chirag-pink" />
    <div className="text-4xl font-bold">{value}</div>
    <div className="text-sm font-semibold">{label}</div>
  </div>
);

const PhilosophyCard = ({ icon: Icon, title }: any) => (
  <div className="service-card text-center hover-lift">
    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-chirag-pink flex items-center justify-center shadow">
      <Icon className="w-10 h-10 text-chirag-darkPurple" />
    </div>
    <h3 className="text-2xl font-bold">{title}</h3>
  </div>
);

const ContactCard = ({ icon: Icon, title, value, href }: any) => (
  <a href={href} className="service-card text-center hover-lift block">
    <Icon className="mx-auto mb-4  text-chirag-gray" size={32} />
    <h4 className="font-bold">{title}</h4>
    <p className="font-medium">{value}</p>
  </a>
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
