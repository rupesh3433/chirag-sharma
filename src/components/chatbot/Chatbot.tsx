import { useEffect, useRef, useState } from "react";
import {
  Send,
  Maximize2,
  Minimize2,
  X,
  MessageCircle,
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
const API_URL = import.meta.env.VITE_API_URL;
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

  /* Abort API on close */
  useEffect(() => {
    if (!open && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setLoading(false);
    }
  }, [open]);

  /* Lock body scroll in fullscreen */
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

    const newMessages = [...messages, userMessage];
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

      const data = await res.json();

      setMessages([
        ...newMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
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
      {/* Floating Open Button — ONLY when chat is CLOSED */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[10000]
                     h-14 w-14 rounded-full bg-black text-white
                     shadow-xl flex items-center justify-center
                     hover:scale-105 transition"
          aria-label="Open chatbot"
        >
          <MessageCircle />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className={`fixed z-[9999] flex flex-col transition-all duration-300
          ${
            fullscreen
              ? "inset-0 bg-gray-100"
              : "bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 h-[480px] bg-white rounded-2xl shadow-2xl"
          }`}
        >
          {/* Header */}
          <div className="h-14 px-4 flex items-center justify-between bg-black text-white">
            <span className="font-semibold tracking-wide">
              JinniChirag AI Assistant
            </span>

            <div className="flex gap-2 items-center">
              <button onClick={() => setFullscreen(v => !v)}>
                {fullscreen ? (
                  <Minimize2 size={18} />
                ) : (
                  <Maximize2 size={18} />
                )}
              </button>

              {/* RED hover background close button */}
              <button
                onClick={() => {
                  setOpen(false);
                  setFullscreen(false);
                }}
                className="p-2 rounded-full
                           hover:bg-red-500/25
                           text-red-400 hover:text-red-500
                           transition"
                aria-label="Close chatbot"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className={`space-y-4 ${fullscreen ? "max-w-4xl mx-auto" : ""}`}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <img
                      src={ASSISTANT_AVATAR}
                      className="h-9 w-9 rounded-full border"
                      alt="Assistant"
                    />
                  )}

                  <div
                    className={`px-4 py-3 rounded-2xl text-sm max-w-[75%]
                    ${
                      msg.role === "user"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2 text-xs text-gray-400">
                  <img
                    src={ASSISTANT_AVATAR}
                    className="h-7 w-7 rounded-full"
                  />
                  Typing…
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t bg-white px-4 py-3">
            <div className={`flex gap-2 ${fullscreen ? "max-w-4xl mx-auto" : ""}`}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask anything..."
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-full border text-sm
                           focus:outline-none focus:ring-2 focus:ring-black"
              />

              <button
                onClick={sendMessage}
                disabled={loading}
                className="bg-black text-white h-12 w-12
                           flex items-center justify-center
                           rounded-full"
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
