import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Mic, 
  MicOff, 
  Award, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight, 
  CornerDownRight, 
  Sparkles, 
  BookOpen,
  Send,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Copy,
  Volume2,
  VolumeX,
  Eye,
  Download,
  X,
  Trophy,
  Sliders,
  Clock,
  Trash2
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { jsPDF } from "jspdf";
import { CURATED_PROMPTS } from "../data/prompts";
import { EvaluationResult, EvaluatorPromptTemplate } from "../types";
import AudioPlayer from "./AudioPlayer";

const CURATED_PASSAGES: Record<string, { title: string; text: string; wordCount: number }> = {
  "a0-speaking-intro": {
    title: "Simple Introductions",
    text: "Hello! My name is John. I am from Canada. I live in Toronto. I am happy to meet you.",
    wordCount: 19
  },
  "a1-speaking-intro": {
    title: "A Brief Self-Introduction",
    text: "Hello, everyone. My name is Alex and I am twenty-five years old. I come from Spain, but now I live in London. I work as an assistant in a small office. In my spare time, I love playing tennis and reading novels.",
    wordCount: 42
  },
  "a2-writing-invitation": {
    title: "Weekend Invitation to Edinburgh",
    text: "Hi Thomas, I hope you are having a wonderful week! I would love to invite you to spend this coming weekend with me here in Edinburgh. We could visit the famous historic castle on Saturday afternoon and try some traditional local food. It would be best to meet at the main train station around ten in the morning on Saturday. You can easily catch the direct train from your city straight to the central station. Let me know if you can make it!",
    wordCount: 85
  },
  "b1-speaking-narrative": {
    title: "Hiking the Inca Trail",
    text: "One of my most memorable travel experiences was visiting the ancient ruins of Machu Picchu in Peru three years ago. I traveled with two of my closest university friends. We spent four days hiking along the classic Inca Trail, surrounded by breathtaking mountain peaks and lush green cloud forests. Reaching the sun gate at dawn and seeing the ruins emerge from the morning mist was a truly magical moment that I will never forget. It showed me the raw beauty of nature and the power of human history.",
    wordCount: 91
  },
  "b2-writing-complaint": {
    title: "Software Delivery Notice",
    text: "Dear Valuation Team, I am writing to formally notify you regarding a minor adjustment to our software delivery schedule. Due to unforeseen bottlenecks in our security testing phase, our final release will be delayed by two weeks. Our priority is delivering a flawless system, so we are dedicating extra engineers to resolve these testing queues. We sincerely apologize for this inconvenience and propose a revised timeline along with a status update call next Monday to detail our progression.",
    wordCount: 86
  },
  "c1-writing-argument": {
    title: "The Impact of Automation on High-Skilled Labor",
    text: "The rapid proliferation of artificial intelligence technologies has sparked intensive academic debate regarding their long-term implications on the global labor market. While automation was historically confined to repetitive, low-skilled manual tasks, contemporary generative models are increasingly demonstrating capabilities that threaten high-skilled professional occupations. Legal analysis, financial forecasting, and even complex software engineering are no longer immune to computational efficiency. Consequently, societies must proactively restructure education frameworks and social safety nets to mitigate structural unemployment and foster human-machine synergy.",
    wordCount: 84
  },
  "c2-speaking-speculative": {
    title: "Anti-trust Challenges of Technological Monopolies",
    text: "In the contemporary digital epoch, the unchecked expansion of multinational technology conglomerates has raised critical questions regarding anti-trust legislation and free-market viability. These entities do not merely dominate commerce; they curate the information pipelines that sustain democratic discourse. By leveraging vast data asymmetries and network effects, they erect virtually insurmountable entry barriers for potential competitors, thereby stifling organic innovation. Thus, standard regulatory frameworks are insufficient; modern jurisprudence must evolve to evaluate consumer welfare not merely through pricing, but through data privacy and sovereign democratic integrity.",
    wordCount: 85
  }
};


// Setup speech recognition type definitions safely
type SpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
  };
};

type SpeechRecognitionType = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onerror: (event: any) => void;
  onend: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  start: () => void;
  stop: () => void;
};

interface EvaluatorProps {
  onCompleteEvaluation: (result: EvaluationResult, type: "writing" | "speaking", promptTitle: string) => void;
}

export default function Evaluator({ onCompleteEvaluation }: EvaluatorProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<EvaluatorPromptTemplate>(CURATED_PROMPTS[0]);
  const [customPromptEnabled, setCustomPromptEnabled] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customScenario, setCustomScenario] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [customType, setCustomType] = useState<"writing" | "speaking">("writing");
  const [customTargetLevel, setCustomTargetLevel] = useState<"A0" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2">("B2");

  const [userSubmission, setUserSubmission] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isSpeakingImproved, setIsSpeakingImproved] = useState(false);
  const [isSpeakingFeedback, setIsSpeakingFeedback] = useState(false);
  const [draftSaveStatus, setDraftSaveStatus] = useState<string | null>(null);
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfConfig, setPdfConfig] = useState({
    includeDate: true,
    includeOriginal: true,
    includePolished: true,
    includeCriteria: true,
    includeFeedback: true,
  });
  const [arabicFeedback, setArabicFeedback] = useState<boolean>(() => {
    return localStorage.getItem("cefr_evaluator_arabic_mode") === "true";
  });

  const handleToggleArabicFeedback = (enabled: boolean) => {
    setArabicFeedback(enabled);
    localStorage.setItem("cefr_evaluator_arabic_mode", String(enabled));
  };

  const recognitionRef = useRef<any>(null);

  // Reading Speed State
  const [isReading, setIsReading] = useState(false);
  const [readingSecondsElapsed, setReadingSecondsElapsed] = useState(0);
  const [readingWpm, setReadingWpm] = useState<number | null>(null);
  const [readingCompleted, setReadingCompleted] = useState(false);
  const [readingHistory, setReadingHistory] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cefr_reading_speed_history") || "[]");
    } catch {
      return [];
    }
  });

  // Reading Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isReading) {
      interval = setInterval(() => {
        setReadingSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isReading]);

  // Get active text for reading speed session
  const getActiveReadingPassage = () => {
    if (customPromptEnabled) {
      const combined = `${customTitle ? customTitle + ". " : ""}${customScenario ? customScenario + " " : ""}${customInstructions ? customInstructions : ""}`;
      const textVal = combined.trim() || "Welcome to your customized English evaluation session. Please read this passage and formulate your response accordingly.";
      return {
        title: customTitle || "Custom Scenario",
        text: textVal,
        wordCount: textVal.split(/\s+/).filter(Boolean).length
      };
    } else {
      const curated = CURATED_PASSAGES[selectedPrompt.id];
      if (curated) {
        return curated;
      }
      const textVal = `${selectedPrompt.scenario} ${selectedPrompt.instructions}`.trim();
      return {
        title: selectedPrompt.title,
        text: textVal,
        wordCount: textVal.split(/\s+/).filter(Boolean).length
      };
    }
  };

  const handleStartReading = () => {
    setIsReading(true);
    setReadingSecondsElapsed(0);
    setReadingWpm(null);
    setReadingCompleted(false);
  };

  const handleFinishReading = () => {
    setIsReading(false);
    setReadingCompleted(true);
    
    const passage = getActiveReadingPassage();
    const duration = Math.max(1, readingSecondsElapsed);
    const computedWpm = Math.round((passage.wordCount / duration) * 60);
    setReadingWpm(computedWpm);

    const newEntry = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      wpm: computedWpm,
      level: customPromptEnabled ? customTargetLevel : selectedPrompt.targetLevel,
      title: passage.title,
      duration: duration,
      wordCount: passage.wordCount
    };

    const updatedHistory = [newEntry, ...readingHistory];
    setReadingHistory(updatedHistory);
    localStorage.setItem("cefr_reading_speed_history", JSON.stringify(updatedHistory));
  };

  const handleCancelReading = () => {
    setIsReading(false);
    setReadingSecondsElapsed(0);
    setReadingCompleted(false);
  };

  const handleClearReadingHistory = () => {
    setReadingHistory([]);
    localStorage.setItem("cefr_reading_speed_history", JSON.stringify([]));
  };

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cefr_evaluator_draft");
      if (saved) {
        setUserSubmission(saved);
      }
    } catch (e) {
      console.error("Failed to load submission draft:", e);
    }
  }, []);

  const handleSaveDraft = () => {
    try {
      localStorage.setItem("cefr_evaluator_draft", userSubmission);
      setDraftSaveStatus("Draft saved successfully!");
      setTimeout(() => setDraftSaveStatus(null), 3000);
    } catch (e) {
      console.error("Failed to save submission draft:", e);
    }
  };

  // Listen to custom global save events
  useEffect(() => {
    const handleSaveEvent = () => {
      handleSaveDraft();
    };
    window.addEventListener("app-keyboard-save", handleSaveEvent);
    return () => window.removeEventListener("app-keyboard-save", handleSaveEvent);
  }, [userSubmission]);

  // Keep a mutable ref of userSubmission to prevent interval resetting on every keystroke
  const userSubmissionRef = useRef(userSubmission);
  useEffect(() => {
    userSubmissionRef.current = userSubmission;
  }, [userSubmission]);

  // Automatically save the user's current text input in the Writing/Speaking Evaluator to localStorage every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      const currentText = userSubmissionRef.current;
      if (currentText && currentText.trim().length > 0) {
        try {
          localStorage.setItem("cefr_evaluator_draft", currentText);
          setDraftSaveStatus("Draft auto-saved");
          setTimeout(() => setDraftSaveStatus(null), 3000);
        } catch (e) {
          console.error("Failed to automatically auto-save submission draft:", e);
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, []);

  // Check browser Web Speech API support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      
      rec.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
        }
        if (finalTranscript) {
          setUserSubmission((prev) => prev + finalTranscript);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        if (e.error === "not-allowed") {
          setError("Microphone permission denied. Please grant mic permissions or input text manually.");
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    
    setError(null);
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setIsRecording(false);
      }
    }
  };

  const activePromptInfo = customPromptEnabled ? {
    id: "custom",
    title: customTitle || "Custom Task",
    type: customType,
    targetLevel: customTargetLevel,
    scenario: customScenario || "Custom context",
    instructions: customInstructions || "Custom instructions"
  } as EvaluatorPromptTemplate : selectedPrompt;

  const handleSubmit = async () => {
    if (userSubmission.trim().length < 15) {
      setError("Please provide a more substantial response (at least 15 characters) for a reliable evaluation.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/evaluate-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionType: activePromptInfo.type,
          promptText: `Scenario: ${activePromptInfo.scenario}. Instructions: ${activePromptInfo.instructions}`,
          userContent: userSubmission,
          cefrLevel: activePromptInfo.targetLevel,
          arabicFeedback
        })
      });

      if (!response.ok) {
        throw new Error("Evaluation engine returned an error. Please retry.");
      }

      const evalData: EvaluationResult = await response.json();
      setResult(evalData);
      onCompleteEvaluation(evalData, activePromptInfo.type, activePromptInfo.title);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to complete AI evaluation. Please verify your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyImproved = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.improved_version);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const generatePDFReport = () => {
    if (!result) return;
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const primaryColor = [212, 175, 55]; // Gold #D4AF37
      let y = 20;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > 275) {
          doc.addPage();
          // Header on new page
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(142, 146, 153);
          doc.text("LEXICON ACADEMY - CEFR EVALUATION REPORT", 20, 15);
          doc.setDrawColor(230, 230, 235);
          doc.setLineWidth(0.3);
          doc.line(20, 17, 190, 17);
          y = 25;
        }
      };

      // Strip or sanitize non-latin/arabic glyphs from vector text to avoid pdf rendering box characters
      const sanitizeText = (str: string) => {
        if (!str) return "";
        // Clean Arabic script and non-standard symbols
        return str
          .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, "")
          .replace(/[^\x00-\x7F]/g, (char) => {
            // Keep basic accented latin characters, swap smart quotes
            if (char === "’" || char === "‘") return "'";
            if (char === "“" || char === "”") return '"';
            return "";
          })
          .trim();
      };

      // 1. HEADER BRANDING
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("LEXICON ACADEMY", 20, y);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(142, 146, 153);
      doc.text("Official CEFR Competence & Evaluation Record", 20, y + 6);
      
      if (pdfConfig.includeDate) {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 85);
        doc.text(`DATE GENERATED: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 120, y + 3);
      }
      
      y += 14;

      // Divider
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.8);
      doc.line(20, y, 190, y);
      y += 10;

      // 2. SUMMARY PROFILE BOX
      doc.setFillColor(248, 249, 250);
      doc.setDrawColor(230, 230, 235);
      doc.setLineWidth(0.3);
      doc.rect(20, y, 170, 32, "FD");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 35);
      doc.text("CEFR ASSESSMENT GRADE", 25, y + 7);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(28);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(result.overall_assigned_level, 25, y + 21);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 35);
      doc.text(`Task: ${sanitizeText(activePromptInfo.title)}`, 50, y + 13);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 105);
      doc.text(`Type: ${activePromptInfo.type.toUpperCase()} EVALUATION`, 50, y + 18);
      doc.text(`Target Level: CEFR ${activePromptInfo.targetLevel}`, 50, y + 23);

      y += 40;

      // Arabic Feedback Notice if active
      if (arabicFeedback) {
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("* Note: Bilingual Arabic translation feedback is optimized for live in-app reading and is omitted from the print layout.", 20, y);
        y += 8;
      }

      // 3. ORIGINAL SUBMISSION
      if (pdfConfig.includeOriginal) {
        checkPageBreak(35);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 35);
        doc.text("1. ORIGINAL SUBMISSION / INPUT", 20, y);
        y += 4;
        doc.setDrawColor(220, 220, 225);
        doc.setLineWidth(0.3);
        doc.line(20, y, 190, y);
        y += 6;

        doc.setFont("Helvetica", "italic");
        doc.setFontSize(9.5);
        doc.setTextColor(80, 80, 85);
        const originalLines = doc.splitTextToSize(`"${sanitizeText(userSubmission)}"`, 170);
        doc.text(originalLines, 20, y);
        y += (originalLines.length * 5) + 12;
      }

      // 4. POLISHED RECONSTRUCTION
      if (pdfConfig.includePolished) {
        checkPageBreak(45);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 35);
        doc.text("2. POLISHED NATIVE RECONSTRUCTION", 20, y);
        y += 4;
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setLineWidth(0.4);
        doc.line(20, y, 190, y);
        y += 6;

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(30, 30, 35);
        const polishedLines = doc.splitTextToSize(sanitizeText(result.improved_version), 170);
        
        const boxHeight = (polishedLines.length * 5) + 6;
        doc.setFillColor(254, 252, 243); // Cream tint background
        doc.rect(20, y - 4, 170, boxHeight, "F");
        doc.text(polishedLines, 23, y + 1);
        y += boxHeight + 12;
      }

      // 5. EVALUATION CRITERIA MATRIX
      if (pdfConfig.includeCriteria) {
        checkPageBreak(50);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 35);
        doc.text("3. DETAILED CRITERIA MATRIX", 20, y);
        y += 4;
        doc.setDrawColor(220, 220, 225);
        doc.setLineWidth(0.3);
        doc.line(20, y, 190, y);
        y += 6;

        const drawCriteria = (title: string, desc: string) => {
          checkPageBreak(25);
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(40, 40, 45);
          doc.text(title, 20, y);
          y += 4.5;

          doc.setFont("Helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 85);
          const descLines = doc.splitTextToSize(sanitizeText(desc), 170);
          doc.text(descLines, 20, y);
          y += (descLines.length * 4.5) + 6;
        };

        drawCriteria("Grammatical Range & Accuracy (GRA)", result.criteria_scores.grammatical_accuracy);
        drawCriteria("Lexical Resource (LR)", result.criteria_scores.lexical_resource);
        drawCriteria("Fluency & Coherence (FC)", result.criteria_scores.coherence);
        if (activePromptInfo.type === "speaking" && result.criteria_scores.pronunciation) {
          drawCriteria("Pronunciation & Phonetics (PR)", result.criteria_scores.pronunciation);
        }
      }

      // 6. ACTIONABLE FEEDBACK & CRITIQUE
      if (pdfConfig.includeFeedback) {
        checkPageBreak(40);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 35);
        doc.text("4. EXPERT REMEDIAL CRITIQUE & INSIGHTS", 20, y);
        y += 4;
        doc.setDrawColor(220, 220, 225);
        doc.setLineWidth(0.3);
        doc.line(20, y, 190, y);
        y += 6;

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(50, 50, 55);
        const feedbackLines = doc.splitTextToSize(sanitizeText(result.constructive_feedback), 170);
        doc.text(feedbackLines, 20, y);
        y += (feedbackLines.length * 4.5) + 12;
      }

      // 7. OFFICIAL CERTIFICATION FOOTER
      checkPageBreak(20);
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.5);
      doc.line(20, 275, 190, 275);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(142, 146, 153);
      doc.text("LEXICON ACADEMY EVALUATION MATRIX • OFFICIALLY VERIFIED REPORT", 20, 280);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.text("This document is generated based on certified neural assessment models calibrated against CEFR indicators.", 20, 284);

      // Save PDF via iframe-safe dual download strategy
      const filename = `Lexicon_CEFR_Evaluation_${activePromptInfo.type}_${result.overall_assigned_level}_${new Date().toISOString().slice(0, 10)}.pdf`;
      
      try {
        doc.save(filename);
      } catch (saveErr) {
        console.warn("Direct PDF save failed, using fallback blob link...", saveErr);
        const blob = doc.output("blob");
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 300);
      }
    } catch (err) {
      console.error("Failed to generate evaluator PDF:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleReset = () => {
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel();
    }
    setIsSpeakingImproved(false);
    setIsSpeakingFeedback(false);
    setResult(null);
    setUserSubmission("");
    setError(null);
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      const synth = window.speechSynthesis;
      if (synth) {
        synth.cancel();
      }
    };
  }, []);

  // Web text-to-speech for speaking improved version
  const handleSpeakImproved = () => {
    if (!result) return;
    const synth = window.speechSynthesis;
    if (synth) {
      if (synth.speaking && isSpeakingImproved) {
        synth.cancel();
        setIsSpeakingImproved(false);
        return;
      }
      
      synth.cancel(); // Stop any other active speech
      setIsSpeakingFeedback(false);
      setIsSpeakingImproved(true);
      
      const utterance = new SpeechSynthesisUtterance(result.improved_version);
      utterance.lang = "en-GB"; // Elegant British accent
      utterance.rate = 0.95; // Slightly slower for comprehension
      
      utterance.onend = () => {
        setIsSpeakingImproved(false);
      };
      utterance.onerror = () => {
        setIsSpeakingImproved(false);
      };
      
      synth.speak(utterance);
    }
  };

  // Web text-to-speech for speaking constructive feedback corrections
  const handleSpeakFeedback = () => {
    if (!result) return;
    const synth = window.speechSynthesis;
    if (synth) {
      if (synth.speaking && isSpeakingFeedback) {
        synth.cancel();
        setIsSpeakingFeedback(false);
        return;
      }
      
      synth.cancel(); // Stop any other active speech
      setIsSpeakingImproved(false);
      setIsSpeakingFeedback(true);
      
      const utterance = new SpeechSynthesisUtterance(result.constructive_feedback);
      utterance.lang = "en-US"; // Clear American accent for pedagogical instructions
      utterance.rate = 0.95; // Slightly slower for comprehension
      
      utterance.onend = () => {
        setIsSpeakingFeedback(false);
      };
      utterance.onerror = () => {
        setIsSpeakingFeedback(false);
      };
      
      synth.speak(utterance);
    }
  };

  return (
    <div className="space-y-8 text-[#E0E0E0]" id="evaluator-tab">
      
      {/* 1. Prompt Selection Form */}
      {!result && !isLoading && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#141417] rounded-xl border border-white/5 p-6 md:p-8 shadow-2xl space-y-6"
          id="prompt-selection-card"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-serif text-white uppercase tracking-wider">CEFR Open-Ended Evaluation</h2>
              <p className="text-[#8E9299] text-xs">Test your active speaking or writing skills. Scored against official CEFR descriptors.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setCustomPromptEnabled(false)}
                className={`text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg font-bold border transition duration-200 cursor-pointer ${!customPromptEnabled ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-white/5 text-[#8E9299] border-white/10 hover:text-white hover:bg-white/10'}`}
              >
                Curated Tasks
              </button>
              <button 
                onClick={() => setCustomPromptEnabled(true)}
                className={`text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg font-bold border transition duration-200 cursor-pointer ${customPromptEnabled ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-white/5 text-[#8E9299] border-white/10 hover:text-white hover:bg-white/10'}`}
              >
                Custom Topic
              </button>
            </div>
          </div>

          {/* Curated Selectors */}
          {!customPromptEnabled ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#8E9299] uppercase tracking-widest block">Select Curated Task</label>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 border border-white/5 rounded-lg p-2 bg-[#0F0F12]">
                  {CURATED_PROMPTS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPrompt(p)}
                      className={`w-full text-left p-3 rounded-md text-xs flex items-center justify-between gap-3 border transition duration-200 cursor-pointer ${selectedPrompt.id === p.id ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40 shadow-sm font-semibold text-[#D4AF37]' : 'hover:bg-white/5 border-transparent text-[#8E9299]'}`}
                    >
                      <div className="flex items-center gap-2">
                        {p.type === "speaking" ? <Mic className="h-3.5 w-3.5 text-[#D4AF37]" /> : <FileText className="h-3.5 w-3.5 text-[#D4AF37]" />}
                        <span>{p.title}</span>
                      </div>
                      <span className="font-serif font-extrabold text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded border border-[#D4AF37]/20 uppercase">
                        {p.targetLevel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Curated Instructions display */}
              <div className="bg-[#0F0F12] rounded-lg p-5 border border-white/5 flex flex-col justify-between">
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-white uppercase tracking-wider text-[11px]">Active Task Details</span>
                    <span className="inline-flex items-center gap-1 bg-[#D4AF37]/10 text-[#D4AF37] font-bold px-2.5 py-1 rounded border border-[#D4AF37]/20 uppercase text-[10px] tracking-wider">
                      {selectedPrompt.type} • Level {selectedPrompt.targetLevel}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-white uppercase tracking-wider mb-0.5">{selectedPrompt.title}</h4>
                    <p className="text-[#8E9299] italic">"{selectedPrompt.scenario}"</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded border border-white/5 space-y-1">
                    <p className="font-serif font-bold text-white uppercase tracking-wider text-[10px]">Instructions:</p>
                    <p className="text-[#8E9299] leading-relaxed font-medium">{selectedPrompt.instructions}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Custom Prompt Formulation */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#8E9299] uppercase tracking-widest text-[10px]">Task Title</label>
                  <input
                    type="text"
                    placeholder="e.g. My Career Aspirations"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs text-[#E0E0E0] placeholder-[#8E9299]/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-[#8E9299] uppercase tracking-widest text-[10px]">Skills Type</label>
                    <select
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value as "writing" | "speaking")}
                      className="w-full px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs text-[#E0E0E0]"
                    >
                      <option value="writing">Writing (Essay/Text)</option>
                      <option value="speaking">Speaking (Speech Input)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#8E9299] uppercase tracking-widest text-[10px]">CEFR Target Level</label>
                    <select
                      value={customTargetLevel}
                      onChange={(e) => setCustomTargetLevel(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs text-[#E0E0E0]"
                    >
                      {["A0", "A1", "A2", "B1", "B2", "C1", "C2"].map(l => (
                        <option key={l} value={l}>Level {l}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#8E9299] uppercase tracking-widest text-[10px]">Context Scenario</label>
                  <textarea
                    rows={2}
                    placeholder="Describe the setting (e.g. An international job interview...)"
                    value={customScenario}
                    onChange={(e) => setCustomScenario(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs text-[#E0E0E0] placeholder-[#8E9299]/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#8E9299] uppercase tracking-widest text-[10px]">Evaluation Instructions</label>
                  <textarea
                    rows={2}
                    placeholder="Specify constraints (e.g. Discuss your previous roles, accomplishments...)"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs text-[#E0E0E0] placeholder-[#8E9299]/40"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Reading Speed Practice Session & WPM Metric Bento Grid */}
          <div className="bg-[#141417] rounded-xl border border-white/5 p-6 shadow-2xl space-y-6 mt-6" id="reading-speed-bento-grid">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#D4AF37]" />
                <div className="text-left">
                  <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
                    Interactive Reading Speed Evaluator
                  </h3>
                  <p className="text-[11px] text-[#8E9299]">
                    Analyze and record your Words Per Minute (WPM) cognitive intake speed on level-aligned materials.
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-mono bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded border border-[#D4AF37]/20 uppercase tracking-wider font-bold">
                Optional Speed Check
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Panel: Active Trainer Controls & Reader Card */}
              <div className="bg-[#0F0F12] border border-white/5 rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#8E9299] uppercase tracking-widest flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#D4AF37]" /> Active Speed Trainer
                    </span>
                    {isReading && (
                      <span className="text-[10px] font-mono text-[#D4AF37] font-black animate-pulse flex items-center gap-1 bg-[#D4AF37]/10 px-2.5 py-0.5 rounded border border-[#D4AF37]/25">
                        Elapsed Time: {readingSecondsElapsed}s
                      </span>
                    )}
                  </div>

                  {!isReading && !readingCompleted && (
                    <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="p-3 bg-white/5 rounded-full border border-white/5 text-[#8E9299]">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-serif font-bold text-white uppercase tracking-wider">Ready to practice reading?</h4>
                        <p className="text-[11px] text-[#8E9299] max-w-xs leading-relaxed">
                          The curated level-aligned reading passage will be unveiled when you press start to keep the timing exact.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleStartReading}
                        className="bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 px-5 py-2.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition cursor-pointer"
                      >
                        Start Reading Timer
                      </button>
                    </div>
                  )}

                  {isReading && (
                    <div className="space-y-4 text-left">
                      <div className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-2 animate-fade-in select-text">
                        <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                          <span className="text-[10px] font-serif font-black text-[#D4AF37] uppercase tracking-wider">
                            Passage: {getActiveReadingPassage().title}
                          </span>
                          <span className="text-[9px] font-mono text-[#8E9299]">
                            {getActiveReadingPassage().wordCount} Words
                          </span>
                        </div>
                        <p className="text-xs text-[#E0E0E0] leading-relaxed font-serif italic whitespace-pre-line select-text">
                          {getActiveReadingPassage().text}
                        </p>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleCancelReading}
                          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleFinishReading}
                          className="bg-emerald-500 hover:brightness-110 text-black font-extrabold px-5 py-2 rounded-lg text-[10px] uppercase tracking-widest transition cursor-pointer shadow-lg shadow-emerald-500/20"
                        >
                          Done Reading!
                        </button>
                      </div>
                    </div>
                  )}

                  {readingCompleted && readingWpm !== null && (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-lg text-xs space-y-3.5 animate-fade-in text-left">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                        <div>
                          <h4 className="font-serif font-bold text-white uppercase tracking-wider text-[11px]">Reading Speed Recorded!</h4>
                          <p className="text-[10px] text-[#8E9299]">Session completed successfully.</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-center py-1">
                        <div className="bg-white/5 p-2 rounded border border-white/5">
                          <span className="text-[9px] font-bold text-[#8E9299] uppercase tracking-widest block font-mono">Word Count</span>
                          <span className="text-base font-bold text-white font-mono">{getActiveReadingPassage().wordCount}</span>
                        </div>
                        <div className="bg-white/5 p-2 rounded border border-white/5">
                          <span className="text-[9px] font-bold text-[#8E9299] uppercase tracking-widest block font-mono">Duration</span>
                          <span className="text-base font-bold text-white font-mono">{readingSecondsElapsed}s</span>
                        </div>
                        <div className="bg-[#D4AF37]/10 p-2 rounded border border-[#D4AF37]/20">
                          <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest block font-mono">Reading Pace</span>
                          <span className="text-base font-black text-[#D4AF37] font-mono">{readingWpm} WPM</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-[#8E9299] leading-relaxed italic bg-[#0F0F12] p-2.5 rounded border border-white/5">
                        {readingWpm < 110 ? (
                          <span>Your speed is <strong>Beginner / Elementary</strong> pace. Focus on sentence tracking and active contextual vocabulary recognition.</span>
                        ) : readingWpm <= 160 ? (
                          <span>Your speed is <strong>Intermediate</strong> pace. Excellent visual digestion! Continue expanding your advanced idioms & syntactic fluency.</span>
                        ) : (
                          <span>Your speed is <strong>Advanced / Mastery</strong> pace! Outstanding cognitive processing and text parsing efficiency. Maintaining sterling fluency.</span>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleStartReading}
                          className="bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/20 px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition cursor-pointer"
                        >
                          Restart Speed Test
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Right Panel: Reading Speed Progress Trend Graph & Analytics */}
              <div className="bg-[#0F0F12] border border-white/5 rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#8E9299] uppercase tracking-widest flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-[#D4AF37]" /> Analytics & Trends
                    </span>
                    {readingHistory.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearReadingHistory}
                        className="text-[9px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider flex items-center gap-1 bg-red-500/5 hover:bg-red-500/10 px-2.5 py-1 rounded border border-red-500/10 cursor-pointer transition"
                      >
                        <Trash2 className="h-3 w-3" /> Reset Stats
                      </button>
                    )}
                  </div>

                  {readingHistory.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="p-3 bg-white/5 rounded-full border border-white/5 text-[#8E9299]/50">
                        <TrendingUp className="h-6 w-6" />
                      </div>
                      <div className="space-y-1 max-w-xs">
                        <h4 className="text-xs font-serif font-bold text-[#8E9299] uppercase tracking-wider">No history recorded yet</h4>
                        <p className="text-[10px] text-[#8E9299]/60 leading-relaxed">
                          Your calculated speed results will be charted here sequentially to display your visual comprehension progression.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Stats Overview Panel */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-white/5 p-2.5 rounded border border-white/5">
                          <span className="text-[8px] font-bold text-[#8E9299] uppercase tracking-widest block font-mono">Sessions</span>
                          <span className="text-lg font-bold text-white font-mono">{readingHistory.length}</span>
                        </div>
                        <div className="bg-white/5 p-2.5 rounded border border-white/5">
                          <span className="text-[8px] font-bold text-[#8E9299] uppercase tracking-widest block font-mono">Average WPM</span>
                          <span className="text-lg font-bold text-white font-mono">
                            {Math.round(readingHistory.reduce((acc, curr) => acc + curr.wpm, 0) / readingHistory.length)}
                          </span>
                        </div>
                        <div className="bg-[#D4AF37]/10 p-2.5 rounded border border-[#D4AF37]/20">
                          <span className="text-[8px] font-bold text-[#D4AF37] uppercase tracking-widest block font-mono">Personal Best</span>
                          <span className="text-lg font-black text-[#D4AF37] font-mono">
                            {Math.max(...readingHistory.map(h => h.wpm))}
                          </span>
                        </div>
                      </div>

                      {/* Recharts Reading Speed Trend Line chart */}
                      <div className="space-y-1.5 text-left">
                        <span className="text-[9px] font-bold text-[#8E9299] uppercase tracking-widest block">Words Per Minute (WPM) Progress Trend</span>
                        
                        {readingHistory.length > 1 ? (
                          <div className="h-44 mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={[...readingHistory].reverse()} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis 
                                  dataKey="date" 
                                  stroke="#8E9299" 
                                  fontSize={9}
                                  tickFormatter={(tick) => {
                                    try {
                                      return new Date(tick).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                                    } catch {
                                      return "";
                                    }
                                  }}
                                />
                                <YAxis stroke="#8E9299" fontSize={9} />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: "#141417", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                                  labelStyle={{ color: "#8E9299", fontSize: "9px" }}
                                  itemStyle={{ color: "#D4AF37", fontSize: "11px", fontWeight: "bold" }}
                                  labelFormatter={(label) => `Date: ${new Date(label).toLocaleString()}`}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="wpm" 
                                  stroke="#D4AF37" 
                                  strokeWidth={2.5} 
                                  activeDot={{ r: 5 }} 
                                  dot={{ stroke: "#D4AF37", strokeWidth: 1.5, r: 3, fill: "#141417" }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="py-12 text-center text-[10px] text-[#8E9299]/60 italic bg-white/5 border border-white/5 rounded-lg">
                            Complete at least 2 practice sessions to plot a reading speed trend graph.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>

          {/* Submission Area */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <label className="text-[10px] font-bold text-[#8E9299] uppercase tracking-widest flex items-center gap-1.5">
                {activePromptInfo.type === "speaking" ? <Mic className="h-4 w-4 text-[#D4AF37] animate-pulse" /> : <FileText className="h-4 w-4 text-[#D4AF37]" />}
                Your English Submission
              </label>

              {/* Web Speech API Toggle */}
              {speechSupported && (
                <button
                  type="button"
                  id="voice-mic-toggle-btn"
                  onClick={toggleRecording}
                  className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-2 rounded-lg border transition duration-200 cursor-pointer ${isRecording ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20'}`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-3.5 w-3.5 animate-bounce" /> Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5" /> {activePromptInfo.type === "speaking" ? "Speak with Microphone" : "Dictate Essay (Speech-to-Text)"}
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Pulsing visual wave during voice input */}
            {isRecording && (
              <div className="bg-red-950/20 border border-red-500/20 rounded-lg p-3 flex items-center gap-3 text-xs text-red-400">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="font-semibold">
                  {activePromptInfo.type === "speaking" 
                    ? "Transcribing speaking output... Speak clearly into your device microphone." 
                    : "Dictating essay draft... Speak clearly into your device microphone to transcribe."}
                </span>
              </div>
            )}

            <div className="relative">
              <textarea
                id="submission-textarea"
                rows={6}
                value={userSubmission}
                onChange={(e) => setUserSubmission(e.target.value)}
                placeholder={activePromptInfo.type === "speaking" 
                  ? "Either type your speaking response or use the microphone recorder to transcribe your voice directly..." 
                  : "Compose your essay, email, or response here..."}
                className="w-full p-4 bg-[#0F0F12] border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs md:text-sm font-sans leading-relaxed text-[#E0E0E0] placeholder-[#8E9299]/30 whitespace-pre-wrap"
              />
              <div className="absolute bottom-3 right-3 text-[10px] text-[#8E9299] font-bold">
                {userSubmission.trim().length} characters
              </div>
            </div>

            {/* Submission Error Banner */}
            {error && (
              <div className="bg-red-950/20 border border-red-500/20 text-red-400 p-4 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Bilingual Option */}
            <div className="bg-[#0F0F12] border border-white/5 rounded-lg p-4 flex items-center justify-between text-xs gap-4">
              <div className="space-y-0.5">
                <span className="font-serif font-bold text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  🇸🇦 Bilingual Report Summary (التقرير بالعربية)
                </span>
                <p className="text-[#8E9299] text-[11px]">Append key corrections and expert learning tips in Arabic to your final report.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleArabicFeedback(!arabicFeedback)}
                className={`px-3.5 py-2 rounded-md text-[9px] font-bold tracking-wider transition-all duration-200 cursor-pointer shrink-0 ${
                  arabicFeedback 
                    ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 font-bold" 
                    : "bg-white/5 text-[#8E9299] border border-white/5 hover:border-white/10"
                }`}
              >
                {arabicFeedback ? "مفعّل (ON)" : "تفعيل بالعربية"}
              </button>
            </div>

            {/* Action Submit */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
              <div className="text-[11px] text-[#8E9299] flex items-center gap-1.5 font-medium self-start sm:self-center">
                {draftSaveStatus ? (
                  <span className="text-[#D4AF37] font-bold animate-pulse flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 text-[#D4AF37]" /> {draftSaveStatus}
                  </span>
                ) : (
                  <span>Press <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded font-mono text-[9px] text-white">Ctrl+S</kbd> to save a draft essay</span>
                )}
              </div>
              <button
                id="submit-eval-btn"
                onClick={handleSubmit}
                disabled={userSubmission.trim().length < 15}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:brightness-110 text-black font-extrabold text-xs px-6 py-3.5 rounded-lg transition duration-200 shadow-lg shadow-[#D4AF37]/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer uppercase tracking-widest"
              >
                Submit for CEFR Evaluation <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center bg-[#141417] rounded-xl border border-white/5 p-8 shadow-2xl">
          <Loader2 className="h-10 w-10 text-[#D4AF37] animate-spin" />
          <div className="space-y-3 max-w-md">
            <h3 className="text-base font-serif text-white uppercase tracking-wider">Assessing English Competence</h3>
            <p className="text-xs text-[#8E9299]">
              A certified digital language evaluation is analyzing your grammatical accuracy, coherence patterns, and lexical range...
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-1.5">
              <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 font-bold uppercase px-2.5 py-1 rounded">Analyzing syntax (GRA)</span>
              <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 font-bold uppercase px-2.5 py-1 rounded">Evaluating lexis (LR)</span>
              <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 font-bold uppercase px-2.5 py-1 rounded">Checking connectors (FC)</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Render Results Report Card */}
      {result && !isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          id="evaluation-results-box"
        >
          {/* Left Column: Submissions Comparison & Native Rewrite */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* User Original text */}
            <div className="bg-[#141417] rounded-xl border border-white/5 p-5 shadow-2xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-[#8E9299] uppercase tracking-widest text-[10px]">Submitted Transcription</span>
                <span className="text-[9px] bg-white/5 text-white/80 font-bold px-2 py-0.5 rounded uppercase border border-white/10 tracking-wider">
                  Original
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#E0E0E0] leading-relaxed font-sans whitespace-pre-wrap bg-[#0F0F12] p-4 rounded-lg border border-white/5 italic">
                "{userSubmission}"
              </p>
            </div>

            {/* Improved version side-by-side card */}
            <div className="bg-[#141417] rounded-xl border border-white/5 p-5 shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                  <span className="text-xs font-bold text-white uppercase tracking-widest text-[10px]">Polished Native Reconstruction</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSpeakImproved}
                    className={`p-1.5 rounded border transition duration-200 cursor-pointer ${isSpeakingImproved ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-[#8E9299] hover:text-white'}`}
                    title={isSpeakingImproved ? "Stop speech" : "Speak text aloud (British Accent)"}
                  >
                    {isSpeakingImproved ? <VolumeX className="h-3.5 w-3.5 animate-pulse" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={handleCopyImproved}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest border border-white/10 hover:bg-white/10 rounded text-white bg-white/5 cursor-pointer transition"
                  >
                    <Copy className="h-3 w-3" /> {copiedText ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="bg-[#D4AF37]/5 p-4 rounded-lg border border-[#D4AF37]/10 text-xs md:text-sm text-white leading-relaxed font-serif italic whitespace-pre-wrap">
                {result.improved_version}
              </div>

              <div className="pt-2">
                <AudioPlayer 
                  textToSpeak={result.improved_version}
                  title="Polished Reconstruction Audio"
                  id="evaluator-improved-audio"
                />
              </div>

              <p className="text-[10px] text-[#8E9299]">
                *This polished version preserves your core thoughts but elevates word choices and structural accuracy to standard native levels. Listen to the high-fidelity pronunciation above!
              </p>
            </div>

            {/* Constructive critique panel */}
            <div className="bg-[#141417] rounded-xl border border-white/5 p-5 shadow-2xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-xs font-serif text-white uppercase tracking-wider block">Direct Actionable Critique</h3>
                <button
                  onClick={handleSpeakFeedback}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest border rounded transition duration-200 cursor-pointer ${isSpeakingFeedback ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 hover:text-white'}`}
                  title={isSpeakingFeedback ? "Stop reading critique" : "Listen to constructive feedback"}
                >
                  {isSpeakingFeedback ? (
                    <>
                      <VolumeX className="h-3.5 w-3.5 animate-pulse" /> Stop Voice
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5" /> Listen feedback
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-[#8E9299] leading-relaxed whitespace-pre-line">
                {result.constructive_feedback}
              </p>
            </div>
          </div>

          {/* Right Column: CEFR Score Breakdown Card */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Overall Assigned Level Banner */}
            <div className="bg-gradient-to-br from-[#141417] to-[#0F0F12] rounded-xl p-6 text-center text-white border border-white/10 shadow-2xl space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">Assessed CEFR Grade</span>
                <div className="text-6xl font-serif font-extrabold text-[#D4AF37] select-none tracking-tighter filter drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                  {result.overall_assigned_level}
                </div>
                <p className="text-xs font-semibold text-[#8E9299]">Communicative Performance Index</p>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setShowPdfPreviewModal(true)}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-[#D4AF37] hover:brightness-110 text-black text-xs font-black py-3 px-4 rounded-lg transition duration-200 cursor-pointer uppercase tracking-widest shadow-md shadow-[#D4AF37]/10"
                >
                  <Eye className="h-4 w-4" /> Download Report PDF
                </button>
                <button
                  onClick={handleReset}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold py-3 px-4 rounded-lg transition duration-200 cursor-pointer uppercase tracking-widest"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Start New Evaluation
                </button>
              </div>
            </div>

            {/* Scores breakdown according to weighted metrics */}
            <div className="bg-[#141417] rounded-xl border border-white/5 p-5 shadow-2xl space-y-4">
              <h3 className="text-xs font-serif text-white uppercase tracking-wider block border-b pb-2 border-white/5">Evaluative Criteria Matrix</h3>
              
              <div className="space-y-3 text-xs">
                {/* 1. Grammatical Range and Accuracy */}
                <div className="p-3 bg-[#0F0F12] rounded border border-white/5 space-y-1">
                  <div className="flex items-center justify-between font-serif font-bold text-white text-[11px] uppercase tracking-wider">
                    <span>Grammatical Range & Accuracy (GRA)</span>
                  </div>
                  <p className="text-[#8E9299] leading-relaxed text-[11px]">{result.criteria_scores.grammatical_accuracy}</p>
                </div>

                {/* 2. Lexical Resource */}
                <div className="p-3 bg-[#0F0F12] rounded border border-white/5 space-y-1">
                  <div className="flex items-center justify-between font-serif font-bold text-white text-[11px] uppercase tracking-wider">
                    <span>Lexical Resource (LR)</span>
                  </div>
                  <p className="text-[#8E9299] leading-relaxed text-[11px]">{result.criteria_scores.lexical_resource}</p>
                </div>

                {/* 3. Fluency & Coherence */}
                <div className="p-3 bg-[#0F0F12] rounded border border-white/5 space-y-1">
                  <div className="flex items-center justify-between font-serif font-bold text-white text-[11px] uppercase tracking-wider">
                    <span>Fluency & Coherence (FC)</span>
                  </div>
                  <p className="text-[#8E9299] leading-relaxed text-[11px]">{result.criteria_scores.coherence}</p>
                </div>

                {/* 4. Pronunciation/Phonetics if Speaking */}
                {activePromptInfo.type === "speaking" && result.criteria_scores.pronunciation && (
                  <div className="p-3 bg-[#0F0F12] rounded border border-white/5 space-y-1">
                    <div className="flex items-center justify-between font-serif font-bold text-white text-[11px] uppercase tracking-wider">
                      <span>Pronunciation & Phonetics</span>
                    </div>
                    <p className="text-[#8E9299] leading-relaxed text-[11px]">{result.criteria_scores.pronunciation}</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </motion.div>
      )}

      {/* 4. PDF Report Preview & Download Modal Overlay */}
      <AnimatePresence>
        {showPdfPreviewModal && result && (
          <div 
            className="fixed inset-0 z-[150] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            id="pdf-preview-modal-overlay"
          >
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-[#141417] border border-white/10 rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-[#0F0F12]">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37] border border-[#D4AF37]/20">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
                      Language Report Verification
                    </h3>
                    <p className="text-[10px] text-[#8E9299]">
                      Verify your official CEFR assessment details before downloading the PDF document
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowPdfPreviewModal(false)}
                  className="p-1.5 rounded-full hover:bg-white/5 text-[#8E9299] hover:text-white transition duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Configuration Panel + Scrollable Document Area (Simulated Paper) */}
              <div className="flex-1 overflow-hidden bg-[#0B0B0C] flex flex-col md:flex-row h-full">
                
                {/* PDF Configuration Panel */}
                <div className="w-full md:w-80 bg-[#141417] border-b md:border-b-0 md:border-r border-white/5 p-5 flex flex-col gap-4 overflow-y-auto shrink-0 text-left">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#8E9299] uppercase tracking-widest flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-[#D4AF37]" />
                      <span>PDF CONFIGURATOR</span>
                    </h4>
                    <p className="text-[10px] text-[#8E9299] leading-relaxed">
                      Select specific data points to render in the branded evaluation PDF report.
                    </p>
                  </div>

                  <div className="space-y-3 mt-2">
                    {/* Date toggle */}
                    <label className="flex items-start gap-2.5 p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg cursor-pointer transition select-none">
                      <input 
                        type="checkbox"
                        checked={pdfConfig.includeDate}
                        onChange={(e) => setPdfConfig(prev => ({ ...prev, includeDate: e.target.checked }))}
                        className="mt-0.5 h-3.5 w-3.5 rounded border-white/10 text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-0 accent-[#D4AF37] cursor-pointer"
                      />
                      <div>
                        <span className="text-[11px] font-bold text-white block">Document Date</span>
                        <span className="text-[9px] text-[#8E9299] block mt-0.5">Include the date and a random Report ID tracking stamp.</span>
                      </div>
                    </label>

                    {/* Original Submission toggle */}
                    <label className="flex items-start gap-2.5 p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg cursor-pointer transition select-none">
                      <input 
                        type="checkbox"
                        checked={pdfConfig.includeOriginal}
                        onChange={(e) => setPdfConfig(prev => ({ ...prev, includeOriginal: e.target.checked }))}
                        className="mt-0.5 h-3.5 w-3.5 rounded border-white/10 text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-0 accent-[#D4AF37] cursor-pointer"
                      />
                      <div>
                        <span className="text-[11px] font-bold text-white block">Original Submission</span>
                        <span className="text-[9px] text-[#8E9299] block mt-0.5">Include the original user transcript input in the final document.</span>
                      </div>
                    </label>

                    {/* Polished Native Reconstruction toggle */}
                    <label className="flex items-start gap-2.5 p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg cursor-pointer transition select-none">
                      <input 
                        type="checkbox"
                        checked={pdfConfig.includePolished}
                        onChange={(e) => setPdfConfig(prev => ({ ...prev, includePolished: e.target.checked }))}
                        className="mt-0.5 h-3.5 w-3.5 rounded border-white/10 text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-0 accent-[#D4AF37] cursor-pointer"
                      />
                      <div>
                        <span className="text-[11px] font-bold text-white block">Polished Reconstruction</span>
                        <span className="text-[9px] text-[#8E9299] block mt-0.5">Include the reconstructed native CEFR phrasing block.</span>
                      </div>
                    </label>

                    {/* Detailed Criteria Matrix toggle */}
                    <label className="flex items-start gap-2.5 p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg cursor-pointer transition select-none">
                      <input 
                        type="checkbox"
                        checked={pdfConfig.includeCriteria}
                        onChange={(e) => setPdfConfig(prev => ({ ...prev, includeCriteria: e.target.checked }))}
                        className="mt-0.5 h-3.5 w-3.5 rounded border-white/10 text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-0 accent-[#D4AF37] cursor-pointer"
                      />
                      <div>
                        <span className="text-[11px] font-bold text-white block">Score Breakdown Matrix</span>
                        <span className="text-[9px] text-[#8E9299] block mt-0.5">Include detailed performance breakdown criteria list.</span>
                      </div>
                    </label>

                    {/* Expert Remedial Critique toggle */}
                    <label className="flex items-start gap-2.5 p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg cursor-pointer transition select-none">
                      <input 
                        type="checkbox"
                        checked={pdfConfig.includeFeedback}
                        onChange={(e) => setPdfConfig(prev => ({ ...prev, includeFeedback: e.target.checked }))}
                        className="mt-0.5 h-3.5 w-3.5 rounded border-white/10 text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-0 accent-[#D4AF37] cursor-pointer"
                      />
                      <div>
                        <span className="text-[11px] font-bold text-white block">Feedback & Critique Details</span>
                        <span className="text-[9px] text-[#8E9299] block mt-0.5">Include remedial critique instructions and core insights.</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Right: Simulated Paper Sheet (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 flex justify-center">
                  <div className="w-full max-w-[210mm] bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 overflow-hidden font-sans p-8 md:p-12 space-y-6 select-text text-left h-fit">
                    
                    {/* Document Header Branding */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-[#D4AF37] pb-4">
                      <div>
                        <h1 className="text-2xl font-serif font-black tracking-tight text-[#D4AF37]">
                          LEXICON ACADEMY
                        </h1>
                        <p className="text-xs text-slate-500 font-medium tracking-wide">
                          Official CEFR Competence & Evaluation Record
                        </p>
                      </div>
                      <div className="text-left sm:text-right text-[11px] text-slate-500 font-mono font-bold uppercase space-y-0.5">
                        <div>Report ID: EXAM-{Math.floor(100000 + Math.random() * 900000)}</div>
                        {pdfConfig.includeDate && (
                          <div>Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
                        )}
                      </div>
                    </div>

                    {/* Summary Profile Block */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                      <div className="p-5 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-200 bg-slate-100/50">
                        <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-1">
                          CEFR GRADE
                        </span>
                        <div className="text-5xl font-serif font-black text-[#D4AF37] drop-shadow-sm leading-none">
                          {result.overall_assigned_level}
                        </div>
                      </div>
                      
                      <div className="p-5 sm:col-span-3 space-y-1">
                        <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block">
                          ASSESSMENT SUBJECT
                        </span>
                        <h2 className="text-sm font-bold text-slate-800 font-serif leading-tight">
                          {activePromptInfo.title}
                        </h2>
                        <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-slate-600">
                          <span className="bg-slate-200/60 px-2 py-0.5 rounded font-medium">
                            TYPE: {activePromptInfo.type.toUpperCase()} EVALUATION
                          </span>
                          <span className="bg-slate-200/60 px-2 py-0.5 rounded font-medium">
                            TARGET LEVEL: {activePromptInfo.targetLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Original Submission Section */}
                    {pdfConfig.includeOriginal && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-serif font-black uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                          <span>1. Original Transcription / Submission</span>
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50/50 p-4 rounded border border-slate-100 whitespace-pre-wrap">
                          "{userSubmission}"
                        </p>
                      </div>
                    )}

                    {/* Polished Reconstruction Section */}
                    {pdfConfig.includePolished && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-serif font-black uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                          <span>2. Polished Native Reconstruction</span>
                        </h3>
                        <div className="text-xs text-slate-800 leading-relaxed bg-[#FEFCF3] p-4 rounded border border-[#F6E6C2] whitespace-pre-wrap">
                          {result.improved_version}
                        </div>
                      </div>
                    )}

                    {/* Evaluation Criteria Matrix Section */}
                    {pdfConfig.includeCriteria && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-serif font-black uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                          <span>3. Detailed Criteria Matrix</span>
                        </h3>
                        
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex justify-between">
                              <span>Grammatical Range & Accuracy (GRA)</span>
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {result.criteria_scores.grammatical_accuracy}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex justify-between">
                              <span>Lexical Resource (LR)</span>
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {result.criteria_scores.lexical_resource}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex justify-between">
                              <span>Fluency & Coherence (FC)</span>
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {result.criteria_scores.coherence}
                            </p>
                          </div>

                          {activePromptInfo.type === "speaking" && result.criteria_scores.pronunciation && (
                            <div className="space-y-1">
                              <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex justify-between">
                                <span>Pronunciation & Phonetics (PR)</span>
                              </h4>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {result.criteria_scores.pronunciation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Constructive feedback */}
                    {pdfConfig.includeFeedback && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-serif font-black uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                          <span>4. Expert Remedial Critique & Insights</span>
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                          {result.constructive_feedback}
                        </p>
                      </div>
                    )}

                    {/* Document Footer Verification stamp */}
                    <div className="border-t border-[#D4AF37] pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[9px] text-slate-400">
                      <div>
                        <p className="font-bold text-slate-500">LEXICON ACADEMY EVALUATION MATRIX • OFFICIALLY VERIFIED REPORT</p>
                        <p className="mt-0.5">This document is generated based on certified neural assessment models calibrated against CEFR indicators.</p>
                      </div>
                      <div className="border border-slate-300 rounded px-2.5 py-1 text-slate-500 font-mono font-bold uppercase tracking-widest text-center shrink-0">
                        SECURE DIGITAL VERIFIED
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 border-t border-white/5 bg-[#0F0F12]">
                <div className="text-[10px] text-[#8E9299]">
                  This document serves as a durable academic language record.
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowPdfPreviewModal(false)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition duration-200 cursor-pointer uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generatePDFReport}
                    disabled={isGeneratingPdf}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#D4AF37] hover:brightness-110 text-black text-xs font-black px-5 py-2.5 rounded-lg transition duration-200 cursor-pointer uppercase tracking-widest disabled:opacity-50"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Compiling...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" /> Download Official PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
