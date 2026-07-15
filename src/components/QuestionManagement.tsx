import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  BookOpen, 
  FileText, 
  Sparkles,
  Layers,
  ChevronRight,
  Database,
  Undo,
  Check,
  Play
} from "lucide-react";
import confetti from "canvas-confetti";
import { CEFRLevel, SkillType, CEFRQuestion } from "../types";

const ALL_LEVELS: CEFRLevel[] = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
const ALL_SKILLS: SkillType[] = ["Grammar", "Vocabulary", "Listening", "Reading", "Speaking", "Writing"];

interface QuestionManagementProps {
  onQuestionsUpdated?: () => void;
}

export default function QuestionManagement({ onQuestionsUpdated }: QuestionManagementProps) {
  // Main Questions Bank
  const [questions, setQuestions] = useState<CEFRQuestion[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("lexicon_custom_questions") || "[]");
    } catch {
      return [];
    }
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("lexicon_custom_questions", JSON.stringify(questions));
    if (onQuestionsUpdated) {
      onQuestionsUpdated();
    }
  }, [questions]);

  // Tab State: CEFR Level Filter
  const [activeLevelTab, setActiveLevelTab] = useState<CEFRLevel | "All">("All");
  
  // Skill Filter
  const [activeSkillFilter, setActiveSkillFilter] = useState<SkillType | "All">("All");

  // Search Query
  const [searchQuery, setSearchQuery] = useState("");

  // Editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form Fields State
  const [formLevel, setFormLevel] = useState<CEFRLevel>("B1");
  const [formSkill, setFormSkill] = useState<SkillType>("Grammar");
  const [formCanDo, setFormCanDo] = useState("");
  const [formScenario, setFormScenario] = useState("");
  const [formQuestionText, setFormQuestionText] = useState("");
  const [formOptA, setFormOptA] = useState("");
  const [formOptB, setFormOptB] = useState("");
  const [formOptC, setFormOptC] = useState("");
  const [formOptD, setFormOptD] = useState("");
  const [formCorrect, setFormCorrect] = useState<"A" | "B" | "C" | "D">("A");
  const [formExplanation, setFormExplanation] = useState("");

  // Feedback states
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Testing / Previewing question modal
  const [previewQuestion, setPreviewQuestion] = useState<CEFRQuestion | null>(null);
  const [previewSelectedOption, setPreviewSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [previewAnswered, setPreviewAnswered] = useState(false);

  // File Input Ref for import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter and Search logic
  const filteredQuestions = questions.filter((q, index) => {
    const matchesLevel = activeLevelTab === "All" || q.cefr_level === activeLevelTab;
    const matchesSkill = activeSkillFilter === "All" || q.skill_type === activeSkillFilter;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      q.question_text.toLowerCase().includes(searchLower) ||
      q.can_do_statement.toLowerCase().includes(searchLower) ||
      q.context_scenario.toLowerCase().includes(searchLower) ||
      q.pedagogical_explanation.toLowerCase().includes(searchLower) ||
      [q.options.A, q.options.B, q.options.C, q.options.D].some(opt => opt.toLowerCase().includes(searchLower));

    return matchesLevel && matchesSkill && matchesSearch;
  });

  // Handle Form Submit (Add or Edit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    // Validate
    if (!formCanDo.trim()) {
      setErrorMsg("عبارة الإنجاز المستهدفة مطلوبة / Can-Do statement is required.");
      return;
    }
    if (!formScenario.trim()) {
      setErrorMsg("سياق أو حوار الموقف مطلوب / Scenario/context is required.");
      return;
    }
    if (!formQuestionText.trim()) {
      setErrorMsg("نص السؤال مطلوب / Question text is required.");
      return;
    }
    if (!formOptA.trim() || !formOptB.trim() || !formOptC.trim() || !formOptD.trim()) {
      setErrorMsg("جميع الخيارات الأربعة مطلوبة / All 4 options are required.");
      return;
    }
    if (!formExplanation.trim()) {
      setErrorMsg("التفسير التعليمي مطلوب / Pedagogical explanation is required.");
      return;
    }

    const questionData: CEFRQuestion = {
      cefr_level: formLevel,
      skill_type: formSkill,
      can_do_statement: formCanDo.trim(),
      context_scenario: formScenario.trim(),
      question_text: formQuestionText.trim(),
      options: {
        A: formOptA.trim(),
        B: formOptB.trim(),
        C: formOptC.trim(),
        D: formOptD.trim()
      },
      correct_option: formCorrect,
      pedagogical_explanation: formExplanation.trim()
    };

    if (editingIndex !== null) {
      // Edit mode
      const updated = [...questions];
      updated[editingIndex] = questionData;
      setQuestions(updated);
      setSuccessMsg("تم تعديل السؤال بنجاح! / Question updated successfully!");
      setEditingIndex(null);
    } else {
      // Add mode
      setQuestions(prev => [questionData, ...prev]);
      setSuccessMsg("تم إضافة السؤال المخصص بنجاح! / Custom question added successfully!");
    }

    // Trigger confetti on success
    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.85 }
      });
    } catch {}

    // Reset Form (retain level & skill for convenience)
    setFormCanDo("");
    setFormScenario("");
    setFormQuestionText("");
    setFormOptA("");
    setFormOptB("");
    setFormOptC("");
    setFormOptD("");
    setFormCorrect("A");
    setFormExplanation("");
  };

  // Start Editing Question
  const startEdit = (q: CEFRQuestion, globalIndex: number) => {
    setEditingIndex(globalIndex);
    setFormLevel(q.cefr_level);
    setFormSkill(q.skill_type);
    setFormCanDo(q.can_do_statement);
    setFormScenario(q.context_scenario);
    setFormQuestionText(q.question_text);
    setFormOptA(q.options.A);
    setFormOptB(q.options.B);
    setFormOptC(q.options.C);
    setFormOptD(q.options.D);
    setFormCorrect(q.correct_option);
    setFormExplanation(q.pedagogical_explanation);
    
    // Scroll to form smoothly
    const formEl = document.getElementById("question-form-section");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Cancel Editing
  const cancelEdit = () => {
    setEditingIndex(null);
    setFormCanDo("");
    setFormScenario("");
    setFormQuestionText("");
    setFormOptA("");
    setFormOptB("");
    setFormOptC("");
    setFormOptD("");
    setFormCorrect("A");
    setFormExplanation("");
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  // Delete Question
  const handleDelete = (indexToDelete: number) => {
    if (confirm("هل أنت متأكد من حذف هذا السؤال؟ / Are you sure you want to delete this question?")) {
      setQuestions(prev => prev.filter((_, idx) => idx !== indexToDelete));
      if (editingIndex === indexToDelete) {
        cancelEdit();
      }
    }
  };

  // Export Bank as JSON
  const handleExport = () => {
    if (questions.length === 0) {
      alert("بنك الأسئلة فارغ حالياً! / Question bank is currently empty!");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cefr_custom_questions_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Bank from JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (!Array.isArray(imported)) {
          throw new Error("Invalid format. Must be a JSON array.");
        }

        // Basic verification
        const validated: CEFRQuestion[] = imported.filter((item: any) => {
          return (
            item &&
            typeof item.cefr_level === "string" &&
            typeof item.skill_type === "string" &&
            typeof item.question_text === "string" &&
            item.options &&
            typeof item.options.A === "string" &&
            typeof item.correct_option === "string"
          );
        });

        if (validated.length === 0) {
          alert("لا توجد أسئلة صالحة في الملف المرفوع! / No valid CEFR questions found in the file.");
          return;
        }

        if (confirm(`تم العثور على ${validated.length} سؤالاً. هل تريد دمجها مع أسئلتك الحالية؟ (إلغاء للاستبدال الكامل)\nFound ${validated.length} questions. Merge with existing ones? (Cancel to replace all)`)) {
          setQuestions(prev => [...validated, ...prev]);
        } else if (confirm("هل تريد استبدال بنك الأسئلة بالكامل؟ / Do you want to overwrite your entire bank?")) {
          setQuestions(validated);
        }

        setSuccessMsg(`تم استيراد ${validated.length} من الأسئلة بنجاح! / Successfully imported ${validated.length} questions!`);
        
        try {
          confetti({ particleCount: 60, spread: 70 });
        } catch {}
      } catch (err) {
        alert("فشل استيراد الملف. تأكد من صحة صيغة JSON / Failed to parse file. Make sure it is a valid JSON file.");
      }
    };
    reader.readAsText(file);
    // Reset file input value to allow uploading same file again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Seed samples
  const seedSamples = () => {
    const samples: CEFRQuestion[] = [
      {
        cefr_level: "A1",
        skill_type: "Grammar",
        can_do_statement: "Can ask and answer simple questions about personal details.",
        context_scenario: "Meeting a classmate at the university campus entrance.",
        question_text: "Choose the correct question to ask someone's name:",
        options: {
          A: "What is your name?",
          B: "Who is your name?",
          C: "How you name?",
          D: "Where is name?"
        },
        correct_option: "A",
        pedagogical_explanation: "In English, we use the question word 'What' to ask for a name, accompanied by the copula verb 'is'."
      },
      {
        cefr_level: "B2",
        skill_type: "Vocabulary",
        can_do_statement: "Can understand complex vocabulary and idiomatic phrases.",
        context_scenario: "Two business colleagues discussing a project timeline in the meeting room.",
        question_text: "What does the idiom 'beat around the bush' mean?",
        options: {
          A: "To speak directly and to the point.",
          B: "To avoid talking about the main topic directly.",
          C: "To plant shrubs in the garden.",
          D: "To complete a task ahead of schedule."
        },
        correct_option: "B",
        pedagogical_explanation: "'Beat around the bush' is a common B2-level idiom referring to stalling or avoiding speaking directly about an issue."
      },
      {
        cefr_level: "C1",
        skill_type: "Reading",
        can_do_statement: "Can understand wide range of demanding, longer texts.",
        context_scenario: "An excerpt from an editorial critique about artificial intelligence in contemporary art.",
        question_text: "According to the critic, why does AI art challenge traditional aesthetic values?",
        options: {
          A: "It lacks conscious intent and human emotional resonance.",
          B: "It is far cheaper to produce than classical oil canvases.",
          C: "It is generated too quickly to be appreciated.",
          D: "It uses digital screens instead of natural materials."
        },
        correct_option: "A",
        pedagogical_explanation: "At C1, texts explore abstract issues. Traditional aesthetics prioritize human intent and emotion, which AI lacks."
      }
    ];

    if (confirm("هل تريد إضافة 3 أسئلة نموذجية كعينة؟ / Do you want to seed 3 sample template questions?")) {
      setQuestions(prev => [...samples, ...prev]);
      setSuccessMsg("تم إضافة عينات الأسئلة بنجاح! / Sample questions seeded successfully!");
    }
  };

  // Handle Preview Practice
  const openPreview = (q: CEFRQuestion) => {
    setPreviewQuestion(q);
    setPreviewSelectedOption(null);
    setPreviewAnswered(false);
  };

  return (
    <div className="space-y-6 text-[#E0E0E0]" id="question-management-view">
      
      {/* 1. Header Area */}
      <div className="bg-[#141417] rounded-xl border border-white/5 p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20 text-[#D4AF37]">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-serif text-white uppercase tracking-wider">إدارة وبنك الأسئلة المخصصة / CEFR Custom Question Bank</h2>
            <p className="text-[#8E9299] text-xs mt-1">
              أدخل، عدّل، واحذف أسئلة مخصصة يدوياً لكل مستوى CEFR ومهارة لاستخدامها فورياً في منصة التدريب الذاتي!
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={seedSamples}
            className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-[#D4AF37] border border-[#D4AF37]/25 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
            title="Seed template questions to explore"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>عينات نموذجية / Seed Samples</span>
          </button>
          
          <button
            onClick={handleExport}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
            title="Download your questions as JSON file"
          >
            <Download className="h-3.5 w-3.5" />
            <span>تصدير البنك / Export JSON</span>
          </button>

          <label className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5">
            <Upload className="h-3.5 w-3.5" />
            <span>استيراد أسئلة / Import JSON</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 2. Left Column: Add / Edit Question Form */}
        <div 
          className="lg:col-span-5 bg-[#141417] rounded-xl border border-white/5 p-6 shadow-2xl space-y-5"
          id="question-form-section"
        >
          <div className="border-b border-white/5 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-serif text-white uppercase tracking-wider flex items-center gap-2">
              {editingIndex !== null ? (
                <>
                  <Edit3 className="h-4 w-4 text-amber-400" />
                  <span className="text-amber-400">تعديل السؤال / Edit Question #{editingIndex + 1}</span>
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 text-[#D4AF37]" />
                  <span>إضافة سؤال مخصص / Add Custom Question</span>
                </>
              )}
            </h3>
            {editingIndex !== null && (
              <button
                onClick={cancelEdit}
                className="text-[10px] font-bold text-[#8E9299] hover:text-white uppercase tracking-wider flex items-center gap-1"
              >
                <Undo className="h-3 w-3" />
                <span>إلغاء / Cancel</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Level & Skill selectors */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="font-bold text-[#8E9299] uppercase tracking-widest text-[9px] block">
                  المستوى المستهدف / CEFR Level
                </label>
                <select
                  value={formLevel}
                  onChange={(e) => setFormLevel(e.target.value as CEFRLevel)}
                  className="w-full px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF37] text-white"
                >
                  {ALL_LEVELS.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#8E9299] uppercase tracking-widest text-[9px] block">
                  المهارة / Competency Skill
                </label>
                <select
                  value={formSkill}
                  onChange={(e) => setFormSkill(e.target.value as SkillType)}
                  className="w-full px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF37] text-white"
                >
                  {ALL_SKILLS.map(sk => (
                    <option key={sk} value={sk}>{sk}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* CEFR Can-Do Statement */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#8E9299] uppercase tracking-widest text-[9px] block">
                مؤشر عبارة الإنجاز المستهدف / CEFR Can-Do Statement
              </label>
              <input
                type="text"
                value={formCanDo}
                onChange={(e) => setFormCanDo(e.target.value)}
                placeholder="e.g. Can write clear, detailed texts on various subjects."
                className="w-full px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF37] text-white placeholder-slate-600"
              />
            </div>

            {/* Scenario / Context */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#8E9299] uppercase tracking-widest text-[9px] block">
                موقف الحوار أو سياق الموقف / Context Scenario or Dialogue
              </label>
              <textarea
                value={formScenario}
                onChange={(e) => setFormScenario(e.target.value)}
                placeholder="e.g. Dialogue in a travel agency context, or a brief analytical prompt."
                rows={3}
                className="w-full px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF37] text-white placeholder-slate-600 font-mono"
              />
            </div>

            {/* Question Text */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#8E9299] uppercase tracking-widest text-[9px] block">
                نص السؤال المباشر / Direct Question Text
              </label>
              <input
                type="text"
                value={formQuestionText}
                onChange={(e) => setFormQuestionText(e.target.value)}
                placeholder="e.g. Which modal verb correctly denotes past ability?"
                className="w-full px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF37] text-white placeholder-slate-600"
              />
            </div>

            {/* Options A, B, C, D */}
            <div className="space-y-2.5">
              <label className="font-bold text-[#8E9299] uppercase tracking-widest text-[9px] block">
                خيارات الإجابة الأربعة / Multiple Choice Options
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center bg-[#0F0F12] border border-white/10 rounded-lg px-2.5 focus-within:border-[#D4AF37]">
                  <span className="font-mono font-bold text-[#D4AF37] mr-1.5">A</span>
                  <input
                    type="text"
                    value={formOptA}
                    onChange={(e) => setFormOptA(e.target.value)}
                    placeholder="Option A Text"
                    className="w-full py-2 bg-transparent border-none text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>
                <div className="flex items-center bg-[#0F0F12] border border-white/10 rounded-lg px-2.5 focus-within:border-[#D4AF37]">
                  <span className="font-mono font-bold text-[#D4AF37] mr-1.5">B</span>
                  <input
                    type="text"
                    value={formOptB}
                    onChange={(e) => setFormOptB(e.target.value)}
                    placeholder="Option B Text"
                    className="w-full py-2 bg-transparent border-none text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>
                <div className="flex items-center bg-[#0F0F12] border border-white/10 rounded-lg px-2.5 focus-within:border-[#D4AF37]">
                  <span className="font-mono font-bold text-[#D4AF37] mr-1.5">C</span>
                  <input
                    type="text"
                    value={formOptC}
                    onChange={(e) => setFormOptC(e.target.value)}
                    placeholder="Option C Text"
                    className="w-full py-2 bg-transparent border-none text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>
                <div className="flex items-center bg-[#0F0F12] border border-white/10 rounded-lg px-2.5 focus-within:border-[#D4AF37]">
                  <span className="font-mono font-bold text-[#D4AF37] mr-1.5">D</span>
                  <input
                    type="text"
                    value={formOptD}
                    onChange={(e) => setFormOptD(e.target.value)}
                    placeholder="Option D Text"
                    className="w-full py-2 bg-transparent border-none text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Correct Option Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#8E9299] uppercase tracking-widest text-[9px] block">
                الخيار الصحيح / Correct Answer Option
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["A", "B", "C", "D"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormCorrect(opt)}
                    className={`py-2 rounded-lg border font-bold text-center transition duration-150 cursor-pointer ${
                      formCorrect === opt
                        ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/15"
                        : "bg-[#0F0F12] border-white/10 text-[#8E9299] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Pedagogical Explanation */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#8E9299] uppercase tracking-widest text-[9px] block">
                التعليق والتفسير التعليمي للإجابة / Pedagogical Explanation
              </label>
              <textarea
                value={formExplanation}
                onChange={(e) => setFormExplanation(e.target.value)}
                placeholder="Explain why the chosen option is correct and provide learning hints."
                rows={3}
                className="w-full px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF37] text-white placeholder-slate-600"
              />
            </div>

            {/* Feedback Alerts */}
            {errorMsg && (
              <div className="bg-red-950/20 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit Actions */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B59124] hover:from-[#E4C563] hover:to-[#D4AF37] text-black font-extrabold text-[10px] px-6 py-3.5 rounded-lg transition duration-200 shadow-xl shadow-[#D4AF37]/10 cursor-pointer uppercase tracking-widest"
              >
                {editingIndex !== null ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>تحديث السؤال / Update Question</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    <span>إضافة السؤال للبنك / Add to Bank</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 3. Right Column: Filters and Custom Bank List */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Filters Dashboard */}
          <div className="bg-[#141417] rounded-xl border border-white/5 p-5 shadow-2xl space-y-4">
            
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8E9299]/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث بالكلمات المفتاحية أو رقم السؤال / Search questions by keywords..."
                className="w-full pl-9 pr-4 py-2 bg-[#0F0F12] border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-[10px] text-[#8E9299] hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Level Selector Tabs */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#8E9299] uppercase tracking-wider block">
                تصفية حسب المستوى / CEFR Level Tab Filter
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setActiveLevelTab("All")}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider transition cursor-pointer ${
                    activeLevelTab === "All"
                      ? "bg-[#D4AF37] text-black font-extrabold"
                      : "bg-[#0F0F12] border border-white/5 text-[#8E9299] hover:text-white hover:bg-white/5"
                  }`}
                >
                  All levels ({questions.length})
                </button>
                {ALL_LEVELS.map(lvl => {
                  const count = questions.filter(q => q.cefr_level === lvl).length;
                  return (
                    <button
                      key={lvl}
                      onClick={() => setActiveLevelTab(lvl)}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider transition cursor-pointer flex items-center gap-1 ${
                        activeLevelTab === lvl
                          ? "bg-[#D4AF37] text-black font-extrabold"
                          : "bg-[#0F0F12] border border-white/5 text-[#8E9299] hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span>{lvl}</span>
                      {count > 0 && (
                        <span className={`text-[8px] font-mono px-1 rounded-full ${
                          activeLevelTab === lvl ? "bg-black/20 text-black font-black" : "bg-white/10 text-white"
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skill Selector Tabs */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#8E9299] uppercase tracking-wider block">
                تصفية حسب المهارة / Competency Filter
              </span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setActiveSkillFilter("All")}
                  className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition cursor-pointer ${
                    activeSkillFilter === "All"
                      ? "bg-amber-500/20 text-[#D4AF37] border border-[#D4AF37]/30"
                      : "bg-[#0F0F12] text-[#8E9299] hover:text-white"
                  }`}
                >
                  All Skills
                </button>
                {ALL_SKILLS.map(sk => {
                  const count = questions.filter(q => q.skill_type === sk).length;
                  return (
                    <button
                      key={sk}
                      onClick={() => setActiveSkillFilter(sk)}
                      className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition cursor-pointer flex items-center gap-1.5 ${
                        activeSkillFilter === sk
                          ? "bg-amber-500/25 text-[#D4AF37] border border-[#D4AF37]/45"
                          : "bg-[#0F0F12] text-[#8E9299] hover:text-white"
                      }`}
                    >
                      <span>{sk}</span>
                      {count > 0 && (
                        <span className="text-[8px] font-mono px-1 bg-white/5 text-[#8E9299] rounded">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Questions Bank List */}
          <div className="bg-[#141417] rounded-xl border border-white/5 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-xs font-serif text-white uppercase tracking-wider flex items-center gap-2">
                <span>الأسئلة الحالية في البنك / Question Items</span>
                <span className="text-[10px] font-mono text-[#8E9299]">
                  ({filteredQuestions.length} of {questions.length} shown)
                </span>
              </h3>
            </div>

            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <BookOpen className="h-10 w-10 text-[#8E9299]/30 mx-auto" />
                <p className="text-xs text-[#8E9299]">
                  لا توجد أسئلة تطابق الفلاتر المحددة / No matching questions.
                </p>
                <p className="text-[10px] text-[#8E9299]/60 max-w-xs mx-auto">
                  قم بإدخال أسئلة جديدة عبر النموذج على اليسار، أو اضغط على "عينات نموذجية" لبدء الاستكشاف السريع.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
                {filteredQuestions.map((q, idx) => {
                  // Find the exact global index in original array
                  const globalIdx = questions.indexOf(q);
                  return (
                    <div 
                      key={globalIdx} 
                      className="bg-[#0F0F12] border border-white/5 hover:border-[#D4AF37]/20 rounded-lg p-4 space-y-3.5 transition duration-150 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#D4AF37] text-[9px] font-black px-2 py-0.5 rounded font-mono uppercase">
                            {q.cefr_level}
                          </span>
                          <span className="bg-white/5 border border-white/10 text-[#8E9299] text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                            {q.skill_type}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          {/* Play Preview */}
                          <button
                            onClick={() => openPreview(q)}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-md transition cursor-pointer border border-emerald-500/15"
                            title="Test / Preview this question"
                          >
                            <Play className="h-3 w-3" />
                          </button>
                          
                          {/* Edit Button */}
                          <button
                            onClick={() => startEdit(q, globalIdx)}
                            className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-[#D4AF37] rounded-md transition cursor-pointer border border-[#D4AF37]/15"
                            title="Edit question details"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(globalIdx)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition cursor-pointer border border-red-500/15"
                            title="Delete question from bank"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-white font-serif leading-relaxed text-[11px]">{q.question_text}</p>
                        <p className="text-[#8E9299] text-[10px] leading-relaxed italic font-mono"><strong className="text-amber-500/70 not-italic">Can-do:</strong> {q.can_do_statement}</p>
                      </div>

                      {/* Display scenario preview */}
                      <div className="bg-[#141417] p-2.5 rounded border border-white/5 text-[10px] font-mono leading-relaxed text-[#8E9299] line-clamp-3">
                        {q.context_scenario}
                      </div>

                      {/* Display options */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 text-[10px]">
                        {Object.entries(q.options).map(([letter, text]) => (
                          <div 
                            key={letter} 
                            className={`px-2 py-1.5 rounded border ${
                              q.correct_option === letter 
                                ? "bg-emerald-950/20 border-emerald-500/25 text-emerald-400 font-bold" 
                                : "bg-white/5 border-transparent text-[#8E9299]"
                            }`}
                          >
                            <span className="font-mono mr-1.5 font-bold text-[#D4AF37]">{letter}:</span> {text}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* 4. Question Testing/Previewing Modal Dialog */}
      <AnimatePresence>
        {previewQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141417] border border-white/10 rounded-2xl w-full max-w-xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-[#E0E0E0] space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#D4AF37] text-[10px] font-black px-2 py-0.5 rounded font-mono uppercase">
                    {previewQuestion.cefr_level}
                  </span>
                  <span className="bg-white/5 border border-white/10 text-[#8E9299] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                    {previewQuestion.skill_type}
                  </span>
                  <span className="text-[10px] text-[#8E9299]">معاينة وتجربة السؤال / Test Preview</span>
                </div>
                <button
                  onClick={() => setPreviewQuestion(null)}
                  className="p-1 rounded hover:bg-white/5 text-slate-300"
                >
                  ✕
                </button>
              </div>

              {/* Can-do and Scenario */}
              <div className="space-y-2">
                <p className="text-[10px] text-[#8E9299] font-mono leading-relaxed italic">
                  <strong>Can-Do Indicator:</strong> {previewQuestion.can_do_statement}
                </p>
                <div className="bg-[#0F0F12] p-3.5 rounded-lg border border-white/5 text-xs font-mono leading-relaxed text-slate-300">
                  <p className="text-[9px] uppercase tracking-wider font-bold text-[#8E9299] mb-1">Scenario / سياق الموقف</p>
                  {previewQuestion.context_scenario}
                </div>
              </div>

              {/* Question Text */}
              <p className="text-white font-serif leading-relaxed text-sm font-medium">
                {previewQuestion.question_text}
              </p>

              {/* Choice Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(previewQuestion.options).map(([letter, text]) => {
                  const isSelected = previewSelectedOption === letter;
                  const isCorrect = previewQuestion.correct_option === letter;
                  
                  let btnStyle = "bg-[#0F0F12] border-white/10 text-slate-300 hover:bg-white/5";
                  if (previewAnswered) {
                    if (isCorrect) {
                      btnStyle = "bg-emerald-950/40 border-emerald-500/50 text-emerald-400 font-bold shadow-lg shadow-emerald-500/10";
                    } else if (isSelected) {
                      btnStyle = "bg-red-950/40 border-red-500/50 text-red-400 font-bold shadow-lg shadow-red-500/10";
                    } else {
                      btnStyle = "bg-[#0F0F12]/50 border-white/5 text-slate-600 cursor-not-allowed";
                    }
                  } else if (isSelected) {
                    btnStyle = "bg-[#D4AF37]/20 border-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/10";
                  }

                  return (
                    <button
                      key={letter}
                      disabled={previewAnswered}
                      onClick={() => setPreviewSelectedOption(letter as any)}
                      className={`w-full p-4.5 rounded-xl border text-left text-xs transition duration-150 flex items-start gap-3 cursor-pointer ${btnStyle}`}
                    >
                      <span className={`font-mono font-black h-5 w-5 rounded-md flex items-center justify-center shrink-0 border ${
                        isSelected 
                          ? "bg-[#D4AF37] text-black border-[#D4AF37]" 
                          : "bg-white/5 border-white/10 text-[#8E9299]"
                      }`}>
                        {letter}
                      </span>
                      <span>{text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Submit & Explanation block */}
              <div className="space-y-4 pt-3 border-t border-white/5">
                {!previewAnswered ? (
                  <button
                    disabled={!previewSelectedOption}
                    onClick={() => {
                      setPreviewAnswered(true);
                      if (previewSelectedOption === previewQuestion.correct_option) {
                        try {
                          confetti({ particleCount: 50, spread: 50 });
                        } catch {}
                      }
                    }}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition duration-200 shadow-md ${
                      previewSelectedOption 
                        ? "bg-[#D4AF37] text-black hover:bg-[#E4C563] cursor-pointer" 
                        : "bg-[#0F0F12] border border-white/5 text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    تأكيد الإجابة / Submit Answer
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 bg-[#0F0F12] p-4 rounded-xl border border-white/5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {previewSelectedOption === previewQuestion.correct_option ? (
                        <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" /> إجابة صحيحة! / Correct!
                        </span>
                      ) : (
                        <span className="text-red-400 font-extrabold flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" /> إجابة خاطئة! / Incorrect!
                        </span>
                      )}
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300 font-medium">الخيار الصحيح هو {previewQuestion.correct_option} / Correct option is {previewQuestion.correct_option}</span>
                    </div>
                    
                    <p className="text-slate-400 leading-relaxed font-sans text-[11px] pt-1">
                      {previewQuestion.pedagogical_explanation}
                    </p>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setPreviewSelectedOption(null);
                          setPreviewAnswered(false);
                        }}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded text-[10px] font-bold uppercase transition"
                      >
                        أعد المحاولة / Try Again
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
