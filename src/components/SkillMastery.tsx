import React, { useMemo } from "react";
import { motion } from "motion/react";
import { 
  BookOpen, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  CheckCircle, 
  Award, 
  PenTool, 
  Volume2, 
  Compass, 
  BrainCircuit, 
  Languages, 
  Activity, 
  Gauge,
  HelpCircle,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { CEFRLevel, SkillType, EvaluationHistoryEntry } from "../types";

interface SkillMasteryProps {
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
  onNavigate?: (tab: "dashboard" | "test" | "evaluator" | "practice" | "toefl") => void;
}

interface SkillDetail {
  id: SkillType;
  titleEn: string;
  titleAr: string;
  icon: React.ComponentType<any>;
  description: string;
  score: number; // 0 to 100
  level: CEFRLevel;
  mastery: "Beginner" | "Intermediate" | "Advanced";
  sources: string[];
  canDo: string;
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

const getMastery = (level: CEFRLevel): "Beginner" | "Intermediate" | "Advanced" => {
  if (["A0", "A1", "A2"].includes(level)) return "Beginner";
  if (["B1", "B2"].includes(level)) return "Intermediate";
  return "Advanced";
};

export default function SkillMastery({ 
  userLevel, 
  stats, 
  testHistory, 
  evaluationHistory = [],
  onNavigate
}: SkillMasteryProps) {
  
  // Calculate dynamic skill statistics based on test history and AI evaluations
  const skillDetails = useMemo<SkillDetail[]>(() => {
    const baseCEFR = userLevel || "B1";
    const baseVal = levelToVal(baseCEFR);

    // Initial default values derived from overall userLevel
    let grammarVal = baseVal;
    let vocabVal = baseVal;
    let listeningVal = baseVal;
    let readingVal = baseVal;
    let speakingVal = baseVal;
    let writingVal = baseVal;

    const grammarSources: string[] = ["Calculated from baseline CEFR rating"];
    const vocabSources: string[] = ["Calculated from baseline CEFR rating"];
    const listeningSources: string[] = ["Calculated from baseline CEFR rating"];
    const readingSources: string[] = ["Calculated from baseline CEFR rating"];
    const speakingSources: string[] = ["Calculated from baseline CEFR rating"];
    const writingSources: string[] = ["Calculated from baseline CEFR rating"];

    // 1. Incorporate Test History (Placements influence Reading, Listening, and Grammar)
    if (testHistory.length > 0) {
      // Get average level of last 3 placement tests
      const lastTests = testHistory.slice(0, 3);
      const avgTestVal = lastTests.reduce((acc, t) => acc + levelToVal(t.stabilizedLevel), 0) / lastTests.length;
      
      readingVal = (readingVal + avgTestVal) / 2;
      listeningVal = (listeningVal + avgTestVal) / 2;
      grammarVal = (grammarVal + avgTestVal) / 2;

      const testMsg = `Derived from ${testHistory.length} placement test scores`;
      readingSources.push(testMsg);
      listeningSources.push(testMsg);
      grammarSources.push(testMsg);
    }

    // 2. Incorporate AI Evaluations (Writing & Speaking)
    const writingEvaluations = evaluationHistory.filter(e => e.type === "writing");
    const speakingEvaluations = evaluationHistory.filter(e => e.type === "speaking");

    if (writingEvaluations.length > 0) {
      // Writing evaluations update Writing, Grammar, and Vocabulary
      const avgWritingVal = writingEvaluations.reduce((acc, e) => acc + levelToVal(e.result.overall_assigned_level), 0) / writingEvaluations.length;
      writingVal = (writingVal * 0.4) + (avgWritingVal * 0.6);
      
      // Look at criteria scores if present
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
        grammarSources.push(`Refined by ${count} AI grammatical accuracy critiques`);
        vocabSources.push(`Refined by ${count} AI lexical resource benchmarks`);
      }
      writingSources.push(`Calculated over ${writingEvaluations.length} comprehensive writing samples`);
    }

    if (speakingEvaluations.length > 0) {
      // Speaking evaluations update Speaking and Listening
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
        speakingSources.push(`Adjusted by oral dialogue flow & pronunciation metrics`);
      }
      speakingSources.push(`Measured via ${speakingEvaluations.length} diagnostic voice reviews`);
      listeningSources.push("Enhanced by interactive real-time auditory evaluations");
    }

    // 3. Incorporate practice metrics (Accuracy & Questions Answered)
    if (stats.practiceQuestions > 0) {
      // High practice questions boost Vocabulary & Grammar
      const questionsBonus = Math.min(1.0, stats.practiceQuestions / 40);
      vocabVal = Math.min(6, vocabVal + (questionsBonus * 0.5));
      vocabSources.push(`Boosted by practicing ${stats.practiceQuestions} vocabulary items`);

      if (stats.accuracy > 0) {
        // High accuracy boosts Grammar
        const accuracyBonus = (stats.accuracy - 50) / 50; // -1.0 to 1.0
        grammarVal = Math.max(0, Math.min(6, grammarVal + (accuracyBonus * 0.6)));
        grammarSources.push(`Influenced by active practice accuracy: ${stats.accuracy}%`);
      }
    }

    // Convert values to final details
    const list: Array<{ id: SkillType; val: number; titleEn: string; titleAr: string; icon: React.ComponentType<any>; sources: string[]; description: string }> = [
      {
        id: "Grammar",
        val: grammarVal,
        titleEn: "Grammar & Accuracy",
        titleAr: "القواعد والدقة اللغوية",
        icon: BrainCircuit,
        sources: grammarSources,
        description: "Measures structural coherence, sentence complexity, syntax rules adherence, and error-free output."
      },
      {
        id: "Vocabulary",
        val: vocabVal,
        titleEn: "Lexical & Vocabulary",
        titleAr: "الثروة اللغوية والمفردات",
        icon: Languages,
        sources: vocabSources,
        description: "Assesses lexical breadth, idiom usage, context-appropriate term selection, and spelling mastery."
      },
      {
        id: "Listening",
        val: listeningVal,
        titleEn: "Auditory Comprehension",
        titleAr: "الفهم والاستماع الصوتي",
        icon: Volume2,
        sources: listeningSources,
        description: "Gauges ability to process rapid conversational native input, accents, and context identifiers."
      },
      {
        id: "Reading",
        val: readingVal,
        titleEn: "Text Reading & Speed",
        titleAr: "القراءة وفهم النصوص",
        icon: BookOpen,
        sources: readingSources,
        description: "Rates text speed, complex reading comprehension, main ideas scanning, and vocabulary inference."
      },
      {
        id: "Speaking",
        val: speakingVal,
        titleEn: "Spoken Communication",
        titleAr: "التحدث والتعبير الشفهي",
        icon: Zap,
        sources: speakingSources,
        description: "Measures speech flow, pronunciation clarity, conversational confidence, and phonetic precision."
      },
      {
        id: "Writing",
        val: writingVal,
        titleEn: "Written Expression",
        titleAr: "الكتابة والتعبير التحريري",
        icon: PenTool,
        sources: writingSources,
        description: "Benchmarks written cohesion, paragraph development, argumentation structures, and spelling rules."
      }
    ];

    // Map to final SkillDetail structure with "Can-Do" statements
    const getCanDoStatement = (skill: SkillType, level: CEFRLevel): string => {
      const statements: Record<SkillType, Record<string, string>> = {
        Grammar: {
          A: "Can form extremely basic present-tense sentences with simple pronouns, verbs, and common adjectives.",
          B: "Can use compound sentence connectors, active/passive voice, relative clauses, and general past/future tenses.",
          C: "Can consistently command highly complex conditional statements, subjunctive moods, and perfect structures with pristine accuracy."
        },
        Vocabulary: {
          A: "Familiar with a core vocabulary of everyday words, simple grocery/restaurant/travel terms, and numbers.",
          B: "Maintains a broad vocabulary of abstract terms, idiom formulations, professional contexts, and academic themes.",
          C: "Boasts a highly varied vocabulary including delicate emotional tones, subtle technical dialects, and poetic nuances."
        },
        Listening: {
          A: "Can decode extremely slow, clearly articulated dialogues, simple directions, and familiar words.",
          B: "Can follow extended logical lectures, standard television news broadcasts, movies, and rapid conversational cues.",
          C: "Can perfectly parse rapid native conversations, unstructured oral argumentation, audio distortion, and fast accents."
        },
        Reading: {
          A: "Can scan brief notices, simple emails, labels, and uncomplicated menus for specific objective data.",
          B: "Can understand long technical manuals, contemporary news columns, complex plot progression, and literal context.",
          C: "Can digest dense academic monographs, complex legal papers, classic literature, and extremely abstract texts easily."
        },
        Speaking: {
          A: "Can ask and answer simple questions, introduce relatives, describe homes, and request help using short phrases.",
          B: "Can maintain spontaneous conversations, argue points of view, describe dreams, and lecture with decent fluidity.",
          C: "Can speak with extreme precision, utilizing subtle rhetorical tools, quick wit, and seamless idiomatic idioms."
        },
        Writing: {
          A: "Can pen simple personal postcards, short diary entries, simple linear lists, and basic self-introduction essays.",
          B: "Can construct detailed argumentative essays, coherent business proposals, complex emails, and narratives.",
          C: "Can write dense research papers, structured philosophical analyses, creative stories, and elegant professional reports."
        }
      };

      const group = level.startsWith("A") ? "A" : level.startsWith("B") ? "B" : "C";
      return statements[skill]?.[group] ?? "Determining capabilities...";
    };

    return list.map(item => {
      const finalLevel = valToLevel(item.val);
      const mastery = getMastery(finalLevel);
      // Map 0-6 score directly to a 0-100 percentage
      const score = Math.max(10, Math.min(100, Math.round((item.val / 6) * 100)));

      return {
        id: item.id,
        titleEn: item.titleEn,
        titleAr: item.titleAr,
        icon: item.icon,
        description: item.description,
        score,
        level: finalLevel,
        mastery,
        sources: item.sources,
        canDo: getCanDoStatement(item.id, finalLevel)
      };
    });
  }, [userLevel, stats, testHistory, evaluationHistory]);

  // Find lowest and highest skills to give custom dynamic insights
  const { lowestSkill, highestSkill } = useMemo(() => {
    if (skillDetails.length === 0) return { lowestSkill: null, highestSkill: null };
    const sorted = [...skillDetails].sort((a, b) => a.score - b.score);
    return {
      lowestSkill: sorted[0],
      highestSkill: sorted[sorted.length - 1]
    };
  }, [skillDetails]);

  // Color schemes for different levels
  const getMasteryColors = (mastery: "Beginner" | "Intermediate" | "Advanced") => {
    switch (mastery) {
      case "Advanced":
        return {
          bg: "bg-[#D4AF37]/10 border-[#D4AF37]/40 text-[#D4AF37]",
          bar: "bg-gradient-to-r from-amber-500 to-[#D4AF37]",
          glow: "shadow-[0_0_20px_rgba(212,175,55,0.15)]",
          label: "Mastery (C1-C2)"
        };
      case "Intermediate":
        return {
          bg: "bg-orange-500/10 border-orange-500/40 text-orange-400",
          bar: "bg-gradient-to-r from-amber-600 to-orange-500",
          glow: "shadow-[0_0_20px_rgba(249,115,22,0.1)]",
          label: "Independent (B1-B2)"
        };
      default: // Beginner
        return {
          bg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
          bar: "bg-gradient-to-r from-indigo-500 to-violet-500",
          glow: "shadow-none",
          label: "Basic (A1-A2)"
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#141417] rounded-xl border border-white/5 p-6 md:p-8 shadow-2xl space-y-6 overflow-hidden relative"
      id="skill-mastery-card"
    >
      {/* Visual background gradient accents */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-[#D4AF37] to-amber-500" />
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header section with Dynamic badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-indigo-500/15 rounded-lg text-indigo-400 border border-indigo-500/20 shrink-0">
            <Activity className="h-6 w-6 text-indigo-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold text-[#D4AF37] tracking-widest uppercase">CEFR Competencies Dashboard</span>
            <h3 className="text-base font-serif text-white uppercase tracking-wider flex items-center gap-1.5">
              مستوى إتقان المهارات <span className="text-xs text-indigo-400 font-sans font-bold">/ Skill Mastery Profile</span>
            </h3>
            <p className="text-xs text-[#8E9299] leading-relaxed">
              Your multidimensional CEFR level progression. Calculated from placement diagnostics and AI linguistic evaluations.
            </p>
          </div>
        </div>

        {/* Dynamic overall placement status */}
        <div className="bg-[#0F0F12] border border-white/5 p-2 px-3 rounded-xl flex items-center gap-2 self-start md:self-auto shrink-0">
          <Gauge className="h-4 w-4 text-[#D4AF37]" />
          <div className="text-right flex flex-col justify-center px-1" dir="rtl">
            <span className="text-[10px] text-[#8E9299] font-bold uppercase">المستوى العام / Estimated:</span>
            <span className="text-xs font-mono font-black text-[#D4AF37]">
              {userLevel || "B1"} - {getMastery(userLevel || "B1")}
            </span>
          </div>
        </div>
      </div>

      {/* Skills 3x2 Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="skill-mastery-bento-grid">
        {skillDetails.map((skill, index) => {
          const Icon = skill.icon;
          const style = getMasteryColors(skill.mastery);
          
          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-[#0F0F12]/60 border border-white/5 hover:border-[#D4AF37]/30 rounded-xl p-5 space-y-4 transition-all relative group flex flex-col justify-between ${style.glow}`}
            >
              {/* Top Row: Icon, Titles & level Badge */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className={`p-2 rounded-lg ${style.bg} border shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  {/* Arabic and English names */}
                  <div className="flex-1 text-right" dir="rtl">
                    <h4 className="text-xs font-bold text-white leading-normal tracking-wide group-hover:text-[#D4AF37] transition">
                      {skill.titleAr}
                    </h4>
                    <span className="text-[10px] text-[#8E9299] block font-sans font-medium text-left" dir="ltr">
                      {skill.titleEn}
                    </span>
                  </div>
                </div>

                {/* Subtitle details */}
                <p className="text-[10.5px] text-[#8E9299] leading-relaxed">
                  {skill.description}
                </p>
              </div>

              {/* Progress Slider Display */}
              <div className="space-y-3 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-[#8E9299] uppercase tracking-wider">{style.label}</span>
                  <span className="text-white font-mono">{skill.level} ({skill.score}%)</span>
                </div>

                {/* Progress bar background */}
                <div className="h-2 bg-black rounded-full overflow-hidden p-[1px] border border-white/5 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.score}%` }}
                    transition={{ duration: 0.8, delay: index * 0.08 }}
                    className={`h-full rounded-full ${style.bar}`}
                  />
                </div>

                {/* CEFR Level Segment Guidelines */}
                <div className="flex justify-between text-[8px] text-[#8E9299] font-mono font-bold px-0.5">
                  <span>A1/A2</span>
                  <span>B1/B2</span>
                  <span>C1/C2</span>
                </div>
              </div>

              {/* Dynamic Can-Do capability summary */}
              <div className="mt-3.5 bg-black/45 p-3 rounded-lg border border-white/5">
                <span className="text-[8.5px] font-bold text-[#D4AF37] uppercase tracking-widest block mb-1">
                  💡 Can-Do Capability:
                </span>
                <p className="text-[10px] text-slate-300 leading-relaxed italic">
                  {skill.canDo}
                </p>
              </div>

              {/* dynamic information feed source details */}
              <div className="mt-3 text-[9px] text-slate-500 flex flex-col gap-0.5" id={`sources-${skill.id}`}>
                <span className="font-bold uppercase tracking-wider text-[8px]">Data Sources:</span>
                {skill.sources.map((src, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="text-[#D4AF37] shrink-0">•</span>
                    <span className="truncate">{src}</span>
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive recommendation advice block based on dynamic results */}
      {lowestSkill && highestSkill && (
        <div className="bg-[#0F0F12] border border-white/5 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-lg shrink-0 mt-0.5">
              <Compass className="h-5 w-5 text-[#D4AF37] animate-spin-slow" />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-extrabold text-[#D4AF37] uppercase tracking-widest block">AI Smart Study Advice</span>
              <h4 className="text-xs font-serif font-bold text-white uppercase tracking-wider">
                خطة التركيز والتحسين المخصصة <span className="text-[11px] text-slate-400 font-sans font-medium">/ Personalized Focus Plan</span>
              </h4>
              <div className="space-y-1.5 leading-relaxed text-[11.5px] text-[#8E9299]">
                <p className="text-right text-slate-300" dir="rtl">
                  أداؤك متميز جداً في مهارة <strong className="text-[#D4AF37]">{highestSkill.titleAr} ({highestSkill.level})</strong>. ولكن لتحقيق التوازن التام في الكفاءة، ننصحك بالتركيز أكثر على تحسين مهارة <strong className="text-orange-400">{lowestSkill.titleAr} ({lowestSkill.level})</strong> عبر المذاكرة اليومية والتدريب المكثف.
                </p>
                <p className="text-slate-300">
                  Your peak strength is <strong className="text-[#D4AF37] font-semibold">{highestSkill.titleEn} ({highestSkill.level})</strong>. To secure your target CEFR tier, allocate your next focus onto <strong className="text-orange-400 font-semibold">{lowestSkill.titleEn} ({lowestSkill.level})</strong> to bridge the linguistic gap.
                </p>
              </div>
            </div>
          </div>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0 self-stretch sm:self-auto justify-center md:justify-end">
            {lowestSkill.id === "Grammar" || lowestSkill.id === "Vocabulary" ? (
              <button
                onClick={() => onNavigate && onNavigate("practice")}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:brightness-110 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-lg transition duration-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Practice {lowestSkill.id} Now</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            ) : lowestSkill.id === "Speaking" || lowestSkill.id === "Writing" ? (
              <button
                onClick={() => onNavigate && onNavigate("evaluator")}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:brightness-110 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-lg transition duration-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Run AI {lowestSkill.id} Eval</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate && onNavigate("test")}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:brightness-110 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-lg transition duration-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Calibrate Placement</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
