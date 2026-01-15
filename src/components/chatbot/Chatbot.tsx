import { useEffect, useRef, useState } from "react";
import {
  Send,
  ChevronUp,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";

/* ---------------------------------- */
/* Types */
/* ---------------------------------- */
type Role = "user" | "assistant";

type Message = {
  role: Role;
  content: string;
};

/* ---------------------------------- */
/* API & ASSETS */
/* ---------------------------------- */
const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const ASSISTANT_AVATAR = "/photos/yadavIcon.jpg";

/* ---------------------------------- */
/* Component */
/* ---------------------------------- */
const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* Auto scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* Abort request on close */
  useEffect(() => {
    if (!open && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setLoading(false);
    }
  }, [open]);

  /* Lock scroll in fullscreen */
  useEffect(() => {
    document.body.style.overflow = fullscreen ? "hidden" : "";
  }, [fullscreen]);

  /* Send Message */
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    const newMessages: Message[] = [...messages, userMessage];
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

      if (!res.ok) throw new Error();

      const data = await res.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content:
              "Sorry, something went wrong. Please try again.",
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
      {/* Floating Toggle Button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-[10000] h-14 w-14 rounded-full bg-black text-white shadow-xl flex items-center justify-center hover:scale-105 transition"
        aria-label="Toggle chatbot"
      >
        <ChevronUp className={`${open ? "rotate-180" : ""}`} />
      </button>

      {/* Chat Window */}
      {open && (
        <div
          className={`fixed z-[9999] flex flex-col transition-all duration-300
          ${
            fullscreen
              ? "top-0 left-0 right-0 bottom-0 bg-gray-100"
              : "bottom-24 right-6 w-96 h-[480px] bg-white rounded-2xl shadow-2xl overflow-hidden"
          }`}
        >
          {/* Header */}
          <div className="h-14 px-6 flex items-center justify-between bg-black text-white shadow-md">
            <span className="font-semibold tracking-wide">
              JinniChirag AI Assistant
            </span>

            <div className="flex gap-3">
              <button onClick={() => setFullscreen(v => !v)}>
                {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  setFullscreen(false);
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className={`mx-auto space-y-4 ${fullscreen ? "max-w-4xl" : ""}`}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-end gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Assistant Avatar */}
                  {msg.role === "assistant" && (
                    <img
                      src={ASSISTANT_AVATAR}
                      alt="Assistant"
                      className={`rounded-full object-cover border shadow-sm transition-all
                        ${fullscreen ? "h-12 w-12" : "h-9 w-9"}
                      `}
                    />
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm max-w-[75%]
                    ${
                      msg.role === "user"
                        ? "bg-black text-white"
                        : "bg-white text-gray-800"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <img
                    src={ASSISTANT_AVATAR}
                    className={`rounded-full transition-all
                      ${fullscreen ? "h-10 w-10" : "h-7 w-7"}
                    `}
                  />
                  Typing…
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t bg-white px-4 py-3">
            <div className={`mx-auto flex gap-2 ${fullscreen ? "max-w-4xl" : ""}`}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && sendMessage()
                }
                placeholder="Ask anything..."
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-full border text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="bg-black text-white px-5 rounded-full"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
