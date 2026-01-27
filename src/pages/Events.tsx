import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Events = () => {
  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-32 px-4 flex items-center justify-center">
        <div className="text-center max-w-xl">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-chirag-darkPurple mb-4">
            Events
          </h1>
          <p className="text-gray-600 text-lg">
            This page is under construction.
            <br />
            Upcoming events, workshops, and collaborations will appear here soon.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Events;
