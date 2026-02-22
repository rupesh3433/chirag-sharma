// src/user/UserApp.tsx
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
import PaymentPage from "./pages/PaymentPage";
import KhaltiCallbackPage from "./pages/KhaltiCallbackPage";
import BookingStatusPage from "./pages/BookingStatusPage";
import NotFound from "./pages/NotFound";

// ✅ GLOBAL CHATBOT
import Chatbot from "./components/chatbot/Chatbot";
import ScrollToTop from "./components/ScrollToTop";
import UserLayout from "./components/layout/UserLayout";
import EventsPage from "./pages/EventsPage";
import KhaltiEventCallbackPage from "./pages/KhaltiEventCallbackPage";

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

            {/* Payment flow:
                1. User lands here after admin approves (from WhatsApp link)
                   URL: /payment?booking_id=xxx
                2. User selects provider → Razorpay opens in modal OR Khalti redirects out
            */}
            <Route path="payment-options" element={<PaymentPage />} />

            {/* Khalti return URL — Khalti redirects back here after payment attempt
                URL: /payment/khalti-callback?booking_id=xxx&pidx=...&status=Completed&...
                Configure KHALTI_RETURN_URL in backend as: {FRONTEND_URL}/payment/khalti-callback
            */}
            <Route path="payment/khalti-callback" element={<KhaltiCallbackPage />} />

            <Route
          path="/payment/khalti-event-callback"
          element={<KhaltiEventCallbackPage />}
        />

            <Route path="booking-status/:bookingId" element={<BookingStatusPage />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default UserApp;