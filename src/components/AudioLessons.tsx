import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  ChevronLeft, 
  BookOpen, 
  Headphones, 
  Globe, 
  Languages, 
  Volume2, 
  VolumeX, 
  ArrowRight,
  BookMarked,
  Volume1,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { CEFR_LESSONS, AudioLesson } from "../data/lessons";
import { CEFRLevel } from "../types";

interface AudioLessonsProps {
  userLevel: CEFRLevel | null;
  onIncrementPracticeCount?: () => void;
}

type Accent = "en-us" | "en-gb" | "en-au";

export default function AudioLessons({ userLevel, onIncrementPracticeCount }: AudioLessonsProps) {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(userLevel || "B1");
  const [activeLesson, setActiveLesson] = useState<AudioLesson | null>(null);
  
  // Interactive Classroom Audio States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [accent, setAccent] = useState<Accent>("en-us");
  const [showAccentMenu, setShowAccentMenu] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [useLocalSynthesis, setUseLocalSynthesis] = useState(false);
  
  // Audio Ref
  const audioRef = useRef<HTMLAudioElement>(null);

  // Sync state level with user level when it changes
  useEffect(() => {
    if (userLevel) {
      setSelectedLevel(userLevel);
    }
  }, [userLevel]);

  // Accent mapping
  const accentLabels: Record<Accent, string> = {
    "en-us": "American (US)",
    "en-gb": "British (UK)",
    "en-au": "Australian (AU)"
  };

  // Accent query mapping for Google Translate TTS
  const tlMap: Record<Accent, string> = {
    "en-us": "en",
    "en-gb": "en-gb",
    "en-au": "en-au"
  };

  // Filter lessons based on selected level
  const filteredLessons = CEFR_LESSONS.filter(l => l.level === selectedLevel);

  // Force loading of voices
  useEffect(() => {
    const handleVoicesChanged = () => {
      // Warm up voices
    };
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
      window.speechSynthesis.getVoices();
    }
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
      }
    };
  }, []);

  const currentSentenceText = activeLesson ? activeLesson.sentences[currentSentenceIndex] : "";

  // Get URL for Google translate TTS
  const getAudioUrl = (text: string, currentAccent: Accent) => {
    const truncatedText = text.length > 200 ? text.substring(0, 195) + "..." : text;
    const tlMap: Record<Accent, string> = {
      "en-us": "en",
      "en-gb": "en-gb",
      "en-au": "en-au"
    };
    return `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tlMap[currentAccent]}&client=tw-ob&q=${encodeURIComponent(truncatedText)}`;
  };

  const audioSrc = currentSentenceText ? getAudioUrl(currentSentenceText, accent) : "";

  // Sync audio element settings
  useEffect(() => {
    if (audioRef.current && !useLocalSynthesis) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, useLocalSynthesis]);

  useEffect(() => {
    if (audioRef.current && !useLocalSynthesis) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted, useLocalSynthesis]);

  // Load and play/pause the audio element
  useEffect(() => {
    if (useLocalSynthesis) return;

    if (audioRef.current && audioSrc) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn("Audio tag playback failed, falling back to local synthesis:", err);
          setUseLocalSynthesis(true);
        });
      }
    }
  }, [audioSrc, useLocalSynthesis]);

  useEffect(() => {
    if (useLocalSynthesis) return;

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn("Audio tag play failed, falling back to local synthesis:", err);
          setUseLocalSynthesis(true);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, useLocalSynthesis]);

  // Execute speech synthesis (fallback)
  useEffect(() => {
    if (!useLocalSynthesis || !activeLesson) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setAudioError(null);

      if (currentSentenceText) {
        try {
          const utterance = new SpeechSynthesisUtterance(currentSentenceText);
          utterance.rate = playbackRate;
          utterance.volume = isMuted ? 0 : volume;

          const langMap: Record<Accent, string> = {
            "en-us": "en-US",
            "en-gb": "en-GB",
            "en-au": "en-AU"
          };
          const targetLang = langMap[accent];
          utterance.lang = targetLang;

          const voices = window.speechSynthesis.getVoices();
          const matchedVoice = voices.find(v => v.lang.replace("_", "-") === targetLang) ||
                               voices.find(v => v.lang.toLowerCase().replace("_", "-") === targetLang.toLowerCase()) ||
                               voices.find(v => v.lang.toLowerCase().startsWith(targetLang.toLowerCase().substring(0, 5))) ||
                               voices.find(v => v.lang.toLowerCase().startsWith("en")) ||
                               voices[0];

          if (matchedVoice) {
            utterance.voice = matchedVoice;
          }

          utterance.onend = () => {
            handleEnded();
          };

          utterance.onerror = (e) => {
            if (e.error !== "interrupted" && (e.error as string) !== "removed") {
              console.error("SpeechSynthesis error:", e);
              setAudioError("Local speech synthesizer failed. Try switching accents.");
              setIsPlaying(false);
            }
          };

          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.error("SpeechSynthesis exception:", err);
          setAudioError("Local synthesizer failed. Try switching accents.");
          setIsPlaying(false);
        }
      }
    } else {
      window.speechSynthesis.cancel();
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentSentenceIndex, isPlaying, accent, activeLesson, playbackRate, volume, isMuted, useLocalSynthesis]);

  const handleTogglePlay = () => {
    if (!activeLesson) return;

    if (isPlaying) {
      if (useLocalSynthesis) {
        window.speechSynthesis.cancel();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (onIncrementPracticeCount) {
        onIncrementPracticeCount();
      }
    }
  };

  const handleSentenceSelect = (idx: number) => {
    if (useLocalSynthesis) {
      window.speechSynthesis.cancel();
    }
    setCurrentSentenceIndex(idx);
    setIsPlaying(true);
    if (onIncrementPracticeCount) {
      onIncrementPracticeCount();
    }
  };

  const handleEnded = () => {
    if (!activeLesson) return;
    
    // Auto advance to the next sentence if available
    if (currentSentenceIndex < activeLesson.sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
    } else {
      // Loop or stop
      setIsPlaying(false);
      setCurrentSentenceIndex(0);
    }
  };

  const handlePrevSentence = () => {
    if (useLocalSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(prev => prev - 1);
    }
  };

  const handleNextSentence = () => {
    if (useLocalSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (activeLesson && currentSentenceIndex < activeLesson.sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
    }
  };

  const handleResetLesson = () => {
    if (useLocalSynthesis) {
      window.speechSynthesis.cancel();
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentSentenceIndex(0);
    setIsPlaying(false);
  };

  const handleBackToCatalog = () => {
    if (useLocalSynthesis) {
      window.speechSynthesis.cancel();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
    setActiveLesson(null);
    setIsPlaying(false);
    setCurrentSentenceIndex(0);
  };

  return (
    <div className="space-y-6" id="audio-classroom-container">
      {/* Hidden HTML5 Audio tag with no-referrer policy */}
      <audio
        ref={audioRef}
        src={audioSrc}
        referrerPolicy="no-referrer"
        onEnded={handleEnded}
        onError={(e) => {
          console.warn("Google TTS stream errored, switching to local synthesis.", e);
          setUseLocalSynthesis(true);
        }}
      />

      {!activeLesson ? (
        // Catalog view
        <div className="space-y-6">
          <div className="bg-[#141417] rounded-xl border border-white/5 p-6 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif text-white uppercase tracking-wider flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-[#D4AF37]" />
                  <span>CEFR Audio Classroom</span>
                </h2>
                <p className="text-[#8E9299] text-xs mt-1">
                  Listen to clear, human-like high-fidelity audio lectures and dialogues mapped perfectly to your level.
                </p>
              </div>

              {/* CEFR Selector buttons */}
              <div className="flex flex-wrap gap-1.5 bg-black/35 p-1 rounded-lg border border-white/5">
                {(["A0", "A1", "A2", "B1", "B2", "C1", "C2"] as CEFRLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-3 py-1.5 rounded text-[10px] font-mono font-extrabold tracking-wider transition cursor-pointer ${
                      selectedLevel === lvl
                        ? "bg-[#D4AF37] text-black"
                        : "text-[#8E9299] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lessons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLessons.length > 0 ? (
              filteredLessons.map((lesson) => (
                <motion.div
                  key={lesson.id}
                  whileHover={{ y: -2, borderColor: "rgba(212, 175, 55, 0.2)" }}
                  className="bg-[#141417] border border-white/5 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:shadow-xl transition duration-200"
                >
                  <div className="space-y-3.5">
                    {/* Header tags */}
                    <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase">
                      <span className="text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded border border-[#D4AF37]/25">
                        {lesson.category}
                      </span>
                      <span className="text-[#8E9299] flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-[#D4AF37]" />
                        {lesson.durationEstimate} Audio
                      </span>
                    </div>

                    {/* Titles */}
                    <div>
                      <h3 className="text-base font-serif font-bold text-white tracking-wide">{lesson.title}</h3>
                      <p className="text-[#D4AF37]/80 text-xs font-sans mt-0.5 font-medium" dir="rtl">
                        {lesson.arabicTitle}
                      </p>
                    </div>

                    {/* Descriptions */}
                    <div className="space-y-2 text-xs leading-relaxed">
                      <p className="text-[#8E9299]">{lesson.description}</p>
                      <p className="text-[#62656B] italic font-sans" dir="rtl">
                        {lesson.arabicDescription}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-white/5 mt-5 flex justify-end">
                    <button
                      onClick={() => setActiveLesson(lesson)}
                      className="inline-flex items-center gap-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/35 text-[#D4AF37] font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-lg transition duration-200 cursor-pointer"
                    >
                      <span>Enter Classroom</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 text-center py-12 bg-[#141417] rounded-xl border border-white/5 p-6">
                <p className="text-[#8E9299] text-xs">No lessons added for level {selectedLevel} yet.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Classroom view
        <div className="space-y-6">
          {/* Top Back bar */}
          <div className="flex items-center justify-between bg-[#141417] border border-white/5 rounded-xl p-4 shadow-xl">
            <button
              onClick={handleBackToCatalog}
              className="inline-flex items-center gap-2 text-xs text-[#8E9299] hover:text-white transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Catalog</span>
            </button>

            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] px-2.5 py-1 rounded border border-[#D4AF37]/25 font-bold uppercase tracking-wider">
                Level {activeLesson.level}
              </span>
              <span className="text-[10px] text-[#8E9299] font-bold uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded border border-white/10">
                {activeLesson.category}
              </span>
            </div>
          </div>

          {/* Classroom Main Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Interactive Lesson Reading Board */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-[#141417] border border-white/5 rounded-xl p-5 md:p-6 shadow-2xl space-y-6">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wide">
                    {activeLesson.title}
                  </h3>
                  <p className="text-[#E5C158] text-sm font-sans mt-0.5 font-bold flex items-center gap-2" dir="rtl">
                    <span>{activeLesson.arabicTitle}</span>
                  </p>
                </div>

                {/* Subtitle instructions */}
                <p className="text-[11px] text-[#8E9299] leading-relaxed pb-3 border-b border-white/5">
                  💡 <span className="font-bold text-[#D4AF37] uppercase tracking-wider text-[10px]">How to use:</span> Click the play button to listen sequentially, or click on any individual sentence bubble to hear its pronunciation and isolate the sentence. Keep an eye on the highlighted segment!
                </p>

                {/* Sentences Container */}
                <div className="space-y-3" id="audio-lesson-transcript">
                  {activeLesson.sentences.map((sentence, idx) => {
                    const isActive = idx === currentSentenceIndex;
                    return (
                      <motion.div
                        key={idx}
                        onClick={() => handleSentenceSelect(idx)}
                        className={`p-4 rounded-xl border text-xs transition duration-200 cursor-pointer relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isActive
                            ? "bg-[#D4AF37]/10 border-[#D4AF37]/40 shadow-inner"
                            : "bg-[#0F0F12] border-white/5 hover:border-white/10"
                        }`}
                        animate={isActive ? { scale: 1.01 } : { scale: 1 }}
                      >
                        {/* Interactive marker */}
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]" />
                        )}

                        <div className="space-y-2 flex-1">
                          {/* English block */}
                          <div className={`text-xs md:text-sm leading-relaxed font-serif font-medium ${
                            isActive ? "text-white" : "text-[#E0E0E0]/95"
                          }`}>
                            <span className="text-[10px] text-[#8E9299] font-mono mr-2.5">{idx + 1}.</span>
                            {sentence}
                          </div>

                          {/* Arabic block */}
                          <div className="text-xs text-[#E5C158] leading-relaxed font-sans text-right" dir="rtl">
                            {activeLesson.arabicTranslations[idx]}
                          </div>
                        </div>

                        {/* Status Icon */}
                        <div className="shrink-0 flex items-center justify-end">
                          {isActive && isPlaying ? (
                            <div className="flex items-end gap-0.5 h-4 px-1">
                              {[1, 2, 3].map((bar) => (
                                <motion.div
                                  key={bar}
                                  className="w-0.5 bg-[#D4AF37] rounded-full"
                                  animate={{ height: [4, 14, 4] }}
                                  transition={{
                                    duration: 0.5 + bar * 0.15,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                  style={{ height: "4px" }}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center border text-[10px] transition ${
                              isActive
                                ? "bg-[#D4AF37] text-black border-transparent font-bold"
                                : "bg-white/5 border-white/5 text-[#8E9299] hover:bg-white/10"
                            }`}>
                              <Play className="h-3 w-3 fill-current ml-0.5" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Vocab details if available */}
              {activeLesson.vocabList && activeLesson.vocabList.length > 0 && (
                <div className="bg-[#141417] border border-white/5 rounded-xl p-5 md:p-6 shadow-2xl space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <BookMarked className="h-4.5 w-4.5 text-[#D4AF37]" />
                    <span className="text-xs font-serif text-white font-bold uppercase tracking-wider">Lesson Keywords & Phonetics</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {activeLesson.vocabList.map((vocab, vIdx) => (
                      <div 
                        key={vIdx}
                        className="bg-[#0F0F12] border border-white/5 rounded-lg p-3.5 space-y-2 relative"
                      >
                        <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                          <span className="font-bold text-white text-xs font-serif">{vocab.word}</span>
                          <span className="font-mono text-[9px] text-[#8E9299]">{vocab.phonetic}</span>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-[10px] text-[#E5C158] font-sans font-bold text-right leading-relaxed" dir="rtl">
                            {vocab.arabicMeaning}
                          </p>
                          <p className="text-[10px] text-[#8E9299] leading-relaxed">
                            {vocab.meaning}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right: Smart Humanistic Audio Control Center */}
            <div className="space-y-6">
              <div className="bg-[#141417] border border-white/5 rounded-xl p-5 shadow-2xl space-y-5 sticky top-6">
                
                {/* Visualizer header */}
                <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                  <div className="h-8 w-8 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center border border-[#D4AF37]/25 text-[#D4AF37]">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-serif font-bold text-white uppercase tracking-wider">Sound Control</h4>
                    <span className="text-[9px] text-[#8E9299] uppercase tracking-widest font-bold flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5 text-[#D4AF37]" /> Natural English Synthesis
                    </span>
                  </div>
                </div>

                {/* Sentence index text readout */}
                <div className="text-center bg-[#0F0F12] p-3 rounded-lg border border-white/5 space-y-1 select-none">
                  <span className="text-[9px] font-bold text-[#8E9299] uppercase tracking-widest">Acoustic Segment</span>
                  <div className="font-mono text-sm font-extrabold text-[#D4AF37] tracking-wider uppercase">
                    Sentence {currentSentenceIndex + 1} of {activeLesson.sentences.length}
                  </div>
                </div>

                {/* Waveform Visualization */}
                <div className="flex items-center justify-between gap-1 h-8 bg-black/35 rounded-lg px-4 py-2 border border-white/5">
                  <span className="text-[8px] font-bold text-[#8E9299] uppercase tracking-widest">Active Sound Waves</span>
                  <div className="flex items-end gap-1 h-full">
                    {Array.from({ length: 15 }).map((_, i) => {
                      const h = [10, 24, 16, 28, 12, 22, 14, 26, 8, 18, 12, 24, 16, 28, 10][i];
                      return (
                        <motion.div
                          key={i}
                          className="w-0.5 bg-[#D4AF37] rounded-t-sm"
                          animate={isPlaying ? {
                            height: [4, h, 4],
                          } : {
                            height: 4
                          }}
                          transition={isPlaying ? {
                            duration: 0.6 + (i % 4) * 0.12,
                            repeat: Infinity,
                            ease: "easeInOut"
                          } : {
                            duration: 0.15
                          }}
                          style={{ height: "4px" }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Primary play controls */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={handlePrevSentence}
                      disabled={currentSentenceIndex === 0}
                      className="h-10 w-10 bg-white/5 hover:bg-white/10 disabled:opacity-20 border border-white/10 rounded-full flex items-center justify-center transition text-white cursor-pointer"
                      title="Previous sentence"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                      onClick={handleTogglePlay}
                      className={`h-14 w-14 rounded-full flex items-center justify-center transition duration-200 cursor-pointer shadow-lg ${
                        isPlaying 
                          ? "bg-white text-black hover:bg-slate-200" 
                          : "bg-[#D4AF37] text-black hover:brightness-110 shadow-[#D4AF37]/10"
                      }`}
                      title={isPlaying ? "Pause Session" : "Play Session"}
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6 stroke-[2.5]" />
                      ) : (
                        <Play className="h-6 w-6 fill-black stroke-[2.5] ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={handleNextSentence}
                      disabled={currentSentenceIndex === activeLesson.sentences.length - 1}
                      className="h-10 w-10 bg-white/5 hover:bg-white/10 disabled:opacity-20 border border-white/10 rounded-full flex items-center justify-center transition text-white cursor-pointer"
                      title="Next sentence"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleResetLesson}
                      className="inline-flex items-center gap-1.5 text-[10px] text-[#8E9299] hover:text-white font-bold uppercase tracking-widest transition"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Replay Lesson</span>
                    </button>
                  </div>
                </div>

                {/* Playback Accent / Voice Selector */}
                <div className="space-y-1.5">
                  <label className="font-bold text-[#8E9299] uppercase tracking-widest text-[9px] block">Voice Accent Model</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowAccentMenu(!showAccentMenu)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-[#0F0F12] hover:bg-white/5 border border-white/10 rounded-lg text-xs text-white font-bold transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-[#D4AF37]" />
                        <span>{accentLabels[accent]}</span>
                      </span>
                      <ChevronRight className={`h-3.5 w-3.5 transition duration-200 ${showAccentMenu ? "rotate-90" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {showAccentMenu && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowAccentMenu(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                            className="absolute left-0 right-0 mt-1.5 bg-[#141417] border border-white/10 rounded-lg shadow-2xl z-50 p-1 text-xs"
                          >
                            {(Object.keys(accentLabels) as Accent[]).map((key) => (
                              <button
                                key={key}
                                onClick={() => {
                                  setAccent(key);
                                  setShowAccentMenu(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-md transition font-bold flex items-center justify-between cursor-pointer ${
                                  accent === key 
                                    ? "bg-[#D4AF37]/10 text-[#D4AF37]" 
                                    : "text-[#8E9299] hover:bg-white/5 hover:text-white"
                                }`}
                              >
                                <span>{accentLabels[key]}</span>
                                {accent === key && <span className="h-1 w-1 rounded-full bg-[#D4AF37]" />}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Speed Controls */}
                <div className="space-y-2">
                  <label className="font-bold text-[#8E9299] uppercase tracking-widest text-[9px] block">Acoustic Pace</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0.8, 1.0, 1.2, 1.5].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setPlaybackRate(rate)}
                        className={`py-1.5 rounded text-[10px] font-mono font-bold border transition cursor-pointer ${
                          playbackRate === rate 
                            ? "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]" 
                            : "bg-transparent border-white/5 text-[#8E9299] hover:text-white"
                        }`}
                      >
                        {rate.toFixed(1)}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volume Controller */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-[10px] text-[#8E9299] font-bold uppercase tracking-wider">
                    <span>Acoustic Volume</span>
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-[#8E9299] hover:text-white transition cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setVolume(v);
                        setIsMuted(v === 0);
                      }}
                      className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#D4AF37] outline-none"
                    />
                  </div>
                </div>

                {/* Streaming status error or warnings */}
                {audioError && (
                  <p className="text-[10px] text-red-400 italic font-medium tracking-wide bg-red-950/15 border border-red-500/10 p-2.5 rounded text-center leading-relaxed">
                    ⚠️ {audioError}
                  </p>
                )}

              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
