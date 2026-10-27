import React from 'react';
import { ShieldCheck, Heart, Terminal, Cpu, Database } from 'lucide-react';
import GhostMascot from './GhostMascot';

export default function Footer({ campusMeta }) {
  return (
    <footer className="mt-12 border-t border-white/10 glass-panel py-8 px-4 sm:px-6 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Mascot */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-950/60 p-0.5 border border-purple-500/30 flex items-center justify-center">
            <GhostMascot size="xs" mood="friendly" interactive={false} />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white tracking-tight">
              Ghost in the Campus
            </span>
            <p className="text-[11px] text-slate-500">
              {campusMeta?.campus_name || "Specter University"} • Hackathon Showcase Prototype
            </p>
          </div>
        </div>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-navy-900 border border-white/5 text-[11px] text-slate-300">
            <Cpu className="w-3 h-3 text-cyan-400" /> React 18 + Vite
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-navy-900 border border-white/5 text-[11px] text-slate-300">
            <Terminal className="w-3 h-3 text-purple-400" /> Python FastAPI
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-navy-900 border border-white/5 text-[11px] text-slate-300">
            <Cpu className="w-3 h-3 text-emerald-400" /> Ollama gemma4:e2b
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-navy-900 border border-white/5 text-[11px] text-slate-300">
            <Database className="w-3 h-3 text-amber-400" /> Grounded RAG JSON
          </span>
        </div>

        {/* Disclaimer Note */}
        <div className="text-center md:text-right text-[11px] text-slate-500">
          <p className="flex items-center justify-center md:justify-end gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Zero-Hallucination Guardrails
          </p>
          <p className="text-[10px] mt-0.5">
            Emergency Desk: {campusMeta?.emergency_helpline || "+1 (555) 019-4467"}
          </p>
        </div>

      </div>
    </footer>
  );
}
