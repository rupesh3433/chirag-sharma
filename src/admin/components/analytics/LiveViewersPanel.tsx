// ================================================================
// LiveViewersPanel.tsx — WebSocket-based live viewer panel
// Backend: WebSocket /ws/live → { type: "live_count", count: N }
//          REST fallback: GET /admin/analytics/live-viewers
// ================================================================

import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Radio, Users, MousePointer2, RefreshCw } from "lucide-react";
import api from "../../services/api";
import { P, CHART_COLORS, fmtDur } from "./constants";
import { TipIcon, Empty } from "./ui";

const WS_BASE = (import.meta.env.VITE_WS_URL ?? import.meta.env.VITE_API_URL?.replace(/^http/, "ws") ?? "") as string;

// ── WebSocket live count hook ─────────────────────────────────────
function useLiveCount(fallback: number) {
  const [count, setCount] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let dead = false;

    function connect() {
      if (dead) return;
      try {
        const ws = new WebSocket(`${WS_BASE}/ws/live`);
        wsRef.current = ws;

        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.type === "live_count") setCount(data.count);
          } catch {}
        };

        ws.onopen = () => {
          pingRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) ws.send("ping");
          }, 15_000);
        };

        ws.onclose = () => {
          if (pingRef.current) clearInterval(pingRef.current);
          if (!dead) setTimeout(connect, 3_000);
        };

        ws.onerror = () => ws.close();
      } catch {
        if (!dead) setTimeout(connect, 5_000);
      }
    }

    connect();

    return () => {
      dead = true;
      if (pingRef.current) clearInterval(pingRef.current);
      wsRef.current?.close();
    };
  }, []);

  return count !== null ? count : fallback;
}

// ── Main panel ───────────────────────────────────────────────────
export function LiveViewersPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-live"],
    queryFn: () => api.get("/admin/analytics/live-viewers").then((r) => r.data),
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });

  const restLive = data?.live_viewers ?? 0;
  const live = useLiveCount(restLive);
  const hour = data?.unique_last_hour ?? 0;
  const pages = data?.live_pages ?? [];
  const lat = data?.latest_page;
  const latD = data?.latest_duration ?? 0;

  return (
    <div className="rg g-live">

      {/* ── LIVE COUNTER ─────────────────────────────────────── */}
      <div className="stat-card" style={{ "--stripe": P.teal } as any}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16, flexWrap: "wrap" }}>
          <div className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: P.teal }} />
          <span style={{ fontSize: 9.5, fontWeight: 800, color: P.teal, textTransform: "uppercase", letterSpacing: ".1em" }}>
            Live Right Now
          </span>
          <TipIcon text="Real-time via WebSocket. Updates instantly when viewers join/leave." />
        </div>

        {/* Icon — absolute only on wider screens, inline on mobile */}
        <div
          className="live-stat-icon"
          style={{
            position: "absolute", top: 18, right: 16,
            width: 40, height: 40, borderRadius: 12,
            background: `${P.teal}14`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Radio style={{ width: 17, height: 17, color: P.teal }} />
        </div>

        <p className="mono num-live countup" style={{ fontWeight: 700, color: "#111827", lineHeight: 1, margin: "0 0 7px" }}>
          {live}
        </p>
        <p style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 16 }}>
          Real-time WebSocket viewers
        </p>

        {lat ? (
          <div style={{
            padding: "11px 13px", background: "#F4F6FB",
            borderRadius: 11, border: "1px solid #E5E9F4", marginBottom: 10,
          }}>
            <p style={{ fontSize: 9.5, color: "#9CA3AF", margin: "0 0 4px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
              Most recent session
            </p>
            <p style={{ fontSize: 13, color: "#111827", margin: 0, fontWeight: 600, wordBreak: "break-word" }}>
              📍 {lat}
            </p>
            <p style={{ fontSize: 11, color: "#9CA3AF", margin: "3px 0 0" }}>
              {fmtDur(latD)} on site
            </p>
          </div>
        ) : live === 0 ? (
          <div style={{
            padding: "11px 13px", background: "#F4F6FB",
            borderRadius: 11, border: "1px solid #E5E9F4",
          }}>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>
              No active sessions. Updates in real-time.
            </p>
          </div>
        ) : null}

        <p style={{ fontSize: 9.5, color: "#C4CCDF", marginTop: 12, display: "flex", alignItems: "center", gap: 5 }}>
          <RefreshCw style={{ width: 9, height: 9 }} /> WebSocket · instant updates
        </p>
      </div>

      {/* ── UNIQUE LAST HOUR ──────────────────────────────────── */}
      <div className="stat-card" style={{ "--stripe": P.sky } as any}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 9.5, fontWeight: 800, color: P.sky, textTransform: "uppercase", letterSpacing: ".08em" }}>
            Unique Sessions · Rolling 60 Min
          </span>
          <TipIcon text="Distinct sessions started in last 60 min. Returning after 30 min gap = new session." />
        </div>

        <div
          className="live-stat-icon"
          style={{
            position: "absolute", top: 18, right: 16,
            width: 40, height: 40, borderRadius: 12,
            background: `${P.sky}14`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Users style={{ width: 17, height: 17, color: P.sky }} />
        </div>

        {isLoading ? (
          <div className="skel" style={{ height: 58, width: 70 }} />
        ) : (
          <p className="mono num-live countup" style={{ fontWeight: 700, color: "#111827", lineHeight: 1, margin: "0 0 7px" }}>
            {hour}
          </p>
        )}
        <p style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 16 }}>
          Unique sessions in last hour
        </p>

        <div style={{
          padding: "11px 13px", background: "#F4F6FB",
          borderRadius: 11, border: "1px solid #E5E9F4",
        }}>
          {[
            { dot: P.sky,    text: "Same visitor counted once per session" },
            { dot: P.teal,   text: "Returns after 30 min = new session" },
            { dot: P.violet, text: "Weekly/monthly allow re-count" },
          ].map(({ dot, text }) => (
            <div key={text} className="live-info-row">
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: dot, flexShrink: 0,
                display: "inline-block", marginTop: 4,
              }} />
              <span style={{ fontSize: 11.5, color: "#6B7280", lineHeight: 1.5 }}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── ACTIVE PAGES ─────────────────────────────────────── */}
      <div className="card" style={{ padding: "20px 16px" }}>
        <p style={{
          fontSize: 9.5, fontWeight: 800, color: "#9CA3AF",
          textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 16,
        }}>
          Active Pages Right Now
        </p>

        {pages.length === 0 ? (
          <Empty icon={MousePointer2} msg="No active sessions at the moment" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {pages.map((p: any, i: number) => (
              <div
                key={i}
                className="active-page-row"
                style={{
                  background: i === 0 ? `${P.teal}0C` : "#F9FAFB",
                  border: `1px solid ${i === 0 ? `${P.teal}28` : "#F0F2F8"}`,
                }}
              >
                <div className="active-page-label">
                  <div style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: CHART_COLORS[i % CHART_COLORS.length],
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
                    {p.page}
                  </span>
                </div>
                <span className="mono" style={{
                  fontSize: 15, fontWeight: 700, color: "#111827",
                  flexShrink: 0, marginLeft: 8,
                }}>
                  {p.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}