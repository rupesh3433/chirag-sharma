// ================================================================
// TabShell.tsx — Full-area loader + "No data found" state
//
// Wrap any tab's content with <TabShell loading={} timedOut={}>
// Each tab controls its own loading/timedOut flags independently.
// ================================================================

import { Loader2, ServerOff } from "lucide-react";
import { P } from "./constants";

interface TabShellProps {
  loading: boolean;
  timedOut: boolean;
  accentColor?: string;
  children: React.ReactNode;
}

export function TabShell({
  loading,
  timedOut,
  accentColor = P.coral,
  children,
}: TabShellProps) {
  if (loading) {
    return (
      <div style={centreWrap}>
        <div style={spinnerRing(accentColor)}>
          <Loader2
            style={{
              width: 36,
              height: 36,
              color: accentColor,
              animation: "tabSpinAnim 0.9s linear infinite",
            }}
          />
        </div>
        <p style={msgStyle("#9CA3AF")}>Fetching data…</p>
        <p style={{ ...msgStyle("#C4CCDF"), fontSize: 11, marginTop: 4 }}>
          If nothing appears within a minute, we'll let you know.
        </p>
        <style>{`
          @keyframes tabSpinAnim {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (timedOut) {
    return (
      <div style={centreWrap}>
        <div style={spinnerRing("#E5E9F4")}>
          <ServerOff style={{ width: 34, height: 34, color: "#C4CCDF" }} />
        </div>
        <p style={msgStyle("#374151")}>No data found</p>
        <p style={{ ...msgStyle("#9CA3AF"), fontSize: 12, marginTop: 4 }}>
          The server didn't respond in time. Check your connection or try
          refreshing.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

// ── helpers ──────────────────────────────────────────────────────

const centreWrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 340,
  gap: 10,
  padding: "40px 24px",
  textAlign: "center",
};

const spinnerRing = (color: string): React.CSSProperties => ({
  width: 76,
  height: 76,
  borderRadius: "50%",
  background: `${color}14`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 6,
});

const msgStyle = (color: string): React.CSSProperties => ({
  margin: 0,
  fontSize: 14,
  fontWeight: 700,
  color,
  fontFamily: "'DM Sans', system-ui, sans-serif",
});