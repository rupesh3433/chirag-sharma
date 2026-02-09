export interface EventItem {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    attendees: string;
    poster: string;
    category: "current" | "upcoming" | "past";
    price?: string;
    rating?: number;
    badge?: string;
    duration?: string;
    date_from: string;
    date_to: string;
    time_from: string;
    time_to: string;
    location_coords?: { lat: number; lng: number };
    total_seats: number;
    price_details: Array<{
      name: string;
      price: number;
      description?: string;
      available_seats?: number;
    }>;
    gallery_images?: string[];
  }
  