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
type Language = "en" | "ne" | "hi" | "mr";

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
  const [open, setOpen] = useState(
    () => localStorage.getItem("chatbot_open") === "true"
  );
  const [fullscreen, setFullscreen] = useState(
    () => localStorage.getItem("chatbot_fullscreen") === "true"
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [language, setLanguage] = useState<Language>("en");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  /* Persist state */
  useEffect(() => {
    localStorage.setItem("chatbot_open", String(open));
  }, [open]);

  useEffect(() => {
    localStorage.setItem("chatbot_fullscreen", String(fullscreen));
  }, [fullscreen]);

  /* Popup hint */
  useEffect(() => {
    if (!open) {
      setShowHint(true);
      const t = setTimeout(() => setShowHint(false), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  /* Auto scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* Abort on close */
  useEffect(() => {
    if (!open && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setLoading(false);
    }
  }, [open]);

  /* Fullscreen scroll lock */
  useEffect(() => {
    document.body.style.overflow = fullscreen ? "hidden" : "";
  }, [fullscreen]);

  /* Auto-resize textarea */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  /* Send message */
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

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, language }),
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
          { role: "assistant", content: "Sorry, something went wrong." },
        ]);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Guidance hint bubble */}
      {!open && showHint && (
        <div className="fixed bottom-24 right-6 z-[9999] animate-fade-in">
          <div className="relative bg-black text-white px-4 py-3 rounded-2xl shadow-xl max-w-[240px]">
            <p className="font-semibold text-sm">👋 Hi! I'm here to guide you</p>
            <p className="text-xs text-gray-300 mt-1">
              Ask me anything anytime
            </p>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-black transform rotate-45" />
          </div>
        </div>
      )}

      {/* Floating button */}
      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            setShowHint(false);
          }}
          className="fixed bottom-6 right-6 z-[10000]
                     h-14 w-14 rounded-full bg-black text-white
                     shadow-2xl flex items-center justify-center
                     hover:scale-110 hover:shadow-3xl
                     transition-all duration-300 ease-out"
        >
          <MessageCircle size={24} strokeWidth={2.5} />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className={`fixed z-[9999] flex flex-col transition-all duration-300
          ${
            fullscreen
              ? "inset-0 bg-gradient-to-br from-gray-50 to-gray-100"
              : "bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-[420px] h-[580px] bg-white rounded-3xl shadow-2xl border border-gray-200"
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between bg-black text-white
                          ${fullscreen ? "h-16 px-6" : "h-14 px-4 rounded-t-3xl"}`}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className={`font-semibold truncate ${fullscreen ? "text-lg" : "text-sm sm:text-base"}`}>
                JinniChirag AI
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-white/10 backdrop-blur-sm border border-white/20 
                          rounded-md px-2 py-1 text-[11px] sm:text-xs font-medium
                          hover:bg-white/20 transition-colors cursor-pointer
                          focus:outline-none focus:ring-2 focus:ring-white/40
                          appearance-none pr-6 bg-no-repeat bg-right
                          max-w-[80px] sm:max-w-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 4px center",
                  backgroundSize: "12px"
                }}
              >
                <option value="en" className="bg-black text-white">EN</option>
                <option value="ne" className="bg-black text-white">नेपाली</option>
                <option value="hi" className="bg-black text-white">हिंदी</option>
                <option value="mr" className="bg-black text-white">मराठी</option>
              </select>
            </div>

            <div className="flex gap-2 sm:gap-3 flex-shrink-0">
              <button 
                onClick={() => setFullscreen(v => !v)}
                className="hover:bg-white/10 rounded-lg p-1 sm:p-1.5 transition-colors"
              >
                {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  setFullscreen(false);
                }}
                className="hover:bg-red-500/20 text-red-400 hover:text-red-300 
                          rounded-lg p-1 sm:p-1.5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className={`mx-auto space-y-5 ${fullscreen ? "max-w-4xl px-8" : "max-w-full px-5"}`}>
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
                      alt="Assistant"
                      className={`rounded-full object-cover flex-shrink-0 
                        ${fullscreen ? "h-11 w-11" : "h-9 w-9"}
                        ring-2 ring-gray-200 shadow-sm`}
                    />
                  )}

                  <div
                    className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed
                    max-w-[75%] shadow-sm whitespace-pre-wrap break-words
                    ${
                      msg.role === "user"
                        ? "bg-black text-white rounded-br-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <img
                    src={ASSISTANT_AVATAR}
                    alt="Assistant"
                    className={`rounded-full object-cover flex-shrink-0 
                      ${fullscreen ? "h-11 w-11" : "h-9 w-9"}
                      ring-2 ring-gray-200 shadow-sm`}
                  />
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input - WhatsApp/ChatGPT Style */}
          <div className={`bg-white border-t border-gray-200 
                          ${fullscreen ? "py-4 px-6" : "py-3 px-3 sm:py-3 sm:px-4"}`}>
            <div className={`mx-auto flex gap-2 items-end ${fullscreen ? "max-w-4xl" : "max-w-full"}`}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  language === "en"
                    ? "Message..."
                    : language === "ne"
                    ? "सन्देश..."
                    : language === "hi"
                    ? "संदेश..."
                    : "संदेश..."
                }
                rows={1}
                lang={language}
                disabled={loading}
                className="flex-1 min-w-0 px-4 py-3 rounded-3xl
                          bg-gray-100 text-gray-800 text-sm sm:text-base
                          placeholder:text-gray-500
                          focus:bg-white focus:outline-none 
                          focus:ring-2 focus:ring-black/20
                          transition-all duration-200
                          disabled:opacity-50 disabled:cursor-not-allowed
                          resize-none overflow-y-auto
                          max-h-[120px] leading-relaxed"
                style={{ scrollbarWidth: 'thin' }}
              />

              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-black text-white
                          flex items-center justify-center flex-shrink-0
                          hover:bg-gray-800 active:scale-95
                          disabled:opacity-40 disabled:cursor-not-allowed
                          transition-all duration-200 shadow-lg mb-0.5"
              >
                <Send size={16} className="sm:hidden" />
                <Send size={17} className="hidden sm:block" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;