// ─────────────────────────────────────────────────────────────────────────────
// src/user/services/eventBookingApi.ts
//
// API service for event booking flow:
//   Step 1: requestEventBooking  → POST /public/events/bookings/request
//   Step 2: verifyEventOtp       → POST /public/events/bookings/verify-otp
//   Step 3: getEventBooking      → GET  /public/events/bookings/{id}
//   Step 3b: createEventPayment  → POST /public/events/bookings/{id}/create-payment
//   Step 4a: verifyRazorpay      → POST /public/events/bookings/razorpay/verify-payment
//   Step 4b: verifyKhalti        → POST /public/events/bookings/khalti/verify-payment
//   Failure: markPaymentFailed   → POST /public/events/bookings/payment-failed
//   Status:  getBookingStatus    → GET  /public/events/bookings/{id}/status
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL;

// ── Types ────────────────────────────────────────────────────────────────────

export interface EventBookingRequestPayload {
  event_id: string;
  price_category_name: string;
  name: string;
  email: string;
  phone: string; // with country code e.g. +919876543210
  phone_country: string;
  message?: string;
}

export interface EventOtpRequestResponse {
  success: boolean;
  booking_id: string; // temporary session token
  message: string;
  expires_in: number;
}

export interface EventOtpVerifyResponse {
  success: boolean;
  message: string;
  booking_id: string; // real MongoDB booking _id
  status: string;
  base_amount: number;
  base_currency: string;
}

export interface EventPaymentOption {
  provider: "razorpay" | "khalti";
  currency: string;
  amount: number;
  amount_display: string;
  label: string;
  description: string;
}

export interface EventBookingDetailResponse {
  success: boolean;
  booking: {
    _id: string;
    event_id: string;
    event_title: string;
    price_category_name: string;
    price_category_price: number;
    base_amount: number;
    base_currency: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    ticket_code?: string;
  };
  payment_options: EventPaymentOption[];
}

export interface EventRazorpayOrderResponse {
  success: boolean;
  provider: "razorpay";
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  booking_id: string;
  receipt: string;
}

export interface EventKhaltiOrderResponse {
  success: boolean;
  provider: "khalti";
  pidx: string;
  payment_url: string;
  purchase_order_id: string;
  amount: number;
  currency: string;
  booking_id: string;
  expires_at?: string;
  expires_in?: number;
}

export type EventCreatePaymentResponse =
  | EventRazorpayOrderResponse
  | EventKhaltiOrderResponse;

export interface EventRazorpayVerifyPayload {
  booking_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface EventKhaltiVerifyPayload {
  booking_id: string;
  pidx: string;
  status?: string;
  transaction_id?: string;
  tidx?: string;
  amount?: number;
  total_amount?: number;
  mobile?: string;
  purchase_order_id?: string;
  purchase_order_name?: string;
}

export interface EventVerifyResponse {
  success: boolean;
  message: string;
  booking_id: string;
  ticket_code: string;
  status: string;
}

export interface EventBookingStatusResponse {
  success: boolean;
  booking_id: string;
  status: string;
  ticket_code?: string;
  event_title?: string;
  payment_provider?: string;
}

// ── Error ─────────────────────────────────────────────────────────────────────

export class EventAPIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "EventAPIError";
  }
}

async function handle<T = unknown>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new EventAPIError(res.status, err.detail || err.message || "Error");
  }
  return res.json();
}

// ── API ───────────────────────────────────────────────────────────────────────

export const eventBookingApi = {
  /**
   * Step 1: Send OTP to user's WhatsApp.
   * Returns a temporary booking_id (session token).
   */
  requestBooking: (
    payload: EventBookingRequestPayload
  ): Promise<EventOtpRequestResponse> =>
    fetch(`${API_BASE}/public/events/bookings/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle<EventOtpRequestResponse>),

  /**
   * Step 2: Verify OTP.
   * Returns real booking_id stored in MongoDB.
   */
  verifyOtp: (
    booking_id: string,
    otp: string
  ): Promise<EventOtpVerifyResponse> =>
    fetch(`${API_BASE}/public/events/bookings/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id, otp }),
    }).then(handle<EventOtpVerifyResponse>),

  /**
   * Step 3: Get booking details + payment options.
   */
  getBooking: (bookingId: string): Promise<EventBookingDetailResponse> =>
    fetch(`${API_BASE}/public/events/bookings/${bookingId}`).then(
      handle<EventBookingDetailResponse>
    ),

  /**
   * Step 3b: Create payment order.
   * provider: "razorpay" | "khalti"
   */
  createPayment: (
    bookingId: string,
    provider: "razorpay" | "khalti"
  ): Promise<EventCreatePaymentResponse> =>
    fetch(`${API_BASE}/public/events/bookings/${bookingId}/create-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    }).then(handle<EventCreatePaymentResponse>),

  /**
   * Step 4a: Verify Razorpay payment (HMAC signature + API check).
   */
  verifyRazorpay: (
    payload: EventRazorpayVerifyPayload
  ): Promise<EventVerifyResponse> =>
    fetch(`${API_BASE}/public/events/bookings/razorpay/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle<EventVerifyResponse>),

  /**
   * Step 4b: Verify Khalti payment via Lookup API.
   * Called from the Khalti return_url callback page.
   * Only pidx is trusted — backend ignores all other params for auth decisions.
   */
  verifyKhalti: (
    payload: EventKhaltiVerifyPayload
  ): Promise<EventVerifyResponse> =>
    fetch(`${API_BASE}/public/events/bookings/khalti/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle<EventVerifyResponse>),

  /**
   * Notify backend of payment failure / cancellation.
   */
  markPaymentFailed: (
    bookingId: string,
    reason: string,
    provider: "razorpay" | "khalti" = "razorpay"
  ): Promise<{ success: boolean; message: string }> =>
    fetch(`${API_BASE}/public/events/bookings/payment-failed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: bookingId, reason, provider }),
    }).then(handle<{ success: boolean; message: string }>),

  /**
   * Poll booking status (used after payment redirect).
   */
  getStatus: (bookingId: string): Promise<EventBookingStatusResponse> =>
    fetch(`${API_BASE}/public/events/bookings/${bookingId}/status`).then(
      handle<EventBookingStatusResponse>
    ),
};