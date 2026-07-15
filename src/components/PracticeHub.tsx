import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  Check, 
  X, 
  HelpCircle, 
  TrendingUp, 
  Award, 
  ChevronRight,
  BookOpen,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Plus,
  RefreshCw,
  Volume2,
  Brain,
  CheckCircle2,
  Trash2,
  ChevronLeft,
  Settings,
  Headphones,
  Clock,
  Sliders,
  Zap,
  PlusCircle,
  FolderPlus,
  ClipboardList,
  FileText,
  CheckCircle
} from "lucide-react";
import { CEFRLevel, SkillType, CEFRQuestion } from "../types";
import AudioPlayer from "./AudioPlayer";
import AudioLessons from "./AudioLessons";
import QuestionManagement from "./QuestionManagement";
import { FALLBACK_FLASHCARDS, FALLBACK_QUESTIONS } from "../data/fallbackPractice";
import confetti from "canvas-confetti";
import SpeedQuizArena from "./SpeedQuizArena";

interface PracticeHubProps {
  onIncrementPracticeCount: () => void;
  userLevel?: CEFRLevel | null;
  initialPreset?: {
    cefrLevel?: CEFRLevel;
    skillType?: SkillType;
    activeSubTab?: "generator" | "vocab" | "lessons";
  } | null;
  onClearPreset?: () => void;
}

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

export default function PracticeHub({ 
  onIncrementPracticeCount, 
  userLevel = null,
  initialPreset = null,
  onClearPreset
}: PracticeHubProps) {
  // Tabs: "generator" | "vocab" | "lessons" | "custom"
  const [activeSubTab, setActiveSubTab] = useState<"generator" | "vocab" | "lessons" | "custom">("generator");

  // State for Custom Generator (Tab 1)
  const [cefrLevel, setCefrLevel] = useState<CEFRLevel>("B1");
  const [skillType, setSkillType] = useState<SkillType>("Grammar");

  // Apply preset parameters if coming from recommendation click
  useEffect(() => {
    if (initialPreset) {
      if (initialPreset.cefrLevel) {
        setCefrLevel(initialPreset.cefrLevel);
      }
      if (initialPreset.skillType) {
        setSkillType(initialPreset.skillType);
      }
      if (initialPreset.activeSubTab) {
        setActiveSubTab(initialPreset.activeSubTab);
      }
      if (onClearPreset) {
        onClearPreset();
      }
    }
  }, [initialPreset, onClearPreset]);
  const [customTopic, setCustomTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState<CEFRQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // State for Vocabulary Deck (Tab 2)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [vocabLoading, setVocabLoading] = useState(false);
  const [vocabError, setVocabError] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Flashcard retrieval quiz states
  const [userQuizAnswer, setUserQuizAnswer] = useState("");
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [isQuizCorrect, setIsQuizCorrect] = useState<boolean | null>(null);

  // Profile assessments status count
  const [missedQuestionsCount, setMissedQuestionsCount] = useState(0);

  // Local storage lists
  const [masteredWords, setMasteredWords] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cefr_mastered_words") || "[]");
    } catch {
      return [];
    }
  });

  const [reviewDeck, setReviewDeck] = useState<Flashcard[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cefr_review_deck") || "[]");
    } catch {
      return [];
    }
  });

  const [showReviewDeckOnly, setShowReviewDeckOnly] = useState(false);

  // Sync review deck
  useEffect(() => {
    localStorage.setItem("cefr_review_deck", JSON.stringify(reviewDeck));
  }, [reviewDeck]);

  // Track speech playing to avoid overlap
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);

  // Spaced-Repetition System (SRS) States
  const [srsRecords, setSrsRecords] = useState<Record<string, {
    word: string;
    interval: number;
    repetition: number;
    easiness: number;
    dueDate: string;
    lastReviewed?: string;
  }>>(() => {
    try {
      return JSON.parse(localStorage.getItem("cefr_srs_records") || "{}");
    } catch {
      return {};
    }
  });

  const [srsFilter, setSrsFilter] = useState<"all" | "due" | "learning" | "new">("all");
  
  const [isSrsMinuteMode, setIsSrsMinuteMode] = useState<boolean>(() => {
    try {
      return JSON.parse(localStorage.getItem("cefr_srs_minute_mode") || "false");
    } catch {
      return false;
    }
  });

  // Check if sandbox mode is active
  const showSandboxControls = localStorage.getItem("lexicon_show_sandbox") === "true";

  // Quick Study Mode States
  const [isQuickStudyActive, setIsQuickStudyActive] = useState(false);
  const [isSpeedArenaActive, setIsSpeedArenaActive] = useState(false);
  const [quickStudyTimeLeft, setQuickStudyTimeLeft] = useState(120);
  const [quickStudyQuestions, setQuickStudyQuestions] = useState<any[]>([]);
  const [quickStudyIndex, setQuickStudyIndex] = useState(0);
  const [quickStudyScore, setQuickStudyScore] = useState(0);
  const [quickStudySelectedOption, setQuickStudySelectedOption] = useState<string | null>(null);
  const [quickStudyAnswers, setQuickStudyAnswers] = useState<Array<{ question: string; correct: string; user: string; isCorrect: boolean }>>([]);
  const [showQuickStudyResults, setShowQuickStudyResults] = useState(false);

  // Sync SRS states
  useEffect(() => {
    localStorage.setItem("cefr_srs_records", JSON.stringify(srsRecords));
  }, [srsRecords]);

  useEffect(() => {
    localStorage.setItem("cefr_srs_minute_mode", JSON.stringify(isSrsMinuteMode));
  }, [isSrsMinuteMode]);

  // Custom Questions State & Form managers
  const [customQuestions, setCustomQuestions] = useState<CEFRQuestion[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("lexicon_custom_questions") || "[]");
    } catch {
      return [];
    }
  });

  // Sync custom questions to localStorage
  useEffect(() => {
    localStorage.setItem("lexicon_custom_questions", JSON.stringify(customQuestions));
  }, [customQuestions]);

  const handleReloadQuestions = () => {
    try {
      setCustomQuestions(JSON.parse(localStorage.getItem("lexicon_custom_questions") || "[]"));
    } catch {}
  };

  // Question Source State
  const [questionSource, setQuestionSource] = useState<"ai" | "custom">("ai");

  // Quick Study Timer Effect
  useEffect(() => {
    let timerId: any = null;
    if (isQuickStudyActive && quickStudyTimeLeft > 0 && !showQuickStudyResults) {
      timerId = setInterval(() => {
        setQuickStudyTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerId);
            setShowQuickStudyResults(true);
            setIsQuickStudyActive(false);
            // Reward Speed Demon if they answered at least 5 correctly
            if (quickStudyScore >= 5) {
              localStorage.setItem("lexicon_badge_speed_demon", "true");
              confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#D4AF37", "#AA7C11", "#FFFFFF"]
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isQuickStudyActive, quickStudyTimeLeft, showQuickStudyResults, quickStudyScore]);

  // Compute active filtered deck based on chosen tab and spaced-repetition stage
  const activeDeck = React.useMemo(() => {
    const baseDeck = showReviewDeckOnly ? reviewDeck : flashcards;
    
    return baseDeck.filter(card => {
      const lowercaseWord = card.word.toLowerCase();
      const record = srsRecords[lowercaseWord];
      
      const isDue = !record || new Date(record.dueDate).getTime() <= Date.now();
      const isNew = !record;
      const isLearning = record && record.repetition < 3;
      const isReview = record && record.repetition >= 3;

      if (srsFilter === "all") return true;
      if (srsFilter === "due") return isDue;
      if (srsFilter === "learning") return isLearning;
      if (srsFilter === "new") return isNew;
      return true;
    });
  }, [showReviewDeckOnly, reviewDeck, flashcards, srsFilter, srsRecords]);

  // Deck status aggregates for stats displays
  const deckStats = React.useMemo(() => {
    const baseDeck = showReviewDeckOnly ? reviewDeck : flashcards;
    let dueCount = 0;
    let learningCount = 0;
    let newCount = 0;
    let reviewCount = 0;

    baseDeck.forEach(card => {
      const record = srsRecords[card.word.toLowerCase()];
      if (!record) {
        dueCount++;
        newCount++;
      } else {
        const isDue = new Date(record.dueDate).getTime() <= Date.now();
        if (isDue) dueCount++;
        if (record.repetition < 3) {
          learningCount++;
        } else {
          reviewCount++;
        }
      }
    });

    return {
      dueCount,
      learningCount,
      newCount,
      reviewCount,
      totalCount: baseDeck.length
    };
  }, [showReviewDeckOnly, reviewDeck, flashcards, srsRecords]);

  const currentFlashcard = activeDeck[currentCardIndex];
  const isCurrentCardMastered = currentFlashcard ? masteredWords.includes(currentFlashcard.word) : false;

  // Quick Study handlers
  const handleStartQuickStudy = () => {
    const sourceDeck = flashcards.length >= 4 ? flashcards : (FALLBACK_FLASHCARDS[cefrLevel] || FALLBACK_FLASHCARDS["A0"]);
    if (!sourceDeck || sourceDeck.length === 0) return;

    const quizQuestions: any[] = [];
    const shuffledCards = [...sourceDeck].sort(() => 0.5 - Math.random());
    const numQuestions = Math.min(10, shuffledCards.length);

    for (let i = 0; i < numQuestions; i++) {
      const card = shuffledCards[i];
      const correctWord = card.quiz_answer || card.word;
      
      const otherWords = sourceDeck
        .filter(c => (c.quiz_answer || c.word).toLowerCase() !== correctWord.toLowerCase())
        .map(c => c.quiz_answer || c.word);
        
      const distractors = [...new Set(otherWords)].sort(() => 0.5 - Math.random()).slice(0, 3);
      
      while (distractors.length < 3) {
        const fallbackOptions = ["comprehend", "evaluate", "synthesize", "acquire", "proficiency", "structure", "advanced", "vocabulary"];
        const extra = fallbackOptions.filter(w => w.toLowerCase() !== correctWord.toLowerCase() && !distractors.includes(w))[0];
        if (extra) distractors.push(extra);
        else distractors.push("option_" + distractors.length);
      }
      
      const options = [correctWord, ...distractors].sort(() => 0.5 - Math.random());
      
      quizQuestions.push({
        card,
        questionText: card.quiz_question || `Which word is defined as: "${card.definition}"?`,
        correctAnswer: correctWord,
        options,
        arabicTranslation: card.arabic_translation
      });
    }

    setQuickStudyQuestions(quizQuestions);
    setQuickStudyIndex(0);
    setQuickStudyScore(0);
    setQuickStudySelectedOption(null);
    setQuickStudyAnswers([]);
    setQuickStudyTimeLeft(120);
    setIsQuickStudyActive(true);
    setShowQuickStudyResults(false);
  };

  const handleAnswerQuickStudy = (selected: string) => {
    if (quickStudySelectedOption !== null) return;
    setQuickStudySelectedOption(selected);
    const currentQ = quickStudyQuestions[quickStudyIndex];
    const isCorrect = selected.toLowerCase() === currentQ.correctAnswer.toLowerCase();
    
    if (isCorrect) {
      setQuickStudyScore(prev => prev + 1);
    }
    
    setQuickStudyAnswers(prev => [
      ...prev,
      {
        question: currentQ.questionText,
        correct: currentQ.correctAnswer,
        user: selected,
        isCorrect
      }
    ]);
  };

  const handleNextQuickStudy = () => {
    setQuickStudySelectedOption(null);
    if (quickStudyIndex + 1 < quickStudyQuestions.length) {
      setQuickStudyIndex(prev => prev + 1);
    } else {
      setShowQuickStudyResults(true);
      setIsQuickStudyActive(false);
      // Reward Speed Demon Badge if scored >= 5 out of 10
      const passed = quickStudyScore >= 5 || (quickStudyIndex + 1 >= 5 && quickStudyScore >= 4);
      if (passed) {
        localStorage.setItem("lexicon_badge_speed_demon", "true");
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#D4AF37", "#AA7C11", "#FFFFFF", "#FFD700"]
        });
      }
    }
  };

  const toggleReviewDeck = (card: Flashcard) => {
    const isExist = reviewDeck.some(item => item.word.toLowerCase() === card.word.toLowerCase());
    let updatedDeck = [...reviewDeck];
    if (isExist) {
      updatedDeck = reviewDeck.filter(item => item.word.toLowerCase() !== card.word.toLowerCase());
      setReviewDeck(updatedDeck);
      if (showReviewDeckOnly) {
        if (currentCardIndex >= updatedDeck.length && updatedDeck.length > 0) {
          setCurrentCardIndex(updatedDeck.length - 1);
        }
      }
    } else {
      updatedDeck = [...reviewDeck, card];
      setReviewDeck(updatedDeck);
    }
  };

  // Reset indices on deck/filter/level switches to prevent out of bounds crashes
  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setUserQuizAnswer("");
    setIsQuizSubmitted(false);
    setIsQuizCorrect(null);
  }, [srsFilter, showReviewDeckOnly, cefrLevel, flashcards.length]);

  // Calculate potential next intervals for preview on rating buttons
  const getNextIntervals = (word: string) => {
    const lowercaseWord = word.toLowerCase();
    const record = srsRecords[lowercaseWord] || {
      word: lowercaseWord,
      interval: 0,
      repetition: 0,
      easiness: 2.5,
      dueDate: new Date().toISOString()
    };

    const rep = record.repetition;
    const prevInterval = record.interval;
    const easiness = record.easiness;

    const unit = isSrsMinuteMode ? "m" : "d";

    // Again
    const againInterval = 1;

    // Hard
    const hardRep = rep + 1;
    const hardInterval = hardRep === 1 ? 1 : hardRep === 2 ? 2 : Math.ceil(prevInterval * 1.2);

    // Good
    const goodRep = rep + 1;
    const goodInterval = goodRep === 1 ? 1 : goodRep === 2 ? 4 : Math.ceil(prevInterval * easiness);

    // Easy
    const easyRep = rep + 1;
    const easyInterval = easyRep === 1 ? 2 : easyRep === 2 ? 6 : Math.ceil(prevInterval * easiness * 1.3);

    return {
      again: `${againInterval}${unit}`,
      hard: `${hardInterval}${unit}`,
      good: `${goodInterval}${unit}`,
      easy: `${easyInterval}${unit}`
    };
  };

  // Perform SRS repetition quality scoring (SM-2 Spaced-Repetition System)
  const handleRateSrs = (word: string, rating: "again" | "hard" | "good" | "easy") => {
    const lowercaseWord = word.toLowerCase();
    const record = srsRecords[lowercaseWord] || {
      word: lowercaseWord,
      interval: 0,
      repetition: 0,
      easiness: 2.5,
      dueDate: new Date().toISOString()
    };

    let nextRep = record.repetition;
    let nextInterval = record.interval;
    let nextEasiness = record.easiness;

    if (rating === "again") {
      nextRep = 0;
      nextInterval = 1; // 1 day or 1 min
      nextEasiness = Math.max(1.3, record.easiness - 0.2);
    } else if (rating === "hard") {
      nextRep += 1;
      nextInterval = nextRep === 1 ? 1 : nextRep === 2 ? 2 : Math.ceil(record.interval * 1.2);
      nextEasiness = Math.max(1.3, record.easiness - 0.15);
    } else if (rating === "good") {
      nextRep += 1;
      nextInterval = nextRep === 1 ? 1 : nextRep === 2 ? 4 : Math.ceil(record.interval * record.easiness);
    } else if (rating === "easy") {
      nextRep += 1;
      nextInterval = nextRep === 1 ? 2 : nextRep === 2 ? 6 : Math.ceil(record.interval * record.easiness * 1.3);
      nextEasiness = record.easiness + 0.15;
    }

    // Calculate new due date
    const now = new Date();
    const multiplier = isSrsMinuteMode ? 60 * 1000 : 24 * 60 * 60 * 1000;
    const dueDate = new Date(now.getTime() + nextInterval * multiplier).toISOString();

    const updatedRecord = {
      word: lowercaseWord,
      interval: nextInterval,
      repetition: nextRep,
      easiness: nextEasiness,
      dueDate,
      lastReviewed: now.toISOString()
    };

    setSrsRecords(prev => ({
      ...prev,
      [lowercaseWord]: updatedRecord
    }));

    // If rated Easy, auto-mark as mastered!
    if (rating === "easy" && !masteredWords.includes(word)) {
      setMasteredWords(prev => [...prev, word]);
    }

    // Proceed to next card automatically if possible with a nice transition
    if (currentCardIndex < activeDeck.length - 1) {
      setTimeout(() => {
        handleNextCard();
      }, 150);
    }
  };

  // Helper to get status details on the front of the card
  const getSrsBadge = (word: string) => {
    const record = srsRecords[word.toLowerCase()];
    if (!record) {
      return {
        label: "New",
        style: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        tooltip: "This card hasn't been reviewed yet in the Spaced-Repetition System."
      };
    }
    
    const isDue = new Date(record.dueDate).getTime() <= Date.now();
    if (isDue) {
      return {
        label: "Due Now",
        style: "bg-red-500/15 text-red-400 border-red-500/30 animate-pulse",
        tooltip: "This card is scheduled for review now based on spaced repetition."
      };
    }

    if (record.repetition < 3) {
      return {
        label: `Learning (Streak: ${record.repetition})`,
        style: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        tooltip: "This card is in the learning stage. Review often."
      };
    }

    return {
      label: `Review (Streak: ${record.repetition})`,
      style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      tooltip: "This card is in the review stage. Long review intervals apply."
    };
  };

  // Sync cefrLevel with userLevel prop if available
  useEffect(() => {
    if (userLevel) {
      setCefrLevel(userLevel);
    }
  }, [userLevel]);

  // Load and count missed questions on render
  useEffect(() => {
    try {
      const storedLevel = localStorage.getItem("cefr_user_level");
      if (storedLevel) setCefrLevel(storedLevel as CEFRLevel);
    } catch (e) {
      console.error("Failed to load user level:", e);
    }

    try {
      const existingMissed = JSON.parse(localStorage.getItem("cefr_missed_questions") || "[]");
      setMissedQuestionsCount(Array.isArray(existingMissed) ? existingMissed.length : 0);
    } catch (e) {
      console.error("Failed to load assessments status:", e);
      setMissedQuestionsCount(0);
    }
  }, [activeSubTab]);

  // Load initial fallback question or update preview on level/skill change
  useEffect(() => {
    const defaultQ = FALLBACK_QUESTIONS[cefrLevel]?.[skillType];
    if (defaultQ) {
      setQuestion(defaultQ);
      setSelectedOption(null);
      setIsAnswered(false);
      setError(null);
    }
  }, [cefrLevel, skillType]);

  // Sync mastered words
  useEffect(() => {
    localStorage.setItem("cefr_mastered_words", JSON.stringify(masteredWords));
  }, [masteredWords]);

  // Fetch flashcards from server
  const fetchFlashcards = async (forceCurated = false) => {
    setVocabLoading(true);
    setVocabError(null);
    setIsFlipped(false);
    setUserQuizAnswer("");
    setIsQuizSubmitted(false);
    setIsQuizCorrect(null);
    setShowReviewDeckOnly(false);

    try {
      let missedQuestionsToSend = [];
      if (!forceCurated) {
        try {
          missedQuestionsToSend = JSON.parse(localStorage.getItem("cefr_missed_questions") || "[]");
          if (!Array.isArray(missedQuestionsToSend)) {
            missedQuestionsToSend = [];
          }
        } catch (e) {
          console.error("Failed to parse cefr_missed_questions:", e);
          missedQuestionsToSend = [];
        }
      }

      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missedQuestions: missedQuestionsToSend,
          cefrLevel: cefrLevel // Selected fallback CEFR level
        })
      });

      if (!response.ok) {
        throw new Error("Unable to contact vocabulary engine. Please check your network and try again.");
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Invalid response format received. Please retry.");
      }

      setFlashcards(data);
      setCurrentCardIndex(0);
    } catch (err: any) {
      console.error("Error fetching flashcards:", err);
      // Fallback to offline cards on error!
      const fallbackCards = FALLBACK_FLASHCARDS[cefrLevel];
      if (fallbackCards) {
        setFlashcards(fallbackCards);
        setCurrentCardIndex(0);
      }
      setVocabError(err.message || "Failed to retrieve fresh flashcards. Utilizing local fallback deck.");
    } finally {
      setVocabLoading(false);
    }
  };

  // Trigger flashcards load automatically when switching to Vocab tab if empty
  useEffect(() => {
    if (activeSubTab === "vocab" && flashcards.length === 0) {
      const fallbackCards = FALLBACK_FLASHCARDS[cefrLevel];
      if (fallbackCards) {
        setFlashcards(fallbackCards);
        setCurrentCardIndex(0);
      }
    }
  }, [activeSubTab, cefrLevel, flashcards.length]);

  // Keyboard Shortcut Support for Practice Hub (A/B/C/D to select, Enter to confirm/next, Space/Enter to flip, Left/Right arrows to navigate cards)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        (activeElement as HTMLElement).isContentEditable
      );
      if (isTyping) return;

      if (activeSubTab === "generator") {
        if (!isAnswered && question) {
          const key = e.key.toUpperCase();
          if (key === "A" || key === "B" || key === "C" || key === "D") {
            e.preventDefault();
            setSelectedOption(key as "A" | "B" | "C" | "D");
          }
        }
      } else if (activeSubTab === "vocab" && flashcards.length > 0) {
        if (e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          setIsFlipped(prev => !prev);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          handlePrevCard();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          handleNextCard();
        }
      }
    };

    const handleCustomEnter = (e: Event) => {
      const customEvent = e as CustomEvent;
      const isTyping = customEvent.detail?.isTyping;
      if (isTyping) return;

      if (activeSubTab === "generator" && question) {
        if (!isAnswered) {
          if (selectedOption) {
            handleSubmitAnswer();
          }
        } else {
          handleGenerate();
        }
      } else if (activeSubTab === "vocab" && flashcards.length > 0) {
        // Toggle flip on enter key if not typing
        setIsFlipped(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("app-keyboard-enter", handleCustomEnter);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("app-keyboard-enter", handleCustomEnter);
    };
  }, [activeSubTab, flashcards, currentCardIndex, isAnswered, question, selectedOption, cefrLevel, skillType, customTopic]);

  // Clear missed questions database helper
  const handleClearMissedHistory = () => {
    if (window.confirm("Are you sure you want to clear your local missed assessment questions?")) {
      localStorage.removeItem("cefr_missed_questions");
      setMissedQuestionsCount(0);
      fetchFlashcards(true); // reload fresh curated list for their level
    }
  };

  // Speaks the vocabulary word using browser SpeechSynthesis
  const speakWord = (word: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    
    // Stop any existing speaking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.85; // Slightly slower for learner clarity

    utterance.onstart = () => setSpeakingWord(word);
    utterance.onend = () => setSpeakingWord(null);
    utterance.onerror = () => setSpeakingWord(null);

    window.speechSynthesis.speak(utterance);
  };

  // Toggle vocabulary item as mastered
  const toggleMastered = (word: string) => {
    if (masteredWords.includes(word)) {
      setMasteredWords(masteredWords.filter(w => w !== word));
    } else {
      setMasteredWords([...masteredWords, word]);
    }
  };

  // Check gap-fill quiz answer
  const handleCheckQuizAnswer = (correctAnswer: string) => {
    if (!userQuizAnswer.trim()) return;

    // Standardize comparison (lowercase, strip trailing dots/punctuation)
    const cleanUser = userQuizAnswer.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    const cleanCorrect = correctAnswer.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

    const correct = cleanUser === cleanCorrect || cleanCorrect.includes(cleanUser) && cleanUser.length >= 3;
    setIsQuizCorrect(correct);
    setIsQuizSubmitted(true);
  };

  // Next card handler
  const handleNextCard = () => {
    if (currentCardIndex < activeDeck.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
      setUserQuizAnswer("");
      setIsQuizSubmitted(false);
      setIsQuizCorrect(null);
    }
  };

  // Previous card handler
  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
      setUserQuizAnswer("");
      setIsQuizSubmitted(false);
      setIsQuizCorrect(null);
    }
  };

  // Dynamic Generator Handlers (Tab 1)
  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setQuestion(null);
    setSelectedOption(null);
    setIsAnswered(false);

    if (questionSource === "custom") {
      const filtered = customQuestions.filter(
        q => q.cefr_level === cefrLevel && q.skill_type === skillType
      );

      if (filtered.length === 0) {
        setError(`لم يتم العثور على أسئلة مخصصة لمستوى ${cefrLevel} ومهارة ${skillType}. يرجى إضافتها أولاً من تبويب "الأسئلة المخصصة". / No custom questions found for level ${cefrLevel} and skill ${skillType}. Please add them first in the "Custom Questions" tab.`);
        setIsLoading(false);
        return;
      }

      const randomQ = filtered[Math.floor(Math.random() * filtered.length)];
      
      setTimeout(() => {
        setQuestion(randomQ);
        onIncrementPracticeCount();
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const response = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cefrLevel,
          skillType,
          topic: customTopic.trim() || undefined
        })
      });

      if (!response.ok) {
        throw new Error("Unable to contact dynamic generator. Please try again.");
      }

      const qData: CEFRQuestion = await response.json();
      setQuestion(qData);
      onIncrementPracticeCount();
    } catch (err: any) {
      console.error(err);
      // Fallback to offline question on error!
      const defaultQ = FALLBACK_QUESTIONS[cefrLevel]?.[skillType];
      if (defaultQ) {
        setQuestion(defaultQ);
      }
      setError(err.message || "Dynamic generation failed. Utilizing local fallback question.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || !question) return;
    setIsAnswered(true);

    // If answer is incorrect, save it dynamically to missed questions pool!
    if (selectedOption !== question.correct_option) {
      try {
        const existingMissed = JSON.parse(localStorage.getItem("cefr_missed_questions") || "[]");
        if (!existingMissed.some((q: any) => q.question_text === question.question_text)) {
          const updated = [question, ...existingMissed];
          localStorage.setItem("cefr_missed_questions", JSON.stringify(updated.slice(0, 40)));
          setMissedQuestionsCount(updated.length);
        }
      } catch (e) {
        console.error("Failed to update missed questions from practice generator:", e);
      }
    }
  };

  const handlePracticeCustomQuestion = (q: CEFRQuestion) => {
    setCefrLevel(q.cefr_level);
    setSkillType(q.skill_type);
    setQuestionSource("custom");
    setQuestion(q);
    setSelectedOption(null);
    setIsAnswered(false);
    setError(null);
    setActiveSubTab("generator");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-[#E0E0E0]" id="practice-hub-tab">
      
      {/* CSS 3D Flipping Styles injection */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Sub Tab Navigation */}
      <div className="flex border-b border-white/10 text-xs font-bold uppercase tracking-wider gap-2 flex-wrap">
        <button
          onClick={() => setActiveSubTab("generator")}
          className={`px-4 py-3 border-b-2 transition duration-150 cursor-pointer flex items-center gap-2 ${
            activeSubTab === "generator" 
              ? "border-[#D4AF37] text-white" 
              : "border-transparent text-[#8E9299] hover:text-white"
          }`}
          id="practice-subtab-generator"
        >
          <Sparkles className="h-4 w-4 text-[#D4AF37]" />
          <span>Dynamic Item Generator</span>
        </button>
        <button
          onClick={() => setActiveSubTab("vocab")}
          className={`px-4 py-3 border-b-2 transition duration-150 cursor-pointer flex items-center gap-2 ${
            activeSubTab === "vocab" 
              ? "border-[#D4AF37] text-white" 
              : "border-transparent text-[#8E9299] hover:text-white"
          }`}
          id="practice-subtab-vocab"
        >
          <Brain className="h-4 w-4 text-[#D4AF37]" />
          <span>Vocabulary Practice Deck</span>
          {missedQuestionsCount > 0 && (
            <span className="bg-[#D4AF37] text-black rounded-full h-4.5 min-w-4.5 px-1 flex items-center justify-center font-mono text-[9px] font-extrabold animate-pulse">
              {missedQuestionsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab("lessons")}
          className={`px-4 py-3 border-b-2 transition duration-150 cursor-pointer flex items-center gap-2 ${
            activeSubTab === "lessons" 
              ? "border-[#D4AF37] text-white" 
              : "border-transparent text-[#8E9299] hover:text-white"
          }`}
          id="practice-subtab-lessons"
        >
          <Headphones className="h-4 w-4 text-[#D4AF37]" />
          <span>CEFR Audio Classroom</span>
          <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-[#D4AF37]/25 uppercase tracking-wider">NEW</span>
        </button>
        <button
          onClick={() => setActiveSubTab("custom")}
          className={`px-4 py-3 border-b-2 transition duration-150 cursor-pointer flex items-center gap-2 ${
            activeSubTab === "custom" 
              ? "border-[#D4AF37] text-white" 
              : "border-transparent text-[#8E9299] hover:text-white"
          }`}
          id="practice-subtab-custom"
        >
          <FolderPlus className="h-4 w-4 text-[#D4AF37]" />
          <span>الأسئلة المخصصة / Custom Questions</span>
          {customQuestions.length > 0 && (
            <span className="bg-emerald-500/25 text-emerald-400 border border-emerald-500/35 rounded-full px-1.5 py-0.5 font-mono text-[8px] font-extrabold">
              {customQuestions.length}
            </span>
          )}
        </button>
      </div>

      {activeSubTab === "generator" && (
        <>
          {/* Configuration Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141417] rounded-xl border border-white/5 p-6 shadow-2xl space-y-6"
            id="practice-config-card"
          >
            <div>
              <h2 className="text-xl font-serif text-white uppercase tracking-wider">Practice Hub & Custom Generator</h2>
              <p className="text-[#8E9299] text-xs">Generate custom multiple-choice training tasks mapped to specific CEFR milestones and real-world themes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              {/* Level selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#8E9299] uppercase tracking-widest text-[10px]">Target CEFR Level</label>
                <select
                  value={cefrLevel}
                  id="practice-cefr-level-select"
                  onChange={(e) => setCefrLevel(e.target.value as CEFRLevel)}
                  className="w-full px-3 py-2.5 bg-[#0F0F12] border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs text-[#E0E0E0]"
                >
                  <option value="A0">A0 - Pre-A1 / Complete Beginner</option>
                  <option value="A1">A1 - Breakthrough / Beginner</option>
                  <option value="A2">A2 - Waystage / Elementary</option>
                  <option value="B1">B1 - Threshold / Intermediate</option>
                  <option value="B2">B2 - Vantage / Upper-Intermediate</option>
                  <option value="C1">C1 - Effective Operational Proficiency / Advanced</option>
                  <option value="C2">C2 - Mastery / Proficient</option>
                </select>
              </div>

              {/* Skill Type Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#8E9299] uppercase tracking-widest text-[10px]">Target Language Competency</label>
                <select
                  value={skillType}
                  id="practice-skill-select"
                  onChange={(e) => setSkillType(e.target.value as SkillType)}
                  className="w-full px-3 py-2.5 bg-[#0F0F12] border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs text-[#E0E0E0]"
                >
                  <option value="Grammar">Grammar / Syntax Accuracy</option>
                  <option value="Vocabulary">Vocabulary / Lexical Depth</option>
                  <option value="Reading">Reading / Text Comprehension</option>
                  <option value="Listening">Listening / Dialogue Dynamics</option>
                  <option value="Speaking">Speaking / Sociolinguistic Appropriateness</option>
                  <option value="Writing">Writing / Functional Paragraphs</option>
                </select>
              </div>

              {/* Custom Theme Topic */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#8E9299] uppercase tracking-widest text-[10px]">Theme / Context (Optional)</label>
                <input
                  type="text"
                  id="practice-topic-input"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Booking a taxi, Job negotiation"
                  className="w-full px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs text-[#E0E0E0] placeholder-[#8E9299]/30"
                />
              </div>

            </div>

            {/* Question Source Selection */}
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-wider block">مصدر الأسئلة / Question Source</span>
                <span className="text-[9px] text-[#8E9299]">
                  اختر المولد الذكي بالذكاء الاصطناعي أو تدرب على الأسئلة التي أدخلتها يدوياً.
                </span>
              </div>
              <div className="flex bg-[#0F0F12] p-1 rounded-xl border border-white/5 gap-1 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setQuestionSource("ai")}
                  className={`px-3.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    questionSource === "ai"
                      ? "bg-[#D4AF37] text-black shadow-md font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Generator / المولد الذكي</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuestionSource("custom")}
                  className={`px-3.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    questionSource === "custom"
                      ? "bg-emerald-500 text-white shadow-md font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                  <span>My Questions ({customQuestions.filter(q => q.cefr_level === cefrLevel).length}) / أسئلتي المخصصة</span>
                </button>
              </div>
            </div>

            {/* Generate action */}
            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                id="generate-practice-btn"
                onClick={handleGenerate}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 bg-[#D4AF37] hover:brightness-110 text-black font-extrabold text-[10px] px-6 py-3.5 rounded-lg transition duration-200 shadow-lg shadow-[#D4AF37]/20 cursor-pointer disabled:opacity-30 uppercase tracking-widest"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Materializing Item...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-black" /> Generate Practice Item
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Loading Screen */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center bg-[#141417] rounded-xl border border-white/5 p-6 shadow-2xl">
              <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin" />
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-sm font-serif text-white uppercase tracking-wider">Drafting authentic language materials</h3>
                <p className="text-[11px] text-[#8E9299] leading-relaxed">
                  Synthesizing custom {cefrLevel} {skillType} scenario targeting realistic functional descriptors...
                </p>
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && !isLoading && (
            <div className="bg-red-950/20 border border-red-500/20 text-red-400 p-4 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Active Practice Question Interface */}
          {question && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
              id="practice-question-card"
            >
              {/* Header */}
              <div className="bg-[#141417] rounded-xl border border-white/5 p-4 shadow-2xl flex items-center justify-between text-xs text-[#8E9299]">
                <span className="font-serif font-bold text-white uppercase tracking-wider text-[11px]">Dynamic Practice Session</span>
                <div className="flex items-center gap-3">
                  <span className="font-serif font-extrabold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded border border-[#D4AF37]/20 uppercase tracking-wider text-[10px]">{question.cefr_level}</span>
                  <span className="font-semibold text-[#8E9299] bg-white/5 px-2 py-1 rounded uppercase border border-white/10 text-[10px] tracking-wider">{question.skill_type}</span>
                </div>
              </div>

              {/* Active Question Body */}
              <div className="bg-[#141417] rounded-xl border border-white/5 p-6 shadow-2xl space-y-6">
                
                {/* Can-do */}
                <div className="pb-3 border-b border-white/5 flex items-start gap-2 text-xs text-[#8E9299]">
                  <BookmarkCheck className="h-4.5 w-4.5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-serif font-bold text-white uppercase tracking-wider text-[10px]">CEFR Target Competency: </span>
                    <span className="leading-relaxed">{question.can_do_statement}</span>
                  </div>
                </div>

                {/* Context scenario */}
                <div className="bg-[#0F0F12] p-5 rounded border border-white/5 space-y-1">
                  <span className="text-[9px] font-bold text-[#8E9299] uppercase tracking-widest block">Context / Scenario Dialogue</span>
                  <p className="text-[#E0E0E0] text-xs md:text-sm leading-relaxed font-medium italic whitespace-pre-line">
                    "{question.context_scenario}"
                  </p>
                </div>

                {/* Audio Player for Scenario Dialogue */}
                <AudioPlayer 
                  textToSpeak={question.context_scenario}
                  title={`${question.cefr_level} Dialogue / Scenario Clip`}
                  id="dialogue-audio-player"
                />

                {/* Question Text */}
                <h3 className="text-base font-serif text-white tracking-wide leading-snug">
                  {question.question_text}
                </h3>

                {/* Multiple choices */}
                <div className="grid grid-cols-1 gap-3 text-xs md:text-sm">
                  {(Object.keys(question.options) as Array<"A" | "B" | "C" | "D">).map((key) => {
                    const optText = question.options[key];
                    const isSelected = selectedOption === key;
                    const isCorrectOpt = question.correct_option === key;

                    let btnStyle = "border-white/10 hover:border-white/20 hover:bg-white/5 text-[#8E9299]";
                    let textStyle = "text-[#8E9299] font-medium";
                    let badgeStyle = "bg-white/5 text-[#8E9299] border border-white/10";

                    if (isAnswered) {
                      if (isCorrectOpt) {
                        btnStyle = "border-emerald-500 bg-emerald-500/10";
                        textStyle = "text-emerald-400 font-bold";
                        badgeStyle = "bg-emerald-500 text-black";
                      } else if (isSelected) {
                        btnStyle = "border-red-500 bg-red-500/10";
                        textStyle = "text-red-400 font-medium";
                        badgeStyle = "bg-red-500 text-white";
                      } else {
                        btnStyle = "border-white/5 opacity-40";
                      }
                    } else if (isSelected) {
                      btnStyle = "border-[#D4AF37] bg-[#D4AF37]/10 ring-1 ring-[#D4AF37]";
                      textStyle = "text-white font-bold";
                      badgeStyle = "bg-[#D4AF37] text-black";
                    }

                    return (
                      <button
                        key={key}
                        disabled={isAnswered}
                        onClick={() => setSelectedOption(key)}
                        className={`flex items-center justify-between text-left p-4 rounded-lg border transition duration-200 cursor-pointer w-full disabled:cursor-default ${btnStyle}`}
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

                {/* Explanation box */}
                <AnimatePresence>
                  {isAnswered && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-[#D4AF37]/5 border border-[#D4AF37]/15 rounded-lg p-5 space-y-2 text-xs"
                    >
                      <div className="font-serif font-bold text-[#D4AF37] flex items-center gap-1 text-[11px] uppercase tracking-wider">
                        <Sparkles className="h-4 w-4" /> Pedagogical Rationale
                      </div>
                      <p className="text-[#8E9299] leading-relaxed whitespace-pre-line">
                        {question.pedagogical_explanation}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action controls */}
                <div className="flex justify-end pt-2 border-t border-white/5">
                  {!isAnswered ? (
                    <button
                      id="submit-practice-answer-btn"
                      disabled={!selectedOption}
                      onClick={handleSubmitAnswer}
                      className="bg-[#D4AF37] text-black font-extrabold text-[10px] px-5 py-3 rounded-lg transition duration-200 shadow-lg shadow-[#D4AF37]/20 disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1.5 cursor-pointer uppercase tracking-widest"
                    >
                      Confirm Answer
                    </button>
                  ) : (
                    <button
                      id="practice-retry-btn"
                      onClick={handleGenerate}
                      className="bg-[#D4AF37] text-black hover:brightness-110 font-extrabold px-5 py-3 rounded-lg text-[10px] transition duration-200 inline-flex items-center gap-1.5 cursor-pointer uppercase tracking-widest shadow-lg shadow-[#D4AF37]/20"
                    >
                      Generate Another Item <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </>
      )}

      {activeSubTab === "vocab" && isQuickStudyActive && !showQuickStudyResults && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
          id="quick-study-arena"
        >
          <div className="bg-[#141417] rounded-xl border border-[#D4AF37]/30 p-6 shadow-2xl space-y-6 relative overflow-hidden text-left">
            {/* Gold border/glow effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-300" />
            
            {/* Header with timer */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#D4AF37]/15 rounded-lg border border-[#D4AF37]/30">
                  <Zap className="h-5 w-5 text-[#D4AF37] animate-pulse" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-serif font-black text-white uppercase tracking-wider">
                    Vocabulary Quick Study
                  </h4>
                  <p className="text-[10px] text-[#8E9299] uppercase tracking-widest font-mono">
                    Question {quickStudyIndex + 1} of {quickStudyQuestions.length}
                  </p>
                </div>
              </div>
              
              {/* Timer Clock */}
              <div className="flex items-center gap-2 bg-[#D4AF37]/10 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/30">
                <Clock className="h-4 w-4 text-[#D4AF37]" />
                <span className="text-xs font-mono font-black text-white">
                  {Math.floor(quickStudyTimeLeft / 60)}:{(quickStudyTimeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-[#D4AF37] h-full transition-all duration-300"
                style={{ width: `${((quickStudyIndex) / quickStudyQuestions.length) * 100}%` }}
              />
            </div>

            {/* Question Body */}
            {quickStudyQuestions[quickStudyIndex] && (
              <div className="space-y-6 py-4">
                <div className="text-center space-y-3">
                  <span className="text-[9px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Fill the Blank
                  </span>
                  <h3 className="text-lg font-serif font-medium text-white leading-relaxed px-4">
                    {quickStudyQuestions[quickStudyIndex].questionText}
                  </h3>
                  {quickStudyQuestions[quickStudyIndex].arabicTranslation && (
                    <p className="text-xs text-[#E5C158] font-bold font-serif" dir="rtl">
                      مساعدة: {quickStudyQuestions[quickStudyIndex].arabicTranslation}
                    </p>
                  )}
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-xl mx-auto pt-2">
                  {quickStudyQuestions[quickStudyIndex].options.map((option: string) => {
                    const isSelected = quickStudySelectedOption === option;
                    const isCorrect = option.toLowerCase() === quickStudyQuestions[quickStudyIndex].correctAnswer.toLowerCase();
                    const hasAnswered = quickStudySelectedOption !== null;
                    
                    let optionStyle = "border-white/5 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10 hover:border-[#D4AF37]/20";
                    if (hasAnswered) {
                      if (isCorrect) {
                        optionStyle = "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
                      } else if (isSelected) {
                        optionStyle = "border-red-500/30 bg-red-500/10 text-red-400";
                      } else {
                        optionStyle = "border-white/5 bg-white/5 text-slate-500 opacity-60";
                      }
                    } else {
                      if (isSelected) {
                        optionStyle = "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]";
                      }
                    }

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleAnswerQuickStudy(option)}
                        disabled={hasAnswered}
                        className={`flex items-center justify-between px-5 py-4 rounded-xl border text-left text-xs font-bold tracking-wide transition cursor-pointer ${optionStyle}`}
                      >
                        <span>{option}</span>
                        {hasAnswered && isCorrect && <Check className="h-4 w-4 text-emerald-400" />}
                        {hasAnswered && isSelected && !isCorrect && <X className="h-4 w-4 text-red-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action area */}
            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsQuickStudyActive(false);
                  setShowQuickStudyResults(false);
                }}
                className="px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition cursor-pointer"
              >
                Quit Study Session
              </button>
              
              {quickStudySelectedOption !== null && (
                <button
                  type="button"
                  onClick={handleNextQuickStudy}
                  className="bg-[#D4AF37] text-black font-extrabold px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest hover:brightness-110 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>{quickStudyIndex + 1 === quickStudyQuestions.length ? "Finish Quiz" : "Next Question"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {activeSubTab === "vocab" && showQuickStudyResults && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
          id="quick-study-results"
        >
          <div className="bg-[#141417] rounded-xl border border-[#D4AF37]/20 p-6 shadow-2xl space-y-6 text-center">
            <div className="py-4 space-y-3 flex flex-col items-center">
              <div className="p-4 bg-[#D4AF37]/15 rounded-full border border-[#D4AF37]/30 text-[#D4AF37]">
                <Award className="h-8 w-8 animate-bounce" />
              </div>
              
              <h3 className="text-xl font-serif font-black text-white uppercase tracking-wider">
                Quick Study Session Finished!
              </h3>
              
              <p className="text-xs text-[#8E9299] max-w-sm leading-relaxed">
                You completed the 2-minute rapid-fire vocabulary challenge. Let's see how well you did!
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3.5 max-w-md mx-auto">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                <span className="text-[9px] font-mono text-[#8E9299] uppercase tracking-widest block mb-1">Score</span>
                <span className="text-xl font-serif font-bold text-white leading-none">
                  {quickStudyScore} / {quickStudyQuestions.length}
                </span>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                <span className="text-[9px] font-mono text-[#8E9299] uppercase tracking-widest block mb-1">Accuracy</span>
                <span className="text-xl font-serif font-bold text-white leading-none">
                  {quickStudyQuestions.length > 0 ? Math.round((quickStudyScore / quickStudyQuestions.length) * 100) : 0}%
                </span>
              </div>
              <div className="bg-[#D4AF37]/10 p-4 rounded-xl border border-[#D4AF37]/20 text-center">
                <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-widest block mb-1">Badge Status</span>
                <span className="text-xs font-black text-[#D4AF37] uppercase tracking-wider block mt-1">
                  {quickStudyScore >= 5 ? "Speed Demon Earned! ⚡" : "Locked (Need 5+)"}
                </span>
              </div>
            </div>

            {quickStudyScore >= 5 ? (
              <div className="bg-amber-500/5 border border-[#D4AF37]/30 rounded-xl p-4 max-w-md mx-auto text-xs text-left flex items-start gap-3">
                <Zap className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="font-serif font-bold text-white uppercase tracking-wider">⚡ Speed Demon Badge Unlocked!</h4>
                  <p className="text-[11px] text-[#8E9299] leading-relaxed mt-1">
                    Outstanding speed and absolute recall. You have secured the premium 'Speed Demon' badge inside your Achievements cabinet!
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 max-w-md mx-auto text-xs text-left flex items-start gap-3">
                <Clock className="h-5 w-5 text-[#8E9299] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-[#8E9299] uppercase tracking-wider">Keep pushing!</h4>
                  <p className="text-[11px] text-[#8E9299]/80 leading-relaxed mt-1">
                    Score at least 5 correct answers to claim the 'Speed Demon' lightning badge. Try again, you can do it!
                  </p>
                </div>
              </div>
            )}

            {/* Reset/Done Buttons */}
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleStartQuickStudy}
                className="bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-widest transition cursor-pointer"
              >
                Retry Quiz
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQuickStudyResults(false);
                  setIsQuickStudyActive(false);
                }}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest transition cursor-pointer"
              >
                Back to Flashcards
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {activeSubTab === "vocab" && isSpeedArenaActive && (
        <SpeedQuizArena
          cefrLevel={cefrLevel}
          flashcards={flashcards}
          reviewDeck={reviewDeck}
          customQuestions={customQuestions}
          onClose={() => setIsSpeedArenaActive(false)}
        />
      )}

      {activeSubTab === "vocab" && !isQuickStudyActive && !showQuickStudyResults && !isSpeedArenaActive && (
        /* TAB 2: Vocabulary Deck Feature */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
          id="practice-vocab-container"
        >
          {/* Deck Status Banner */}
          <div className="bg-[#141417] rounded-xl border border-white/5 p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Brain className="h-4 w-4 text-[#D4AF37]" />
                Personalized Vocabulary Deck
              </h3>
              <p className="text-[#8E9299] text-xs leading-relaxed max-w-xl">
                {missedQuestionsCount > 0 ? (
                  <>
                    We detected <strong className="text-[#D4AF37]">{missedQuestionsCount} weak areas</strong> from your past assessments. The engine has extracted custom flashcards with contextual usage models.
                  </>
                ) : (
                  <>
                    No past assessment errors indexed yet. We have auto-compiled standard CEFR <strong className="text-[#D4AF37]">{cefrLevel}</strong> core vocabulary challenges to build your lexicon.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-end">
              {missedQuestionsCount > 0 && (
                <button
                  onClick={handleClearMissedHistory}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition cursor-pointer"
                  title="Clear error log"
                >
                  Clear Logs
                </button>
              )}
              <button
                onClick={() => fetchFlashcards()}
                disabled={vocabLoading}
                className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/20 px-3.5 py-2 rounded-lg text-[9px] font-extrabold uppercase tracking-widest inline-flex items-center gap-1 transition cursor-pointer disabled:opacity-40"
              >
                {vocabLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                <span>Regenerate Deck</span>
              </button>
              <button
                onClick={handleStartQuickStudy}
                className="bg-gradient-to-r from-amber-500/20 to-[#D4AF37]/30 hover:from-amber-500/30 hover:to-[#D4AF37]/40 text-[#D4AF37] border border-[#D4AF37]/40 px-3.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-[#D4AF37]/5 animate-pulse"
                title="Start 2-Minute Quick Study Quiz"
              >
                <Zap className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>Quick Study Quiz</span>
              </button>

              <button
                onClick={() => {
                  setIsSpeedArenaActive(true);
                  setIsQuickStudyActive(false);
                  setShowQuickStudyResults(false);
                }}
                className="bg-gradient-to-r from-orange-500/25 to-[#D4AF37]/35 hover:from-orange-500/35 hover:to-[#D4AF37]/45 text-orange-400 border border-orange-500/40 px-3.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-orange-500/5 hover:scale-[1.02]"
                title="Enter Interactive Timed Speed Arena"
              >
                <Clock className="h-3.5 w-3.5 text-orange-400 animate-spin-slow" />
                <span>Timed Speed Arena</span>
              </button>
            </div>
          </div>

          {/* Deck Selector Tabs */}
          <div className="flex border-b border-white/5 pb-1 text-xs font-bold gap-3" id="vocab-deck-selector">
            <button
              onClick={() => {
                setShowReviewDeckOnly(false);
                setCurrentCardIndex(0);
                setIsFlipped(false);
                setUserQuizAnswer("");
                setIsQuizSubmitted(false);
                setIsQuizCorrect(null);
              }}
              className={`px-3 py-2 border-b-2 transition duration-150 cursor-pointer flex items-center gap-2 ${
                !showReviewDeckOnly
                  ? "border-[#D4AF37] text-[#D4AF37]"
                  : "border-transparent text-[#8E9299] hover:text-white"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Standard Lesson Deck ({flashcards.length})</span>
            </button>
            <button
              onClick={() => {
                setShowReviewDeckOnly(true);
                setCurrentCardIndex(0);
                setIsFlipped(false);
                setUserQuizAnswer("");
                setIsQuizSubmitted(false);
                setIsQuizCorrect(null);
              }}
              className={`px-3 py-2 border-b-2 transition duration-150 cursor-pointer flex items-center gap-2 ${
                showReviewDeckOnly
                  ? "border-[#D4AF37] text-[#D4AF37]"
                  : "border-transparent text-[#8E9299] hover:text-white"
              }`}
            >
              <BookmarkCheck className="h-4 w-4" />
              <span>My Review Deck ({reviewDeck.length})</span>
              {reviewDeck.length > 0 && (
                <span className="bg-[#D4AF37]/20 text-[#D4AF37] rounded-full h-4 min-w-4 px-1.5 flex items-center justify-center text-[9px] font-mono font-bold">
                  {reviewDeck.length}
                </span>
              )}
            </button>
          </div>

          {/* SRS Dashboard Statistics & Controls */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/5 border border-white/5 rounded-xl p-4 text-left shadow-lg">
            
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8E9299] uppercase tracking-widest">
                <Clock className="h-3.5 w-3.5 text-red-400" />
                <span>Due Now</span>
              </div>
              <p className="text-2xl font-serif font-black text-white leading-none">
                {deckStats.dueCount} <span className="text-[10px] font-sans font-medium text-slate-400 uppercase">cards</span>
              </p>
              <span className="text-[9px] text-[#8E9299] block leading-tight">Need immediate repetition</span>
            </div>

            <div className="space-y-1 border-l border-white/5 pl-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8E9299] uppercase tracking-widest">
                <Brain className="h-3.5 w-3.5 text-amber-400" />
                <span>Learning</span>
              </div>
              <p className="text-2xl font-serif font-black text-white leading-none">
                {deckStats.learningCount} <span className="text-[10px] font-sans font-medium text-slate-400 uppercase">cards</span>
              </p>
              <span className="text-[9px] text-[#8E9299] block leading-tight">Short interval repetition</span>
            </div>

            <div className="space-y-1 border-l border-white/5 pl-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8E9299] uppercase tracking-widest">
                <Award className="h-3.5 w-3.5 text-emerald-400" />
                <span>Review / Mastered</span>
              </div>
              <p className="text-2xl font-serif font-black text-white leading-none">
                {deckStats.reviewCount + masteredWords.filter(w => (showReviewDeckOnly ? reviewDeck : flashcards).some(c => c.word.toLowerCase() === w.toLowerCase())).length} <span className="text-[10px] font-sans font-medium text-slate-400 uppercase">cards</span>
              </p>
              <span className="text-[9px] text-[#8E9299] block leading-tight">Long interval retention</span>
            </div>

            {showSandboxControls && (
              <div className="space-y-1 border-l border-white/5 pl-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8E9299] uppercase tracking-widest">
                    <Sliders className="h-3.5 w-3.5 text-[#D4AF37]" />
                    <span>Minute Mode</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={isSrsMinuteMode} 
                      onChange={(e) => setIsSrsMinuteMode(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-7 h-4 bg-white/10 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                  </label>
                </div>
                <p className="text-[10px] text-[#8E9299] leading-tight">
                  {isSrsMinuteMode 
                    ? "⚡ Minute intervals (Testing)" 
                    : "📅 Standard daily intervals"}
                </p>
              </div>
            )}
          </div>

          {/* Spaced Repetition Pill Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141417]/40 border border-white/5 rounded-xl p-2.5">
            <span className="text-[10px] font-bold text-[#8E9299] uppercase tracking-wider pl-1.5 flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span>Filter Deck by SRS Stage</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSrsFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  srsFilter === "all"
                    ? "bg-white/10 text-white font-black"
                    : "text-[#8E9299] hover:text-white hover:bg-white/5"
                }`}
              >
                All ({deckStats.totalCount})
              </button>
              <button
                onClick={() => setSrsFilter("due")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                  srsFilter === "due"
                    ? "bg-red-500/20 text-red-300 font-black border border-red-500/20"
                    : "text-[#8E9299] hover:text-red-400 hover:bg-red-500/5"
                }`}
              >
                <span>Due Now</span>
                <span className="bg-red-500/20 text-red-300 rounded-full text-[9px] px-1 font-mono font-bold">
                  {deckStats.dueCount}
                </span>
              </button>
              <button
                onClick={() => setSrsFilter("learning")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                  srsFilter === "learning"
                    ? "bg-amber-500/20 text-amber-300 font-black border border-amber-500/20"
                    : "text-[#8E9299] hover:text-amber-400 hover:bg-amber-500/5"
                }`}
              >
                <span>Learning</span>
                <span className="bg-amber-500/20 text-amber-300 rounded-full text-[9px] px-1 font-mono font-bold">
                  {deckStats.learningCount}
                </span>
              </button>
              <button
                onClick={() => setSrsFilter("new")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                  srsFilter === "new"
                    ? "bg-blue-500/20 text-blue-300 font-black border border-blue-500/20"
                    : "text-[#8E9299] hover:text-blue-400 hover:bg-blue-500/5"
                }`}
              >
                <span>New</span>
                <span className="bg-blue-500/20 text-blue-300 rounded-full text-[9px] px-1 font-mono font-bold">
                  {deckStats.newCount}
                </span>
              </button>
            </div>
          </div>

          {/* Error / Loading indicators */}
          {vocabError && (
            <div className="bg-red-950/20 border border-red-500/20 text-red-400 p-4 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{vocabError}</span>
            </div>
          )}

          {vocabLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center bg-[#141417] rounded-xl border border-white/5 shadow-2xl">
              <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin" />
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-sm font-serif text-white uppercase tracking-wider">Compiling contextual deck</h3>
                <p className="text-[11px] text-[#8E9299] leading-relaxed">
                  Analyzing assessment data, establishing target definitions, IPA transcription guides, and custom example sentences...
                </p>
              </div>
            </div>
          ) : showReviewDeckOnly && reviewDeck.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-[#141417] rounded-xl border border-white/5 p-8 space-y-4 shadow-2xl animate-fade-in" id="empty-review-deck">
              <div className="relative">
                <Bookmark className="h-12 w-12 text-[#D4AF37]/20" />
                <Plus className="h-5 w-5 text-[#D4AF37]/80 absolute -bottom-1 -right-1 bg-[#141417] rounded-full border border-white/10 p-0.5" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-sm font-serif text-white uppercase tracking-wider">Your Review Deck is Empty</h3>
                <p className="text-[11px] text-[#8E9299] leading-relaxed">
                  Bookmark difficult vocabulary words while studying to compile a personalized training set. Simply click the <strong className="text-[#D4AF37]">"Add to Deck"</strong> button on any flashcard.
                </p>
              </div>
              <button
                onClick={() => setShowReviewDeckOnly(false)}
                className="bg-[#D4AF37] text-black hover:brightness-110 font-extrabold px-5 py-2.5 rounded-lg text-[10px] tracking-wider transition uppercase cursor-pointer"
              >
                Explore Standard Vocabulary
              </button>
            </div>
          ) : activeDeck.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-[#141417] rounded-xl border border-white/5 p-8 space-y-4 shadow-2xl animate-fade-in" id="empty-srs-filter">
              <div className="relative">
                <CheckCircle2 className="h-12 w-12 text-[#D4AF37]/20" />
                <Sparkles className="h-5 w-5 text-[#D4AF37]/80 absolute -top-1 -right-1" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-sm font-serif text-white uppercase tracking-wider">All Caught Up!</h3>
                <p className="text-[11px] text-[#8E9299] leading-relaxed">
                  {srsFilter === "due" 
                    ? "Great job! You have zero cards due for review at this moment. You are maintaining stellar recall."
                    : "No cards match the selected spaced-repetition stage."}
                </p>
                {srsFilter === "due" && showSandboxControls && (
                  <p className="text-[10px] text-[#8E9299]/70 italic mt-1">
                    Tip: Try toggling "Minute Mode" at the top right of the vocab tab to simulate reviews, or study all words.
                  </p>
                )}
              </div>
              <button
                onClick={() => setSrsFilter("all")}
                className="bg-[#D4AF37] text-black hover:brightness-110 font-extrabold px-5 py-2.5 rounded-lg text-[10px] tracking-wider transition uppercase cursor-pointer"
              >
                Show All Cards
              </button>
            </div>
          ) : activeDeck.length > 0 && currentFlashcard ? (
            <div className="space-y-6">
              
              {/* Dynamic Flashcard Widget (Interactive 3D Flipping Card) */}
              <div className="flex justify-center perspective-1000">
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`relative w-full max-w-lg h-[340px] transition-all duration-500 preserve-3d cursor-pointer ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                >
                  
                  {/* Front of the Flashcard */}
                  <div className="absolute inset-0 w-full h-full bg-[#141417] border border-white/5 rounded-2xl p-6 flex flex-col justify-between shadow-2xl backface-hidden">
                    
                    <div className="flex justify-between items-start">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="font-serif font-black text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-3 py-1 rounded text-[11px] tracking-wider uppercase">
                          {currentFlashcard.level} Word
                        </span>
                        
                        {/* Dynamic SRS Badge */}
                        <span 
                          className={`font-mono font-bold text-[10px] px-2.5 py-1 rounded border uppercase tracking-wider ${getSrsBadge(currentFlashcard.word).style}`}
                          title={getSrsBadge(currentFlashcard.word).tooltip}
                        >
                          {getSrsBadge(currentFlashcard.word).label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isCurrentCardMastered && (
                          <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mastered
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent flip
                            toggleReviewDeck(currentFlashcard);
                          }}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase border transition cursor-pointer ${
                            reviewDeck.some(item => item.word.toLowerCase() === currentFlashcard.word.toLowerCase())
                              ? "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40"
                              : "bg-white/5 text-[#8E9299] hover:text-white hover:bg-white/10 border-white/10"
                          }`}
                          title={
                            reviewDeck.some(item => item.word.toLowerCase() === currentFlashcard.word.toLowerCase())
                              ? "Remove from Review Deck"
                              : "Add to Review Deck"
                          }
                        >
                          {reviewDeck.some(item => item.word.toLowerCase() === currentFlashcard.word.toLowerCase()) ? (
                            <BookmarkCheck className="h-3.5 w-3.5" />
                          ) : (
                            <Bookmark className="h-3.5 w-3.5" />
                          )}
                          <span>
                            {reviewDeck.some(item => item.word.toLowerCase() === currentFlashcard.word.toLowerCase())
                              ? "Saved"
                              : "Add to Deck"
                            }
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="text-center space-y-3 py-4">
                      <h2 className="text-3xl md:text-4xl font-serif text-white font-extrabold tracking-wide">
                        {currentFlashcard.word}
                      </h2>
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono text-xs text-[#8E9299]">
                          {currentFlashcard.ipa}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent card flip
                            speakWord(currentFlashcard.word);
                          }}
                          className={`p-1.5 rounded bg-white/5 hover:bg-white/10 transition text-[#D4AF37] cursor-pointer ${
                            speakingWord === currentFlashcard.word ? "animate-pulse border border-[#D4AF37]/30" : ""
                          }`}
                          title="Listen to pronunciation"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-center space-y-2">
                      <p className="text-[#8E9299] text-[10px] uppercase tracking-widest font-bold">
                        Click card to flip & learn
                      </p>
                      <div className="h-1 w-24 bg-[#D4AF37]/20 mx-auto rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-[#D4AF37]" 
                          animate={{ width: isFlipped ? "100%" : "30%" }}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Back of the Flashcard */}
                  <div className="absolute inset-0 w-full h-full bg-[#18181C] border border-[#D4AF37]/20 rounded-2xl p-6 flex flex-col justify-between shadow-2xl backface-hidden rotate-y-180">
                    
                    <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                      <div>
                        <span className="text-[9px] font-extrabold text-[#8E9299] uppercase tracking-widest">Definition</span>
                        <p className="text-sm font-medium text-white leading-relaxed mt-0.5">
                          {currentFlashcard.definition}
                        </p>
                      </div>

                      {currentFlashcard.arabic_translation && (
                        <div className="bg-[#1C160C] border border-[#D4AF37]/10 p-3.5 rounded space-y-1">
                          <span className="text-[9px] font-extrabold text-[#D4AF37] uppercase tracking-widest flex items-center justify-between">
                            <span>Arabic Translation</span>
                            <span className="font-sans">الترجمة العربية</span>
                          </span>
                          <p className="text-sm font-bold text-[#E5C158] leading-relaxed text-right font-sans" dir="rtl">
                            {currentFlashcard.arabic_translation}
                          </p>
                        </div>
                      )}

                      <div className="bg-[#0F0F12] p-3.5 rounded border border-white/5 space-y-1">
                        <span className="text-[9px] font-extrabold text-[#D4AF37] uppercase tracking-widest">Contextual Example</span>
                        <p className="text-xs text-[#E0E0E0] leading-relaxed italic font-serif">
                          "{currentFlashcard.example_sentence}"
                        </p>
                      </div>

                      <div>
                        <span className="text-[9px] font-extrabold text-[#8E9299] uppercase tracking-widest">Usage Tip / Collocation</span>
                        <p className="text-[11px] text-[#8E9299] leading-relaxed mt-0.5">
                          {currentFlashcard.usage_tip}
                        </p>
                      </div>
                    </div>

                    {/* Spaced Repetition Quality Rating buttons on the Back of Card */}
                    <div className="py-3 border-t border-white/5 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                      <div className="text-[9px] font-extrabold text-[#D4AF37] uppercase tracking-widest text-center">
                        How well did you recall this card?
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          onClick={() => handleRateSrs(currentFlashcard.word, "again")}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 rounded-lg text-[10px] font-extrabold uppercase transition cursor-pointer flex flex-col items-center justify-center gap-0.5"
                          title="Forgot the word or got it completely wrong"
                        >
                          <span className="text-red-300 font-bold">Again</span>
                          <span className="text-[8px] opacity-60 font-mono">({getNextIntervals(currentFlashcard.word).again})</span>
                        </button>
                        <button
                          onClick={() => handleRateSrs(currentFlashcard.word, "hard")}
                          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 py-2 rounded-lg text-[10px] font-extrabold uppercase transition cursor-pointer flex flex-col items-center justify-center gap-0.5"
                          title="Remembered with significant effort and hesitation"
                        >
                          <span className="text-amber-300 font-bold">Hard</span>
                          <span className="text-[8px] opacity-60 font-mono">({getNextIntervals(currentFlashcard.word).hard})</span>
                        </button>
                        <button
                          onClick={() => handleRateSrs(currentFlashcard.word, "good")}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-2 rounded-lg text-[10px] font-extrabold uppercase transition cursor-pointer flex flex-col items-center justify-center gap-0.5"
                          title="Remembered correctly with standard response time"
                        >
                          <span className="text-emerald-300 font-bold">Good</span>
                          <span className="text-[8px] opacity-60 font-mono">({getNextIntervals(currentFlashcard.word).good})</span>
                        </button>
                        <button
                          onClick={() => handleRateSrs(currentFlashcard.word, "easy")}
                          className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/20 py-2 rounded-lg text-[10px] font-extrabold uppercase transition cursor-pointer flex flex-col items-center justify-center gap-0.5"
                          title="Instant recall without any effort; mark as mastered"
                        >
                          <span className="text-white font-bold">Easy</span>
                          <span className="text-[8px] opacity-60 font-mono">({getNextIntervals(currentFlashcard.word).easy})</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent flip
                            toggleMastered(currentFlashcard.word);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                            isCurrentCardMastered 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : "bg-white/5 text-[#8E9299] hover:text-white hover:bg-white/10 border border-white/10"
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>{isCurrentCardMastered ? "Mastered" : "Mark Mastered"}</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent flip
                            toggleReviewDeck(currentFlashcard);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                            reviewDeck.some(item => item.word.toLowerCase() === currentFlashcard.word.toLowerCase())
                              ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40"
                              : "bg-white/5 text-[#8E9299] hover:text-white hover:bg-white/10 border border-white/10"
                          }`}
                        >
                          {reviewDeck.some(item => item.word.toLowerCase() === currentFlashcard.word.toLowerCase()) ? (
                            <BookmarkCheck className="h-3.5 w-3.5" />
                          ) : (
                            <Bookmark className="h-3.5 w-3.5" />
                          )}
                          <span>
                            {reviewDeck.some(item => item.word.toLowerCase() === currentFlashcard.word.toLowerCase())
                              ? "Saved"
                              : "Add to Deck"
                            }
                          </span>
                        </button>
                      </div>
                      
                      <span className="text-[#8E9299] text-[10px] uppercase font-bold hidden sm:inline">
                        Click card to flip back
                      </span>
                    </div>

                  </div>

                </div>
              </div>

              {/* AI Pronunciation Audio Player */}
              <div className="max-w-lg mx-auto">
                <AudioPlayer 
                  textToSpeak={`${currentFlashcard.word}. ${currentFlashcard.example_sentence}`} 
                  title={`Pronunciation: ${currentFlashcard.word}`}
                  id="vocab-audio-player"
                />
              </div>

              {/* Retrieval Quiz for Active Flashcard */}
              <div className="max-w-lg mx-auto bg-[#141417] rounded-xl border border-white/5 p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-1.5 pb-2 border-b border-white/5">
                  <Brain className="h-4 w-4 text-[#D4AF37]" />
                  <span className="text-xs font-serif text-white font-bold uppercase tracking-wider">Active Retrieval Practice</span>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-[#E0E0E0] leading-relaxed">
                    Fill in the blank of this sentence using the target word:
                  </p>
                  
                  <div className="bg-[#0F0F12] p-4 rounded border border-white/5 text-xs text-[#E0E0E0] leading-relaxed italic font-medium">
                    "{currentFlashcard.quiz_question}"
                  </div>

                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      value={userQuizAnswer}
                      onChange={(e) => setUserQuizAnswer(e.target.value)}
                      disabled={isQuizSubmitted}
                      placeholder="Type the target word..."
                      className="flex-1 px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-lg text-xs text-[#E0E0E0] placeholder-[#8E9299]/30 focus:outline-none focus:border-[#D4AF37]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCheckQuizAnswer(currentFlashcard.quiz_answer);
                        }
                      }}
                    />
                    
                    {!isQuizSubmitted ? (
                      <button
                        onClick={() => handleCheckQuizAnswer(currentFlashcard.quiz_answer)}
                        disabled={!userQuizAnswer.trim()}
                        className="bg-[#D4AF37] text-black hover:brightness-110 px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition disabled:opacity-35 cursor-pointer shrink-0"
                      >
                        Verify
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setUserQuizAnswer("");
                          setIsQuizSubmitted(false);
                          setIsQuizCorrect(null);
                        }}
                        className="bg-white/5 text-[#E0E0E0] hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition cursor-pointer shrink-0"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Feedback Message */}
                  <AnimatePresence>
                    {isQuizSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className={`p-3.5 rounded-lg border text-xs leading-relaxed space-y-1 ${
                          isQuizCorrect 
                            ? "bg-emerald-950/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-red-950/10 border-red-500/20 text-red-400"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider">
                          {isQuizCorrect ? (
                            <>
                              <Check className="h-4 w-4" /> Excellent Retrieval!
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4" /> Incorrect Attempt
                            </>
                          )}
                        </div>
                        <p>
                          {isQuizCorrect 
                            ? `Correct! "${currentFlashcard.quiz_answer}" perfectly seals the syntactic gap.` 
                            : `Not quite. The correct target word is "${currentFlashcard.quiz_answer}". Try re-typing to reinforce.`
                          }
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Carousel controls and progression indicators */}
              <div className="flex items-center justify-between max-w-lg mx-auto pt-2">
                <button
                  onClick={handlePrevCard}
                  disabled={currentCardIndex === 0}
                  className="bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 border border-white/10 p-2.5 rounded-lg transition cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="text-center space-y-1.5">
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Card {currentCardIndex + 1} of {activeDeck.length}
                  </span>
                  
                  {/* Miniature progress dots */}
                  <div className="flex items-center gap-1.5 justify-center">
                    {activeDeck.map((_, i) => (
                      <div 
                        key={i} 
                        onClick={() => {
                          setCurrentCardIndex(i);
                          setIsFlipped(false);
                          setUserQuizAnswer("");
                          setIsQuizSubmitted(false);
                          setIsQuizCorrect(null);
                        }}
                        className={`h-1.5 rounded-full cursor-pointer transition-all duration-200 ${
                          i === currentCardIndex 
                            ? "w-5 bg-[#D4AF37]" 
                            : "w-1.5 bg-white/10 hover:bg-white/25"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleNextCard}
                  disabled={currentCardIndex === activeDeck.length - 1}
                  className="bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 border border-white/10 p-2.5 rounded-lg transition cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-[#141417] rounded-xl border border-white/5 p-6">
              <span className="text-xs text-[#8E9299]">
                Click 'Regenerate Deck' to build custom offline-ready flashcards.
              </span>
            </div>
          )}

        </motion.div>
      )}

      {activeSubTab === "lessons" && (
        <AudioLessons 
          userLevel={userLevel} 
          onIncrementPracticeCount={onIncrementPracticeCount} 
        />
      )}

      {activeSubTab === "custom" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
          id="custom-questions-manager"
        >
          <QuestionManagement onQuestionsUpdated={handleReloadQuestions} />
        </motion.div>
      )}

    </div>
  );
}
