import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Award, 
  BookOpen, 
  FileText, 
  Mic, 
  TrendingUp, 
  CheckCircle, 
  RotateCcw, 
  ChevronRight, 
  Calendar,
  Sparkles,
  Flame,
  Zap,
  Trophy,
  Share2,
  Bell,
  BellOff,
  Clock,
  AlertCircle,
  Brain,
  ArrowRight,
  Eye,
  EyeOff,
  Target,
  Download,
  HelpCircle,
  X
} from "lucide-react";
import { CEFRLevel, SkillType, EvaluationHistoryEntry } from "../types";
import { jsPDF } from "jspdf";
import confetti from "canvas-confetti";
import ProgressionChart from "./ProgressionChart";
import StreakCalendar, { calculateStreaks } from "./StreakCalendar";
import CertificateGenerator from "./CertificateGenerator";
import Achievements from "./Achievements";
import CommunityLeaderboard from "./CommunityLeaderboard";
import CefrLevelBadges from "./CefrLevelBadges";
import SkillMastery from "./SkillMastery";
import CEFRDomainRadar from "./CEFRDomainRadar";
import ActionableInsights from "./ActionableInsights";
import QuickCheckModal from "./QuickCheckModal";

interface DashboardProps {
  onNavigate: (
    tab: "dashboard" | "test" | "evaluator" | "practice" | "toefl",
    preset?: {
      cefrLevel?: CEFRLevel;
      skillType?: SkillType;
      activeSubTab?: "generator" | "vocab" | "lessons";
    }
  ) => void;
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
  onReplayIntro?: () => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  onUpdateStats?: (newStats: Partial<{
    testsTaken: number;
    practiceQuestions: number;
    evaluations: number;
    accuracy: number;
  }>) => void;
}

export default function Dashboard({ 
  onNavigate, 
  userLevel, 
  stats, 
  testHistory, 
  evaluationHistory = [], 
  onReplayIntro,
  isFocusMode = false,
  onToggleFocusMode,
  onUpdateStats
}: DashboardProps) {
  // Map level to description & description
  const levelDescriptions: Record<CEFRLevel, { name: string; band: string; desc: string }> = {
    A0: { name: "Starter / Pre-A1", band: "Introductory User", desc: "Has little to no prior knowledge of English. Can recognize and say extremely basic words, greetings, or names." },
    A1: { name: "Beginner", band: "Basic User", desc: "Can understand and use familiar everyday expressions and very basic phrases aimed at the satisfaction of needs of a concrete type." },
    A2: { name: "Elementary", band: "Basic User", desc: "Can understand sentences and frequently used expressions related to areas of most immediate relevance (e.g. basic personal info)." },
    B1: { name: "Intermediate", band: "Independent User", desc: "Can understand the main points of clear standard input on familiar matters regularly encountered in work, school, leisure, etc." },
    B2: { name: "Upper-Intermediate", band: "Independent User", desc: "Can understand the main ideas of complex text on both concrete and abstract topics, including technical discussions in their field." },
    C1: { name: "Advanced", band: "Proficient User", desc: "Can understand a wide range of demanding, longer texts, and recognise implicit meaning. Can express ideas spontaneously and fluently." },
    C2: { name: "Mastery", band: "Proficient User", desc: "Can understand with ease virtually everything heard or read. Can summarise information from different spoken and written sources seamlessly." }
  };

  const currentCEFR = userLevel || "B1";
  const levelInfo = levelDescriptions[currentCEFR];

  // Helper to get local date string YYYY-MM-DD
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper to get yesterday date string YYYY-MM-DD
  const getYesterdayDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Daily Streak State
  const [streak, setStreak] = React.useState(0);
  const [bestStreak, setBestStreak] = React.useState(0);
  const [lastDate, setLastDate] = React.useState("");
  const [xp, setXp] = React.useState(0);
  const [historyList, setHistoryList] = React.useState<string[]>([]);
  const [rewardClaimedToday, setRewardClaimedToday] = React.useState(false);
  const [showXpAnim, setShowXpAnim] = React.useState(false);
  const [xpGained, setXpGained] = React.useState(0);

  // Daily Study Goal States
  const [dailyTarget, setDailyTarget] = React.useState<number>(() => {
    return parseInt(localStorage.getItem("lexicon_daily_target") || "5", 10);
  });
  const [completedToday, setCompletedToday] = React.useState<number>(0);
  const [showGoalCelebration, setShowGoalCelebration] = React.useState<boolean>(false);
  const [simulateLateHour, setSimulateLateHour] = React.useState<boolean>(false);

  // Weekly Goal tracking states
  const [weeklyGoalType, setWeeklyGoalType] = React.useState<"hours" | "evaluations">(() => {
    return (localStorage.getItem("lexicon_weekly_goal_type") as "hours" | "evaluations") || "evaluations";
  });
  const [weeklyGoalTarget, setWeeklyGoalTarget] = React.useState<number>(() => {
    const saved = localStorage.getItem("lexicon_weekly_goal_target");
    if (saved) return parseFloat(saved);
    return weeklyGoalType === "evaluations" ? 5 : 3.0;
  });
  const [simulatedWeeklyHours, setSimulatedWeeklyHours] = React.useState<number>(() => {
    return parseFloat(localStorage.getItem("lexicon_simulated_weekly_hours") || "0.0");
  });
  const [simulatedWeeklyEvals, setSimulatedWeeklyEvals] = React.useState<number>(() => {
    return parseInt(localStorage.getItem("lexicon_simulated_weekly_evals") || "0", 10);
  });
  const [weeklyGoalReachedCelebrated, setWeeklyGoalReachedCelebrated] = React.useState<boolean>(() => {
    return localStorage.getItem("lexicon_weekly_goal_celebrated") === "true";
  });
  
  // Developer Sandbox Controls Switch (Defaults to false for premium production experience)
  const [showSandboxControls, setShowSandboxControls] = React.useState<boolean>(() => {
    return localStorage.getItem("lexicon_show_sandbox") === "true";
  });

  // Share Level & Achievements State & Handlers
  const [shareSuccessMessage, setShareSuccessMessage] = React.useState<string | null>(null);
  const [showCertificateModal, setShowCertificateModal] = React.useState<boolean>(false);
  const [showUserGuideModal, setShowUserGuideModal] = React.useState<boolean>(false);

  // Daily Practice Reminders States
  const [remindersEnabled, setRemindersEnabled] = React.useState<boolean>(() => {
    return localStorage.getItem("lexicon_reminder_enabled") === "true";
  });
  const [reminderTime, setReminderTime] = React.useState<string>(() => {
    return localStorage.getItem("lexicon_reminder_time") || "09:00";
  });
  const [reminderTopic, setReminderTopic] = React.useState<string>(() => {
    return localStorage.getItem("lexicon_reminder_topic") || "General CEFR Practice";
  });
  const [notificationPermission, setNotificationPermission] = React.useState<string>(() => {
    if (!("Notification" in window)) return "unsupported";
    return Notification.permission;
  });
  const [showNotificationToast, setShowNotificationToast] = React.useState<boolean>(false);
  const [toastMessage, setToastMessage] = React.useState<string>("");
  const [toastType, setToastType] = React.useState<"reminder" | "levelUp" | "goal">("reminder");
  const [toastTitle, setToastTitle] = React.useState<string>("Practice Reminder");
  const [showQuickCheck, setShowQuickCheck] = React.useState<boolean>(false);

  // Confetti triggering engine for celebrating user achievements
  const triggerConfettiCelebration = React.useCallback((type: "milestone" | "goal" | "streak") => {
    try {
      if (type === "milestone") {
        // High intensity dual-canon confetti burst for CEFR level increase
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.85 },
            colors: ["#D4AF37", "#AA7C11", "#FFFFFF", "#FFD700", "#FF4500"]
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.85 },
            colors: ["#D4AF37", "#AA7C11", "#FFFFFF", "#FFD700", "#FF4500"]
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      } else if (type === "goal") {
        // Massive golden starburst explosion from the center of the screen
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#D4AF37", "#FFFFFF", "#32CD32", "#1E90FF", "#FF4500"]
        });
      } else if (type === "streak") {
        // Energetic upward firework confetti burst
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#FF4500", "#FF8C00", "#FFD700", "#D4AF37", "#FFFFFF"]
        });
      }
    } catch (err) {
      console.warn("Celebratory confetti animation failed:", err);
    }
  }, []);

  // Effect to automatically celebrate daily goal completions
  React.useEffect(() => {
    if (showGoalCelebration) {
      triggerConfettiCelebration("goal");
      setToastType("goal");
      setToastTitle("Daily Goal Reached!");
      setToastMessage(`Congratulations! You have completed your daily learning target of ${dailyTarget} items. +100 XP awarded!`);
      setShowNotificationToast(true);
      const timer = setTimeout(() => setShowNotificationToast(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showGoalCelebration, triggerConfettiCelebration, dailyTarget]);

  // Effect to trigger warning notification past 8:00 PM if daily study goal is not met
  React.useEffect(() => {
    const isPast8PM = new Date().getHours() >= 20 || simulateLateHour;
    if (isPast8PM && completedToday < dailyTarget && dailyTarget > 0) {
      setToastType("reminder");
      setToastTitle("⏰ Daily Study Goal Reminder");
      setToastMessage(`It's past 8:00 PM! You still have ${dailyTarget - completedToday} items left to reach your daily study goal and protect your active streak.`);
      setShowNotificationToast(true);
      const timer = setTimeout(() => setShowNotificationToast(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [completedToday, dailyTarget, simulateLateHour]);

  // Effect to automatically celebrate streak continuations
  React.useEffect(() => {
    if (showXpAnim) {
      triggerConfettiCelebration("streak");
    }
  }, [showXpAnim, triggerConfettiCelebration]);

  // Effect to celebrate standard CEFR level milestone rank ups
  React.useEffect(() => {
    if (!currentCEFR) return;
    const previousCEFR = localStorage.getItem("lexicon_previous_known_cefr");

    if (previousCEFR && previousCEFR !== currentCEFR) {
      const levelsOrder = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
      const prevIdx = levelsOrder.indexOf(previousCEFR);
      const currIdx = levelsOrder.indexOf(currentCEFR);

      if (currIdx > prevIdx) {
        triggerConfettiCelebration("milestone");
        setToastType("levelUp");
        setToastTitle("New CEFR Milestone reached!");
        setToastMessage(`You just scaled up to the CEFR ${currentCEFR} (${levelInfo?.name || "Advanced Practitioner"}) Fluency Tier!`);
        setShowNotificationToast(true);
        const timer = setTimeout(() => setShowNotificationToast(false), 8000);
        return () => clearTimeout(timer);
      }
    }

    localStorage.setItem("lexicon_previous_known_cefr", currentCEFR);
  }, [currentCEFR, levelInfo, triggerConfettiCelebration]);

  // Export Test History records to CSV file
  const handleExportCSV = React.useCallback(() => {
    try {
      if (!testHistory || testHistory.length === 0) {
        alert("No test history found to export.");
        return;
      }

      // Headers for CSV
      const headers = ["Assessment Number", "Date & Time", "Score (Out of 20)", "Calibrated CEFR Level", "Performance Tier"];

      // Process rows
      const rows = testHistory.map((h, i) => {
        const assessmentNum = testHistory.length - i;
        const dateStr = `"${h.date.replace(/"/g, '""')}"`;
        const scoreStr = `"${h.score}"`;
        const levelStr = `"${h.stabilizedLevel}"`;
        
        // Match standard performance names from levelDescriptions
        const tierStr = `"${(levelDescriptions[h.stabilizedLevel]?.name || "Unknown").replace(/"/g, '""')}"`;

        return [assessmentNum, dateStr, scoreStr, levelStr, tierStr].join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\n");

      // Set up download element
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `CEFR_Lexicon_Test_History_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export test history CSV:", err);
    }
  }, [testHistory]);

  // AI Personalized Recommendation Engine Logic
  const recommendationData = React.useMemo(() => {
    try {
      const storedMissed = localStorage.getItem("cefr_missed_questions");
      const missedQuestions = storedMissed ? JSON.parse(storedMissed) : [];
      
      const skillTally: Record<SkillType, number> = {
        Grammar: 0,
        Vocabulary: 0,
        Reading: 0,
        Listening: 0,
        Speaking: 0,
        Writing: 0
      };

      let hasMissedData = false;
      if (Array.isArray(missedQuestions) && missedQuestions.length > 0) {
        hasMissedData = true;
        missedQuestions.forEach((q: any) => {
          if (q && q.skill_type && skillTally[q.skill_type] !== undefined) {
            skillTally[q.skill_type as SkillType] += 1;
          }
        });
      }

      let hasEvalData = false;
      if (evaluationHistory && evaluationHistory.length > 0) {
        hasEvalData = true;
        evaluationHistory.forEach((entry) => {
          const scores = entry.result?.criteria_scores;
          if (scores) {
            const levelToWeight = (lvl: string) => {
              const cleanL = lvl.toUpperCase().trim();
              if (cleanL === "A0" || cleanL === "A1") return 3;
              if (cleanL === "A2") return 2.5;
              if (cleanL === "B1") return 2;
              if (cleanL === "B2") return 1.5;
              if (cleanL === "C1") return 1;
              return 0.5; // C2
            };

            if (scores.grammatical_accuracy) {
              skillTally["Grammar"] += levelToWeight(scores.grammatical_accuracy);
            }
            if (scores.lexical_resource) {
              skillTally["Vocabulary"] += levelToWeight(scores.lexical_resource);
            }
            if (scores.coherence) {
              skillTally["Writing"] += levelToWeight(scores.coherence) * 0.7;
              skillTally["Reading"] += levelToWeight(scores.coherence) * 0.3;
            }
            if (scores.pronunciation) {
              skillTally["Speaking"] += levelToWeight(scores.pronunciation) * 0.7;
              skillTally["Listening"] += levelToWeight(scores.pronunciation) * 0.3;
            }
          }
        });
      }

      // Find the skill with the maximum value
      let maxTally = 0;
      let primaryWeakSkill: SkillType | null = null;

      Object.entries(skillTally).forEach(([skill, count]) => {
        if (count > maxTally) {
          maxTally = count;
          primaryWeakSkill = skill as SkillType;
        }
      });

      const hasData = hasMissedData || hasEvalData;

      // Now create personalized recommendations based on the weakest skill or CEFR level
      const cefr = currentCEFR;
      
      interface RecommendationItem {
        id: string;
        title: string;
        description: string;
        skillType: SkillType;
        targetTab: "generator" | "vocab" | "lessons";
        difficulty: "Starter" | "Intermediate" | "Advanced";
        timeEstimate: string;
        actionLabel: string;
      }

      let recommendations: RecommendationItem[] = [];
      let analysisSummary = "";

      if (hasData && primaryWeakSkill) {
        // We have historical performance data! Focus recommendations on the weakest skill
        analysisSummary = `Based on your recent placement test mistakes and performance metrics, we identified ${primaryWeakSkill} as your primary growth area at the ${cefr} level.`;
        
        if (primaryWeakSkill === "Grammar") {
          recommendations = [
            {
              id: "rec-grammar-1",
              title: `${cefr} Grammar Precision Drill`,
              description: `Generate tailored multiple-choice tasks targeting common ${cefr} grammar topics like modals, active/passive voice, or conditionals.`,
              skillType: "Grammar",
              targetTab: "generator",
              difficulty: cefr.startsWith("A") ? "Starter" : cefr.startsWith("B") ? "Intermediate" : "Advanced",
              timeEstimate: "5-10 mins",
              actionLabel: "Launch Grammar Drills"
            },
            {
              id: "rec-grammar-2",
              title: "Grammar & Structure Audio Lessons",
              description: `Listen to audio explanations with standard sentence patterns mapped exactly to the ${cefr} level descriptors.`,
              skillType: "Grammar",
              targetTab: "lessons",
              difficulty: cefr.startsWith("A") ? "Starter" : cefr.startsWith("B") ? "Intermediate" : "Advanced",
              timeEstimate: "8 mins",
              actionLabel: "Listen to Lessons"
            }
          ];
        } else if (primaryWeakSkill === "Vocabulary") {
          recommendations = [
            {
              id: "rec-vocab-1",
              title: `${cefr} Level Core Flashcards`,
              description: `Study your current benchmark vocabulary deck. Features definitions, Arabic translations, usage advice, and IPA transcriptions.`,
              skillType: "Vocabulary",
              targetTab: "vocab",
              difficulty: cefr.startsWith("A") ? "Starter" : cefr.startsWith("B") ? "Intermediate" : "Advanced",
              timeEstimate: "10 mins",
              actionLabel: "Open Vocabulary Deck"
            },
            {
              id: "rec-vocab-2",
              title: "Lexical Resource Context Drills",
              description: `Practice selecting the correct contextual word to complete advanced academic and professional collocations.`,
              skillType: "Vocabulary",
              targetTab: "generator",
              difficulty: cefr.startsWith("A") ? "Starter" : cefr.startsWith("B") ? "Intermediate" : "Advanced",
              timeEstimate: "5 mins",
              actionLabel: "Generate Vocab Tasks"
            }
          ];
        } else if (primaryWeakSkill === "Reading") {
          recommendations = [
            {
              id: "rec-reading-1",
              title: `CEFR ${cefr} Reading Comprehension`,
              description: `Generate tailored short texts and practice skimming, scanning, and global idea inference questions.`,
              skillType: "Reading",
              targetTab: "generator",
              difficulty: cefr.startsWith("A") ? "Starter" : cefr.startsWith("B") ? "Intermediate" : "Advanced",
              timeEstimate: "7 mins",
              actionLabel: "Practice Reading"
            },
            {
              id: "rec-reading-2",
              title: "Vocabulary-in-Context Exercises",
              description: `Clear reading blocks by studying definitions and usage tips in our curated ${cefr} vocabulary cards.`,
              skillType: "Vocabulary",
              targetTab: "vocab",
              difficulty: cefr.startsWith("A") ? "Starter" : cefr.startsWith("B") ? "Intermediate" : "Advanced",
              timeEstimate: "8 mins",
              actionLabel: "Review Vocabulary"
            }
          ];
        } else if (primaryWeakSkill === "Listening") {
          recommendations = [
            {
              id: "rec-listening-1",
              title: `CEFR ${cefr} Listening Drills`,
              description: `Practice identifying the main facts, attitudes, and contextual details in simulated oral recordings.`,
              skillType: "Listening",
              targetTab: "generator",
              difficulty: cefr.startsWith("A") ? "Starter" : cefr.startsWith("B") ? "Intermediate" : "Advanced",
              timeEstimate: "6 mins",
              actionLabel: "Generate Listening Tasks"
            },
            {
              id: "rec-listening-2",
              title: "Conversational Audio Lessons",
              description: `Listen to standard verbal patterns with explanations on speaker connection, speed, and contractions.`,
              skillType: "Listening",
              targetTab: "lessons",
              difficulty: cefr.startsWith("A") ? "Starter" : cefr.startsWith("B") ? "Intermediate" : "Advanced",
              timeEstimate: "10 mins",
              actionLabel: "Start Audio Lessons"
            }
          ];
        } else {
          // Writing or Speaking
          recommendations = [
            {
              id: "rec-productive-1",
              title: `${cefr} Coherence & Structure Builder`,
              description: `Generate sample paragraphs and essay frameworks to structure your thoughts and arguments clearly.`,
              skillType: "Grammar",
              targetTab: "generator",
              difficulty: cefr.startsWith("A") ? "Starter" : cefr.startsWith("B") ? "Intermediate" : "Advanced",
              timeEstimate: "8 mins",
              actionLabel: "Practice Grammar"
            },
            {
              id: "rec-productive-2",
              title: "Word and Sentence Pronunciation",
              description: `Listen to correct phonetic pronunciations of high-utility lexical words and practice speaking them.`,
              skillType: "Vocabulary",
              targetTab: "vocab",
              difficulty: cefr.startsWith("A") ? "Starter" : cefr.startsWith("B") ? "Intermediate" : "Advanced",
              timeEstimate: "5 mins",
              actionLabel: "Flip Pronunciation Cards"
            }
          ];
        }
      } else {
        // Fallback default recommendations based on user level (e.g., if no test has been taken yet)
        analysisSummary = `You haven't logged any assessment mistakes yet. To activate the fully custom recommendation engine, please take the Adaptive Assessment. For now, here is your level-based starter plan:`;
        
        if (cefr === "A0" || cefr === "A1") {
          recommendations = [
            {
              id: "rec-starter-1",
              title: "Foundation Vocabulary Deck",
              description: `Master basic nouns, greetings, and everyday phrases. Includes Arabic translation and audio pronunciation guides.`,
              skillType: "Vocabulary",
              targetTab: "vocab",
              difficulty: "Starter",
              timeEstimate: "5 mins",
              actionLabel: "Start Flashcards"
            },
            {
              id: "rec-starter-2",
              title: "A1 Starter Audio Lessons",
              description: `Listen to friendly, slow-paced conversational guides specifically engineered to ease you into standard English.`,
              skillType: "Listening",
              targetTab: "lessons",
              difficulty: "Starter",
              timeEstimate: "8 mins",
              actionLabel: "Explore Audio Lessons"
            }
          ];
        } else if (cefr.startsWith("B")) {
          recommendations = [
            {
              id: "rec-inter-1",
              title: `${cefr} Grammar Drills`,
              description: `Challenge yourself with intermediate grammatical structures like relative pronouns and simple conditionals.`,
              skillType: "Grammar",
              targetTab: "generator",
              difficulty: "Intermediate",
              timeEstimate: "10 mins",
              actionLabel: "Start Grammar Drills"
            },
            {
              id: "rec-inter-2",
              title: `${cefr} Vocabulary Booster`,
              description: `Learn collocations, formal phrases, and descriptive adverbs to sound more natural and precise.`,
              skillType: "Vocabulary",
              targetTab: "vocab",
              difficulty: "Intermediate",
              timeEstimate: "8 mins",
              actionLabel: "Study Flashcards"
            }
          ];
        } else {
          // Advanced (C1/C2)
          recommendations = [
            {
              id: "rec-adv-1",
              title: "Advanced Coherence & Nuance",
              description: `Generate writing and speaking prompt scenarios with high-level grammatical and stylistic requirements.`,
              skillType: "Grammar",
              targetTab: "generator",
              difficulty: "Advanced",
              timeEstimate: "10 mins",
              actionLabel: "Launch Advanced Drills"
            },
            {
              id: "rec-adv-2",
              title: "Academic & Professional Lexicon",
              description: `Study idioms, figures of speech, and highly specific vocabulary tailored for academic writing and debate.`,
              skillType: "Vocabulary",
              targetTab: "vocab",
              difficulty: "Advanced",
              timeEstimate: "10 mins",
              actionLabel: "Review Advanced Deck"
            }
          ];
        }
      }

      return {
        hasData,
        primaryWeakSkill,
        analysisSummary,
        recommendations
      };
    } catch (err) {
      console.error("Failed to compute recommendations:", err);
      return {
        hasData: false,
        primaryWeakSkill: null,
        analysisSummary: "Recommendations loading...",
        recommendations: []
      };
    }
  }, [currentCEFR, evaluationHistory]);

  const formatTimeDisplay = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(":");
      const hr = parseInt(hours, 10);
      const ampm = hr >= 12 ? "PM" : "AM";
      const displayHr = hr % 12 || 12;
      return `${displayHr}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser or container environment does not support system push notifications. In-app alerts will be triggered instead!");
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        new Notification("Fatima Reminders Configured! 🔔", {
          body: `You are set to receive study reminders for ${reminderTopic} daily at ${formatTimeDisplay(reminderTime)}!`,
          icon: "https://translate.google.com/favicon.ico"
        });
      }
    } catch (err) {
      console.error("Error requesting browser notification permission", err);
    }
  };

  const handleToggleReminders = async (enabled: boolean) => {
    setRemindersEnabled(enabled);
    localStorage.setItem("lexicon_reminder_enabled", String(enabled));
    
    if (enabled) {
      if ("Notification" in window) {
        if (Notification.permission === "default") {
          await requestNotificationPermission();
        } else {
          setNotificationPermission(Notification.permission);
        }
      } else {
        setNotificationPermission("unsupported");
      }
    }
  };

  const handleUpdateReminderTime = (time: string) => {
    setReminderTime(time);
    localStorage.setItem("lexicon_reminder_time", time);
  };

  const handleUpdateReminderTopic = (topic: string) => {
    setReminderTopic(topic);
    localStorage.setItem("lexicon_reminder_topic", topic);
  };

  const triggerReminderNotification = (isTest = false) => {
    const title = isTest ? "Fatima Practice Alert (Test) 🔔" : "Time for English Practice! 📚";
    const body = isTest
      ? `This is a live test of your scheduled reminders. Ready for some ${reminderTopic}?`
      : `Elevate your CEFR English level! It's time for your daily ${reminderTopic} practice session. Keep up your streak!`;

    // 1. Browser Push Notification
    if ("Notification" in window && Notification.permission === "granted" && (isTest || remindersEnabled)) {
      try {
        new Notification(title, {
          body,
          icon: "https://translate.google.com/favicon.ico"
        });
      } catch (err) {
        console.error("Browser notification failed to fire:", err);
      }
    }

    // 2. Beautiful In-App Toast Notification Banner
    setToastType("reminder");
    setToastTitle(title);
    setToastMessage(body);
    setShowNotificationToast(true);
    // Auto-hide toast after 6 seconds
    setTimeout(() => {
      setShowNotificationToast(false);
    }, 6000);
  };

  const copyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setShareSuccessMessage("Copied to clipboard!");
      setTimeout(() => setShareSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to copy text:", err);
      setShareSuccessMessage("Could not copy link");
      setTimeout(() => setShareSuccessMessage(null), 3000);
    }
  };

  const handleShare = async () => {
    const levelName = levelInfo?.name || "English Learner";
    const totalLessons = stats.testsTaken + stats.practiceQuestions + stats.evaluations;
    const shareText = `🎓 I'm elevating my English communicative competence on Fatima Academy!\n\n📈 My CEFR Level: ${currentCEFR} (${levelName})\n🔥 Current Streak: ${streak} Day${streak === 1 ? "" : "s"}\n📝 Completed activities: ${totalLessons} (${stats.testsTaken} placement test${stats.testsTaken === 1 ? "" : "s"}, ${stats.practiceQuestions} practice task${stats.practiceQuestions === 1 ? "" : "s"}, ${stats.evaluations} AI evaluation${stats.evaluations === 1 ? "" : "s"})\n🎯 Overall Accuracy: ${Math.round(stats.accuracy)}%\n\nJoin me in mastering standard English descriptors! #CEFR #EnglishLearning #FatimaAcademy`;

    const shareData = {
      title: "My English Level & Study Achievements - Fatima Academy",
      text: shareText,
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareSuccessMessage("Successfully shared!");
        setTimeout(() => setShareSuccessMessage(null), 3000);
      } catch (err: any) {
        // If aborted, don't show error, just standard exit.
        if (err.name !== "AbortError") {
          console.warn("Web Share failed, copying to clipboard instead:", err);
          copyToClipboard(shareText);
        }
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const primaryColor = [212, 175, 55]; // Gold
      let y = 20;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > 275) {
          doc.addPage();
          // Header on new page
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(142, 146, 153);
          doc.text("LEXICON ACADEMY - CEFR ENGLISH PROFICIENCY REPORT", 20, 15);
          doc.setDrawColor(230, 230, 235);
          doc.setLineWidth(0.3);
          doc.line(20, 17, 190, 17);
          y = 25;
        }
      };

      // 1. HEADER BRANDING
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("LEXICON ACADEMY", 20, y);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(142, 146, 153);
      doc.text("Official CEFR Fluency & Progression Record", 20, y + 6);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 85);
      doc.text(`DATE GENERATED: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 120, y + 3);
      
      y += 15;

      // Divider
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.8);
      doc.line(20, y, 190, y);
      y += 10;

      // 2. CURRENT PROFILE SUMMARY BOX
      doc.setFillColor(248, 249, 250);
      doc.setDrawColor(230, 230, 235);
      doc.setLineWidth(0.3);
      doc.rect(20, y, 170, 35, "FD");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 35);
      doc.text("CURRENT PROFICIENCY PROFILE", 25, y + 7);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(currentCEFR, 25, y + 23);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(30, 30, 35);
      doc.text(levelInfo?.name || "English Learner", 50, y + 17);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 105);
      doc.text(levelInfo?.band || "CEFR Band", 50, y + 22);

      // Overall stats inside the box
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(40, 40, 45);
      const totalActivities = stats.testsTaken + stats.practiceQuestions + stats.evaluations;
      doc.text(`Total Activities Completed: ${totalActivities}`, 115, y + 10);
      doc.text(`Placement Tests: ${stats.testsTaken}`, 115, y + 15);
      doc.text(`AI Speech/Essay Evaluated: ${stats.evaluations}`, 115, y + 20);
      doc.text(`Practice Items Mastered: ${stats.practiceQuestions}`, 115, y + 25);
      doc.text(`Average Quiz Accuracy: ${Math.round(stats.accuracy)}%`, 115, y + 30);

      y += 45;

      // 3. DESCRIPTION
      checkPageBreak(30);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 35);
      doc.text("CEFR LEVEL FUNCTIONAL DESCRIPTORS", 20, y);
      y += 5;
      
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(80, 80, 85);
      
      // Wrap description text to fit document width
      const descLines = doc.splitTextToSize(levelInfo?.desc || "", 170);
      doc.text(descLines, 20, y);
      y += (descLines.length * 5) + 12;

      // 4. PLACEMENT ASSESSMENT HISTORY
      checkPageBreak(35);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 35);
      doc.text("1. PLACEMENT ASSESSMENT PROGRESSION", 20, y);
      y += 6;

      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.4);
      doc.line(20, y, 190, y);
      y += 5;

      if (testHistory.length === 0) {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(142, 146, 153);
        doc.text("No placement assessment tests logged yet.", 20, y);
        y += 10;
      } else {
        // Draw Table Header
        doc.setFillColor(240, 241, 243);
        doc.rect(20, y, 170, 7, "F");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 35);
        doc.text("Date & Time", 25, y + 5);
        doc.text("Assessment Score", 95, y + 5);
        doc.text("Stabilized Level", 150, y + 5);
        
        y += 7;

        testHistory.forEach((item, index) => {
          checkPageBreak(10);
          
          // Row background alternation
          if (index % 2 === 0) {
            doc.setFillColor(250, 250, 252);
            doc.rect(20, y, 170, 8, "F");
          }
          
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(50, 50, 55);
          doc.text(item.date, 25, y + 5.5);
          doc.text(`${item.score} / 20 correct`, 95, y + 5.5);
          
          doc.setFont("Helvetica", "bold");
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.text(item.stabilizedLevel, 150, y + 5.5);
          
          y += 8;
        });
        y += 5;
      }

      // 5. EVALUATION HISTORY REPORT
      checkPageBreak(40);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 35);
      doc.text("2. DETAILED SPEAKING & WRITING EVALUATIONS", 20, y);
      y += 6;

      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.4);
      doc.line(20, y, 190, y);
      y += 5;

      if (evaluationHistory.length === 0) {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(142, 146, 153);
        doc.text("No AI evaluation submissions logged yet.", 20, y);
        y += 10;
      } else {
        evaluationHistory.forEach((entry, index) => {
          checkPageBreak(40);
          
          // Card Box for each evaluation entry
          doc.setFillColor(252, 252, 253);
          doc.setDrawColor(220, 220, 225);
          doc.rect(20, y, 170, 34, "FD");

          doc.setFont("Helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(30, 30, 35);
          doc.text(`${entry.promptTitle}`, 25, y + 5.5);
          
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 105);
          doc.text(`Date: ${entry.date}  |  Type: ${entry.type.toUpperCase()}`, 25, y + 10.5);

          doc.setFont("Helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.text(`CEFR: ${entry.result.overall_assigned_level}`, 155, y + 5.5);

          // Criteria Matrix Scores inline format
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(50, 50, 55);
          doc.text("Evaluative Metrics:", 25, y + 16.5);
          
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(80, 80, 85);
          
          const gra = entry.result.criteria_scores?.grammatical_accuracy || "N/A";
          const lr = entry.result.criteria_scores?.lexical_resource || "N/A";
          const fc = entry.result.criteria_scores?.coherence || "N/A";

          const graText = `GRA: ${gra.length > 50 ? gra.substring(0, 50) + "..." : gra}`;
          const lrText = `LR: ${lr.length > 50 ? lr.substring(0, 50) + "..." : lr}`;
          const fcText = `FC: ${fc.length > 50 ? fc.substring(0, 50) + "..." : fc}`;

          doc.text(graText, 25, y + 21);
          doc.text(lrText, 25, y + 25);
          doc.text(fcText, 25, y + 29);

          y += 38;
        });
      }

      // 6. CERTIFICATION FOOTER
      checkPageBreak(25);
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.5);
      doc.line(20, 275, 190, 275);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(142, 146, 153);
      doc.text("FATIMA ACADEMY CEFR EDUCATION SYSTEM • CERTIFIED DIGITAL REPORT", 20, 280);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.text("This report tracks study metrics synchronized with standard CEFR language indicators.", 20, 284);

      // Save the PDF
      doc.save(`Fatima_Academy_CEFR_Report_${getLocalDateString()}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    }
  };

  // Sync / Calculate Daily Streak from localStorage and stats props
  React.useEffect(() => {
    const todayStr = getLocalDateString();
    const yesterdayStr = getYesterdayDateString();

    const storedStreak = parseInt(localStorage.getItem("lexicon_streak_count") || "0", 10);
    const storedBest = parseInt(localStorage.getItem("lexicon_best_streak") || "0", 10);
    const storedLastDate = localStorage.getItem("lexicon_streak_last_date") || "";
    const storedXp = parseInt(localStorage.getItem("lexicon_streak_xp") || "0", 10);
    const storedHistory = JSON.parse(localStorage.getItem("lexicon_streak_history") || "[]");
    const storedLastTotal = parseInt(localStorage.getItem("lexicon_last_known_stats_total") || "0", 10);
    const storedRewardClaimed = localStorage.getItem("lexicon_streak_reward_claimed_today") === todayStr;

    let currentStreak = storedStreak;
    let currentBest = storedBest;

    // Check if streak was broken (more than 1 day missed)
    if (storedLastDate && storedLastDate !== todayStr && storedLastDate !== yesterdayStr) {
      currentStreak = 0;
      localStorage.setItem("lexicon_streak_count", "0");
    }

    // Auto-detect new completed practice / test / evaluation
    const currentTotalActivity = stats.testsTaken + stats.practiceQuestions + stats.evaluations;
    const hasNewPractice = currentTotalActivity > storedLastTotal;

    if (hasNewPractice && currentTotalActivity > 0) {
      if (storedLastDate !== todayStr) {
        let newStreak = 1;
        if (storedLastDate === yesterdayStr) {
          newStreak = currentStreak + 1;
        }

        currentStreak = newStreak;
        if (newStreak > currentBest) {
          currentBest = newStreak;
        }

        const newHistory = Array.from(new Set([...storedHistory, todayStr]));
        const xpReward = 50 + (newStreak % 7 === 0 ? 100 : 0); // 7-day streak bonus!

        setXpGained(xpReward);
        setShowXpAnim(true);
        setTimeout(() => setShowXpAnim(false), 3000);

        const nextXp = storedXp + xpReward;

        localStorage.setItem("lexicon_streak_count", String(newStreak));
        localStorage.setItem("lexicon_best_streak", String(currentBest));
        localStorage.setItem("lexicon_streak_last_date", todayStr);
        localStorage.setItem("lexicon_streak_xp", String(nextXp));
        localStorage.setItem("lexicon_streak_history", JSON.stringify(newHistory));
        localStorage.setItem("lexicon_streak_reward_claimed_today", todayStr);

        setStreak(newStreak);
        setBestStreak(currentBest);
        setLastDate(todayStr);
        setXp(nextXp);
        setHistoryList(newHistory);
        setRewardClaimedToday(true);
      }
      localStorage.setItem("lexicon_last_known_stats_total", String(currentTotalActivity));
    } else {
      setStreak(currentStreak);
      setBestStreak(currentBest);
      setLastDate(storedLastDate);
      setXp(storedXp);
      setHistoryList(storedHistory);
      setRewardClaimedToday(storedRewardClaimed);
      if (localStorage.getItem("lexicon_last_known_stats_total") === null) {
        localStorage.setItem("lexicon_last_known_stats_total", String(currentTotalActivity));
      }
    }
  }, [stats.testsTaken, stats.practiceQuestions, stats.evaluations]);

  // Handle manual focus/practice check-in
  const handleManualCheckIn = () => {
    const todayStr = getLocalDateString();
    const yesterdayStr = getYesterdayDateString();

    const storedStreak = parseInt(localStorage.getItem("lexicon_streak_count") || "0", 10);
    const storedBest = parseInt(localStorage.getItem("lexicon_best_streak") || "0", 10);
    const storedXp = parseInt(localStorage.getItem("lexicon_streak_xp") || "0", 10);
    const storedHistory = JSON.parse(localStorage.getItem("lexicon_streak_history") || "[]");

    if (lastDate === todayStr) return;

    let newStreak = 1;
    if (lastDate === yesterdayStr) {
      newStreak = storedStreak + 1;
    }

    const newBest = newStreak > storedBest ? newStreak : storedBest;
    const newHistory = Array.from(new Set([...storedHistory, todayStr]));
    const xpReward = 50 + (newStreak % 7 === 0 ? 100 : 0);
    const nextXp = storedXp + xpReward;

    localStorage.setItem("lexicon_streak_count", String(newStreak));
    localStorage.setItem("lexicon_best_streak", String(newBest));
    localStorage.setItem("lexicon_streak_last_date", todayStr);
    localStorage.setItem("lexicon_streak_xp", String(nextXp));
    localStorage.setItem("lexicon_streak_history", JSON.stringify(newHistory));
    localStorage.setItem("lexicon_streak_reward_claimed_today", todayStr);

    setStreak(newStreak);
    setBestStreak(newBest);
    setLastDate(todayStr);
    setXp(nextXp);
    setHistoryList(newHistory);
    setRewardClaimedToday(true);

    setXpGained(xpReward);
    setShowXpAnim(true);
    setTimeout(() => setShowXpAnim(false), 3000);
  };

  // Synchronize Daily Study Goal
  React.useEffect(() => {
    const todayStr = getLocalDateString();
    
    // Get stored completed today
    const storedCompletedToday = parseInt(localStorage.getItem("lexicon_completed_today_count") || "0", 10);
    const storedCompletedTodayDate = localStorage.getItem("lexicon_completed_today_date") || "";
    
    let currentCompletedToday = storedCompletedToday;
    if (storedCompletedTodayDate !== todayStr) {
      currentCompletedToday = 0;
      localStorage.setItem("lexicon_completed_today_count", "0");
      localStorage.setItem("lexicon_completed_today_date", todayStr);
    }
    
    // Auto-detect new completed practice / test / evaluation
    const storedLastTotal = parseInt(localStorage.getItem("lexicon_last_known_stats_total") || "0", 10);
    const currentTotalActivity = stats.testsTaken + stats.practiceQuestions + stats.evaluations;
    
    if (currentTotalActivity > storedLastTotal) {
      const diff = currentTotalActivity - storedLastTotal;
      currentCompletedToday += diff;
      localStorage.setItem("lexicon_completed_today_count", String(currentCompletedToday));
      localStorage.setItem("lexicon_last_known_stats_total", String(currentTotalActivity));
    } else if (localStorage.getItem("lexicon_last_known_stats_total") === null) {
      localStorage.setItem("lexicon_last_known_stats_total", String(currentTotalActivity));
    }
    
    setCompletedToday(currentCompletedToday);
    
    // Check if goal is met and celebration hasn't run yet today
    const lastCelebratedDate = localStorage.getItem("lexicon_daily_goal_celebrated_date") || "";
    if (currentCompletedToday >= dailyTarget && lastCelebratedDate !== todayStr && dailyTarget > 0) {
      setShowGoalCelebration(true);
      localStorage.setItem("lexicon_daily_goal_celebrated_date", todayStr);
      
      // Award 100 bonus XP!
      const storedXp = parseInt(localStorage.getItem("lexicon_streak_xp") || "0", 10);
      const nextXp = storedXp + 100;
      localStorage.setItem("lexicon_streak_xp", String(nextXp));
      setXp(nextXp);
    }
  }, [stats.testsTaken, stats.practiceQuestions, stats.evaluations, dailyTarget]);

  // Weekly Goal progress computation and auto-celebration
  const actualWeeklyEvals = React.useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return (evaluationHistory || []).filter(entry => {
      try {
        const entryDate = new Date(entry.date);
        return entryDate >= sevenDaysAgo;
      } catch {
        return false;
      }
    }).length;
  }, [evaluationHistory]);

  const weeklyProgressEvals = actualWeeklyEvals + simulatedWeeklyEvals;

  const weeklyProgressHours = React.useMemo(() => {
    // Each practice question: 0.05 hr (3 mins), test: 0.4 hr (24 mins), evaluation: 0.2 hr (12 mins)
    const statsHours = (stats.practiceQuestions * 0.05) + (stats.testsTaken * 0.4) + (stats.evaluations * 0.2);
    return parseFloat((statsHours + simulatedWeeklyHours).toFixed(1));
  }, [stats.practiceQuestions, stats.testsTaken, stats.evaluations, simulatedWeeklyHours]);

  const currentWeeklyProgressValue = weeklyGoalType === "evaluations" ? weeklyProgressEvals : weeklyProgressHours;
  const weeklyProgressPercentage = Math.min(100, Math.round((currentWeeklyProgressValue / weeklyGoalTarget) * 100));

  React.useEffect(() => {
    if (currentWeeklyProgressValue >= weeklyGoalTarget && weeklyGoalTarget > 0 && !weeklyGoalReachedCelebrated) {
      triggerConfettiCelebration("goal");
      setWeeklyGoalReachedCelebrated(true);
      localStorage.setItem("lexicon_weekly_goal_celebrated", "true");
      
      // Award 200 XP for weekly milestone achievement!
      const storedXp = parseInt(localStorage.getItem("lexicon_streak_xp") || "0", 10);
      const nextXp = storedXp + 200;
      localStorage.setItem("lexicon_streak_xp", String(nextXp));
      setXp(nextXp);
      
      // Show notification toast
      setToastType("goal");
      setToastTitle("Weekly Goal Reached!");
      setToastMessage(`Congratulations! You reached your weekly learning target of ${weeklyGoalTarget} ${weeklyGoalType === "evaluations" ? "evaluations" : "hours of practice"}. +200 XP awarded!`);
      setShowNotificationToast(true);
    }
  }, [currentWeeklyProgressValue, weeklyGoalTarget, weeklyGoalType, weeklyGoalReachedCelebrated, triggerConfettiCelebration]);

  const handleSetWeeklyGoalType = (type: "hours" | "evaluations") => {
    setWeeklyGoalType(type);
    localStorage.setItem("lexicon_weekly_goal_type", type);
    const newTarget = type === "evaluations" ? 5 : 3.0;
    setWeeklyGoalTarget(newTarget);
    localStorage.setItem("lexicon_weekly_goal_target", String(newTarget));
    localStorage.removeItem("lexicon_weekly_goal_celebrated");
    setWeeklyGoalReachedCelebrated(false);
  };

  const handleSetWeeklyGoalTarget = (target: number) => {
    setWeeklyGoalTarget(target);
    localStorage.setItem("lexicon_weekly_goal_target", String(target));
    if (currentWeeklyProgressValue < target) {
      localStorage.removeItem("lexicon_weekly_goal_celebrated");
      setWeeklyGoalReachedCelebrated(false);
    }
  };

  const handleLogWeeklyPracticeHours = (amt: number) => {
    const nextHours = parseFloat((simulatedWeeklyHours + amt).toFixed(1));
    setSimulatedWeeklyHours(nextHours);
    localStorage.setItem("lexicon_simulated_weekly_hours", String(nextHours));
    if (weeklyGoalType === "hours" && (weeklyProgressHours + amt) < weeklyGoalTarget) {
      localStorage.removeItem("lexicon_weekly_goal_celebrated");
      setWeeklyGoalReachedCelebrated(false);
    }
  };

  const handleLogWeeklyEval = () => {
    const nextEvals = simulatedWeeklyEvals + 1;
    setSimulatedWeeklyEvals(nextEvals);
    localStorage.setItem("lexicon_simulated_weekly_evals", String(nextEvals));
    if (weeklyGoalType === "evaluations" && (weeklyProgressEvals + 1) < weeklyGoalTarget) {
      localStorage.removeItem("lexicon_weekly_goal_celebrated");
      setWeeklyGoalReachedCelebrated(false);
    }
  };

  // Save/Export PDF via keyboard shortcut Ctrl+S on Dashboard
  React.useEffect(() => {
    const handleSaveEvent = () => {
      handleExportPDF();
    };
    window.addEventListener("app-keyboard-save", handleSaveEvent);
    return () => window.removeEventListener("app-keyboard-save", handleSaveEvent);
  }, [userLevel, stats, testHistory, evaluationHistory]);

  // Daily reminder scheduler background check running every 30 seconds
  React.useEffect(() => {
    if (!remindersEnabled) return;

    const checkTimeAndTrigger = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMinutes = String(now.getMinutes()).padStart(2, "0");
      const currentTimeString = `${currentHours}:${currentMinutes}`;

      if (currentTimeString === reminderTime) {
        const todayStr = getLocalDateString();
        const lastNotifiedDate = localStorage.getItem("lexicon_last_notified_date") || "";
        
        if (lastNotifiedDate !== todayStr) {
          localStorage.setItem("lexicon_last_notified_date", todayStr);
          triggerReminderNotification();
        }
      }
    };

    checkTimeAndTrigger();
    const interval = setInterval(checkTimeAndTrigger, 30000);
    return () => clearInterval(interval);
  }, [remindersEnabled, reminderTime, reminderTopic]);

  // Simulation for testing/interaction
  const handleSimulateCompletion = () => {
    const todayStr = getLocalDateString();
    const nextCompletedToday = completedToday + 1;
    setCompletedToday(nextCompletedToday);
    localStorage.setItem("lexicon_completed_today_count", String(nextCompletedToday));
    localStorage.setItem("lexicon_completed_today_date", todayStr);
    
    // Check if goal met
    const lastCelebratedDate = localStorage.getItem("lexicon_daily_goal_celebrated_date") || "";
    if (nextCompletedToday >= dailyTarget && lastCelebratedDate !== todayStr && dailyTarget > 0) {
      setShowGoalCelebration(true);
      localStorage.setItem("lexicon_daily_goal_celebrated_date", todayStr);
      
      const storedXp = parseInt(localStorage.getItem("lexicon_streak_xp") || "0", 10);
      const nextXp = storedXp + 100;
      localStorage.setItem("lexicon_streak_xp", String(nextXp));
      setXp(nextXp);
    }
  };

  // Set custom daily target
  const handleSetDailyTarget = (target: number) => {
    if (target < 1) return;
    setDailyTarget(target);
    localStorage.setItem("lexicon_daily_target", String(target));
  };

  // Generate and download a highly premium academic transcript of CEFR competencies
  const handleDownloadPdfReport = () => {
    try {
      const baseCEFR = userLevel || "B1";
      const levelToVal = (lvl: CEFRLevel): number => {
        const mapping: Record<CEFRLevel, number> = { A0: 0, A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
        return mapping[lvl] ?? 1;
      };
      const valToLevel = (val: number): CEFRLevel => {
        const levels: CEFRLevel[] = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
        const index = Math.max(0, Math.min(6, Math.round(val)));
        return levels[index];
      };
      const getMastery = (lvl: CEFRLevel): "Beginner" | "Intermediate" | "Advanced" => {
        if (["A0", "A1", "A2"].includes(lvl)) return "Beginner";
        if (["B1", "B2"].includes(lvl)) return "Intermediate";
        return "Advanced";
      };

      const baseVal = levelToVal(baseCEFR);
      let grammarVal = baseVal;
      let vocabVal = baseVal;
      let listeningVal = baseVal;
      let readingVal = baseVal;
      let speakingVal = baseVal;
      let writingVal = baseVal;

      // 1. Incorporate Test History (Reading, Listening, Grammar)
      if (testHistory && testHistory.length > 0) {
        const lastTests = testHistory.slice(0, 3);
        const avgTestVal = lastTests.reduce((acc, t) => acc + levelToVal(t.stabilizedLevel), 0) / lastTests.length;
        readingVal = (readingVal + avgTestVal) / 2;
        listeningVal = (listeningVal + avgTestVal) / 2;
        grammarVal = (grammarVal + avgTestVal) / 2;
      }

      // 2. Incorporate AI Evaluations (Writing & Speaking)
      const evHist = evaluationHistory || [];
      const writingEvaluations = evHist.filter(e => e.type === "writing");
      const speakingEvaluations = evHist.filter(e => e.type === "speaking");

      if (writingEvaluations.length > 0) {
        const avgWritingVal = writingEvaluations.reduce((acc, e) => acc + levelToVal(e.result.overall_assigned_level), 0) / writingEvaluations.length;
        writingVal = (writingVal * 0.4) + (avgWritingVal * 0.6);
        let criteriaGrammarAcc = 0;
        let criteriaVocabAcc = 0;
        let count = 0;
        writingEvaluations.forEach(e => {
          const scores = e.result.criteria_scores;
          if (scores) {
            if (scores.grammatical_accuracy) {
              criteriaGrammarAcc += levelToVal(scores.grammatical_accuracy as CEFRLevel);
              count++;
            }
            if (scores.lexical_resource) {
              criteriaVocabAcc += levelToVal(scores.lexical_resource as CEFRLevel);
            }
          }
        });
        if (count > 0) {
          grammarVal = (grammarVal * 0.5) + ((criteriaGrammarAcc / count) * 0.5);
          vocabVal = (vocabVal * 0.5) + ((criteriaVocabAcc / count) * 0.5);
        }
      }

      if (speakingEvaluations.length > 0) {
        const avgSpeakingVal = speakingEvaluations.reduce((acc, e) => acc + levelToVal(e.result.overall_assigned_level), 0) / speakingEvaluations.length;
        speakingVal = (speakingVal * 0.4) + (avgSpeakingVal * 0.6);
        let criteriaPronVal = 0;
        let count = 0;
        speakingEvaluations.forEach(e => {
          const scores = e.result.criteria_scores;
          if (scores && scores.pronunciation) {
            criteriaPronVal += levelToVal(scores.pronunciation as CEFRLevel);
            count++;
          }
        });
        if (count > 0) {
          speakingVal = (speakingVal * 0.5) + ((criteriaPronVal / count) * 0.5);
        }
      }

      // 3. Incorporate Practice Drill Milestones
      if (stats.practiceQuestions > 0) {
        const questionsBonus = Math.min(1.0, stats.practiceQuestions / 40);
        vocabVal = Math.min(6, vocabVal + (questionsBonus * 0.5));
        if (stats.accuracy > 0) {
          const accuracyBonus = (stats.accuracy - 50) / 50;
          grammarVal = Math.max(0, Math.min(6, grammarVal + (accuracyBonus * 0.6)));
        }
      }

      const getPercentage = (val: number) => Math.max(10, Math.min(100, Math.round((val / 6) * 100)));

      const skillsData = [
        { name: "Grammar & Accuracy", level: valToLevel(grammarVal), percentage: getPercentage(grammarVal), mastery: getMastery(valToLevel(grammarVal)) },
        { name: "Lexical & Vocabulary", level: valToLevel(vocabVal), percentage: getPercentage(vocabVal), mastery: getMastery(valToLevel(vocabVal)) },
        { name: "Auditory Comprehension", level: valToLevel(listeningVal), percentage: getPercentage(listeningVal), mastery: getMastery(valToLevel(listeningVal)) },
        { name: "Text Reading & Speed", level: valToLevel(readingVal), percentage: getPercentage(readingVal), mastery: getMastery(valToLevel(readingVal)) },
        { name: "Spoken Communication", level: valToLevel(speakingVal), percentage: getPercentage(speakingVal), mastery: getMastery(valToLevel(speakingVal)) },
        { name: "Written Expression", level: valToLevel(writingVal), percentage: getPercentage(writingVal), mastery: getMastery(valToLevel(writingVal)) },
      ];

      // Sort to compute strongest and weakest areas
      const sortedSkills = [...skillsData].sort((a, b) => a.percentage - b.percentage);
      const lowestSkill = sortedSkills[0];
      const highestSkill = sortedSkills[sortedSkills.length - 1];

      // Instantiating jsPDF
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Frame border
      doc.setDrawColor(212, 175, 55); // Academy gold outer
      doc.setLineWidth(1.0);
      doc.rect(10, 10, 190, 277);

      doc.setDrawColor(225, 225, 230); // Cool slate thin inner border
      doc.setLineWidth(0.2);
      doc.rect(11.5, 11.5, 187, 274);

      // Top Header Container (Rich Dark Charcoal)
      doc.setFillColor(20, 20, 23);
      doc.roundedRect(15, 15, 180, 28, 2, 2, "F");

      // Left Gold Stripe Accent
      doc.setFillColor(212, 175, 55);
      doc.rect(15, 15, 4, 28, "F");

      // Header Typography
      doc.setTextColor(212, 175, 55);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13.5);
      doc.text("FATIMA CEFR SMART LANGUAGE ACADEMY", 24, 23.5);

      doc.setTextColor(240, 240, 245);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text("Official CEFR Competency & Fluency Transcript Report", 24, 29);

      // Metadata right alignments
      doc.setTextColor(142, 146, 153);
      doc.setFontSize(7.5);
      const formattedDate = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(`ISSUED: ${formattedDate.toUpperCase()}`, 190, 23.5, { align: "right" });
      doc.text("VERIFIED VALIDITY: SYSTEM CERTIFIED", 190, 29, { align: "right" });

      // Profile Title
      let currentY = 51;
      doc.setTextColor(212, 175, 55);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text("I. STUDENT ACADEMIC PROFILE & GLOBAL METRICS", 15, currentY);

      // Gold separating divider line
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.3);
      doc.line(15, currentY + 2, 195, currentY + 2);

      // Draw Profile Grid boxes
      const drawMetricBox = (x: number, y: number, w: number, h: number, label: string, value: string) => {
        doc.setDrawColor(230, 230, 235);
        doc.setFillColor(248, 249, 250);
        doc.setLineWidth(0.25);
        doc.roundedRect(x, y, w, h, 1.2, 1.2, "FD");

        // Label
        doc.setTextColor(110, 115, 125);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(7.5);
        doc.text(label, x + 4, y + 5.5);

        // Value
        doc.setTextColor(20, 20, 23);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10);
        doc.text(value, x + 4, y + 12);
      };

      currentY += 6;
      const colW = 87;
      const rowH = 16;

      const overallLvlStr = `${baseCEFR} - ${getMastery(baseCEFR).toUpperCase()} PRACTITIONER`;
      drawMetricBox(15, currentY, colW, rowH, "CURRENT CEFR ESTIMATED STANDING", overallLvlStr);
      drawMetricBox(108, currentY, colW, rowH, "ACCUMULATED EXPERIENCE POINTS (XP)", `${xp.toLocaleString()} XP`);

      currentY += 20;
      drawMetricBox(15, currentY, colW, rowH, "GRAMMAR & VOCABULARY PRACTICE DRILLS", `${stats.practiceQuestions} Questions Answered`);
      drawMetricBox(108, currentY, colW, rowH, "COMPREHENSIVE SPEECH & ESSAY CRITIQUES", `${stats.evaluations} AI Audio & Text Evaluations`);

      // Competency scores title
      currentY += 26;
      doc.setTextColor(212, 175, 55);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text("II. CEFR DETAILED COMPETENCY TIER SCORES", 15, currentY);

      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.3);
      doc.line(15, currentY + 2, 195, currentY + 2);

      currentY += 8;
      const barX1 = 15;
      const barX2 = 108;
      const maxBarW = 55;

      const drawSkillBar = (x: number, y: number, name: string, level: string, percent: number, mastery: string) => {
        // Skill Name & Details
        doc.setTextColor(20, 20, 23);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.text(name, x, y);

        // Level text right aligned
        doc.setTextColor(212, 175, 55);
        doc.text(`${level} (${mastery.toUpperCase()})`, x + colW, y, { align: "right" });

        // Progress background
        doc.setFillColor(235, 235, 240);
        doc.roundedRect(x, y + 2.5, maxBarW, 3, 0.4, 0.4, "F");

        // Filled progress colored by mastery level
        const filledW = (percent / 100) * maxBarW;
        if (mastery === "Advanced") {
          doc.setFillColor(212, 175, 55); // Academy Gold
        } else if (mastery === "Intermediate") {
          doc.setFillColor(249, 115, 22); // Orange
        } else {
          doc.setFillColor(99, 102, 241); // Indigo
        }
        doc.roundedRect(x, y + 2.5, filledW, 3, 0.4, 0.4, "F");

        // Percentage label
        doc.setTextColor(110, 115, 125);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`${percent}% Score`, x + maxBarW + 3, y + 4.8);
      };

      // Col 1 Row 1 & Col 2 Row 1
      drawSkillBar(barX1, currentY, skillsData[0].name, skillsData[0].level, skillsData[0].percentage, skillsData[0].mastery);
      drawSkillBar(barX2, currentY, skillsData[3].name, skillsData[3].level, skillsData[3].percentage, skillsData[3].mastery);

      currentY += 15;
      // Col 1 Row 2 & Col 2 Row 2
      drawSkillBar(barX1, currentY, skillsData[1].name, skillsData[1].level, skillsData[1].percentage, skillsData[1].mastery);
      drawSkillBar(barX2, currentY, skillsData[4].name, skillsData[4].level, skillsData[4].percentage, skillsData[4].mastery);

      currentY += 15;
      // Col 1 Row 3 & Col 2 Row 3
      drawSkillBar(barX1, currentY, skillsData[2].name, skillsData[2].level, skillsData[2].percentage, skillsData[2].mastery);
      drawSkillBar(barX2, currentY, skillsData[5].name, skillsData[5].level, skillsData[5].percentage, skillsData[5].mastery);

      // Section 3: Diagnostic study plan recommendations
      currentY += 21;
      doc.setTextColor(212, 175, 55);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text("III. ADAPTIVE ACADEMIC STRATEGY & DIAGNOSTICS", 15, currentY);

      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.3);
      doc.line(15, currentY + 2, 195, currentY + 2);

      currentY += 7;

      const drawAdviseBox = (x: number, y: number, w: number, title: string, borderCol: [number, number, number], descText: string) => {
        doc.setFillColor(248, 249, 250);
        doc.setDrawColor(230, 230, 235);
        doc.roundedRect(x, y, w, 24, 1.2, 1.2, "FD");

        // Vertical highlight bar on left
        doc.setFillColor(borderCol[0], borderCol[1], borderCol[2]);
        doc.rect(x, y, 2.5, 24, "F");

        doc.setTextColor(borderCol[0], borderCol[1], borderCol[2]);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text(title, x + 5, y + 5.5);

        doc.setTextColor(60, 65, 75);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8.2);

        const wrappedLines = doc.splitTextToSize(descText, w - 12);
        doc.text(wrappedLines, x + 5, y + 11);
      };

      const strengthDesc = `Your highest evaluated competence is in ${highestSkill.name} measuring at CEFR level ${highestSkill.level} with a ${highestSkill.percentage}% completion scale. You have demonstrated superb contextual command. To consolidate your advanced fluency, pursue complex reading or speak active dialogue sessions regularly.`;
      const focusDesc = `To optimize overall linguistic cohesion, allocate more learning effort into ${lowestSkill.name} currently standing at CEFR level ${lowestSkill.level} with a ${lowestSkill.percentage}% competency rating. Complete focused practice hub exercises, seek detailed AI writing reviews, and review basic grammar rules daily.`;

      drawAdviseBox(15, currentY, 180, "PEAK CEFR STRENGTH ADVANTAGE", [212, 175, 55], strengthDesc);
      currentY += 27;
      drawAdviseBox(15, currentY, 180, "PRIMARY LINGUISTIC FOCUS & GAP CORRECTION", [249, 115, 22], focusDesc);

      // Footnote details
      doc.setTextColor(140, 145, 155);
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(7.5);
      doc.text("Note: This diagnostic study transcript is generated dynamically based on ongoing evaluation databases and verified milestones.", 15, 275);
      doc.text("FATIMA CEFR SMART LANGUAGE ACADEMY • CONFIDENTIAL LINGUISTIC TRANSCRIPT", 15, 279);
      doc.setFont("Helvetica", "bold");
      doc.text("Page 1 of 1", 195, 279, { align: "right" });

      doc.save(`fatima-academy-cefr-report-${baseCEFR}.pdf`);

      // Toast feedback
      setToastType("goal");
      setToastTitle("📊 CEFR Report Downloaded");
      setToastMessage(`Your official CEFR Skill Mastery report transcript has been compiled and downloaded successfully.`);
      setShowNotificationToast(true);
      setTimeout(() => setShowNotificationToast(false), 5000);

    } catch (err) {
      console.error("PDF download failed:", err);
      setToastType("reminder");
      setToastTitle("⚠️ Report Generation Failed");
      setToastMessage("An error occurred during report preparation. Please refresh and try again.");
      setShowNotificationToast(true);
      setTimeout(() => setShowNotificationToast(false), 5000);
    }
  };


  const handleUpdateHistoryList = (newHistory: string[]) => {
    const todayStr = getLocalDateString();
    
    // Calculate new streaks
    const { currentStreak, bestStreak: calculatedBest } = calculateStreaks(newHistory);
    
    // Update local storage
    localStorage.setItem("lexicon_streak_history", JSON.stringify(newHistory));
    localStorage.setItem("lexicon_streak_count", String(currentStreak));
    localStorage.setItem("lexicon_best_streak", String(calculatedBest));
    
    // Update state
    setHistoryList(newHistory);
    setStreak(currentStreak);
    setBestStreak(calculatedBest);

    // If today is practiced, sync reward claimed state and last date
    const isTodayPracticed = newHistory.includes(todayStr);
    setRewardClaimedToday(isTodayPracticed);
    localStorage.setItem("lexicon_streak_reward_claimed_today", isTodayPracticed ? todayStr : "");
    
    if (isTodayPracticed) {
      localStorage.setItem("lexicon_streak_last_date", todayStr);
      setLastDate(todayStr);
    } else {
      const sorted = [...newHistory].sort();
      const last = sorted[sorted.length - 1] || "";
      localStorage.setItem("lexicon_streak_last_date", last);
      setLastDate(last);
    }
  };

  // Generate last 7 days of calendar for the visual timeline
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = d.getDate();
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const dayStr = String(d.getDate()).padStart(2, "0");
      const formatted = `${year}-${month}-${dayStr}`;

      days.push({
        name: dayName,
        num: dayNum,
        dateStr: formatted,
        isToday: i === 0,
      });
    }
    return days;
  };

  const calendarDays = getLast7Days();

  return (
    <div className="space-y-8 text-[#E0E0E0]" id="dashboard-tab">
      {/* Top Utility Header Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4" id="dashboard-top-utility-bar">
        <div className="text-left space-y-1">
          <h2 className="text-xl font-serif font-black text-white tracking-wide">
            لوحة المتابعة الرئيسية / Main Academy Dashboard
          </h2>
          <p className="text-xs text-[#8E9299]">
            Fatima Academy CEFR Smart Interactive Language System
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Developer Sandbox Mode Toggle */}
          <button
            onClick={() => {
              const newVal = !showSandboxControls;
              setShowSandboxControls(newVal);
              localStorage.setItem("lexicon_show_sandbox", String(newVal));
              // Trigger toast notification
              setToastType("goal");
              setToastTitle(newVal ? "🛠️ Sandbox Active" : "🛡️ Production Mode");
              setToastMessage(newVal ? "Developer simulation tools are now visible." : "Simulation controls are hidden. Real-time data tracking only.");
              setShowNotificationToast(true);
              setTimeout(() => setShowNotificationToast(false), 4000);
            }}
            className={`flex items-center gap-2.5 border-2 px-4 py-2 rounded-xl transition duration-300 shadow-md cursor-pointer text-xs font-black uppercase tracking-wider ${
              showSandboxControls 
                ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                : "bg-[#0F0F12] text-slate-400 border-white/5 hover:border-[#D4AF37]/35 hover:text-[#D4AF37]"
            }`}
            title="تبديل وضع المطور للمحاكاة / Toggle Developer Sandbox Mode"
            id="toggle-sandbox-mode-btn"
          >
            {showSandboxControls ? <Eye className="h-4.5 w-4.5 text-red-400" /> : <EyeOff className="h-4.5 w-4.5 text-slate-500" />}
            <div className="text-left flex flex-col">
              <span className="text-[10px] font-sans font-black text-white">وضع مطور المنصة</span>
              <span className="text-[8px] opacity-70 tracking-widest uppercase">{showSandboxControls ? "Sandbox Active" : "Production Mode"}</span>
            </div>
          </button>

          {/* Download CEFR Report Button */}
          <button
            onClick={handleDownloadPdfReport}
            className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-500/10 via-[#D4AF37]/15 to-indigo-500/5 hover:from-indigo-500/20 hover:via-[#D4AF37]/25 hover:to-indigo-500/10 text-white border-2 border-white/10 hover:border-[#D4AF37] px-4.5 py-2.5 rounded-xl transition duration-300 shadow-lg cursor-pointer text-xs font-black uppercase tracking-wider"
            title="تحميل التقرير الدراسي الشامل"
            id="download-cefr-report-btn"
          >
            <Download className="h-4.5 w-4.5 text-[#D4AF37]" />
            <div className="text-left flex flex-col">
              <span className="text-[10px] font-sans font-black text-white">تقرير المهارات الشامل</span>
              <span className="text-[8px] text-[#8E9299] tracking-widest uppercase">Download CEFR Report</span>
            </div>
          </button>

          {/* User Guide Icon Button - Arabic and English */}
          <button
            onClick={() => setShowUserGuideModal(true)}
            className="relative group flex items-center gap-2.5 bg-gradient-to-r from-amber-500/10 via-[#D4AF37]/15 to-amber-400/5 hover:from-amber-500/20 hover:via-[#D4AF37]/25 hover:to-[#D4AF37]/10 text-[#D4AF37] border-2 border-[#D4AF37]/50 hover:border-[#D4AF37] px-4.5 py-2.5 rounded-xl transition duration-300 shadow-lg shadow-[#D4AF37]/5 cursor-pointer text-xs font-black uppercase tracking-wider animate-pulse"
            title="افتح دليل الاستخدام الشامل للمنصة"
            id="platform-user-guide-btn"
          >
            <BookOpen className="h-4.5 w-4.5 text-[#D4AF37] group-hover:rotate-6 transition duration-200" />
            <div className="text-left flex flex-col">
              <span className="text-[10px] font-sans font-black text-white">دليل الاستخدام الشامل</span>
              <span className="text-[8px] opacity-70 tracking-widest uppercase">Platform User Guide</span>
            </div>
            <HelpCircle className="h-3.5 w-3.5 text-[#D4AF37] opacity-60 animate-bounce" />
          </button>
        </div>
      </div>

      {/* Quick Certificate Portal Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-[#D4AF37]/10 via-[#0F0F12] to-[#141417] border border-[#D4AF37]/25 shadow-lg shadow-[#D4AF37]/5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D4AF37]/15 rounded-lg flex items-center justify-center border border-[#D4AF37]/30 text-[#D4AF37] shrink-0">
            <Award className="h-5.5 w-5.5 animate-pulse text-[#D4AF37]" />
          </div>
          <div className="text-left space-y-0.5">
            <h4 className="text-xs font-serif font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Student Certificate of Appreciation</span>
              <span className="text-[8px] bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 px-1.5 py-0.5 rounded font-mono font-black">NEW</span>
            </h4>
            <p className="text-[10px] text-[#8E9299]">
              إصدار شهادة تقدير مخصصة وموثقة للطالب على إنجازاته اللغوية الفائقة
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCertificateModal(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:brightness-110 text-black font-extrabold px-4 py-2.5 rounded-lg transition duration-200 text-[10px] uppercase tracking-wider shadow-lg shadow-[#D4AF37]/15 cursor-pointer"
        >
          <Award className="h-4 w-4 shrink-0" />
          <span>إصدار شهادة التقدير / Get Certificate</span>
        </button>
      </motion.div>
      {/* Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#141417] to-[#0F0F12] border border-white/10 p-8 text-[#E0E0E0] shadow-2xl md:p-10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-[#D4AF37]/5 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold tracking-widest uppercase border border-[#D4AF37]/20">
              <Sparkles className="h-3.5 w-3.5" /> Fatima Academy & CEFR Standard
            </div>
            <h1 className="text-3xl md:text-4xl font-serif tracking-wide text-white leading-tight">
              Elevate Your English <br />
              <span className="text-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] bg-clip-text text-transparent">Communicative Competence</span>
            </h1>
            <p className="text-[#8E9299] text-xs md:text-sm leading-relaxed">
              Welcome to the CEFR English Academy. Train with an intelligent assessment engine 
              designed around official framework descriptors. Benchmark your reading, writing, speaking, 
              and grammar accurately.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                id="hero-start-test-btn"
                onClick={() => onNavigate("test")}
                className="inline-flex items-center gap-2 bg-[#D4AF37] hover:brightness-110 text-black font-extrabold px-6 py-3 rounded-lg transition duration-200 text-xs shadow-lg shadow-[#D4AF37]/25 uppercase tracking-widest cursor-pointer"
              >
                Take Adaptive Test <ChevronRight className="h-4 w-4" />
              </button>
              <button 
                id="hero-quick-check-btn"
                onClick={() => setShowQuickCheck(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-3 rounded-lg transition duration-200 text-xs shadow-lg shadow-indigo-600/25 uppercase tracking-widest cursor-pointer"
              >
                <Zap className="h-4 w-4 text-amber-400 animate-pulse" />
                <span>Quick Check (5m)</span>
              </button>
              <button 
                id="hero-evaluate-btn"
                onClick={() => onNavigate("evaluator")}
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold px-6 py-3 rounded-lg transition duration-200 text-xs border border-white/10 uppercase tracking-widest cursor-pointer"
              >
                AI Essay & Voice Evaluator
              </button>
              <button 
                id="hero-download-report-btn"
                onClick={handleExportPDF}
                className="inline-flex items-center gap-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] hover:text-[#D4AF37] border border-[#D4AF37]/30 hover:border-[#D4AF37]/50 font-extrabold px-6 py-3 rounded-lg transition duration-200 text-xs uppercase tracking-widest cursor-pointer shadow-lg shadow-[#D4AF37]/5"
                title="Download your full CEFR assessment results report as a professional PDF"
              >
                <Download className="h-4 w-4 text-[#D4AF37]" />
                <span>Download Report</span>
              </button>
              <button 
                id="hero-certificate-btn"
                onClick={() => setShowCertificateModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37]/10 to-[#AA7C11]/15 hover:from-[#D4AF37]/20 hover:to-[#AA7C11]/25 text-[#D4AF37] font-extrabold px-6 py-3 rounded-lg transition duration-200 text-xs border border-[#D4AF37]/35 uppercase tracking-widest cursor-pointer shadow-lg shadow-[#D4AF37]/5"
              >
                <Award className="h-4.5 w-4.5 text-[#D4AF37] animate-pulse" />
                <span>إصدار شهادة تقدير / Issue Certificate</span>
              </button>
              {onReplayIntro && (
                <button 
                  id="hero-replay-intro-btn"
                  onClick={onReplayIntro}
                  className="inline-flex items-center gap-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] font-extrabold px-6 py-3 rounded-lg transition duration-200 text-xs border border-[#D4AF37]/30 uppercase tracking-widest cursor-pointer shadow shadow-[#D4AF37]/5"
                >
                  <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                  <span>عرض المقدمة السنيمائية / Replay Cinematic Intro</span>
                </button>
              )}
              {onToggleFocusMode && (
                <button 
                  id="hero-toggle-focus-mode-btn"
                  onClick={onToggleFocusMode}
                  className={`inline-flex items-center gap-2 font-extrabold px-6 py-3 rounded-lg transition duration-200 text-xs border uppercase tracking-widest cursor-pointer shadow shadow-[#D4AF37]/5 ${
                    isFocusMode 
                      ? "bg-[#D4AF37] text-black border-transparent hover:brightness-110" 
                      : "bg-[#141417] hover:bg-white/5 text-[#E0E0E0] border-white/10"
                  }`}
                >
                  {isFocusMode ? <Target className="h-4 w-4 animate-pulse text-black" /> : <EyeOff className="h-4 w-4 text-[#D4AF37]" />}
                  <span>{isFocusMode ? "خروج من وضع التركيز / Exit Focus Mode" : "وضع التركيز / Focus Mode"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Large Level Badge */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center bg-[#0F0F12]/80 backdrop-blur-md rounded-xl p-6 border border-white/10 self-center w-full md:w-auto min-w-[200px] text-center shadow-xl"
            id="cefr-badge-container"
          >
            <div className="text-[10px] text-[#8E9299] font-bold tracking-widest uppercase mb-1">Estimated Level</div>
            <div className="text-6xl md:text-7xl font-serif font-extrabold text-[#D4AF37] select-none tracking-tighter filter drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              {currentCEFR}
            </div>
            <div className="mt-2 text-xs font-serif font-bold text-white uppercase tracking-wider">{levelInfo.name}</div>
            <div className="text-[10px] text-[#8E9299] uppercase tracking-wider">{levelInfo.band}</div>

            <button
              id="dashboard-share-btn"
              onClick={handleShare}
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] hover:text-[#D4AF37] border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 px-3.5 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition duration-200 cursor-pointer"
              title="Share level and study stats"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share Level</span>
            </button>

            <button
              id="dashboard-export-pdf-btn"
              onClick={handleExportPDF}
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-[#C8C8CC] hover:text-white border border-white/10 hover:border-white/20 px-3.5 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition duration-200 cursor-pointer"
              title="Download CEFR progress and evaluation report as PDF"
            >
              <Download className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span>Download Report</span>
            </button>

            <button
              id="dashboard-certificate-btn"
              onClick={() => setShowCertificateModal(true)}
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#D4AF37]/20 to-[#AA7C11]/25 hover:brightness-110 text-[#D4AF37] border border-[#D4AF37]/35 px-3.5 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition duration-200 cursor-pointer"
              title="View & customize your Certificate of Appreciation"
            >
              <Award className="h-3.5 w-3.5 text-[#D4AF37] animate-bounce" />
              <span>Certificate / شهادة التقدير</span>
            </button>

            <AnimatePresence>
              {shareSuccessMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="w-full text-center text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-1.5 rounded-lg shadow-sm mt-2"
                >
                  {shareSuccessMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Specialized Encouragement & Beginner Pathways for A0 */}
      {currentCEFR === "A0" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#D4AF37]/10 to-[#141417] rounded-xl border-2 border-[#D4AF37]/30 p-6 md:p-8 shadow-2xl space-y-6"
          id="a0-beginner-pathway-banner"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#D4AF37]/20 rounded-lg text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-serif text-white uppercase tracking-wider">
                Your English Journey Starts Here! <span className="text-[#D4AF37]">A0 Starter Milestone</span>
              </h2>
              <p className="text-sm text-[#E0E0E0] leading-relaxed">
                Welcome! Beginning your studies at the <strong>A0 Starter</strong> level is an exciting and wonderful first step. 
                We are fully dedicated to supporting you with high-comfort, low-stress practice tools tailored to build 
                your confidence piece-by-piece. No complex sentences or pressure—just fun, approachable milestones!
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <h3 className="text-xs font-bold text-[#8E9299] uppercase tracking-widest mb-4">
              Your Personalized Beginner-Friendly Pathways:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0F0F12]/60 p-4 rounded-lg border border-white/5 space-y-2 hover:border-[#D4AF37]/20 transition">
                <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
                  Step 1: Practice Hub
                </span>
                <h4 className="text-xs font-serif font-bold text-white uppercase tracking-wider">A0 Basic Vocabulary</h4>
                <p className="text-xs text-[#8E9299] leading-relaxed">
                  Start with zero pressure. Select <strong>A0 Level</strong> on the Practice Hub to practice simple everyday nouns, greetings, and numbers.
                </p>
                <button
                  onClick={() => onNavigate("practice")}
                  className="inline-flex items-center gap-1 text-[10px] text-[#D4AF37] hover:underline font-bold uppercase mt-2 cursor-pointer"
                >
                  Go to Practice Hub <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="bg-[#0F0F12]/60 p-4 rounded-lg border border-white/5 space-y-2 hover:border-[#D4AF37]/20 transition">
                <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
                  Step 2: AI Evaluator
                </span>
                <h4 className="text-xs font-serif font-bold text-white uppercase tracking-wider">Your First Introduction</h4>
                <p className="text-xs text-[#8E9299] leading-relaxed">
                  Practice saying hello! Submit our pre-made <strong>"Simple Greetings & Name"</strong> speaking task to hear correct pronunciations.
                </p>
                <button
                  onClick={() => onNavigate("evaluator")}
                  className="inline-flex items-center gap-1 text-[10px] text-[#D4AF37] hover:underline font-bold uppercase mt-2 cursor-pointer"
                >
                  Try Greeting Task <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="bg-[#0F0F12]/60 p-4 rounded-lg border border-white/5 space-y-2 hover:border-[#D4AF37]/20 transition">
                <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
                  Step 3: Adaptive Test
                </span>
                <h4 className="text-xs font-serif font-bold text-white uppercase tracking-wider">A0 Adaptive Floor</h4>
                <p className="text-xs text-[#8E9299] leading-relaxed">
                  Take the dynamic test starting at the A0 floor to track your steady linguistic development without feeling overwhelmed.
                </p>
                <button
                  onClick={() => onNavigate("test")}
                  className="inline-flex items-center gap-1 text-[10px] text-[#D4AF37] hover:underline font-bold uppercase mt-2 cursor-pointer"
                >
                  Calibrate Level <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Grid of core features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Adaptive Test card */}
        <div 
          id="feature-card-test"
          onClick={() => onNavigate("test")}
          className="group cursor-pointer bg-[#141417] p-5 rounded-xl border border-white/5 hover:border-[#D4AF37]/50 shadow-xl transition duration-300 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition duration-300 border border-[#D4AF37]/20">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-serif text-white uppercase tracking-wider">Adaptive Placement</h3>
            <p className="text-[#8E9299] text-xs leading-relaxed">
              A 20-question responsive evaluation that adjusts item-by-item dynamically. Pinpoints your stabilized CEFR grade in real time.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] uppercase tracking-widest group-hover:translate-x-1 transition duration-300">
            Start Placement Test <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        {/* AI Open-ended evaluator card */}
        <div 
          id="feature-card-evaluator"
          onClick={() => onNavigate("evaluator")}
          className="group cursor-pointer bg-[#141417] p-5 rounded-xl border border-white/5 hover:border-[#D4AF37]/50 shadow-xl transition duration-300 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition duration-300 border border-[#D4AF37]/20">
              <Mic className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-serif text-white uppercase tracking-wider">AI Speaking & Writing</h3>
            <p className="text-[#8E9299] text-xs leading-relaxed">
              Submit essays or transcribe verbal descriptions. Receive weighted grades for Lexicon, Grammar, and Coherence, plus direct feedback.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] uppercase tracking-widest group-hover:translate-x-1 transition duration-300">
            Launch Evaluator <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        {/* Content generator card */}
        <div 
          id="feature-card-practice"
          onClick={() => onNavigate("practice")}
          className="group cursor-pointer bg-[#141417] p-5 rounded-xl border border-white/5 hover:border-[#D4AF37]/50 shadow-xl transition duration-300 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition duration-300 border border-[#D4AF37]/20">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-serif text-white uppercase tracking-wider">Practice Hub</h3>
            <p className="text-[#8E9299] text-xs leading-relaxed">
              Target specific CEFR competencies by generating custom multiple-choice items dynamically for vocabulary, listening, or reading.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] uppercase tracking-widest group-hover:translate-x-1 transition duration-300">
            Open Practice Hub <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        {/* TOEFL iBT Simulator card */}
        <div 
          id="feature-card-toefl"
          onClick={() => onNavigate("toefl")}
          className="group cursor-pointer bg-[#141417] p-5 rounded-xl border border-white/5 hover:border-[#D4AF37]/50 shadow-xl transition duration-300 flex flex-col justify-between border-2 border-[#D4AF37]/10"
        >
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition duration-300 border border-[#D4AF37]/20">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-serif text-white uppercase tracking-wider">TOEFL iBT Simulator</h3>
            <p className="text-[#8E9299] text-xs leading-relaxed">
              Test your academic readiness with Reading passages, Listening lectures, Voice recording Speaking, and Essay Writing sections.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] uppercase tracking-widest group-hover:translate-x-1 transition duration-300">
            Start TOEFL Simulator <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Linguistic Trajectory & Skills Profiler Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="d3-trajectory-and-radar-grid">
        {/* D3 Progression Chart Card */}
        <div className="xl:col-span-2 bg-[#141417] rounded-xl border border-white/5 p-6 shadow-2xl space-y-6 animate-fade-in flex flex-col justify-between" id="d3-trajectory-tracker-card">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/10">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest font-mono">
                  D3 Analytical Engine
                </span>
              </div>
              <h2 className="text-lg font-serif text-white uppercase tracking-wider">
                Linguistic Progression Curve
              </h2>
              <p className="text-xs text-[#8E9299]">
                Track your calibrated CEFR grades and score improvement trajectory over consecutive evaluations.
              </p>
            </div>
            
            {testHistory.length > 0 && (
              <div className="text-xs text-[#D4AF37] font-mono font-bold bg-[#D4AF37]/5 px-3 py-1.5 rounded-lg border border-[#D4AF37]/15 shrink-0">
                Trajectory Rate: {testHistory.length} Record{testHistory.length > 1 ? 's' : ''} Listed
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* D3 SVG chart canvas container */}
            <div className="lg:col-span-2 bg-[#0F0F12] p-5 rounded-xl border border-white/5 min-h-[300px] flex flex-col justify-center">
              <div className="w-full flex-1 flex items-center justify-center">
                <ProgressionChart testHistory={testHistory} />
              </div>
            </div>

            {/* Analytical summary column */}
            <div className="bg-[#0F0F12]/60 p-5 rounded-xl border border-white/5 flex flex-col justify-between space-y-4 text-left">
              <div className="space-y-4">
                <span className="text-[9px] font-mono font-bold text-[#D4AF37] uppercase tracking-widest block">
                  Growth Insights
                </span>
                
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <div className="text-[10px] text-[#8E9299] uppercase font-bold font-mono">Current Calibrated Rank</div>
                    <div className="text-2xl font-serif text-white font-extrabold flex items-baseline gap-1.5">
                      <span>{userLevel || "B1"}</span>
                      <span className="text-xs text-[#D4AF37] font-sans font-medium">Standard</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-[#8E9299] uppercase font-bold font-mono">Completed Diagnostics</div>
                    <div className="text-base text-white font-mono font-bold">
                      {testHistory.length} Evaluation{testHistory.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-[#8E9299] uppercase font-bold font-mono">Latest Assessment Score</div>
                    <div className="text-base text-[#D4AF37] font-mono font-bold">
                      {testHistory[0]?.score ? `${testHistory[0].score} / 20` : "No diagnostic scores yet"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <p className="text-[11px] text-[#8E9299] leading-relaxed font-sans">
                  Your progression trajectory maps diagnostic outcomes directly into standard communicative bands. Use the Adaptive Test to refresh your profile.
                </p>
                
                <button
                  onClick={() => onNavigate("test")}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black font-extrabold px-3 py-2.5 rounded-lg text-[10px] uppercase tracking-widest border border-[#D4AF37]/30 hover:border-transparent transition duration-200 cursor-pointer"
                >
                  <TrendingUp className="h-3.5 w-3.5 animate-pulse" />
                  <span>Begin Calibration Quiz</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Radar Chart Column */}
        <div className="xl:col-span-1 h-full flex flex-col" id="cefr-domains-radar-column">
          <CEFRDomainRadar
            userLevel={userLevel}
            stats={stats}
            testHistory={testHistory}
            evaluationHistory={evaluationHistory}
          />
        </div>
      </div>

      {/* Personalized Next-Step Actionable Insights */}
      <ActionableInsights
        userLevel={userLevel}
        stats={stats}
        testHistory={testHistory}
        evaluationHistory={evaluationHistory}
        onNavigate={onNavigate}
      />

      {/* CEFR Level Milestones & Badges Tracker */}
      <CefrLevelBadges userLevel={userLevel} />

      {/* CEFR Interactive Curriculum Map / خريطة المنهج الأكاديمي التفاعلية */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#141417] via-[#0F0F12] to-[#141417] rounded-xl border border-white/10 p-6 md:p-8 shadow-2xl space-y-6"
        id="cefr-interactive-curriculum-roadmap"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest font-mono">
                Gamified Learning Path
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider">
              خريطة المنهج الدراسي الأكاديمي / CEFR Academic Roadmap
            </h2>
            <p className="text-xs text-[#8E9299]">
              Follow our structured roadmap. Click on any active level milestone to launch practice hubs, audio drills, essay scorers, or simulation exams.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/5 self-start md:self-auto">
            <div className="text-right">
              <div className="text-[10px] text-[#8E9299]">مستوى إنجاز الخريطة</div>
              <div className="text-xs font-bold text-[#D4AF37] font-mono">
                {(() => {
                  const currentVal = (() => {
                    const mapping: Record<CEFRLevel | "A0", number> = { A0: 0, A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
                    return mapping[userLevel || "A0"] ?? 0;
                  })();
                  return `${currentVal} / 6 Milestones`;
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap Connected Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {(() => {
            const levelToVal = (lvl: CEFRLevel | "A0"): number => {
              const mapping: Record<CEFRLevel | "A0", number> = { A0: 0, A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
              return mapping[lvl] ?? 0;
            };

            const getNodeStatus = (nodeCefr: CEFRLevel): "Mastered" | "Current" | "Target" => {
              const currentVal = levelToVal(userLevel || "A0");
              const nodeVal = levelToVal(nodeCefr);
              if (currentVal === 0 && nodeCefr === "A1") {
                return "Current";
              }
              if (nodeVal < currentVal) {
                return "Mastered";
              }
              if (nodeVal === currentVal) {
                return "Current";
              }
              return "Target";
            };

            const roadmapNodes = [
              {
                id: "a1_vocab",
                cefr: "A1" as CEFRLevel,
                title: "Grammar & Basic Lexicon",
                titleAr: "القواعد والمفردات التأسيسية",
                description: "Master foundational syntax, dynamic vocabulary flashcards, and basic conversational expressions.",
                targetTab: "practice" as const,
                preset: { cefrLevel: "A1" as CEFRLevel, activeSubTab: "vocab" as const },
                icon: BookOpen,
                themeColor: "#6366F1",
                badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
                buttonText: "ابدأ درس المفردات / Launch Vocab Hub",
              },
              {
                id: "a2_dialogues",
                cefr: "A2" as CEFRLevel,
                title: "Auditory Exchanges",
                titleAr: "المحادثات والدروس الصوتية التفاعلية",
                description: "Interact with real-world auditory logs, dictation exercises, and custom listening drills.",
                targetTab: "practice" as const,
                preset: { cefrLevel: "A2" as CEFRLevel, activeSubTab: "lessons" as const },
                icon: Mic,
                themeColor: "#3B82F6",
                badgeBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                buttonText: "افتح الدروس الصوتية / Open Audio Logs",
              },
              {
                id: "b1_comprehension",
                cefr: "B1" as CEFRLevel,
                title: "Fluency & AI Mentor Chat",
                titleAr: "الطلاقة والتواصل التفاعلي الذكي",
                description: "Practice real-time adaptive speaking and prompt responses directly with the Language Mentor.",
                targetTab: "practice" as const,
                preset: { cefrLevel: "B1" as CEFRLevel, activeSubTab: "generator" as const },
                icon: Sparkles,
                themeColor: "#F97316",
                badgeBg: "bg-orange-500/10 text-orange-400 border-orange-500/20",
                buttonText: "ابدأ مع المرشد الذكي / Start Mentor Chat",
              },
              {
                id: "b2_writing",
                cefr: "B2" as CEFRLevel,
                title: "Essay Review & Writing",
                titleAr: "الكتابة الإنشائية والتقييم اللغوي",
                description: "Draft structural paragraphs and professional essays, receiving detailed analytical feedback.",
                targetTab: "evaluator" as const,
                preset: { cefrLevel: "B2" as CEFRLevel },
                icon: FileText,
                themeColor: "#EAB308",
                badgeBg: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                buttonText: "ابدأ كتابة المقال / Launch Essay Scorer",
              },
              {
                id: "c1_speaking",
                cefr: "C1" as CEFRLevel,
                title: "High Cognitive Speech Scorer",
                titleAr: "النطق التحليلي والتقييم الصوتي المتقدم",
                description: "Record spoken monologues using your microphone to get instant phonetic evaluations.",
                targetTab: "evaluator" as const,
                preset: { cefrLevel: "C1" as CEFRLevel },
                icon: Mic,
                themeColor: "#A855F7",
                badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                buttonText: "تقييم نطق المحادثة / Start Speech Scorer",
              },
              {
                id: "c2_toefl",
                cefr: "C2" as CEFRLevel,
                title: "TOEFL Simulation Board",
                titleAr: "امتحان محاكاة التوفل الدولي (TOEFL)",
                description: "Put your comprehensive fluency to the ultimate test under real academic exam timers.",
                targetTab: "toefl" as const,
                icon: Trophy,
                themeColor: "#D4AF37",
                badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                buttonText: "ابدأ امتحان التوفل / Begin TOEFL Test",
              }
            ];

            return roadmapNodes.map((node) => {
              const status = getNodeStatus(node.cefr);
              const NodeIcon = node.icon;
              
              // Define styling states
              let cardBorderClass = "border-white/10";
              let cardBgClass = "from-[#0F0F12] to-[#141417]";
              let glowClass = "opacity-0";
              
              if (status === "Mastered") {
                cardBorderClass = "border-emerald-500/30";
                cardBgClass = "from-[#0F1C16] to-[#0F0F12]";
              } else if (status === "Current") {
                cardBorderClass = "border-[#D4AF37]/50";
                cardBgClass = "from-[#1C1A0F] to-[#0F0F12]";
                glowClass = "opacity-100 animate-pulse";
              }

              return (
                <div
                  key={node.id}
                  className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${cardBgClass} border ${cardBorderClass} p-5 flex flex-col justify-between gap-4 transition duration-300 hover:scale-[1.02] hover:border-white/20 shadow-lg`}
                >
                  {/* Decorative glowing background ring for current recommended node */}
                  <div 
                    className={`absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl transition duration-500 ${glowClass}`}
                    style={{ backgroundColor: `${node.themeColor}12` }}
                  />

                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      {/* CEFR Level Tag */}
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-black border uppercase tracking-wider ${node.badgeBg}`}>
                        CEFR {node.cefr}
                      </span>

                      {/* Status Tag */}
                      {status === "Mastered" ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3" /> Mastered / مُتقن
                        </span>
                      ) : status === "Current" ? (
                        <span className="flex items-center gap-1 text-[9px] font-black text-[#D4AF37] uppercase bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full animate-pulse">
                          <Flame className="h-3 w-3" /> Current / الحالي
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-500 uppercase bg-white/5 px-2 py-0.5 rounded-full">
                          Target / مستهدف
                        </span>
                      )}
                    </div>

                    {/* Titles */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-serif font-black text-white leading-tight">
                        {node.title}
                      </h3>
                      <h4 className="text-[11px] font-sans text-[#D4AF37] font-bold" dir="rtl">
                        {node.titleAr}
                      </h4>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-[#8E9299] leading-relaxed">
                      {node.description}
                    </p>
                  </div>

                  {/* Navigation Action Button */}
                  <button
                    onClick={() => onNavigate(node.targetTab, "preset" in node ? node.preset : undefined)}
                    className={`w-full inline-flex items-center justify-center gap-1.5 font-extrabold px-3 py-2 rounded-lg text-[10px] uppercase tracking-wider transition duration-200 cursor-pointer border ${
                      status === "Mastered"
                        ? "bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40"
                        : status === "Current"
                        ? "bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black border-[#D4AF37]/45 hover:border-transparent font-black shadow-lg shadow-[#D4AF37]/5"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/5 hover:border-white/20"
                    }`}
                  >
                    <NodeIcon className="h-3.5 w-3.5" />
                    <span>{node.buttonText}</span>
                  </button>
                </div>
              );
            });
          })()}
        </div>
      </motion.div>

      {/* AI Personalized Recommendation Engine Panel */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#141417] to-[#0F0F12] rounded-xl border border-white/10 p-6 md:p-8 shadow-2xl space-y-6"
        id="ai-personalized-recommendation-panel"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest font-mono">
                AI Diagnostic Study Plan
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider">
              Recommended Training Modules
            </h2>
            <p className="text-xs text-[#8E9299] max-w-2xl leading-relaxed">
              {recommendationData.analysisSummary}
            </p>
          </div>
          
          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="text-xs text-[#8E9299]">Current Level:</span>
            <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold px-3 py-1 rounded-full border border-[#D4AF37]/20">
              {currentCEFR} (English)
            </span>
          </div>
        </div>

        {/* Recommendations list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendationData.recommendations.map((rec) => (
            <div
              key={rec.id}
              className="group bg-black/30 hover:bg-black/50 p-5 rounded-lg border border-white/5 hover:border-[#D4AF37]/30 transition duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white border border-white/10">
                    <Sparkles className="h-3 w-3 text-[#D4AF37]" /> {rec.skillType}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-[#8E9299] font-mono">
                    <span>{rec.difficulty}</span>
                    <span>•</span>
                    <span>{rec.timeEstimate}</span>
                  </div>
                </div>
                
                <h3 className="text-base font-serif text-white group-hover:text-[#D4AF37] transition duration-300 uppercase tracking-wide">
                  {rec.title}
                </h3>
                <p className="text-xs text-[#8E9299] leading-relaxed">
                  {rec.description}
                </p>
              </div>

              <button
                onClick={() =>
                  onNavigate("practice", {
                    cefrLevel: currentCEFR,
                    skillType: rec.skillType,
                    activeSubTab: rec.targetTab,
                  })
                }
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#D4AF37]/10 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black rounded-lg border border-[#D4AF37]/30 hover:border-transparent transition duration-300 cursor-pointer"
              >
                {rec.actionLabel} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {!recommendationData.hasData && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/10 text-xs">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-white uppercase tracking-wide">
                  Diagnose Your Strengths & Weaknesses
                </p>
                <p className="text-[#8E9299] leading-relaxed">
                  Take the adaptive level placement test to record mistakes. This trains our diagnostic model to identify exact CEFR target competencies.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("test")}
              className="shrink-0 text-[10px] font-bold uppercase tracking-widest bg-white text-black px-4 py-2 rounded-md hover:bg-[#D4AF37] transition duration-200 cursor-pointer"
            >
              Begin Placement Test
            </button>
          </div>
        )}
      </motion.div>

      {/* Daily Consistency, Streaks, & Study Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Daily Consistency & Streak Rewards Panel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#141417] to-[#0F0F12] rounded-xl border border-white/10 p-6 md:p-8 shadow-2xl space-y-6 flex flex-col justify-between"
          id="consistency-streak-tracker-panel"
        >
          {/* Floating XP Animation Celebration */}
          <AnimatePresence>
            {showXpAnim && (
              <motion.div
                initial={{ scale: 0.6, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: -20 }}
                exit={{ scale: 0.8, opacity: 0, y: -50 }}
                className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 rounded-xl"
              >
                <motion.div 
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="bg-[#D4AF37]/15 p-4 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] mb-3"
                >
                  <Trophy className="h-12 w-12 filter drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]" />
                </motion.div>
                <h3 className="text-xl font-serif text-white uppercase tracking-wider">Streak Continued!</h3>
                <p className="text-sm text-[#8E9299] mt-1">Consistency XP Reward Unlocked</p>
                <div className="text-4xl font-extrabold text-[#D4AF37] mt-2 font-mono flex items-center gap-1.5">
                  <Zap className="h-8 w-8 fill-[#D4AF37] stroke-none animate-bounce" /> +{xpGained} XP
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-[#FF4500]/10 rounded-lg text-[#FF4500] border border-[#FF4500]/20 shrink-0">
                  <Flame className="h-6 w-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#8E9299] tracking-widest uppercase">Consistency Tracker</span>
                  <h3 className="text-base font-serif text-white uppercase tracking-wider">Daily Study Streaks</h3>
                  <p className="text-xs text-[#8E9299] leading-relaxed">
                    Earn bonus XP and track consistent learning!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-[#0F0F12] border border-white/5 rounded-lg px-3 py-1.5 text-center min-w-[70px]">
                  <div className="text-xl font-serif font-extrabold text-[#FF4500] tracking-tight">{streak}</div>
                  <div className="text-[8px] text-[#8E9299] font-bold uppercase tracking-widest">Streak</div>
                </div>
                <div className="bg-[#0F0F12] border border-white/5 rounded-lg px-3 py-1.5 text-center min-w-[70px]">
                  <div className="text-xl font-serif font-extrabold text-white tracking-tight">{bestStreak}</div>
                  <div className="text-[8px] text-[#8E9299] font-bold uppercase tracking-widest">Best</div>
                </div>
                <div className="bg-[#0F0F12] border border-[#D4AF37]/20 rounded-lg px-3 py-1.5 text-center min-w-[80px] bg-[#D4AF37]/5">
                  <div className="text-xl font-mono font-extrabold text-[#D4AF37] tracking-tight flex items-center justify-center gap-0.5">
                    <Zap className="h-4 w-4 fill-[#D4AF37] stroke-none shrink-0" /> {xp}
                  </div>
                  <div className="text-[8px] text-[#D4AF37] font-bold uppercase tracking-widest">XP</div>
                </div>
              </div>
            </div>

            {/* 7-Day Timeline */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-[#8E9299] uppercase tracking-widest">
                Last 7 Days Practice:
              </h4>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {calendarDays.map((day) => {
                  const practiced = historyList.includes(day.dateStr);
                  return (
                    <div 
                      key={day.dateStr} 
                      className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border w-11 select-none shrink-0 ${
                        day.isToday 
                          ? "bg-[#D4AF37]/5 border-[#D4AF37]/30 text-white" 
                          : "bg-[#0F0F12] border-white/5 text-[#8E9299]"
                      }`}
                    >
                      <span className="text-[8px] uppercase font-bold tracking-wider">{day.name}</span>
                      <div 
                        className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                          practiced 
                            ? "bg-gradient-to-br from-[#FF4500] to-[#FF8C00] text-white shadow-md shadow-[#FF4500]/25 ring-1 ring-[#FF4500]/20" 
                            : "bg-white/5 text-slate-600 border border-white/5"
                        }`}
                      >
                        {practiced ? (
                          <Flame className="h-3.5 w-3.5 text-white" />
                        ) : (
                          <span className="text-[10px] font-bold">{day.num}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-center sm:text-right shrink-0">
            {rewardClaimedToday ? (
              <div className="inline-flex flex-col items-center sm:items-end">
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 font-extrabold px-4 py-2.5 rounded-lg text-[10px] uppercase tracking-widest"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Streak Continued Today
                </button>
              </div>
            ) : (
              <div className="inline-flex flex-col items-center sm:items-end">
                <button
                  type="button"
                  onClick={handleManualCheckIn}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#FF4500] to-[#FF8C00] hover:brightness-110 text-white font-extrabold px-4 py-2.5 rounded-lg transition duration-200 text-[10px] shadow-lg shadow-[#FF4500]/20 uppercase tracking-widest cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5 fill-white stroke-none animate-bounce" /> Claim Daily Streak (+50 XP)
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Daily Study Goal Panel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#141417] to-[#0F0F12] rounded-xl border border-white/10 p-6 md:p-8 shadow-2xl space-y-6 flex flex-col justify-between"
          id="daily-study-goal-panel"
        >
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37] border border-[#D4AF37]/20 shrink-0">
                  <Award className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <div className="space-y-1 max-w-[220px]">
                  <span className="text-[9px] font-bold text-[#8E9299] tracking-widest uppercase">Target & Progress</span>
                  <h3 className="text-base font-serif text-white uppercase tracking-wider">Daily Study Goal</h3>
                  <p className="text-xs text-[#8E9299] leading-relaxed">
                    Set a daily target. Earn a massive <strong className="text-[#D4AF37] font-mono">+100 XP</strong> when reached!
                  </p>
                </div>
              </div>

              {/* Circular Progress Indicator */}
              <div className="flex items-center justify-center shrink-0 self-center sm:self-auto" id="daily-goal-circular-progress">
                <div className="relative h-20 w-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                    {/* Background Track Circle 1 */}
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      className="stroke-[#0F0F12] fill-none"
                      strokeWidth="6.5"
                    />
                    {/* Background Track Circle 2 */}
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      className="stroke-white/5 fill-none"
                      strokeWidth="6"
                    />
                    {/* Glowing outer drop-shadow backing */}
                    {completedToday > 0 && (
                      <motion.circle
                        cx="40"
                        cy="40"
                        r="32"
                        className="stroke-[#D4AF37]/30 fill-none blur-[1px]"
                        strokeWidth="7"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: 2 * Math.PI * 32, strokeDashoffset: 2 * Math.PI * 32 }}
                        animate={{ strokeDashoffset: (2 * Math.PI * 32) * (1 - Math.min(100, Math.round((completedToday / dailyTarget) * 100)) / 100) }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    )}
                    {/* Active Progress Path */}
                    <motion.circle
                      cx="40"
                      cy="40"
                      r="32"
                      className="stroke-[#D4AF37] fill-none"
                      strokeWidth="6"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: 2 * Math.PI * 32, strokeDashoffset: 2 * Math.PI * 32 }}
                      animate={{ strokeDashoffset: (2 * Math.PI * 32) * (1 - Math.min(100, Math.round((completedToday / dailyTarget) * 100)) / 100) }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </svg>
                  
                  {/* Central Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-bold font-mono text-white leading-none">
                      {Math.min(100, Math.round((completedToday / dailyTarget) * 100))}%
                    </span>
                    <span className="text-[7px] text-[#8E9299] font-bold uppercase tracking-widest mt-0.5">
                      {completedToday}/{dailyTarget}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 8:00 PM Daily Goal Alert Banner */}
            {(new Date().getHours() >= 20 || simulateLateHour) && completedToday < dailyTarget && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/25 rounded-xl p-3.5 flex items-start gap-3 text-left"
                id="daily-goal-late-reminder-banner"
              >
                <div className="p-1.5 bg-red-500/20 text-red-400 rounded-lg shrink-0">
                  <AlertCircle className="h-4 w-4 animate-bounce" />
                </div>
                <div className="text-xs space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-black text-red-400 uppercase tracking-wider text-[10px]">
                      ⏰ تنبيه الساعة 8:00 مساءً / 8:00 PM ALERT
                    </span>
                    <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                      LATE EVENING
                    </span>
                  </div>
                  <p className="text-slate-200 text-[11px] leading-relaxed text-right" dir="rtl">
                    لم تحقق هدفك اليومي للمذاكرة بعد! يرجى إكمال <strong className="text-white font-mono">{dailyTarget - completedToday}</strong> من التمارين أو التقييمات لتأمين متتاليتك اليومية وحصد جائزة الـ XP قبل منتصف اليوم.
                  </p>
                  <p className="text-[#8E9299] text-[11px] leading-relaxed">
                    You haven't completed your daily learning target yet! Complete <strong className="text-white font-mono">{dailyTarget - completedToday}</strong> more study items to protect your active streak and secure your XP bonus before the day ends.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Linear Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-serif font-bold">
                <span className="text-[#8E9299] uppercase tracking-wider">Today's Progress</span>
                <span className="text-white">
                  {completedToday} / {dailyTarget} completed
                </span>
              </div>
              
              <div className="h-3.5 bg-[#0F0F12] rounded-full overflow-hidden border border-white/5 p-[2px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.round((completedToday / dailyTarget) * 100))}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] rounded-full min-w-[4px]"
                />
              </div>

              <div className="flex justify-between text-[10px] uppercase font-bold text-[#8E9299] tracking-widest pt-1">
                <span>{Math.min(100, Math.round((completedToday / dailyTarget) * 100))}% Completed</span>
                {completedToday >= dailyTarget ? (
                  <span className="text-[#D4AF37] flex items-center gap-1 font-extrabold animate-pulse">
                    <Sparkles className="h-3 w-3" /> Goal Reached!
                  </span>
                ) : (
                  <span>{Math.max(0, dailyTarget - completedToday)} more to reach target</span>
                )}
              </div>
            </div>

            {/* Set Goal Presets */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-[#8E9299] uppercase tracking-widest">
                Choose Daily Target:
              </h4>
              <div className="grid grid-cols-5 gap-2" id="daily-target-presets">
                {[2, 3, 5, 10, 15].map((preset) => {
                  const isSelected = dailyTarget === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSetDailyTarget(preset)}
                      className={`py-2 px-1 rounded-lg border text-center transition cursor-pointer font-mono ${
                        isSelected 
                          ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37] font-extrabold ring-1 ring-[#D4AF37]/30" 
                          : "bg-[#0F0F12] border-white/5 text-[#8E9299] hover:border-white/10 hover:text-white"
                      }`}
                    >
                      <div className="text-xs">{preset}</div>
                      <div className="text-[7px] uppercase tracking-tighter mt-0.5 opacity-80">Items</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Simulate Action Row - Only shown when Developer Sandbox Mode is active */}
          {showSandboxControls && (
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left shrink-0">
              <div className="text-[10px] text-[#8E9299] max-w-[200px] leading-snug">
                Complete practice hub items or speak evaluator tasks to increase progress automatically.
              </div>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSimulateLateHour(prev => !prev)}
                  className={`inline-flex items-center justify-center gap-1.5 font-bold px-3.5 py-2.5 rounded-lg transition duration-200 text-[10px] uppercase tracking-widest cursor-pointer border ${
                    simulateLateHour 
                      ? "bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-500/35" 
                      : "bg-white/5 hover:bg-white/10 text-[#8E9299] hover:text-white border-white/10"
                  }`}
                  id="toggle-late-hour-simulation-btn"
                >
                  <Clock className="h-3.5 w-3.5 text-[#D4AF37]" /> {simulateLateHour ? "Simulating Past 8 PM" : "Simulate Past 8 PM"}
                </button>

                <button
                  type="button"
                  onClick={handleSimulateCompletion}
                  className="inline-flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold px-4 py-2.5 rounded-lg transition duration-200 text-[10px] uppercase tracking-widest cursor-pointer hover:border-white/20 shrink-0"
                  id="simulate-practice-item-btn"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> Simulate 1 Practice (+1)
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Weekly Study Goal Panel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#141417] to-[#0F0F12] rounded-xl border border-white/10 p-6 md:p-8 shadow-2xl space-y-6 flex flex-col justify-between"
          id="weekly-study-goal-panel"
        >
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37] border border-[#D4AF37]/20 shrink-0">
                  <Target className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <div className="space-y-1 max-w-[220px]">
                  <span className="text-[9px] font-bold text-[#8E9299] tracking-widest uppercase">Target & Progress</span>
                  <h3 className="text-base font-serif text-white uppercase tracking-wider">Weekly Study Goal</h3>
                  <p className="text-xs text-[#8E9299] leading-relaxed">
                    Set a weekly target. Earn an extra <strong className="text-[#D4AF37] font-mono">+200 XP</strong> when achieved!
                  </p>
                </div>
              </div>

              {/* Circular Progress Indicator */}
              <div className="flex items-center justify-center shrink-0 self-center sm:self-auto" id="weekly-goal-circular-progress">
                <div className="relative h-20 w-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      className="stroke-[#0F0F12] fill-none"
                      strokeWidth="6.5"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      className="stroke-white/5 fill-none"
                      strokeWidth="6"
                    />
                    {currentWeeklyProgressValue > 0 && (
                      <motion.circle
                        cx="40"
                        cy="40"
                        r="32"
                        className="stroke-[#D4AF37]/30 fill-none blur-[1px]"
                        strokeWidth="7"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: 2 * Math.PI * 32, strokeDashoffset: 2 * Math.PI * 32 }}
                        animate={{ strokeDashoffset: (2 * Math.PI * 32) * (1 - weeklyProgressPercentage / 100) }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    )}
                    <motion.circle
                      cx="40"
                      cy="40"
                      r="32"
                      className="stroke-[#D4AF37] fill-none"
                      strokeWidth="6"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: 2 * Math.PI * 32, strokeDashoffset: 2 * Math.PI * 32 }}
                      animate={{ strokeDashoffset: (2 * Math.PI * 32) * (1 - weeklyProgressPercentage / 100) }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </svg>
                  
                  {/* Central Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-bold font-mono text-white leading-none">
                      {weeklyProgressPercentage}%
                    </span>
                    <span className="text-[7px] text-[#8E9299] font-bold uppercase tracking-widest mt-0.5 font-mono">
                      {currentWeeklyProgressValue}/{weeklyGoalTarget}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Goal Type Toggler */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-[#8E9299] uppercase tracking-widest">
                Goal Category:
              </h4>
              <div className="grid grid-cols-2 gap-2 bg-[#0F0F12] p-1 rounded-lg border border-white/5">
                <button
                  type="button"
                  onClick={() => handleSetWeeklyGoalType("evaluations")}
                  className={`py-1.5 px-2 rounded-md text-center text-xs font-bold transition cursor-pointer ${
                    weeklyGoalType === "evaluations"
                      ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20"
                      : "text-[#8E9299] hover:text-white"
                  }`}
                >
                  AI Evaluations
                </button>
                <button
                  type="button"
                  onClick={() => handleSetWeeklyGoalType("hours")}
                  className={`py-1.5 px-2 rounded-md text-center text-xs font-bold transition cursor-pointer ${
                    weeklyGoalType === "hours"
                      ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20"
                      : "text-[#8E9299] hover:text-white"
                  }`}
                >
                  Practice Hours
                </button>
              </div>
            </div>

            {/* Linear Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-serif font-bold">
                <span className="text-[#8E9299] uppercase tracking-wider">Weekly Progress</span>
                <span className="text-white">
                  {currentWeeklyProgressValue} / {weeklyGoalTarget} {weeklyGoalType === "evaluations" ? "evaluations" : "hours"}
                </span>
              </div>
              
              <div className="h-3.5 bg-[#0F0F12] rounded-full overflow-hidden border border-white/5 p-[2px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyProgressPercentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] rounded-full min-w-[4px]"
                />
              </div>

              <div className="flex justify-between text-[10px] uppercase font-bold text-[#8E9299] tracking-widest pt-1">
                <span>{weeklyProgressPercentage}% Completed</span>
                {currentWeeklyProgressValue >= weeklyGoalTarget ? (
                  <span className="text-[#D4AF37] flex items-center gap-1 font-extrabold animate-pulse">
                    <Sparkles className="h-3 w-3" /> Goal Reached!
                  </span>
                ) : (
                  <span>
                    {weeklyGoalType === "evaluations"
                      ? `${Math.max(0, weeklyGoalTarget - weeklyProgressEvals)} more evals needed`
                      : `${Math.max(0, parseFloat((weeklyGoalTarget - weeklyProgressHours).toFixed(1)))} hrs more needed`
                    }
                  </span>
                )}
              </div>
            </div>

            {/* Set Goal Presets */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-[#8E9299] uppercase tracking-widest">
                Choose Target ({weeklyGoalType === "evaluations" ? "Evals" : "Hours"}):
              </h4>
              <div className="grid grid-cols-5 gap-2" id="weekly-target-presets">
                {(weeklyGoalType === "evaluations" ? [2, 3, 5, 8, 12] : [1.0, 2.0, 3.0, 5.0, 10.0]).map((preset) => {
                  const isSelected = weeklyGoalTarget === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSetWeeklyGoalTarget(preset)}
                      className={`py-2 px-1 rounded-lg border text-center transition cursor-pointer font-mono ${
                        isSelected 
                          ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37] font-extrabold ring-1 ring-[#D4AF37]/30" 
                          : "bg-[#0F0F12] border-white/5 text-[#8E9299] hover:border-white/10 hover:text-white"
                      }`}
                    >
                      <div className="text-xs">{preset}</div>
                      <div className="text-[7px] uppercase tracking-tighter mt-0.5 opacity-80">
                        {weeklyGoalType === "evaluations" ? "Evals" : "Hrs"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Log / Simulation Action Row - Only shown when Developer Sandbox Mode is active */}
          {showSandboxControls && (
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left shrink-0">
              <div className="text-[10px] text-[#8E9299] max-w-[200px] leading-snug">
                Automatically updates on practice/evaluation. Use buttons to simulate extra efforts.
              </div>
              
              <button
                type="button"
                onClick={weeklyGoalType === "evaluations" ? handleLogWeeklyEval : () => handleLogWeeklyPracticeHours(0.5)}
                className="inline-flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold px-4 py-2.5 rounded-lg transition duration-200 text-[10px] uppercase tracking-widest cursor-pointer hover:border-white/20 shrink-0"
                id="simulate-weekly-goal-btn"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
                {weeklyGoalType === "evaluations" ? "Simulate Evaluation (+1)" : "Log 0.5 Hrs Practice (+0.5)"}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Dynamic Skill Mastery & CEFR Competencies Profile Card */}
      <SkillMastery
        userLevel={userLevel}
        stats={stats}
        testHistory={testHistory}
        evaluationHistory={evaluationHistory}
        onNavigate={onNavigate}
      />

      {/* Dynamic Academic Achievements & Badges Grid */}
      <Achievements
        userLevel={userLevel}
        stats={stats}
        testHistory={testHistory}
        evaluationHistory={evaluationHistory}
      />

      {/* Global Community Leaderboard & Active Learners ranking */}
      <CommunityLeaderboard
        userXp={xp}
        userLevel={userLevel}
      />

      {/* Interactive Visual Calendar & Streak Milestones */}
      <StreakCalendar
        userLevel={userLevel}
        historyList={historyList}
        streak={streak}
        bestStreak={bestStreak}
        onUpdateHistoryList={handleUpdateHistoryList}
        onNavigate={onNavigate}
      />

      {/* Daily Practice Reminders Scheduler */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-[#141417] to-[#0F0F12] rounded-xl border border-white/10 p-6 md:p-8 shadow-2xl space-y-6"
        id="daily-practice-reminders-panel"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-lg border shrink-0 ${remindersEnabled ? "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20 animate-pulse" : "bg-white/5 text-[#8E9299] border-white/5"}`}>
              {remindersEnabled ? <Bell className="h-6 w-6" /> : <BellOff className="h-6 w-6" />}
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-[#8E9299] tracking-widest uppercase">Adaptive Study Planner</span>
              <h3 className="text-base font-serif text-white uppercase tracking-wider">Daily Practice Reminders</h3>
              <p className="text-xs text-[#8E9299] leading-relaxed">
                Schedule a daily alarm to receive high-impact study reminders in your browser or app.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="text-xs text-[#8E9299] font-medium">Daily Reminders</span>
            <button
              type="button"
              onClick={() => handleToggleReminders(!remindersEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                remindersEnabled ? "bg-[#D4AF37]" : "bg-white/10"
              }`}
              id="reminder-toggle-btn"
              title="Toggle daily reminder notifications"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                  remindersEnabled ? "translate-x-5 bg-white" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Settings Column */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Preferred Time Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#8E9299] uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#D4AF37]" /> Reminder Time
                </label>
                <input
                  type="time"
                  disabled={!remindersEnabled}
                  value={reminderTime}
                  onChange={(e) => handleUpdateReminderTime(e.target.value)}
                  className={`w-full bg-[#0F0F12] border border-white/5 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none transition-all ${
                    !remindersEnabled ? "opacity-40 cursor-not-allowed" : "focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] hover:border-white/10"
                  }`}
                  id="reminder-time-input"
                  title="Select reminder time"
                />
              </div>

              {/* Study Topic Focus Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#8E9299] uppercase tracking-widest flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-[#D4AF37]" /> Practice Focus
                </label>
                <select
                  disabled={!remindersEnabled}
                  value={reminderTopic}
                  onChange={(e) => handleUpdateReminderTopic(e.target.value)}
                  className={`w-full bg-[#0F0F12] border border-white/5 rounded-lg p-2.5 text-xs text-white focus:outline-none transition-all appearance-none cursor-pointer ${
                    !remindersEnabled ? "opacity-40 cursor-not-allowed" : "focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] hover:border-white/10"
                  }`}
                  id="reminder-topic-select"
                  title="Select preferred study focus"
                >
                  <option value="General CEFR Practice">General CEFR Practice</option>
                  <option value="Vocabulary Study (Flashcards)">Vocabulary Study (Flashcards)</option>
                  <option value="AI Speaking & Dialogue">AI Speaking & Dialogue</option>
                  <option value="AI Essay Writing Evaluation">AI Essay Writing Evaluation</option>
                  <option value="Adaptive Listening Quizzes">Adaptive Listening Quizzes</option>
                </select>
              </div>
            </div>

            {/* Notification Permission Status Panel */}
            <div className="p-3 bg-black/30 rounded-lg border border-white/5 text-xs flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[9px] text-[#8E9299] font-bold uppercase tracking-widest">System Status</span>
                <div className="text-[#E0E0E0] font-medium flex items-center gap-1.5">
                  {notificationPermission === "granted" && (
                    <>
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span>System Notifications Allowed</span>
                    </>
                  )}
                  {notificationPermission === "denied" && (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <span>System Notifications Blocked</span>
                    </>
                  )}
                  {notificationPermission === "default" && (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-400 animate-pulse" />
                      <span>Permission Requested on Toggle</span>
                    </>
                  )}
                  {notificationPermission === "unsupported" && (
                    <>
                      <AlertCircle className="h-4 w-4 text-slate-400" />
                      <span>System Push Unsupported (In-App Only)</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Button to grant or reset */}
              {remindersEnabled && (notificationPermission === "default" || notificationPermission === "denied") && (
                <button
                  type="button"
                  onClick={requestNotificationPermission}
                  className="px-3 py-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 text-[#D4AF37] rounded-md font-bold text-[9px] uppercase tracking-wider transition cursor-pointer shrink-0"
                >
                  Authorize Push
                </button>
              )}
            </div>
          </div>

          {/* Interactive Actions & Informational Row */}
          <div className="bg-[#0F0F12]/60 rounded-xl p-5 border border-white/5 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> Cognitive Habit Building
              </h4>
              <p className="text-xs text-[#8E9299] leading-relaxed">
                Studying English structured around CEFR competencies at the same time each day builds memory pathways, improving long-term language retrieval by up to <strong>150%</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
              <div className="text-[9px] text-[#8E9299] leading-snug">
                {remindersEnabled ? (
                  <>
                    Next alert scheduled for <strong className="text-white font-mono">{formatTimeDisplay(reminderTime)}</strong> daily.
                  </>
                ) : (
                  "Reminders are currently idle. Enable them to build your study habit!"
                )}
              </div>

              <button
                type="button"
                onClick={() => triggerReminderNotification(true)}
                className="inline-flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-[#C8C8CC] hover:text-white border border-white/10 font-bold px-4 py-2 rounded-lg transition duration-200 text-[10px] uppercase tracking-widest cursor-pointer hover:border-white/20 shrink-0"
                id="test-reminder-notification-btn"
                title="Send a sample reminder notification instantly to verify setup"
              >
                Test Notification
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Two Columns: CEFR Explorer and Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CEFR Level Explorer */}
        <div className="lg:col-span-7 bg-[#141417] rounded-xl border border-white/5 p-6 space-y-4 shadow-2xl">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <Award className="h-5.5 w-5.5 text-[#D4AF37]" />
            <div>
              <h3 className="text-base font-serif text-white uppercase tracking-wider">Your CEFR Proficiency Profile</h3>
              <p className="text-[#8E9299] text-xs">Functional descriptors for estimated level: <strong className="text-[#D4AF37]">{currentCEFR}</strong></p>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/5">
            <span className="inline-block text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded border border-[#D4AF37]/20 uppercase tracking-widest mb-2">
              Level Descriptors ({currentCEFR})
            </span>
            <p className="text-xs text-[#E0E0E0] leading-relaxed font-serif italic">
              "{levelInfo.desc}"
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#8E9299] uppercase tracking-wider">Functional "Can-Do" Guidelines</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2 bg-[#D4AF37]/5 p-3.5 rounded-lg border border-[#D4AF37]/10">
                <CheckCircle className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <div className="font-serif font-bold text-white uppercase tracking-wider text-[11px]">Receptive Skills</div>
                  <div className="text-[#8E9299] text-[11px] mt-1 leading-relaxed">
                    {currentCEFR === "A0" && "Can recognize single letters, numbers, greetings, and extremely basic everyday words."}
                    {currentCEFR !== "A0" && currentCEFR.startsWith("A") && "Can identify keywords in slow speech, locate simple facts in notices."}
                    {currentCEFR.startsWith("B") && "Can read technical articles in their field, follow straightforward talks and arguments."}
                    {currentCEFR.startsWith("C") && "Can understand complex literary and scientific texts, follow unstructured lectures easily."}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-[#D4AF37]/5 p-3.5 rounded-lg border border-[#D4AF37]/10">
                <CheckCircle className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <div className="font-serif font-bold text-white uppercase tracking-wider text-[11px]">Productive Skills</div>
                  <div className="text-[#8E9299] text-[11px] mt-1 leading-relaxed">
                    {currentCEFR === "A0" && "Can introduce themselves simply, spell basic personal details, and say hello/goodbye."}
                    {currentCEFR !== "A0" && currentCEFR.startsWith("A") && "Can write simple compound descriptions, state personal details."}
                    {currentCEFR.startsWith("B") && "Can write cohesive paragraphs explaining points of view, speak in detail."}
                    {currentCEFR.startsWith("C") && "Can formulate high-level complex arguments, speak fluidly with idiomatic nuances."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics & History */}
        <div className="lg:col-span-5 bg-[#141417] rounded-xl border border-white/5 p-6 space-y-6 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5.5 w-5.5 text-[#D4AF37]" />
                <h3 className="text-base font-serif text-white uppercase tracking-wider">Performance Metrics</h3>
              </div>
            </div>

            {/* Quick stats grid with Framer Motion Staggered Animations */}
            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                }}
                className="bg-[#0F0F12] rounded-lg p-4 border border-white/5 text-center"
              >
                <div className="text-2xl font-serif text-white">{stats.testsTaken}</div>
                <div className="text-[9px] text-[#8E9299] font-bold uppercase tracking-widest mt-0.5">Tests Completed</div>
              </motion.div>

              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                }}
                className="bg-[#0F0F12] rounded-lg p-4 border border-white/5 text-center"
              >
                <div className="text-2xl font-serif text-white">{stats.evaluations}</div>
                <div className="text-[9px] text-[#8E9299] font-bold uppercase tracking-widest mt-0.5">AI Evaluations</div>
              </motion.div>

              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                }}
                className="bg-[#0F0F12] rounded-lg p-4 border border-white/5 text-center"
              >
                <div className="text-2xl font-serif text-white">{stats.practiceQuestions}</div>
                <div className="text-[9px] text-[#8E9299] font-bold uppercase tracking-widest mt-0.5">Practice Items</div>
              </motion.div>

              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                }}
                className="bg-[#0F0F12] rounded-lg p-4 border border-white/5 text-center"
              >
                <div className="text-2xl font-serif text-[#D4AF37]">{stats.accuracy}%</div>
                <div className="text-[9px] text-[#8E9299] font-bold uppercase tracking-widest mt-0.5">Quiz Accuracy</div>
              </motion.div>
            </motion.div>
          </div>

          {/* Test History list */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#8E9299] uppercase tracking-widest">Placement History</h4>
              {testHistory.length > 0 && (
                <button
                  onClick={handleExportCSV}
                  className="text-[10px] text-[#D4AF37] hover:text-[#D4AF37]/80 bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-2 py-0.5 rounded transition flex items-center gap-1.5 font-bold uppercase tracking-wider cursor-pointer"
                  title="Export your assessment records to CSV"
                  id="export-test-history-csv-btn"
                >
                  <Download className="h-3 w-3" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>
            {testHistory.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#8E9299] bg-[#0F0F12] rounded-lg border border-dashed border-white/10">
                No placement test history yet. Complete a test to plot your progression!
              </div>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {testHistory.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2.5 bg-[#0F0F12] rounded-lg border border-white/5">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-[#8E9299]" />
                      <span className="text-[#E0E0E0] font-medium">{h.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#8E9299]">Score: {h.score}/20</span>
                      <span className="font-serif font-extrabold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded border border-[#D4AF37]/20 text-[11px] uppercase">{h.stabilizedLevel}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* D3 Progression Chart Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-[#141417] rounded-xl border border-white/5 p-6 space-y-4 shadow-2xl mt-8"
        id="cefr-progression-timeline-card"
      >
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <TrendingUp className="h-5.5 w-5.5 text-[#D4AF37]" />
          <div>
            <h3 className="text-base font-serif text-white uppercase tracking-wider">CEFR Proficiency Progression</h3>
            <p className="text-[#8E9299] text-xs">Visualizing your English language fluency gain and level transitions over your test history</p>
          </div>
        </div>
        <div className="pt-2">
          <ProgressionChart testHistory={testHistory} />
        </div>
      </motion.div>

      {/* Celebratory Overlay Modal */}
      <AnimatePresence>
        {showGoalCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[100] p-4"
            id="daily-goal-celebration-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gradient-to-b from-[#1C1C24] to-[#0F0F12] border border-[#D4AF37]/40 rounded-2xl p-8 md:p-10 max-w-md w-full text-center space-y-6 shadow-2xl relative"
            >
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  onClick={() => setShowGoalCelebration(false)}
                  className="text-white/40 hover:text-white hover:bg-white/5 w-8 h-8 flex items-center justify-center rounded-lg transition"
                >
                  ✕
                </button>
              </div>

              <div className="flex justify-center">
                <motion.div
                  animate={{ 
                    rotateY: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    repeatDelay: 1 
                  }}
                  className="bg-[#D4AF37]/15 p-5 rounded-full border-2 border-[#D4AF37]/30 text-[#D4AF37] filter drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                >
                  <Trophy className="h-14 w-14" />
                </motion.div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#D4AF37] tracking-widest uppercase bg-[#D4AF37]/10 px-3 py-1 rounded border border-[#D4AF37]/20">
                  Daily Achievement Unlocked
                </span>
                <h2 className="text-2xl font-serif text-white uppercase tracking-wider mt-2">
                  Goal Achieved!
                </h2>
                <p className="text-xs text-[#8E9299] leading-relaxed">
                  Outstanding job! You've successfully hit your daily learning target of <strong className="text-white">{dailyTarget} items</strong> today. Consistency is the secret of language mastery!
                </p>
              </div>

              <div className="bg-[#0F0F12] border border-white/5 rounded-xl p-4 space-y-2">
                <div className="text-[10px] text-[#8E9299] uppercase tracking-widest font-bold">Reward Claimed</div>
                <div className="text-3xl font-extrabold text-[#D4AF37] font-mono flex items-center justify-center gap-2">
                  <Zap className="h-6 w-6 fill-[#D4AF37] stroke-none" /> +100 XP Points
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGoalCelebration(false)}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] hover:brightness-110 text-black font-extrabold py-3.5 px-6 rounded-lg transition duration-200 uppercase tracking-widest text-xs cursor-pointer shadow-lg shadow-[#D4AF37]/10"
              >
                Let's Keep Learning!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic In-App Notification Toast */}
      <AnimatePresence>
        {showNotificationToast && (
          <motion.div
            initial={{ opacity: 0, y: 70, scale: 0.85, rotate: -2 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              rotate: 0,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
              }
            }}
            exit={{ opacity: 0, y: 30, scale: 0.9, transition: { duration: 0.2 } }}
            className={`fixed bottom-6 right-6 z-[120] max-w-sm w-full rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border p-4 space-y-3 filter drop-shadow-2xl overflow-hidden ${
              toastType === "levelUp" 
                ? "bg-gradient-to-br from-[#1A1813] to-[#12110E] border-[#D4AF37]/40 text-white shadow-[#D4AF37]/5" 
                : toastType === "goal"
                ? "bg-gradient-to-br from-[#111915] to-[#0E1210] border-emerald-500/40 text-white shadow-emerald-500/5"
                : "bg-gradient-to-br from-[#141417] to-[#0F0F12] border-white/10 text-white"
            }`}
            id="in-app-reminder-toast"
          >
            {/* Ambient subtle background glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none -mr-10 -mt-10 ${
              toastType === "levelUp" ? "bg-[#D4AF37]" : toastType === "goal" ? "bg-emerald-500" : "bg-blue-500"
            }`} />

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-start gap-3">
                {/* Custom Celebration/Icon container */}
                <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                  toastType === "levelUp"
                    ? "bg-[#D4AF37]/10 border-[#D4AF37]/25 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)] animate-pulse"
                    : toastType === "goal"
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]"
                }`}>
                  {toastType === "levelUp" ? (
                    <Trophy className="h-5 w-5 animate-bounce" />
                  ) : toastType === "goal" ? (
                    <Sparkles className="h-5 w-5 text-[#D4AF37] animate-pulse" />
                  ) : (
                    <Bell className="h-5 w-5 animate-bounce" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    {toastType === "levelUp" && (
                      <span className="text-[9px] font-mono font-extrabold text-[#D4AF37] uppercase bg-[#D4AF37]/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/15">
                        Tier Upgrade
                      </span>
                    )}
                    {toastType === "goal" && (
                      <span className="text-[9px] font-mono font-extrabold text-emerald-400 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15">
                        Target Met
                      </span>
                    )}
                    <h4 className={`text-xs font-serif font-black uppercase tracking-wider ${
                      toastType === "levelUp" 
                        ? "text-[#D4AF37]" 
                        : toastType === "goal"
                        ? "text-emerald-400"
                        : "text-white"
                    }`}>
                      {toastTitle}
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#C8C8CC] leading-relaxed font-medium">
                    {toastMessage}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowNotificationToast(false)}
                className="text-white/40 hover:text-white hover:bg-white/5 w-6 h-6 flex items-center justify-center rounded-md transition text-xs shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Bottom mini-progress aesthetic countdown bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: toastType === "levelUp" ? 8 : 6, ease: "linear" }}
                className={`h-full ${
                  toastType === "levelUp"
                    ? "bg-[#D4AF37]"
                    : toastType === "goal"
                    ? "bg-emerald-500"
                    : "bg-[#D4AF37]"
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certificate of Appreciation Modal */}
      <AnimatePresence>
        {showCertificateModal && (
          <CertificateGenerator
            isOpen={showCertificateModal}
            onClose={() => setShowCertificateModal(false)}
            userLevel={userLevel}
            testsCount={stats.testsTaken}
          />
        )}
      </AnimatePresence>

      {/* Platform User Guide Modal */}
      <AnimatePresence>
        {showUserGuideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" id="user-guide-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-gradient-to-b from-[#141417] to-[#0A0A0C] border border-[#D4AF37]/35 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl relative text-left overflow-hidden"
              id="user-guide-panel"
            >
              {/* Header with visual accents */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-300" />
              
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#D4AF37]/15 rounded-lg flex items-center justify-center border border-[#D4AF37]/30 text-[#D4AF37]">
                    <BookOpen className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-black text-white uppercase tracking-wider">
                      الدليل الإرشادي الشامل لأكاديمية فاطمة اللغوية
                    </h3>
                    <p className="text-xs text-[#8E9299]">
                      Fatima Academy Complete Platform Manual & CEFR User Guide
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserGuideModal(false)}
                  className="bg-white/5 hover:bg-white/10 text-[#8E9299] hover:text-white p-2.5 rounded-xl border border-white/10 transition cursor-pointer"
                  id="close-guide-btn"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Guide Contents */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8" id="guide-modal-body">
                
                {/* Introduction section */}
                <div className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 rounded-xl p-5 space-y-3">
                  <h4 className="text-sm font-serif font-bold text-[#D4AF37] uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    مرحباً بك في أكاديمية فاطمة الذكية / Welcome to Fatima Academy
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed text-justify">
                    أكاديمية فاطمة هي منصة تفاعلية متكاملة لتقييم وتدريب مهارات اللغة الإنجليزية وفق الإطار الأوروبي المشترك المرجعي للغات (CEFR). تدمج المنصة خوارزميات تقييم تكيفية مع تقنيات الذكاء الاصطناعي لتقييم المهارات اللغوية الأربعة (الكتابة، القراءة، التحدث، الاستماع) بأسلوب ممتع ومحفز للتعلم.
                  </p>
                  <p className="text-[11px] text-[#8E9299] italic leading-normal">
                    Fatima Academy is an interactive AI-powered ecosystem designed to assess, practice, and master English communicative competence under the standard CEFR framework.
                  </p>
                </div>

                {/* Grid of Platform Modules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Module 1: Placement Test */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-5 space-y-3 hover:border-blue-500/20 transition duration-300">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <h4 className="text-xs font-serif font-black text-white uppercase tracking-wider">
                        1. التقييم التكيفي / Adaptive Placement Test
                      </h4>
                    </div>
                    <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                      <p>
                        <strong>كيف يعمل:</strong> اختبار ذكي يتكيف مع مستواك الفعلي. إذا أجبت بشكل صحيح، تزداد صعوبة الأسئلة لقياس حدود مستواك بدقة، وإذا أخطأت تقل الصعوبة تدريجياً.
                      </p>
                      <p className="text-[#8E9299] text-[11px]">
                        <strong>Adaptive Algorithm:</strong> Tailors questions in real time. Correct answers raise difficulty to explore upper bounds, while mistakes guide the engine downwards.
                      </p>
                      <p>
                        🎯 <strong>النتيجة:</strong> تحديد مستواك المعتمد بدقة بين A1 إلى C2 مع تقرير إحصائي مفصل للمهارات النحوية والمعرفية.
                      </p>
                    </div>
                  </div>

                  {/* Module 2: Skills Evaluator */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-5 space-y-3 hover:border-emerald-500/20 transition duration-300">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                        <Award className="h-4 w-4" />
                      </div>
                      <h4 className="text-xs font-serif font-black text-white uppercase tracking-wider">
                        2. مقيم المقالات والقراءة / Writing & Reading Evaluator
                      </h4>
                    </div>
                    <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                      <p>
                        ✍️ <strong>تقييم الكتابة:</strong> أدخل مقالاً في الموضوع المختار وسيقوم مقيم الذكاء الاصطناعي بتحليله وتزويدك بتقييم شامل للأخطاء اللغوية والنحوية.
                      </p>
                      <p>
                        ⏱️ <strong>مؤشر سرعة القراءة:</strong> يقوم بحساب سرعة قراءتك بدقة بوحدة <strong>كلمة في الدقيقة (WPM)</strong> أثناء ممارسة تمارين القراءة، مع تخزين النتائج وعرضها في رسم بياني تفاعلي لمراقبة تحسن سرعتك بمرور الوقت.
                      </p>
                      <p className="text-[#8E9299] text-[11px]">
                        <strong>WPM Trend Graph:</strong> Monitors reading speeds over sessions and builds a trend visualization to showcase real-time reading efficiency curves.
                      </p>
                    </div>
                  </div>

                  {/* Module 3: Advanced Practice Hub */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-5 space-y-3 hover:border-amber-500/20 transition duration-300">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg flex items-center justify-center">
                        <Brain className="h-4 w-4" />
                      </div>
                      <h4 className="text-xs font-serif font-black text-white uppercase tracking-wider">
                        3. مدرب المهارات / Practice Hub & SRS
                      </h4>
                    </div>
                    <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                      <p>
                        🤖 <strong>مولد الأسئلة:</strong> يولد لك فوراً أسئلة تدريب تفاعلية مخصصة لمستوى الـ CEFR الخاص بك لتعزيز النحو والاستماع.
                      </p>
                      <p>
                        🗂️ <strong>بطاقات التكرار المتباعد (SRS):</strong> يرسخ المفردات في ذاكرتك الطويلة المدى عبر مراجعتها في فترات زمنية متباعدة مدروسة بدقة علمية.
                      </p>
                      <p>
                        ⚡ <strong>وضع الدراسة السريعة (Quick Study):</strong> تحدي مكثف مدته دقيقتان يختبر معلوماتك بسرعة خاطفة، وعند نجاحك تحصل على شارة <strong>'Speed Demon'</strong> النادرة!
                      </p>
                      <p className="text-[#8E9299] text-[11px]">
                        <strong>Quick Study Mode:</strong> A 2-minute vocabulary quiz using spaced-repetition cards, rewarding top learners with the premium 'Speed Demon' badge.
                      </p>
                    </div>
                  </div>

                  {/* Module 4: TOEFL & Language Mentor */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-5 space-y-3 hover:border-purple-500/20 transition duration-300">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <h4 className="text-xs font-serif font-black text-white uppercase tracking-wider">
                        4. التوفل والمرشد اللغوي / TOEFL & Language Mentor
                      </h4>
                    </div>
                    <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                      <p>
                        🎓 <strong>محاكي التوفل المصغر:</strong> يوفر لك بيئة اختبار توفل واقعية لاختبار مدى جاهزيتك للامتحانات الدولية بنظام النقاط الحقيقية.
                      </p>
                      <p>
                        💬 <strong>المرشد اللغوي العائم (Language Mentor):</strong> رفيقك الدراسي الذكي متواجد دائماً في أسفل الشاشة للتحدث المباشر بالصوت أو الكتابة، وتوجيهك في القواعد وتصحيح نطقك للكلمات والعبارات.
                      </p>
                      <p className="text-[#8E9299] text-[11px]">
                        <strong>AI Language Mentor:</strong> A friendly desktop chatbot positioned at the bottom-right for conversation, instant grammar feedback, and structural coaching.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Section 5: Achievements, Streaks and Certificates */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-serif font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#D4AF37]" />
                    سلسلة المتتالية والشهادات المعتمدة / Streaks & Official Certification
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 font-bold">
                    <div className="space-y-1">
                      <h5 className="font-bold text-[#D4AF37]">🔥 سلسلة المتابعة (Streak)</h5>
                      <p className="leading-relaxed font-medium text-[#8E9299]">
                        احرص على المذاكرة يومياً للحفاظ على متتاليتك وكسب نقاط خبرة (XP) إضافية لمضاعفة سرعتك.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-bold text-[#D4AF37]">🎯 الأهداف اليومية (Goals)</h5>
                      <p className="leading-relaxed font-medium text-[#8E9299]">
                        اضبط هدفك اليومي والأسبوعي لتنظيم جدول دراستك والحصول على تنبيهات دورية ذكية مخصصة.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-bold text-[#D4AF37]">📜 شهادة التقدير الرقمية</h5>
                      <p className="leading-relaxed font-medium text-[#8E9299]">
                        بعد تحقيق تقدم ملموس، اضغط على زر <strong>إصدار شهادة التقدير</strong> للحصول على تقرير رقمي معتمد وموثق بنقاطك ومستواك.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/5 bg-[#0F0F12] flex items-center justify-between">
                <span className="text-[10px] text-[#8E9299] uppercase tracking-widest font-mono">
                  نظام التقييم والتدريب الأكاديمي الموحد • Fatima Academy
                </span>
                <button
                  onClick={() => setShowUserGuideModal(false)}
                  className="bg-[#D4AF37] hover:brightness-110 text-black font-extrabold px-6 py-2.5 rounded-lg text-[10px] uppercase tracking-wider transition cursor-pointer"
                >
                  فهمت الدليل، لنبدأ الدراسة! / Start Learning
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <QuickCheckModal
        isOpen={showQuickCheck}
        onClose={() => setShowQuickCheck(false)}
        userLevel={userLevel}
        stats={stats}
        onUpdateStats={onUpdateStats || (() => {})}
      />
    </div>
  );
}
