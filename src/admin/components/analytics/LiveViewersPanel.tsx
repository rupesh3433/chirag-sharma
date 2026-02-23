// ================================================================
// LiveViewersPanel.tsx — REST-only live viewer panel
// Backend: GET /admin/analytics/live-viewers  (polls every 30s)
//          GET /admin/analytics/live-hourly   (polls every 30s)
//
// Admin uses REST ONLY. WebSocket is for public visitors only.
// ================================================================

import { useQuery } from "@tanstack/react-query";
import { Radio, Users, MousePointer2, RefreshCw } from "lucide-react";
import api from "../../services/api";
import { P, CHART_COLORS, fmtDur } from "./constants";
import { TipIcon, Empty, Skel } from "./ui";

export function LiveViewersPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-live"],
    queryFn: () => api.get("/admin/analytics/live-viewers").then((r) => r.data),
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });

  const { data: hourlyData } = useQuery({
    queryKey: ["analytics-live-hourly"],
    queryFn: () => api.get("/admin/analytics/live-hourly").then((r) => r.data),
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });

  // REST-based live count only — no WebSocket in admin
  const live           = data?.live_viewers     ?? 0;
  const hour           = data?.unique_last_hour ?? 0;
  const pages          = data?.live_pages       ?? [];
  const lat            = data?.latest_page;
  const latD           = data?.latest_duration  ?? 0;
  const uniqueThisHour = hourlyData?.unique_this_hour ?? hour;

  return (
    <div className="rg g-live">

      {/* ── LIVE COUNTER ─────────────────────────────────────── */}
      <div className="stat-card" style={{ "--stripe": P.teal } as any}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16, flexWrap: "wrap" }}>
          <div className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: P.teal }} />
          <span style={{ fontSize: 9.5, fontWeight: 800, color: P.teal, textTransform: "uppercase", letterSpacing: ".1em" }}>
            Live Right Now
          </span>
          <TipIcon text="Sessions qualified via WebSocket (≥ 8s connected). Multi-tab safe — same visitor = 1 count. Admin reads via REST, not WebSocket." />
        </div>

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

        {isLoading ? (
          <div className="skel" style={{ height: 52, width: 70 }} />
        ) : (
          <p className="mono num-live countup" style={{ fontWeight: 700, color: "#111827", lineHeight: 1, margin: "0 0 7px" }}>
            {live}
          </p>
        )}
        <p style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 16 }}>
          Qualified sessions (≥ 8s connected)
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
              No active sessions. Polls every 30s.
            </p>
          </div>
        ) : null}

        <p style={{ fontSize: 9.5, color: "#C4CCDF", marginTop: 12, display: "flex", alignItems: "center", gap: 5 }}>
          <RefreshCw style={{ width: 9, height: 9 }} /> REST poll · 30s refresh
        </p>
      </div>

      {/* ── UNIQUE LAST HOUR ──────────────────────────────────── */}
      <div className="stat-card" style={{ "--stripe": P.sky } as any}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 9.5, fontWeight: 800, color: P.sky, textTransform: "uppercase", letterSpacing: ".08em" }}>
            Unique Sessions · This Hour
          </span>
          <TipIcon text="Unique sessions that qualified (≥ 8s) in the current UTC hour. Stored in live_hourly MongoDB collection. Reconnect-safe — same session not double-counted." />
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
            {uniqueThisHour}
          </p>
        )}
        <p style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 16 }}>
          Unique qualified sessions this hour
        </p>

        <div style={{
          padding: "11px 13px", background: "#F4F6FB",
          borderRadius: 11, border: "1px solid #E5E9F4",
        }}>
          {[
            { dot: P.sky,    text: "Must stay ≥ 8 seconds to qualify" },
            { dot: P.teal,   text: "Multi-tab: same session = 1 count" },
            { dot: P.violet, text: "Reconnect within hour = not re-counted" },
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