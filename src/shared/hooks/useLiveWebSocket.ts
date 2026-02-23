// components/analytics/useLiveWebSocket.ts

import { useEffect, useRef, useState } from "react";

const WS_BASE =
  (import.meta.env.VITE_WS_URL ??
    import.meta.env.VITE_API_URL?.replace(/^http/, "ws") ??
    "") as string;

export function useLiveWebSocket() {
  const [liveCount, setLiveCount] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 🚫 Never connect on admin routes
    if (window.location.pathname.startsWith("/admin")) {
      return;
    }

    let destroyed = false;

    const clearPing = () => {
      if (pingRef.current) {
        clearInterval(pingRef.current);
        pingRef.current = null;
      }
    };

    const clearReconnect = () => {
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
    };

    const connect = () => {
      if (destroyed || !WS_BASE) return;

      try {
        const ws = new WebSocket(`${WS_BASE}/ws/live`);
        wsRef.current = ws;

        ws.onopen = () => {
          clearPing();
          pingRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send("ping");
            }
          }, 15000);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.type === "live_count" && typeof data.count === "number") {
              setLiveCount(data.count);
            }
          } catch {}
        };

        ws.onclose = () => {
          clearPing();
          wsRef.current = null;
          if (!destroyed) {
            clearReconnect();
            reconnectRef.current = setTimeout(connect, 3000);
          }
        };

        ws.onerror = () => ws.close();
      } catch {
        if (!destroyed) {
          clearReconnect();
          reconnectRef.current = setTimeout(connect, 5000);
        }
      }
    };

    connect();

    return () => {
      destroyed = true;
      clearPing();
      clearReconnect();
      wsRef.current?.close();
    };
  }, []);

  return liveCount;
}