// PortfolioPage.tsx
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SocialMediaPage from "../components/socialmedia/SocialMedia";

import Header from "../components/portfolio/Header";
import TabsController from "../components/portfolio/TabsController";
import VideoSection from "../components/portfolio/VideoSection";
import ImageGrid from "../components/portfolio/ImageGrid";

import type { Tab } from "../types/portfolio";

const PortfolioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("all");

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Header />

      <section className="py-10 bg-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <TabsController activeTab={activeTab} setActiveTab={setActiveTab} />
          <VideoSection activeTab={activeTab} />
          <ImageGrid activeTab={activeTab} />
        </div>
      </section>

      <SocialMediaPage />
      <Footer />
    </div>
  );
};

export default PortfolioPage;