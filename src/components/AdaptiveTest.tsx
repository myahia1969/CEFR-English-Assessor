import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  Check, 
  X, 
  ChevronRight, 
  Award, 
  BookOpen, 
  TrendingUp, 
  Loader2, 
  History, 
  ArrowRight,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { CEFRLevel, SkillType, CEFRQuestion, TestHistoryEntry } from "../types";

const CEFR_LEVELS: CEFRLevel[] = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
const SKILL_ROTATION: SkillType[] = ["Grammar", "Vocabulary", "Reading", "Listening"];

interface AdaptiveTestProps {
  onCompleteTest: (stabilizedLevel: CEFRLevel, score: number) => void;
}

export default function AdaptiveTest({ onCompleteTest }: AdaptiveTestProps) {
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [startingLevelIndex, setStartingLevelIndex] = useState(0); // Default starting level is A0 (index 0)
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0); // Start at startingLevelIndex
  const [currentQuestion, setCurrentQuestion] = useState<CEFRQuestion | null>(null);
  const [history, setHistory] = useState<TestHistoryEntry[]>([]);
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State to hold the calibration narrative on loading
  const [calibrationText, setCalibrationText] = useState("Calibrating entry level...");

  // Fetch the next question
  const fetchQuestion = async (levelIndex: number, qNum: number, currentHistory: TestHistoryEntry[]) => {
    setIsLoading(true);
    setError(null);
    setSelectedOption(null);
    setIsAnswered(false);

    // Rotate skill types
    const skillType = SKILL_ROTATION[(qNum - 1) % SKILL_ROTATION.length];
    const cefrLevel = CEFR_LEVELS[levelIndex];

    // Determine loading/calibration message
    if (qNum === 1) {
      setCalibrationText(`Initializing British Council standards. Setting entry benchmark at ${cefrLevel}...`);
    } else {
      const prevCorrect = currentHistory[currentHistory.length - 1]?.isCorrect;
      if (prevCorrect) {
        setCalibrationText(`Elevating CEFR complexity to ${cefrLevel}. Synthesizing higher caliber structures...`);
      } else {
        setCalibrationText(`Calibrating difficulty index to ${cefrLevel}. Anchoring core competencies...`);
      }
    }

    try {
      const excludeList = currentHistory.map(h => h.question.question_text);
      const response = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cefrLevel,
          skillType,
          excludeQuestions: excludeList
        })
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with adaptive question engine.");
      }

      const questionData: CEFRQuestion = await response.json();
      setCurrentQuestion(questionData);
    } catch (err: any) {
      console.error(err);
      setError("Unable to generate the next adaptive item. Please check your network or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Start the test
  const handleStartTest = () => {
    setTestStarted(true);
    setTestCompleted(false);
    setCurrentQuestionNumber(1);
    setCurrentLevelIndex(startingLevelIndex);
    setHistory([]);
    fetchQuestion(startingLevelIndex, 1, []);
  };

  // Submit current answer
  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correct_option;
    const entry: TestHistoryEntry = {
      question: currentQuestion,
      userAnswer: selectedOption,
      isCorrect,
      levelIndexAtTime: currentLevelIndex
    };

    const updatedHistory = [...history, entry];
    setHistory(updatedHistory);
    setIsAnswered(true);
  };

  // Proceed to next question or complete test
  const handleNextQuestion = () => {
    if (history.length === 0) return;
    const lastEntry = history[history.length - 1];
    
    // Adaptive logic: Correct goes up (+1), Incorrect goes down (-1)
    let nextLevelIndex = currentLevelIndex;
    if (lastEntry.isCorrect) {
      nextLevelIndex = Math.min(currentLevelIndex + 1, CEFR_LEVELS.length - 1);
    } else {
      nextLevelIndex = Math.max(currentLevelIndex - 1, 0);
    }

    if (currentQuestionNumber >= 20) {
      // Complete the test!
      handleCompleteTest(updatedHistoryWithEndLevel(nextLevelIndex));
    } else {
      const nextQNum = currentQuestionNumber + 1;
      setCurrentQuestionNumber(nextQNum);
      setCurrentLevelIndex(nextLevelIndex);
      fetchQuestion(nextLevelIndex, nextQNum, history);
    }
  };

  // Workaround to get final state index recorded
  const updatedHistoryWithEndLevel = (finalIndex: number) => {
    return history;
  };

  // Keyboard shortcut support (A/B/C/D to select, Enter to confirm/next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        (activeElement as HTMLElement).isContentEditable
      );
      if (isTyping) return;

      if (!testStarted || testCompleted || isLoading || error || !currentQuestion) return;

      // Select option with keys A, B, C, D
      if (!isAnswered) {
        const key = e.key.toUpperCase();
        if (key === "A" || key === "B" || key === "C" || key === "D") {
          e.preventDefault();
          setSelectedOption(key as "A" | "B" | "C" | "D");
        }
      }
    };

    const handleCustomEnter = (e: Event) => {
      const customEvent = e as CustomEvent;
      const isTyping = customEvent.detail?.isTyping;
      if (isTyping) return;

      if (!testStarted || testCompleted || isLoading || error || !currentQuestion) return;

      if (!isAnswered) {
        if (selectedOption) {
          handleSubmitAnswer();
        }
      } else {
        handleNextQuestion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("app-keyboard-enter", handleCustomEnter);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("app-keyboard-enter", handleCustomEnter);
    };
  }, [testStarted, testCompleted, isLoading, error, currentQuestion, isAnswered, selectedOption, history, currentLevelIndex, currentQuestionNumber]);

  // Handle final completion calculations
  const handleCompleteTest = (finalHistory: TestHistoryEntry[]) => {
    setTestCompleted(true);
    
    // Save missed questions for Vocabulary Practice Deck in localStorage
    try {
      const missedFromThisTest = finalHistory
        .filter(h => !h.isCorrect)
        .map(h => h.question);
      
      const existingMissed = JSON.parse(localStorage.getItem("cefr_missed_questions") || "[]");
      // Avoid exact duplicates by comparing question_text
      const combined = [...missedFromThisTest];
      existingMissed.forEach((exQuestion: any) => {
        if (!combined.some(q => q.question_text === exQuestion.question_text)) {
          combined.push(exQuestion);
        }
      });
      // Store up to 40 questions to prevent excessive localStorage usage
      localStorage.setItem("cefr_missed_questions", JSON.stringify(combined.slice(0, 40)));
    } catch (e) {
      console.error("Failed to save missed questions to localStorage:", e);
    }

    // Compute stabilization point
    // Definition: average level index of the final third of the test (questions 14 to 20, 7 questions total)
    const finalSection = finalHistory.slice(13); // Last 7 questions
    const sumLevelIndices = finalSection.reduce((acc, curr) => acc + curr.levelIndexAtTime, 0);
    const avgIndex = Math.round(sumLevelIndices / finalSection.length);
    const stabilizedLevel = CEFR_LEVELS[avgIndex];

    const score = finalHistory.filter(h => h.isCorrect).length;
    onCompleteTest(stabilizedLevel, score);
  };

  // Get chart data mapping user journey from Q1 to Q20
  const getChartData = () => {
    return history.map((entry, index) => ({
      name: `Q${index + 1}`,
      levelIndex: entry.levelIndexAtTime,
      levelName: CEFR_LEVELS[entry.levelIndexAtTime],
      result: entry.isCorrect ? "Correct" : "Incorrect"
    }));
  };

  const score = history.filter(h => h.isCorrect).length;

  // Calculate stabilized level for results display
  const getStabilizedLevel = () => {
    if (history.length === 0) return CEFR_LEVELS[startingLevelIndex];
    const finalSection = history.slice(13); // Last 7 questions
    const sumLevelIndices = finalSection.reduce((acc, curr) => acc + curr.levelIndexAtTime, 0);
    const avgIndex = Math.round(sumLevelIndices / (finalSection.length || 1));
    return CEFR_LEVELS[avgIndex];
  };

  const finalStabilized = getStabilizedLevel();

  const levelDescriptions: Record<CEFRLevel, string> = {
    A0: "You are at a Pre-A1 beginner stage, recognizing extremely fundamental words and basic greetings.",
    A1: "You possess basic vocabulary to make yourself understood in highly guided everyday situations.",
    A2: "You can express basic routine needs and understand simple instructions or written tasks.",
    B1: "You are an independent language user capable of speaking cohesive paragraphs and following clear standard dialogues.",
    B2: "You navigate complex social, professional, and grammatical structures comfortably and converse with fluency.",
    C1: "You communicate spontaneously, grasp implicit stylistic nuances, and express abstract concepts fluently.",
    C2: "You exhibit native-level mastery, summarizing complex arguments and articulating ideas with absolute precision."
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-[#E0E0E0]" id="adaptive-test-tab">
      
      {/* 1. Onboarding Screen */}
      {!testStarted && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#141417] rounded-xl border border-white/5 p-8 shadow-2xl space-y-8"
          id="test-intro-container"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest border border-[#D4AF37]/20">
              <TrendingUp className="h-3.5 w-3.5" /> Dynamic Calibration Engine
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-white tracking-wide uppercase">
              Adaptive CEFR Placement Examination
            </h2>
            <p className="text-[#8E9299] text-xs leading-relaxed">
              Our placement test does not use a fixed question paper. Instead, it utilizes an 
              <strong className="text-[#D4AF37] font-semibold"> item-response calibration model</strong> aligned with official CEFR guidelines. 
              The test adapts live to your proficiency: correctly answered items elevate difficulty, while 
              incorrect responses prompt a step down. 
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0F0F12] p-5 rounded-lg border border-white/5 space-y-2">
              <span className="text-[9px] font-bold text-[#8E9299] tracking-widest uppercase">Benchmark</span>
              <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
                Starts at Level {CEFR_LEVELS[startingLevelIndex]}
              </h4>
              <p className="text-xs text-[#8E9299] leading-relaxed">
                Initial calibration begins at {CEFR_LEVELS[startingLevelIndex]} ({startingLevelIndex === 0 ? "Starter / Complete Beginner" : "Custom starting benchmark"}) to customize your scoring trajectory.
              </p>
            </div>
            <div className="bg-[#0F0F12] p-5 rounded-lg border border-white/5 space-y-2">
              <span className="text-[9px] font-bold text-[#8E9299] tracking-widest uppercase">Metric</span>
              <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wider">Dynamic Scaling</h4>
              <p className="text-xs text-[#8E9299] leading-relaxed">
                Correct answers step up complexity (e.g. A0 ➔ A1). Incorrect answers adjust down if possible.
              </p>
            </div>
            <div className="bg-[#0F0F12] p-5 rounded-lg border border-white/5 space-y-2">
              <span className="text-[9px] font-bold text-[#8E9299] tracking-widest uppercase">Outcome</span>
              <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wider">Stabilization Index</h4>
              <p className="text-xs text-[#8E9299] leading-relaxed">
                Your final CEFR level is computed based on your stabilized performance across the test items.
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t border-white/5 pt-6">
            <div>
              <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
                Select Your Starting Calibration Level
              </h3>
              <p className="text-xs text-[#8E9299] mt-1">
                Choose the proficiency level at which you want the exam to begin calibrating.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3" id="starting-level-selector">
              {CEFR_LEVELS.map((level, idx) => {
                const isSelected = startingLevelIndex === idx;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setStartingLevelIndex(idx)}
                    className={`px-3 py-3 rounded-lg border text-center transition duration-200 cursor-pointer ${
                      isSelected 
                        ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37] font-bold ring-1 ring-[#D4AF37]/50" 
                        : "bg-[#0F0F12] border-white/5 text-[#8E9299] hover:border-white/10 hover:text-white"
                    }`}
                  >
                    <div className="text-sm font-serif font-extrabold tracking-tight">{level}</div>
                    <div className="text-[8px] uppercase tracking-wider mt-1 opacity-80">
                      {level === "A0" ? "Starter" : level === "A1" ? "Beginner" : level === "A2" ? "Elem." : level === "B1" ? "Inter." : level === "B2" ? "Upper" : level === "C1" ? "Adv." : "Mastery"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/10 text-xs text-[#E0E0E0]">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-[#D4AF37] shrink-0" />
              <span className="text-xs">Provides live grammatical explanations and charts your trajectory instantly upon completion.</span>
            </div>
            <button 
              id="start-exam-now-btn"
              onClick={handleStartTest}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:brightness-110 text-black font-extrabold px-6 py-3 rounded-lg shadow-lg shadow-[#D4AF37]/20 transition duration-200 cursor-pointer text-xs uppercase tracking-widest"
            >
              Begin Placement Test <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* 2. Loading State */}
      {testStarted && !testCompleted && isLoading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center bg-[#141417] rounded-xl border border-white/5 p-8 shadow-2xl">
          <Loader2 className="h-10 w-10 text-[#D4AF37] animate-spin" />
          <div className="space-y-3 max-w-md">
            <h3 className="text-sm font-serif text-white uppercase tracking-wider">Generating Calibrated Item</h3>
            <p className="text-xs text-[#D4AF37] font-semibold font-mono bg-[#D4AF37]/10 px-3 py-1.5 rounded border border-[#D4AF37]/20 uppercase tracking-widest">
              {calibrationText}
            </p>
            <p className="text-[#8E9299] text-[11px]">
              Question {currentQuestionNumber} of 20 • Formulating CEFR aligned options...
            </p>
          </div>
        </div>
      )}

      {/* 3. Error State */}
      {testStarted && !testCompleted && error && (
        <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5.5 w-5.5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-serif text-white uppercase tracking-wider">Placement Engine Error</h3>
              <p className="text-xs text-red-400 mt-1">{error}</p>
            </div>
          </div>
          <button 
            onClick={() => fetchQuestion(currentLevelIndex, currentQuestionNumber, history)}
            className="inline-flex items-center gap-1.5 bg-[#D4AF37] hover:brightness-110 text-black font-extrabold text-xs tracking-widest uppercase px-4 py-2.5 rounded cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry Question
          </button>
        </div>
      )}

      {/* 4. Active Question Interface */}
      {testStarted && !testCompleted && !isLoading && !error && currentQuestion && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
          id="test-question-box"
        >
          {/* Top Status Header */}
          <div className="bg-[#141417] rounded-xl border border-white/5 p-4 shadow-2xl flex items-center justify-between text-xs text-[#8E9299]">
            <div className="flex items-center gap-4">
              <span className="font-bold text-white bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-[11px] uppercase tracking-wider">
                Question {currentQuestionNumber} of 20
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs">
                <BookOpen className="h-3.5 w-3.5 text-[#D4AF37]" /> Topic: <strong className="text-white font-medium">{currentQuestion.skill_type}</strong>
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#8E9299] uppercase tracking-widest">Calibration:</span>
              <span className="font-serif font-extrabold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded border border-[#D4AF37]/20 text-[11px] uppercase tracking-wider">
                {currentQuestion.cefr_level}
              </span>
            </div>
          </div>

          {/* Core Question Card */}
          <div className="bg-[#141417] rounded-xl border border-white/5 p-6 md:p-8 shadow-2xl space-y-6">
            
            {/* Can-do description */}
            <div className="pb-3 border-b border-white/5 flex items-start gap-2 text-xs">
              <Award className="h-4.5 w-4.5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <span className="font-serif font-bold text-white uppercase tracking-wider text-[11px]">CEFR Standard: </span>
                <span className="text-[#8E9299] font-medium">{currentQuestion.can_do_statement}</span>
              </div>
            </div>

            {/* Context/Scenario Passage */}
            <div className="bg-[#0F0F12] p-5 rounded-lg border border-white/5 space-y-2">
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#8E9299] uppercase tracking-widest">
                <HelpCircle className="h-3 w-3 text-[#D4AF37]" /> Context Dialogue & Situation
              </span>
              <p className="text-white/95 text-base font-serif font-medium leading-relaxed italic whitespace-pre-line">
                "{currentQuestion.context_scenario}"
              </p>
            </div>

            {/* Question Text */}
            <div className="space-y-3">
              <h3 className="text-base md:text-lg font-serif font-bold text-white leading-relaxed">
                {currentQuestion.question_text}
              </h3>
            </div>

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-1 gap-3">
              {(Object.keys(currentQuestion.options) as Array<"A" | "B" | "C" | "D">).map((key) => {
                const optText = currentQuestion.options[key];
                const isSelected = selectedOption === key;
                const isCorrectOpt = currentQuestion.correct_option === key;
                
                let btnStyle = "border-white/5 bg-white/5 text-white/90 hover:border-[#D4AF37]/50 hover:bg-white/10";
                let textStyle = "text-[#E0E0E0]";
                let badgeStyle = "bg-white/5 text-[#8E9299] border border-white/10";

                if (isAnswered) {
                  if (isCorrectOpt) {
                    btnStyle = "border-emerald-500/40 bg-emerald-500/10";
                    textStyle = "text-emerald-300 font-bold";
                    badgeStyle = "bg-emerald-500 text-black border-emerald-500";
                  } else if (isSelected) {
                    btnStyle = "border-red-500/40 bg-red-500/10";
                    textStyle = "text-red-300 font-medium";
                    badgeStyle = "bg-red-500 text-white border-red-500";
                  } else {
                    btnStyle = "border-white/5 opacity-40";
                  }
                } else if (isSelected) {
                  btnStyle = "border-[#D4AF37] bg-[#D4AF37]/10 ring-1 ring-[#D4AF37]";
                  textStyle = "text-[#D4AF37] font-bold";
                  badgeStyle = "bg-[#D4AF37] text-black border-[#D4AF37]";
                }

                return (
                  <button
                    key={key}
                    id={`opt-${key}`}
                    disabled={isAnswered}
                    onClick={() => setSelectedOption(key)}
                    className={`flex items-center justify-between text-left p-4 rounded-lg border transition duration-200 text-xs cursor-pointer disabled:cursor-default w-full ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-6 w-6 rounded flex items-center justify-center font-bold text-xs shrink-0 ${badgeStyle}`}>
                        {key}
                      </span>
                      <span className={textStyle}>{optText}</span>
                    </div>
                    {isAnswered && isCorrectOpt && (
                      <Check className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrectOpt && (
                      <X className="h-4.5 w-4.5 text-red-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanations */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-lg p-5 space-y-2 text-xs"
                  id="pedagogical-explanation-box"
                >
                  <div className="flex items-center gap-1.5 text-[#D4AF37] font-serif font-bold uppercase tracking-wider text-[11px]">
                    <Sparkles className="h-4 w-4 text-[#D4AF37]" /> Pedagogical Rationale & Analysis
                  </div>
                  <p className="text-[#8E9299] leading-relaxed whitespace-pre-line">
                    {currentQuestion.pedagogical_explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex justify-end pt-4 border-t border-white/5">
              {!isAnswered ? (
                <button
                  id="submit-answer-btn"
                  disabled={!selectedOption}
                  onClick={handleSubmitAnswer}
                  className="bg-[#D4AF37] hover:brightness-110 text-black font-extrabold px-6 py-3 rounded-lg text-xs transition duration-200 disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1.5 cursor-pointer uppercase tracking-widest"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  id="next-question-btn"
                  onClick={handleNextQuestion}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold px-6 py-3 rounded-lg text-xs transition duration-200 inline-flex items-center gap-1.5 cursor-pointer uppercase tracking-widest"
                >
                  {currentQuestionNumber === 20 ? "Complete Assessment" : "Next Question"} <ChevronRight className="h-4.5 w-4.5" />
                </button>
              )}
            </div>

          </div>
        </motion.div>
      )}

      {/* 5. Complete / Placement Results Screen */}
      {testStarted && testCompleted && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
          id="test-results-container"
        >
          {/* Congrats Card */}
          <div className="bg-[#141417] rounded-xl border border-white/5 p-8 shadow-2xl text-center space-y-6">
            <div className="h-16 w-16 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto text-[#D4AF37]">
              <Award className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-[#8E9299] uppercase tracking-widest text-center">Placement Concluded</h2>
              <h1 className="text-4xl md:text-5xl font-serif text-white tracking-wide text-center">
                Your Stabilized Level is <span className="text-[#D4AF37]">{finalStabilized}</span>
              </h1>
              <p className="text-[#8E9299] text-xs font-semibold">
                Accuracy score: {score} of 20 items correct • Balanced CEFR metric
              </p>
            </div>

            <p className="text-[#8E9299] text-sm max-w-xl mx-auto leading-relaxed italic font-serif">
              "{levelDescriptions[finalStabilized]}"
            </p>

            <div className="flex justify-center gap-4 pt-2">
              <button
                id="results-restart-btn"
                onClick={handleStartTest}
                className="inline-flex items-center gap-1.5 bg-[#D4AF37] hover:brightness-110 text-black font-extrabold text-xs px-5 py-3 rounded-lg cursor-pointer uppercase tracking-widest"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Re-take Placement Test
              </button>
            </div>
          </div>

          {/* Dynamic calibration trajectory chart */}
          <div className="bg-[#141417] rounded-xl border border-white/5 p-6 shadow-2xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-serif text-white uppercase tracking-wider">Adaptive Trajectory</h3>
              <p className="text-[#8E9299] text-xs">
                Visualize how the exam adapted item-by-item in real-time to find your exact language stabilization point.
              </p>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getChartData()}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#8E9299" 
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 5]} 
                    tickFormatter={(v) => CEFR_LEVELS[v]} 
                    stroke="#8E9299"
                    fontSize={10}
                    tickCount={6}
                    tickLine={false}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0F0F12] border border-white/10 text-white p-3 rounded-lg text-[11px] shadow-2xl space-y-1">
                            <p className="font-serif font-bold text-[#D4AF37]">{data.name}</p>
                            <p className="text-[#8E9299]">Level: {data.levelName}</p>
                            <p className={data.result === "Correct" ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
                              Answer: {data.result}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="levelIndex" 
                    stroke="#D4AF37" 
                    strokeWidth={3} 
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      const isCorrect = payload.result === "Correct";
                      return (
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={4} 
                          fill={isCorrect ? "#10b981" : "#ef4444"} 
                          stroke="#141417" 
                          strokeWidth={1.5} 
                        />
                      );
                    }}
                    activeDot={{ r: 6, strokeWidth: 0 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex items-center gap-4 justify-center text-[10px] text-[#8E9299] pt-3 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block border border-black shadow-sm" />
                <span>Correct Option (Upshift)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block border border-black shadow-sm" />
                <span>Incorrect Option (Downshift)</span>
              </div>
            </div>
          </div>

          {/* Historical Items Review */}
          <div className="bg-[#141417] rounded-xl border border-white/5 p-6 shadow-2xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-serif text-white uppercase tracking-wider">Detailed Exam Review</h3>
              <p className="text-[#8E9299] text-xs">Review each item presented during your dynamic placement.</p>
            </div>

            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
              {history.map((h, i) => (
                <div key={i} className="border border-white/5 rounded-lg p-4 space-y-3 bg-[#0F0F12]">
                  <div className="flex items-center justify-between text-[11px] border-b border-white/5 pb-2">
                    <span className="font-bold text-white">Item #{i + 1} ({h.question.skill_type})</span>
                    <span className="font-serif font-extrabold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded border border-[#D4AF37]/20 text-[11px] uppercase">{h.question.cefr_level}</span>
                  </div>
                  
                  <p className="text-xs font-semibold text-[#E0E0E0] leading-normal">{h.question.question_text}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#8E9299] font-medium">Your answer:</span>{" "}
                      <span className={`font-bold ${h.isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                        Option {h.userAnswer} ({h.question.options[h.userAnswer]})
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8E9299] font-medium">Correct answer:</span>{" "}
                      <span className="text-emerald-400 font-bold">
                        Option {h.question.correct_option} ({h.question.options[h.question.correct_option]})
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-[11px] text-[#8E9299] space-y-1">
                    <p className="font-serif font-bold text-white uppercase tracking-wider text-[10px]">Pedagogical Rationale:</p>
                    <p className="leading-relaxed whitespace-pre-line">{h.question.pedagogical_explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}
