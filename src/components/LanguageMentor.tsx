import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Loader2, 
  ChevronRight, 
  HelpCircle,
  Brain,
  MessageCircle,
  GraduationCap
} from "lucide-react";
import { CEFRLevel } from "../types";

interface Message {
  id: string;
  sender: "user" | "mentor";
  text: string;
  timestamp: string;
}

interface LanguageMentorProps {
  userLevel: CEFRLevel | null;
}

const QUICK_PROMPTS = [
  "Explain when to use 'whom' vs 'who' with examples.",
  "What are some natural C1 collocations for business?",
  "Explain the difference between 'affect' and 'effect'.",
  "How can I practice the third conditional structure?"
];

const LEVEL_PROMPTS: Record<string, string[]> = {
  A0: [
    "Give me 5 simple phrases to introduce myself.",
    "Explain how to use 'am', 'is', and 'are' simply.",
    "List common everyday English vocabulary nouns.",
    "When should I use 'a' vs 'an' with simple nouns?"
  ],
  A1: [
    "What's the difference between 'this', 'that', 'these', and 'those'?",
    "Explain the present simple tense with everyday verbs.",
    "Help me learn simple numbers and telling time in English.",
    "What are some polite, simple ways to ask for directions?"
  ],
  A2: [
    "Explain when to use present continuous vs present simple.",
    "How do I use 'some' vs 'any' for food and shopping?",
    "Give me examples of using the past simple for weekend activities.",
    "Explain comparative adjectives (e.g., 'taller', 'better') simply."
  ],
  B1: [
    "Explain the present perfect tense with 'for' and 'since' with examples.",
    "What is the difference between 'make' and 'do' with collocations?",
    "How do I use the first and second conditional structures?",
    "Suggest formal transitional phrases for writing email requests."
  ],
  B2: [
    "Explain when to use the third conditional vs the second conditional.",
    "What are some high-frequency formal phrasal verbs for office work?",
    "Give me useful B2 transition words for structured comparison essays.",
    "Explain active vs passive voice transformations with examples."
  ],
  C1: [
    "Suggest advanced, natural collocations for delivering presentation pitches.",
    "Explain cleft sentences (e.g., 'What concerns me is...') for high emphasis.",
    "What are some sophisticated, precise alternatives to 'important'?",
    "Explain the usage of inversion in formal writing (e.g., 'Hardly had I...')."
  ],
  C2: [
    "Explain the nuances of the English subjunctive mood in diplomatic contexts.",
    "Suggest rare idiomatic metaphors and proverbs used in high literature.",
    "Compare extreme registers (highly colloquial slang vs academic text).",
    "What are some advanced discourse markers for seamless flow?"
  ]
};

export default function LanguageMentor({ userLevel }: LanguageMentorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [arabicExplanations, setArabicExplanations] = useState<boolean>(() => {
    return localStorage.getItem("cefr_mentor_arabic_mode") === "true";
  });

  // Roleplay Mode States
  const [mode, setMode] = useState<"mentor" | "roleplay">("mentor");
  const [activePersona, setActivePersona] = useState<string | null>(null);
  const [roleplayMessages, setRoleplayMessages] = useState<Message[]>([]);
  const [roleplayFeedback, setRoleplayFeedback] = useState<any | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [voiceEngine, setVoiceEngine] = useState<"standard" | "ai">("ai");
  const [autoPlayVoice, setAutoPlayVoice] = useState<boolean>(false);
  const [isTtsLoading, setIsTtsLoading] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop any active speech on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  const ROLEPLAY_PERSONAS = [
    {
      id: "job_interviewer",
      name: "Mr. Harrison",
      role: "Senior HR Director",
      description: "Practice formal interview questions about your experience, strengths, and conflict-handling.",
      difficulty: "Advanced",
      levels: "B2 - C2 Focus",
      avatar: "💼"
    },
    {
      id: "barista",
      name: "Alex",
      role: "Coffee Shop Barista",
      description: "Order drinks and food, handle ingredient options, payment, and casual chatter.",
      difficulty: "Starter",
      levels: "A1 - B1 Focus",
      avatar: "☕"
    },
    {
      id: "customs_officer",
      name: "Officer Vance",
      role: "Border Control Officer",
      description: "Answer typical questions at airport security regarding declaration, bags, and travel purpose.",
      difficulty: "Intermediate",
      levels: "A2 - B2 Focus",
      avatar: "✈️"
    },
    {
      id: "hotel_receptionist",
      name: "Maya",
      role: "Hotel Receptionist",
      description: "Handle booking rooms, asking for amenities, or lodging a noise/maintenance complaint.",
      difficulty: "Intermediate",
      levels: "A2 - B2 Focus",
      avatar: "🔑"
    },
    {
      id: "debate_partner",
      name: "Dr. Clara",
      role: "Academic Debate Partner",
      description: "Challenge your argumentative English on societal and educational topics.",
      difficulty: "Advanced",
      levels: "B2 - C2 Focus",
      avatar: "🎓"
    }
  ];

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const savedChat = localStorage.getItem("cefr_mentor_chat_history");
      if (savedChat) {
        setMessages(JSON.parse(savedChat));
      } else {
        // Default welcoming message
        const welcomeMsg: Message = {
          id: "welcome",
          sender: "mentor",
          text: `Hello! I am **Dr. Lexis**, your personal CEFR English Language Mentor. 

Ask me any questions about:
* **Grammar & Syntax** (e.g., conditional clauses, tenses)
* **Vocabulary & Collocations** (e.g., formal idioms, phrasal verbs)
* **Pronunciation** (e.g., phonetic transcription, word stress)
* **CEFR Exam Preparation**

${userLevel ? `Since you are assessed at **${userLevel}**, I will tailor my responses to help you bridge the gap to the next tier.` : "Take the Adaptive Assessment anytime so I can calibrate my advice to your exact CEFR level!"}

How can I assist your study session today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages([welcomeMsg]);
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
  }, [userLevel]);

  // Persist chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("cefr_mentor_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  // Handle toggling of Arabic explanations mode
  const handleToggleArabicMode = (enabled: boolean) => {
    setArabicExplanations(enabled);
    localStorage.setItem("cefr_mentor_arabic_mode", String(enabled));
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, roleplayMessages, isLoading, isEvaluating, activePersona, mode]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setError(null);
    const userMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Keep only the last 15 messages to prevent excessive token usage
      const trimmedHistoryForApi = updatedMessages.slice(-15);

      const response = await fetch("/api/mentor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: trimmedHistoryForApi.map(m => ({
            sender: m.sender,
            text: m.text
          })),
          userLevel: userLevel || "B1",
          arabicExplanations
        })
      });

      if (!response.ok) {
        throw new Error("I had trouble reaching the language model. Let me retry.");
      }

      const data = await response.json();
      
      const mentorMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        sender: "mentor",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages(prev => [...prev, mentorMsg]);
      if (autoPlayVoice) {
        handleSpeak(data.reply, mentorMsg.id);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch response. Please verify your internet and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ROLEPLAY METHODS
  const handleStartRoleplay = async (personaId: string) => {
    setError(null);
    setActivePersona(personaId);
    setRoleplayMessages([]);
    setRoleplayFeedback(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/mentor-roleplay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          persona: personaId,
          userLevel: userLevel || "B1"
        })
      });

      if (!response.ok) {
        throw new Error("Could not start roleplay. Please try again.");
      }

      const data = await response.json();
      const openingMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        sender: "mentor",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setRoleplayMessages([openingMsg]);
      if (autoPlayVoice) {
        handleSpeak(data.reply, openingMsg.id);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to start roleplay. Please check your connection.");
      setActivePersona(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Global event listener to open language mentor drawer
  useEffect(() => {
    const handleOpenMentor = (e: any) => {
      setIsOpen(true);
      if (e.detail?.mode) {
        setMode(e.detail.mode);
      }
      if (e.detail?.personaId) {
        handleStartRoleplay(e.detail.personaId);
      }
    };
    window.addEventListener("open-language-mentor", handleOpenMentor as any);
    return () => window.removeEventListener("open-language-mentor", handleOpenMentor as any);
  }, []);

  const handleSendRoleplay = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading || !activePersona) return;

    setError(null);
    const userMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updated = [...roleplayMessages, userMsg];
    setRoleplayMessages(updated);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/mentor-roleplay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          persona: activePersona,
          userLevel: userLevel || "B1",
          messages: updated.map(m => ({ sender: m.sender, text: m.text })),
          userInput: textToSend.trim()
        })
      });

      if (!response.ok) {
        throw new Error("Tutor roleplay model is offline. Please retry.");
      }

      const data = await response.json();
      const botMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        sender: "mentor",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setRoleplayMessages(prev => [...prev, botMsg]);
      if (autoPlayVoice) {
        handleSpeak(data.reply, botMsg.id);
      }
    } catch (err: any) {
      console.error(err);
      setError("Could not receive message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetFeedback = async () => {
    if (roleplayMessages.length < 2 || !activePersona) return;
    setError(null);
    setIsEvaluating(true);

    try {
      const response = await fetch("/api/mentor-roleplay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "feedback",
          persona: activePersona,
          userLevel: userLevel || "B1",
          messages: roleplayMessages.map(m => ({ sender: m.sender, text: m.text })),
          arabicExplanations
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate evaluation feedback.");
      }

      const feedbackData = await response.json();
      setRoleplayFeedback(feedbackData);
    } catch (err: any) {
      console.error(err);
      setError("Evaluation failed. Please make sure you exchanged at least a couple of sentences.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleExitRoleplay = () => {
    setActivePersona(null);
    setRoleplayMessages([]);
    setRoleplayFeedback(null);
    setError(null);
    setInput("");
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear your conversation history?")) {
      window.speechSynthesis?.cancel();
      setSpeakingMsgId(null);
      
      if (mode === "roleplay") {
        handleExitRoleplay();
      } else {
        const welcomeMsg: Message = {
          id: "welcome-reset",
          sender: "mentor",
          text: `Chat reset! Let's begin a fresh discussion. Ask me anything to clarify your English queries.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages([welcomeMsg]);
        localStorage.removeItem("cefr_mentor_chat_history");
      }
    }
  };

  // Pronounce/Read mentor text aloud (supports both Browser SpeechSynthesis and premium Gemini TTS)
  const handleSpeak = async (text: string, msgId: string, customVoiceName?: string) => {
    // 1. Stop any currently playing speech/audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();

    // If already speaking/playing this message, click means silence it
    if (speakingMsgId === msgId || isTtsLoading === msgId) {
      setSpeakingMsgId(null);
      setIsTtsLoading(null);
      return;
    }

    // Set speaking/loading state
    setSpeakingMsgId(null);

    if (voiceEngine === "standard") {
      if (!("speechSynthesis" in window)) {
        alert("Text-to-speech is not supported in your browser.");
        return;
      }

      // Strip markdown tags from voice read aloud for a clean speech output
      const plainText = text
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/#+\s+/g, "");

      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.lang = "en-US";
      utterance.rate = 0.9;

      utterance.onstart = () => setSpeakingMsgId(msgId);
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);

      window.speechSynthesis.speak(utterance);
    } else {
      // PREMIUM AI TTS
      setIsTtsLoading(msgId);
      try {
        // Determine voice based on context if not specified
        let selectedVoice = customVoiceName || "Kore";
        if (!customVoiceName && mode === "roleplay" && activePersona) {
          // Match the persona to their ideal voice
          if (activePersona === "job_interviewer") selectedVoice = "Puck"; // Mr. Harrison (Senior HR)
          else if (activePersona === "barista") selectedVoice = "Zephyr"; // Alex (Barista)
          else if (activePersona === "customs_officer") selectedVoice = "Fenrir"; // Officer Vance (Border Control)
          else if (activePersona === "hotel_receptionist") selectedVoice = "Kore"; // Maya (Hotel Receptionist)
          else if (activePersona === "debate_partner") selectedVoice = "Kore"; // Dr. Clara (Debate Partner)
        }

        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voiceName: selectedVoice })
        });

        if (!response.ok) {
          throw new Error("Failed to generate AI Voice.");
        }

        const data = await response.json();
        if (data.audio) {
          const audioUrl = `data:audio/wav;base64,${data.audio}`;
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          
          audio.onplay = () => {
            setIsTtsLoading(null);
            setSpeakingMsgId(msgId);
          };
          audio.onended = () => {
            setSpeakingMsgId(null);
          };
          audio.onerror = () => {
            setIsTtsLoading(null);
            setSpeakingMsgId(null);
          };
          
          await audio.play();
        } else {
          throw new Error("Invalid voice audio data.");
        }
      } catch (err) {
        console.error("AI TTS failed, falling back to standard synthesis:", err);
        setIsTtsLoading(null);
        
        // Fallback to offline web-speech synthesis so it never fails the user experience
        const plainText = text
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/\*([^*]+)\*/g, "$1")
          .replace(/`([^`]+)`/g, "$1")
          .replace(/#+\s+/g, "");

        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.lang = "en-US";
        utterance.rate = 0.9;
        utterance.onstart = () => setSpeakingMsgId(msgId);
        utterance.onend = () => setSpeakingMsgId(null);
        utterance.onerror = () => setSpeakingMsgId(null);
        window.speechSynthesis?.speak(utterance);
      }
    }
  };

  // Simple, highly effective parser to render markdown syntax safely
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      let content = line;

      // Handle Headings (### or ##)
      const isHeading3 = content.startsWith("### ");
      const isHeading2 = content.startsWith("## ");
      if (isHeading3) {
        content = content.replace("### ", "");
      } else if (isHeading2) {
        content = content.replace("## ", "");
      }

      // Handle bullet lists
      const isBullet = content.startsWith("* ") || content.startsWith("- ");
      if (isBullet) {
        content = content.substring(2);
      }

      // Replace bold syntax **text**
      const parts = content.split(/\*\*([^*]+)\*\*/g);
      const parsedElements = parts.map((part, index) => {
        if (index % 2 === 1) {
          return <strong key={index} className="text-[#D4AF37] font-bold">{part}</strong>;
        }
        
        // Handle inline code formatting like `word`
        const subParts = part.split(/`([^`]+)`/g);
        return subParts.map((subPart, subIndex) => {
          if (subIndex % 2 === 1) {
            return (
              <code key={subIndex} className="bg-white/10 px-1 py-0.5 rounded text-[10px] font-mono text-white border border-white/5 mx-0.5">
                {subPart}
              </code>
            );
          }
          return subPart;
        });
      });

      if (isHeading2) {
        return (
          <h4 key={lineIdx} className="text-sm font-serif font-bold text-white uppercase tracking-wider mt-4 mb-2">
            {parsedElements}
          </h4>
        );
      }

      if (isHeading3) {
        return (
          <h5 key={lineIdx} className="text-xs font-serif font-semibold text-white uppercase tracking-wide mt-3 mb-1">
            {parsedElements}
          </h5>
        );
      }

      if (isBullet) {
        return (
          <div key={lineIdx} className="flex items-start gap-1.5 ml-3 my-1">
            <span className="text-[#D4AF37] mt-1 text-[8px]">•</span>
            <span className="text-xs text-[#C8C8CC] leading-relaxed flex-1">{parsedElements}</span>
          </div>
        );
      }

      // Default paragraph line
      return (
        <p key={lineIdx} className="text-xs text-[#C8C8CC] leading-relaxed my-1.5 min-h-[4px]">
          {parsedElements}
        </p>
      );
    });
  };

  const selectedPersonaObj = ROLEPLAY_PERSONAS.find(p => p.id === activePersona);

  return (
    <>
      {/* 1. Floating Chat Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="bg-[#141417] border border-white/10 rounded-xl px-3 py-2 text-[10px] text-[#8E9299] shadow-2xl max-w-[200px] pointer-events-none hidden md:block"
            >
              <span className="text-[#D4AF37] font-bold">Stuck on a rule?</span> Ask Dr. Lexis!
            </motion.div>
          )}
        </AnimatePresence>

        <button
          id="mentor-sidebar-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          className={`h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition duration-300 transform hover:scale-105 active:scale-95 cursor-pointer border ${
            isOpen 
              ? "bg-[#141417] text-[#D4AF37] border-white/10" 
              : "bg-[#D4AF37] text-black border-transparent hover:bg-[#c59d2e]"
          }`}
          title="Toggle Language Mentor Chat"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </button>
      </div>

      {/* 2. Slide-out Chat Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%", opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 z-50 h-screen w-full sm:w-[400px] bg-[#0F0F12] border-l border-white/10 shadow-2xl flex flex-col"
            id="mentor-sidebar-container"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#141417]">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 bg-gradient-to-br from-[#D4AF37] to-[#8E793E] rounded-lg flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h3 className="text-xs font-serif font-black text-white uppercase tracking-wider leading-none">
                    {mode === "roleplay" ? "Roleplay Arena" : "Language Mentor"}
                  </h3>
                  <span className="text-[9px] text-[#8E9299] uppercase tracking-widest font-bold">
                    {mode === "roleplay" ? "Situational Challenges" : "Dr. Lexis • CEFR Tutor"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition text-[#8E9299] hover:text-red-400 cursor-pointer"
                  title="Clear chat session"
                  id="mentor-clear-chat-btn"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition text-[#8E9299] hover:text-white cursor-pointer"
                  title="Close sidebar"
                  id="mentor-close-sidebar-btn"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Sub-Tabs: Tutor Mode vs Roleplay Mode */}
            <div className="flex border-b border-white/10 bg-[#141417]/50 p-1">
              <button
                onClick={() => setMode("mentor")}
                className={`flex-1 py-2 text-center text-[10px] font-serif uppercase tracking-wider transition-all rounded-lg cursor-pointer ${
                  mode === "mentor" ? "bg-[#D4AF37] text-black font-bold" : "text-[#8E9299] hover:text-white"
                }`}
              >
                Dr. Lexis (Tutor)
              </button>
              <button
                onClick={() => setMode("roleplay")}
                className={`flex-1 py-2 text-center text-[10px] font-serif uppercase tracking-wider transition-all rounded-lg flex items-center justify-center gap-1 cursor-pointer ${
                  mode === "roleplay" ? "bg-[#D4AF37] text-black font-bold" : "text-[#8E9299] hover:text-white"
                }`}
              >
                <Sparkles className="h-3 w-3" /> Roleplay Mode
              </button>
            </div>

            {/* Audio & Translation Controls */}
            <div className="bg-[#141417] border-b border-white/5 divide-y divide-white/5">
              {/* Arabic Translation Toggle */}
              <div className="px-4 py-2 flex items-center justify-between text-[11px] shadow-sm select-none">
                <div className="flex items-center gap-2 text-[#C8C8CC] font-medium">
                  <span className="text-base leading-none">🇸🇦</span>
                  <span>تفعيل الترجمة والشرح بالعربية</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleArabicMode(!arabicExplanations)}
                  className={`px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wider transition-all duration-200 cursor-pointer ${
                    arabicExplanations 
                      ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 font-bold" 
                      : "bg-white/5 text-[#8E9299] border border-white/5 hover:border-white/10"
                  }`}
                  title="Toggle bilingual English & Arabic explanations"
                >
                  {arabicExplanations ? "مفعّل (ON)" : "تفعيل"}
                </button>
              </div>

              {/* AI Voice & Auto-Play Controls */}
              <div className="px-4 py-2.5 flex flex-col gap-2 bg-[#141417]/80 text-[11px] shadow-sm">
                <div className="flex items-center justify-between select-none">
                  <span className="text-[#C8C8CC] font-semibold flex items-center gap-1">
                    🎙️ Voice Engine:
                  </span>
                  <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current = null;
                        }
                        window.speechSynthesis?.cancel();
                        setSpeakingMsgId(null);
                        setVoiceEngine("ai");
                      }}
                      className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        voiceEngine === "ai"
                          ? "bg-[#D4AF37] text-black font-bold"
                          : "text-[#8E9299] hover:text-white"
                      }`}
                      title="Generate premium natural voices using Gemini"
                    >
                      AI Natural
                    </button>
                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current = null;
                        }
                        window.speechSynthesis?.cancel();
                        setSpeakingMsgId(null);
                        setVoiceEngine("standard");
                      }}
                      className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        voiceEngine === "standard"
                          ? "bg-[#D4AF37] text-black font-bold"
                          : "text-[#8E9299] hover:text-white"
                      }`}
                      title="Use your browser's offline speech engine"
                    >
                      Offline Web
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between select-none">
                  <span className="text-[#8E9299] flex items-center gap-1">
                    🔊 Auto-Speak Responses
                  </span>
                  <button
                    onClick={() => setAutoPlayVoice(!autoPlayVoice)}
                    className={`px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wider transition-all duration-200 cursor-pointer ${
                      autoPlayVoice
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold"
                        : "bg-white/5 text-[#8E9299] border border-white/5 hover:border-white/10"
                    }`}
                  >
                    {autoPlayVoice ? "ENABLED" : "DISABLED"}
                  </button>
                </div>
              </div>
            </div>

            {/* Mode-dependent scroll-box content */}
            {mode === "mentor" ? (
              // ------------------ TUTOR MODE CHAT SCREEN ------------------
              <div className="flex-1 overflow-y-auto p-4 space-y-4" id="mentor-messages-scroll-box">
                {messages.map((msg) => {
                  const isMentor = msg.sender === "mentor";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMentor ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 shadow ${
                          isMentor 
                            ? "bg-[#141417] border border-white/5 rounded-tl-none" 
                            : "bg-[#D4AF37] text-black rounded-tr-none font-medium text-xs"
                        }`}
                      >
                        <div className={isMentor ? "" : "text-black text-xs"}>
                          {isMentor ? renderMarkdown(msg.text) : <p className="leading-relaxed">{msg.text}</p>}
                        </div>

                        {isMentor && (
                          <div className="flex justify-end mt-2 pt-1 border-t border-white/5">
                            <button
                              onClick={() => handleSpeak(msg.text, msg.id)}
                              disabled={isTtsLoading !== null && isTtsLoading !== msg.id}
                              className={`p-1 rounded hover:bg-white/5 transition text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                speakingMsgId === msg.id ? "text-emerald-400" : "text-[#D4AF37]"
                              }`}
                              title="Speak response aloud"
                            >
                              {isTtsLoading === msg.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#D4AF37]" />
                              ) : speakingMsgId === msg.id ? (
                                <VolumeX className="h-3.5 w-3.5 animate-bounce" />
                              ) : (
                                <Volume2 className="h-3.5 w-3.5" />
                              )}
                              <span>
                                {isTtsLoading === msg.id 
                                  ? "Generating AI..." 
                                  : speakingMsgId === msg.id 
                                  ? "Silence" 
                                  : voiceEngine === "ai" 
                                  ? "Speak (AI)" 
                                  : "Speak"}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-[#8E9299] mt-1 px-1 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex flex-col items-start">
                    <div className="bg-[#141417] border border-white/5 rounded-2xl rounded-tl-none p-4 max-w-[85%] shadow flex items-center gap-2.5">
                      <Loader2 className="h-4.5 w-4.5 text-[#D4AF37] animate-spin" />
                      <span className="text-[11px] text-[#8E9299] font-medium tracking-wide">Tutor is analyzing your query...</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-950/20 border border-red-500/20 text-red-400 p-3 rounded-xl text-[11px] flex items-center gap-2">
                    <span>{error}</span>
                  </div>
                )}

                {!isLoading && (
                  <div className="pt-4 space-y-2 border-t border-white/5">
                    <span className="text-[9px] text-[#8E9299] font-extrabold uppercase tracking-widest block">
                      Suggested for level {userLevel || "B1"}:
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {(LEVEL_PROMPTS[userLevel || "B1"] || QUICK_PROMPTS).map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(prompt)}
                          className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#C8C8CC] hover:text-white text-xs border border-white/5 transition flex items-center justify-between cursor-pointer group"
                        >
                          <span className="line-clamp-2 pr-1">{prompt}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-[#D4AF37] shrink-0 opacity-0 group-hover:opacity-100 transition" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            ) : (
              // ------------------ ROLEPLAY MODE SCREEN ------------------
              <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col" id="roleplay-messages-scroll-box">
                
                {roleplayFeedback ? (
                  // 1. REPORT CARD VIEW (ROLEPLAY COMPLETED & ASSESSED)
                  <div className="space-y-4">
                    <div className="p-4 bg-[#141417] border border-white/10 rounded-2xl text-center space-y-3">
                      <span className="text-[10px] text-[#8E9299] uppercase tracking-widest font-extrabold block">
                        Scenario Assessment Report
                      </span>
                      
                      <div className="flex justify-center items-center">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8E793E] p-0.5 flex items-center justify-center shadow-lg shadow-[#D4AF37]/15">
                          <div className="h-full w-full rounded-full bg-[#0F0F12] flex flex-col items-center justify-center">
                            <span className="text-xl font-serif font-black text-[#D4AF37]">
                              {roleplayFeedback.assigned_level}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-serif font-bold text-white uppercase tracking-wider">
                          Scenario Status:
                        </h4>
                        <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase ${
                          roleplayFeedback.task_completed 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {roleplayFeedback.task_completed ? "🏆 Task Completed successfully" : "⚠️ Task Incomplete"}
                        </span>
                      </div>
                    </div>

                    {/* Strengths Card */}
                    <div className="p-4 bg-[#141417] border border-white/5 rounded-2xl space-y-2">
                      <h4 className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                        🌟 Demonstrated Strengths
                      </h4>
                      <p className="text-xs text-[#C8C8CC] leading-relaxed whitespace-pre-wrap">
                        {roleplayFeedback.strengths}
                      </p>
                    </div>

                    {/* Corrections Card */}
                    <div className="p-4 bg-[#141417] border border-white/5 rounded-2xl space-y-2">
                      <h4 className="text-[10px] text-red-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                        🔧 Corrections & Guidance
                      </h4>
                      <p className="text-xs text-[#C8C8CC] leading-relaxed whitespace-pre-wrap">
                        {roleplayFeedback.corrections}
                      </p>
                    </div>

                    {/* Vocabulary Upgrade Card */}
                    <div className="p-4 bg-[#141417] border border-white/5 rounded-2xl space-y-2">
                      <h4 className="text-[10px] text-blue-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                        📚 Elevated Vocabulary Suggestions
                      </h4>
                      <p className="text-xs text-[#C8C8CC] leading-relaxed whitespace-pre-wrap">
                        {roleplayFeedback.vocabulary_suggestions}
                      </p>
                    </div>

                    {/* Arabic Bilingual Summary Card */}
                    {arabicExplanations && roleplayFeedback.arabic_summary && (
                      <div className="p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/15 rounded-2xl space-y-2 text-right" dir="rtl">
                        <h4 className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-extrabold flex items-center justify-end gap-1.5 font-sans">
                          🇸🇦 ملخص تقييم المعلم (عربي)
                        </h4>
                        <p className="text-xs text-[#E0E0E0] leading-relaxed whitespace-pre-wrap font-sans">
                          {roleplayFeedback.arabic_summary}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleExitRoleplay}
                      className="w-full py-3 rounded-xl bg-[#D4AF37] text-black font-serif font-black text-xs uppercase tracking-widest hover:bg-[#c59d2e] transition shadow-lg cursor-pointer"
                    >
                      Back to Scenarios
                    </button>
                  </div>
                ) : activePersona ? (
                  // 2. ACTIVE CHAT SCREEN FOR ROLEPLAY
                  <div className="flex-1 flex flex-col h-full space-y-4">
                    {/* Persona header info */}
                    <div className="p-3 bg-[#141417] border border-white/5 rounded-xl flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl leading-none">{selectedPersonaObj?.avatar}</span>
                        <div>
                          <h4 className="text-xs font-serif font-black text-white leading-none uppercase tracking-wide">
                            {selectedPersonaObj?.name}
                          </h4>
                          <span className="text-[9px] text-[#8E9299] font-medium block mt-0.5">
                            {selectedPersonaObj?.role}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleGetFeedback}
                        disabled={roleplayMessages.length < 2 || isEvaluating}
                        className="px-2.5 py-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/25 text-[#D4AF37] font-bold text-[9px] uppercase tracking-widest rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                        title="Submit transcript for review and exit"
                      >
                        {isEvaluating ? "Evaluating..." : "End & Evaluate"}
                      </button>
                    </div>

                    {/* List of roleplay messages exchanged */}
                    <div className="flex-1 space-y-4 min-h-[150px]">
                      {roleplayMessages.map((msg) => {
                        const isPersona = msg.sender === "mentor";
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isPersona ? "items-start" : "items-end"}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl p-3.5 shadow ${
                                isPersona 
                                  ? "bg-[#141417] border border-white/5 rounded-tl-none" 
                                  : "bg-[#D4AF37] text-black rounded-tr-none font-medium text-xs"
                              }`}
                            >
                              <div className={isPersona ? "text-xs text-[#E0E0E0]" : "text-black text-xs"}>
                                <p className="leading-relaxed">{msg.text}</p>
                              </div>

                              {isPersona && (
                                <div className="flex justify-end mt-2 pt-1 border-t border-white/5">
                                  <button
                                    onClick={() => handleSpeak(msg.text, msg.id)}
                                    disabled={isTtsLoading !== null && isTtsLoading !== msg.id}
                                    className={`p-1 rounded hover:bg-white/5 transition text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                      speakingMsgId === msg.id ? "text-emerald-400" : "text-[#D4AF37]"
                                    }`}
                                    title="Speak response aloud"
                                  >
                                    {isTtsLoading === msg.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#D4AF37]" />
                                    ) : speakingMsgId === msg.id ? (
                                      <VolumeX className="h-3.5 w-3.5 animate-bounce" />
                                    ) : (
                                      <Volume2 className="h-3.5 w-3.5" />
                                    )}
                                    <span>
                                      {isTtsLoading === msg.id 
                                        ? "Generating AI..." 
                                        : speakingMsgId === msg.id 
                                        ? "Silence" 
                                        : voiceEngine === "ai" 
                                        ? "Speak (AI)" 
                                        : "Speak"}
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>
                            <span className="text-[9px] text-[#8E9299] mt-1 px-1 font-mono">
                              {isPersona ? selectedPersonaObj?.name : "You"} • {msg.timestamp}
                            </span>
                          </div>
                        );
                      })}

                      {isLoading && (
                        <div className="flex flex-col items-start">
                          <div className="bg-[#141417] border border-white/5 rounded-2xl rounded-tl-none p-4 max-w-[85%] shadow flex items-center gap-2.5">
                            <Loader2 className="h-4.5 w-4.5 text-[#D4AF37] animate-spin" />
                            <span className="text-[10px] text-[#8E9299] font-medium tracking-wide">
                              {selectedPersonaObj?.name} is responding...
                            </span>
                          </div>
                        </div>
                      )}

                      {isEvaluating && (
                        <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#141417] border border-white/5 rounded-2xl">
                          <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin" />
                          <div>
                            <h5 className="text-xs font-serif font-black text-white uppercase tracking-wider leading-none">Pedagogical Review</h5>
                            <span className="text-[9px] text-[#8E9299] block mt-1">Analyzing chat transcript mapped to CEFR guidelines...</span>
                          </div>
                        </div>
                      )}

                      {error && (
                        <div className="bg-red-950/20 border border-red-500/20 text-red-400 p-3 rounded-xl text-[11px] flex items-center gap-2">
                          <span>{error}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick helper tip */}
                    {roleplayMessages.length < 2 && !isLoading && (
                      <div className="p-3 bg-blue-950/10 border border-blue-500/10 text-[#8E9299] text-[10px] rounded-xl flex items-center gap-2">
                        <span>💡 Tip: Reply naturally in English. Exchanging at least 2-3 sentences gives the evaluator better data to assess your skills.</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        onClick={handleExitRoleplay}
                        className="text-[9px] text-[#8E9299] hover:text-[#D4AF37] flex items-center gap-1 uppercase tracking-widest font-extrabold cursor-pointer transition"
                      >
                        ← Exit Scenario
                      </button>
                    </div>

                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  // 3. PERSONA CHOICE GRID
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-serif font-black text-white uppercase tracking-wider">
                        Select a Persona Challenge
                      </h4>
                      <p className="text-[10px] text-[#8E9299] leading-relaxed">
                        Converse in a targeted scenario. The AI adapts live to your proficiency level and tests you. Once completed, request a professional CEFR evaluation.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {ROLEPLAY_PERSONAS.map((persona) => (
                        <div
                          key={persona.id}
                          className="p-3.5 bg-[#141417] hover:bg-white/5 border border-white/5 hover:border-[#D4AF37]/30 rounded-xl transition flex flex-col justify-between gap-3 group shadow"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-3xl leading-none pt-0.5">{persona.avatar}</span>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 className="text-xs font-serif font-bold text-white group-hover:text-[#D4AF37] transition uppercase tracking-wide">
                                  {persona.name}
                                </h5>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                  persona.difficulty === "Advanced" 
                                    ? "bg-red-500/10 text-red-400 border border-red-500/15" 
                                    : persona.difficulty === "Intermediate" 
                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/15"
                                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                                }`}>
                                  {persona.difficulty}
                                </span>
                              </div>
                              <span className="text-[9px] text-[#8E9299] font-extrabold uppercase tracking-wider block">
                                {persona.role} • {persona.levels}
                              </span>
                              <p className="text-[10px] text-[#C8C8CC] leading-relaxed">
                                {persona.description}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleStartRoleplay(persona.id)}
                            className="w-full py-2 bg-white/5 hover:bg-[#D4AF37] text-[#C8C8CC] hover:text-black font-serif font-bold text-[10px] uppercase tracking-wider border border-white/5 hover:border-transparent rounded-lg transition text-center cursor-pointer"
                          >
                            Converse with {persona.name}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Chat Inputs & Action Buttons */}
            {(!roleplayFeedback || mode === "mentor") && (
              <div className="p-4 border-t border-white/10 bg-[#141417]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      mode === "roleplay" 
                        ? (activePersona ? `Message ${selectedPersonaObj?.name || "persona"}...` : "Choose a persona first")
                        : "Ask about grammar, vocabulary, rules..."
                    }
                    className="flex-1 bg-[#0F0F12] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#E0E0E0] placeholder-[#8E9299]/30 focus:outline-none focus:border-[#D4AF37] disabled:opacity-35 disabled:cursor-not-allowed"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (mode === "roleplay") {
                          handleSendRoleplay(input);
                        } else {
                          handleSend(input);
                        }
                      }
                    }}
                    id="mentor-chat-input"
                    disabled={isLoading || isEvaluating || (mode === "roleplay" && !activePersona)}
                  />
                  <button
                    onClick={() => {
                      if (mode === "roleplay") {
                        handleSendRoleplay(input);
                      } else {
                        handleSend(input);
                      }
                    }}
                    disabled={!input.trim() || isLoading || isEvaluating || (mode === "roleplay" && !activePersona)}
                    className="bg-[#D4AF37] disabled:opacity-35 disabled:cursor-not-allowed hover:bg-[#c59d2e] text-black h-10 w-10 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0 shadow-lg shadow-[#D4AF37]/15"
                    id="mentor-chat-send-btn"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2.5 px-0.5">
                  <span className="text-[9px] text-[#8E9299] flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-[#D4AF37]" /> Gemini-Powered English Tutor
                  </span>
                  {userLevel && (
                    <span className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-wider bg-[#D4AF37]/5 px-2 py-0.5 rounded border border-[#D4AF37]/10">
                      Level: {userLevel}
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
