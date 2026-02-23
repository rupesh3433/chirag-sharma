// ============================================================
// PORTFOLIO API SERVICE
// 
// ============================================================

import axios from 'axios';
import {
  PortfolioImage,
  PortfolioVideo,
  PortfolioCategory,
  PortfolioStats,
  PaginatedResponse,
} from '../types/portfolio';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// ── Auth interceptor (matches existing pattern) ──────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Image endpoints ──────────────────────────────────────────
const imagesApi = {
  getAll: (params: {
    category?: string;
    is_visible?: boolean;
    skip?: number;
    limit?: number;
  }) =>
    api.get<PaginatedResponse<PortfolioImage>>('/admin/portfolio/images', { params }),

  getById: (id: string) =>
    api.get<{ success: boolean; data: PortfolioImage }>(`/admin/portfolio/images/${id}`),

  upload: (formData: FormData) =>
    api.post<{ success: boolean; message: string; data: PortfolioImage }>(
      '/admin/portfolio/images',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  addByUrl: (formData: FormData) =>
    api.post<{ success: boolean; message: string; data: PortfolioImage }>(
      '/admin/portfolio/images/url',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  update: (id: string, formData: FormData) =>
    api.patch<{ success: boolean; message: string }>(
      `/admin/portfolio/images/${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  toggleVisibility: (id: string) =>
    api.patch<{ success: boolean; is_visible: boolean; message: string }>(
      `/admin/portfolio/images/${id}/toggle-visibility`
    ),

  delete: (id: string, deleteFromCloudinary = true) =>
    api.delete<{ success: boolean; message: string }>(
      `/admin/portfolio/images/${id}`,
      { params: { delete_from_cloudinary: deleteFromCloudinary } }
    ),

  bulkDelete: (ids: string[], deleteFromCloudinary = true) =>
    api.post<{ success: boolean; deleted_count: number; message: string }>(
      '/admin/portfolio/images/bulk-delete',
      ids,
      { params: { delete_from_cloudinary: deleteFromCloudinary } }
    ),

  reorder: (orderedIds: string[]) =>
    api.patch<{ success: boolean; message: string }>(
      '/admin/portfolio/images/reorder',
      orderedIds
    ),
};

// ── Video endpoints ──────────────────────────────────────────
const videosApi = {
  getAll: (params: {
    category?: string;
    is_visible?: boolean;
    skip?: number;
    limit?: number;
  }) =>
    api.get<PaginatedResponse<PortfolioVideo>>('/admin/portfolio/videos', { params }),

  getById: (id: string) =>
    api.get<{ success: boolean; data: PortfolioVideo }>(`/admin/portfolio/videos/${id}`),

  add: (formData: FormData) =>
    api.post<{ success: boolean; message: string; data: PortfolioVideo }>(
      '/admin/portfolio/videos',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  update: (id: string, formData: FormData) =>
    api.patch<{ success: boolean; message: string }>(
      `/admin/portfolio/videos/${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  toggleVisibility: (id: string) =>
    api.patch<{ success: boolean; is_visible: boolean; message: string }>(
      `/admin/portfolio/videos/${id}/toggle-visibility`
    ),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/admin/portfolio/videos/${id}`),

  bulkDelete: (ids: string[]) =>
    api.post<{ success: boolean; deleted_count: number; message: string }>(
      '/admin/portfolio/videos/bulk-delete',
      ids
    ),

  reorder: (orderedIds: string[]) =>
    api.patch<{ success: boolean; message: string }>(
      '/admin/portfolio/videos/reorder',
      orderedIds
    ),
};

// ── Category endpoints ───────────────────────────────────────
const categoriesApi = {
  getAll: () =>
    api.get<{ success: boolean; data: PortfolioCategory[] }>('/admin/portfolio/categories'),

  create: (formData: FormData) =>
    api.post<{ success: boolean; message: string; data: PortfolioCategory }>(
      '/admin/portfolio/categories',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  update: (id: string, formData: FormData) =>
    api.patch<{ success: boolean; message: string }>(
      `/admin/portfolio/categories/${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/admin/portfolio/categories/${id}`),

  reorder: (orderedIds: string[]) =>
    api.patch<{ success: boolean; message: string }>(
      '/admin/portfolio/categories/reorder',
      orderedIds
    ),
};

// ── Stats endpoint ───────────────────────────────────────────
const statsApi = {
  get: () =>
    api.get<{ success: boolean; data: PortfolioStats }>('/admin/portfolio/stats'),
};

// ── Named export (matches existing pattern) ──────────────────
export const portfolioApi = {
  images: imagesApi,
  videos: videosApi,
  categories: categoriesApi,
  stats: statsApi,
};