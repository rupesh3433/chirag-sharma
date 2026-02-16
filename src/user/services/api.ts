// src/services/api.ts
// ============================================
// API Service Layer for JinniChirag Backend
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
  booking_id?: string; // For OTP resend
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

export interface PaymentStatus {
  success: boolean;
  payment: {
    booking_id: string;
    provider: string;
    order_id: string;
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
  payment_order_id: string | null;
  payment_id: string | null;
  payment_amount: number | null;
  payment_currency: string | null;
  created_at: string;
  updated_at: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// ============================================
// Error Handler
// ============================================

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "APIError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "An error occurred",
    }));
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
  /**
   * Request booking - Send OTP
   */
  requestBooking: async (data: BookingRequest): Promise<OTPResponse> => {
    const response = await fetch(`${API_BASE}/bookings/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<OTPResponse>(response);
  },

  /**
   * Verify OTP and create booking
   */
  verifyOTP: async (data: OTPVerifyRequest): Promise<BookingResponse> => {
    const response = await fetch(`${API_BASE}/bookings/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<BookingResponse>(response);
  },

  /**
   * Get booking status
   */
  getBookingStatus: async (bookingId: string): Promise<{ success: boolean; booking: Booking }> => {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}`);
    return handleResponse(response);
  },

  /**
   * Get payment status for booking
   */
  getPaymentStatus: async (bookingId: string): Promise<PaymentStatus> => {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}/payment-status`);
    return handleResponse(response);
  },

  /**
   * Cancel booking
   */
  cancelBooking: async (bookingId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason || "User cancelled" }),
    });
    return handleResponse(response);
  },
};

// ============================================
// Payment APIs (Razorpay)
// ============================================

export const paymentAPI = {
  /**
   * Verify payment signature (frontend verification)
   */
  verifyPayment: async (data: {
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

  /**
   * Mark payment as failed
   */
  markPaymentFailed: async (data: {
    order_id: string;
    reason: string;
    error_code?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE}/bookings/razorpay/payment-failed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// ============================================
// Razorpay Integration Helper
// ============================================

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const openRazorpayCheckout = (options: RazorpayOptions) => {
  const rzp = new (window as any).Razorpay(options);
  rzp.open();
};

// ============================================
// Export API Error for error handling
// ============================================

export { APIError };