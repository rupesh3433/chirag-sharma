// src/user/pages/KhaltiCallbackPage.tsx
// ============================================================
// Khalti Payment Callback Handler
//
// Khalti redirects users here after a payment attempt.
// URL format (set as return_url in backend):
//   /payment/khalti-callback?booking_id=xxx&pidx=...&status=...&...
//
// Security Model:
//   - Frontend NEVER interprets callback params for payment decisions
//   - Only `pidx` is required to call the backend verify endpoint
//   - Backend calls Khalti Lookup API as the sole source of truth
//   - All status decisions (paid / failed / pending) are made by backend
//   - All other params (status, transaction_id, amount, etc.) are passed
//     as untrusted metadata for backend audit logging only
// ============================================================

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { paymentAPI, APIError } from "@user/services/api";

type VerifyState = "verifying" | "success" | "failed";

export default function KhaltiCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [state, setState] = useState<VerifyState>("verifying");
  const [message, setMessage] = useState("Verifying your Khalti payment...");

  // Prevent double-invocation in React StrictMode
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const verify = async () => {
      // ── Extract callback params ────────────────────────────
      // `pidx` is the ONLY field required by the backend to call Khalti Lookup.
      // All other params are forwarded as untrusted audit metadata.
      // ──────────────────────────────────────────────────────

      const pidx = searchParams.get("pidx");

      // booking_id is appended by us in the return_url — safe to extract
      const bookingId =
        searchParams.get("booking_id") ??
        searchParams.get("purchase_order_id") ??
        null;

      // Optional metadata — forwarded to backend for logging only.
      // Backend does NOT use any of these for authorization decisions.
      const status = searchParams.get("status") ?? undefined;
      const transaction_id = searchParams.get("transaction_id") ?? undefined;
      const tidx = searchParams.get("tidx") ?? undefined;
      const mobile = searchParams.get("mobile") ?? undefined;
      const purchase_order_id = searchParams.get("purchase_order_id") ?? undefined;
      const purchase_order_name = searchParams.get("purchase_order_name") ?? undefined;

      const amountStr = searchParams.get("amount");
      const totalAmountStr = searchParams.get("total_amount");
      const amount = amountStr ? parseInt(amountStr, 10) : undefined;
      const total_amount = totalAmountStr ? parseInt(totalAmountStr, 10) : undefined;

      // ── Guard: pidx is required ────────────────────────────
      // Without pidx we cannot call the Lookup API.
      // ──────────────────────────────────────────────────────

      if (!pidx) {
        setState("failed");
        setMessage(
          "Invalid payment callback — payment identifier (pidx) is missing. " +
            "Please contact support if money was deducted from your account."
        );
        setTimeout(() => {
          navigate(bookingId ? `/booking-status/${bookingId}` : "/", {
            replace: true,
          });
        }, 4000);
        return;
      }

      // ── DO NOT interpret URL status ────────────────────────
      // Even "User canceled" or "Expired" in the URL is not authoritative.
      // The backend Lookup API will determine the true state.
      // Interpreting the URL status here would allow tampering.
      // ──────────────────────────────────────────────────────

      try {
        const result = await paymentAPI.verifyKhaltiPayment({
          pidx,
          // Pass all optional audit fields — backend logs but ignores for auth
          status,
          transaction_id,
          tidx,
          amount,
          total_amount,
          mobile,
          purchase_order_id,
          purchase_order_name,
        });

        // Backend confirmed status via Lookup API
        const action = result.action;

        if (action === "processed") {
          setState("success");
          setMessage("Payment verified! Your booking is confirmed. 🎉");
        } else if (action === "ignored") {
          // Already confirmed previously (idempotent)
          setState("success");
          setMessage("Payment already confirmed. Your booking is active. ✅");
        } else if (action === "pending") {
          // Khalti returned Pending/Initiated — unusual on callback, handle gracefully
          setState("failed");
          setMessage(
            "Your payment is still being processed. " +
              "Please contact support if money was deducted."
          );
        } else {
          // action === "failed"
          setState("failed");
          setMessage(
            result.message ||
              "Payment was not completed. Please try again or contact support."
          );
        }

        const resolvedBookingId =
          bookingId ?? result.booking_id ?? null;

        setTimeout(() => {
          navigate(
            resolvedBookingId ? `/booking-status/${resolvedBookingId}` : "/",
            { replace: true }
          );
        }, 3000);
      } catch (err) {
        console.error("[KhaltiCallback] Verification failed:", err);
        setState("failed");

        const errMessage =
          err instanceof APIError
            ? err.message
            : "Payment verification failed. Please contact support if money was deducted.";

        setMessage(errMessage);

        setTimeout(() => {
          navigate(bookingId ? `/booking-status/${bookingId}` : "/", {
            replace: true,
          });
        }, 4000);
      }
    };

    verify();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-pink-50/30 to-pink-100/50">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6 py-16">

          {/* Verifying */}
          {state === "verifying" && (
            <>
              <Loader2 className="h-16 w-16 animate-spin mx-auto text-chirag-pink" />
              <h2 className="text-2xl font-playfair font-bold text-gray-900">
                Verifying Payment
              </h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-400">
                Please wait — do not close this tab.
              </p>
            </>
          )}

          {/* Success */}
          {state === "success" && (
            <>
              <div className="mx-auto w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-playfair font-bold text-gray-900">
                Payment Successful!
              </h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-400">
                Redirecting to your booking...
              </p>
            </>
          )}

          {/* Failed */}
          {state === "failed" && (
            <>
              <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-playfair font-bold text-gray-900">
                Payment Failed
              </h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-400">Redirecting you shortly...</p>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}