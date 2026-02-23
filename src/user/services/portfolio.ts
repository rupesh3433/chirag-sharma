// services/portfolio.ts
//
// calls /portfolio/images and /portfolio/videos



import type { APIResponse, ImageItem, VideoItem, CategoryItem } from "../types/portfolio";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

async function safeFetch<T>(
  url: string,
  signal?: AbortSignal
): Promise<APIResponse<T>> {
  let response: Response;

  try {
    response = await fetch(url, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }
    throw new Error("Network error. Please check your connection.");
  }

  if (!response.ok) {
    throw new Error(`Server error: ${response.status} ${response.statusText}`);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new Error("Invalid response from server.");
  }

  if (
    typeof json !== "object" ||
    json === null ||
    !("data" in json) ||
    !Array.isArray((json as Record<string, unknown>).data)
  ) {
    throw new Error("Unexpected response shape from server.");
  }

  return json as APIResponse<T>;
}

export async function fetchCategories(
  signal?: AbortSignal
): Promise<APIResponse<CategoryItem>> {
  const url = `${BASE_URL}/portfolio/categories`;
  return safeFetch<CategoryItem>(url, signal);
}

export async function fetchImages(
  signal: AbortSignal,
  category?: string
): Promise<APIResponse<ImageItem>> {
  const url = new URL(`${BASE_URL}/portfolio/images`);
  if (category && category !== "all") {
    url.searchParams.set("category", category);
  }
  return safeFetch<ImageItem>(url.toString(), signal);
}

export async function fetchVideos(
  signal: AbortSignal,
  category?: string
): Promise<APIResponse<VideoItem>> {
  const url = new URL(`${BASE_URL}/portfolio/videos`);
  // "video" tab means show all videos regardless of category
  if (category && category !== "all" && category !== "video") {
    url.searchParams.set("category", category);
  }
  return safeFetch<VideoItem>(url.toString(), signal);
}