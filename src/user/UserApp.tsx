import "./userindex.css";
import "./UserApp.css";
// ------------------------------

import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@shared/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import About from "./pages/AboutPage";
import Portfolio from "./pages/PortfolioPage";
import Services from "./pages/ServicesPage";
import Book from "./pages/BookPage";
import NotFound from "./pages/NotFound";

// ✅ GLOBAL CHATBOT
import Chatbot from "./components/chatbot/Chatbot";
import ScrollToTop from "./components/ScrollToTop";
import UserLayout from "./components/layout/UserLayout";
import EventsPage from "./pages/EventsPage";
const queryClient = new QueryClient();

const UserApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <ScrollToTop />
        <Chatbot />

        <Routes>
          <Route element={<UserLayout />}>
            <Route index element={<Index />} />
            <Route path="services" element={<Services />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="book" element={<Book />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default UserApp;
