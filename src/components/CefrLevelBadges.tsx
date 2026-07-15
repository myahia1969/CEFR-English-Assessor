import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  BookOpen, 
  Award, 
  Compass, 
  Sparkles, 
  Crown, 
  CheckCircle, 
  Lock, 
  ChevronRight, 
  HelpCircle, 
  X,
  TrendingUp,
  Info
} from "lucide-react";
import { CEFRLevel } from "../types";

interface CefrLevelBadgesProps {
  userLevel: CEFRLevel | null;
}

interface CefrBadge {
  level: CEFRLevel;
  title: string;
  category: "Beginner" | "Independent" | "Proficient";
  desc: string;
  icon: React.ComponentType<any>;
  color: string;
  borderColor: string;
  badgeGlow: string;
  textColor: string;
  requirements: string[];
  vocabularyCount: string;
  grammarFocus: string;
}

const LEVEL_ORDER: CEFRLevel[] = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];

export default function CefrLevelBadges({ userLevel }: CefrLevelBadgesProps) {
  const [selectedBadge, setSelectedBadge] = useState<CefrBadge | null>(null);
  const currentLevel = userLevel || "B1";
  const currentLevelIndex = LEVEL_ORDER.indexOf(currentLevel);

  const cefrBadges: CefrBadge[] = [
    {
      level: "A1",
      title: "A1 Breakthrough",
      category: "Beginner",
      desc: "Unlocked after advancing past initial fundamentals. Represents basic survival-level English.",
      icon: Shield,
      color: "text-amber-500",
      borderColor: "border-amber-500/30",
      textColor: "text-amber-400",
      badgeGlow: "from-amber-500/10 to-transparent",
      requirements: [
        "Introduce yourself and others simply.",
        "Ask and answer questions about personal details (where they live, people they know).",
        "Understand familiar everyday words and very basic phrases."
      ],
      vocabularyCount: "~500 words",
      grammarFocus: "Present Simple, basic subject-verb agreement, personal pronouns"
    },
    {
      level: "A2",
      title: "A2 Waystage",
      category: "Beginner",
      desc: "Unlocked by achieving basic fluency. Represents elementary level daily communication.",
      icon: BookOpen,
      color: "text-teal-400",
      borderColor: "border-teal-400/30",
      textColor: "text-teal-400",
      badgeGlow: "from-teal-400/10 to-transparent",
      requirements: [
        "Understand sentences related to immediate personal relevance (shopping, local geography, work).",
        "Communicate in simple, routine tasks requiring a direct exchange of information.",
        "Describe in simple terms aspects of their background and environment."
      ],
      vocabularyCount: "~1,200 words",
      grammarFocus: "Past Simple, modal verbs (can/could), basic prepositions, comparative adjectives"
    },
    {
      level: "B1",
      title: "B1 Threshold",
      category: "Independent",
      desc: "Unlocked by stepping into self-reliance. Represents independent standard level communication.",
      icon: Award,
      color: "text-blue-400",
      borderColor: "border-blue-400/30",
      textColor: "text-blue-400",
      badgeGlow: "from-blue-400/10 to-transparent",
      requirements: [
        "Understand main points of clear standard input on familiar matters (school, leisure, work).",
        "Deal with most situations likely to arise while travelling in an English-speaking area.",
        "Produce simple connected text on topics which are familiar or of personal interest."
      ],
      vocabularyCount: "~2,500 words",
      grammarFocus: "Present Perfect, Future forms (will/going to), passive voice basics, conditional clauses"
    },
    {
      level: "B2",
      title: "B2 Vantage",
      category: "Independent",
      desc: "Unlocked by reaching Upper-Intermediate proficiency. The gold standard for university entry.",
      icon: Compass,
      color: "text-indigo-400",
      borderColor: "border-indigo-400/30",
      textColor: "text-indigo-400",
      badgeGlow: "from-indigo-400/10 to-transparent",
      requirements: [
        "Understand the main ideas of complex text on both concrete and abstract topics.",
        "Interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible.",
        "Produce clear, detailed text on a wide range of subjects and explain a viewpoint."
      ],
      vocabularyCount: "~4,000 words",
      grammarFocus: "Mixed conditionals, reporting verbs, narrative tenses, advanced passive voice"
    },
    {
      level: "C1",
      title: "C1 Effective Proficiency",
      category: "Proficient",
      desc: "Unlocked by reaching advanced scholastic proficiency. Ideal for academic and professional leadership.",
      icon: Sparkles,
      color: "text-pink-400",
      borderColor: "border-pink-400/30",
      textColor: "text-pink-400",
      badgeGlow: "from-pink-400/10 to-transparent",
      requirements: [
        "Understand a wide range of demanding, longer texts, and recognise implicit meaning.",
        "Express ideas spontaneously and fluently without much obvious searching for expressions.",
        "Use language flexibly and effectively for social, academic and professional purposes."
      ],
      vocabularyCount: "~8,000 words",
      grammarFocus: "Inversion with negative adverbials, cleft sentences, advanced subjunctives, discourse markers"
    },
    {
      level: "C2",
      title: "C2 Active Mastery",
      category: "Proficient",
      desc: "Unlocked by reaching absolute native-like mastery. Fluent in all complex literary & dialect registers.",
      icon: Crown,
      color: "text-[#D4AF37]",
      borderColor: "border-[#D4AF37]/40",
      textColor: "text-[#D4AF37]",
      badgeGlow: "from-[#D4AF37]/15 to-transparent",
      requirements: [
        "Understand with ease virtually everything heard or read.",
        "Summarize information from different spoken and written sources, reconstructing arguments coherently.",
        "Express themselves spontaneously, very fluently and precisely, differentiating finer shades of meaning."
      ],
      vocabularyCount: "~16,000+ words",
      grammarFocus: "Sophisticated idiomatic phrasing, hyper-complex syntax modifiers, stylistic variations"
    }
  ];

  // Helper to determine if the badge is unlocked
  const isBadgeUnlocked = (badgeLevel: CEFRLevel) => {
    const badgeIndex = LEVEL_ORDER.indexOf(badgeLevel);
    return currentLevelIndex >= badgeIndex;
  };

  const unlockedCount = cefrBadges.filter(b => isBadgeUnlocked(b.level)).length;
  const totalBadges = cefrBadges.length;
  const progressPercent = Math.round((unlockedCount / totalBadges) * 100);

  return (
    <div 
      className="bg-[#141417] rounded-xl border border-white/5 p-6 shadow-2xl space-y-5"
      id="cefr-badges-milestone-panel"
    >
      {/* Header and Summary Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest font-mono block">
            CEFR Milestones Arena
          </span>
          <h2 className="text-lg font-serif text-white uppercase tracking-wider">
            Fluency Tier Badges
          </h2>
          <p className="text-xs text-[#8E9299]">
            Monitor your pathway progress as your diagnostic scores push you across official international benchmarks.
          </p>
        </div>

        {/* Aggregate Level Badge Counter */}
        <div className="flex items-center gap-3 bg-[#0F0F12] border border-white/5 p-2 rounded-xl shrink-0">
          <div className="relative h-11 w-11 flex items-center justify-center bg-[#D4AF37]/5 rounded-lg border border-[#D4AF37]/15">
            <Crown className="h-5.5 w-5.5 text-[#D4AF37] animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-serif font-black text-white uppercase tracking-wider">
              {unlockedCount} / {totalBadges} Levels Earned
            </div>
            {/* Progress gauge bar */}
            <div className="w-28 space-y-1 mt-1">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] rounded-full"
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono font-bold text-[#8E9299]">
                <span>{progressPercent}% Complete</span>
                <span className="text-[#D4AF37]">{currentLevel} Rank</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" id="cefr-badges-grid">
        {cefrBadges.map((badge) => {
          const BadgeIcon = badge.icon;
          const unlocked = isBadgeUnlocked(badge.level);
          const isActive = badge.level === currentLevel;

          return (
            <div
              key={badge.level}
              onClick={() => setSelectedBadge(badge)}
              className={`relative overflow-hidden group p-4 rounded-xl border text-center flex flex-col items-center justify-between gap-3.5 transition-all duration-300 cursor-pointer ${
                unlocked 
                  ? isActive 
                    ? "bg-[#D4AF37]/5 border-[#D4AF37] shadow-xl shadow-[#D4AF37]/5 scale-[1.02]"
                    : "bg-[#0F0F12] border-white/10 hover:border-white/20 hover:bg-white/5"
                  : "bg-black/40 border-white/5 opacity-40 hover:opacity-60"
              }`}
              title={`Click to inspect standard details for CEFR ${badge.level}`}
            >
              {/* Background gradient subtle glow */}
              {unlocked && (
                <div className={`absolute inset-0 bg-gradient-to-b ${badge.badgeGlow} opacity-30 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none`} />
              )}

              {/* Status Ribbon / Top Badge */}
              <div className="w-full flex justify-between items-center text-[8px] font-mono font-bold tracking-wider relative z-10">
                <span className={`px-1.5 py-0.5 rounded uppercase ${
                  badge.category === "Proficient" ? "bg-purple-950/40 text-purple-400" :
                  badge.category === "Independent" ? "bg-blue-950/40 text-blue-400" :
                  "bg-amber-950/40 text-amber-400"
                }`}>
                  {badge.category}
                </span>
                
                {unlocked ? (
                  isActive ? (
                    <span className="text-[#D4AF37] animate-pulse flex items-center gap-0.5 font-sans font-black">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" /> ACTIVE
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-sans font-black">UNLOCKED</span>
                  )
                ) : (
                  <span className="text-[#8E9299] flex items-center gap-1">
                    <Lock className="h-2 w-2" /> LOCKED
                  </span>
                )}
              </div>

              {/* Central Emblem */}
              <div className="relative flex items-center justify-center my-1 z-10">
                <div className={`p-3.5 rounded-full border transition duration-300 ${
                  unlocked 
                    ? isActive 
                      ? "bg-black/40 border-[#D4AF37] text-[#D4AF37] scale-110" 
                      : `bg-[#141417] ${badge.borderColor} ${badge.color}`
                    : "bg-white/5 border-transparent text-slate-700"
                }`}>
                  <BadgeIcon className="h-6 w-6" />
                </div>
              </div>

              {/* Badge level info */}
              <div className="space-y-1 relative z-10">
                <h4 className="text-xs font-serif font-black text-white uppercase tracking-wider">
                  {badge.level} {badge.title.split(" ").slice(1).join(" ")}
                </h4>
                <p className="text-[10px] text-[#8E9299] leading-tight min-h-[32px] line-clamp-2">
                  {badge.desc}
                </p>
              </div>

              {/* Bottom tier progress mini strip */}
              <div className="w-full space-y-1 relative z-10 border-t border-white/5 pt-2">
                <div className="flex justify-between text-[8px] font-mono text-[#8E9299]">
                  <span>Vocabulary:</span>
                  <span className="text-[#E0E0E0] font-bold">{badge.vocabularyCount}</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: unlocked ? "100%" : "0%" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${unlocked ? "bg-[#D4AF37]" : "bg-white/10"}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Detail Modal / Overlay */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0F0F12] border border-white/15 rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 p-1 rounded-lg text-[#8E9299] hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                <div className={`p-4 rounded-xl border flex items-center justify-center ${
                  isBadgeUnlocked(selectedBadge.level) 
                    ? `bg-[#141417] ${selectedBadge.borderColor} ${selectedBadge.color}` 
                    : "bg-white/5 border-white/5 text-slate-600"
                }`}>
                  {React.createElement(selectedBadge.icon, { className: "h-8 w-8" })}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-black text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20 uppercase text-xs">
                      CEFR {selectedBadge.level}
                    </span>
                    <h3 className="text-base font-serif font-black text-white uppercase tracking-wider">
                      {selectedBadge.title}
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#8E9299] uppercase tracking-widest block mt-1 font-mono font-bold">
                    {selectedBadge.category} Academic Tier
                  </span>
                </div>
              </div>

              {/* Modal Body & Specifications */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8E9299]">
                    Proficiency Overview
                  </h4>
                  <p className="text-xs text-[#E0E0E0] leading-relaxed font-serif italic">
                    "{selectedBadge.desc}"
                  </p>
                </div>

                {/* Grid stats parameters */}
                <div className="grid grid-cols-2 gap-3 bg-[#141417] border border-white/5 p-3.5 rounded-xl">
                  <div>
                    <span className="text-[9px] text-[#8E9299] uppercase tracking-widest block font-bold mb-0.5">Estimated Vocabulary size</span>
                    <span className="text-xs text-white font-mono font-bold">{selectedBadge.vocabularyCount}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8E9299] uppercase tracking-widest block font-bold mb-0.5">Grammar Focus</span>
                    <span className="text-xs text-[#D4AF37] font-medium leading-relaxed block">{selectedBadge.grammarFocus}</span>
                  </div>
                </div>

                {/* CEFR Official can do statements */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8E9299]">
                    Key Functional Competencies ("Can-Do" statements)
                  </h4>
                  <div className="space-y-2">
                    {selectedBadge.requirements.map((req, index) => (
                      <div key={index} className="flex items-start gap-2.5 bg-white/5 p-3 rounded-lg border border-white/5">
                        <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-[#C8C8CC] leading-relaxed">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Standard instructional callout if locked */}
                {!isBadgeUnlocked(selectedBadge.level) && (
                  <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 flex items-start gap-2 text-[11px] text-[#8E9299] leading-relaxed">
                    <Info className="h-4 w-4 text-amber-500 shrink-0" />
                    <p>
                      This rank is locked. To unlock this CEFR milestone tier, complete the <strong className="text-white">Adaptive Placement Assessment</strong> on the dashboard or achieve advanced diagnostic marks to progress your academic rank.
                    </p>
                  </div>
                )}
              </div>

              {/* Close Button Footer */}
              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-3 bg-white/5 hover:bg-[#D4AF37] hover:text-black border border-white/10 hover:border-transparent text-[#C8C8CC] font-serif font-black text-xs uppercase tracking-widest rounded-lg transition text-center cursor-pointer"
              >
                Return to Dashboard
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
