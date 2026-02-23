// ================================================================
// Analytics.tsx — Main analytics page
// ================================================================

import { useState, useRef, useEffect } from "react";
import { BarChart2, Users, Calendar, Ticket } from "lucide-react";
import { useSidebar } from "@shared/components/ui/sidebar";
import { InjectCSS } from "@admin/components/analytics/ui";
import { P } from "@admin/components/analytics/constants";
import { OverviewTab }        from "@admin/components/analytics/OverviewTab";
import { VisitorsTab }        from "@admin/components/analytics/VisitorsTab";
import { ServiceBookingsTab } from "@admin/components/analytics/ServiceBookingsTab";
import { EventBookingsTab }   from "@admin/components/analytics/EventBookingsTab";

const TABS = [
  { key: "overview",  label: "Overview",        short: "Overview",  icon: BarChart2, color: P.coral  },
  { key: "visitors",  label: "Visitors",         short: "Visitors",  icon: Users,     color: P.teal   },
  { key: "services",  label: "Service Bookings", short: "Services",  icon: Calendar,  color: P.coral  },
  { key: "events",    label: "Event Bookings",   short: "Events",    icon: Ticket,    color: P.violet },
] as const;
type TabKey = (typeof TABS)[number]["key"];

// AdminHeader height = h-16 = 64px, sticky top-0.
// Our bar sits at top:64px fixed. The admin layout's <main> content
// area already has padding-top equal to the admin header height
// (ShadCN SidebarInset adds this automatically), so the spacer only
// needs to push content down by the analytics bar's own height.
const ADMIN_H = 64;

const AnalyticsPage = () => {
  const [tab, setTab] = useState<TabKey>("overview");
  const { state, isMobile } = useSidebar();
  const collapsed = state === "collapsed";

  // Measure the analytics bar's real rendered height
  const barRef = useRef<HTMLDivElement>(null);
  const [barH, setBarH] = useState(88);
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBarH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Left offset to avoid overlapping the sidebar.
  // ShadCN sets --sidebar-width / --sidebar-width-icon on :root.
  const sidebarLeft = isMobile
    ? "0px"
    : collapsed
      ? "var(--sidebar-width-icon, 3rem)"
      : "var(--sidebar-width, 16rem)";

  return (
    <>
      <InjectCSS />

      <style>{`
        /* Fixed analytics sub-header
           Mirrors AdminHeader exactly:
             bg-card/50 → hsl(var(--card) / 0.5)
             backdrop-blur-sm → blur(8px)
             border-b border-border → 1px solid hsl(var(--border))
        */
        .an-fixed {
          position: fixed;
          top: ${ADMIN_H}px;
          left: var(--an-left, 0px);
          right: 0;
          z-index: 4;
          background: hsl(var(--card) / 0.5);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-bottom: 1px solid hsl(var(--border));
          transition: left 200ms ease;
        }

        /* Title + badge row */
        .an-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0 8px;
          gap: 10px;
          flex-wrap: wrap;
        }

        /* Live badge */
        .an-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 99px;
          flex-shrink: 0;
          white-space: nowrap;
        }

        /* Scrollable tab strip — bleeds to edges of the fixed bar.
           Negative margins MUST match .an-wrap padding exactly at each breakpoint
           so the tab underline aligns with the content edge. */
        .an-tab-strip {
          display: flex;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          border-bottom: 1px solid hsl(var(--border));
          /* Default: matches .an-wrap padding 28px */
          margin-left: -28px;
          margin-right: -28px;
          padding-left: 28px;
          padding-right: 28px;
        }
        .an-tab-strip::-webkit-scrollbar { display: none; }

        /* Full labels by default */
        .tab-label-full  { display: inline; }
        .tab-label-short { display: none; }

        /* Tablet: .an-wrap uses 20px padding */
        @media (max-width: 1024px) {
          .an-tab-strip { margin-left:-20px; margin-right:-20px; padding-left:20px; padding-right:20px; }
        }

        /* Mobile: .an-wrap uses 14px padding */
        @media (max-width: 768px) {
          .tab-label-full  { display: none; }
          .tab-label-short { display: inline; }
          .an-title-row  { padding: 7px 0 5px; gap: 6px; }
          .an-title-h1   { font-size: 15px !important; }
          .an-title-sub  { font-size: 9px !important; }
          .an-badge      { padding: 4px 9px !important; }
          .an-badge span { font-size: 8.5px !important; }
          .an-tab-strip  { margin-left:-14px; margin-right:-14px; padding-left:14px; padding-right:14px; }
        }

        /* Small mobile: .an-wrap uses 10px padding */
        @media (max-width: 400px) {
          .an-title-h1  { font-size: 13px !important; }
          .an-title-sub { display: none; }
          .an-tab-strip { margin-left:-10px; margin-right:-10px; padding-left:10px; padding-right:10px; }
        }
      `}</style>

      <div
        className="an"
        style={{ "--an-left": sidebarLeft } as React.CSSProperties}
      >
        {/* ── Fixed analytics bar ── */}
        <div className="an-fixed" ref={barRef}>
          <div className="an-wrap">

            <div className="an-title-row">
              <div style={{ minWidth: 0, flex: 1 }}>
                <h1
                  className="an-title-h1"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontWeight: 700, color: "#111827", margin: 0,
                    fontStyle: "italic", fontSize: "clamp(14px, 2.5vw, 24px)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}
                >
                  Analytics
                  <span style={{
                    fontStyle: "normal", fontFamily: "'DM Sans', system-ui",
                    fontWeight: 800, color: "#C4CCDF", marginLeft: 8, fontSize: "0.7em",
                  }}>
                    / Dashboard
                  </span>
                </h1>
                <p
                  className="an-title-sub"
                  style={{
                    color: "#9CA3AF", margin: "2px 0 0", fontWeight: 500,
                    fontSize: "clamp(9px, 1.3vw, 11px)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}
                >
                  WebSocket live · Atomic counters · Session analytics · Bounce-filtered
                </p>
              </div>

              <div
                className="an-badge"
                style={{ background: `${P.teal}0E`, border: `1.5px solid ${P.teal}30` }}
              >
                <div className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: P.teal }} />
                <span style={{
                  fontSize: "clamp(8px, 1.2vw, 10.5px)", fontWeight: 800,
                  color: P.teal, letterSpacing: ".08em", textTransform: "uppercase",
                }}>
                  Live · Auto-refreshes
                </span>
              </div>
            </div>

            <div className="an-tab-strip">
              {TABS.map(({ key, label, short, icon: Icon, color }) => (
                <button
                  key={key}
                  className={`tab-btn${tab === key ? " on" : ""}`}
                  style={{ "--tc": color } as React.CSSProperties}
                  onClick={() => setTab(key)}
                >
                  <Icon style={{ width: 13, height: 13, flexShrink: 0 }} />
                  <span className="tab-label-full">{label}</span>
                  <span className="tab-label-short">{short}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/*
          Spacer = exactly the analytics bar's measured height.
          The admin layout's SidebarInset already offsets for the
          AdminHeader, so we only need to compensate for our bar.
        */}
        <div style={{ height: barH }} aria-hidden="true" />

        {/* Tab content */}
        <div className="an-content-clip">
          <div className="an-content">
            {tab === "overview"  && <OverviewTab />}
            {tab === "visitors"  && <VisitorsTab />}
            {tab === "services"  && <ServiceBookingsTab />}
            {tab === "events"    && <EventBookingsTab />}
          </div>
        </div>

        <div style={{ height: 80 }} aria-hidden="true" />
      </div>
    </>
  );
};

export default AnalyticsPage;