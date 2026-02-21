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
  | "partial_refund"
  | null;

export type PaymentProvider = "razorpay" | "khalti" | null;

export interface PaymentInfo {
  order_id: string | null;
  pidx: string | null;          // Khalti payment identifier
  payment_id: string | null;
  amount: number | null;
  currency: string | null;
  status: PaymentStatus;
  provider: PaymentProvider;
  method: string | null;
  payment_url: string | null;   // Khalti redirect URL
  created_at: string | null;
  processed_at: string | null;
}

/**
 * A single payment option returned from GET /bookings/{id}.
 *
 * `amount` is the CONVERTED amount in the provider's native currency
 * (already computed by backend). Frontend must use this directly —
 * never re-convert or use booking.payment_amount for display.
 *
 * Example:
 *   booking.payment_amount = 160000 (NPR paisa, set by admin)
 *   PaymentOption { provider: "razorpay", currency: "INR", amount: 191000 }  ← paise
 *   PaymentOption { provider: "khalti",   currency: "NPR", amount: 160000 }  ← paisa
 */
export interface PaymentOption {
  provider: "razorpay" | "khalti";
  /** Provider's native currency code: "INR" for Razorpay, "NPR" for Khalti */
  currency: string;
  /**
   * Amount in provider's smallest unit (paise for INR, paisa for NPR).
   * Already converted from admin's base amount by the backend.
   * Use this value for display and payment initiation — never recalculate.
   */
  amount: number;
  label?: string;
  description?: string;
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
  /** Internal payment tracking status */
  payment_status: PaymentStatus;
  payment_provider: PaymentProvider;
  payment_order_id: string | null;
  payment_pidx: string | null;
  payment_id: string | null;
  /**
   * Base amount in smallest unit (paise or paisa), set by admin at approval.
   * This is the AUTHORITATIVE amount in admin's chosen currency.
   * Do NOT use this for provider-specific display — use PaymentOption.amount instead.
   */
  payment_amount: number | null;
  /** Base currency set by admin: "INR" or "NPR" */
  payment_currency: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Full shape of GET /bookings/{id} response.
 *
 * CRITICAL: payment_options is TOP-LEVEL — not inside booking.
 * Frontend must read response.payment_options, not response.booking.payment_options.
 *
 * Each payment_option has its own converted amount and currency:
 *   razorpay → INR (paise)
 *   khalti   → NPR (paisa)
 */
export interface GetBookingStatusResponse {
  success: boolean;
  booking: BookingDetails;
  /** Available payment providers with pre-converted amounts. TOP-LEVEL field. */
  payment_options: PaymentOption[];
}

// ============================================
// Khalti Callback Query Params
// ============================================

export interface KhaltiCallbackParams {
  pidx: string;
  status?: string;         // Untrusted — backend ignores for authorization
  transaction_id?: string;
  tidx?: string;
  amount?: string;
  total_amount?: string;
  mobile?: string;
  purchase_order_id?: string;
  purchase_order_name?: string;
}