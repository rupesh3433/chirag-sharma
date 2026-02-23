// components/portfolio/useImages.ts

import { useState, useEffect, useCallback } from "react";
import { fetchImages } from "../../services/portfolio";
import type { ImageItem, LoadingState } from "../../types/portfolio";

interface UseImagesResult {
  images: ImageItem[];
  loadingState: LoadingState;
  error: string | null;
  refetch: () => void;
}

export function useImages(category?: string): UseImagesResult {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const refetch = useCallback(() => {
    setFetchKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoadingState("loading");
      setError(null);

      try {
        const res = await fetchImages(controller.signal, category);
        if (!controller.signal.aborted) {
          setImages(res.data);
          setLoadingState("success");
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unknown error occurred.");
        setLoadingState("error");
      }
    };

    load();

    return () => {
      controller.abort();
    };
  }, [category, fetchKey]);

  return { images, loadingState, error, refetch };
}