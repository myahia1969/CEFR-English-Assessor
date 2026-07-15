import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  Search, 
  TrendingUp, 
  Globe, 
  Sparkles, 
  Zap, 
  Award, 
  Check, 
  RefreshCw,
  Users,
  ChevronUp,
  UserCheck
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  arabicName: string;
  country: string;
  flag: string;
  level: string;
  xp: number;
  isCurrentUser?: boolean;
}

interface CommunityLeaderboardProps {
  userXp: number;
  userLevel: string | null;
  onClose?: () => void;
}

export default function CommunityLeaderboard({ userXp, userLevel }: CommunityLeaderboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLeague, setActiveLeague] = useState<"global" | "weekly">("global");
  const [activityLogs, setActivityLogs] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Base simulated participants
  const [simulatedUsers, setSimulatedUsers] = useState<Participant[]>(() => {
    // Check if we already have simulated users in localStorage to persist their randomized points
    const stored = localStorage.getItem("lexicon_leaderboard_users");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse stored leaderboard users", e);
      }
    }
    
    return [
      { id: "user_1", name: "Yusuf Al-Harbi", arabicName: "يوسف الحربي", country: "Saudi Arabia", flag: "🇸🇦", level: "C1", xp: 2450 },
      { id: "user_2", name: "Yuki Tanaka", arabicName: "يوكي تاناكا", country: "Japan", flag: "🇯🇵", level: "B2", xp: 1980 },
      { id: "user_3", name: "Elena Fischer", arabicName: "إيلينا فيشر", country: "Germany", flag: "🇩🇪", level: "C1", xp: 1650 },
      { id: "user_4", name: "John Sterling", arabicName: "جون ستيرلينغ", country: "USA", flag: "🇺🇸", level: "B2", xp: 1420 },
      { id: "user_5", name: "Min-ji Seo", arabicName: "مين جي سو", country: "South Korea", flag: "🇰🇷", level: "B2", xp: 1120 },
      { id: "user_6", name: "Amara Okafor", arabicName: "أمارا أوكافور", country: "Nigeria", flag: "🇳🇬", level: "B1", xp: 880 },
      { id: "user_7", name: "Diego Silva", arabicName: "دييغو سيلفا", country: "Brazil", flag: "🇧🇷", level: "A2", xp: 620 },
      { id: "user_8", name: "Chloe Laurent", arabicName: "كلوي لوران", country: "France", flag: "🇫🇷", level: "B1", xp: 480 },
      { id: "user_9", name: "Ahmed Mansour", arabicName: "أحمد منصور", country: "Egypt", flag: "🇪🇬", level: "B2", xp: 320 }
    ];
  });

  // Save simulated users when their XP updates
  useEffect(() => {
    localStorage.setItem("lexicon_leaderboard_users", JSON.stringify(simulatedUsers));
  }, [simulatedUsers]);

  // Merge the active user dynamically into the participants list
  const participants = useMemo(() => {
    const list: Participant[] = [
      ...simulatedUsers,
      {
        id: "active_user",
        name: "Fatima (You)",
        arabicName: "فاطمة (أنت)",
        country: "Active Learner",
        flag: "👑",
        level: userLevel || "Pre-A1",
        xp: userXp,
        isCurrentUser: true
      }
    ];

    // Sort by XP descending
    return list.sort((a, b) => b.xp - a.xp);
  }, [simulatedUsers, userXp, userLevel]);

  // Find active user's rank
  const activeUserRank = useMemo(() => {
    return participants.findIndex(p => p.isCurrentUser) + 1;
  }, [participants]);

  // Simulate global study actions in real-time
  const simulateLiveStudyEvent = () => {
    const eventTemplates = [
      "{name} completed a 2-minute Quick Study! (+25 XP)",
      "{name} finished an Adaptive Placement test! (+100 XP)",
      "{name} evaluated an essay with AI! (+50 XP)",
      "{name} achieved a new CEFR Level milestone! (+200 XP)",
      "{name} claimed daily learning streak bonus! (+150 XP)",
      "{name} completed the daily vocabulary SRS cards! (+30 XP)",
      "{name} ran a TOEFL reading simulation! (+80 XP)"
    ];

    const randomUserIdx = Math.floor(Math.random() * simulatedUsers.length);
    const targetUser = simulatedUsers[randomUserIdx];
    const randomTemplateIdx = Math.floor(Math.random() * eventTemplates.length);
    const template = eventTemplates[randomTemplateIdx];

    // Calculate XP gain based on template
    let xpGain = 25;
    if (template.includes("+100")) xpGain = 100;
    else if (template.includes("+50")) xpGain = 50;
    else if (template.includes("+200")) xpGain = 200;
    else if (template.includes("+150")) xpGain = 150;
    else if (template.includes("+30")) xpGain = 30;
    else if (template.includes("+80")) xpGain = 80;

    // Update target user's XP
    setSimulatedUsers(prev => {
      return prev.map((u, idx) => {
        if (idx === randomUserIdx) {
          const nextXp = u.xp + xpGain;
          // Dynamically level up if they accumulate a lot of XP
          let nextLevel = u.level;
          if (nextXp > 2200 && u.level !== "C1") nextLevel = "C1";
          else if (nextXp > 1300 && u.level === "B1") nextLevel = "B2";
          
          return {
            ...u,
            xp: nextXp,
            level: nextLevel
          };
        }
        return u;
      });
    });

    // Add activity log
    const formattedLog = template.replace("{name}", targetUser.name);
    setActivityLogs(prev => [formattedLog, ...prev.slice(0, 4)]);
    setLastUpdated(new Date());
  };

  // Trigger initial live study simulation and set up interval
  useEffect(() => {
    const initialLogs = [
      "Elena Fischer completed a speaking assessment (+50 XP)",
      "Yusuf Al-Harbi reached a 14-day study streak! (+100 XP)",
      "Yuki Tanaka answered 5 grammar questions perfectly (+30 XP)"
    ];
    setActivityLogs(initialLogs);

    // Randomly simulate actions every 15-25 seconds
    const timer = setInterval(() => {
      simulateLiveStudyEvent();
    }, 20000);

    return () => clearInterval(timer);
  }, [simulatedUsers]);

  // Filter participants based on search query
  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return participants;
    const query = searchQuery.toLowerCase();
    return participants.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.arabicName.includes(query) ||
      p.country.toLowerCase().includes(query) ||
      p.level.toLowerCase().includes(query)
    );
  }, [participants, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#141417] to-[#0F0F12] rounded-xl border border-white/10 p-6 md:p-8 shadow-2xl space-y-6"
      id="community-leaderboard-panel"
    >
      {/* Decorative top corner background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-[#D4AF37]/5 blur-2xl pointer-events-none" />

      {/* Header Layout */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-[#D4AF37]/15 rounded-lg text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
            <Trophy className="h-6 w-6 text-[#D4AF37] animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-[#8E9299] tracking-widest uppercase">Global Academy Ranking</span>
            <h3 className="text-base font-serif text-white uppercase tracking-wider flex items-center gap-2">
              لوحة الصدارة ومجتمع الدارسين <span className="text-xs text-[#D4AF37] font-sans font-bold">/ Community Leaderboard</span>
            </h3>
            <p className="text-xs text-[#8E9299] leading-relaxed">
              Compete with language learners worldwide. Accumulate XP points from daily training to rise up the rankings.
            </p>
          </div>
        </div>

        {/* Global Statistics Indicators */}
        <div className="flex items-center gap-3 bg-[#0F0F12] border border-white/5 p-2 rounded-xl self-start lg:self-auto shrink-0">
          <div className="flex flex-col text-right px-2" dir="rtl">
            <span className="text-[10px] font-bold text-white">ترتيبك الحالي / Your Rank:</span>
            <span className="text-[11px] text-[#D4AF37] font-mono font-black">
              #{activeUserRank} of {participants.length}
            </span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <button
            onClick={simulateLiveStudyEvent}
            className="p-2 hover:bg-white/5 rounded-lg text-[#8E9299] hover:text-white transition cursor-pointer"
            title="Refresh Live Study Feed"
            id="refresh-live-feed-btn"
          >
            <RefreshCw className="h-4 w-4 animate-spin-slow" />
          </button>
        </div>
      </div>

      {/* Control Actions Panel (Search and League Presets) */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Field */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8E9299]" />
          <input
            type="text"
            placeholder="ابحث عن دارس... / Search learners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0F0F12] text-xs text-white placeholder-[#8E9299] pl-9 pr-4 py-2.5 rounded-lg border border-white/5 focus:border-[#D4AF37]/35 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/35 transition"
            id="leaderboard-search-input"
          />
        </div>

        {/* Division Tab Toggles */}
        <div className="flex items-center p-1 bg-[#0F0F12] border border-white/5 rounded-lg w-full md:w-auto">
          <button
            onClick={() => setActiveLeague("global")}
            className={`flex-1 md:flex-initial px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition cursor-pointer ${
              activeLeague === "global"
                ? "bg-[#D4AF37] text-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All-Time Global
          </button>
          <button
            onClick={() => setActiveLeague("weekly")}
            className={`flex-1 md:flex-initial px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition cursor-pointer ${
              activeLeague === "weekly"
                ? "bg-[#D4AF37] text-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Weekly League
          </button>
        </div>

      </div>

      {/* Main Grid: Leaderboard + Live Ticker Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leaderboard Table (2/3 columns) */}
        <div className="lg:col-span-2 space-y-2 max-h-[380px] overflow-y-auto pr-1" id="leaderboard-scroll-container">
          <AnimatePresence>
            {filteredParticipants.map((participant, index) => {
              const rank = index + 1;
              const isCurrentUser = participant.isCurrentUser;
              
              // Rank style definitions
              let rankBadge = `${rank}`;
              let rankStyle = "bg-white/5 border-white/5 text-[#8E9299]";
              if (rank === 1) {
                rankBadge = "🥇";
                rankStyle = "bg-[#D4AF37]/20 border-[#D4AF37]/30 text-[#D4AF37] font-black";
              } else if (rank === 2) {
                rankBadge = "🥈";
                rankStyle = "bg-slate-300/10 border-slate-300/20 text-slate-300";
              } else if (rank === 3) {
                rankBadge = "🥉";
                rankStyle = "bg-amber-600/10 border-amber-600/20 text-amber-500";
              }

              return (
                <motion.div
                  key={participant.id}
                  layoutId={`leaderboard-row-${participant.id}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isCurrentUser 
                      ? "bg-[#D4AF37]/10 border-[#D4AF37]/45 shadow-[0_0_15px_rgba(212,175,55,0.08)]" 
                      : "bg-[#0F0F12]/60 border-white/5 hover:bg-white/5"
                  }`}
                >
                  {/* Left Side: Rank, Avatar & Name details */}
                  <div className="flex items-center gap-3">
                    
                    {/* Rank Circle */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-mono font-bold ${rankStyle}`}>
                      {rankBadge}
                    </div>

                    {/* Avatar Initials with Flag badge */}
                    <div className="relative">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border ${
                        isCurrentUser 
                          ? "bg-gradient-to-tr from-amber-500 to-[#D4AF37] text-black border-[#D4AF37]" 
                          : "bg-slate-800 text-white border-white/10"
                      }`}>
                        {participant.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      
                      {/* Simulated Flag Overlay */}
                      <span className="absolute -bottom-1 -right-1 text-xs">
                        {participant.flag}
                      </span>
                    </div>

                    {/* Participant Identifiers */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{participant.name}</span>
                        {isCurrentUser && (
                          <UserCheck className="h-3.5 w-3.5 text-[#D4AF37] animate-pulse" title="This is you!" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#8E9299]">
                        <span>{participant.country}</span>
                        <span>•</span>
                        <span className="text-[#D4AF37] font-bold">Level {participant.level}</span>
                      </div>
                    </div>

                  </div>

                  {/* Right Side: Total Accumulated Points (XP) */}
                  <div className="text-right flex items-center gap-3">
                    <div className="flex flex-col justify-center">
                      <span className="text-xs font-mono font-bold text-white">{participant.xp.toLocaleString()} XP</span>
                      <span className="text-[9px] text-[#8E9299] font-mono">accumulated</span>
                    </div>

                    {/* Decorative trend icon */}
                    <div className={`p-1.5 rounded-lg ${isCurrentUser ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "bg-white/5 text-slate-500"}`}>
                      <ChevronUp className="h-3 w-3 animate-bounce" />
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Live Interaction Feed & Interactive Motivation Board (1/3 column) */}
        <div className="space-y-4">
          
          {/* Live Activity Stream Panel */}
          <div className="bg-[#0F0F12] border border-white/5 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-[9px] font-extrabold text-[#D4AF37] tracking-widest uppercase">Live Activity Stream</span>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="space-y-2 max-h-[140px] overflow-hidden">
              <AnimatePresence initial={false}>
                {activityLogs.map((log, index) => (
                  <motion.div
                    key={log + index}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-2 text-[10px] leading-relaxed text-[#8E9299]"
                  >
                    <span className="text-[#D4AF37] shrink-0 mt-0.5">⚡</span>
                    <p className="text-slate-300 text-justify">{log}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <p className="text-[9px] text-slate-500 text-right italic pt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>

          {/* Golden Interactive Motivation Banner */}
          <div className="bg-gradient-to-b from-[#1E1A12] to-[#120F0A] border border-[#D4AF37]/25 rounded-xl p-4 space-y-2.5">
            <h4 className="text-xs font-serif font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#D4AF37] shrink-0 animate-pulse" />
              نصيحة المنافسة الأسبوعية / Study League
            </h4>
            
            <div className="space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
              <p className="text-right" dir="rtl">
                حافظ على متتاليتك اليومية ونفّذ تقييمات صوتية في المقيم لتربح نقاط XP إضافية تتجاوز بها زملائك بالمنصة!
              </p>
              <p className="italic text-[#8E9299]">
                Complete daily study targets, score essays, and perform speech drills in the evaluator to accumulate huge double-XP streaks and secure your top-tier bracket rank!
              </p>
            </div>
          </div>

        </div>

      </div>

    </motion.div>
  );
}
