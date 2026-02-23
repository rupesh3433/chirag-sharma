// ============================================================
// PORTFOLIO TYPES
// ============================================================

export interface PortfolioImage {
    id: string;
    title: string;
    category: string;
    cloudinary_public_id: string | null;
    url: string;
    width: number | null;
    height: number | null;
    format: string | null;
    bytes: number | null;
    is_visible: boolean;
    order: number;
    created_at: string;
    updated_at?: string;
    created_by?: string;
    updated_by?: string;
  }
  
  export interface PortfolioVideo {
    id: string;
    title: string;
    description: string | null;
    category: string;
    youtube_url: string;
    youtube_id: string;
    embed_url: string;
    thumbnail_url: string;
    is_visible: boolean;
    order: number;
    created_at: string;
    updated_at?: string;
    created_by?: string;
    updated_by?: string;
  }
  
  export interface PortfolioCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    order: number;
    created_at: string;
    image_count?: number;
    video_count?: number;
  }
  
  export interface PortfolioStats {
    images: {
      total: number;
      visible: number;
      hidden: number;
      by_category: { category: string; count: number }[];
    };
    videos: {
      total: number;
      visible: number;
      hidden: number;
      by_category: { category: string; count: number }[];
    };
    categories: {
      total: number;
    };
  }
  
  export type PortfolioTab = 'images' | 'videos' | 'categories';
  
  export type ViewMode = 'grid' | 'list';
  
  export interface PaginatedResponse<T> {
    success: boolean;
    total: number;
    skip: number;
    limit: number;
    data: T[];
  }
  
  export interface AddVideoForm {
    youtube_url: string;
    title: string;
    description: string;
    category: string;
    is_visible: boolean;
  }
  
  export interface AddImageUrlForm {
    url: string;
    title: string;
    category: string;
    is_visible: boolean;
  }
  
  export interface CategoryForm {
    name: string;
    slug: string;
    description: string;
  }