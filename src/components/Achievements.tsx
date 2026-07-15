import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  Award, 
  BookOpen, 
  Mic, 
  Flame, 
  FileText, 
  Compass, 
  TrendingUp,
  CheckCircle,
  Clock,
  Sparkles,
  Zap,
  ChevronRight,
  HelpCircle,
  X
} from "lucide-react";
import { CEFRLevel, EvaluationHistoryEntry } from "../types";

interface AchievementsProps {
  userLevel: CEFRLevel | null;
  stats: {
    testsTaken: number;
    practiceQuestions: number;
    evaluations: number;
    accuracy: number;
  };
  testHistory: Array<{
    date: string;
    score: number;
    stabilizedLevel: CEFRLevel;
  }>;
  evaluationHistory?: EvaluationHistoryEntry[];
}

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: "practice" | "test" | "evaluation" | "streak" | "academic";
  unlocked: boolean;
  progress: number;
  targetText: string;
  hint: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  color: string;
  borderColor: string;
  bgGlow: string;
}

export default function Achievements({ userLevel, stats, testHistory, evaluationHistory = [] }: AchievementsProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [streak, setStreak] = useState(0);

  // Load the current streak from localstorage for dynamic calculations
  useEffect(() => {
    const storedStreak = parseInt(localStorage.getItem("lexicon_streak_count") || "0", 10);
    setStreak(storedStreak);
    
    // Automatically persist the "Early Bird" badge if accessed before 9:00 AM local time
    const currentHour = new Date().getHours();
    if (currentHour < 9) {
      localStorage.setItem("lexicon_badge_early_bird", "true");
    }
  }, []);

  // Compute unlock states dynamically
  const badges: Badge[] = [
    {
      id: "early_bird",
      title: "Early Bird",
      description: "Activate your mind early. Completed a study practice or checked in before 9:00 AM.",
      icon: Clock,
      category: "streak",
      unlocked: localStorage.getItem("lexicon_badge_early_bird") === "true" || new Date().getHours() < 9,
      progress: (localStorage.getItem("lexicon_badge_early_bird") === "true" || new Date().getHours() < 9) ? 100 : 0,
      targetText: "Completed before 09:00 AM",
      hint: "Access the academy, complete a practice question, or claim your daily streak in the morning hours before 09:00 AM.",
      rarity: "Rare",
      color: "text-amber-400",
      borderColor: "border-amber-400/30",
      bgGlow: "from-amber-400/10 to-transparent"
    },
    {
      id: "grammar_guru",
      title: "Grammar Guru",
      description: "Excel at syntax and accuracy with high precision in questions.",
      icon: CheckCircle,
      category: "practice",
      unlocked: stats.practiceQuestions >= 5 && stats.accuracy >= 80,
      progress: stats.practiceQuestions >= 5 ? Math.min(100, Math.round(stats.accuracy)) : Math.round((stats.practiceQuestions / 5) * 100),
      targetText: `${stats.practiceQuestions}/5 Qs, ${stats.accuracy}% Acc`,
      hint: "Answer at least 5 practice questions and maintain an overall accuracy rate above 80%.",
      rarity: "Epic",
      color: "text-indigo-400",
      borderColor: "border-indigo-400/30",
      bgGlow: "from-indigo-400/10 to-transparent"
    },
    {
      id: "speaking_pro",
      title: "Speaking Pro",
      description: "Unlock speaking excellence by receiving active oral and conversation assessments.",
      icon: Mic,
      category: "evaluation",
      unlocked: stats.evaluations >= 2,
      progress: Math.min(100, Math.round((stats.evaluations / 2) * 100)),
      targetText: `${stats.evaluations} / 2 Evals`,
      hint: "Complete at least 2 speaking feedback evaluations or active roleplay session turn recordings.",
      rarity: "Epic",
      color: "text-rose-400",
      borderColor: "border-rose-400/30",
      bgGlow: "from-rose-400/10 to-transparent"
    },
    {
      id: "vocabulary_master",
      title: "Vocabulary Master",
      description: "Excel at terminology by answering 10 or more practice questions.",
      icon: BookOpen,
      category: "practice",
      unlocked: stats.practiceQuestions >= 10,
      progress: Math.min(100, Math.round((stats.practiceQuestions / 10) * 100)),
      targetText: `${stats.practiceQuestions} / 10 Questions`,
      hint: "Practice with the vocabulary flashcards on A1, B1, or B2 levels to unlock.",
      rarity: "Common",
      color: "text-amber-500",
      borderColor: "border-amber-500/30",
      bgGlow: "from-amber-500/10 to-transparent"
    },
    {
      id: "fluent_speaker",
      title: "Fluent Speaker",
      description: "Express arguments fluently with at least 3 speech or writing evaluations.",
      icon: Trophy,
      category: "evaluation",
      unlocked: stats.evaluations >= 3,
      progress: Math.min(100, Math.round((stats.evaluations / 3) * 100)),
      targetText: `${stats.evaluations} / 3 Evaluations`,
      hint: "Use the essay scorer, speaking evaluator, or new Roleplay Arena to get detailed evaluations.",
      rarity: "Rare",
      color: "text-emerald-400",
      borderColor: "border-emerald-400/30",
      bgGlow: "from-emerald-400/10 to-transparent"
    },
    {
      id: "adaptive_pioneer",
      title: "Adaptive Pioneer",
      description: "Take the primary step by completing an Adaptive Placement Assessment.",
      icon: Compass,
      category: "test",
      unlocked: stats.testsTaken >= 1,
      progress: stats.testsTaken >= 1 ? 100 : 0,
      targetText: `${stats.testsTaken} / 1 Test Taken`,
      hint: "Initiate and finish a full adaptive level examination to calibrate your CEFR score.",
      rarity: "Common",
      color: "text-blue-400",
      borderColor: "border-blue-400/30",
      bgGlow: "from-blue-400/10 to-transparent"
    },
    {
      id: "scholarly_accuracy",
      title: "Scholarly Writer",
      description: "Maintain an overall assessment accuracy of 75% or higher.",
      icon: FileText,
      category: "academic",
      unlocked: stats.accuracy >= 75 && stats.testsTaken >= 1,
      progress: stats.testsTaken >= 1 ? Math.min(100, Math.round((stats.accuracy / 75) * 100)) : 0,
      targetText: `${stats.accuracy}% / 75% Accuracy`,
      hint: "Answer assessment questions carefully to maintain high accuracy above 75%.",
      rarity: "Epic",
      color: "text-purple-400",
      borderColor: "border-purple-400/30",
      bgGlow: "from-purple-400/10 to-transparent"
    },
    {
      id: "consistency_champion",
      title: "Consistency Champion",
      description: "Commit to continuous study with a streak of 3 consecutive days.",
      icon: Flame,
      category: "streak",
      unlocked: streak >= 3,
      progress: Math.min(100, Math.round((streak / 3) * 100)),
      targetText: `${streak} / 3 Day Streak`,
      hint: "Log in and complete at least one exercise or manual claim for 3 days in a row.",
      rarity: "Rare",
      color: "text-orange-500",
      borderColor: "border-orange-500/30",
      bgGlow: "from-orange-500/10 to-transparent"
    },
    {
      id: "speed_demon",
      title: "Speed Demon",
      description: "Complete a rapid-fire 2-minute vocabulary Quick Study quiz.",
      icon: Zap,
      category: "practice",
      unlocked: localStorage.getItem("lexicon_badge_speed_demon") === "true",
      progress: localStorage.getItem("lexicon_badge_speed_demon") === "true" ? 100 : 0,
      targetText: localStorage.getItem("lexicon_badge_speed_demon") === "true" ? "100% Unlocked" : "Locked",
      hint: "Access the Skills Training Hub, switch to the Vocabulary tab, and successfully finish the 2-minute 'Quick Study' quiz.",
      rarity: "Epic",
      color: "text-amber-400",
      borderColor: "border-amber-400/30",
      bgGlow: "from-amber-400/10 to-transparent"
    },
    {
      id: "grand_evaluator",
      title: "Grand Evaluator",
      description: "Master of communicative critique. Completed at least 10 speech or writing evaluations.",
      icon: Award,
      category: "evaluation",
      unlocked: stats.evaluations >= 10,
      progress: Math.min(100, Math.round((stats.evaluations / 10) * 100)),
      targetText: `${stats.evaluations} / 10 Evaluations`,
      hint: "Submit 10 essays or spoken recordings to the AI Speech & Essay Evaluator to claim this legendary badge.",
      rarity: "Legendary",
      color: "text-[#D4AF37]",
      borderColor: "border-[#D4AF37]/40",
      bgGlow: "from-[#D4AF37]/15 to-transparent"
    },
    {
      id: "cefr_milestone",
      title: "C-Level Academic",
      description: "Achieve Advanced (C1) or Mastery (C2) CEFR status on Fatima Academy.",
      icon: Trophy,
      category: "academic",
      unlocked: userLevel ? ["C1", "C2"].includes(userLevel) : false,
      progress: userLevel ? (["C1", "C2"].includes(userLevel) ? 100 : userLevel.startsWith("B") ? 60 : 30) : 0,
      targetText: userLevel ? `Level ${userLevel}` : "Pre-A1",
      hint: "Unlock this ultimate badge by getting rated C1 or C2 in either placements or evaluations.",
      rarity: "Legendary",
      color: "text-[#D4AF37]",
      borderColor: "border-[#D4AF37]/40",
      bgGlow: "from-[#D4AF37]/15 to-transparent"
    }
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalBadges = badges.length;
  const overallPercent = Math.round((unlockedCount / totalBadges) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#141417] to-[#0F0F12] rounded-xl border border-white/10 p-6 md:p-8 shadow-2xl space-y-6"
      id="achievements-tracker-panel"
    >
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-white/5 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-[#D4AF37]/15 rounded-lg text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
            <Trophy className="h-6 w-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-[#8E9299] tracking-widest uppercase">Academic Milestones</span>
            <h3 className="text-base font-serif text-white uppercase tracking-wider">Achievements & Badges</h3>
            <p className="text-xs text-[#8E9299] leading-relaxed">
              Earn status insignias for consistent research, vocabulary mastery, and advanced testing.
            </p>
          </div>
        </div>

        {/* Global Progress Gauge */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-[#0F0F12] border border-white/5 p-2 rounded-xl">
          <div className="relative h-12 w-12 flex items-center justify-center">
            {/* Simple circular background SVG track */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="3.5"
                fill="transparent"
              />
              <motion.circle
                cx="24"
                cy="24"
                r="20"
                stroke="#D4AF37"
                strokeWidth="3.5"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 20}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - overallPercent / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <span className="text-[10px] font-mono font-black text-[#D4AF37]">{overallPercent}%</span>
          </div>
          <div>
            <div className="text-xs font-serif font-black text-white uppercase tracking-wider">
              {unlockedCount} / {totalBadges} Badges
            </div>
            <span className="text-[8px] text-[#8E9299] uppercase tracking-widest block font-bold mt-0.5">
              Unlocked Achievements
            </span>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3" id="badges-grid-container">
        {badges.map((badge) => {
          const BadgeIcon = badge.icon;
          return (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`relative overflow-hidden group p-3.5 bg-[#0F0F12] border rounded-xl text-center flex flex-col items-center justify-between gap-3 transition-all cursor-pointer ${
                badge.unlocked 
                  ? `${badge.borderColor} hover:scale-[1.03] hover:shadow-lg hover:shadow-[#D4AF37]/5` 
                  : "border-white/5 opacity-55 hover:opacity-80"
              }`}
              title={`Click to view details for ${badge.title}`}
            >
              {/* Unlock Indicator */}
              {badge.unlocked && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-400 shadow shadow-emerald-400/40 animate-ping" />
              )}

              <div className="space-y-2 flex flex-col items-center">
                {/* Badge Icon Frame */}
                <div className={`p-2.5 rounded-lg border flex items-center justify-center transition ${
                  badge.unlocked 
                    ? `bg-[#141417] ${badge.borderColor} ${badge.color}` 
                    : "bg-white/5 border-white/5 text-slate-600"
                }`}>
                  <BadgeIcon className="h-5 w-5" />
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-[10px] font-serif font-black text-white truncate max-w-full uppercase tracking-wide">
                    {badge.title}
                  </h4>
                  <span className={`text-[7px] font-mono uppercase tracking-widest px-1 py-0.5 rounded ${
                    badge.rarity === "Legendary" ? "bg-[#D4AF37]/10 text-[#D4AF37]" :
                    badge.rarity === "Epic" ? "bg-purple-500/15 text-purple-400" :
                    badge.rarity === "Rare" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-slate-400"
                  }`}>
                    {badge.rarity}
                  </span>
                </div>
              </div>

              {/* Mini linear progress bar */}
              <div className="w-full space-y-1 mt-1">
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${badge.progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${badge.unlocked ? "bg-[#D4AF37]" : "bg-white/10"}`} 
                  />
                </div>
                <span className="text-[8px] font-mono text-[#8E9299] block truncate">
                  {badge.unlocked ? "Unlocked 🏆" : `${badge.progress}%`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Badge Details Modal / Overlay */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0F0F12] border border-white/15 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 p-1 rounded-lg text-[#8E9299] hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl border flex items-center justify-center ${
                  selectedBadge.unlocked 
                    ? `bg-[#141417] ${selectedBadge.borderColor} ${selectedBadge.color}` 
                    : "bg-white/5 border-white/5 text-slate-600"
                }`}>
                  {React.createElement(selectedBadge.icon, { className: "h-8 w-8" })}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-serif font-black text-white uppercase tracking-wider">
                      {selectedBadge.title}
                    </h3>
                    <span className={`text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded font-black ${
                      selectedBadge.rarity === "Legendary" ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20" :
                      selectedBadge.rarity === "Epic" ? "bg-purple-500/15 text-purple-400" :
                      selectedBadge.rarity === "Rare" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-slate-400"
                    }`}>
                      {selectedBadge.rarity}
                    </span>
                  </div>
                  <span className="text-[9px] text-[#8E9299] uppercase tracking-widest block mt-1">
                    {selectedBadge.category} Milestone
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-[#C8C8CC] leading-relaxed">
                  {selectedBadge.description}
                </p>

                {/* Progress Card inside popup */}
                <div className="bg-[#141417] border border-white/5 p-3 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#8E9299]">Current Progress</span>
                    <span className="font-mono text-white font-bold">{selectedBadge.targetText}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedBadge.progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-[#D4AF37]" 
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-[#8E9299]">
                    <span>{selectedBadge.progress}% Completed</span>
                    <span className={selectedBadge.unlocked ? "text-emerald-400 font-bold" : "text-amber-500"}>
                      {selectedBadge.unlocked ? "Requirement Met!" : "Locked"}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-xl flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-white uppercase tracking-wide">How to Unlock</span>
                    <p className="text-[10px] text-[#8E9299] leading-relaxed">
                      {selectedBadge.hint}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2.5 bg-white/5 hover:bg-[#D4AF37] hover:text-black border border-white/10 hover:border-transparent text-[#C8C8CC] font-serif font-black text-xs uppercase tracking-wider rounded-lg transition text-center cursor-pointer"
              >
                Close Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
