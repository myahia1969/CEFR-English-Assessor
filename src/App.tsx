import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Award, 
  BookOpen, 
  Mic, 
  TrendingUp, 
  Compass, 
  Menu, 
  X, 
  Sparkles,
  HelpCircle,
  GraduationCap,
  Sun,
  Moon,
  Keyboard,
  FileText
} from "lucide-react";

import Dashboard from "./components/Dashboard";
import AdaptiveTest from "./components/AdaptiveTest";
import Evaluator from "./components/Evaluator";
import PracticeHub from "./components/PracticeHub";
import LanguageMentor from "./components/LanguageMentor";
import SplashIntro from "./components/SplashIntro";
import ToeflSimulator from "./components/ToeflSimulator";
import ApplicationGuide from "./components/ApplicationGuide";
import AchievementModal, { UnlockedBadgeInfo } from "./components/AchievementModal";
import StudyStreakTracker from "./components/StudyStreakTracker";
import VoiceNavigation from "./components/VoiceNavigation";
import { CEFRLevel, SkillType, EvaluationHistoryEntry, EvaluationResult } from "./types";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showAppGuide, setShowAppGuide] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<UnlockedBadgeInfo | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "test" | "evaluator" | "practice" | "toefl">("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [practicePreset, setPracticePreset] = useState<{
    cefrLevel?: CEFRLevel;
    skillType?: SkillType;
    activeSubTab?: "generator" | "vocab" | "lessons";
  } | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("lexicon_theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("lexicon_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const doc = document as any;
    if (doc.startViewTransition) {
      doc.startViewTransition(() => {
        setTheme(prev => prev === "dark" ? "light" : "dark");
      });
    } else {
      setTheme(prev => prev === "dark" ? "light" : "dark");
    }
  };

  // Synced states
  const [userLevel, setUserLevel] = useState<CEFRLevel | null>(null);
  const [stats, setStats] = useState({
    testsTaken: 0,
    practiceQuestions: 0,
    evaluations: 0,
    accuracy: 80
  });
  const [testHistory, setTestHistory] = useState<Array<{
    date: string;
    score: number;
    stabilizedLevel: CEFRLevel;
  }>>([]);
  const [evaluationHistory, setEvaluationHistory] = useState<EvaluationHistoryEntry[]>([]);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in a text field
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        (activeElement as HTMLElement).isContentEditable
      );

      if (!isTyping) {
        if (e.key === "1") {
          e.preventDefault();
          handleNavigate("dashboard");
        } else if (e.key === "2") {
          e.preventDefault();
          handleNavigate("test");
        } else if (e.key === "3") {
          e.preventDefault();
          handleNavigate("evaluator");
        } else if (e.key === "4") {
          e.preventDefault();
          handleNavigate("practice");
        } else if (e.key === "5") {
          e.preventDefault();
          handleNavigate("toefl");
        } else if (e.key === "?" || e.key === "/") {
          e.preventDefault();
          setShowShortcutsModal(prev => !prev);
        }
      }

      // Close modal on Escape
      if (e.key === "Escape" && showShortcutsModal) {
        e.preventDefault();
        setShowShortcutsModal(false);
      }

      // Forward Enter key globally
      if (e.key === "Enter") {
        const enterEvent = new CustomEvent("app-keyboard-enter", { detail: { isTyping } });
        window.dispatchEvent(enterEvent);
      }

      // Forward Ctrl + S / Cmd + S globally
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const saveEvent = new CustomEvent("app-keyboard-save");
        window.dispatchEvent(saveEvent);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [showShortcutsModal]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedLevel = localStorage.getItem("cefr_user_level");
      if (storedLevel) setUserLevel(storedLevel as CEFRLevel);

      const storedStats = localStorage.getItem("cefr_user_stats");
      if (storedStats) setStats(JSON.parse(storedStats));

      const storedHistory = localStorage.getItem("cefr_test_history");
      if (storedHistory) setTestHistory(JSON.parse(storedHistory));

      const storedEvalHistory = localStorage.getItem("cefr_evaluation_history");
      if (storedEvalHistory) setEvaluationHistory(JSON.parse(storedEvalHistory));
    } catch (err) {
      console.error("Failed to load local storage state:", err);
    }
  }, []);

  // Monitor stats and userLevel to trigger Achievement Milestones
  useEffect(() => {
    if (showSplash) return;

    try {
      const storedStreak = parseInt(localStorage.getItem("lexicon_streak_count") || "0", 10);
      const isEarlyBird = localStorage.getItem("lexicon_badge_early_bird") === "true";
      const isSpeedDemon = localStorage.getItem("lexicon_badge_speed_demon") === "true";

      const badgeList = [
        {
          id: "early_bird",
          title: "Early Bird",
          description: "Activate your mind early. Completed a study practice or checked in before 9:00 AM.",
          iconName: "clock",
          rarity: "Rare" as const,
          hint: "Access the academy, complete a practice question, or claim your daily streak in the morning hours before 09:00 AM.",
          unlocked: isEarlyBird || new Date().getHours() < 9
        },
        {
          id: "grammar_guru",
          title: "Grammar Guru",
          description: "Excel at syntax and accuracy with high precision in questions.",
          iconName: "checkcircle",
          rarity: "Epic" as const,
          hint: "Answer at least 5 practice questions and maintain an overall accuracy rate above 80%.",
          unlocked: stats.practiceQuestions >= 5 && stats.accuracy >= 80
        },
        {
          id: "speaking_pro",
          title: "Speaking Pro",
          description: "Unlock speaking excellence by receiving active oral and conversation assessments.",
          iconName: "mic",
          rarity: "Epic" as const,
          hint: "Complete at least 2 speaking feedback evaluations or active roleplay session turn recordings.",
          unlocked: stats.evaluations >= 2
        },
        {
          id: "vocabulary_master",
          title: "Vocabulary Master",
          description: "Excel at terminology by answering 10 or more practice questions.",
          iconName: "bookopen",
          rarity: "Common" as const,
          hint: "Practice with the vocabulary flashcards on A1, B1, or B2 levels to unlock.",
          unlocked: stats.practiceQuestions >= 10
        },
        {
          id: "fluent_speaker",
          title: "Fluent Speaker",
          description: "Express arguments fluently with at least 3 speech or writing evaluations.",
          iconName: "trophy",
          rarity: "Rare" as const,
          hint: "Use the essay scorer, speaking evaluator, or new Roleplay Arena to get detailed evaluations.",
          unlocked: stats.evaluations >= 3
        },
        {
          id: "adaptive_pioneer",
          title: "Adaptive Pioneer",
          description: "Take the primary step by completing an Adaptive Placement Assessment.",
          iconName: "compass",
          rarity: "Common" as const,
          hint: "Initiate and finish a full adaptive level examination to calibrate your CEFR score.",
          unlocked: stats.testsTaken >= 1
        },
        {
          id: "scholarly_accuracy",
          title: "Scholarly Writer",
          description: "Maintain an overall assessment accuracy of 75% or higher.",
          iconName: "filetext",
          rarity: "Epic" as const,
          hint: "Answer assessment questions carefully to maintain high accuracy above 75%.",
          unlocked: stats.accuracy >= 75 && stats.testsTaken >= 1
        },
        {
          id: "consistency_champion",
          title: "Consistency Champion",
          description: "Commit to continuous study with a streak of 3 consecutive days.",
          iconName: "flame",
          rarity: "Rare" as const,
          hint: "Log in and complete at least one exercise or manual claim for 3 days in a row.",
          unlocked: storedStreak >= 3
        },
        {
          id: "speed_demon",
          title: "Speed Demon",
          description: "Complete a rapid-fire 2-minute vocabulary Quick Study quiz.",
          iconName: "zap",
          rarity: "Epic" as const,
          hint: "Access the Skills Training Hub, switch to the Vocabulary tab, and successfully finish the 2-minute 'Quick Study' quiz.",
          unlocked: isSpeedDemon
        },
        {
          id: "grand_evaluator",
          title: "Grand Evaluator",
          description: "Master of communicative critique. Completed at least 10 speech or writing evaluations.",
          iconName: "award",
          rarity: "Legendary" as const,
          hint: "Submit 10 essays or spoken recordings to the AI Speech & Essay Evaluator to claim this legendary badge.",
          unlocked: stats.evaluations >= 10
        },
        {
          id: "cefr_milestone",
          title: "C-Level Academic",
          description: "Achieve Advanced (C1) or Mastery (C2) CEFR status on Fatima Academy.",
          iconName: "trophy",
          rarity: "Legendary" as const,
          hint: "Unlock this ultimate badge by getting rated C1 or C2 in either placements or evaluations.",
          unlocked: userLevel ? ["C1", "C2"].includes(userLevel) : false
        }
      ];

      const celebratedRaw = localStorage.getItem("lexicon_celebrated_badges");
      const celebratedIds: string[] = celebratedRaw ? JSON.parse(celebratedRaw) : [];

      const newlyUnlocked = badgeList.find(b => b.unlocked && !celebratedIds.includes(b.id));

      if (newlyUnlocked) {
        const updatedCelebrated = [...celebratedIds, newlyUnlocked.id];
        localStorage.setItem("lexicon_celebrated_badges", JSON.stringify(updatedCelebrated));

        setUnlockedBadge({
          id: newlyUnlocked.id,
          title: newlyUnlocked.title,
          description: newlyUnlocked.description,
          rarity: newlyUnlocked.rarity,
          iconName: newlyUnlocked.iconName,
          hint: newlyUnlocked.hint
        });
      }
    } catch (err) {
      console.error("Error evaluating milestone achievements:", err);
    }
  }, [stats, userLevel, showSplash]);

  // Update statistics helper
  const updateStats = (newStats: Partial<typeof stats>) => {
    const updated = { ...stats, ...newStats };
    setStats(updated);
    localStorage.setItem("cefr_user_stats", JSON.stringify(updated));
  };

  // Callback when placement test finishes
  const handleCompleteTest = (stabilizedLevel: CEFRLevel, score: number) => {
    setUserLevel(stabilizedLevel);
    localStorage.setItem("cefr_user_level", stabilizedLevel);

    const newHistoryEntry = {
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      score,
      stabilizedLevel
    };

    const updatedHistory = [newHistoryEntry, ...testHistory];
    setTestHistory(updatedHistory);
    localStorage.setItem("cefr_test_history", JSON.stringify(updatedHistory));

    // Update statistics
    const totalTests = stats.testsTaken + 1;
    // Simple quiz accuracy recalculation (incorporates placing score out of 20)
    const newAccuracy = Math.round(
      ((stats.accuracy * stats.testsTaken) + (score / 20 * 100)) / totalTests
    );

    updateStats({
      testsTaken: totalTests,
      accuracy: newAccuracy
    });

    // Log study activity for streak
    window.dispatchEvent(new CustomEvent("log-study-activity"));
  };

  // Callback when a writing/speaking submission is evaluated
  const handleCompleteEvaluation = (result: EvaluationResult, type: "writing" | "speaking", promptTitle: string) => {
    const newEntry: EvaluationHistoryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      type,
      promptTitle,
      result
    };

    const updatedHistory = [newEntry, ...evaluationHistory];
    setEvaluationHistory(updatedHistory);
    localStorage.setItem("cefr_evaluation_history", JSON.stringify(updatedHistory));

    updateStats({
      evaluations: stats.evaluations + 1
    });

    // Log study activity for streak
    window.dispatchEvent(new CustomEvent("log-study-activity"));
  };

  // Callback when a practice item is generated
  const handleIncrementPractice = () => {
    updateStats({
      practiceQuestions: stats.practiceQuestions + 1
    });

    // Log study activity for streak
    window.dispatchEvent(new CustomEvent("log-study-activity"));
  };

  const handleNavigate = (
    tab: "dashboard" | "test" | "evaluator" | "practice" | "toefl",
    preset?: {
      cefrLevel?: CEFRLevel;
      skillType?: SkillType;
      activeSubTab?: "generator" | "vocab" | "lessons";
    }
  ) => {
    if (preset) {
      setPracticePreset(preset);
    }
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems = [
    { id: "dashboard", label: "Academy Dashboard", icon: Compass },
    { id: "test", label: "Adaptive Assessment", icon: TrendingUp },
    { id: "evaluator", label: "Speech & Essay Evaluator", icon: Mic },
    { id: "practice", label: "Skills Training Hub", icon: BookOpen },
    { id: "toefl", label: "TOEFL iBT Simulator", icon: Award }
  ] as const;

  const sidebarContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const sidebarItemVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        type: "spring", 
        stiffness: 120,
        damping: 15
      } 
    },
  };

  return (
    <div className={`min-h-screen bg-[#0A0A0B] text-[#E0E0E0] flex flex-col font-sans transition-colors duration-300 ${theme}`} id="app-root-container">
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashIntro
            onComplete={() => {
              setShowSplash(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Floating Exit Focus Mode Button */}
      <AnimatePresence>
        {isFocusMode && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 150, damping: 18 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-3"
            id="focus-mode-floating-bar"
          >
            <div className="flex items-center gap-2.5 bg-[#0F0F12]/90 backdrop-blur-md px-4 py-2 rounded-full border border-[#D4AF37]/40 shadow-xl shadow-[#D4AF37]/10">
              <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-white uppercase font-black">
                Focus Mode • وضع التركيز
              </span>
              <button
                onClick={() => setIsFocusMode(false)}
                className="ml-2 inline-flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#E4C563] text-black font-extrabold px-3.5 py-1 rounded-full transition duration-200 text-[10px] uppercase tracking-wider cursor-pointer shadow-md shadow-[#D4AF37]/20"
              >
                <X className="h-3 w-3" />
                <span>Exit / خروج</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 1. Mobile Header bar */}
      {!isFocusMode && (
        <header className="lg:hidden bg-[#0F0F12] text-white p-4 flex items-center justify-between border-b border-white/10 shadow-md">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-[#D4AF37] to-[#8E793E] rounded-md flex items-center justify-center font-serif font-bold text-black text-sm shadow">
              C
            </div>
            <div className="flex flex-col">
              <span className="font-serif tracking-wider text-sm text-white uppercase">Fatima Academy</span>
              <span className="text-[8px] text-[#D4AF37]/90 tracking-wider font-extrabold">Developed by Fatima Mohamed Yahia</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {userLevel && (
              <span className="text-[11px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-2 py-0.5 rounded uppercase">
                {userLevel}
              </span>
            )}
            
            {/* Mobile Help Button */}
            <button
              onClick={() => setShowAppGuide(true)}
              className="p-1 rounded-lg hover:bg-white/5 transition text-[#D4AF37] cursor-pointer"
              title="Open Complete Application Guide"
              id="mobile-guide-toggle"
            >
              <HelpCircle className="h-5 w-5 animate-pulse" />
            </button>

            {/* Daily Study Streak Tracker */}
            <StudyStreakTracker />

            {/* Global Voice Command Listener */}
            <VoiceNavigation
              onNavigate={handleNavigate}
              onToggleTheme={toggleTheme}
              onShowHelp={() => setShowAppGuide(true)}
            />
            
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1 rounded-lg hover:bg-white/5 transition text-slate-300 cursor-pointer"
              title="Toggle Light/Dark Theme"
              id="mobile-theme-toggle"
            >
              {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-400" />}
            </button>

            <button 
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 rounded-lg hover:bg-white/5 transition text-slate-300 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </header>
      )}

      {/* Outer Layout Grid */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* 2. Sidebar Navigation (Desktop) / Mobile Drawer (Mobile) */}
        {!isFocusMode && (
          <aside className={`
            fixed lg:sticky top-0 left-0 z-40 
            h-full lg:h-screen w-64 
            bg-[#0F0F12] text-[#E0E0E0] border-r border-white/10 
            flex flex-col justify-between 
            transition-transform duration-300 ease-in-out
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            lg:translate-x-0
          `}>
            <div className="space-y-6 p-6">
              
              {/* Sidebar Logo Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#8E793E] rounded-sm flex items-center justify-center shadow-lg shadow-black/50">
                    <span className="text-black font-serif font-bold text-xl">F</span>
                  </div>
                  <div>
                    <h2 className="text-xs font-serif tracking-widest text-white uppercase leading-tight">Fatima Engine</h2>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-[#8E9299] uppercase tracking-wider font-semibold">Senior Assessor</span>
                      <span className="text-[8px] text-[#D4AF37]/90 tracking-wider font-extrabold">Developed by Fatima Mohamed Yahia</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Daily Study Streak Tracker */}
                  <StudyStreakTracker />

                  {/* Global Voice Command Listener */}
                  <VoiceNavigation
                    onNavigate={handleNavigate}
                    onToggleTheme={toggleTheme}
                    onShowHelp={() => setShowAppGuide(true)}
                  />

                  {/* Desktop Help Button */}
                  <motion.button
                    whileHover={{ scale: 1.15, rotate: -15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAppGuide(true)}
                    className="p-1.5 rounded-lg hover:bg-white/5 transition text-[#D4AF37] cursor-pointer"
                    title="Open Complete Application Guide"
                    id="desktop-guide-toggle"
                  >
                    <HelpCircle className="h-4.5 w-4.5 animate-pulse" />
                  </motion.button>

                  {/* Desktop Theme Toggle */}
                  <motion.button
                    whileHover={{ scale: 1.15, rotate: 15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleTheme}
                    className="p-1.5 rounded-lg hover:bg-white/5 transition text-slate-300 cursor-pointer"
                    title="Toggle Light/Dark Theme"
                    id="desktop-theme-toggle"
                  >
                    {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-slate-400" />}
                  </motion.button>
                </div>
              </div>

              {/* Sidebar Navigation Links with Framer Motion Staggered Fade-In */}
              <motion.nav 
                variants={sidebarContainerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-1.5" 
                id="sidebar-nav"
              >
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <motion.button
                      variants={sidebarItemVariants}
                      whileHover="hover"
                      key={item.id}
                      id={`nav-link-${item.id}`}
                      onClick={() => handleNavigate(item.id)}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold tracking-wide transition duration-200 cursor-pointer
                        ${isActive 
                          ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/15 font-extrabold" 
                          : "text-[#8E9299] hover:text-white hover:bg-white/5"}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <motion.span
                          variants={{
                            hover: { 
                              scale: 1.22, 
                              rotate: 8,
                              transition: { type: "spring", stiffness: 400, damping: 11 }
                            }
                          }}
                          className="shrink-0 flex items-center justify-center"
                        >
                          <Icon className="h-4 w-4" />
                        </motion.span>
                        <span>{item.label}</span>
                      </div>
                      {/* Subtle hotkey indicator */}
                      <span className={`hidden md:inline-flex text-[9px] font-mono font-black px-1.5 py-0.5 rounded border ${
                        isActive 
                          ? "bg-black/15 border-black/20 text-black/70" 
                          : "bg-white/5 border-white/10 text-[#8E9299]"
                      }`}>
                        {index + 1}
                      </span>
                    </motion.button>
                  );
                })}
              </motion.nav>
            </div>

            {/* Sidebar Footer Account Badge */}
            <div className="p-6 border-t border-white/10 space-y-4">
              {userLevel ? (
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-3">
                  <div className="h-10 w-10 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center border border-[#D4AF37]/20 text-[#D4AF37] font-serif font-black text-sm">
                    {userLevel}
                  </div>
                  <div className="text-[10px]">
                    <p className="text-[#8E9299] font-bold uppercase tracking-wider">Placement Metric</p>
                    <p className="text-slate-200 font-medium mt-0.5">Assessed CEFR Grade</p>
                  </div>
                </div>
              ) : (
                <div 
                  id="sidebar-onboarding-banner"
                  onClick={() => handleNavigate("test")}
                  className="group cursor-pointer bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 text-[10px] space-y-1 transition duration-200"
                >
                  <div className="flex items-center gap-1 text-[#D4AF37] font-bold uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" /> Unassessed Profile
                  </div>
                  <p className="text-[#8E9299] leading-normal">
                    Take the dynamic placement test to index your level.
                  </p>
                </div>
              )}
              
              <motion.button
                whileHover="hover"
                onClick={() => setShowShortcutsModal(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 rounded-lg text-[10px] font-bold text-[#8E9299] hover:text-white transition cursor-pointer"
                title="Show Keyboard Shortcuts Info"
                id="sidebar-shortcuts-btn"
              >
                <motion.span
                  variants={{
                    hover: { 
                      scale: 1.18, 
                      rotate: 10,
                      transition: { type: "spring", stiffness: 400, damping: 11 }
                    }
                  }}
                  className="shrink-0 flex items-center justify-center"
                >
                  <Keyboard className="h-3.5 w-3.5 text-[#D4AF37]" />
                </motion.span>
                <span>Keyboard Shortcuts (?)</span>
              </motion.button>
              
              <div className="flex items-center gap-2 text-[9px] text-[#8E9299] justify-center tracking-wider uppercase">
                <GraduationCap className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>Certified CEFR System</span>
              </div>
            </div>
          </aside>
        )}

        {/* Backdrop for mobile drawer */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-[#0A0A0B]/60 backdrop-blur-xs z-30 lg:hidden"
          />
        )}

        {/* 3. Main Content Stage */}
        <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "dashboard" && (
                <Dashboard 
                  onNavigate={handleNavigate} 
                  userLevel={userLevel} 
                  stats={stats} 
                  testHistory={testHistory}
                  evaluationHistory={evaluationHistory}
                  onReplayIntro={() => setShowSplash(true)}
                  isFocusMode={isFocusMode}
                  onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
                  onUpdateStats={updateStats}
                />
              )}
              
              {activeTab === "test" && (
                <AdaptiveTest onCompleteTest={handleCompleteTest} />
              )}
              
              {activeTab === "evaluator" && (
                <Evaluator onCompleteEvaluation={handleCompleteEvaluation} />
              )}
              
              {activeTab === "practice" && (
                <PracticeHub 
                  onIncrementPracticeCount={handleIncrementPractice} 
                  userLevel={userLevel}
                  initialPreset={practicePreset}
                  onClearPreset={() => setPracticePreset(null)}
                />
              )}
              
              {activeTab === "toefl" && (
                <ToeflSimulator />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
      
      {/* 4. Language Mentor Floating Sidebar Chat */}
      {!isFocusMode && <LanguageMentor userLevel={userLevel} />}

      {/* 5. Keyboard Shortcuts Help Modal */}
      <AnimatePresence>
        {showShortcutsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" id="shortcuts-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-[#141417] border border-white/10 rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl relative overflow-hidden text-[#E0E0E0]"
              id="shortcuts-modal-content"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center border border-[#D4AF37]/20 text-[#D4AF37]">
                    <Keyboard className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-white font-bold text-base tracking-wide uppercase">Keyboard Shortcuts</h3>
                    <p className="text-[10px] text-[#8E9299] uppercase tracking-wider font-semibold">CEFR Assessor Power User Tools</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowShortcutsModal(false)}
                  className="p-1 rounded-lg hover:bg-white/5 transition text-slate-300 cursor-pointer"
                  title="Close Dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Shortcuts Grid List */}
              <div className="py-6 space-y-5 text-xs">
                
                {/* Navigation group */}
                <div className="space-y-2.5">
                  <h4 className="font-bold text-[#8E9299] uppercase tracking-widest text-[9px] pb-1 border-b border-white/5">Global Navigation</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">Academy Dashboard</span>
                      <kbd className="px-2 py-1 bg-white/5 border border-white/15 rounded text-[10px] font-mono text-white font-bold">1</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">Adaptive Assessment</span>
                      <kbd className="px-2 py-1 bg-white/5 border border-white/15 rounded text-[10px] font-mono text-white font-bold">2</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">Speech & Essay Evaluator</span>
                      <kbd className="px-2 py-1 bg-white/5 border border-white/15 rounded text-[10px] font-mono text-white font-bold">3</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">Skills Training Hub</span>
                      <kbd className="px-2 py-1 bg-white/5 border border-white/15 rounded text-[10px] font-mono text-white font-bold">4</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">TOEFL iBT Simulator</span>
                      <kbd className="px-2 py-1 bg-white/5 border border-white/15 rounded text-[10px] font-mono text-white font-bold">5</kbd>
                    </div>
                  </div>
                </div>

                {/* Adaptive Quiz Controls group */}
                <div className="space-y-2.5 pt-2">
                  <h4 className="font-bold text-[#8E9299] uppercase tracking-widest text-[9px] pb-1 border-b border-white/5">Assessment & Practice controls</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">Select Option A, B, C, or D</span>
                      <div className="flex gap-1">
                        <kbd className="px-2 py-1 bg-white/5 border border-white/15 rounded text-[10px] font-mono text-white font-bold">A</kbd>
                        <kbd className="px-2 py-1 bg-white/5 border border-white/15 rounded text-[10px] font-mono text-white font-bold">B</kbd>
                        <kbd className="px-2 py-1 bg-white/5 border border-white/15 rounded text-[10px] font-mono text-white font-bold">C</kbd>
                        <kbd className="px-2 py-1 bg-white/5 border border-white/15 rounded text-[10px] font-mono text-white font-bold">D</kbd>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">Confirm Answer / Next Question</span>
                      <kbd className="px-2 py-1 bg-white/5 border border-white/15 rounded text-[10px] font-mono text-white font-bold">Enter</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">Flip Active Flashcard (Vocab deck)</span>
                      <kbd className="px-2.5 py-1 bg-white/5 border border-white/15 rounded text-[10px] font-mono text-white font-bold">Space</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">Next / Previous Flashcard</span>
                      <div className="flex gap-1">
                        <kbd className="px-1.5 py-1 bg-white/5 border border-white/15 rounded text-[10px] font-mono text-white font-bold">←</kbd>
                        <kbd className="px-1.5 py-1 bg-white/5 border border-white/15 rounded text-[10px] font-mono text-white font-bold">→</kbd>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File/Utility actions group */}
                <div className="space-y-2.5 pt-2">
                  <h4 className="font-bold text-[#8E9299] uppercase tracking-widest text-[9px] pb-1 border-b border-white/5">Utility Actions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">Export Report / Save Submission Draft</span>
                      <kbd className="px-2 py-1 bg-white/5 border border-white/15 rounded text-[10px] font-mono text-white font-bold">Ctrl + S</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">Toggle Shortcuts Help Overlay</span>
                      <kbd className="px-2 py-1 bg-white/5 border border-white/15 rounded text-[10px] font-mono text-white font-bold">?</kbd>
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#8E9299]">
                <span>Press <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/15 rounded text-[9px] font-mono text-[#D4AF37] font-bold">Esc</kbd> to close.</span>
                <span className="text-[#D4AF37] font-serif font-black uppercase tracking-wider">Fatima Academy</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Comprehensive Interactive Application Guide */}
      <ApplicationGuide isOpen={showAppGuide} onClose={() => setShowAppGuide(false)} />

      {/* 7. Milestone Achievement celebration modal with automatic confetti and premium styling */}
      <AchievementModal unlockedBadge={unlockedBadge} onClose={() => setUnlockedBadge(null)} />
    </div>
  );
}
