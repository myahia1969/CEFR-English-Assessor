import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { 
  Award, 
  X, 
  Download, 
  Printer, 
  Check, 
  Sparkles, 
  User, 
  Calendar, 
  ShieldCheck, 
  Bookmark,
  Share2
} from "lucide-react";
import { CEFRLevel } from "../types";

// --- BEGIN OKLAB/OKLCH COLOR SANITIZER PATCH FOR HTML2CANVAS ---
function sanitizeColorString(val: string): string {
  if (!val || typeof val !== 'string') return val;

  if (val.includes('oklch(') || val.includes('oklab(')) {
    return val.replace(/(oklch|oklab)\(([^)]+)\)/g, (match, type, content) => {
      const cleanContent = content.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
      const mainParts = cleanContent.split('/');
      const colorParts = mainParts[0].trim().split(' ');
      
      let l = parseFloat(colorParts[0]);
      let cOrA = parseFloat(colorParts[1] || '0');
      let hOrB = parseFloat(colorParts[2] || '0');
      
      let alpha = 1;
      if (mainParts[1]) {
        alpha = parseFloat(mainParts[1].trim()) || 1;
      }
      
      if (isNaN(l)) l = 0.5;

      let r = 0, g = 0, b = 0;

      if (type === 'oklch') {
        const chroma = isNaN(cOrA) ? 0 : cOrA;
        const hue = isNaN(hOrB) ? 0 : hOrB;
        
        if (chroma < 0.005) {
          const gray = Math.round(l * 255);
          return `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
        }
        
        const hRad = (hue * Math.PI) / 180;
        const a = chroma * Math.cos(hRad);
        const bComponent = chroma * Math.sin(hRad);
        
        const l_ = l + 0.3963377774 * a + 0.2158037573 * bComponent;
        const m_ = l - 0.1055613458 * a - 0.0638541728 * bComponent;
        const s_ = l - 0.0894841775 * a - 1.2914855414 * bComponent;
        
        const l3 = l_ * l_ * l_;
        const m3 = m_ * m_ * m_;
        const s3 = s_ * s_ * s_;
        
        r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
        g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
        b = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
      } else {
        const a = isNaN(cOrA) ? 0 : cOrA;
        const bComponent = isNaN(hOrB) ? 0 : hOrB;
        
        const l_ = l + 0.3963377774 * a + 0.2158037573 * bComponent;
        const m_ = l - 0.1055613458 * a - 0.0638541728 * bComponent;
        const s_ = l - 0.0894841775 * a - 1.2914855414 * bComponent;
        
        const l3 = l_ * l_ * l_;
        const m3 = m_ * m_ * m_;
        const s3 = s_ * s_ * s_;
        
        r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
        g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
        b = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
      }

      r = Math.max(0, Math.min(1, r));
      g = Math.max(0, Math.min(1, g));
      b = Math.max(0, Math.min(1, b));
      
      r = r <= 0.0031308 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055;
      g = g <= 0.0031308 ? 12.92 * g : 1.055 * Math.pow(g, 1 / 2.4) - 0.055;
      b = b <= 0.0031308 ? 12.92 * b : 1.055 * Math.pow(b, 1 / 2.4) - 0.055;

      const rByte = Math.max(0, Math.min(255, Math.round(r * 255)));
      const gByte = Math.max(0, Math.min(255, Math.round(g * 255)));
      const bByte = Math.max(0, Math.min(255, Math.round(b * 255)));

      return `rgba(${rByte}, ${gByte}, ${bByte}, ${alpha})`;
    });
  }
  return val;
}

if (typeof window !== "undefined") {
  const originalGetComputedStyle = window.getComputedStyle;
  window.getComputedStyle = function (elt, pseudoElt) {
    const style = originalGetComputedStyle(elt, pseudoElt);
    return new Proxy(style, {
      get(target, prop, receiver) {
        if (prop === "getPropertyValue") {
          return function (propertyName: string) {
            const rawVal = target.getPropertyValue(propertyName);
            return sanitizeColorString(rawVal);
          };
        }
        const val = Reflect.get(target, prop, receiver);
        if (typeof val === "string") {
          return sanitizeColorString(val);
        }
        if (typeof val === "function") {
          return val.bind(target);
        }
        return val;
      },
    });
  };
}
// --- END OKLAB/OKLCH COLOR SANITIZER PATCH FOR HTML2CANVAS ---

interface CertificateGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  userLevel: CEFRLevel | null;
  testsCount: number;
}

type CertificateTheme = "royal-gold" | "classic-navy" | "emerald-academic";

const levelNames: Record<CEFRLevel, { en: string; ar: string }> = {
  A0: { en: "Starter (Pre-A1)", ar: "مبتدئ تمهيدي (Pre-A1)" },
  A1: { en: "Beginner (A1)", ar: "مبتدئ (A1)" },
  A2: { en: "Elementary (A2)", ar: "مبتدئ متقدم (A2)" },
  B1: { en: "Intermediate (B1)", ar: "متوسط (B1)" },
  B2: { en: "Upper-Intermediate (B2)", ar: "فوق متوسط (B2)" },
  C1: { en: "Advanced (C1)", ar: "متقدم (C1)" },
  C2: { en: "Proficiency (C2)", ar: "متقدم متمكن (C2)" },
};

export default function CertificateGenerator({ isOpen, onClose, userLevel, testsCount }: CertificateGeneratorProps) {
  const [studentName, setStudentName] = useState(() => {
    return localStorage.getItem("lexicon_student_name") || "";
  });
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>("B1");
  const [theme, setTheme] = useState<CertificateTheme>("royal-gold");
  const [nameFont, setNameFont] = useState<"cursive" | "alex" | "cinzel" | "playfair" | "amiri">("cursive");
  const [nameFontSize, setNameFontSize] = useState<number>(30);
  const [serialNumber, setSerialNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [exportProgress, setExportProgress] = useState<"idle" | "rendering" | "compiling" | "downloading" | "success" | "error">("idle");
  const [exportError, setExportError] = useState("");
  const [isInIframeState, setIsInIframeState] = useState(false);

  const certificateRef = useRef<HTMLDivElement>(null);

  // Detect sandbox or iframe embedding
  useEffect(() => {
    try {
      setIsInIframeState(window.self !== window.top);
    } catch (e) {
      setIsInIframeState(true);
    }
  }, []);

  const handleOpenInNewTab = () => {
    window.open(window.location.href, "_blank");
  };

  // Sync selected level when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedLevel(userLevel || "B1");
    }
  }, [userLevel, isOpen]);

  // Generate unique certificate serial number and current date on mount
  useEffect(() => {
    const randomHex = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
    const currentYear = new Date().getFullYear();
    const levelStr = selectedLevel;
    setSerialNumber(`FAT-${currentYear}-${levelStr}-${randomHex}`);

    const formattedDate = new Date().toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    setIssueDate(formattedDate);
  }, [selectedLevel, isOpen]);

  const handleSaveName = (name: string) => {
    setStudentName(name);
    localStorage.setItem("lexicon_student_name", name);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPDF = async () => {
    const element = certificateRef.current;
    if (!element) return;

    setExportProgress("rendering");
    setIsExporting(true);
    setExportError("");
    try {
      // 1. Rendering phase
      await new Promise((resolve) => setTimeout(resolve, 400));

      const canvas = await html2canvas(element, {
        scale: 2.5, // Optimal premium scale to prevent out of memory issues
        useCORS: true,
        backgroundColor: null,
        logging: true,
        allowTaint: false, // Prevents security issues with cross-origin assets
      });

      // 2. Compiling phase
      setExportProgress("compiling");
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      const fileName = `Fatima_Academy_Certificate_${selectedLevel}_${(studentName.trim() || "FATIMA_MOHAMED_YAHIA").replace(/\s+/g, "_")}.pdf`;
      
      // 3. Downloading phase
      setExportProgress("downloading");

      // Dual download strategy for iframe security
      try {
        pdf.save(fileName);
      } catch (saveErr) {
        console.warn("Direct PDF save failed, using fallback iframe-safe download...", saveErr);
        const blob = pdf.output("blob");
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 300);
      }

      setExportProgress("success");
      setTimeout(() => setExportProgress("idle"), 3500);
    } catch (error: any) {
      console.error("PDF generation failed:", error);
      setExportProgress("error");
      setExportError(error?.message || "Failed to generate PDF. Please try 'Download PNG' or 'Print'.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPNG = async () => {
    const element = certificateRef.current;
    if (!element) return;

    setExportProgress("rendering");
    setIsExporting(true);
    setExportError("");
    try {
      // 1. Rendering phase
      await new Promise((resolve) => setTimeout(resolve, 400));

      const canvas = await html2canvas(element, {
        scale: 3, // Full HD scale for crisp image export
        useCORS: true,
        backgroundColor: null,
        logging: true,
        allowTaint: false,
      });

      // 2. Downloading phase
      setExportProgress("downloading");
      const imgData = canvas.toDataURL("image/png");
      const fileName = `Fatima_Academy_Certificate_${selectedLevel}_${(studentName.trim() || "FATIMA_MOHAMED_YAHIA").replace(/\s+/g, "_")}.png`;
      
      const link = document.createElement("a");
      link.href = imgData;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
      }, 300);

      setExportProgress("success");
      setTimeout(() => setExportProgress("idle"), 3500);
    } catch (error: any) {
      console.error("PNG download failed:", error);
      setExportProgress("error");
      setExportError(error?.message || "Failed to generate PNG. Please try 'Print'.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    const printContent = certificateRef.current?.innerHTML;
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Certificate of Appreciation - Fatima Academy</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,500&family=Amiri:ital,wght@0,700;1,400&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                  background: white !important;
                  color: black !important;
                }
                .no-print { display: none !important; }
              }
              body {
                font-family: 'Inter', sans-serif;
              }
              .font-serif-cinzel {
                font-family: 'Cinzel', serif;
              }
              .font-serif-playfair {
                font-family: 'Playfair Display', serif;
              }
              .font-amiri {
                font-family: 'Amiri', serif;
              }
            </style>
          </head>
          <body class="bg-white flex items-center justify-center p-4">
            <div class="w-full max-w-[850px]">
              ${printContent}
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleShare = () => {
    const text = `🎉 I just received my Certificate of Excellence from Fatima CEFR English Academy at ${selectedLevel} Level! Developed by Fatima Mohamed Yahia.`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const currentLevel = selectedLevel;

  // Detailed CEFR descriptors for the certificate
  const getLevelAchievements = (lvl: CEFRLevel) => {
    switch(lvl) {
      case "A0":
      case "A1":
        return {
          en: "demonstrated initial beginner competency in understanding familiar everyday expressions, basic phrasing, and foundational communication mechanisms.",
          ar: "أظهر كفاءة مبتدئة متميزة في فهم التعبيرات اليومية المألوفة، والصياغات الأساسية، وبناء مهارات التواصل الأكاديمي الأولى."
        };
      case "A2":
        return {
          en: "achieved standard elementary mastery to communicate simple routine exchanges, process direct tasks, and express immediate personal contexts fluently.",
          ar: "أنجز تميزاً بمستوى الأساسيات في تبادل المعلومات الروتينية البسيطة والتعامل مع المهام المباشرة والتعبير عن السياقات الشخصية بوضوح."
        };
      case "B1":
        return {
          en: "exhibited independent linguistic proficiency, comfortably managing coherent dialogues, describing complex ambitions, and resolving familiar professional encounters.",
          ar: "أظهر كفاءة لغوية مستقلة متميزة في إدارة الحوارات المتماسكة، ووصف الطموحات المعقدة، والتعامل بثقة مع المواقف اليومية والمهنية."
        };
      case "B2":
        return {
          en: "demonstrated robust upper-intermediate command in synthesizing highly complex concrete/abstract debates, articulating systematic viewpoints, and leading fluid professional collaborations.",
          ar: "أثبت كفاءة عالية فوق المتوسطة في تحليل المناقشات المعقدة الملموسة والمجردة، وصياغة الآراء المنهجية، وقيادة التعاون المهني بسلاسة."
        };
      case "C1":
        return {
          en: "attained proficient expert fluency to easily navigate implicit literal nuances, compose sophisticated structural prose, and deploy flexible academic discourse naturally.",
          ar: "حقق طلاقة متقدمة فائقة في التفاعل مع الفروق اللغوية الدقيقة، وكتابة النصوص البنيوية المتقدمة، وإدارة الخطاب الأكاديمي بمرونة كاملة."
        };
      case "C2":
        return {
          en: "validated complete mastery, expressing conceptual thoughts with extreme precision, summarizing disparate sources effortlessly, and exhibiting complete cognitive native-like command.",
          ar: "أثبت تمكناً واكتمالاً مطلقاً في صياغة الأفكار الفلسفية بدقة متناهية، وتلخيص المصادر المتنوعة بجهد معدوم، والخطابة بمستوى يضاهي المتحدث الأصلي."
        };
    }
  };

  const achievements = getLevelAchievements(currentLevel);

  // Border theme classes
  const getThemeClasses = (t: CertificateTheme) => {
    switch(t) {
      case "royal-gold":
        return {
          bg: "bg-[#0B0B0D]",
          outerBorder: "border-[#D4AF37]/50",
          innerBorder: "border-[#D4AF37]/25",
          accentText: "text-[#D4AF37]",
          badgeBg: "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20",
          gradientOverlay: "from-[#D4AF37]/5 to-[#D4AF37]/0",
          sealColor: "text-[#D4AF37] border-[#D4AF37]"
        };
      case "classic-navy":
        return {
          bg: "bg-[#0D1321]",
          outerBorder: "border-[#4A90E2]/50",
          innerBorder: "border-[#4A90E2]/25",
          accentText: "text-[#4A90E2]",
          badgeBg: "bg-[#4A90E2]/10 text-[#4A90E2] border-[#4A90E2]/20",
          gradientOverlay: "from-[#4A90E2]/5 to-[#4A90E2]/0",
          sealColor: "text-[#4A90E2] border-[#4A90E2]"
        };
      case "emerald-academic":
        return {
          bg: "bg-[#061A12]",
          outerBorder: "border-[#10B981]/50",
          innerBorder: "border-[#10B981]/25",
          accentText: "text-[#10B981]",
          badgeBg: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
          gradientOverlay: "from-[#10B981]/5 to-[#10B981]/0",
          sealColor: "text-[#10B981] border-[#10B981]"
        };
    }
  };

  const themeStyle = getThemeClasses(theme);

  const getFontFamilyStyle = (fontId: typeof nameFont) => {
    switch (fontId) {
      case "cursive":
        return { fontFamily: "'Great Vibes', cursive", letterSpacing: "normal" };
      case "alex":
        return { fontFamily: "'Alex Brush', cursive", letterSpacing: "normal" };
      case "cinzel":
        return { fontFamily: "'Cinzel', serif", letterSpacing: "0.08em", fontWeight: "700" };
      case "playfair":
        return { fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: "600", letterSpacing: "normal" };
      case "amiri":
        return { fontFamily: "'Amiri', serif", fontWeight: "700", letterSpacing: "normal" };
      default:
        return { fontFamily: "'Great Vibes', cursive", letterSpacing: "normal" };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6" id="certificate-overlay">
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Great+Vibes&family=Alex+Brush&family=Amiri:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      
      {/* Container Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#141417] border border-white/10 rounded-2xl w-full max-w-[950px] shadow-2xl flex flex-col overflow-hidden"
      >
        
        {/* Modal Top Header */}
        <div className="bg-[#0F0F12] border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37] border border-[#D4AF37]/20">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
                Certificate Hub / منصة الشهادات الأكاديمية
              </h3>
              <p className="text-[10px] text-[#8E9299]">
                Generate, customize, and save your verified CEFR level achievement certificate.
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

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          
          {/* Left panel: Controls (Span 4) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* 1. Student Name Configuration */}
            <div className="bg-[#0F0F12] border border-white/5 rounded-xl p-4 space-y-3">
              <label className="text-[10px] font-bold text-[#8E9299] uppercase tracking-widest block flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[#D4AF37]" />
                Student Name / اسم الطالب
              </label>
              
              <div className="relative">
                <input 
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter Full Name..."
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]/50"
                  dir="auto"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveName(studentName)}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/25 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  {isSaved ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Name / حفظ الاسم</span>
                  )}
                </button>
              </div>
            </div>

            {/* 1b. Font Style Configuration */}
            <div className="bg-[#0F0F12] border border-white/5 rounded-xl p-4 space-y-3">
              <label className="text-[10px] font-bold text-[#8E9299] uppercase tracking-widest block flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
                Name Font Style / خط ونوع كتابة الاسم
              </label>
              
              <div className="space-y-2">
                <p className="text-[9px] text-[#8E9299] uppercase tracking-wider font-semibold">Select Font Style / اختر الخط</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { id: "cursive", label: "Cursive", font: "'Great Vibes', cursive", arLabel: "رقاعي" },
                    { id: "alex", label: "Elegant", font: "'Alex Brush', cursive", arLabel: "ديواني" },
                    { id: "cinzel", label: "Imperial", font: "'Cinzel', serif", arLabel: "ملكي" },
                    { id: "playfair", label: "Editorial", font: "'Playfair Display', serif", arLabel: "فخم" },
                    { id: "amiri", label: "Arabic", font: "'Amiri', serif", arLabel: "أميري عربي" }
                  ].map((f) => {
                    const isActive = nameFont === f.id;
                    return (
                      <button
                        key={f.id}
                        id={`name-font-btn-${f.id}`}
                        onClick={() => setNameFont(f.id as any)}
                        style={{ fontFamily: f.font.includes("Amiri") ? "'Amiri', serif" : f.font }}
                        className={`px-1.5 py-1.5 rounded border text-[10px] transition cursor-pointer text-center flex flex-col items-center justify-center leading-tight ${
                          isActive
                            ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]"
                            : "bg-black/60 border-white/5 text-[#8E9299] hover:border-white/10 hover:text-white"
                        }`}
                      >
                        <span className="font-bold">{f.label}</span>
                        <span className="text-[8px] opacity-80">{f.arLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Size Slider */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-[9px] text-[#8E9299] uppercase tracking-wider">
                  <span>Font Size / حجم الخط</span>
                  <span className="text-white font-mono font-bold">{nameFontSize}px</span>
                </div>
                <input 
                  type="range"
                  min="20"
                  max="48"
                  value={nameFontSize}
                  onChange={(e) => setNameFontSize(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] bg-black h-1 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* CEFR Level Selector */}
            <div className="bg-[#0F0F12] border border-white/5 rounded-xl p-4 space-y-3">
              <label className="text-[10px] font-bold text-[#8E9299] uppercase tracking-widest block flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-[#D4AF37]" />
                Select CEFR Level / تحديد المستوى
              </label>
              
              <div className="grid grid-cols-4 gap-1.5">
                {(["A0", "A1", "A2", "B1", "B2", "C1", "C2"] as CEFRLevel[]).map((lvl) => {
                  const isActive = selectedLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      id={`cert-level-btn-${lvl}`}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`py-1.5 rounded text-xs font-mono font-bold transition cursor-pointer border ${
                        isActive
                          ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]"
                          : "bg-black/60 border-white/5 text-[#8E9299] hover:border-white/10 hover:text-white"
                      }`}
                      title={levelNames[lvl].en}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
              <p className="text-[9px] text-[#8E9299] leading-tight">
                Selected: <span className="text-white font-medium">{levelNames[selectedLevel].en}</span> <br/>
                المستوى: <span className="text-[#D4AF37] font-medium">{levelNames[selectedLevel].ar}</span>
              </p>
            </div>

            {/* 2. Style Selection */}
            <div className="bg-[#0F0F12] border border-white/5 rounded-xl p-4 space-y-3">
              <label className="text-[10px] font-bold text-[#8E9299] uppercase tracking-widest block flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
                Certificate Theme / المظهر والسمة
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme("royal-gold")}
                  className={`px-2 py-2.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition cursor-pointer text-center flex flex-col items-center gap-1 ${
                    theme === "royal-gold"
                      ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]"
                      : "bg-black border-white/5 text-[#8E9299] hover:border-white/10"
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
                  Gold
                </button>

                <button
                  onClick={() => setTheme("classic-navy")}
                  className={`px-2 py-2.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition cursor-pointer text-center flex flex-col items-center gap-1 ${
                    theme === "classic-navy"
                      ? "bg-[#4A90E2]/10 border-[#4A90E2] text-[#4A90E2]"
                      : "bg-black border-white/5 text-[#8E9299] hover:border-white/10"
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-[#4A90E2]" />
                  Navy
                </button>

                <button
                  onClick={() => setTheme("emerald-academic")}
                  className={`px-2 py-2.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition cursor-pointer text-center flex flex-col items-center gap-1 ${
                    theme === "emerald-academic"
                      ? "bg-[#10B981]/10 border-[#10B981] text-[#10B981]"
                      : "bg-black border-white/5 text-[#8E9299] hover:border-white/10"
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                  Emerald
                </button>
              </div>
            </div>

            {/* 3. Global Actions */}
            <div className="bg-[#0F0F12] border border-white/5 rounded-xl p-4 space-y-2.5">
              {/* PDF Download Button */}
              <button
                onClick={handleDownloadPDF}
                disabled={isExporting}
                id="cert-download-pdf-btn"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] hover:brightness-110 text-black font-extrabold px-4 py-2.5 rounded-lg text-[10px] uppercase tracking-widest shadow-lg shadow-[#D4AF37]/10 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting && exportProgress !== "idle" && exportProgress !== "success" && exportProgress !== "error" ? (
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>
                      {exportProgress === "rendering" && "Rendering Certificate / جاري تجهيز الرسم..."}
                      {exportProgress === "compiling" && "Compiling PDF / جاري تجميع الملف..."}
                      {exportProgress === "downloading" && "Downloading... / جاري تنزيل الملف..."}
                    </span>
                  </div>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF / تحميل وثيقة الـ PDF</span>
                  </>
                )}
              </button>

              {/* PNG Download Button (Super robust fallback) */}
              <button
                onClick={handleDownloadPNG}
                disabled={isExporting}
                id="cert-download-png-btn"
                className="w-full inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 font-bold px-4 py-2.5 rounded-lg text-[10px] uppercase tracking-widest transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Image (PNG) / تحميل كصورة عالية الدقة</span>
              </button>

              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="w-full inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>Print Certificate / طباعة الشهادة الورقية</span>
              </button>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="w-full inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>{copiedLink ? "Copied! / تم النسخ" : "Copy Certificate Share / نسخ ومشاركة"}</span>
              </button>

              {/* Status & Help Banners */}
              {exportProgress === "error" && (
                <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg text-[9.5px] text-red-400 space-y-1">
                  <p className="font-bold uppercase tracking-wider">⚠️ Export Status / حالة التنزيل</p>
                  <p className="leading-normal">{exportError || "Failed to download directly. Please use 'Download Image (PNG)' or 'Print Certificate'."}</p>
                </div>
              )}

              {exportProgress === "success" && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-[9.5px] text-emerald-400 font-medium space-y-0.5">
                  <p className="font-bold">🎉 Success / تم التحميل بنجاح!</p>
                  <p>Your file is downloading. Please check your system downloads folder.</p>
                </div>
              )}

              {/* Sandbox iFrame Alert & Support */}
              {isInIframeState && (
                <div className="p-3 bg-amber-950/20 border border-amber-500/10 rounded-lg text-[9.5px] text-amber-300 space-y-2">
                  <p className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <span>⚠️ تنبيه لبيئة المعاينة / Browser Preview Alert</span>
                  </p>
                  <p className="leading-normal">
                    قد تمنع إعدادات حماية المتصفح تحميل ملفات الـ PDF مباشرة من داخل نافذة المعاينة. يرجى فتح التطبيق في علامة تبويب جديدة لتنزيل الشهادة مباشرة دون أي قيود أمنية.
                  </p>
                  <button
                    onClick={handleOpenInNewTab}
                    className="w-full py-2 px-3 bg-amber-500/25 hover:bg-amber-500/35 text-amber-200 border border-amber-500/30 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>افتح التطبيق في نافذة جديدة للتحميل المباشر</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. Verification Note */}
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] text-[#8E9299] space-y-2.5 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold uppercase text-[#D4AF37]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified CEFR Standard</span>
              </div>
              <p>
                This academic certificate is dynamically mapped to your registered benchmark level. It carries an official digital serial and recognition verification issued via the <strong>Fatima Academic Portal</strong>.
              </p>
              <div className="font-mono text-[9px] bg-black/45 p-1.5 rounded text-slate-300">
                Serial No: {serialNumber}
              </div>
            </div>

          </div>

          {/* Right panel: Certificate Visual Canvas (Span 8) */}
          <div className="lg:col-span-8 flex items-center justify-center overflow-x-auto bg-[#09090A] border border-white/5 rounded-xl p-4 min-h-[500px]" id="certificate-preview-container">
            
            {/* Certificate Outer Wrapper (We print this inside iframe with custom styles) */}
            <div 
              ref={certificateRef}
              className="w-full max-w-[700px] aspect-[1.414/1] relative select-none"
            >
              <div 
                className={`w-full h-full ${themeStyle.bg} border-[16px] ${themeStyle.outerBorder} p-2 rounded-sm relative overflow-hidden transition-all duration-300`}
              >
                {/* Secondary elegant inner border frame */}
                <div className={`w-full h-full border-2 border-dashed ${themeStyle.innerBorder} p-6 flex flex-col justify-between items-center text-center relative`}>
                  
                  {/* Subtle Corner Accents */}
                  <div className={`absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 ${themeStyle.outerBorder}`} />
                  <div className={`absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 ${themeStyle.outerBorder}`} />
                  <div className={`absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 ${themeStyle.outerBorder}`} />
                  <div className={`absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 ${themeStyle.outerBorder}`} />
                  
                  {/* Watermark Crest/Globe */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none">
                    <Award className={`h-64 w-64 ${themeStyle.accentText}`} />
                  </div>

                  {/* Top Bar: Headers & Crest */}
                  <div className="w-full flex justify-between items-start">
                    <div className="text-left text-[8px] font-mono text-[#8E9299] space-y-0.5">
                      <p>SERIAL: {serialNumber}</p>
                      <p>CEFR STANDARD EVALUATION</p>
                    </div>
                    
                    {/* Golden Academic Crest */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-gradient-to-b from-[#D4AF37] to-[#8E793E] rounded-full flex items-center justify-center shadow-lg border border-black/10">
                        <Award className="h-5 w-5 text-black" />
                      </div>
                      <span className="text-[7px] font-serif uppercase tracking-widest text-white mt-1">FATIMA ENGINE</span>
                    </div>

                    <div className="text-right text-[8px] font-mono text-[#8E9299] space-y-0.5">
                      <p>DATE: {issueDate}</p>
                      <p>ACADEMY PORTAL DIRECT</p>
                    </div>
                  </div>

                  {/* Main Title Headers */}
                  <div className="space-y-1 my-1">
                    <h2 className="text-lg md:text-xl font-cinzel tracking-[0.16em] text-white uppercase font-black filter drop-shadow-sm">
                      Certificate of Achievement
                    </h2>
                    <h3 className="text-[12px] md:text-[14px] font-amiri font-bold text-[#D4AF37] tracking-wider">
                      شهادة تقدير وتفوق أكاديمي
                    </h3>
                  </div>

                  {/* Certify Text */}
                  <div className="space-y-0.5 text-[#C8C8CC] leading-relaxed max-w-lg">
                    <p className="italic font-playfair text-[10px] md:text-[11px] text-[#F3E5AB]/90">This is to officially recognize and certify that</p>
                    <p className="font-amiri text-[#8E9299] text-[11px] md:text-[12px]">نشهد بموجب هذه الوثيقة الرسمية أن الطالب / الطالبة</p>
                  </div>

                  {/* Student Name */}
                  <div className="my-1.5 min-h-[46px] flex flex-col justify-center items-center">
                    <h1 
                      style={{ 
                        ...getFontFamilyStyle(nameFont), 
                        fontSize: `${nameFontSize}px` 
                      }}
                      className={`text-center font-extrabold tracking-wide border-b border-dashed border-white/20 px-12 pb-2 filter drop-shadow-sm transition-all ${
                        isExporting 
                          ? "text-[#F3E5AB]" 
                          : "bg-gradient-to-r from-white via-[#F3E5AB] to-white bg-clip-text text-transparent"
                      }`}
                    >
                      {studentName.trim() || "Fatima Mohamed Yahia"}
                    </h1>
                  </div>

                  {/* Gorgeous CEFR Level Calligraphy Showcase */}
                  <div className="my-1.5 flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 py-1 px-5 rounded-lg relative overflow-hidden max-w-xs w-full">
                    {/* Tiny decorative gold corner accents */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#D4AF37]/30" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#D4AF37]/30" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#D4AF37]/30" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#D4AF37]/30" />
                    
                    <p className="text-[7.5px] font-mono tracking-widest text-[#8E9299] uppercase font-bold">Certified Achievement / مستوى الإنجاز المعتمد</p>
                    <div className="flex items-center gap-2 mt-0.5 whitespace-nowrap">
                      <span className="font-cinzel text-sm md:text-base font-extrabold tracking-widest text-white drop-shadow-sm">
                        CEFR <span className={`${themeStyle.accentText} font-cinzel font-black`}>{currentLevel}</span>
                      </span>
                    </div>
                    <p className="text-[9.5px] md:text-[10.5px] text-[#C8C8CC] font-playfair italic mt-0.5 tracking-wide">
                      {levelNames[currentLevel].en} &bull; <span className="font-amiri not-italic font-bold text-[#D4AF37]">{levelNames[currentLevel].ar}</span>
                    </p>
                  </div>

                  {/* Achievement content */}
                  <div className="space-y-1.5 max-w-xl text-center">
                    <p className="text-[#E2E2E6] font-playfair text-[9.5px] md:text-[10px] leading-relaxed max-w-lg mx-auto">
                      has successfully demonstrated and validated verified English fluency at the <strong className={`${themeStyle.accentText} font-cinzel font-bold`}>CEFR {currentLevel}</strong> level standard, having completed structured academic language assessments, thereby proving proficiency.
                    </p>
                    
                    <p className="text-[8.5px] md:text-[9.5px] text-[#8E9299] leading-relaxed px-4 italic font-playfair">
                      {achievements.en}
                    </p>

                    <p className="text-[11.5px] md:text-[12.5px] text-[#A0A2A8] leading-relaxed px-4 font-amiri mt-0.5">
                      {achievements.ar}
                    </p>
                  </div>

                  {/* Signatures & Seal Row */}
                  <div className="w-full grid grid-cols-3 items-end pt-2 mt-1.5 border-t border-white/5">
                    
                    {/* Authorized Registrar Signature */}
                    <div className="flex flex-col items-center space-y-0.5">
                      <div className="h-6 flex items-center justify-center">
                        <span className="font-cinzel text-[8.5px] text-white/70 tracking-widest font-bold">Fatima Board</span>
                      </div>
                      <span className="w-16 border-b border-white/10" />
                      <span className="text-[7px] text-[#8E9299] uppercase font-mono tracking-wider mt-0.5">Registrar General</span>
                    </div>

                    {/* Official Seal Badge */}
                    <div className="flex flex-col items-center">
                      <div className="h-9 w-9 rounded-full border border-dashed border-[#D4AF37]/40 flex items-center justify-center bg-black animate-pulse relative">
                        <ShieldCheck className="h-4.5 w-4.5 text-[#D4AF37]" />
                        <div className="absolute inset-0 rounded-full border border-[#D4AF37]/15 scale-125" />
                      </div>
                      <span className="text-[7.5px] text-[#D4AF37] font-mono tracking-widest uppercase mt-0.5">VERIFIED SEAL</span>
                    </div>

                    {/* Principal Developer Sign-off */}
                    <div className="flex flex-col items-center space-y-0.5">
                      <div className="h-6 flex items-center justify-center">
                        <span style={{ fontFamily: "'Great Vibes', cursive" }} className="text-[16px] text-[#D4AF37] font-bold">F. Mohamed Yahia</span>
                      </div>
                      <span className="w-16 border-b border-[#D4AF37]/25" />
                      <div className="text-[6.5px] text-slate-400 font-mono text-center flex flex-col leading-none mt-0.5">
                        <span className="uppercase font-bold text-[#D4AF37]">Fatima Mohamed Yahia</span>
                        <span className="text-[5.5px] text-[#8E9299]">Academy Director</span>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            </div>

          </div>

        </div>

      </motion.div>

    </div>
  );
}
