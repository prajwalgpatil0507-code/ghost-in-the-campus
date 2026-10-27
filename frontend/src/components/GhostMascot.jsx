import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { playGhostBoo, playGhostChime } from '../utils/audio';

export default function GhostMascot({
  size = 'md',
  mood = 'friendly', // friendly, academic, spooky, thinking
  interactive = true,
  showSpeechBubble = false,
  speechText = "Hello! I'm Casperion, your campus spectral guide!",
  className = ""
}) {
  const [isWaving, setIsWaving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const sizeMap = {
    xs: { width: 40, height: 44, scale: 0.4 },
    sm: { width: 64, height: 72, scale: 0.65 },
    md: { width: 110, height: 120, scale: 1 },
    lg: { width: 160, height: 180, scale: 1.4 },
    xl: { width: 220, height: 250, scale: 1.8 }
  };

  const dim = sizeMap[size] || sizeMap.md;

  const handleClick = (e) => {
    if (!interactive) return;
    setIsWaving(true);
    playGhostBoo();

    // Trigger subtle colorful confetti burst
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 32,
      spread: 60,
      origin: { x, y },
      colors: ['#a855f7', '#06b6d4', '#c084fc', '#38bdf8', '#f43f5e'],
      disableForReducedMotion: true
    });

    setTimeout(() => setIsWaving(false), 1200);
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Optional Speech Bubble */}
      {showSpeechBubble && (
        <div className="mb-3 max-w-xs animate-bounce px-4 py-2 rounded-2xl glass-panel-glow border-spectral-purple/40 text-xs sm:text-sm text-purple-100 shadow-xl relative">
          <p className="font-medium leading-relaxed">{speechText}</p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-purple-900/80"></div>
        </div>
      )}

      {/* Mascot Container */}
      <div
        onClick={handleClick}
        onMouseEnter={() => { setIsHovered(true); if (interactive) playGhostChime(); }}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative cursor-pointer transition-transform duration-300 ${
          interactive ? 'hover:scale-105 active:scale-95' : ''
        }`}
        style={{ width: dim.width, height: dim.height }}
        title={interactive ? "Click me for a spectral greeting!" : "Casperion the Ghost"}
      >
        {/* Spectral Glow Aura */}
        <div
          className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 pointer-events-none ${
            mood === 'spooky'
              ? 'bg-purple-600/35 scale-125'
              : mood === 'thinking'
              ? 'bg-cyan-500/30 scale-110 animate-pulse'
              : 'bg-gradient-to-r from-purple-500/25 to-cyan-500/25 scale-110'
          }`}
        />

        {/* SVG Graphic */}
        <svg
          viewBox="0 0 120 130"
          className={`w-full h-full overflow-visible transition-transform duration-500 ${
            isWaving ? 'animate-bounce' : 'animate-float'
          }`}
        >
          <defs>
            {/* Body gradient */}
            <linearGradient id="ghostBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
              <stop offset="60%" stopColor="#f3e8ff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.88" />
            </linearGradient>

            {/* Glowing Halo Gradient */}
            <linearGradient id="haloGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            {/* Soft Shadow */}
            <radialGradient id="ghostShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Halo Ring */}
          <ellipse
            cx="60"
            cy="15"
            rx="24"
            ry="6"
            fill="none"
            stroke="url(#haloGrad)"
            strokeWidth="3.5"
            strokeDasharray="4 2"
            className="animate-spin"
            style={{ transformOrigin: '60px 15px', animationDuration: '8s' }}
            opacity="0.85"
          />

          {/* Ghost Body */}
          <path
            d="M 60 22 
               C 38 22, 24 38, 24 64 
               C 24 86, 24 106, 25 110 
               C 32 102, 40 110, 48 103 
               C 55 111, 63 104, 71 110 
               C 78 103, 86 111, 95 104 
               C 96 100, 96 86, 96 64 
               C 96 38, 82 22, 60 22 Z"
            fill="url(#ghostBodyGrad)"
            filter="drop-shadow(0 8px 16px rgba(139, 92, 246, 0.35))"
          />

          {/* Left Hand / Arm */}
          <path
            d={isWaving ? "M 25 62 Q 8 45, 14 36 Q 22 46, 26 56 Z" : "M 24 65 Q 12 72, 18 80 Q 25 76, 26 68 Z"}
            fill="#ffffff"
            className="transition-all duration-300"
          />

          {/* Right Hand / Arm */}
          <path
            d="M 96 65 Q 108 72, 102 80 Q 95 76, 94 68 Z"
            fill="#f5f3ff"
          />

          {/* Eyes */}
          {mood === 'thinking' ? (
            // Thinking upward eyes
            <g>
              <ellipse cx="48" cy="52" rx="5" ry="6" fill="#1e1b4b" />
              <ellipse cx="72" cy="52" rx="5" ry="6" fill="#1e1b4b" />
              <circle cx="49" cy="49" r="2.2" fill="#38bdf8" />
              <circle cx="73" cy="49" r="2.2" fill="#38bdf8" />
            </g>
          ) : mood === 'academic' ? (
            // Academic Glasses
            <g>
              <circle cx="46" cy="56" r="10" fill="none" stroke="#6d28d9" strokeWidth="2.5" />
              <circle cx="74" cy="56" r="10" fill="none" stroke="#6d28d9" strokeWidth="2.5" />
              <line x1="56" y1="56" x2="64" y2="56" stroke="#6d28d9" strokeWidth="2.5" />
              <circle cx="46" cy="56" r="4" fill="#0f172a" />
              <circle cx="74" cy="56" r="4" fill="#0f172a" />
              <circle cx="48" cy="54" r="1.5" fill="#ffffff" />
              <circle cx="76" cy="54" r="1.5" fill="#ffffff" />
            </g>
          ) : mood === 'spooky' ? (
            // Spooky glowing eyes
            <g>
              <ellipse cx="48" cy="56" rx="6" ry="7" fill="#4c1d95" />
              <ellipse cx="72" cy="56" rx="6" ry="7" fill="#4c1d95" />
              <ellipse cx="48" cy="56" rx="3.5" ry="4.5" fill="#a855f7" />
              <ellipse cx="72" cy="56" rx="3.5" ry="4.5" fill="#a855f7" />
              <circle cx="49" cy="54" r="1.2" fill="#ffffff" />
              <circle cx="73" cy="54" r="1.2" fill="#ffffff" />
            </g>
          ) : (
            // Standard Friendly Cute Eyes
            <g>
              <ellipse cx="48" cy="55" rx="5.5" ry="6.5" fill="#0f172a" />
              <ellipse cx="72" cy="55" rx="5.5" ry="6.5" fill="#0f172a" />
              {/* Eye sparkle highlights */}
              <circle cx="50" cy="53" r="2.2" fill="#ffffff" />
              <circle cx="74" cy="53" r="2.2" fill="#ffffff" />
              <circle cx="46" cy="57" r="1" fill="#ffffff" />
              <circle cx="70" cy="57" r="1" fill="#ffffff" />
            </g>
          )}

          {/* Rosy Cheeks */}
          <ellipse cx="38" cy="65" rx="5" ry="3" fill="#f43f5e" opacity="0.45" />
          <ellipse cx="82" cy="65" rx="5" ry="3" fill="#f43f5e" opacity="0.45" />

          {/* Mouth */}
          {mood === 'thinking' ? (
            <ellipse cx="60" cy="68" rx="3" ry="3" fill="#4338ca" />
          ) : mood === 'spooky' ? (
            <path d="M 52 67 Q 60 76, 68 67 Z" fill="#2e1065" />
          ) : (
            <path
              d={isHovered ? "M 52 66 Q 60 77, 68 66 Z" : "M 53 66 Q 60 73, 67 66"}
              fill={isHovered ? "#4338ca" : "none"}
              stroke="#4338ca"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Special Mood Props */}
          {mood === 'academic' && (
            // Tiny Graduation Cap
            <g transform="translate(42, 6) rotate(-8)">
              <polygon points="18,0 36,7 18,14 0,7" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1" />
              <rect x="10" y="8" width="16" height="5" rx="2" fill="#1e1b4b" />
              <line x1="18" y1="7" x2="33" y2="15" stroke="#f59e0b" strokeWidth="1.5" />
              <circle cx="33" cy="16" r="1.5" fill="#f59e0b" />
            </g>
          )}

          {/* Orbiting particles for thinking */}
          {mood === 'thinking' && (
            <g className="animate-spin" style={{ transformOrigin: '60px 60px', animationDuration: '4s' }}>
              <circle cx="20" cy="60" r="2.5" fill="#06b6d4" opacity="0.8" />
              <circle cx="100" cy="60" r="2.5" fill="#a855f7" opacity="0.8" />
            </g>
          )}
        </svg>

        {/* Ambient base shadow under ghost */}
        <div
          className="mx-auto rounded-full blur-[3px] bg-purple-900/40 animate-pulse transition-all duration-300"
          style={{
            width: dim.width * 0.65,
            height: 8,
            marginTop: -6
          }}
        />
      </div>
    </div>
  );
}
