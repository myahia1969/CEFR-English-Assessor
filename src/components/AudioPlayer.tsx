import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Headphones, 
  Sparkles,
  ChevronDown,
  Globe
} from "lucide-react";

interface AudioPlayerProps {
  textToSpeak: string;
  title?: string;
  id?: string;
}

type Accent = "en-us" | "en-gb" | "en-au";

export default function AudioPlayer({ textToSpeak, title = "Pronunciation & Dialogue Audio", id = "audio-player" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [accent, setAccent] = useState<Accent>("en-us");
  const [showAccentMenu, setShowAccentMenu] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [useLocalSynthesis, setUseLocalSynthesis] = useState(false);

  // Warm up voices
  useEffect(() => {
    const handleVoicesChanged = () => {
      // Warm up voices list
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

  // Construct Google TTS stream URL based on accent and text
  const getAudioUrl = (text: string, currentAccent: Accent) => {
    // Truncate if text is extremely long to prevent query limit issues (Google TTS TW-OB has ~200 limit)
    const truncatedText = text.length > 200 ? text.substring(0, 195) + "..." : text;
    const tlMap: Record<Accent, string> = {
      "en-us": "en",
      "en-gb": "en-gb",
      "en-au": "en-au"
    };
    return `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tlMap[currentAccent]}&client=tw-ob&q=${encodeURIComponent(truncatedText)}`;
  };

  const audioSrc = getAudioUrl(textToSpeak, accent);

  // Sync timeline duration and reset current time when text or accent changes
  const wordsCount = textToSpeak ? textToSpeak.trim().split(/\s+/).length : 0;
  const baseDuration = Math.max(2.5, (wordsCount / 140) * 60);
  const activeDuration = baseDuration / playbackRate;

  useEffect(() => {
    if (useLocalSynthesis) {
      setCurrentTime(0);
      setDuration(activeDuration);
    }
  }, [textToSpeak, accent, playbackRate, useLocalSynthesis, activeDuration]);

  // Handle ticking the timeline slider when playing with local synthesis
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isPlaying && useLocalSynthesis) {
      const step = 0.05; // 50ms interval updates
      const intervalMs = 50;
      
      timer = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + (step * playbackRate);
          if (next >= activeDuration) {
            if (timer) clearInterval(timer);
            return activeDuration;
          }
          return next;
        });
      }, intervalMs);
    } else {
      if (timer) clearInterval(timer);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, playbackRate, activeDuration, useLocalSynthesis]);

  // Sync audio element with state parameters
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

    if (audioRef.current) {
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
    if (!useLocalSynthesis) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setAudioError(null);

      if (textToSpeak) {
        try {
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
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
            setIsPlaying(false);
            setCurrentTime(0);
          };

          utterance.onerror = (e) => {
            if (e.error !== "interrupted" && (e.error as string) !== "removed") {
              console.error("AudioPlayer SpeechSynthesis error:", e);
              setAudioError("Both online and offline voice synthesis models failed.");
              setIsPlaying(false);
            }
          };

          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.error("AudioPlayer SpeechSynthesis exception:", err);
          setAudioError("Unable to synthesize current text segment.");
          setIsPlaying(false);
        }
      }
    } else {
      window.speechSynthesis.cancel();
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isPlaying, textToSpeak, accent, playbackRate, volume, isMuted, useLocalSynthesis]);

  const togglePlay = () => {
    if (isPlaying) {
      if (useLocalSynthesis) {
        window.speechSynthesis.cancel();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const restartAudio = () => {
    setCurrentTime(0);
    if (useLocalSynthesis) {
      window.speechSynthesis.cancel();
      if (isPlaying) {
        setIsPlaying(false);
        setTimeout(() => setIsPlaying(true), 50);
      } else {
        setIsPlaying(true);
      }
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (!isPlaying) {
        setIsPlaying(true);
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (useLocalSynthesis) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setTimeout(() => setIsPlaying(true), 50);
      }
    } else if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !useLocalSynthesis) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !useLocalSynthesis) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Helper to format time as M:SS
  const formatTime = (timeInSecs: number) => {
    if (isNaN(timeInSecs)) return "0:00";
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const accentLabels: Record<Accent, string> = {
    "en-us": "American (US)",
    "en-gb": "British (UK)",
    "en-au": "Australian (AU)"
  };

  return (
    <div 
      className="bg-[#0F0F12] border border-white/5 rounded-xl p-4 md:p-5 shadow-inner space-y-4"
      id={id}
    >
      {/* Hidden HTML5 Audio tag with no-referrer policy */}
      <audio
        ref={audioRef}
        src={audioSrc}
        referrerPolicy="no-referrer"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={(e) => {
          console.warn("Google TTS stream errored out, switching to browser-native synthesis.", e);
          setUseLocalSynthesis(true);
        }}
      />

      {/* Header / Info bar inside player */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center border border-[#D4AF37]/25 text-[#D4AF37]">
            <Headphones className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-serif font-bold text-white uppercase tracking-wider">{title}</h4>
            <span className="text-[9px] text-[#8E9299] uppercase tracking-widest font-bold flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5 text-[#D4AF37]" /> AI Synthesized Voice
            </span>
          </div>
        </div>

        {/* Accent Selector */}
        <div className="relative">
          <button
            onClick={() => setShowAccentMenu(!showAccentMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] text-white font-bold tracking-wide transition cursor-pointer"
            id={`${id}-accent-btn`}
          >
            <Globe className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span>{accentLabels[accent]}</span>
            <ChevronDown className={`h-3 w-3 transition duration-200 ${showAccentMenu ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showAccentMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowAccentMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute right-0 mt-1.5 w-40 bg-[#141417] border border-white/10 rounded-lg shadow-xl z-50 p-1 text-[10px]"
                >
                  {(Object.keys(accentLabels) as Accent[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setAccent(key);
                        setShowAccentMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded transition font-bold flex items-center justify-between cursor-pointer ${
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

      {/* Main Control Panel */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-black/25 rounded-lg p-3 border border-white/5">
        
        {/* Buttons Grid */}
        <div className="flex items-center gap-2.5 shrink-0 justify-center">
          <button
            onClick={togglePlay}
            className={`h-10 w-10 rounded-full flex items-center justify-center transition duration-200 cursor-pointer shadow-md ${
              isPlaying 
                ? "bg-white text-black hover:bg-slate-200" 
                : "bg-[#D4AF37] text-black hover:brightness-110 shadow-[#D4AF37]/10"
            }`}
            title={isPlaying ? "Pause" : "Play Audio"}
            id={`${id}-play-btn`}
          >
            {isPlaying ? (
              <Pause className="h-4.5 w-4.5 stroke-[2.5]" />
            ) : (
              <Play className="h-4.5 w-4.5 fill-black stroke-[2.5] ml-0.5" />
            )}
          </button>

          <button
            onClick={restartAudio}
            className="h-8 w-8 bg-white/5 hover:bg-white/10 border border-white/10 text-[#8E9299] hover:text-white rounded-full flex items-center justify-center transition cursor-pointer"
            title="Replay from start"
            id={`${id}-restart-btn`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Progress Bar & Timers */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-[10px] font-mono text-[#8E9299] shrink-0">{formatTime(currentTime)}</span>
          
          <div className="flex-1 relative group py-2">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.05"
              value={currentTime}
              onChange={handleScrub}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#D4AF37] outline-none transition group-hover:bg-white/20"
              title="Scrub timeline"
              id={`${id}-scrubber`}
            />
            {/* Visual background fill progress indicator */}
            <div 
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              className="absolute left-0 top-[14px] h-1 bg-[#D4AF37] rounded-l-lg pointer-events-none"
            />
          </div>

          <span className="text-[10px] font-mono text-[#8E9299] shrink-0">
            {duration ? formatTime(duration) : "0:00"}
          </span>
        </div>

        {/* Playback speed buttons */}
        <div className="flex items-center justify-center gap-1.5 shrink-0 border-t border-white/5 md:border-t-0 md:border-l md:border-white/5 pt-2.5 md:pt-0 md:pl-3">
          {[0.8, 1.0, 1.2, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => handleSpeedChange(rate)}
              className={`px-2 py-1 rounded text-[9px] font-mono font-bold border transition cursor-pointer ${
                playbackRate === rate 
                  ? "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]" 
                  : "bg-transparent border-white/5 text-[#8E9299] hover:text-white"
              }`}
              title={`Change playback speed to ${rate}x`}
            >
              {rate.toFixed(1)}x
            </button>
          ))}
        </div>

        {/* Volume controller */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 md:border-l md:border-white/5 md:pl-3">
          <button 
            onClick={toggleMute}
            className="text-[#8E9299] hover:text-white transition cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#D4AF37] outline-none"
            title="Adjust volume"
          />
        </div>

      </div>

      {/* Animation visual waveform bars - active when isPlaying */}
      <div className="flex items-center justify-between gap-1 h-6 bg-black/10 rounded px-4 py-1.5 border border-white/5">
        <span className="text-[8px] font-bold text-[#8E9299] uppercase tracking-widest">Acoustic Signature</span>
        <div className="flex items-end gap-1 h-full">
          {Array.from({ length: 18 }).map((_, i) => {
            // Generate distinct heights and animate
            const h = [10, 24, 16, 28, 12, 22, 14, 26, 8, 18, 12, 24, 16, 28, 10, 20, 14, 24][i];
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
                  duration: 0.8 + (i % 5) * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {
                  duration: 0.2
                }}
                style={{ height: "4px" }}
              />
            );
          })}
        </div>
      </div>

      {/* Audio streaming warnings or status errors */}
      {audioError && (
        <p className="text-[10px] text-red-400 italic font-medium tracking-wide bg-red-950/15 border border-red-500/10 p-2 rounded text-center">
          {audioError} (Try clicking British or Australian accents as backup streams!)
        </p>
      )}
    </div>
  );
}
