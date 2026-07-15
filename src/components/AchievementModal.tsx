import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  X, 
  Sparkles, 
  CheckCircle,
  HelpCircle,
  Clock,
  BookOpen,
  Mic,
  FileText,
  Flame,
  Zap,
  Award,
  Compass
} from "lucide-react";
import confetti from "canvas-confetti";

export interface UnlockedBadgeInfo {
  id: string;
  title: string;
  description: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  iconName: string;
  hint: string;
}

interface AchievementModalProps {
  unlockedBadge: UnlockedBadgeInfo | null;
  onClose: () => void;
}

// Icon mapper helper
const getBadgeIcon = (iconName: string) => {
  switch (iconName.toLowerCase()) {
    case "clock": return Clock;
    case "checkcircle": return CheckCircle;
    case "mic": return Mic;
    case "bookopen": return BookOpen;
    case "trophy": return Trophy;
    case "compass": return Compass;
    case "filetext": return FileText;
    case "flame": return Flame;
    case "zap": return Zap;
    case "award": return Award;
    default: return Trophy;
  }
};

const getRarityStyles = (rarity: string) => {
  switch (rarity) {
    case "Legendary":
      return {
        bg: "bg-[#D4AF37]/10 border-[#D4AF37]/45 text-[#D4AF37]",
        pill: "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30",
        glow: "shadow-[0_0_40px_rgba(212,175,55,0.2)]",
        titleColor: "text-[#D4AF37]"
      };
    case "Epic":
      return {
        bg: "bg-purple-500/10 border-purple-500/40 text-purple-400",
        pill: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        glow: "shadow-[0_0_40px_rgba(168,85,247,0.2)]",
        titleColor: "text-purple-400"
      };
    case "Rare":
      return {
        bg: "bg-emerald-500/10 border-emerald-500/40 text-emerald-400",
        pill: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        glow: "shadow-[0_0_40px_rgba(16,185,129,0.2)]",
        titleColor: "text-emerald-400"
      };
    default: // Common
      return {
        bg: "bg-slate-500/10 border-slate-500/30 text-slate-400",
        pill: "bg-slate-500/20 text-slate-300 border-slate-500/20",
        glow: "shadow-[0_0_30px_rgba(100,116,139,0.1)]",
        titleColor: "text-white"
      };
  }
};

export default function AchievementModal({ unlockedBadge, onClose }: AchievementModalProps) {
  useEffect(() => {
    if (unlockedBadge) {
      // Fire confetti celebration!
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const runConfetti = () => {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.8 },
          colors: ["#D4AF37", "#AA7C11", "#FFFFFF", "#FFD700"]
        });
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.8 },
          colors: ["#D4AF37", "#AA7C11", "#FFFFFF", "#FFD700"]
        });

        if (Date.now() < end) {
          requestAnimationFrame(runConfetti);
        }
      };

      runConfetti();
    }
  }, [unlockedBadge]);

  if (!unlockedBadge) return null;

  const IconComponent = getBadgeIcon(unlockedBadge.iconName);
  const styles = getRarityStyles(unlockedBadge.rarity);

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        id="achievement-celebration-overlay"
      >
        {/* Background Ambient Sparks */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className={`bg-gradient-to-b from-[#141417] to-[#0A0A0C] border border-[#D4AF37]/35 rounded-2xl w-full max-w-md p-6 md:p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden ${styles.glow}`}
          id="achievement-celebration-card"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-[#8E9299] hover:text-white hover:bg-white/5 border border-white/5 transition cursor-pointer"
            id="close-achievement-modal-btn"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Premium Gold Accent Stripe */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-300" />

          {/* Animated Trophy / Achievement Icon */}
          <div className="relative mt-4 mb-6">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, -5, 5, 0]
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 ${styles.bg} shadow-lg relative z-10`}
            >
              <IconComponent className="h-10 w-10" />
            </motion.div>
            
            {/* Spinning background glow */}
            <div className="absolute inset-0 bg-[#D4AF37]/10 rounded-2xl blur-xl animate-ping scale-75" />
          </div>

          {/* Achievement Tagline */}
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-3 py-1 rounded-full mb-3">
            🏆 إنجاز جديد! / ACHIEVEMENT UNLOCKED!
          </span>

          {/* Badge Title */}
          <h2 className="text-2xl font-serif font-black text-white uppercase tracking-wider mb-2">
            {unlockedBadge.title}
          </h2>

          {/* Rarity Indicator */}
          <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${styles.pill} mb-5`}>
            {unlockedBadge.rarity} Badge
          </span>

          {/* Badge Description */}
          <p className="text-slate-200 text-xs leading-relaxed max-w-sm mb-6 text-center">
            {unlockedBadge.description}
          </p>

          {/* Milestone Details Card */}
          <div className="w-full bg-[#0F0F12] border border-white/5 p-4 rounded-xl flex items-start gap-3 mb-6 text-left">
            <Sparkles className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-white uppercase tracking-wide">Milestone Awarded / متطلبات الإنجاز</span>
              <p className="text-[11px] text-[#8E9299] leading-relaxed">
                {unlockedBadge.hint}
              </p>
            </div>
          </div>

          {/* Claim Reward Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-widest rounded-lg hover:brightness-110 shadow-lg shadow-[#D4AF37]/15 transition cursor-pointer flex items-center justify-center gap-2"
            id="claim-badge-reward-btn"
          >
            <Trophy className="h-4 w-4 shrink-0" />
            <span>مطالبة بالجائزة / Claim +150 XP Reward</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
