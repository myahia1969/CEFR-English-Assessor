import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, SkipForward, Play, RefreshCw, Star } from "lucide-react";

interface SplashIntroProps {
  onComplete: () => void;
}

export default function SplashIntro({ onComplete }: SplashIntroProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [revealPhase, setRevealPhase] = useState<"dark" | "ambient" | "sweep" | "impact" | "resolved">("dark");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Sound Design Generator using Web Audio API
  const playCinematicSound = () => {
    if (!soundEnabled) return;
    try {
      // Create or resume AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      // 1. Deep Sub-bass Rumble (Atmospheric depth)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(45, ctx.currentTime); // Low F# / G
      subOsc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 4.0);
      
      subGain.gain.setValueAtTime(0.01, ctx.currentTime);
      subGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 2.0);
      subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 5.0);
      
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start();
      subOsc.stop(ctx.currentTime + 5.5);

      // 2. High Wind Sweep & Ambient Rise
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 3.0);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      const bufferSize = ctx.sampleRate * 4; // 4 seconds of noise
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, ctx.currentTime);
      noiseGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 2.5);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start();

      // 3. Golden Synth Chords/Swell (Academic Prestige)
      const frequencies = [110, 220, 330, 440, 554.37, 659.25, 880]; // A major 7 / F# harmony strings
      const oscillators: OscillatorNode[] = [];
      const chordGain = ctx.createGain();
      chordGain.gain.setValueAtTime(0.01, ctx.currentTime);
      chordGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 3.0);
      chordGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.5);

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        
        osc.type = idx % 2 === 0 ? "sawtooth" : "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        // Add tiny detune for rich vintage analog unison warmth
        osc.detune.setValueAtTime((Math.random() - 0.5) * 15, ctx.currentTime);

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.setValueAtTime(120, ctx.currentTime);
        lowpass.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 3.0);

        osc.connect(lowpass);
        if (panner) {
          panner.pan.setValueAtTime((idx / frequencies.length) * 2 - 1, ctx.currentTime);
          lowpass.connect(panner);
          panner.connect(chordGain);
        } else {
          lowpass.connect(chordGain);
        }
        
        osc.start();
        osc.stop(ctx.currentTime + 5.0);
        oscillators.push(osc);
      });
      chordGain.connect(ctx.destination);

      // 4. MEMORABLE GOLDEN HIT (At 3.2 seconds - the precise peak of transition)
      setTimeout(() => {
        if (ctx.state === "closed") return;

        // Bass Impact Sub-boom
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.type = "sine";
        kickOsc.frequency.setValueAtTime(120, ctx.currentTime);
        kickOsc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
        kickGain.gain.setValueAtTime(0.4, ctx.currentTime);
        kickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        kickOsc.connect(kickGain);
        kickGain.connect(ctx.destination);
        kickOsc.start();
        kickOsc.stop(ctx.currentTime + 1.5);

        // Glass crystal chime
        const chimeFreqs = [1046.50, 1318.51, 1567.98, 2093.00]; // High C Major chord sparkles
        chimeFreqs.forEach((cf, index) => {
          const chimeOsc = ctx.createOscillator();
          const chimeGain = ctx.createGain();
          chimeOsc.type = "sine";
          chimeOsc.frequency.setValueAtTime(cf, ctx.currentTime);
          
          chimeGain.gain.setValueAtTime(0.001, ctx.currentTime);
          chimeGain.gain.linearRampToValueAtTime(0.12 - (index * 0.02), ctx.currentTime + 0.02);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5 + (index * 0.5));
          
          chimeOsc.connect(chimeGain);
          chimeGain.connect(ctx.destination);
          chimeOsc.start();
          chimeOsc.stop(ctx.currentTime + 4.0);
        });

        // Golden Metal Shimmer (Simulating luxury gold plates rubbing gently)
        const shimmerOsc = ctx.createOscillator();
        const shimmerGain = ctx.createGain();
        shimmerOsc.type = "triangle";
        shimmerOsc.frequency.setValueAtTime(3200, ctx.currentTime);
        // Rapid vibrato frequency modulation
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(25, ctx.currentTime);
        lfoGain.gain.setValueAtTime(80, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(shimmerOsc.frequency);
        lfo.start();
        
        shimmerGain.gain.setValueAtTime(0.04, ctx.currentTime);
        shimmerGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
        
        shimmerOsc.connect(shimmerGain);
        shimmerGain.connect(ctx.destination);
        shimmerOsc.start();
        shimmerOsc.stop(ctx.currentTime + 1.0);
        lfo.stop(ctx.currentTime + 1.0);

      }, 3200);

    } catch (e) {
      console.warn("Web Audio API could not initialize:", e);
    }
  };

  // Particle Canvas Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Drifting gold flakes
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      alpha: number;
      spin: number;
      spinSpeed: number;
      depth: number;
    }

    const particles: Particle[] = Array.from({ length: 85 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height + height, // start from bottom or offscreen
      size: Math.random() * 2 + 0.5,
      speedY: -(Math.random() * 0.6 + 0.3),
      speedX: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.4 + 0.1,
      spin: Math.random() * 360,
      spinSpeed: (Math.random() - 0.5) * 0.02,
      depth: Math.random()
    }));

    const drawParticles = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw absolute background ambient radial lighting gradient
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.6
      );
      
      // Luxury dark navy/charcoal vignette
      gradient.addColorStop(0, "#191c24");
      gradient.addColorStop(0.5, "#0d0f13");
      gradient.addColorStop(1, "#040507");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.spin += p.spinSpeed;

        // Recycle particle
        if (p.y < -50) {
          p.y = height + Math.random() * 100;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        
        // Premium gold color palette with varying opacity/depth
        const goldHue = 45; // Golden yellow
        const goldSat = Math.floor(Math.random() * 20) + 70; // 70% to 90% saturation
        const goldLight = Math.floor(Math.random() * 30) + 55; // 55% to 85% light

        ctx.fillStyle = `hsla(${goldHue}, ${goldSat}%, ${goldLight}%, ${p.alpha})`;
        
        // Star or soft circle depending on size
        if (p.size > 1.8) {
          // Draw subtle golden star dust particle
          ctx.beginPath();
          for (let i = 0; i < 4; i++) {
            ctx.lineTo(0, -p.size * 1.8);
            ctx.rotate(Math.PI / 2);
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      });

      animationId = requestAnimationFrame(drawParticles);
    };

    drawParticles();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Cinematic timings
  useEffect(() => {
    // Stage 1: Absolute dark intro
    const t0 = setTimeout(() => setRevealPhase("ambient"), 400);
    
    // Stage 2: Glow sweeps across emblem frame
    const t1 = setTimeout(() => setRevealPhase("sweep"), 1800);
    
    // Stage 3: The Big Impact gold reveal and sound chime
    const t2 = setTimeout(() => {
      setRevealPhase("impact");
      if (soundEnabled && hasInteracted) {
        playCinematicSound();
      }
    }, 3200);

    // Stage 4: Resolution of ambient glows and elegant presentation
    const t3 = setTimeout(() => setRevealPhase("resolved"), 5200);

    // Auto-complete intro entirely after 8 seconds
    const t4 = setTimeout(() => {
      handleSkip();
    }, 8500);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [hasInteracted, soundEnabled]);

  const handleStartInteraction = () => {
    setHasInteracted(true);
    // Boot up cinematic immediately
    playCinematicSound();
  };

  const handleSkip = () => {
    setIsPlaying(false);
    setTimeout(() => {
      onComplete();
    }, 450); // Fadeout buffer
  };

  return (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          id="splash-intro-root"
          className="fixed inset-0 z-[9999] overflow-hidden flex flex-col justify-between"
          exit={{ opacity: 0, scale: 1.05, filter: "blur(12px)" }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Drifting Golden Particle Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Luxury ambient vignettes */}
          <div className="absolute inset-0 bg-radial-gradient-vignette pointer-events-none mix-blend-overlay opacity-80" />

          {/* Header Action Row (Sound control) */}
          <div className="relative z-10 p-6 flex items-center justify-between w-full max-w-7xl mx-auto">
            <div className="flex items-center gap-1.5 bg-[#0F0F12]/35 border border-white/5 backdrop-blur-md px-3 py-1.5 rounded-full select-none">
              <Star className="h-3 w-3 text-[#D4AF37] animate-spin-slow" />
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#D4AF37] font-black">
                Fatima Academy • Revealed
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2.5 rounded-full bg-[#0F0F12]/40 hover:bg-[#D4AF37]/15 border border-white/5 hover:border-[#D4AF37]/30 text-[#C8C8CC] hover:text-[#D4AF37] transition duration-300 backdrop-blur-md cursor-pointer flex items-center gap-2"
                title={soundEnabled ? "Mute soundtrack" : "Unmute soundtrack"}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span className="text-[9px] font-mono tracking-widest font-bold uppercase hidden sm:inline">
                  {soundEnabled ? "Audio On" : "Muted"}
                </span>
              </button>
            </div>
          </div>

          {/* Interactive Start screen overlay to request browser permission for AudioContext */}
          {!hasInteracted ? (
            <div className="absolute inset-0 bg-[#07080a]/95 z-[10000] flex flex-col items-center justify-center p-6 text-center space-y-8 backdrop-blur-lg">
              <div className="relative">
                <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#D4AF37]/25 to-transparent blur-xl absolute -inset-1 animate-pulse" />
                <div className="h-24 w-24 rounded-full border border-[#D4AF37]/30 bg-[#0F0F12] flex items-center justify-center p-3">
                  {/* Glowing letter L in cursive representing logo */}
                  <span className="text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-br from-[#E4C563] via-[#D4AF37] to-[#8E793E]">L</span>
                </div>
              </div>

              <div className="max-w-md space-y-3">
                <h1 className="text-xl md:text-2xl font-serif font-black tracking-wider text-white uppercase">
                  Fatima Academy
                </h1>
                <p className="text-xs text-[#8E9299] leading-relaxed max-w-sm mx-auto">
                  Experience a premium world-class introductory reveal designed with custom audio synthesis and physical light sweep dynamics.
                </p>
              </div>

              <button
                onClick={handleStartInteraction}
                className="px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#A38122] hover:from-[#E4C563] hover:to-[#B39232] text-black font-serif font-black text-xs uppercase tracking-widest rounded-xl transition duration-300 shadow-xl shadow-[#D4AF37]/25 transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
              >
                <Play className="h-4.5 w-4.5 fill-black" />
                <span>Begin Cinematic Experience</span>
              </button>

              <button 
                onClick={handleSkip}
                className="text-[10px] text-slate-500 hover:text-white uppercase tracking-widest font-extrabold font-mono transition"
              >
                Skip Intro & Enter Directly
              </button>
            </div>
          ) : null}

          {/* Centerpiece: Cinematic Camera Sweep and Logo Reveal */}
          <div className="relative flex-1 flex flex-col items-center justify-center px-4">
            
            {/* Animated Glow Aura Flare (Behind the logo, fires on Impact phase) */}
            <motion.div
              className="absolute h-[320px] w-[320px] sm:h-[450px] sm:w-[450px] rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none"
              initial={{ scale: 0.1, opacity: 0 }}
              animate={
                revealPhase === "impact" || revealPhase === "resolved"
                  ? { scale: [1, 1.4, 1.25], opacity: [0.5, 0.95, 0.65] }
                  : { scale: 0.1, opacity: 0 }
              }
              transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Main Emblem Camera Container */}
            <motion.div
              className="relative select-none flex flex-col items-center text-center space-y-6"
              initial={{ scale: 0.85, z: -100, rotateX: 15, rotateY: -15, filter: "blur(10px)", opacity: 0 }}
              animate={
                revealPhase === "dark" ? {} :
                revealPhase === "ambient" ? { scale: 0.95, z: -20, rotateX: 5, rotateY: -5, filter: "blur(2px)", opacity: 0.5 } :
                revealPhase === "sweep" ? { scale: 1.0, z: 0, rotateX: 0, rotateY: 0, filter: "blur(0px)", opacity: 0.8 } :
                revealPhase === "impact" ? { scale: [1.08, 1.0], z: 30, filter: "blur(0px)", opacity: 1.0 } :
                { scale: 0.98, z: 10, rotateX: 0, rotateY: 0, filter: "blur(0px)", opacity: 1.0 }
              }
              transition={{ duration: 3.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformStyle: "preserve-3d", perspective: 1200 }}
            >
              
              {/* Embossed Square Frame representing luxury medal plate */}
              <div className="relative p-0.5 rounded-[40px] bg-gradient-to-br from-white/10 via-transparent to-black/80 shadow-2xl">
                <div className="relative h-44 w-44 sm:h-52 sm:w-52 rounded-[38px] bg-gradient-to-br from-[#1B1E26] to-[#0A0B0E] p-4 flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
                  
                  {/* Background metallic glints */}
                  <div className="absolute inset-0 bg-radial-gradient-plate opacity-45" />

                  {/* Physical Light Sweep shine line */}
                  <motion.div 
                    className="absolute -inset-y-12 w-6 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 blur-[1.5px] pointer-events-none"
                    initial={{ left: "-50%" }}
                    animate={
                      revealPhase === "sweep" || revealPhase === "impact"
                        ? { left: "150%" }
                        : { left: "-50%" }
                    }
                    transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 2.5 }}
                  />

                  {/* Logo Image Rendering */}
                  <motion.img 
                    src="/icon-512.jpg" 
                    alt="Fatima Academy Gold Laurel Monogram L Logo"
                    className="h-full w-full object-contain rounded-[28px] pointer-events-none filter drop-shadow-[0_0_12px_rgba(212,175,55,0.15)]"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={
                      revealPhase === "impact" || revealPhase === "resolved"
                        ? { opacity: 1, scale: 1 }
                        : revealPhase === "sweep"
                        ? { opacity: 0.65, scale: 0.95 }
                        : { opacity: 0.25, scale: 0.9 }
                    }
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  
                  {/* Radial golden light spark when impact fires */}
                  {revealPhase === "impact" && (
                    <motion.div 
                      className="absolute inset-0 bg-radial-glow bg-gradient-to-r from-[#D4AF37]/50 via-white/20 to-transparent mix-blend-color-dodge rounded-[38px]"
                      initial={{ opacity: 1, scale: 0.2 }}
                      animate={{ opacity: 0, scale: 1.8 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  )}
                </div>
              </div>

              {/* Text Typography Reveals */}
              <div className="space-y-2 pointer-events-none">
                <motion.h2
                  className="text-lg sm:text-2xl font-serif text-white uppercase tracking-[0.25em] font-black"
                  initial={{ opacity: 0, y: 15 }}
                  animate={revealPhase === "impact" || revealPhase === "resolved" ? { opacity: 1, y: 0 } : { opacity: 0 }}
                  transition={{ duration: 1.0, delay: 0.3 }}
                >
                  Fatima Academy
                </motion.h2>

                <motion.div
                  className="flex flex-col items-center justify-center space-y-1"
                  initial={{ opacity: 0 }}
                  animate={revealPhase === "resolved" ? { opacity: 0.85 } : { opacity: 0 }}
                  transition={{ duration: 1.2, delay: 1.0 }}
                >
                  <span className="text-[9px] text-[#D4AF37] uppercase tracking-[0.25em] font-extrabold">
                    Fatima Engine • CEFR Core
                  </span>
                  <span className="text-[7px] text-slate-500 font-mono tracking-widest uppercase">
                    Developed by Fatima Mohamed Yahia
                  </span>
                </motion.div>
              </div>

            </motion.div>
          </div>

          {/* Footer controls: Skip button */}
          <div className="relative z-10 p-6 flex flex-col items-center w-full max-w-7xl mx-auto space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={revealPhase === "resolved" ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <button
                onClick={handleSkip}
                className="px-6 py-2.5 bg-white/5 hover:bg-[#D4AF37] border border-white/10 hover:border-transparent text-[#C8C8CC] hover:text-black font-serif font-black text-[10px] uppercase tracking-widest rounded-lg transition duration-300 backdrop-blur-md cursor-pointer flex items-center gap-1.5 shadow"
              >
                <span>Enter Academy Dashboard</span>
                <SkipForward className="h-3.5 w-3.5" />
              </button>
            </motion.div>

            <div className="flex justify-center w-full">
              <span className="text-[8px] font-mono text-slate-600 tracking-wider text-center uppercase">
                Premium Branding Reveal System © 2026. All rights reserved.
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
