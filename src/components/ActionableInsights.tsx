import React, { useMemo } from "react";
import { motion } from "motion/react";
import {
  Compass,
  Sparkles,
  ArrowRight,
  BookOpen,
  Mic,
  Volume2,
  MessageSquare,
  Target,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle2,
  Zap,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { CEFRLevel, EvaluationHistoryEntry } from "../types";

interface ActionableInsightsProps {
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
  evaluationHistory: EvaluationHistoryEntry[];
  onNavigate: (
    tab: "dashboard" | "test" | "evaluator" | "practice" | "toefl",
    preset?: {
      cefrLevel?: CEFRLevel;
      skillType?: any;
      activeSubTab?: "generator" | "vocab" | "lessons";
    }
  ) => void;
}

const levelToVal = (level: CEFRLevel): number => {
  const mapping: Record<CEFRLevel, number> = {
    A0: 0,
    A1: 1,
    A2: 2,
    B1: 3,
    B2: 4,
    C1: 5,
    C2: 6
  };
  return mapping[level] ?? 1;
};

const valToLevel = (val: number): CEFRLevel => {
  const levels: CEFRLevel[] = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
  const index = Math.max(0, Math.min(6, Math.round(val)));
  return levels[index];
};

const levelNames: Record<CEFRLevel, string> = {
  A0: "Pre-A1 Starter",
  A1: "A1 Beginner",
  A2: "A2 Elementary",
  B1: "B1 Intermediate",
  B2: "B2 Upper-Intermediate",
  C1: "C1 Advanced",
  C2: "C2 Mastery"
};

export default function ActionableInsights({
  userLevel,
  stats,
  testHistory = [],
  evaluationHistory = [],
  onNavigate
}: ActionableInsightsProps) {
  
  // Replicate domain level profiling exactly matching the CEFR radar metrics
  const domainProfiles = useMemo(() => {
    const baseCEFR = userLevel || "B1";
    const baseVal = levelToVal(baseCEFR);

    let listeningVal = baseVal;
    let readingVal = baseVal;
    let writingVal = baseVal;
    let speakingVal = baseVal;

    // 1. Test history influence (Reading and Listening)
    if (testHistory && testHistory.length > 0) {
      const lastTests = testHistory.slice(0, 3);
      const avgTestVal = lastTests.reduce((acc, t) => acc + levelToVal(t.stabilizedLevel), 0) / lastTests.length;
      readingVal = (readingVal + avgTestVal) / 2;
      listeningVal = (listeningVal + avgTestVal) / 2;
    }

    // 2. AI Evaluations (Writing & Speaking)
    const writingEvaluations = (evaluationHistory || []).filter(e => e.type === "writing");
    const speakingEvaluations = (evaluationHistory || []).filter(e => e.type === "speaking");

    if (writingEvaluations.length > 0) {
      const avgWritingVal = writingEvaluations.reduce((acc, e) => acc + levelToVal(e.result.overall_assigned_level), 0) / writingEvaluations.length;
      writingVal = (writingVal * 0.4) + (avgWritingVal * 0.6);
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

    const getPercentage = (val: number) => Math.max(10, Math.min(100, Math.round((val / 6) * 100)));

    return [
      {
        id: "listening",
        name: "Listening",
        nameAr: "الاستماع",
        score: getPercentage(listeningVal),
        level: valToLevel(listeningVal),
        icon: Volume2,
        color: "from-amber-500/20 to-amber-600/5",
        borderColor: "border-amber-500/20 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10",
        badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
        textColor: "text-amber-400"
      },
      {
        id: "reading",
        name: "Reading",
        nameAr: "القراءة",
        score: getPercentage(readingVal),
        level: valToLevel(readingVal),
        icon: BookOpen,
        color: "from-emerald-500/20 to-emerald-600/5",
        borderColor: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10",
        badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        textColor: "text-emerald-400"
      },
      {
        id: "writing",
        name: "Writing",
        nameAr: "الكتابة",
        score: getPercentage(writingVal),
        level: valToLevel(writingVal),
        icon: Target,
        color: "from-indigo-500/20 to-indigo-600/5",
        borderColor: "border-indigo-500/20 text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10",
        badgeBg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
        textColor: "text-indigo-400"
      },
      {
        id: "speaking",
        name: "Speaking",
        nameAr: "التحدث",
        score: getPercentage(speakingVal),
        level: valToLevel(speakingVal),
        icon: Mic,
        color: "from-rose-500/20 to-rose-600/5",
        borderColor: "border-rose-500/20 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10",
        badgeBg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
        textColor: "text-rose-400"
      }
    ];
  }, [userLevel, testHistory, evaluationHistory]);

  // Sort domains by proficiency percentage to pinpoint weakest areas
  const weakestDomains = useMemo(() => {
    // Return all domains sorted from lowest score to highest score
    return [...domainProfiles].sort((a, b) => a.score - b.score);
  }, [domainProfiles]);

  const primaryWeakest = weakestDomains[0];
  const secondaryWeakest = weakestDomains[1];

  // Open Language Mentor chat with custom submodes
  const openMentorTutorChat = (options: { mode: "mentor" | "roleplay"; personaId?: string }) => {
    const event = new CustomEvent("open-language-mentor", { detail: options });
    window.dispatchEvent(event);
  };

  // Generate actionable tasks mapped to specific CEFR domains
  const getRecommendationsForDomain = (domainId: string, level: CEFRLevel) => {
    switch (domainId) {
      case "listening":
        return [
          {
            title: "Interactive Audio Drills",
            titleAr: "تمارين الاستماع التفاعلية",
            desc: `Engage with standard ${level}-level audio exercises complete with real-time word-by-word transcripts.`,
            actionLabel: "Launch Audio Lessons",
            icon: Volume2,
            onClick: () => onNavigate("practice", { cefrLevel: level, skillType: "Listening", activeSubTab: "lessons" })
          },
          {
            title: "AI Adaptive Listening Prompts",
            titleAr: "تدريبات الاستماع المخصصة بالذكاء الاصطناعي",
            desc: `Generate tailored multiple-choice scenarios focused on listening comprehension for ${levelNames[level] || level}.`,
            actionLabel: "Generate Drills",
            icon: Compass,
            onClick: () => onNavigate("practice", { cefrLevel: level, skillType: "Listening", activeSubTab: "generator" })
          },
          {
            title: "TOEFL Academic Listening",
            titleAr: "محاكاة محاضرة توفل الأكاديمية",
            desc: "Listen to academic lectures and answer standardized questions under mock testing conditions.",
            actionLabel: "Start TOEFL Simulator",
            icon: Award,
            onClick: () => onNavigate("toefl")
          }
        ];
      case "reading":
        return [
          {
            title: "CEFR Core Vocabulary Sets",
            titleAr: "مجموعات المفردات اللغوية المعتمدة",
            desc: `Study flashcards containing crucial English vocabulary and collocations mapped precisely to ${level} difficulty.`,
            actionLabel: "Open Vocabulary Cards",
            icon: Zap,
            onClick: () => onNavigate("practice", { cefrLevel: level, skillType: "Vocabulary", activeSubTab: "vocab" })
          },
          {
            title: "Reading Comprehension Analysis",
            titleAr: "تحليل نصوص القراءة والاستيعاب",
            desc: "Answer dynamic questions on multi-sentence paragraphs to sharpen context retrieval skills.",
            actionLabel: "Practice Reading",
            icon: BookOpen,
            onClick: () => onNavigate("practice", { cefrLevel: level, skillType: "Reading", activeSubTab: "generator" })
          },
          {
            title: "TOEFL Reading Simulation",
            titleAr: "محاكاة قراءة توفل الأكاديمية",
            desc: "Read university-level articles and answer high-tier vocabulary and reading context questions.",
            actionLabel: "TOEFL Simulator",
            icon: Award,
            onClick: () => onNavigate("toefl")
          }
        ];
      case "writing":
        return [
          {
            title: "AI Speech & Essay Evaluator",
            titleAr: "مقيّم الكتابة والخطاب بالذكاء الاصطناعي",
            desc: `Draft an essay or answer a scenario prompt. Receive targeted scoring for Grammar, Lexicon, and Coherence.`,
            actionLabel: "Open Writing Scorer",
            icon: Target,
            onClick: () => onNavigate("evaluator")
          },
          {
            title: "Custom Grammar & Syntax Drills",
            titleAr: "تدريب على القواعد النحوية والتركيب الهيكلي",
            desc: `Practice core grammar rules, active/passive switches, and clause conjunctions for ${level} proficiency.`,
            actionLabel: "Launch Grammar Drills",
            icon: BookOpen,
            onClick: () => onNavigate("practice", { cefrLevel: level, skillType: "Grammar", activeSubTab: "generator" })
          },
          {
            title: "TOEFL Essay Writing",
            titleAr: "قسم كتابة مقال التوفل الأكاديمي",
            desc: "Draft essays answering analytical scenarios. Get graded instantly with direct, grammatical suggestions.",
            actionLabel: "Write TOEFL Essay",
            icon: Award,
            onClick: () => onNavigate("toefl")
          }
        ];
      case "speaking":
        return [
          {
            title: "Interactive Dialogue with Dr. Lexis",
            titleAr: "محادثة تفاعلية مع مرشد الذكاء الاصطناعي",
            desc: "Open the floating AI Mentor and speak or type to Dr. Lexis to discuss grammar, vocabulary, or ask questions.",
            actionLabel: "Open Dr. Lexis Chat",
            icon: MessageSquare,
            onClick: () => openMentorTutorChat({ mode: "mentor" })
          },
          {
            title: "Simulated Scenario: Order Coffee (Barista)",
            titleAr: "تمثيل أدوار: طلب القهوة من الباريستا",
            desc: `Practice speaking under pressure with Barista Alex. Perfect for practical everyday communication.`,
            actionLabel: "Start Coffee Cafe Roleplay",
            icon: Sparkles,
            onClick: () => openMentorTutorChat({ mode: "roleplay", personaId: "barista" })
          },
          {
            title: "AI Pronunciation & Voice Evaluator",
            titleAr: "تقييم النطق ومستوى التدفق اللفظي",
            desc: "Record your spoken description for a dynamic academic prompt and get scored for phonetics and speed.",
            actionLabel: "Open Speech Scorer",
            icon: Mic,
            onClick: () => onNavigate("evaluator")
          }
        ];
      default:
        return [];
    }
  };

  const primaryRecs = useMemo(() => {
    return getRecommendationsForDomain(primaryWeakest.id, primaryWeakest.level);
  }, [primaryWeakest]);

  const secondaryRecs = useMemo(() => {
    return getRecommendationsForDomain(secondaryWeakest.id, secondaryWeakest.level);
  }, [secondaryWeakest]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#141417] via-[#0F0F12] to-[#141417] rounded-xl border border-white/10 p-6 md:p-8 shadow-2xl space-y-6"
      id="actionable-insights-section"
    >
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest font-mono flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>Fatima AI Diagnostic Loop</span>
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-serif text-white uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[#D4AF37]" />
            <span>التوصيات والخطوات العملية / Actionable Growth Insights</span>
          </h2>
          <p className="text-xs text-[#8E9299]">
            Personalized learning loop generated dynamically by analyzing your weakest CEFR categories from the Domain Profiler.
          </p>
        </div>
        <div className="text-[10px] font-mono text-[#8E9299] bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start md:self-center">
          <Activity className="h-3.5 w-3.5 text-[#D4AF37] animate-pulse" />
          <span>Profile Accuracy: High</span>
        </div>
      </div>

      {/* Domain Rankings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {domainProfiles.map((dom) => {
          const Icon = dom.icon;
          const isPrimaryWeakest = dom.id === primaryWeakest.id;
          const isSecondaryWeakest = dom.id === secondaryWeakest.id;

          return (
            <div
              key={dom.id}
              className={`bg-[#0F0F12] border p-4 rounded-xl text-left flex flex-col justify-between transition-all duration-300 relative ${
                isPrimaryWeakest
                  ? "border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.05)] bg-gradient-to-br from-amber-500/5 to-transparent"
                  : isSecondaryWeakest
                  ? "border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.05)] bg-gradient-to-br from-indigo-500/5 to-transparent"
                  : "border-white/5 bg-[#0F0F12]"
              }`}
            >
              {isPrimaryWeakest && (
                <span className="absolute top-2.5 right-3 text-[8px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded-md uppercase">
                  Primary Weakness
                </span>
              )}
              {isSecondaryWeakest && (
                <span className="absolute top-2.5 right-3 text-[8px] font-mono font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-1.5 py-0.5 rounded-md uppercase">
                  Secondary Focus
                </span>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${dom.textColor}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-serif font-bold text-white uppercase tracking-wider">{dom.name}</h3>
                    <p className="text-[10px] text-[#8E9299]">{dom.nameAr}</p>
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-1 border-t border-white/5">
                  <span className="text-[10px] text-[#8E9299] font-mono">Proficiency:</span>
                  <span className="text-sm font-bold text-white font-mono">{dom.score}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-[#8E9299] font-mono">Assessed Band:</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${dom.badgeBg}`}>
                    {dom.level}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Split Focus Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Primary Growth Path */}
        <div className="bg-[#0F0F12]/80 border border-amber-500/10 rounded-xl p-5 md:p-6 space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-lg">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[8px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
                  Priority Growth Path / المسار النمو الأول
                </span>
                <h3 className="text-sm font-serif font-black text-white uppercase tracking-wide flex items-center gap-2">
                  <span>Focus: {primaryWeakest.name}</span>
                  <span className="text-xs font-mono text-[#8E9299]">({primaryWeakest.nameAr})</span>
                </h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#8E9299] block font-mono">CEFR Band:</span>
              <span className="text-xs font-bold text-amber-400 font-mono bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/20">
                {primaryWeakest.level}
              </span>
            </div>
          </div>

          <p className="text-xs text-[#8E9299] leading-relaxed">
            Your linguistic profile flags <strong className="text-white">{primaryWeakest.name}</strong> as your most urgent category for study. Calibrated at <span className="text-amber-400 font-mono font-bold">{primaryWeakest.level}</span>, completing the following targeted modules will raise your overall CEFR balance significantly.
          </p>

          <div className="space-y-3 pt-2">
            {primaryRecs.map((rec, index) => {
              const RecIcon = rec.icon;
              return (
                <div
                  key={index}
                  className="bg-[#141417] border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-500/20 transition-all duration-200"
                >
                  <div className="space-y-1 text-left flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <h4 className="text-xs font-serif font-bold text-white uppercase tracking-wider">{rec.title}</h4>
                    </div>
                    <p className="text-[9px] text-[#8E9299] font-mono">{rec.titleAr}</p>
                    <p className="text-[11px] text-[#8E9299] leading-relaxed max-w-md">{rec.desc}</p>
                  </div>
                  <button
                    onClick={rec.onClick}
                    className="self-start sm:self-center bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-[10px] uppercase tracking-widest px-3 py-2 rounded-lg flex items-center gap-1 shrink-0 transition duration-150 cursor-pointer"
                  >
                    <span>{rec.actionLabel}</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Secondary Growth Path */}
        <div className="bg-[#0F0F12]/80 border border-indigo-500/10 rounded-xl p-5 md:p-6 space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[8px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">
                  Secondary Focus Area / مجال التركيز الثاني
                </span>
                <h3 className="text-sm font-serif font-black text-white uppercase tracking-wide flex items-center gap-2">
                  <span>Focus: {secondaryWeakest.name}</span>
                  <span className="text-xs font-mono text-[#8E9299]">({secondaryWeakest.nameAr})</span>
                </h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#8E9299] block font-mono">CEFR Band:</span>
              <span className="text-xs font-bold text-indigo-400 font-mono bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/20">
                {secondaryWeakest.level}
              </span>
            </div>
          </div>

          <p className="text-xs text-[#8E9299] leading-relaxed">
            Your metrics show steady capability in <strong className="text-white">{secondaryWeakest.name}</strong>, but polishing this sub-skill will solidify your progress. Calibrated at <span className="text-indigo-400 font-mono font-bold">{secondaryWeakest.level}</span>, practicing these steps is highly recommended:
          </p>

          <div className="space-y-3 pt-2">
            {secondaryRecs.map((rec, index) => {
              const RecIcon = rec.icon;
              return (
                <div
                  key={index}
                  className="bg-[#141417] border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-500/20 transition-all duration-200"
                >
                  <div className="space-y-1 text-left flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <h4 className="text-xs font-serif font-bold text-white uppercase tracking-wider">{rec.title}</h4>
                    </div>
                    <p className="text-[9px] text-[#8E9299] font-mono">{rec.titleAr}</p>
                    <p className="text-[11px] text-[#8E9299] leading-relaxed max-w-md">{rec.desc}</p>
                  </div>
                  <button
                    onClick={rec.onClick}
                    className="self-start sm:self-center bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-widest px-3 py-2 rounded-lg flex items-center gap-1 shrink-0 transition duration-150 cursor-pointer"
                  >
                    <span>{rec.actionLabel}</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Simple Activity helper for header icon
function Activity({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
