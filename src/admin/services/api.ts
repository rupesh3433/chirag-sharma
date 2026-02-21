// src/services/api.ts

import axios, { AxiosError } from 'axios';
import {
  Booking,
  BookingSearchParams,
  BookingSearchResponse,
  BookingDetailResponse,
  StatusUpdateResponse,
  RefundResponse,
  PaymentHistoryResponse,
  PaymentAnalyticsResponse,
  Analytics,
  ServiceAnalytics,
  MonthlyData,
  Knowledge,
  Event,
  EventStatus,
  LoginResponse,
} from '@admin/types';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/* -------------------------------------------------------
   Axios instance
------------------------------------------------------- */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000,
});

/* -------------------------------------------------------
   Request Interceptor — attach JWT
------------------------------------------------------- */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* -------------------------------------------------------
   Response Interceptor — handle 401 + network errors
------------------------------------------------------- */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Request timeout - server took too long to respond. Please try again.',
        code: 'TIMEOUT',
        isTimeout: true,
      });
    }

    if (!error.response) {
      return Promise.reject({
        message: 'Network error - please check your internet connection.',
        code: 'NETWORK_ERROR',
        isNetworkError: true,
      });
    }

    const status = error.response?.status;
    const currentPath = window.location.pathname;

    const isAuthRoute =
      currentPath.startsWith('/admin/forgot-password') ||
      currentPath.startsWith('/admin/reset-password') ||
      currentPath.startsWith('/admin/login');

    if (status === 401 && !isAuthRoute) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }

    return Promise.reject(error);
  }
);

export default api;

/* =======================================================
   AUTH API
======================================================= */
export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/admin/login', { email, password }),

  verifyToken: () =>
    api.get('/admin/verify-token'),

  forgotPassword: (email: string) =>
    api.post('/admin/forgot-password', { email }),

  resetPassword: (token: string, new_password: string) =>
    api.post('/admin/reset-password', { token, new_password }),
};

/* =======================================================
   BOOKINGS API
======================================================= */
export const bookingsApi = {
  /**
   * Get all bookings with optional filtering
   */
  getAll: (params?: {
    status?: string;
    payment_status?: string;
    limit?: number;
    skip?: number;
  }) =>
    api.get<BookingSearchResponse>('/admin/bookings', { params }),

  /**
   * Get single booking details with payment information
   */
  getById: (id: string) =>
    api.get<BookingDetailResponse>(`/admin/bookings/${id}`),

  /**
   * Advanced search with multiple filters
   */
  search: (params: BookingSearchParams) =>
    api.post<BookingSearchResponse>('/admin/bookings/search', params),

  /**
   * Update booking status.
   *
   * When status = "approved", pass approvalData with:
   *   - payment_amount: number  (in paise/paisa — smallest unit)
   *   - payment_currency: "INR" | "NPR"
   *
   * Backend stores base amount + currency. No payment order is created yet.
   * A WhatsApp link is sent to the customer to select their preferred provider.
   * Backend auto-converts to both INR (Razorpay) and NPR (Khalti) amounts.
   *
   * For non-approval status changes (cancelled, completed), pass no approvalData.
   */
  updateStatus: (
    id: string,
    status: string,
    approvalData?: {
      payment_amount: number;       // in smallest unit (paise/paisa)
      payment_currency: 'INR' | 'NPR';
    }
  ) =>
    api.patch<StatusUpdateResponse>(
      `/admin/bookings/${id}/status`,
      {
        status,
        ...(approvalData ?? {}),   // spreads payment_amount + payment_currency into body
      }
    ),

  /**
   * Delete booking (only if unpaid)
   */
  delete: (id: string) =>
    api.delete<{ success: boolean; message: string; booking_id: string }>(
      `/admin/bookings/${id}`
    ),

  /**
   * Process refund for a paid booking.
   * Backend auto-detects provider from payment record (Razorpay or Khalti).
   * For Khalti bank refunds, pass mobile number.
   */
  refund: (
    id: string,
    amount?: number,
    reason?: string,
    mobile?: string
  ) =>
    api.post<RefundResponse>(`/admin/bookings/${id}/refund`, null, {
      params: {
        ...(amount !== undefined && { amount }),
        ...(reason && { reason }),
        ...(mobile && { mobile }),
      },
    }),

  /**
   * Get complete payment history for a booking (all providers)
   */
  getPaymentHistory: (id: string) =>
    api.get<PaymentHistoryResponse>(`/admin/bookings/${id}/payment-history`),

  /**
   * Get payment analytics.
   * Pass provider to filter by "razorpay" or "khalti".
   * Omit provider to get combined multi-provider analytics.
   */
  getPaymentAnalytics: (params?: {
    start_date?: string;
    end_date?: string;
    provider?: 'razorpay' | 'khalti';
  }) =>
    api.get<PaymentAnalyticsResponse>('/admin/bookings/payments/analytics', { params }),

  /**
   * Get bookings statistics overview
   */
  getStats: () =>
    api.get<{
      success: boolean;
      stats: {
        total_bookings: number;
        recent_bookings: number;
        status_breakdown: Record<string, number>;
        payment_breakdown: Record<string, number>;
      };
    }>('/admin/bookings/stats/overview'),
};

/* =======================================================
   ANALYTICS API
======================================================= */
export const analyticsApi = {
  getOverview: () =>
    api.get<Analytics>('/admin/analytics/overview'),

  getByService: () =>
    api.get<{ services: ServiceAnalytics[] }>('/admin/analytics/by-service'),

  getByMonth: () =>
    api.get<{ monthly_data: MonthlyData[] }>('/admin/analytics/by-month'),
};

/* =======================================================
   KNOWLEDGE BASE API
======================================================= */
export const knowledgeApi = {
  getAll: (params?: { language?: string; is_active?: boolean }) =>
    api.get<Knowledge[]>('/admin/knowledge', { params }),

  getById: (id: string) =>
    api.get<Knowledge>(`/admin/knowledge/${id}`),

  create: (data: Omit<Knowledge, '_id' | 'created_at' | 'updated_at'>) =>
    api.post('/admin/knowledge', data),

  update: (id: string, data: Partial<Knowledge>) =>
    api.patch(`/admin/knowledge/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/knowledge/${id}`),
};

/* =======================================================
   EVENTS API
======================================================= */
export const eventsApi = {
  uploadImage: (file: File, folder: string = 'events') => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{
      url: string;
      public_id: string;
      width: number;
      height: number;
      format: string;
    }>('/admin/events/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },

  deleteImage: (public_id: string) =>
    api.delete<{ success: boolean }>(`/admin/events/delete-image/${public_id}`),

  getAll: (params?: {
    status?: EventStatus;
    is_active?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  }) =>
    api.get<{
      events: Event[];
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    }>('/admin/events', { params }),

  getById: (id: string) => api.get<Event>(`/admin/events/${id}`),

  create: (data: FormData) =>
    api.post<{ message: string; event: Event }>('/admin/events', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }),

  updateWithFiles: async (id: string, formData: FormData) => {
    const token = localStorage.getItem('admin_token');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/events/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update event');
      }

      return response.json();
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - upload took too long. Please try again.');
      }
      throw error;
    }
  },

  update: (id: string, data: Partial<Event>) =>
    api.put<{ message: string; event: Event }>(`/admin/events/${id}`, data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/admin/events/${id}`),

  updateStatus: (id: string, status: EventStatus) =>
    api.patch<{ message: string }>(`/admin/events/${id}/status`, null, {
      params: { status },
    }),

  toggleActive: (id: string) =>
    api.patch<{ message: string; is_active: boolean }>(
      `/admin/events/${id}/toggle-active`
    ),

  uploadGalleryImages: (id: string, images: File[]) => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });
    return api.post<{ message: string; new_images: string[] }>(
      `/admin/events/${id}/upload-gallery`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      }
    );
  },

  deleteGalleryImage: (eventId: string, imageIndex: number) =>
    api.delete<{ message: string }>(
      `/admin/events/${eventId}/gallery/${imageIndex}`
    ),
};