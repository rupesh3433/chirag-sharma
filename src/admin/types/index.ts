// ==========================================================
// ADMIN TYPES
// ==========================================================

export interface Admin {
  email: string;
  role: string;
}

// ==========================================================
// BOOKING & PAYMENT STATUS ENUMS
// ==========================================================

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
  | "partial_refund"
  | null;

export type PaymentProvider = "razorpay" | "khalti" | null;

// ==========================================================
// PAYMENT DETAILS TYPE
// ==========================================================

export interface PaymentDetails {
  _id: string;
  booking_id: string;
  provider: "razorpay";
  order_id: string;
  payment_id: string | null;
  amount: number;
  currency: string;
  method?: string | null;
  status: PaymentStatus;
  fee?: number;
  tax?: number;
  amount_refunded?: number;
  verified_via_api?: boolean;
  fraud_flag?: boolean;
  failure_reason?: string;
  failure_code?: string;
  failed_at?: string | null;
  refunds?: RefundRecord[];
  created_at: string;
  processed_at?: string | null;
  updated_at?: string | null;
}

export interface RefundRecord {
  refund_id: string;
  amount: number;
  status: string;
  created_at: string;
}

// ==========================================================
// BOOKING TYPE (UPDATED)
// ==========================================================

export interface Booking {
  _id: string;

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

  otp_verified: boolean;

  status: BookingStatus;

  // 🔥 Payment fields
  payment_status: PaymentStatus;
  payment_provider?: PaymentProvider;
  payment_order_id?: string | null;
  payment_id?: string | null;
  payment_amount?: number | null;
  payment_currency?: string | null;
  payment_method?: string | null;
  payment_completed_at?: string | null;

  cancellation_reason?: string;
  cancelled_by?: string;
  cancelled_at?: string;

  created_at: string;
  updated_at?: string;
  updated_by?: string;

  // Admin-only populated field
  payment_details?: PaymentDetails;
}

// ==========================================================
// BOOKING SEARCH PARAMS
// ==========================================================

export interface BookingSearchParams {
  search?: string;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  date_from?: string;
  date_to?: string;
  limit?: number;
  skip?: number;
}

// ==========================================================
// ANALYTICS TYPES
// ==========================================================

export interface Analytics {
  total_bookings: number;
  pending_bookings: number;
  approved_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;

  total_revenue?: number;
  total_transactions?: number;
  total_refunded?: number;
  net_revenue?: number;

  otp_pending?: number;
  recent_bookings_7_days?: number;
  today_bookings?: number;
}

export interface ServiceAnalytics {
  service: string;
  count: number;
}

export interface MonthlyData {
  year: number;
  month: number;
  count: number;
}

// ==========================================================
// AUTH TYPES
// ==========================================================

export interface LoginResponse {
  access_token: string;
  token_type: string;
  email: string;
  role: string;
}

// ==========================================================
// KNOWLEDGE TYPES
// ==========================================================

export interface Knowledge {
  _id: string;
  title: string;
  content: string;
  language: "en" | "ne" | "hi" | "mr";
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

// ==========================================================
// EVENT TYPES
// ==========================================================

export interface PriceCategory {
  name: string;
  price: number;
  description?: string;
  available_seats?: number;
}

export type EventStatus =
  | "draft"
  | "published"
  | "cancelled"
  | "completed";

export interface Event {
  _id: string;
  title: string;
  bio: string;
  date_from: string;
  date_to: string;
  time_from: string;
  time_to: string;
  location: string;
  location_coords: {
    lat: number;
    lng: number;
  };
  total_seats: number;
  price_details: PriceCategory[];
  main_poster_url: string;
  main_poster_public_id?: string;
  gallery_images: string[];
  gallery_public_ids?: string[];
  is_active: boolean;
  status: EventStatus;
  created_at: string;
  updated_at?: string;
  created_by: string;
  updated_by?: string;
}

// ==========================================================
// EVENT DTO TYPES
// ==========================================================

export interface CreateEventDto {
  title: string;
  bio: string;
  date_from: string;
  date_to: string;
  time_from: string;
  time_to: string;
  location: string;
  location_coords: {
    lat: number;
    lng: number;
  };
  total_seats: number;
  price_details: PriceCategory[];
  is_active?: boolean;
  status?: EventStatus;
}

export interface UpdateEventDto {
  title?: string;
  bio?: string;
  date_from?: string;
  date_to?: string;
  time_from?: string;
  time_to?: string;
  location?: string;
  location_coords?: {
    lat: number;
    lng: number;
  };
  total_seats?: number;
  price_details?: PriceCategory[];
  is_active?: boolean;
  status?: EventStatus;
  gallery_images?: string[];
}

// ==========================================================
// API RESPONSE TYPES
// ==========================================================

export interface BookingSearchResponse {
  success: boolean;
  bookings: Booking[];
  total: number;
}

export interface BookingDetailResponse {
  success: boolean;
  booking: Booking;
}

export interface StatusUpdateResponse {
  success: boolean;
  message: string;
  booking_id: string;
  old_status: BookingStatus;
  new_status: BookingStatus;
}

export interface RefundResponse {
  success: boolean;
  refund: {
    refund_id: string;
    payment_id: string;
    amount_refunded: number;
    total_refunded: number;
    status: PaymentStatus;
  };
}

export interface PaymentHistoryResponse {
  success: boolean;
  booking_id: string;
  payments: PaymentDetails[];
  count: number;
}

export interface PaymentAnalytics {
  total_revenue: number;
  total_transactions: number;
  total_refunded: number;
  net_revenue: number;
  total_fees: number;
  total_tax: number;
  method_breakdown: Record<string, number>;
  status_breakdown: Record<string, number>;
  average_transaction: number;
}

export interface PaymentAnalyticsResponse {
  success: boolean;
  analytics: PaymentAnalytics;
}

// ==========================================================
// FORM TYPES
// ==========================================================

export interface ApprovalFormData {
  payment_amount: number; // in paise
}

export interface RefundFormData {
  amount?: number; // in paise, undefined = full refund
  reason: string;
}

export interface CancelFormData {
  reason: string;
}