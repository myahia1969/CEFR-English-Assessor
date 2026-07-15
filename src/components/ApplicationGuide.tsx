import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Compass, 
  TrendingUp, 
  Mic, 
  BookOpen, 
  Award, 
  Sparkles,
  Zap,
  CheckCircle,
  HelpCircle,
  Clock
} from "lucide-react";

interface ApplicationGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GuideStep {
  titleAr: string;
  titleEn: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  bgColor: string;
  descriptionAr: string;
  descriptionEn: string;
  featuresAr: string[];
  featuresEn: string[];
  tipsAr: string;
  tipsEn: string;
}

export default function ApplicationGuide({ isOpen, onClose }: ApplicationGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: GuideStep[] = [
    {
      titleAr: "لوحة المتابعة الرئيسية",
      titleEn: "Academy Dashboard",
      icon: Compass,
      iconColor: "text-[#D4AF37]",
      bgColor: "bg-[#D4AF37]/10 border-[#D4AF37]/25",
      descriptionAr: "مركز التحكم الخاص بك لمراقبة تطورك اللغوي. يعرض إحصائياتك العامة، الأهداف اليومية والأسبوعية، وسلسلة المذاكرة المتتالية لتحفيزك المستمر.",
      descriptionEn: "Your centralized training cockpit. Tracks real-time CEFR levels, daily/weekly goals, continuous study streaks, and houses your verified academic certificates.",
      featuresAr: [
        "سلسلة المذاكرة المتتالية (Streaks) ومكافآت الـ XP لمضاعفة تقدمك.",
        "لوحة مراقبة الأهداف وتخصيص ساعات الدراسة الأسبوعية.",
        "إصدار فوري لتقرير وشهادة التقدير الرقمية المعتمدة بتفاصيل أدائك."
      ],
      featuresEn: [
        "Interactive Daily Streak trackers and XP reward counters to stay motivated.",
        "Weekly goal adjustment (hours of focus or number of evaluations).",
        "Instant certified PDF digital report & Certificate of Appreciation generation."
      ],
      tipsAr: "حافظ على متتاليتك اليومية للحصول على مكافآت نقاط الخبرة الإضافية وتجاوز مستويات الـ CEFR بشكل أسرع!",
      tipsEn: "Pro-Tip: Review your dashboard daily to protect your active streak and instantly claim bonus XP multipliers!"
    },
    {
      titleAr: "التقييم التكيفي الذكي",
      titleEn: "Adaptive Assessment",
      icon: TrendingUp,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/25",
      descriptionAr: "اختبار قياس مستوى متطور قائم على خوارزميات تكيفية تضبط صعوبة الأسئلة ديناميكياً لتحديد مستواك الحقيقي بدقة متناهية.",
      descriptionEn: "A high-fidelity CEFR testing engine. Utilizes adaptive algorithms that raise or lower difficulty based on your answers to map your exact linguistic profile.",
      featuresAr: [
        "خوارزمية ذكية تكتشف حدود مستواك اللغوي عبر 20 سؤالاً تفاعلياً.",
        "يغطي قياس النحو، الاستماع، والمفردات اللغوية المعتمدة.",
        "تحديث فوري لملفك الدراسي ومستواك على المنصة فور الانتهاء."
      ],
      featuresEn: [
        "AI algorithm calibrated to pinpoint CEFR levels from A1 up to C2.",
        "Covers diverse components including grammar, listening comprehension, and syntax.",
        "Immediately overwrites and updates your worldwide rank upon test completion."
      ],
      tipsAr: "لا تقلق إذا شعرت بصعوبة الأسئلة تدريجياً، فهذا يعني أن النظام يكتشف حدود مستواك العليا!",
      tipsEn: "Pro-Tip: Don't panic if questions get challenging; it means the system is testing your upper fluency bounds!"
    },
    {
      titleAr: "مقيم التحدث والكتابة المتقدم",
      titleEn: "Speech & Essay Evaluator",
      icon: Mic,
      iconColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/25",
      descriptionAr: "أداة ذكاء اصطناعي متكاملة لتقييم مهارات الكتابة والتحدث مع حساب دقيق لسرعة القراءة ومراقبة تحسنها بيقين رقمي.",
      descriptionEn: "Your professional review board. Delivers comprehensive feedback on essays and verbal tasks while mapping your visual reading speed (WPM) trend over time.",
      featuresAr: [
        "تحليل نحوي وإملائي فوري للمقالات والتقارير المكتوبة مع تلميحات للتطوير.",
        "تسجيل صوتي وتقييم مستمر للنطق الصحيح ومخارج الحروف لمهارة التحدث.",
        "رسم بياني تفاعلي (WPM Trend) يراقب تطور سرعة القراءة بالكلمات في الدقيقة."
      ],
      featuresEn: [
        "Instant syntax correction, grammar auditing, and thematic essay grading.",
        "Voice recorder assessing speaking pacing, pronunciation, and fluid vocabulary.",
        "Interactive Word-Per-Minute (WPM) trend graph displaying your reading progression."
      ],
      tipsAr: "استخدم مؤشر سرعة القراءة WPM بشكل منتظم لمراقبة مدى طلاقة استيعابك للمصطلحات الإنجليزية!",
      tipsEn: "Pro-Tip: Practice the reading drills regularly to watch your visual WPM curve climb up in the interactive graph!"
    },
    {
      titleAr: "مركز التدريب وتنمية المهارات",
      titleEn: "Skills Training Hub",
      icon: BookOpen,
      iconColor: "text-amber-400",
      bgColor: "bg-amber-500/10 border-amber-500/25",
      descriptionAr: "صندوق الأدوات الشامل لتطوير حصيلتك اللغوية. يدمج مولد التمارين الذكي، بطاقات التكرار المتباعد (SRS)، والتحديات السريعة.",
      descriptionEn: "Your daily vocabulary and grammar gym. Combines CEFR question generators, spaced-repetition flashcards (SRS), and rapid-fire study challenges.",
      featuresAr: [
        "مولد تمارين مخصص لتعزيز القواعد اللغوية والاستماع التفاعلي.",
        "صندوق بطاقات المفردات (SRS) القائم على جداول تكرار علمية لتثبيت الحفظ.",
        "تحدي 'الدراسة السريعة' (Quick Study) لمدة دقيقتين لكسب شارة 'Speed Demon' النادرة."
      ],
      featuresEn: [
        "Dynamic grammar generators built specifically for your current CEFR tier.",
        "Spaced-Repetition System (SRS) deck designed for long-term vocabulary lock.",
        "A 2-minute 'Quick Study' blitz challenge to secure the exclusive lightning badge."
      ],
      tipsAr: "جرب تحدي الـ 2-Minute Quick Study وأجب بشكل صحيح عن 5 أسئلة أو أكثر لفتح شارة البرق النادرة!",
      tipsEn: "Pro-Tip: Beat the clock in the Quick Study quiz and hit 5+ correct answers to unlock the coveted speed badge!"
    },
    {
      titleAr: "محاكي اختبار التوفل iBT",
      titleEn: "TOEFL iBT Simulator",
      icon: Award,
      iconColor: "text-purple-400",
      bgColor: "bg-purple-500/10 border-purple-500/25",
      descriptionAr: "محاكاة واقعية لاختبار التوفل الدولي لقياس جاهزيتك وجدارتك للامتحانات الأكاديمية بنظام تقييم نقاط حقيقي ومؤقتات زمنية صارمة.",
      descriptionEn: "A pressurized test-taking simulation. Replicates official TOEFL iBT test environments to verify international readiness with actual point scoring.",
      featuresAr: [
        "أقسام اختبار واقعية لتقييم الاستماع، القراءة، التحدث والكتابة.",
        "عدادات زمنية ونظام نقاط متوافق مع معايير القياس اللغوية الدولية.",
        "حفظ ومقارنة درجاتك السابقة لتحديد مدى جاهزيتك للامتحان الرسمي."
      ],
      featuresEn: [
        "Realistic multi-skill exam sections designed around historical TOEFL formats.",
        "Strict section timers and real-time score calculators out of standard scales.",
        "Aggregated test records to monitor baseline readiness for international application."
      ],
      tipsAr: "خذ هذا الاختبار في مكان هادئ تماماً ومستمر دون انقطاع لتجربة أجواء قاعة الامتحانات الحقيقية!",
      tipsEn: "Pro-Tip: Run the TOEFL simulation in a quiet space without distractions to capture your actual stress-readiness score!"
    }
  ];

  if (!isOpen) return null;

  const current = steps[currentStep];
  const IconComponent = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" id="application-guide-overlay">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-gradient-to-b from-[#141417] to-[#0A0A0C] border border-[#D4AF37]/35 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl relative overflow-hidden text-left"
          id="application-guide-container"
        >
          {/* Top visual gold accent */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-300" />

          {/* Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#D4AF37]/15 rounded-lg flex items-center justify-center border border-[#D4AF37]/30">
                <HelpCircle className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-black text-white uppercase tracking-wider">
                  الدليل التفاعلي الشامل للمنصة
                </h3>
                <p className="text-[11px] text-[#8E9299]">
                  Step-by-Step Interactive Platform Guide
                </p>
              </div>
            </div>
            
            {/* Steps Progress Indicators */}
            <div className="hidden sm:flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentStep ? "w-6 bg-[#D4AF37]" : "w-2 bg-white/10 hover:bg-white/20"
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={onClose}
              className="bg-white/5 hover:bg-white/10 text-[#8E9299] hover:text-white p-2 rounded-xl border border-white/10 transition cursor-pointer"
              id="close-guide-btn"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content Area with dynamic step presentation */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6" id="guide-step-body">
            
            {/* Step presentation header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${current.bgColor} shadow-lg`}>
                  <IconComponent className={`h-6 w-6 ${current.iconColor}`} />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-md border border-[#D4AF37]/20">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                  <h4 className="text-lg font-serif font-black text-white mt-1 leading-tight">
                    {current.titleAr} <span className="text-[#8E9299] text-sm font-sans font-normal">/ {current.titleEn}</span>
                  </h4>
                </div>
              </div>
            </div>

            {/* Step Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Arabic Side */}
              <div className="space-y-4 text-right" dir="rtl">
                <p className="text-slate-200 leading-relaxed font-medium text-justify">
                  {current.descriptionAr}
                </p>
                <div className="space-y-2.5">
                  <h5 className="font-bold text-[#D4AF37] flex items-center gap-1.5 justify-start">
                    <CheckCircle className="h-4 w-4 text-[#D4AF37] shrink-0" />
                    الميزات الأساسية لهذا القسم:
                  </h5>
                  <ul className="space-y-2 text-slate-300">
                    {current.featuresAr.map((feat, index) => (
                      <li key={index} className="flex items-start gap-2 pr-1 text-justify">
                        <span className="text-[#D4AF37] mt-0.5">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* English Side */}
              <div className="space-y-4 text-left">
                <p className="text-slate-300 leading-relaxed text-justify">
                  {current.descriptionEn}
                </p>
                <div className="space-y-2.5">
                  <h5 className="font-bold text-[#D4AF37] flex items-center gap-1.5 justify-start">
                    <CheckCircle className="h-4 w-4 text-[#D4AF37] shrink-0" />
                    Core Capabilities:
                  </h5>
                  <ul className="space-y-2 text-slate-300">
                    {current.featuresEn.map((feat, index) => (
                      <li key={index} className="flex items-start gap-2 pl-1 text-justify">
                        <span className="text-[#D4AF37] mt-0.5">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            {/* Tip Banner */}
            <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl p-4 flex items-start gap-3 mt-4 text-left">
              <Sparkles className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5 animate-pulse" />
              <div className="text-xs space-y-1">
                <p className="font-serif font-bold text-white uppercase tracking-wider">💡 نصيحة الخبراء / Practice Tip</p>
                <p className="text-slate-300 leading-relaxed text-right" dir="rtl">
                  {current.tipsAr}
                </p>
                <p className="text-[#8E9299] leading-relaxed italic">
                  {current.tipsEn}
                </p>
              </div>
            </div>

          </div>

          {/* Footer Controls */}
          <div className="p-5 border-t border-white/5 bg-[#0F0F12] flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-lg border transition ${
                currentStep === 0
                  ? "border-white/5 text-slate-600 cursor-not-allowed opacity-50"
                  : "border-white/10 text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>السابق / Previous</span>
            </button>

            {/* Mobile-only step tracker */}
            <span className="text-[10px] font-mono text-[#8E9299] sm:hidden">
              {currentStep + 1} / {steps.length}
            </span>

            <button
              onClick={handleNext}
              className="bg-[#D4AF37] hover:brightness-110 text-black font-extrabold px-5 py-2.5 rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
            >
              <span>{currentStep === steps.length - 1 ? "إنهاء الدليل / Finish" : "التالي / Next"}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
