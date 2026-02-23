import { useState, useEffect, useCallback } from "react";
import { fetchVideos } from "../../services/portfolio";
import type { VideoItem, LoadingState } from "../../types/portfolio";

interface UseVideosResult {
  videos: VideoItem[];
  loadingState: LoadingState;
  error: string | null;
  refetch: () => void;
}

export function useVideos(category?: string): UseVideosResult {
  const [videos, setVideos] = useState<VideoItem[]>([]);
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
        const res = await fetchVideos(controller.signal, category);
        if (!controller.signal.aborted) {
          setVideos(res.data);
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

  return { videos, loadingState, error, refetch };
}