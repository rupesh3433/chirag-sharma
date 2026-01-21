import { useEffect, useRef, useState } from "react";
import {
  Send,
  Maximize2,
  Minimize2,
  X,
  MessageCircle,
  MessageSquare,
  Calendar,
  RefreshCw,
} from "lucide-react";

/* ---------------------------------- */
/* Types */
/* ---------------------------------- */
type Role = "user" | "assistant";
type Language = "en" | "ne" | "hi" | "mr";
type ChatMode = "simple" | "agent";

type Message = {
  role: Role;
  content: string;
};

type AgentState = {
  sessionId: string | null;
  stage: string;
  missingFields: string[];
  bookingId: string | null;
};

type AgentResponse = {
  reply: string;
  session_id: string;
  stage: string;
  action: string;
  missing_fields: string[];
  booking_id: string | null;
  chat_mode: "normal" | "agent";
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
  
  // Chat mode state - synchronized with backend
  const [chatMode, setChatMode] = useState<ChatMode>("simple");
  const [agentState, setAgentState] = useState<AgentState>({
    sessionId: null,
    stage: "greeting",
    missingFields: [],
    bookingId: null,
  });

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

  /* Reset chat when mode changes */
  useEffect(() => {
    if (chatMode === "simple" && agentState.sessionId) {
      setAgentState({
        sessionId: null,
        stage: "greeting",
        missingFields: [],
        bookingId: null,
      });
    }
  }, [chatMode]);

  /* FIXED: Detect booking intent - MATCHES BACKEND LOGIC */
  const detectBookingIntent = (message: string): boolean => {
    const lowerMsg = message.toLowerCase().trim();
    
    // STRONG booking signals (explicit intent)
    const strongSignals = [
      "book", "booking", "i want to book", "want to book", "book this",
      "book it", "proceed with booking", "confirm booking", "make booking",
      "schedule", "reserve", "appointment", "i'll book", "let's book"
    ];
    
    if (strongSignals.some(signal => lowerMsg.includes(signal))) {
      return true;
    }
    
    // Do NOT trigger on informational queries
    const infoQueries = [
      "list", "show", "tell me about", "what are", "what is",
      "which", "how much", "cost", "price", "info", "information",
      "tell me", "show me"
    ];
    
    // If it's just asking for information, NOT booking
    if (infoQueries.some(query => lowerMsg.includes(query))) {
      return false;
    }
    
    // Action words = booking intent
    const actionWords = ["go for", "go with", "choose", "select", "pick", "get"];
    if (actionWords.some(action => lowerMsg.includes(action))) {
      return true;
    }
    
    // "I want/need [service]" without "to know/information/details"
    if ((lowerMsg.includes("i want") || lowerMsg.includes("i need")) &&
        !["know", "information", "details", "about"].some(x => lowerMsg.includes(x))) {
      return true;
    }
    
    // Check for multiple details in one message
    const detailPatterns = [/name[:\s]/, /phone[:\s]/, /email[:\s]/, /\d{10}/, /@/];
    const detailCount = detailPatterns.filter(pattern => pattern.test(lowerMsg)).length;
    
    return detailCount >= 2;
  };

  /* Send message - handles both modes */
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

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // ONLY auto-switch if in simple mode AND strong booking intent detected
      if (chatMode === "simple" && detectBookingIntent(userMessage.content)) {
        setChatMode("agent");
      }

      // Use CURRENT chatMode to determine endpoint
      if (chatMode === "agent") {
        // AGENT MODE - Conversational Booking
        const res = await fetch(`${API_URL}/agent/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage.content,
            session_id: agentState.sessionId,
            language,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Agent API error: ${res.status}`);
        }

        const data: AgentResponse = await res.json();

        // Update agent state
        setAgentState({
          sessionId: data.session_id,
          stage: data.stage,
          missingFields: data.missing_fields || [],
          bookingId: data.booking_id,
        });

        // SYNC chat mode with backend response
        if (data.chat_mode === "normal") {
          setChatMode("simple");
        } else if (data.chat_mode === "agent") {
          setChatMode("agent");
        }

        setMessages([
          ...newMessages,
          { role: "assistant", content: data.reply },
        ]);

        if (data.action === "booking_confirmed") {
          setTimeout(() => {
            setChatMode("simple");
            setAgentState({
              sessionId: null,
              stage: "greeting",
              missingFields: [],
              bookingId: null,
            });
            showToast("🎉 Booking confirmed! Check your WhatsApp for details.", "success");
          }, 1000);
        }
      } else {
        // SIMPLE MODE - Q&A
        const res = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            messages: newMessages.map(msg => ({
              role: msg.role,
              content: msg.content
            })), 
            language 
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Chat API error: ${res.status}`);
        }

        const data = await res.json();

        setMessages([
          ...newMessages,
          { role: "assistant", content: data.reply },
        ]);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Chat error:", err);
        setMessages([
          ...newMessages,
          { 
            role: "assistant", 
            content: "Sorry, something went wrong. Please try again." 
          },
        ]);
        showToast("Failed to send message. Please try again.", "error");
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

  const switchMode = (mode: ChatMode) => {
    setChatMode(mode);
    if (mode === "simple") {
      setAgentState({
        sessionId: null,
        stage: "greeting",
        missingFields: [],
        bookingId: null,
      });
      if (messages.length > 0) {
        setMessages([
          ...messages,
          { 
            role: "assistant", 
            content: "Switched to general chat mode. How can I help you today?" 
          },
        ]);
      }
    } else {
      setAgentState({
        sessionId: null,
        stage: "greeting",
        missingFields: [],
        bookingId: null,
      });
      if (messages.length > 0) {
        setMessages([
          ...messages,
          { 
            role: "assistant", 
            content: "Switched to booking mode. Let me help you book a makeup service!" 
          },
        ]);
      }
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setAgentState({
      sessionId: null,
      stage: "greeting",
      missingFields: [],
      bookingId: null,
    });
    setChatMode("simple");
    showToast("Conversation reset", "info");
  };

  const showToast = (message: string, type: "success" | "error" | "info") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-6 right-6 z-[10001] px-4 py-3 rounded-lg shadow-lg text-white font-medium animate-fade-in ${
      type === "success" ? "bg-green-500" : 
      type === "error" ? "bg-red-500" : 
      "bg-blue-500"
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add("animate-fade-out");
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  const getStageDisplayText = (stage: string): string => {
    switch(stage) {
      case "greeting":
        return "👋 Welcome";
      case "collecting_info":
        return "📝 Collecting details";
      case "otp_sent":
        return "📱 OTP sent";
      case "otp_verification":
        return "🔐 Verifying OTP";
      case "confirmed":
        return "✅ Booking confirmed";
      default:
        return stage;
    }
  };

  const getPlaceholder = (): string => {
    if (chatMode === "agent") {
      switch(agentState.stage) {
        case "otp_sent":
          return language === "en" ? "Enter 6-digit OTP..." :
                 language === "ne" ? "६-अंकको OTP प्रविष्ट गर्नुहोस्..." :
                 language === "hi" ? "६-अंकीय OTP दर्ज करें..." :
                 "६-अंकी OTP प्रविष्ट करा...";
        case "collecting_info":
          return language === "en" ? "Provide booking information..." :
                 language === "ne" ? "बुकिङ जानकारी प्रदान गर्नुहोस्..." :
                 language === "hi" ? "बुकिंग जानकारी प्रदान करें..." :
                 "बुकिंग माहिती प्रदान करा...";
        default:
          return language === "en" ? "Type your response..." :
                 language === "ne" ? "तपाईंको जवाफ टाइप गर्नुहोस्..." :
                 language === "hi" ? "अपना उत्तर टाइप करें..." :
                 "तुमचे उत्तर टाइप करा...";
      }
    } else {
      return language === "en" ? "Message..." :
             language === "ne" ? "सन्देश..." :
             language === "hi" ? "संदेश..." :
             "संदेश...";
    }
  };

  return (
    <>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-out {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-fade-out {
          animation: fade-out 0.3s ease-in;
        }
      `}</style>

      {!open && showHint && (
        <div className="fixed bottom-24 right-6 z-[9999] animate-fade-in">
          <div className="relative bg-black text-white px-4 py-3 rounded-2xl shadow-xl max-w-[240px]">
            <p className="font-semibold text-sm">👋 Hi! I'm here to guide you</p>
            <p className="text-xs text-gray-300 mt-1">
              Ask me anything or book an appointment
            </p>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-black transform rotate-45" />
          </div>
        </div>
      )}

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
                     transition-all duration-300 ease-out
                     group"
          aria-label="Open chat"
        >
          <MessageCircle size={24} strokeWidth={2.5} />
          {chatMode === "agent" && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
              <Calendar size={10} />
            </span>
          )}
        </button>
      )}

      {open && (
        <div
          className={`fixed z-[9999] flex flex-col transition-all duration-300
          ${
            fullscreen
              ? "inset-0 bg-gradient-to-br from-gray-50 to-gray-100"
              : "bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-[420px] h-[580px] bg-white rounded-3xl shadow-2xl border border-gray-200"
          }`}
        >
          <div className={`flex items-center justify-between bg-black text-white
                          ${fullscreen ? "h-16 px-6" : "h-14 px-4 rounded-t-3xl"}`}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-semibold truncate ${fullscreen ? "text-lg" : "text-sm sm:text-base"}`}>
                  JinniChirag AI
                </span>
                
                <div className="flex items-center gap-1">
                  {chatMode === "agent" ? (
                    <span className="flex items-center gap-1 text-xs bg-blue-500 px-2 py-0.5 rounded-full">
                      <Calendar size={12} />
                      <span>Booking</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs bg-gray-600 px-2 py-0.5 rounded-full">
                      <MessageSquare size={12} />
                      <span>Chat</span>
                    </span>
                  )}
                </div>
              </div>
              
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
                onClick={resetConversation}
                className="hover:bg-white/10 rounded-lg p-1 sm:p-1.5 transition-colors"
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RefreshCw size={16} />
              </button>
              
              <button 
                onClick={() => setFullscreen(v => !v)}
                className="hover:bg-white/10 rounded-lg p-1 sm:p-1.5 transition-colors"
                title={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
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
                title="Close chat"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {chatMode === "agent" && agentState.stage !== "confirmed" && agentState.stage !== "greeting" && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-4 py-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-blue-700 font-medium">
                    {getStageDisplayText(agentState.stage)}
                  </span>
                  {agentState.stage === "collecting_info" && agentState.missingFields.length > 0 && (
                    <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                      {agentState.missingFields.length} more needed
                    </span>
                  )}
                </div>
                {agentState.stage === "collecting_info" && agentState.missingFields.length > 0 && (
                  <div className="text-blue-600 text-[10px] truncate max-w-[200px]">
                    Need: {agentState.missingFields.slice(0, 2).join(", ")}
                    {agentState.missingFields.length > 2 && "..."}
                  </div>
                )}
              </div>
            </div>
          )}

          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center mb-4">
                {chatMode === "agent" ? (
                  <Calendar size={32} className="text-purple-600" />
                ) : (
                  <MessageSquare size={32} className="text-blue-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {chatMode === "agent" ? "Booking Assistant" : "Chat Assistant"}
              </h3>
              <p className="text-gray-600 text-sm max-w-xs mb-4">
                {chatMode === "agent" 
                  ? "I'll help you book makeup services. Please provide your details."
                  : "Ask me anything about makeup services, pricing, or availability."}
              </p>
              <div className="flex gap-2">
                {chatMode === "agent" ? (
                  <button
                    onClick={() => {
                      const quickMessage = "I want to book bridal makeup";
                      setInput(quickMessage);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Book Bridal Makeup
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const quickMessage = "What services do you offer?";
                      setInput(quickMessage);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Ask About Services
                  </button>
                )}
              </div>
            </div>
          )}

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
                        ? "bg-gradient-to-r from-black to-gray-800 text-white rounded-br-md"
                        : "bg-gradient-to-r from-gray-50 to-white text-gray-800 rounded-bl-md border border-gray-100"
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
                  <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
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

          <div className={`bg-white border-t border-gray-200 
                          ${fullscreen ? "py-4 px-6" : "py-3 px-3 sm:py-3 sm:px-4"}`}>
            <div className="mb-2 flex justify-center">
              <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                <span className="text-xs font-medium text-gray-700">
                  {chatMode === "agent" ? "📅 Booking Mode" : "💬 Chat Mode"}
                </span>
                <button
                  onClick={() => switchMode(chatMode === "simple" ? "agent" : "simple")}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Switch to {chatMode === "simple" ? "Booking" : "Chat"}
                </button>
              </div>
            </div>

            <div className={`mx-auto flex gap-2 items-end ${fullscreen ? "max-w-4xl" : "max-w-full"}`}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={getPlaceholder()}
                rows={1}
                lang={language}
                disabled={loading}
                className="flex-1 min-w-0 px-4 py-3 rounded-3xl
                          bg-gray-100 text-gray-800 text-sm sm:text-base
                          placeholder:text-gray-500
                          focus:bg-white focus:outline-none 
                          focus:ring-2 focus:ring-black/20 focus:border-transparent
                          transition-all duration-200
                          disabled:opacity-50 disabled:cursor-not-allowed
                          resize-none overflow-y-auto
                          max-h-[120px] leading-relaxed"
                style={{ scrollbarWidth: 'thin' }}
              />

              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center flex-shrink-0
                          active:scale-95 transition-all duration-200 shadow-lg mb-0.5
                          ${
                            loading || !input.trim()
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : chatMode === "agent"
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90"
                              : "bg-gradient-to-r from-black to-gray-800 text-white hover:opacity-90"
                          }`}
                aria-label="Send message"
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