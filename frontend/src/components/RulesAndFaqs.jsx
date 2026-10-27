import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  ShieldAlert,
  Wifi,
  Home,
  Car,
  FileText,
  MessageSquare,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { playMessagePop } from '../utils/audio';

export default function RulesAndFaqs({ onAskGhostAbout }) {
  const [rules, setRules] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [activeTab, setActiveTab] = useState('rules'); // rules or timetables
  const [selectedDay, setSelectedDay] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [rulesRes, ttRes] = await Promise.all([
          fetch('/api/campus/rules').then((r) => r.json()),
          fetch('/api/campus/timetables').then((r) => r.json())
        ]);
        setRules(rulesRes || []);
        setTimetables(ttRes || []);
      } catch (err) {
        console.error('Failed to load rules/timetables:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const filteredRules = rules.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.rule_title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q) ||
      r.details.toLowerCase().includes(q)
    );
  });

  const filteredTimetables = timetables.filter((tt) => {
    if (selectedDay !== 'all') {
      const hasDay = (tt.days || []).some((d) => d.toLowerCase() === selectedDay.toLowerCase());
      if (!hasDay) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tt.course_code.toLowerCase().includes(q) ||
        tt.course_title.toLowerCase().includes(q) ||
        tt.instructor.toLowerCase().includes(q) ||
        tt.room.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-5 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-950/80 border border-purple-400/40 text-purple-300">
              Campus Regulations & Schedules
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Academic Year 2026-2027 (Demo)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Policies, Guidelines & Class Timetables
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Official guidelines for student attendance, library borrowing limits, lab safety protocols, and weekly lecture schedules.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 bg-navy-900/90 p-1.5 rounded-2xl border border-white/10 shadow-inner">
          <button
            onClick={() => { setActiveTab('rules'); playMessagePop(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'rules'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Campus Rules</span>
          </button>
          <button
            onClick={() => { setActiveTab('timetables'); playMessagePop(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'timetables'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Class Timetables</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'rules' ? "Search rules (e.g. attendance, fine, curfew)..." : "Search course code, professor, room..."}
            className="w-full bg-navy-900/90 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
          />
        </div>

        {activeTab === 'timetables' && (
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none">
            <button
              onClick={() => setSelectedDay('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                selectedDay === 'all'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-navy-900 text-slate-400 hover:text-white'
              }`}
            >
              All Days
            </button>
            {days.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap ${
                  selectedDay === d
                    ? 'bg-cyan-600 text-white shadow'
                    : 'bg-navy-900 text-slate-400 hover:text-white'
                }`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Rules Section */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRules.map((rule, idx) => (
            <div
              key={idx}
              className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300">
                  {rule.category}
                </span>

                <h3 className="font-bold text-base text-white mt-2">
                  {rule.rule_title}
                </h3>

                <p className="text-xs text-slate-300 font-medium mt-2 bg-navy-900/80 p-2.5 rounded-xl border border-white/5">
                  {rule.summary}
                </p>

                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  {rule.details}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5">
                <button
                  onClick={() => onAskGhostAbout(`Explain the campus rule: ${rule.rule_title}`)}
                  className="w-full py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask Casperion about this policy</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timetables Section */}
      {activeTab === 'timetables' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTimetables.map((tt, idx) => (
              <div
                key={idx}
                className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyan-400/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-400/40 text-cyan-300">
                      {tt.course_code}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {tt.batch}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white mt-2">
                    {tt.course_title}
                  </h3>

                  <p className="text-xs text-purple-300 mt-1">
                    Instructor: <strong>{tt.instructor}</strong>
                  </p>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-300 bg-navy-900/80 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{tt.time_slot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span>{tt.days.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Room {tt.room} ({tt.building})</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5">
                  <button
                    onClick={() => onAskGhostAbout(`When and where is ${tt.course_code} (${tt.course_title}) held?`)}
                    className="w-full py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Check with Ghost</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
