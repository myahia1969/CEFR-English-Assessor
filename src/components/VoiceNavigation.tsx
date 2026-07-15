import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Volume2, Sparkles, X, Check, Info, Command, AlertTriangle } from "lucide-react";

interface VoiceNavigationProps {
  onNavigate: (tab: "dashboard" | "test" | "evaluator" | "practice" | "toefl") => void;
  onToggleTheme?: () => void;
  onShowHelp?: () => void;
  className?: string;
}

export default function VoiceNavigation({
  onNavigate,
  onToggleTheme,
  onShowHelp,
  className = ""
}: VoiceNavigationProps) {
  const [isSupported, setIsSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState("");
  const [showStatusPanel, setShowStatusPanel] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const recognitionRef = useRef<any>(null);
  const panelTimerRef = useRef<any>(null);

  useEffect(() => {
    // Check Speech Recognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-US"; // support both English and Arabic command detection in parsed text

      rec.onstart = () => {
        setIsListening(true);
        setErrorMsg("");
        setTranscript("Listening for commands... / جاري الاستماع...");
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === "not-allowed") {
          setErrorMsg("Microphone access denied. Please enable mic permissions.");
        } else {
          setErrorMsg(`Error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const resultIndex = event.resultIndex;
        const text: string = event.results[resultIndex][0].transcript.trim().toLowerCase();
        setTranscript(text);
        processCommand(text);
      };

      recognitionRef.current = rec;
    } catch (err) {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const processCommand = (commandText: string) => {
    const text = commandText.toLowerCase();
    let actionTaken = "";

    // 1. Dashboard Commands
    if (
      text.includes("dashboard") ||
      text.includes("go to dashboard") ||
      text.includes("academy") ||
      text.includes("الرئيسية") ||
      text.includes("داشبورد")
    ) {
      onNavigate("dashboard");
      actionTaken = "Navigated to Dashboard";
    }
    // 2. Evaluation Commands
    else if (
      text.includes("evaluation") ||
      text.includes("start evaluation") ||
      text.includes("evaluator") ||
      text.includes("speech") ||
      text.includes("essay") ||
      text.includes("تقييم") ||
      text.includes("التقييم")
    ) {
      onNavigate("evaluator");
      actionTaken = "Navigated to Essay & Speech Evaluator";
    }
    // 3. Practice / Training Commands
    else if (
      text.includes("practice") ||
      text.includes("skills") ||
      text.includes("training") ||
      text.includes("تدريب") ||
      text.includes("مهارات")
    ) {
      onNavigate("practice");
      actionTaken = "Navigated to Skills Training Hub";
    }
    // 4. Test Commands
    else if (
      text.includes("test") ||
      text.includes("adaptive") ||
      text.includes("assessment") ||
      text.includes("اختبار") ||
      text.includes("الاختبار")
    ) {
      onNavigate("test");
      actionTaken = "Navigated to Adaptive Assessment";
    }
    // 5. TOEFL Simulator Commands
    else if (
      text.includes("toefl") ||
      text.includes("simulator") ||
      text.includes("ibt") ||
      text.includes("توفل") ||
      text.includes("محاكاة")
    ) {
      onNavigate("toefl");
      actionTaken = "Navigated to TOEFL iBT Simulator";
    }
    // 6. Theme Toggle Commands
    else if (
      text.includes("theme") ||
      text.includes("toggle theme") ||
      text.includes("change theme") ||
      text.includes("dark mode") ||
      text.includes("light mode") ||
      text.includes("مظهر") ||
      text.includes("تغيير المظهر")
    ) {
      if (onToggleTheme) {
        onToggleTheme();
        actionTaken = "Toggled Light/Dark Theme";
      }
    }
    // 7. Help Commands
    else if (
      text.includes("help") ||
      text.includes("guide") ||
      text.includes("show help") ||
      text.includes("تعليمات") ||
      text.includes("مساعدة")
    ) {
      if (onShowHelp) {
        onShowHelp();
        actionTaken = "Opened Application Guide";
      }
    }

    if (actionTaken) {
      setLastCommand(actionTaken);
      // Trigger a brief success vibration if supported
      if (navigator.vibrate) navigator.vibrate(100);

      // Speak confirmation
      speakConfirmation(actionTaken);

      // Auto hide command panel after 4 seconds
      if (panelTimerRef.current) clearTimeout(panelTimerRef.current);
      panelTimerRef.current = setTimeout(() => {
        setTranscript("");
        setLastCommand("");
      }, 4000);
    } else {
      setLastCommand("Command not recognized / أمر غير معروف");
    }
  };

  const speakConfirmation = (text: string) => {
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        // Use an English voice
        const voices = window.speechSynthesis.getVoices();
        const engVoice = voices.find(v => v.lang.startsWith("en"));
        if (engVoice) utterance.voice = engVoice;
        window.speechSynthesis.speak(utterance);
      }
    } catch {}
  };

  const toggleListening = () => {
    if (!isSupported) {
      alert("Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    setShowStatusPanel(true);

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className={`relative inline-block ${className}`} id="voice-nav-wrapper">
      {/* Listening Wave Animations and Mic Trigger */}
      <div className="flex items-center gap-1.5">
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-1 mr-1"
            >
              {[1, 2, 3].map((bar) => (
                <motion.span
                  key={bar}
                  animate={{ scaleY: [0.3, 1, 0.3] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay: bar * 0.15,
                    ease: "easeInOut"
                  }}
                  className="h-3.5 w-0.5 bg-[#D4AF37] rounded-full origin-center"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={toggleListening}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
            isListening
              ? "bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20"
              : !isSupported
              ? "bg-white/5 border-white/5 text-[#8E9299]/40 opacity-50 cursor-not-allowed"
              : "bg-[#D4AF37]/5 border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/10"
          }`}
          title={isListening ? "Stop Voice Navigator" : "Activate Voice Command Navigator"}
          id="voice-nav-trigger-btn"
        >
          {isListening ? (
            <Mic className="h-4.5 w-4.5 animate-pulse text-red-400" />
          ) : (
            <Mic className="h-4.5 w-4.5" />
          )}
          <span className="text-[10px] font-mono font-black uppercase tracking-wider hidden md:inline">Voice</span>
        </motion.button>

        {/* Command Info Trigger */}
        <button
          onClick={() => setShowStatusPanel(!showStatusPanel)}
          className="p-1 rounded text-[#8E9299] hover:text-white transition cursor-pointer"
          title="Voice Control Center"
        >
          <Command className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Voice Control Drawer/Dropdown Panel */}
      <AnimatePresence>
        {showStatusPanel && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="absolute right-0 mt-2.5 w-76 bg-[#141417] border border-white/10 rounded-2xl p-4 shadow-2xl z-50 text-left space-y-4"
            id="voice-nav-status-panel"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <Volume2 className="h-4 w-4 text-[#D4AF37]" />
                <span className="text-[10px] font-serif font-black uppercase text-white tracking-wider">Voice Control Panel</span>
              </div>
              <button
                onClick={() => setShowStatusPanel(false)}
                className="p-0.5 hover:bg-white/5 rounded text-[#8E9299] hover:text-white transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Support and mic error alerts */}
            {!isSupported ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-start gap-2 text-[10px]">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <div>
                  <p className="font-bold">غير مدعوم / API Not Supported</p>
                  <p className="text-[#8E9299] leading-relaxed mt-0.5">
                    Your browser does not support the Web Speech API. Please upgrade to a modern Chromium browser like Chrome or Edge.
                  </p>
                </div>
              </div>
            ) : errorMsg ? (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-2 text-[10px]">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <div>
                  <p className="font-bold">صلاحية الميكروفون / Mic Permission Required</p>
                  <p className="text-[#8E9299] leading-relaxed mt-0.5">{errorMsg}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Visual Audio Input Feedbacks */}
                <div className="bg-[#0F0F12] border border-white/5 p-3 rounded-xl space-y-1.5">
                  <span className="text-[9px] font-bold text-[#8E9299] uppercase tracking-widest block">التقاط الصوت / Live Speech</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${isListening ? "bg-red-500 animate-ping" : "bg-[#8E9299]/30"}`} />
                    <p className={`text-[11px] font-mono leading-snug truncate ${transcript ? "text-white font-medium" : "text-[#8E9299]/50"}`}>
                      {transcript || "Click mic and say command..."}
                    </p>
                  </div>

                  {lastCommand && (
                    <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/5 p-1.5 rounded border border-emerald-500/15 flex items-center gap-1 mt-1 animate-pulse">
                      <Check className="h-3 w-3" />
                      <span>{lastCommand}</span>
                    </div>
                  )}
                </div>

                {/* List of valid voice phrases */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-[#8E9299] uppercase tracking-widest block">أوامر التنقل المتاحة / Navigation Vocabulary</span>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1" id="voice-commands-list">
                    {[
                      { cmd: "Go to Dashboard", desc: "فتح لوحة التحكم" },
                      { cmd: "Start Evaluation", desc: "بدء التقييم الصوتي أو الكتابي" },
                      { cmd: "Practice Skills", desc: "فتح مركز التدريب وبناء المفردات" },
                      { cmd: "Test / Assessment", desc: "بدء الاختبار التكيفي الشامل" },
                      { cmd: "TOEFL Simulator", desc: "الدخول في محاكي التوفل" },
                      { cmd: "Toggle Theme", desc: "تغيير مظهر الصفحة ليلي/نهاري" },
                      { cmd: "Show Help", desc: "عرض الدليل الكامل للمنصة" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] bg-white/5 p-1.5 rounded border border-white/5 font-mono">
                        <span className="text-[#D4AF37] font-semibold">{item.cmd}</span>
                        <span className="text-[#8E9299] text-[9px] font-serif">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="text-[9px] text-[#8E9299] uppercase tracking-widest text-center pt-2 border-t border-white/5 font-semibold">
              Say command clearly to trigger instant action.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
