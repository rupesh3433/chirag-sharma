// types/portfolio.ts


export type LoadingState = "idle" | "loading" | "success" | "error";

// "all" and "video" are always present; rest are dynamic slugs from DB
export type Tab = string;

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  order: number;
}

export interface ImageItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  createdAt: string;
}

export interface VideoItem {
  id: string;
  title: string;
  youtubeUrl: string;
  thumbnail?: string;
  category: string;
  createdAt: string;
}

export interface APIResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
  total?: number;
}