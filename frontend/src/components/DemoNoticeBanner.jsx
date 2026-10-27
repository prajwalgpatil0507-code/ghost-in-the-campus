import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, Sparkles, Database } from 'lucide-react';

export default function DemoNoticeBanner({ campusMeta }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-cyan-950/70 border-b border-purple-500/20 px-4 py-2 text-xs sm:text-sm text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Hackathon Demo Data
          </span>
          <span className="hidden sm:inline text-slate-300">
            Strictly Grounded to <strong>{campusMeta?.campus_name || "Specter University"}</strong> knowledge base.
          </span>
          <span className="inline-flex items-center text-cyan-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Hallucination Guardrails Active
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-xs font-medium ml-auto"
        >
          <span>{expanded ? 'Hide Details' : 'Verify Guardrails'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400 animate-fadeIn">
          <div className="bg-navy-900/60 p-2.5 rounded-lg border border-white/5">
            <span className="text-purple-300 font-semibold block mb-0.5 flex items-center gap-1">
              <Database className="w-3 h-3" /> Structured Knowledge Base
            </span>
            All departments, timetables, room numbers, and amenities are loaded from a verified JSON database.
          </div>
          <div className="bg-navy-900/60 p-2.5 rounded-lg border border-white/5">
            <span className="text-cyan-300 font-semibold block mb-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Zero Location Inventions
            </span>
            The AI is strictly prompted never to invent fictitious rooms, numbers, or schedules outside this dataset.
          </div>
          <div className="bg-navy-900/60 p-2.5 rounded-lg border border-white/5">
            <span className="text-amber-300 font-semibold block mb-0.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Demo Verification
            </span>
            Emergency helpline: {campusMeta?.emergency_helpline || "+1 (555) 019-4467"}. Real inquiries report to Security Post A.
          </div>
        </div>
      )}
    </div>
  );
}
