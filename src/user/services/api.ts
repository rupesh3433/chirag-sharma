// src/user/services/api.ts
// ============================================
// API Service Layer for JinniChirag Backend
// Multi-Provider Payment: Razorpay (INR) + Khalti (NPR)
// ============================================

const API_BASE = import.meta.env.VITE_API_URL;

// ============================================
// Types
// ============================================

export interface BookingRequest {
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
  booking_id?: string;
}

export interface OTPVerifyRequest {
  booking_id: string;
  otp: string;
}

export interface BookingResponse {
  success: boolean;
  booking_id: string;
  message: string;
  status?: string;
}

export interface OTPResponse {
  success: boolean;
  booking_id: string;
  message: string;
  expires_in: number;
}

// ----------------------------------------
// PaymentOption — returned TOP-LEVEL in GET /bookings/{id}.
//
// `amount` is already converted by the backend to the provider's
// native currency. Frontend must NEVER recalculate or re-convert.
// Use option.amount and option.currency for display — not booking.payment_amount.
// ----------------------------------------
export interface PaymentOption {
  provider: "razorpay" | "khalti";
  /** Provider's native currency: "INR" for Razorpay, "NPR" for Khalti */
  currency: string;
  /**
   * Amount in provider's smallest unit (paise / paisa).
   * Pre-converted by backend. Use this directly for display and payment.
   */
  amount: number;
  label?: string;
  description?: string;
}

export interface PaymentStatus {
  success: boolean;
  payment: {
    booking_id: string;
    provider: string;
    order_id: string;
    pidx: string | null;
    payment_id: string | null;
    amount: number;
    currency: string;
    method: string | null;
    status: string;
    created_at: string;
    processed_at: string | null;
  } | null;
  message?: string;
}

// ----------------------------------------
// Booking — shape of the booking object inside API response.
// Note: payment_options is NOT on this object — it is TOP-LEVEL.
// ----------------------------------------
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
  status: string;
  payment_status: string | null;
  payment_provider: string | null;
  payment_order_id: string | null;
  payment_pidx: string | null;
  payment_id: string | null;
  /**
   * Admin-set base amount in smallest unit.
   * Do NOT use this for provider-specific display — use PaymentOption.amount.
   */
  payment_amount: number | null;
  /** Admin-set base currency: "INR" or "NPR" */
  payment_currency: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------
// GetBookingStatusResponse — full shape of GET /bookings/{id}.
// payment_options is TOP-LEVEL, not inside booking.
// ----------------------------------------
export interface GetBookingStatusResponse {
  success: boolean;
  booking: Booking;
  /** Available payment providers. TOP-LEVEL — not inside booking. */
  payment_options: PaymentOption[];
}

// ----------------------------------------
// Razorpay
// ----------------------------------------

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Flat Razorpay order response from POST /bookings/{id}/create-payment.
 * Backend returns this directly — no nested payment_data wrapper.
 */
export interface RazorpayOrderResponse {
  success: boolean;
  provider: "razorpay";
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  booking_id: string;
  receipt: string;
}

/**
 * Flat Khalti order response from POST /bookings/{id}/create-payment.
 * Backend returns this directly — no nested payment_data wrapper.
 */
export interface KhaltiOrderResponse {
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

export type CreatePaymentResponse = RazorpayOrderResponse | KhaltiOrderResponse;

/**
 * Khalti verify request.
 * Only `pidx` is required — backend ignores all other fields for auth decisions.
 * The remaining fields are passed for audit logging purposes only.
 */
export interface KhaltiVerifyRequest {
  pidx: string;
  status?: string;           // Untrusted — backend ignores for authorization
  transaction_id?: string;
  tidx?: string;
  amount?: number;
  total_amount?: number;
  mobile?: string;
  purchase_order_id?: string;
  purchase_order_name?: string;
}

// ============================================
// Error Handler
// ============================================

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "APIError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "An error occurred" }));
    throw new APIError(
      response.status,
      error.detail || error.message || "Request failed"
    );
  }
  return response.json();
}

// ============================================
// Booking APIs
// ============================================

export const bookingAPI = {
  requestBooking: async (data: BookingRequest): Promise<OTPResponse> => {
    const response = await fetch(`${API_BASE}/bookings/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<OTPResponse>(response);
  },

  verifyOTP: async (data: OTPVerifyRequest): Promise<BookingResponse> => {
    const response = await fetch(`${API_BASE}/bookings/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<BookingResponse>(response);
  },

  /**
   * GET /bookings/{id}
   *
   * Returns { success, booking, payment_options }
   *
   * CRITICAL: payment_options is TOP-LEVEL — NOT inside booking.
   * Each option has its own pre-converted amount and currency.
   * Frontend must use option.amount and option.currency for display.
   */
  getBookingStatus: async (bookingId: string): Promise<GetBookingStatusResponse> => {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}`);
    return handleResponse<GetBookingStatusResponse>(response);
  },

  getPaymentStatus: async (bookingId: string): Promise<PaymentStatus> => {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}/payment-status`);
    return handleResponse<PaymentStatus>(response);
  },

  cancelBooking: async (
    bookingId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason || "User cancelled" }),
    });
    return handleResponse(response);
  },
};

// ============================================
// Payment APIs — Multi-Provider
// ============================================

export const paymentAPI = {
  /**
   * POST /bookings/{id}/create-payment
   * Body: { provider: "razorpay" | "khalti" }
   *
   * Backend reads the admin-set base amount, converts to provider currency,
   * and returns a FLAT response. No nested payment_data — use response directly.
   *
   * Razorpay response fields: order_id, amount, currency, key_id, receipt
   * Khalti response fields:   pidx, payment_url, purchase_order_id, expires_at
   */
  createPayment: async (
    bookingId: string,
    provider: "razorpay" | "khalti"
  ): Promise<CreatePaymentResponse> => {
    const response = await fetch(
      `${API_BASE}/bookings/${bookingId}/create-payment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      }
    );
    // Backend returns a flat response — use directly, no normalization needed.
    return handleResponse<CreatePaymentResponse>(response);
  },

  // ------------------------------------------
  // RAZORPAY
  // ------------------------------------------

  verifyRazorpayPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE}/bookings/razorpay/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  markRazorpayFailed: async (data: {
    order_id: string;
    reason: string;
    error_code?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE}/bookings/payment-failed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, provider: "razorpay" }),
    });
    return handleResponse(response);
  },

  // ------------------------------------------
  // KHALTI
  // ------------------------------------------

  /**
   * POST /bookings/khalti/verify-payment
   *
   * Forwards callback params to backend. Backend calls Khalti Lookup API
   * internally — all params except `pidx` are untrusted metadata.
   */
  verifyKhaltiPayment: async (
    data: KhaltiVerifyRequest
  ): Promise<{
    success: boolean;
    message: string;
    action?: string;
    booking_id?: string;
    transaction_id?: string;
  }> => {
    const response = await fetch(`${API_BASE}/bookings/khalti/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  markKhaltiFailed: async (data: {
    order_id: string;
    reason: string;
    error_code?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE}/bookings/payment-failed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, provider: "khalti" }),
    });
    return handleResponse(response);
  },

  // ------------------------------------------
  // DEPRECATED ALIASES — kept for backward compat
  // ------------------------------------------

  /** @deprecated Use verifyRazorpayPayment */
  verifyPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<{ success: boolean; message: string }> => {
    return paymentAPI.verifyRazorpayPayment(data);
  },

  /** @deprecated Use markRazorpayFailed */
  markPaymentFailed: async (data: {
    order_id: string;
    reason: string;
    error_code?: string;
  }): Promise<{ success: boolean; message: string }> => {
    return paymentAPI.markRazorpayFailed(data);
  },
};

// ============================================
// Razorpay Integration Helpers
// ============================================

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const openRazorpayCheckout = (options: RazorpayOptions): void => {
  const rzp = new (window as any).Razorpay(options);
  rzp.open();
};