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
  ChevronDown,
  Sparkles,
} from "lucide-react";

type Role = "user" | "assistant";
type Language = "en" | "ne" | "hi" | "mr";
type ChatMode = "simple" | "agent";

interface Message {
  role: Role;
  content: string;
}

interface AgentState {
  sessionId: string | null;
  stage: string;
  missingFields: string[];
  bookingId: string | null;
}

interface AgentResponse {
  reply: string;
  session_id: string;
  stage: string;
  action: string;
  missing_fields: string[];
  booking_id: string | null;
  chat_mode: "normal" | "agent";
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const ASSISTANT_AVATAR = "/photos/yadavIcon.jpg";

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

  useEffect(() => {
    localStorage.setItem("chatbot_open", String(open));
  }, [open]);

  useEffect(() => {
    localStorage.setItem("chatbot_fullscreen", String(fullscreen));
  }, [fullscreen]);

  useEffect(() => {
    if (!open) {
      setShowHint(true);
      const t = setTimeout(() => setShowHint(false), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!open && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = fullscreen ? "hidden" : "";
  }, [fullscreen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [input]);

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

  const detectBookingIntent = (message: string): boolean => {
    const lowerMsg = message.toLowerCase().trim();

    // STRONG booking signals
    const strongSignals = [
      "book",
      "booking",
      "i want to book",
      "want to book",
      "book this",
      "book it",
      "make booking",
      "i'll book",
      "let's book",
      "schedule",
      "reserve",
      "appointment",
      "make an appointment",
      "book makeup",
      "book a makeup",
      "book for makeup",
      "book service",
      "book now",
      "proceed with booking",
      "confirm booking",
      "make reservation",
      "book appointment",
      "book session",
      "book makeup session",
      "book makeup appointment",
      "go for",
      "go with",
      "choose",
      "select",
      "pick",
      "get",
      "take",
      "option",
      "i'd like to book",
      "i'd like to make",
      "looking to book",
      "interested in booking",
      "can you book",
      "could you book",
      "help me book",
      "want to reserve",
    ];

    // Check for any strong signal
    if (strongSignals.some((signal) => lowerMsg.includes(signal))) {
      return true;
    }

    // Check for numeric selection (1, 2, 3, 4) when in service list context
    const hasNumber = /\b[1-4]\b/.test(lowerMsg);
    const hasActionWord = [
      "go for",
      "choose",
      "select",
      "pick",
      "take",
      "option",
    ].some((word) => lowerMsg.includes(word));

    if (hasNumber && hasActionWord) {
      return true;
    }

    // Check for "I want [service]" pattern
    const services = ["bridal", "party", "engagement", "henna", "mehendi"];
    const actionWords = ["i want", "i need", "looking for", "interested in"];

    if (
      actionWords.some((action) => lowerMsg.includes(action)) &&
      services.some((service) => lowerMsg.includes(service))
    ) {
      return true;
    }

    return false;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // CRITICAL: If user shows ANY booking intent, switch to agent mode IMMEDIATELY
      let shouldUseAgent = chatMode === "agent" || agentState.sessionId;

      // Enhanced booking detection
      const hasBookingIntent = detectBookingIntent(userMessage);
      const hasNumericSelection = /\b[1-4]\b/.test(userMessage.toLowerCase());
      const contextHasServices = messages.some(
        (m) => m.role === "assistant" && m.content.includes("1. Bridal")
      );

      // If user is selecting from a list (1, 2, 3, 4) in context of services
      if (hasNumericSelection && contextHasServices && !shouldUseAgent) {
        shouldUseAgent = true;
        setChatMode("agent");
      }

      // If user explicitly says booking-related things
      if (hasBookingIntent && !shouldUseAgent) {
        shouldUseAgent = true;
        setChatMode("agent");
      }

      let endpoint = "/chat";
      let payload: any = {
        messages: newMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        language,
      };

      if (shouldUseAgent) {
        endpoint = "/agent/chat";
        payload = {
          message: userMessage,
          session_id: agentState.sessionId,
          language,
        };
      }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      if (shouldUseAgent) {
        const data: AgentResponse = await res.json();

        // Debug log
        console.log("Backend response:", {
          stage: data.stage,
          chat_mode: data.chat_mode,
          action: data.action,
        });

        // Update agent state
        setAgentState({
          sessionId: data.session_id,
          stage: data.stage,
          missingFields: data.missing_fields || [],
          bookingId: data.booking_id,
        });

        // Force agent mode if backend says so
        if (data.chat_mode === "agent") {
          setChatMode("agent");
        } else {
          setChatMode("simple");
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
            showToast(
              "🎉 Booking confirmed! Check your WhatsApp for details.",
              "success"
            );
          }, 1000);
        }
      } else {
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
            content: "Sorry, something went wrong. Please try again.",
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
    // If trying to switch FROM agent mode, ask for confirmation
    if (chatMode === "agent" && mode === "simple") {
      if (
        window.confirm(
          "Are you sure you want to exit booking mode? All booking progress will be lost."
        )
      ) {
        setAgentState({
          sessionId: null,
          stage: "greeting",
          missingFields: [],
          bookingId: null,
        });
        setChatMode("simple");
        setMessages([
          ...messages,
          {
            role: "assistant",
            content: "Exited booking mode. How can I help you today?",
          },
        ]);
      }
      return;
    }

    // Switching TO agent mode
    if (mode === "agent") {
      setChatMode("agent");
      setMessages([
        ...messages,
        {
          role: "assistant",
          content:
            "✅ **BOOKING MODE ACTIVATED**\n\nI'll help you book makeup services!\n\nPlease tell me which service you'd like to book:\n\n🎭 **Bridal Makeup Services**\n💃 **Party Makeup Services**\n💍 **Engagement & Pre-Wedding Makeup**\n🌸 **Henna (Mehendi) Services**\n\nYou can say something like 'I want to book bridal makeup' or 'Book party makeup for me'",
        },
      ]);
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
    toast.className = `fixed top-6 right-6 z-[10001] px-4 py-3 rounded-lg shadow-lg text-white font-medium animate-slide-in ${
      type === "success"
        ? "bg-green-500"
        : type === "error"
        ? "bg-red-500"
        : "bg-blue-500"
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("animate-slide-out");
      setTimeout(() => {
        if (document.body.contains(toast)) document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  const getStageDisplayText = (stage: string): string => {
    const stages: Record<string, string> = {
      greeting: "👋 Welcome",
      info_mode: "💬 Information Mode", // ADD THIS
      selecting_service: "🎯 Selecting service",
      selecting_package: "📦 Choosing package",
      collecting_details: "📝 Collecting details",
      confirming: "✅ Confirming booking",
      otp_sent: "📱 OTP sent",
      collecting_info: "📝 Collecting details",
      otp_verification: "🔐 Verifying OTP",
      confirmed: "✅ Booking confirmed",
      completed: "✅ Booking completed",
    };
    return stages[stage] || stage;
  };

  const getPlaceholder = (): string => {
    if (chatMode === "agent") {
      switch (agentState.stage) {
        case "otp_sent":
          return language === "en"
            ? "Enter 6-digit OTP..."
            : language === "ne"
            ? "६-अंकको OTP प्रविष्ट गर्नुहोस्..."
            : language === "hi"
            ? "६-अंकीय OTP दर्ज करें..."
            : "६-अंकी OTP प्रविष्ट करा...";
        case "collecting_details":
        case "collecting_info":
          return language === "en"
            ? "Provide your details..."
            : language === "ne"
            ? "तपाईंको विवरण प्रदान गर्नुहोस्..."
            : language === "hi"
            ? "अपना विवरण प्रदान करें..."
            : "तुमचे तपशील प्रदान करा...";
        case "confirming":
          return language === "en"
            ? "Reply 'yes' to confirm..."
            : language === "ne"
            ? "पुष्टि गर्न 'yes' लेख्नुहोस्..."
            : language === "hi"
            ? "पुष्टि के लिए 'yes' लिखें..."
            : "पुष्टीकरणासाठी 'yes' लिहा...";
        default:
          return language === "en"
            ? "Type your response..."
            : language === "ne"
            ? "तपाईंको जवाफ..."
            : language === "hi"
            ? "अपना उत्तर..."
            : "तुमचे उत्तर...";
      }
    }
    return language === "en"
      ? "Message..."
      : language === "ne"
      ? "सन्देश..."
      : language === "hi"
      ? "संदेश..."
      : "संदेश...";
  };

  return (
    <>
      <style>{`
  /* Hint popup should slide in from right */
  @keyframes slide-in {
    0% {
      opacity: 0;
      transform: translateX(40px); /* Start from further right */
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slide-out {
    0% {
      opacity: 1;
      transform: translateX(0);
    }
    100% {
      opacity: 0;
      transform: translateX(40px); /* Exit to the right */
    }
  }
  
  /* Chat button floating animation */
  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-8px);
    }
    100% {
      transform: translateY(0px);
    }
  }
  
  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 15px rgba(0,0,0,0.2);
    }
    50% {
      box-shadow: 0 0 20px rgba(0,0,0,0.4);
    }
  }
  
  .animate-slide-in {
    animation: slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .animate-slide-out {
    animation: slide-out 0.3s ease-in;
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
`}</style>

      {!open && showHint && (
        <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-[9999]">
          <div className="relative bg-gradient-to-br from-gray-900 to-black text-white px-4 py-4 rounded-3xl shadow-2xl max-w-[310px] border border-gray-700 animate-slide-in">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Hi there! 👋</p>
                <p className="text-xs text-gray-300">
                  Need help booking makeup services?
                </p>
              </div>
            </div>
            <div className="absolute -bottom-1.5 right-6 w-4 h-4 bg-black transform rotate-45 border-r border-b border-gray-700" />
          </div>
        </div>
      )}

      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            setShowHint(false);
          }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[10000]
               h-14 w-14 rounded-full bg-gradient-to-br from-gray-900 to-black text-white
               shadow-2xl flex items-center justify-center
               hover:scale-110 hover:shadow-3xl
               transition-all duration-300 ease-out
               group border border-gray-700 animate-float"
          aria-label="Open chat"
        >
          <div className="relative">
            <MessageCircle
              size={22}
              strokeWidth={2.5}
              className="text-white transition-transform group-hover:scale-110"
            />
            {chatMode === "agent" && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg border border-white">
                <Calendar size={8} className="text-white" />
              </span>
            )}
          </div>
          {/* Remove the duplicate floating div that was covering the button */}
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
          {/* Header - Beautiful design from first code */}
          <div
            className={`flex items-center justify-between bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white
                          ${
                            fullscreen ? "h-16 px-6" : "h-14 px-4 rounded-t-3xl"
                          }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-gray-900" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold truncate ${
                      fullscreen ? "text-base" : "text-sm sm:text-base"
                    }`}
                  >
                    JinniChirag AI
                  </span>
                  <div className="flex items-center gap-1">
                    {chatMode === "agent" ? (
                      <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-blue-500 to-indigo-600 px-2 py-0.5 rounded-full shadow-md">
                        <Calendar size={10} />
                        <span className="font-medium hidden sm:inline">
                          Booking
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                        <MessageSquare size={10} />
                        <span className="font-medium hidden sm:inline">
                          Chat
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative flex-shrink-0">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 
                            rounded-md px-1.5 py-1 text-[11px] font-semibold
                            hover:bg-white/20 transition-all cursor-pointer
                            focus:outline-none focus:ring-2 focus:ring-white/40
                            appearance-none pr-4 w-[56px]"
                >
                  <option value="en" className="bg-gray-900 text-white">
                    EN
                  </option>
                  <option value="ne" className="bg-gray-900 text-white">
                    नेपा
                  </option>
                  <option value="hi" className="bg-gray-900 text-white">
                    हिंदी
                  </option>
                  <option value="mr" className="bg-gray-900 text-white">
                    मराठी
                  </option>
                </select>
                <ChevronDown
                  size={10}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/60"
                />
              </div>
            </div>

            <div className="flex gap-2 sm:gap-1 flex-shrink-0 ml-2">
              <button
                onClick={resetConversation}
                className="hover:bg-white/10 rounded-lg p-1.5 transition-all hover:scale-110 active:scale-95"
                title="Reset"
              >
                <RefreshCw size={15} />
              </button>

              <button
                onClick={() => setFullscreen((v) => !v)}
                className="hover:bg-white/10 rounded-lg p-1.5 transition-all hover:scale-110 active:scale-95"
                title={fullscreen ? "Exit" : "Fullscreen"}
              >
                {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={13} />}
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  setFullscreen(false);
                }}
                className="hover:bg-red-500/30 text-red-400 hover:text-white 
                          rounded-lg p-1.5 transition-all hover:scale-105 active:scale-95"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Stage Indicator */}
          {chatMode === "agent" &&
            agentState.stage !== "greeting" &&
            agentState.stage !== "info_mode" && // ADD THIS
            agentState.stage !== "confirmed" &&
            agentState.stage !== "completed" && (
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-blue-200 px-4 py-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-blue-900 font-semibold">
                      {getStageDisplayText(agentState.stage)}
                    </span>
                  </div>
                  {(agentState.stage === "collecting_details" ||
                    agentState.stage === "collecting_info") &&
                    agentState.missingFields.length > 0 && (
                      <span className="text-blue-700 bg-blue-200 px-2 py-0.5 rounded-full font-medium">
                        {agentState.missingFields.length} needed
                      </span>
                    )}
                </div>
              </div>
            )}

          {/* Empty State */}
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

          {/* Messages - Second code positioning with first code design */}
          <div className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div
              className={`mx-auto space-y-5 ${
                fullscreen ? "max-w-4xl px-8" : "max-w-full px-5"
              }`}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {msg.role === "assistant" && (
                    <div className="relative flex-shrink-0 animate-slide-in">
                      <img
                        src={ASSISTANT_AVATAR}
                        alt="Assistant"
                        className={`rounded-full object-cover flex-shrink-0 
            ${fullscreen ? "h-11 w-11" : "h-9 w-9"}
            ring-2 ring-purple-200 shadow-md`}
                      />
                    </div>
                  )}

                  <div
                    className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed
      max-w-[75%] shadow-sm whitespace-pre-wrap break-words
      transition-all duration-200
      ${
        msg.role === "user"
          ? "bg-gradient-to-br from-gray-900 to-black text-white rounded-br-md"
          : "bg-gradient-to-br from-white to-gray-50 text-gray-800 rounded-bl-md border border-gray-100 animate-slide-in"
      }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="relative flex-shrink-0">
                    <img
                      src={ASSISTANT_AVATAR}
                      alt="Assistant"
                      className={`rounded-full object-cover flex-shrink-0 
          ${fullscreen ? "h-11 w-11" : "h-9 w-9"}
          ring-2 ring-purple-200 shadow-md`}
                    />
                  </div>
                  <div className="bg-gradient-to-br from-white to-gray-50 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                    <div className="flex gap-1.5">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - First code design */}
          <div
            className={`bg-white border-t border-gray-200 
                          ${
                            fullscreen
                              ? "py-4 px-6"
                              : "py-3 px-3 sm:py-3 sm:px-4"
                          }`}
          >
            <div className="mb-2 flex justify-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full px-3 py-1 shadow-sm border border-gray-200">
                <span className="text-xs font-semibold text-gray-700">
                  {chatMode === "agent" ? "📅 Booking" : "💬 Chat"}
                </span>
                <button
                  onClick={() =>
                    switchMode(chatMode === "simple" ? "agent" : "simple")
                  }
                  className="text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-2.5 py-1 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 shadow-md"
                >
                  Switch
                </button>
              </div>
            </div>

            <div
              className={`mx-auto flex gap-2 items-end ${
                fullscreen ? "max-w-4xl" : "max-w-full"
              }`}
            >
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
                style={{ scrollbarWidth: "thin" }}
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
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-110"
                              : "bg-gradient-to-br from-gray-900 to-black text-white hover:scale-110"
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
