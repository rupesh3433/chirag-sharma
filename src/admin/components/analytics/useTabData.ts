// ================================================================
// useTabData.ts — Per-tab loading + 60-second timeout hook
//
// Usage:
//   const { data, loading, timedOut } = useTabData(queryKey, fetcher)
//
// - loading  : true while query is in-flight AND under 60s
// - timedOut : true if 60s pass with no successful data
// - data     : the resolved value (or undefined)
// ================================================================

import { useEffect, useRef, useState } from "react";
import { useQuery, type QueryFunction } from "@tanstack/react-query";

const TIMEOUT_MS = 60_000; // 1 minute

export function useTabData<T>(
  queryKey: readonly unknown[],
  fetcher: QueryFunction<T>,
) {
  const { data, isLoading, isError, dataUpdatedAt } = useQuery<T>({
    queryKey,
    queryFn: fetcher,
    // Don't auto-retry aggressively — we want the timeout to fire cleanly
    retry: 2,
    retryDelay: 3_000,
  });

  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start the 60-second clock as soon as this hook mounts (i.e. tab opened).
  // If data arrives before the timer fires, clear it.
  useEffect(() => {
    setTimedOut(false);

    timerRef.current = setTimeout(() => {
      setTimedOut(true);
    }, TIMEOUT_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // Re-run if the query key identity changes (tab switch forces new key)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryKey)]);

  // Data arrived — cancel the timeout
  useEffect(() => {
    if (dataUpdatedAt && dataUpdatedAt > 0 && timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      setTimedOut(false);
    }
  }, [dataUpdatedAt]);

  return {
    data,
    loading: isLoading && !timedOut,
    timedOut: timedOut && !data,
  };
}