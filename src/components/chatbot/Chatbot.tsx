import { useEffect, useRef, useState } from "react";
import { Send, ChevronUp } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

// ✅ SAFE fallback if env is missing
const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 🔹 Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 🔹 Abort request if chat closes
  useEffect(() => {
    if (!open && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setLoading(false);
    }
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: input.trim() },
    ];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: unknown = await res.json();

      // ✅ VALIDATE RESPONSE SHAPE
      if (
        !data ||
        typeof data !== "object" ||
        !("reply" in data) ||
        typeof (data as any).reply !== "string"
      ) {
        throw new Error("Invalid API response");
      }

      setMessages([
        ...newMessages,
        { role: "assistant", content: (data as any).reply },
      ]);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content:
              "Sorry, something went wrong. Please try again in a moment.",
          },
        ]);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle chatbot"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-black text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
      >
        <ChevronUp className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-[420px] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">
          <div className="p-3 bg-black text-white font-semibold">
            JinniChirag Assistant
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[85%] text-sm ${
                  msg.role === "user"
                    ? "bg-black text-white ml-auto"
                    : "bg-gray-100 text-black"
                }`}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="text-xs text-gray-400">Typing…</div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-2 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask something..."
              disabled={loading}
              className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none disabled:opacity-60"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-black text-white p-2 rounded-lg disabled:opacity-60"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
