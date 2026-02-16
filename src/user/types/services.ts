// src/types/services.ts
// ============================================
// Domain types for makeup artist booking system
// ============================================

export interface Service {
  id: string;
  name: string;
  tagline?: string;
  images: string[];
  packages: Package[];
}

export interface Package {
  id: string;
  serviceId: string;
  name: string;
  price: number;
  features: string[];
}

export interface SelectedPackage {
  serviceId: string;
  packageId: string;
  packageName: string;
  price: number;
  quantity: 1; // fixed, reserved for future
}

export interface DiscountRule {
  minPackages: number;
  discountPercent: number;
}

export interface PriceBreakdown {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
}

export interface BookingFormData {
  services: Array<{
    serviceId: string;
    serviceName: string;
    packages: SelectedPackage[];
  }>;
  userDetails: {
    name: string;
    contact: string;
    eventDate: string;
    location: string;
    notes: string;
  };
  pricing: PriceBreakdown;
}

// ============================================
// Payment & Booking Status Types
// ============================================

export type BookingStatus = 
  | "pending" 
  | "approved" 
  | "confirmed" 
  | "completed" 
  | "cancelled";

export type PaymentStatus = 
  | "pending" 
  | "payment_pending" 
  | "paid" 
  | "failed" 
  | "refunded" 
  | null;

export interface PaymentInfo {
  order_id: string | null;
  payment_id: string | null;
  amount: number | null;
  currency: string | null;
  status: PaymentStatus;
  provider: "razorpay" | "khalti" | null;
  method: string | null;
  created_at: string | null;
  processed_at: string | null;
}

export interface BookingDetails {
  id: string;
  service: string;
  package: string;
  name: string;
  email: string;
  phone: string;
  phone_country: string;
  service_country: string;
  address: string;
  pincode: string;
  date: string;
  message?: string;
  status: BookingStatus;
  payment: PaymentInfo;
  created_at: string;
  updated_at: string;
}