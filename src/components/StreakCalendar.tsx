import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Zap, 
  Award, 
  Trophy, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Clock, 
  BookOpen,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  Star
} from "lucide-react";
import { CEFRLevel } from "../types";

interface StreakCalendarProps {
  userLevel: CEFRLevel | null;
  historyList: string[];
  streak: number;
  bestStreak: number;
  onUpdateHistoryList: (newHistory: string[]) => void;
  onNavigate: (tab: "dashboard" | "test" | "evaluator" | "practice") => void;
}

// Recalculates current and best streaks based on historyList (dates in YYYY-MM-DD local format)
export const calculateStreaks = (history: string[]) => {
  if (history.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get unique, sorted dates (oldest first)
  const sortedDates = [...new Set(history)]
    .map(dateStr => {
      const [y, m, d] = dateStr.split("-").map(Number);
      return new Date(y, m - 1, d);
    })
    .sort((a, b) => a.getTime() - b.getTime());

  // Calculate best streak
  let bestStreak = 0;
  let currentChain = 0;
  let prevTime: number | null = null;

  for (const date of sortedDates) {
    const time = date.getTime();
    if (prevTime === null) {
      currentChain = 1;
    } else {
      const diffDays = Math.round((time - prevTime) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentChain++;
      } else if (diffDays > 1) {
        if (currentChain > bestStreak) {
          bestStreak = currentChain;
        }
        currentChain = 1;
      }
    }
    prevTime = time;
  }
  if (currentChain > bestStreak) {
    bestStreak = currentChain;
  }

  // Calculate current streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = getLocalDateString(today);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const yesterdayStr = getLocalDateString(yesterday);

  let currentStreak = 0;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  if (history.includes(todayStr)) {
    while (history.includes(getLocalDateString(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else if (history.includes(yesterdayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
    while (history.includes(getLocalDateString(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  return { currentStreak, bestStreak };
};

export default function StreakCalendar({ 
  userLevel, 
  historyList, 
  streak, 
  bestStreak, 
  onUpdateHistoryList,
  onNavigate 
}: StreakCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper to get local date string YYYY-MM-DD
  const getLocalDateString = (d: Date) => {
    const yStr = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, "0");
    const dStr = String(d.getDate()).padStart(2, "0");
    return `${yStr}-${mStr}-${dStr}`;
  };

  // Calendar setup helpers
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (dayNum: number) => {
    const dayDate = new Date(year, month, dayNum);
    setSelectedDayStr(getLocalDateString(dayDate));
  };

  const toggleDayPractice = (dateStr: string) => {
    let newHistoryList = [...historyList];
    if (newHistoryList.includes(dateStr)) {
      newHistoryList = newHistoryList.filter(d => d !== dateStr);
    } else {
      newHistoryList.push(dateStr);
    }
    onUpdateHistoryList(newHistoryList);
  };

  // Month stats calculation
  const getMonthStats = () => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = getLocalDateString(new Date(year, month, d));
      if (historyList.includes(dateStr)) {
        count++;
      }
    }
    const percent = daysInMonth > 0 ? Math.round((count / daysInMonth) * 100) : 0;
    return { count, percent };
  };

  const monthStats = getMonthStats();

  const getWeekDays = () => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Selected Day Details
  const getSelectedDayDetails = () => {
    if (!selectedDayStr) return null;
    const [y, m, d] = selectedDayStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayNameStr = dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const isCompleted = historyList.includes(selectedDayStr);
    const isDayToday = selectedDayStr === getLocalDateString(new Date());

    return {
      dateStr: selectedDayStr,
      dayName: dayNameStr,
      isCompleted,
      isToday: isDayToday,
      isFuture: dateObj.getTime() > new Date().setHours(23, 59, 59, 999)
    };
  };

  const selectedDetails = getSelectedDayDetails();

  // Motivational CEFR-tailored guidance
  const getCEFRTip = (level: CEFRLevel | null) => {
    const lvl = level || "B1";
    switch(lvl) {
      case "A0":
      case "A1":
        return {
          title: "A1 Starter Strategy",
          desc: "Practice with daily nouns, basic greetings, and cardinal numbers. Small 5-minute sessions build strong phonetic connections!",
          vocab: "Hello, Goodbye, Pleased to meet you, Thank you."
        };
      case "A2":
        return {
          title: "A2 Elementary Growth",
          desc: "Connect short clauses with basic conjunctions like 'and', 'but', or 'because'. Complete reading flashcards daily.",
          vocab: "Furthermore, Although, In addition, Consequently."
        };
      case "B1":
        return {
          title: "B1 Intermediate Consistency",
          desc: "Work on descriptive monologues about hobbies or career aspirations. Practice answering adaptive listening tasks.",
          vocab: "Particularly, Typically, Essentially, Alternatively."
        };
      case "B2":
        return {
          title: "B2 Upper-Intermediate Focus",
          desc: "Incorporate active structural templates into your essays. Use transition signals to improve lexical coherence score.",
          vocab: "Notwithstanding, Paradoxically, Subsequently, Corroborate."
        };
      case "C1":
      case "C2":
        return {
          title: "C1/C2 Advanced Fluency",
          desc: "Dwell in high-complexity debates. Use native-like idiomatic expressions and perfect your pronunciation nuance in the AI Speaking box.",
          vocab: "Quintessential, Ephemeral, Paradigmatic, Ubiquitous."
        };
    }
  };

  const levelTip = getCEFRTip(userLevel);

  // Define Consistency Milestones
  const consistencyMilestones = [
    { threshold: 3, label: "Bronze", desc: "3 Practice Days Completed", icon: Award, color: "text-amber-600 border-amber-600/35 bg-amber-600/5" },
    { threshold: 7, label: "Silver", desc: "7 Practice Days Completed", icon: Trophy, color: "text-slate-300 border-slate-300/35 bg-slate-300/5" },
    { threshold: 15, label: "Gold", desc: "15 Practice Days Completed", icon: Star, color: "text-[#D4AF37] border-[#D4AF37]/35 bg-[#D4AF37]/5" },
    { threshold: 25, label: "Platinum", desc: "25 Practice Days Completed", icon: Sparkles, color: "text-[#E5C158] border-[#E5C158]/35 bg-[#E5C158]/5" }
  ];

  return (
    <div className="bg-[#141417] border border-white/5 rounded-xl p-5 md:p-6 shadow-2xl space-y-6" id="streak-calendar-section">
      
      {/* Interactive Title & Explanation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#D4AF37]" />
            <span>Active Study Calendar & Streaks</span>
          </h3>
          <p className="text-xs text-[#8E9299] mt-1">
            Track daily accomplishments, click days to log practice sessions retroactively, and unlock consistency milestones.
          </p>
        </div>

        {/* Level indicator banner */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="font-mono text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-2.5 py-1 rounded border border-[#D4AF37]/25 font-bold uppercase tracking-wider">
            CEFR {userLevel || "B1"} Tracker
          </span>
          <span className="text-[9px] text-white font-mono bg-[#FF4500]/10 border border-[#FF4500]/25 text-[#FF4500] px-2.5 py-1 rounded font-bold flex items-center gap-1">
            <Flame className="h-3 w-3 animate-pulse fill-current" /> {streak} Day Streak
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Interactive Calendar Grid (Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Calendar Controller Header */}
          <div className="flex items-center justify-between bg-[#0F0F12] p-3 rounded-lg border border-white/5">
            <button 
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white/5 text-[#8E9299] hover:text-white rounded transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>

            <div className="text-xs font-serif font-bold text-white uppercase tracking-wider select-none">
              {monthNames[month]} {year}
            </div>

            <button 
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white/5 text-[#8E9299] hover:text-white rounded transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Monthly Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {/* Weekdays */}
            {getWeekDays().map((day) => (
              <div key={day} className="text-[9px] font-mono font-bold text-[#8E9299] uppercase py-1 select-none">
                {day}
              </div>
            ))}

            {/* Empty padding cells */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square bg-[#0F0F12]/20 border border-transparent rounded-lg" />
            ))}

            {/* Days list */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = getLocalDateString(new Date(year, month, dayNum));
              const hasPracticed = historyList.includes(dateStr);
              const isToday = dateStr === getLocalDateString(new Date());
              const isSelected = dateStr === selectedDayStr;

              return (
                <motion.button
                  key={`day-${dayNum}`}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleSelectDay(dayNum)}
                  className={`aspect-square rounded-lg border flex flex-col items-center justify-between p-1.5 transition select-none cursor-pointer relative overflow-hidden ${
                    hasPracticed
                      ? "bg-gradient-to-br from-[#FF4500]/20 to-[#FF8C00]/10 border-[#FF4500]/40 text-white"
                      : isToday
                      ? "bg-[#D4AF37]/10 border-[#D4AF37]/50 text-white"
                      : isSelected
                      ? "bg-white/10 border-white/30 text-white"
                      : "bg-[#0F0F12] border-white/5 text-[#8E9299] hover:border-white/20"
                  }`}
                >
                  {/* Subtle active flame glow backing */}
                  {hasPracticed && (
                    <div className="absolute -right-2 -bottom-2 h-6 w-6 rounded-full bg-[#FF4500]/10 blur-sm" />
                  )}

                  <span className={`text-[10px] font-bold ${isToday ? "text-[#D4AF37] underline underline-offset-2" : ""}`}>
                    {dayNum}
                  </span>

                  {/* Day Status Icon */}
                  <div className="h-4 w-4 flex items-center justify-center">
                    {hasPracticed ? (
                      <Flame className="h-3 w-3 text-[#FF4500] fill-current animate-pulse" />
                    ) : isToday ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                    ) : null}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Month Consistency stats inside Calendar box */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-[#0F0F12] border border-white/5 rounded-lg p-3 text-center">
              <span className="text-[8px] font-bold text-[#8E9299] uppercase tracking-widest block mb-1">Active Study Days</span>
              <div className="font-mono text-base font-extrabold text-[#D4AF37]">{monthStats.count} <span className="text-[10px] text-[#8E9299] font-sans">/ {daysInMonth}</span></div>
            </div>
            <div className="bg-[#0F0F12] border border-white/5 rounded-lg p-3 text-center">
              <span className="text-[8px] font-bold text-[#8E9299] uppercase tracking-widest block mb-1">Consistency Rating</span>
              <div className="font-mono text-base font-extrabold text-[#FF4500]">{monthStats.percent}%</div>
            </div>
          </div>

        </div>

        {/* Right Side: Day Details, Active Simulation & Goals (Span 5) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Selected Day Inspector Panel */}
          <div className="bg-[#0F0F12] border border-white/5 rounded-xl p-4 space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
              <Clock className="h-4 w-4 text-[#D4AF37]" />
              <span className="text-[10px] font-serif text-white uppercase tracking-widest font-extrabold">Day Inspector</span>
            </div>

            {selectedDetails ? (
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-serif font-bold text-white tracking-wide">{selectedDetails.dayName}</h4>
                  <span className="text-[8px] font-mono text-[#8E9299] uppercase">Date String: {selectedDetails.dateStr}</span>
                </div>

                {/* Completion Status Badge */}
                <div className={`p-3 rounded-lg border text-xs leading-relaxed flex items-center gap-3 ${
                  selectedDetails.isCompleted
                    ? "bg-[#FF4500]/10 border-[#FF4500]/30 text-white"
                    : "bg-[#141417] border-white/5 text-[#8E9299]"
                }`}>
                  {selectedDetails.isCompleted ? (
                    <>
                      <Flame className="h-5 w-5 text-[#FF4500] shrink-0 fill-current animate-bounce" />
                      <div>
                        <strong className="text-white uppercase font-bold text-[10px] tracking-wide block">Practiced & Logged</strong>
                        Earned +50 Consistency XP on this calendar date!
                      </div>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="h-5 w-5 text-[#8E9299] shrink-0" />
                      <div>
                        <strong className="text-[#8E9299] uppercase font-bold text-[10px] tracking-wide block">No Activity Recorded</strong>
                        Practice today's recommended competencies to fill this day.
                      </div>
                    </>
                  )}
                </div>

                {/* Day Actions */}
                <div className="space-y-2 pt-2">
                  {selectedDetails.isFuture ? (
                    <div className="text-[10px] text-[#8E9299] italic text-center py-2 bg-[#141417] rounded-lg border border-white/5">
                      ⏳ Future dates cannot be practiced or logged ahead of schedule!
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleDayPractice(selectedDetails.dateStr)}
                        className={`w-full text-center font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-lg transition cursor-pointer border ${
                          selectedDetails.isCompleted
                            ? "bg-white/5 hover:bg-white/10 text-[#C8C8CC] border-white/10"
                            : "bg-gradient-to-r from-[#FF4500] to-[#FF8C00] hover:brightness-110 text-white border-transparent shadow-lg shadow-[#FF4500]/20"
                        }`}
                      >
                        {selectedDetails.isCompleted ? "🗑️ Remove Study Log" : "🔥 Log Retroactive Practice"}
                      </button>

                      {/* Launch practice option */}
                      <button
                        onClick={() => onNavigate("practice")}
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/25 px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition cursor-pointer"
                      >
                        <span>Start Real Practice Task</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#8E9299] text-center py-4">Select a calendar square to view logging details.</p>
            )}
          </div>

          {/* Dynamic consistency Milestones Card */}
          <div className="bg-[#0F0F12] border border-white/5 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-[10px] font-serif text-white uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-[#D4AF37]" /> Consistency Badges
              </span>
              <span className="text-[9px] font-mono text-[#8E9299] font-bold">Total Practice Days: {historyList.length}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {consistencyMilestones.map((m) => {
                const Icon = m.icon;
                const isUnlocked = historyList.length >= m.threshold;
                return (
                  <div 
                    key={m.label}
                    className={`p-2.5 rounded-lg border text-left transition flex items-center gap-2.5 ${
                      isUnlocked 
                        ? `${m.color} scale-100` 
                        : "bg-transparent border-white/5 text-[#62656B] filter grayscale"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <div>
                      <strong className={`text-[9px] uppercase tracking-wider block ${isUnlocked ? "text-white" : "text-[#62656B]"}`}>{m.label}</strong>
                      <span className="text-[8px] leading-tight block">{m.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Level Tip Card */}
          <div className="bg-gradient-to-r from-[#D4AF37]/5 to-transparent border border-[#D4AF37]/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Recommended daily checklist</span>
            </div>
            <h4 className="text-xs font-serif font-extrabold text-white uppercase tracking-wider">{levelTip?.title}</h4>
            <p className="text-[11px] text-[#8E9299] leading-relaxed">{levelTip?.desc}</p>
            <div className="text-[10px] bg-black/45 p-2 rounded border border-white/5 text-[#E5C158] font-mono">
              <span className="text-[8px] text-[#8E9299] block font-sans font-bold uppercase tracking-widest mb-0.5">Focus Keywords:</span>
              {levelTip?.vocab}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
