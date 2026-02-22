import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Ticket,
  Copy,
  Check,
  Home,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

type Status = "verifying" | "success" | "failed";

interface TicketData {
  ticket_code: string;
  event_title: string;
  booking_id: string;
  status: string;
}

const KhaltiEventCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("verifying");
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const pidx = searchParams.get("pidx");
      const bookingId = searchParams.get("booking_id");
      const khaltiStatus = searchParams.get("status");
      const transactionId = searchParams.get("transaction_id");
      const tidx = searchParams.get("tidx");
      const amount = searchParams.get("amount");
      const totalAmount = searchParams.get("total_amount");
      const mobile = searchParams.get("mobile");
      const purchaseOrderId = searchParams.get("purchase_order_id");
      const purchaseOrderName = searchParams.get("purchase_order_name");

      if (!pidx || !bookingId) {
        setErrorMsg("Invalid callback — missing required parameters.");
        setStatus("failed");
        return;
      }

      try {
        const res = await fetch(
          `${API_BASE}/public/events/bookings/khalti/verify-payment`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              booking_id: bookingId,
              pidx,
              status: khaltiStatus,
              transaction_id: transactionId,
              tidx,
              amount: amount ? parseInt(amount) : undefined,
              total_amount: totalAmount ? parseInt(totalAmount) : undefined,
              mobile,
              purchase_order_id: purchaseOrderId,
              purchase_order_name: purchaseOrderName,
            }),
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Payment verification failed");

        // Use verify response directly — avoids a second fetch with a potentially
        // corrupted bookingId (Khalti appends its own query params to the return URL
        // which can mangle the booking_id variable if not URL-decoded correctly).
        setTicket({
          ticket_code: data.ticket_code,
          event_title: data.event_title || "Event",
          booking_id: data.booking_id || bookingId,
          status: data.status || "paid",
        });
        setStatus("success");
      } catch (e: any) {
        setErrorMsg(e.message || "Payment verification failed. Please contact support.");
        setStatus("failed");
      }
    };

    verify();
  }, [searchParams]);

  function handleCopy() {
    if (!ticket) return;
    navigator.clipboard.writeText(ticket.ticket_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            status === "success"
              ? "radial-gradient(circle at 50% 40%, rgba(34,197,94,0.06) 0%, transparent 60%)"
              : status === "failed"
              ? "radial-gradient(circle at 50% 40%, rgba(239,68,68,0.06) 0%, transparent 60%)"
              : "radial-gradient(circle at 50% 40%, rgba(236,72,153,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Verifying State */}
        {status === "verifying" && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mx-auto mb-5">
              <Loader2 size={32} className="text-pink-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Verifying Payment
            </h1>
            <p className="text-gray-400">
              Please wait while we confirm your Khalti payment...
            </p>
            <div className="mt-6 flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-pink-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Success State */}
        {status === "success" && ticket && (
          <div>
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={36} className="text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Booking Confirmed!
              </h1>
              <p className="text-gray-400 text-sm">
                Your Khalti payment was successful. Your ticket is ready.
              </p>
            </div>

            {/* Ticket Card */}
            <div
              className="rounded-2xl overflow-hidden border border-pink-500/20 mb-6 relative"
              style={{
                background:
                  "linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(168,85,247,0.08) 100%)",
                boxShadow: "0 0 40px rgba(236,72,153,0.1)",
              }}
            >
              <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-white/10" />
              <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-950" />
              <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-950" />

              <div className="px-6 py-5">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket size={14} className="text-pink-400" />
                  <span className="text-pink-400 text-xs font-bold uppercase tracking-widest">
                    Event Ticket
                  </span>
                </div>
                <h3 className="text-white font-bold text-lg leading-tight">
                  {ticket.event_title}
                </h3>
                <p className="text-gray-500 text-sm mt-0.5">
                  Booking #{ticket.booking_id.slice(-8).toUpperCase()}
                </p>
              </div>

              <div className="border-t border-dashed border-white/10 px-6 py-5">
                <p className="text-gray-500 text-xs mb-2">Ticket Code</p>
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono text-2xl font-bold tracking-widest flex-1"
                    style={{
                      background: "linear-gradient(90deg, #ec4899, #a855f7)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {ticket.ticket_code}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-90 border border-white/10"
                  >
                    {copied ? (
                      <Check size={16} className="text-green-400" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
                <p className="text-gray-600 text-xs mt-2">
                  Show this code at the event entry. Also sent to your WhatsApp.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/events")}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-all active:scale-95"
            >
              Back to Events
            </button>
          </div>
        )}

        {/* Failed State */}
        {status === "failed" && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <XCircle size={36} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Payment Failed
            </h1>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              {errorMsg ||
                "We couldn't verify your payment. If money was deducted, please contact our support team."}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/events")}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Home size={18} />
                Back to Events
              </button>
              <p className="text-gray-600 text-xs">
                If you were charged, contact support with your payment reference.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KhaltiEventCallbackPage;