import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, Clock, Trophy, Flame, Play, ChevronRight, X, RotateCcw, 
  HelpCircle, Sparkles, BookOpen, UserCheck, Activity, Award, CheckCircle2, AlertCircle
} from "lucide-react";
import confetti from "canvas-confetti";
import { CEFRLevel, CEFRQuestion } from "../types";

interface Flashcard {
  word: string;
  arabic_translation?: string;
  ipa: string;
  level: string;
  definition: string;
  example_sentence: string;
  usage_tip: string;
  quiz_question: string;
  quiz_answer: string;
}

interface SpeedQuizArenaProps {
  cefrLevel: CEFRLevel;
  flashcards: Flashcard[];
  reviewDeck: Flashcard[];
  customQuestions: CEFRQuestion[];
  onClose: () => void;
}

interface QuizItem {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  arabicTranslation?: string;
  context?: string;
  source: string; // "bookmarked" | "custom" | "core"
}

export default function SpeedQuizArena({
  cefrLevel,
  flashcards,
  reviewDeck,
  customQuestions,
  onClose
}: SpeedQuizArenaProps) {
  // Config States
  const [selectedSource, setSelectedSource] = useState<"bookmarked" | "custom" | "core" | "hybrid">("hybrid");
  const [secondsPerQuestion, setSecondsPerQuestion] = useState<5 | 10 | 15>(10);
  const [gameState, setGameState] = useState<"setup" | "active" | "results">("setup");

  // Game States
  const [questions, setQuestions] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [answeredAt, setAnsweredAt] = useState<number | null>(null); // Time elapsed when answered
  const [timeLeft, setTimeLeft] = useState(10);
  const [avgSpeed, setAvgSpeed] = useState<number[]>([]); // Response speeds in seconds
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  // Filter custom questions that are vocabulary
  const customVocabQuestions = customQuestions.filter(
    q => q.skill_type === "Vocabulary" && q.cefr_level === cefrLevel
  );

  // Load high score from localStorage
  useEffect(() => {
    try {
      const storedHighScore = localStorage.getItem(`lexicon_speed_quiz_highscore_${cefrLevel}`);
      if (storedHighScore) {
        setHighScore(parseInt(storedHighScore, 10));
      }
    } catch {}
  }, [cefrLevel]);

  // Set default source based on available content
  useEffect(() => {
    if (reviewDeck.length > 0) {
      setSelectedSource("bookmarked");
    } else if (customVocabQuestions.length > 0) {
      setSelectedSource("custom");
    } else {
      setSelectedSource("core");
    }
  }, [reviewDeck.length, customVocabQuestions.length]);

  // Start the Timer for active question
  useEffect(() => {
    if (gameState === "active" && userAnswer === null) {
      startTimeRef.current = Date.now();
      setTimeLeft(secondsPerQuestion);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentIndex, userAnswer]);

  // Handle Timeout
  const handleTimeout = () => {
    setUserAnswer("TIMEOUT_EXPIRED");
    setStreak(0);
    setAvgSpeed(prev => [...prev, secondsPerQuestion]);
  };

  // Build Quiz Questions
  const handleStartGame = () => {
    let pool: QuizItem[] = [];

    // 1. Pull from Bookmarked Deck
    const bookmarkItems: QuizItem[] = reviewDeck.map(card => {
      const correctWord = card.quiz_answer || card.word;
      // Distractors
      const poolCards = reviewDeck.length >= 4 ? reviewDeck : flashcards;
      const otherWords = poolCards
        .filter(c => (c.quiz_answer || c.word).toLowerCase() !== correctWord.toLowerCase())
        .map(c => c.quiz_answer || c.word);
      const distractors = [...new Set(otherWords)].sort(() => 0.5 - Math.random()).slice(0, 3);
      while (distractors.length < 3) {
        distractors.push("option_" + distractors.length);
      }
      const options = [correctWord, ...distractors].sort(() => 0.5 - Math.random());

      return {
        questionText: card.quiz_question || `Which word fits this definition: "${card.definition}"?`,
        options,
        correctAnswer: correctWord,
        explanation: card.usage_tip || `This is derived from your bookmarked vocabulary: "${card.word}" (${card.ipa}).`,
        arabicTranslation: card.arabic_translation,
        context: card.example_sentence,
        source: "bookmarked"
      };
    });

    // 2. Pull from Custom Vocabulary Questions
    const customItems: QuizItem[] = customVocabQuestions.map(q => {
      return {
        questionText: q.question_text,
        options: [q.options.A, q.options.B, q.options.C, q.options.D],
        correctAnswer: q.options[q.correct_option],
        explanation: q.pedagogical_explanation,
        arabicTranslation: q.can_do_statement,
        context: q.context_scenario,
        source: "custom"
      };
    });

    // 3. Pull from AI Core Deck
    const coreItems: QuizItem[] = flashcards.map(card => {
      const correctWord = card.quiz_answer || card.word;
      const otherWords = flashcards
        .filter(c => (c.quiz_answer || c.word).toLowerCase() !== correctWord.toLowerCase())
        .map(c => c.quiz_answer || c.word);
      const distractors = [...new Set(otherWords)].sort(() => 0.5 - Math.random()).slice(0, 3);
      while (distractors.length < 3) {
        distractors.push("option_" + distractors.length);
      }
      const options = [correctWord, ...distractors].sort(() => 0.5 - Math.random());

      return {
        questionText: card.quiz_question || `Which word fits this definition: "${card.definition}"?`,
        options,
        correctAnswer: correctWord,
        explanation: card.usage_tip || `Core vocabulary card: "${card.word}".`,
        arabicTranslation: card.arabic_translation,
        context: card.example_sentence,
        source: "core"
      };
    });

    // Merge according to selection
    if (selectedSource === "bookmarked") {
      pool = bookmarkItems;
    } else if (selectedSource === "custom") {
      pool = customItems;
    } else if (selectedSource === "core") {
      pool = coreItems;
    } else {
      // Hybrid
      pool = [...bookmarkItems, ...customItems, ...coreItems];
    }

    // Shuffle and pick at most 10 questions
    const finalQuestions = pool.sort(() => 0.5 - Math.random()).slice(0, 10);

    if (finalQuestions.length === 0) {
      alert("No questions found for the selected content. Please choose another source.");
      return;
    }

    setQuestions(finalQuestions);
    setCurrentIndex(0);
    setScore(0);
    setTotalPoints(0);
    setStreak(0);
    setMaxStreak(0);
    setUserAnswer(null);
    setAvgSpeed([]);
    setIsNewHighScore(false);
    setGameState("active");
  };

  // Handle User Choice Selection
  const handleSelectAnswer = (selected: string) => {
    if (userAnswer !== null) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const elapsedMs = Date.now() - startTimeRef.current;
    const elapsedSec = elapsedMs / 1000;
    setAvgSpeed(prev => [...prev, elapsedSec]);

    setUserAnswer(selected);
    const item = questions[currentIndex];
    const isCorrect = selected.toLowerCase() === item.correctAnswer.toLowerCase();

    if (isCorrect) {
      const nextScore = score + 1;
      setScore(nextScore);

      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > maxStreak) {
        setMaxStreak(nextStreak);
      }

      // Points Formula: Base 100 + Speed Bonus based on speed percentage
      const speedMultiplier = secondsPerQuestion === 5 ? 3 : secondsPerQuestion === 10 ? 2 : 1;
      const timeLeftRatio = timeLeft / secondsPerQuestion;
      const speedBonus = Math.round(timeLeftRatio * 100 * speedMultiplier);
      const pointsWon = 100 + speedBonus;
      setTotalPoints(prev => prev + pointsWon);

      // Sparkly Confetti for excellent reaction speed (under 2s)
      if (elapsedSec < 2) {
        confetti({
          particleCount: 20,
          spread: 30,
          origin: { y: 0.8 },
          colors: ["#D4AF37", "#FFFFFF"]
        });
      }
    } else {
      setStreak(0);
    }
  };

  // Proceed to Next Question or finish
  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer(null);
    } else {
      handleFinishGame();
    }
  };

  // End game & sync metrics
  const handleFinishGame = () => {
    setGameState("results");

    // Trigger global streak logger event
    window.dispatchEvent(new CustomEvent("log-study-activity"));

    // Sync high scores
    if (totalPoints > highScore) {
      try {
        localStorage.setItem(`lexicon_speed_quiz_highscore_${cefrLevel}`, totalPoints.toString());
        setHighScore(totalPoints);
        setIsNewHighScore(true);

        // Big celebratory confetti
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}
    }

    // Unlock speed demon badge if appropriate
    if (score >= 8 && secondsPerQuestion === 5) {
      localStorage.setItem("lexicon_badge_speed_demon", "true");
    }
  };

  // Calculations
  const calculatedAvgSpeed = avgSpeed.length > 0 
    ? (avgSpeed.reduce((a, b) => a + b, 0) / avgSpeed.length).toFixed(1)
    : "0.0";

  const accuracy = questions.length > 0 
    ? Math.round((score / questions.length) * 100)
    : 0;

  // Grade evaluation
  const getGrade = () => {
    if (accuracy >= 90) return { title: "S-Grade Scholar / باحث فائق", desc: "Mind-blowing precision! Absolute mastery of the lexicon." };
    if (accuracy >= 75) return { title: "A-Grade Linguist / لغوي متميز", desc: "Outstanding vocabulary control and swift reflexes." };
    if (accuracy >= 50) return { title: "B-Grade Practitioner / ممارس جيد", desc: "Great performance. Focus on minimizing response delays." };
    return { title: "C-Grade Novice / مبتدئ واعد", desc: "Keep practicing. Repetition leads to instant comprehension!" };
  };

  const grade = getGrade();

  return (
    <div className="bg-[#141417] rounded-xl border border-[#D4AF37]/30 shadow-2xl overflow-hidden relative text-left" id="speed-quiz-root">
      {/* Visual Accent Banner */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-[#D4AF37] to-amber-400" />

      {/* SETUP PHASE */}
      {gameState === "setup" && (
        <div className="p-6 md:p-8 space-y-6" id="speed-quiz-setup">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/20 text-[#D4AF37]">
                <Zap className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Vocabulary Speed Arena</span>
                  <span className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-mono px-2 py-0.5 rounded uppercase">
                    {cefrLevel}
                  </span>
                </h3>
                <p className="text-[#8E9299] text-xs">
                  أثبت سرعة استحضارك للمفردات الإنجليزية تحت الضغط الزمني والمنافسة / Test your lexical reflexes against a ticking countdown clock.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/5 rounded-lg text-[#8E9299] hover:text-white transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Source Configuration */}
            <div className="space-y-4">
              <span className="font-bold text-[#8E9299] uppercase tracking-widest text-[10px] block">
                1. اختر مصدر المحتوى / Select Word Source
              </span>

              <div className="space-y-3.5">
                {/* Bookmarked option */}
                <button
                  type="button"
                  onClick={() => setSelectedSource("bookmarked")}
                  disabled={reviewDeck.length === 0}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition ${
                    selectedSource === "bookmarked"
                      ? "bg-[#D4AF37]/5 border-[#D4AF37] text-[#D4AF37]"
                      : reviewDeck.length === 0
                      ? "opacity-45 border-white/5 bg-white/5 cursor-not-allowed"
                      : "bg-[#0F0F12] border-white/5 hover:border-white/10 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5" />
                    <div>
                      <p className="text-xs font-bold font-serif text-white">
                        Bookmarked Review Deck / قائمة مراجعتي المخصصة
                      </p>
                      <p className="text-[10px] text-[#8E9299]">
                        Uses vocabulary words you've flagged during study blocks.
                      </p>
                    </div>
                  </div>
                  <span className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] px-2 py-0.5 rounded font-mono font-black">
                    {reviewDeck.length} Words
                  </span>
                </button>

                {/* Custom questions option */}
                <button
                  type="button"
                  onClick={() => setSelectedSource("custom")}
                  disabled={customVocabQuestions.length === 0}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition ${
                    selectedSource === "custom"
                      ? "bg-[#D4AF37]/5 border-[#D4AF37] text-[#D4AF37]"
                      : customVocabQuestions.length === 0
                      ? "opacity-45 border-white/5 bg-white/5 cursor-not-allowed"
                      : "bg-[#0F0F12] border-white/5 hover:border-white/10 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-5 w-5" />
                    <div>
                      <p className="text-xs font-bold font-serif text-white">
                        My Manually Added Vocabulary / أسئلتي المضافة يدويًا
                      </p>
                      <p className="text-[10px] text-[#8E9299]">
                        Formulates rapid quizzes directly from your Custom Bank.
                      </p>
                    </div>
                  </div>
                  <span className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] px-2 py-0.5 rounded font-mono font-black">
                    {customVocabQuestions.length} Items
                  </span>
                </button>

                {/* Core AI Vocabulary option */}
                <button
                  type="button"
                  onClick={() => setSelectedSource("core")}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition ${
                    selectedSource === "core"
                      ? "bg-[#D4AF37]/5 border-[#D4AF37] text-[#D4AF37]"
                      : "bg-[#0F0F12] border-white/5 hover:border-white/10 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5" />
                    <div>
                      <p className="text-xs font-bold font-serif text-white">
                        Standard Core CEFR Deck / مفردات المنهج المعتمد
                      </p>
                      <p className="text-[10px] text-[#8E9299]">
                        Sourced from high-frequency {cefrLevel} vocabulary benchmarks.
                      </p>
                    </div>
                  </div>
                  <span className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] px-2 py-0.5 rounded font-mono font-black">
                    {flashcards.length} Words
                  </span>
                </button>

                {/* Hybrid Mix */}
                <button
                  type="button"
                  onClick={() => setSelectedSource("hybrid")}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition ${
                    selectedSource === "hybrid"
                      ? "bg-[#D4AF37]/5 border-[#D4AF37] text-[#D4AF37]"
                      : "bg-[#0F0F12] border-white/5 hover:border-white/10 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5" />
                    <div>
                      <p className="text-xs font-bold font-serif text-white">
                        Ultimate Hybrid Challenge / التحدي الهجين الشامل
                      </p>
                      <p className="text-[10px] text-[#8E9299]">
                        Combines your bookmarks, custom entries, and core curriculum!
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-mono font-black">
                    MIXED
                  </span>
                </button>
              </div>
            </div>

            {/* Right: Pressure Levels & Info */}
            <div className="space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="font-bold text-[#8E9299] uppercase tracking-widest text-[10px] block">
                  2. مستوى الضغط الزمني / Select Time Limit
                </span>

                <div className="grid grid-cols-3 gap-3">
                  {([15, 10, 5] as const).map(sec => {
                    const active = secondsPerQuestion === sec;
                    const mult = sec === 5 ? "3x" : sec === 10 ? "2x" : "1x";
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setSecondsPerQuestion(sec)}
                        className={`p-4 rounded-xl border text-center flex flex-col items-center justify-center transition cursor-pointer ${
                          active
                            ? "bg-[#D4AF37]/5 border-[#D4AF37] text-[#D4AF37]"
                            : "bg-[#0F0F12] border-white/5 hover:border-white/10 text-slate-400"
                        }`}
                      >
                        <Clock className={`h-5 w-5 mb-1.5 ${sec === 5 ? "text-red-400" : sec === 10 ? "text-amber-400" : "text-emerald-400"}`} />
                        <span className="text-xs font-mono font-black text-white">{sec}s</span>
                        <span className="text-[9px] text-[#8E9299] uppercase tracking-widest font-semibold mt-1">
                          {mult} Points
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Highscore Banner */}
              <div className="bg-[#0F0F12] border border-white/5 p-4 rounded-xl space-y-2 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-left">
                  <Trophy className="h-6 w-6 text-[#D4AF37]" />
                  <div>
                    <span className="font-bold text-[#8E9299] uppercase tracking-widest text-[9px] block">أعلى رصيد نقاط / Record High Score</span>
                    <span className="text-white text-base font-mono font-black">{highScore} PTS</span>
                  </div>
                </div>
                <div className="text-right text-[10px] text-[#8E9299]">
                  Level: <strong className="text-white font-mono">{cefrLevel}</strong>
                </div>
              </div>

              {/* Enter the Arena Button */}
              <button
                type="button"
                onClick={handleStartGame}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-[#D4AF37] hover:brightness-110 text-black font-black text-xs py-4 rounded-xl transition duration-200 shadow-xl shadow-[#D4AF37]/15 uppercase tracking-widest cursor-pointer"
              >
                <Play className="h-4 w-4 fill-black" />
                <span>دخول ساحة التحدي السريع / Enter the Speed Arena</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME IN PROGRESS */}
      {gameState === "active" && (
        <div className="p-6 md:p-8 space-y-6 text-xs" id="speed-quiz-active">
          {/* Top Status Panel */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-black font-mono text-[10px] px-2.5 py-1 rounded">
                QUESTION {currentIndex + 1} OF {questions.length}
              </span>
              <div className="flex items-center gap-1 bg-[#D4AF37]/5 px-2.5 py-1 rounded border border-[#D4AF37]/15 text-[#D4AF37] font-bold font-mono">
                <Flame className="h-3.5 w-3.5 fill-[#D4AF37]" />
                <span>Streak: {streak}</span>
              </div>
            </div>

            {/* Glowing Points Panel */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[9px] font-bold text-[#8E9299] uppercase tracking-wider block">Score Points</span>
                <span className="text-white font-mono font-black text-base">{totalPoints} PTS</span>
              </div>

              {/* Circular Timer Clock */}
              <div className="relative h-12 w-12 flex items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="transparent"
                    stroke={timeLeft <= 3 ? "#EF4444" : timeLeft <= 6 ? "#F59E0B" : "#10B981"}
                    strokeWidth="3.5"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 - (125.6 * (timeLeft / secondsPerQuestion))}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className="text-white font-mono font-black text-sm z-10">
                  {timeLeft}s
                </span>
              </div>
            </div>
          </div>

          {/* Progress Micro bar */}
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-[#D4AF37] h-full transition-all duration-300"
              style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            />
          </div>

          {/* Core Question Card */}
          {questions[currentIndex] && (
            <div className="space-y-6 py-2">
              <div className="bg-[#0F0F12] border border-white/5 p-6 rounded-2xl text-center space-y-4 shadow-inner relative overflow-hidden">
                {/* Score Multiplier indicator */}
                {userAnswer === null && (
                  <div className="absolute top-3 right-4 flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Sparkles className="h-3 w-3" />
                    <span>Speed Bonus: +{timeLeft * 15} pts</span>
                  </div>
                )}

                <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono font-black bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-3 py-1 rounded-full uppercase tracking-wider w-fit mx-auto">
                  <span>Source: {questions[currentIndex].source} Content</span>
                </div>

                <h4 className="text-base md:text-lg font-serif font-semibold text-white leading-relaxed px-2">
                  {questions[currentIndex].questionText}
                </h4>

                {questions[currentIndex].context && (
                  <p className="text-xs text-[#8E9299] italic max-w-xl mx-auto leading-relaxed border-t border-white/5 pt-3">
                    "{questions[currentIndex].context}"
                  </p>
                )}

                {questions[currentIndex].arabicTranslation && (
                  <p className="text-xs text-[#E5C158] font-bold font-serif bg-[#D4AF37]/5 px-3 py-1.5 rounded-lg border border-[#D4AF37]/10 w-fit mx-auto" dir="rtl">
                    ترجمة / سياق: {questions[currentIndex].arabicTranslation}
                  </p>
                )}
              </div>

              {/* Multiple Choice Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {questions[currentIndex].options.map((option) => {
                  const isSelected = userAnswer === option;
                  const isCorrect = option.toLowerCase() === questions[currentIndex].correctAnswer.toLowerCase();
                  const hasAnswered = userAnswer !== null;

                  let cardStyle = "border-white/5 bg-[#0F0F12] text-slate-300 hover:bg-white/5 hover:border-white/10";
                  if (hasAnswered) {
                    if (isCorrect) {
                      cardStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500/20";
                    } else if (isSelected) {
                      cardStyle = "border-red-500 bg-red-500/10 text-red-400 ring-1 ring-red-500/20 animate-shake";
                    } else {
                      cardStyle = "border-white/5 bg-[#0F0F12]/40 text-slate-600 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelectAnswer(option)}
                      disabled={hasAnswered}
                      className={`flex items-center justify-between p-4.5 rounded-xl border text-left text-xs font-bold tracking-wide transition-all duration-150 cursor-pointer ${cardStyle}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className={`h-6 w-6 rounded-lg flex items-center justify-center font-mono text-xs border ${
                          isSelected ? "bg-white text-black" : "bg-white/5 border-white/10 text-[#8E9299]"
                        }`}>
                          {option.slice(0,1).toUpperCase() === option ? "✓" : "•"}
                        </span>
                        <span className="leading-snug">{option}</span>
                      </span>
                      {hasAnswered && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                      {hasAnswered && isSelected && !isCorrect && <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* TIMEOUT EXPIRED STATE */}
              {userAnswer === "TIMEOUT_EXPIRED" && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 max-w-xl mx-auto">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-bold">انتهى الوقت المسموح به! / Time's Up!</p>
                    <p className="text-[10px] text-[#8E9299]">
                      You ran out of time. The correct answer was: <strong className="text-white font-mono">"{questions[currentIndex].correctAnswer}"</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* Post-Answer Explanation Box */}
              {userAnswer !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/5 rounded-2xl p-4 max-w-2xl mx-auto space-y-1.5"
                >
                  <span className="font-bold text-[#8E9299] uppercase tracking-widest text-[9px] block">شرح تعليمي ميسر / Explanation & Usage</span>
                  <p className="text-white text-xs leading-relaxed font-mono">
                    {questions[currentIndex].explanation}
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {/* Footer Action area */}
          <div className="flex justify-between items-center border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={() => {
                if (confirm("Are you sure you want to exit the Speed Arena? Your progress will not be saved.")) {
                  setGameState("setup");
                  setUserAnswer(null);
                }
              }}
              className="px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition cursor-pointer"
            >
              Quit Arena Match
            </button>

            {userAnswer !== null && (
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#D4AF37] hover:brightness-110 text-black font-extrabold px-6 py-3 rounded-lg text-xs uppercase tracking-widest transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#D4AF37]/10"
              >
                <span>{currentIndex + 1 === questions.length ? "Finish Match" : "Next Round"}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* GAME OVER RESULTS SCREEN */}
      {gameState === "results" && (
        <div className="p-6 md:p-8 space-y-6" id="speed-quiz-results">
          <div className="text-center space-y-4 max-w-md mx-auto py-4">
            <div className="relative inline-block">
              <div className="h-20 w-20 rounded-full bg-[#D4AF37]/10 border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] mx-auto">
                <Trophy className="h-10 w-10 animate-pulse" />
              </div>
              {isNewHighScore && (
                <div className="absolute -top-1 -right-2 bg-emerald-500 text-white font-black text-[9px] font-mono px-2 py-0.5 rounded-full border border-[#141417] uppercase tracking-widest">
                  Record!
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-serif font-black text-white uppercase tracking-wider">
                Arena Match Concluded!
              </h3>
              <p className="text-xs text-[#E5C158] font-bold">
                {grade.title}
              </p>
              <p className="text-[11px] text-[#8E9299]">
                {grade.desc}
              </p>
            </div>
          </div>

          {/* Primary stats overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-[#0F0F12] border border-white/5 p-4 rounded-xl text-center">
              <span className="text-[9px] font-mono text-[#8E9299] uppercase tracking-widest block mb-1">Score Accuracy</span>
              <span className="text-xl font-serif font-black text-white">{score} / {questions.length}</span>
              <span className="text-[9px] text-[#8E9299] block mt-1">({accuracy}%)</span>
            </div>

            <div className="bg-[#0F0F12] border border-white/5 p-4 rounded-xl text-center">
              <span className="text-[9px] font-mono text-[#8E9299] uppercase tracking-widest block mb-1">Points Accumulated</span>
              <span className="text-xl font-serif font-black text-[#D4AF37]">{totalPoints} PTS</span>
              {isNewHighScore && <span className="text-[9px] text-emerald-400 block mt-1">★ New High Score!</span>}
            </div>

            <div className="bg-[#0F0F12] border border-white/5 p-4 rounded-xl text-center">
              <span className="text-[9px] font-mono text-[#8E9299] uppercase tracking-widest block mb-1">Max Streak</span>
              <span className="text-xl font-serif font-black text-orange-400">🔥 {maxStreak}</span>
              <span className="text-[9px] text-[#8E9299] block mt-1">consecutive correct</span>
            </div>

            <div className="bg-[#0F0F12] border border-white/5 p-4 rounded-xl text-center">
              <span className="text-[9px] font-mono text-[#8E9299] uppercase tracking-widest block mb-1">Avg Recall Speed</span>
              <span className="text-xl font-serif font-black text-emerald-400">{calculatedAvgSpeed}s</span>
              <span className="text-[9px] text-[#8E9299] block mt-1">per answer</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto pt-4">
            <button
              type="button"
              onClick={handleStartGame}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:brightness-110 text-black font-extrabold text-xs py-3.5 rounded-lg transition duration-200 uppercase tracking-wider cursor-pointer shadow-lg shadow-[#D4AF37]/10"
            >
              <RotateCcw className="h-4 w-4" />
              <span>أعد الكرة / Re-enter Arena</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setGameState("setup");
                setUserAnswer(null);
              }}
              className="w-full inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold text-xs py-3.5 rounded-lg transition duration-200 uppercase tracking-wider cursor-pointer"
            >
              <span>تغيير الإعدادات / Change Config</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-extrabold text-xs py-3.5 rounded-lg transition duration-200 uppercase tracking-wider cursor-pointer"
            >
              <span>إنهاء والرجوع / Exit</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
