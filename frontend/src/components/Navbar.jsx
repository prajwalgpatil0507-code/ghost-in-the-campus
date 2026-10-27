import React, { useState } from 'react';
import {
  MessageSquare,
  Compass,
  MapPin,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  Server,
  Menu,
  X,
  Glasses,
  Flame,
  Smile,
  BrainCircuit,
  User as UserIcon,
  LogOut,
  GraduationCap
} from 'lucide-react';
import GhostMascot from './GhostMascot';
import { setSoundEnabled, isSoundEnabled, playGhostChime } from '../utils/audio';

export default function Navbar({
  activeTab,
  setActiveTab,
  systemStatus,
  ghostMood,
  setGhostMood,
  currentUser,
  onLogout
}) {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moodDropdown, setMoodDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playGhostChime();
  };

  const navItems = [
    { id: 'chat', label: 'AI Campus Chat', icon: MessageSquare, badge: 'Gemma 4' },
    { id: 'directory', label: 'Campus Directory', icon: Compass },
    { id: 'map', label: 'Map & Navigator', icon: MapPin },
    { id: 'rules', label: 'Rules & Timetables', icon: BookOpen },
  ];

  const moods = [
    { id: 'friendly', label: 'Friendly Mascot', icon: Smile, color: 'text-purple-400' },
    { id: 'academic', label: 'Professor Ghost', icon: Glasses, color: 'text-blue-400' },
    { id: 'spooky', label: 'Spectral Mystery', icon: Flame, color: 'text-pink-400' },
    { id: 'thinking', label: 'Deep Inquirer', icon: BrainCircuit, color: 'text-cyan-400' },
  ];

  const isOllamaOnline = systemStatus?.ollama?.status === 'online';

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-2.5 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div
          onClick={() => setActiveTab('chat')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/30 via-indigo-900/40 to-cyan-500/20 p-1 flex items-center justify-center border border-purple-500/30 group-hover:border-cyan-400/50 transition-all shadow-lg shadow-purple-950/50">
            <GhostMascot size="xs" mood={ghostMood} interactive={false} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-300 via-cyan-200 to-white bg-clip-text text-transparent group-hover:from-purple-200 group-hover:to-cyan-300 transition-all">
                Ghost in the Campus
              </span>
              <span className="hidden lg:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-cyan-950/80 border border-cyan-400/30 text-cyan-300">
                Specter AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Interactive Campus Mascot & Directory Assistant
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 bg-navy-900/80 p-1.5 rounded-2xl border border-white/5 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); playGhostChime(); }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
                  active
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25 border border-purple-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-cyan-200' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    active ? 'bg-black/30 text-cyan-200' : 'bg-purple-900/50 text-purple-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Utility Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Status Pill */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all ${
              isOllamaOnline
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 shadow-sm shadow-emerald-500/10'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-300 shadow-sm shadow-amber-500/10'
            }`}
            title={
              isOllamaOnline
                ? `Ollama Live: gemma4:e2b connected on localhost:11434`
                : `Ollama unavailable: running on verified Grounded RAG knowledge base`
            }
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isOllamaOnline ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isOllamaOnline ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </span>
            <span className="font-semibold">
              {isOllamaOnline ? 'Gemma 4 Live' : 'RAG Standalone'}
            </span>
          </div>

          {/* Ghost Mood Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMoodDropdown(!moodDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-navy-900/90 hover:bg-navy-800 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-all"
              title="Change Ghost Mascot Mood"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="capitalize hidden lg:inline">{ghostMood}</span>
            </button>

            {moodDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-panel-glow border-purple-500/30 py-2 shadow-2xl z-50 animate-fadeIn">
                <div className="px-3 py-1 text-[11px] uppercase tracking-wider font-bold text-slate-400 border-b border-white/10 mb-1">
                  Mascot Moods
                </div>
                {moods.map((m) => {
                  const MIcon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setGhostMood(m.id);
                        setMoodDropdown(false);
                        playGhostChime();
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 text-xs hover:bg-purple-900/30 transition-colors ${
                        ghostMood === m.id ? 'bg-purple-950/60 text-white font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <MIcon className={`w-4 h-4 ${m.color}`} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all ${
              soundOn
                ? 'bg-purple-950/50 border-purple-500/40 text-purple-300 hover:bg-purple-900/50'
                : 'bg-navy-900 border-white/10 text-slate-500 hover:text-slate-300'
            }`}
            title={soundOn ? 'Sound effects enabled' : 'Sound effects muted'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* User Profile Pill */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-navy-900/90 hover:bg-navy-800 border border-purple-500/30 hover:border-cyan-400/50 text-xs text-white transition-all shadow-sm group"
                title="Account options"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center font-bold text-[11px] text-white shadow-sm">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden lg:block leading-tight">
                  <span className="font-semibold block max-w-[110px] truncate text-slate-200 group-hover:text-white">
                    {currentUser.name}
                  </span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-950/80 border border-purple-500/30 text-purple-300 hidden md:inline font-mono">
                  {currentUser.role || 'Student'}
                </span>
              </button>

              {userDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel-glow border-purple-500/40 p-3 shadow-2xl z-50 animate-fadeIn">
                  <div className="border-b border-white/10 pb-2 mb-2">
                    <p className="font-bold text-xs text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    {currentUser.student_id && (
                      <span className="inline-block mt-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-navy-950 border border-white/5 text-cyan-300">
                        ID: {currentUser.student_id}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdown(false);
                      onLogout();
                      playGhostChime();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-red-300 hover:bg-red-950/50 hover:text-red-200 transition-colors flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>Sign Out / Switch</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-navy-900 border border-white/10 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 glass-panel border-t border-white/10 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                  playGhostChime();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-cyan-300" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-purple-900/60 text-purple-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {currentUser && (
            <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400">{currentUser.email}</p>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                  playGhostChime();
                }}
                className="px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-500/30 text-xs font-semibold text-red-300"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
