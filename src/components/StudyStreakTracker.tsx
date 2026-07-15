import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Check, Calendar, Trophy, Zap, AlertCircle, X, Sparkles, Award } from "lucide-react";
import confetti from "canvas-confetti";

// Helpers for date calculations
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getYesterdayDateString = (date = new Date()) => {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateString(yesterday);
};

export const calculateStreak = (dates: string[]) => {
  if (!dates || dates.length === 0) {
    return { currentStreak: 0, activeToday: false };
  }

  const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a));
  const todayStr = getLocalDateString();
  const yesterdayStr = getYesterdayDateString();

  const hasToday = uniqueDates.includes(todayStr);
  const hasYesterday = uniqueDates.includes(yesterdayStr);

  if (!hasToday && !hasYesterday) {
    return { currentStreak: 0, activeToday: false };
  }

  let currentStreak = 0;
  let checkDate = new Date();

  if (!hasToday && hasYesterday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const checkStr = getLocalDateString(checkDate);
    if (uniqueDates.includes(checkStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { currentStreak, activeToday: hasToday };
};

interface StudyStreakTrackerProps {
  className?: string;
  onStreakUpdate?: (count: number) => void;
}

export default function StudyStreakTracker({ className = "", onStreakUpdate }: StudyStreakTrackerProps) {
  const [streakDates, setStreakDates] = useState<string[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [activeToday, setActiveToday] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load streak from localStorage on mount
  useEffect(() => {
    try {
      const storedDatesRaw = localStorage.getItem("lexicon_streak_dates");
      let dates: string[] = [];
      if (storedDatesRaw) {
        dates = JSON.parse(storedDatesRaw);
      } else {
        // Migration of legacy state if any
        const legacyStreak = localStorage.getItem("lexicon_streak_count");
        if (legacyStreak && parseInt(legacyStreak, 10) > 0) {
          const count = parseInt(legacyStreak, 10);
          // Pre-populate with previous dates to preserve user progress
          const mockDates = [];
          for (let i = 0; i < count; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            mockDates.push(getLocalDateString(d));
          }
          dates = mockDates;
          localStorage.setItem("lexicon_streak_dates", JSON.stringify(dates));
        }
      }

      setStreakDates(dates);
      const stats = calculateStreak(dates);
      setCurrentStreak(stats.currentStreak);
      setActiveToday(stats.activeToday);
      
      // Update global count in localstorage
      localStorage.setItem("lexicon_streak_count", stats.currentStreak.toString());
      if (onStreakUpdate) {
        onStreakUpdate(stats.currentStreak);
      }
    } catch (e) {
      console.error("Error reading streak dates:", e);
    }
  }, []);

  // Set up event listeners for logging activity
  useEffect(() => {
    const handleLogActivity = () => {
      const todayStr = getLocalDateString();
      setStreakDates(prev => {
        if (prev.includes(todayStr)) {
          return prev;
        }
        const updated = [todayStr, ...prev];
        localStorage.setItem("lexicon_streak_dates", JSON.stringify(updated));
        
        const stats = calculateStreak(updated);
        setCurrentStreak(stats.currentStreak);
        setActiveToday(stats.activeToday);
        localStorage.setItem("lexicon_streak_count", stats.currentStreak.toString());
        
        if (onStreakUpdate) {
          onStreakUpdate(stats.currentStreak);
        }

        // Trigger 7-day celebration if streak becomes 7 or is a multiple of 7,
        // and we haven't celebrated it yet for this specific streak value.
        if (stats.currentStreak >= 7 && stats.currentStreak % 7 === 0) {
          const lastCelebrated = parseInt(localStorage.getItem("lexicon_last_celebrated_streak") || "0", 10);
          if (lastCelebrated !== stats.currentStreak) {
            setShowCelebration(true);
            localStorage.setItem("lexicon_last_celebrated_streak", stats.currentStreak.toString());
            // Play a confetti blast
            triggerConfettiBlast();
          }
        }
        
        return updated;
      });
    };

    window.addEventListener("log-study-activity", handleLogActivity);
    return () => {
      window.removeEventListener("log-study-activity", handleLogActivity);
    };
  }, [streakDates, onStreakUpdate]);

  // Click outside listener for the popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerConfettiBlast = () => {
    try {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#D4AF37", "#F59E0B", "#EF4444"]
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#D4AF37", "#F59E0B", "#EF4444"]
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to get calendar checklist for last 7 days
  const getWeeklyCalendar = () => {
    const calendar = [];
    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      const dayName = daysOfWeek[d.getDay()];
      const isToday = i === 0;
      const hasStudied = streakDates.includes(dateStr);
      
      calendar.push({
        dateStr,
        dayName,
        isToday,
        hasStudied
      });
    }
    return calendar;
  };

  const handleManualCheckIn = () => {
    const event = new CustomEvent("log-study-activity");
    window.dispatchEvent(event);
  };

  const weeklyCalendar = getWeeklyCalendar();

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef} id="study-streak-wrapper">
      {/* Flame Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition cursor-pointer ${
          activeToday
            ? "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/20 shadow-sm shadow-[#D4AF37]/5"
            : "bg-white/5 border-white/5 text-[#8E9299] hover:bg-white/10 hover:border-white/10"
        }`}
        title={`${currentStreak} Day Study Streak${activeToday ? " (Active Today)" : " (Inactive Today)"}`}
        id="streak-flame-trigger"
      >
        <Flame
          className={`h-4.5 w-4.5 transition-transform duration-300 ${
            activeToday ? "fill-[#D4AF37] text-[#D4AF37] animate-bounce scale-110" : "text-[#8E9299]"
          }`}
        />
        <span className="font-mono text-[11px] font-black">{currentStreak}</span>
      </motion.button>

      {/* Popover Dropdown Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.25 }}
            className="absolute right-0 mt-2 w-80 bg-[#141417] border border-white/10 rounded-2xl p-5 shadow-2xl z-50 text-left"
            id="streak-dropdown-card"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Trophy className="h-4.5 w-4.5 text-[#D4AF37]" />
                <span className="text-xs font-serif font-bold uppercase text-white tracking-wider">النشاط اليومي / Study Streak</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/5 rounded text-[#8E9299] hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Streak Focus Circle */}
              <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="relative">
                  <div className="h-14 w-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                    <Flame className={`h-8 w-8 text-[#D4AF37] ${activeToday ? "fill-[#D4AF37] animate-pulse" : ""}`} />
                  </div>
                  {activeToday && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5 border border-[#141417]">
                      <Check className="h-3 w-3 text-white stroke-[3px]" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-base font-serif font-bold text-white leading-none flex items-center gap-1.5">
                    <span>{currentStreak} {currentStreak === 1 ? "يوم" : "أيام"} / {currentStreak} Days</span>
                  </h4>
                  <p className="text-[10px] text-[#8E9299] mt-1 uppercase tracking-wider font-semibold">
                    {activeToday ? "استمر في الحفاظ على الحماس اليوم! / Locked in for today!" : "أكمل نشاطاً أو سجل حضورك لتنشيط الحماس اليوم / Check in to keep it hot!"}
                  </p>
                </div>
              </div>

              {/* 7-Day Calendar Grid */}
              <div className="space-y-2">
                <span className="font-bold text-[#8E9299] uppercase tracking-widest text-[9px] block">آخر 7 أيام / Last 7 Days</span>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {weeklyCalendar.map((day, idx) => (
                    <div key={idx} className="space-y-1">
                      <span className="text-[9px] text-[#8E9299] font-medium block">{day.dayName}</span>
                      <div
                        className={`h-8 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                          day.hasStudied
                            ? "bg-[#D4AF37]/10 border-[#D4AF37]/40 text-[#D4AF37]"
                            : day.isToday
                            ? "bg-transparent border-dashed border-[#D4AF37]/40 text-[#8E9299] animate-pulse"
                            : "bg-[#0F0F12] border-white/5 text-[#8E9299]/40"
                        }`}
                        title={day.dateStr}
                      >
                        {day.hasStudied ? (
                          <Flame className="h-4 w-4 fill-[#D4AF37]" />
                        ) : (
                          <span className="text-[9px] font-mono">{day.isToday ? "•" : ""}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              {!activeToday ? (
                <button
                  onClick={handleManualCheckIn}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-[#D4AF37] hover:bg-[#E4C563] text-black font-extrabold text-[10px] py-2.5 rounded-lg transition duration-200 shadow-md shadow-[#D4AF37]/10 uppercase tracking-wider cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>تسجيل حضور اليوم / Daily Check-In</span>
                </button>
              ) : (
                <div className="text-center py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[10px] font-bold flex items-center justify-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  <span>تم حفظ حماس اليوم! / Streak Protected today!</span>
                </div>
              )}
            </div>

            {/* Motivational Footer */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[9px] text-[#8E9299] uppercase tracking-wider font-semibold">
              <span className="flex items-center gap-1">
                <Award className="h-3 w-3 text-[#D4AF37]" />
                <span>7-Day Goal / هدف 7 أيام</span>
              </span>
              <span className="text-white font-mono">{currentStreak % 7} / 7</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7-Day Streak Celebration Overlay Portal */}
      <AnimatePresence>
        {showCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" id="streak-celebration-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="bg-[#141417] border-2 border-[#D4AF37] rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden text-center text-[#E0E0E0] space-y-6"
            >
              {/* Confetti canvas decorative sparklers */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#D4AF37] via-orange-500 to-[#D4AF37]" />

              <div className="mx-auto h-24 w-24 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center relative shadow-xl shadow-[#D4AF37]/5">
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Flame className="h-14 w-14 text-[#D4AF37] fill-[#D4AF37]" />
                </motion.div>
                <div className="absolute -top-1 -right-1 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full p-1.5 shadow-md">
                  <Trophy className="h-4.5 w-4.5 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-1 text-[#D4AF37] uppercase tracking-widest text-[10px] font-black">
                  <Sparkles className="h-4 w-4 text-[#D4AF37] animate-spin" />
                  <span>إنجاز استثنائي مذهل! / Incredible Milestone!</span>
                  <Sparkles className="h-4 w-4 text-[#D4AF37] animate-spin" />
                </div>
                <h3 className="font-serif text-white font-extrabold text-2xl tracking-wide">
                  {currentStreak}-DAY STUDY STREAK!
                </h3>
                <h4 className="font-serif text-white text-base font-semibold Arabic">
                  حماس متواصل لمدة {currentStreak} أيام!
                </h4>
                <p className="text-xs text-[#8E9299] max-w-sm mx-auto leading-relaxed mt-2">
                  لقد أثبتّ التزامك التام وحققت هدف الدراسة المتواصلة لـ 7 أيام متتالية! استمر في هذا الزخم الأكاديمي الرائع.
                  <br />
                  You've shown absolute dedication and achieved a perfect consecutive study target. Keep the fire burning bright!
                </p>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-around">
                <div className="text-center">
                  <span className="text-[10px] text-[#8E9299] uppercase tracking-wider block font-bold">Current Streak</span>
                  <span className="text-2xl font-mono text-[#D4AF37] font-black mt-1 block">🔥 {currentStreak}</span>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="text-center">
                  <span className="text-[10px] text-[#8E9299] uppercase tracking-wider block font-bold">Total Days Active</span>
                  <span className="text-2xl font-mono text-emerald-400 font-black mt-1 block">✓ {streakDates.length}</span>
                </div>
              </div>

              <button
                onClick={() => setShowCelebration(false)}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-[#D4AF37] hover:bg-[#E4C563] text-black font-black text-xs py-4 rounded-xl transition duration-250 shadow-lg shadow-[#D4AF37]/20 uppercase tracking-widest cursor-pointer"
              >
                <span>متابعة التعلم / Keep Burning Bright</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
