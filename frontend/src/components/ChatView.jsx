import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  Volume2,
  Mic,
  MicOff,
  Trash2,
  MapPin,
  ShieldCheck,
  Compass,
  ArrowRight,
  Database,
  ExternalLink,
  Info
} from 'lucide-react';
import GhostMascot from './GhostMascot';
import { playMessagePop, playGhostChime, playGhostBoo, speakText, stopSpeaking } from '../utils/audio';

export default function ChatView({
  systemStatus,
  ghostMood,
  setGhostMood,
  onNavigateToRoom,
  campusMeta
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        "👻 **Spectral greetings!** I am **Casperion**, your AI campus mascot at Specter University.\n\n" +
        "I'm grounded directly to our verified campus directory. Ask me anything about:\n" +
        "- 🏢 **Classrooms & Labs** (e.g. *Where is ST-101 or the Turing AI Lab?*)\n" +
        "- 📅 **Course Timetables** (e.g. *When is CS-302 on Friday?*)\n" +
        "- 📜 **Campus Rules** (e.g. *What is the mandatory attendance requirement?*)\n" +
        "- ☕ **Dining & Amenities** (e.g. *Ghost Brew cafe menu & hours*)\n\n" +
        "*Notice: All answers are strictly grounded to our verified demo database to prevent hallucination.*",
      sources: [
        {
          category: 'Knowledge Base',
          title: 'Specter University Directory v1.0',
          content: 'Strictly bounded campus records covering buildings, departments, rules, and schedules.'
        }
      ],
      mode: 'ollama-live',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const samplePrompts = [
    { label: 'Where is Turing Lab?', query: 'Where is the Turing Robotics Lab and what floor is it on?' },
    { label: 'CS-302 Friday Schedule', query: 'When and where is CS-302 Distributed Operating Systems held?' },
    { label: 'Attendance Rule', query: 'What is the mandatory attendance percentage to take exams?' },
    { label: 'Library Fines & Quiet Rules', query: 'What are the rules and late fines for the Ada Lovelace Central Library?' },
    { label: 'Campus WiFi Setup', query: 'How do I connect my laptop or phone to the campus WiFi?' },
    { label: 'Ghost Brew Cafe Hours', query: 'Where is Ghost Brew Cafe and what are its opening hours?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = false;
      recognizer.lang = 'en-US';

      recognizer.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognizer.onerror = () => {
        setIsListening(false);
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognizer;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSend = async (queryText = input) => {
    const textToSend = queryText.trim();
    if (!textToSend || isLoading) return;

    playMessagePop();
    setInput('');

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setGhostMood('thinking');

    try {
      const payloadHistory = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: payloadHistory,
          temperature: 0.15
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      playGhostChime();

      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        sources: data.sources || [],
        mode: data.mode,
        model: data.model,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      setGhostMood('friendly');
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          "👻 *Spectral static:* I had trouble communicating with the backend server. " +
          "Please verify that the FastAPI backend is running on `http://localhost:8000` and Ollama is active on `http://localhost:11434`.",
        sources: [],
        mode: 'error',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setGhostMood('friendly');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id, text) => {
    if (speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      setSpeakingId(id);
      speakText(text, () => setSpeakingId(null));
    }
  };

  const clearChat = () => {
    if (window.confirm("Clear spectral conversation history?")) {
      setMessages([]);
      playGhostBoo();
    }
  };

  // Helper to extract room codes like ST-101, TAI-102
  const extractRoomCode = (text) => {
    const match = text.match(/\b(ST-\d+|TAI-\d+|LIB-\d+|ADM-\d+|SC-\d+)\b/i);
    return match ? match[0].toUpperCase() : null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-6xl mx-auto px-2 sm:px-4 py-2">
      
      {/* Top Chat Info Card */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 mb-3 border border-white/10 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <GhostMascot size="sm" mood={isLoading ? 'thinking' : ghostMood} interactive={true} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                Casperion the Spectral Guide
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 font-mono">
                gemma4:e2b
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Grounded AI campus knowledge. No invented locations or schedules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={clearChat}
            className="p-2 rounded-xl bg-navy-900/80 hover:bg-red-950/40 border border-white/5 hover:border-red-500/30 text-slate-400 hover:text-red-300 transition-all text-xs flex items-center gap-1"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
        <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 whitespace-nowrap pl-1 pr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          Quick Ask:
        </span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.query)}
            disabled={isLoading}
            className="whitespace-nowrap px-3 py-1 rounded-full text-xs bg-navy-900/90 hover:bg-purple-900/40 text-slate-300 hover:text-white border border-white/10 hover:border-purple-400/40 transition-all shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Message Feed Container */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 space-y-4 rounded-2xl glass-panel border border-white/5 shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const roomCode = !isUser ? extractRoomCode(msg.content) : null;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0 pt-0.5">
                {isUser ? (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
                    <User className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-navy-900 border border-purple-500/30 flex items-center justify-center p-0.5 shadow-md shadow-cyan-950/50">
                    <GhostMascot size="xs" mood={ghostMood} interactive={false} />
                  </div>
                )}
              </div>

              {/* Message Bubble Body */}
              <div className="space-y-2 max-w-full">
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-lg relative ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-700/80 to-indigo-700/80 text-white rounded-tr-none border border-purple-400/30'
                      : 'bg-navy-900/90 text-slate-200 rounded-tl-none border border-white/10'
                  }`}
                >
                  {/* Markdown formatted content */}
                  <div className="whitespace-pre-wrap break-words space-y-2">
                    {msg.content}
                  </div>

                  {/* Sources & Citations if present */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-purple-300">
                        <span className="flex items-center gap-1">
                          <Database className="w-3 h-3 text-cyan-400" />
                          Verified Sources ({msg.sources.length}):
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          Grounding: Demo KB
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {msg.sources.slice(0, 3).map((src, sIdx) => (
                          <div
                            key={sIdx}
                            className="bg-navy-950/80 p-2 rounded-lg border border-purple-500/20 text-[11px] text-slate-300 hover:border-cyan-400/30 transition-colors"
                          >
                            <span className="font-semibold text-purple-200 block truncate">
                              {src.title}
                            </span>
                            <span className="text-slate-400 line-clamp-1 text-[10px]">
                              {src.content}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Bar for Bot Message */}
                  {!isUser && (
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="flex items-center gap-1 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors"
                          title="Copy answer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleSpeak(msg.id, msg.content)}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                            speakingId === msg.id
                              ? 'text-purple-300 bg-purple-900/40 font-semibold'
                              : 'hover:text-white hover:bg-white/5'
                          }`}
                          title={speakingId === msg.id ? "Stop voice" : "Read aloud"}
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{speakingId === msg.id ? 'Speaking...' : 'Listen'}</span>
                        </button>
                      </div>

                      {/* Room Code Shortcut to Map */}
                      {roomCode && (
                        <button
                          onClick={() => onNavigateToRoom(roomCode)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-900/50 hover:text-white transition-all font-mono font-medium text-[10px]"
                        >
                          <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                          <span>Locate {roomCode} on Map</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}

                      <span className="text-[10px] text-slate-500 font-mono ml-auto">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Ghost Indicator */}
        {isLoading && (
          <div className="flex gap-3 mr-auto items-center animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-navy-900 border border-purple-500/30 flex items-center justify-center p-0.5">
              <GhostMascot size="xs" mood="thinking" interactive={false} />
            </div>
            <div className="glass-panel px-4 py-3 rounded-2xl rounded-tl-none border border-purple-500/30 text-xs text-purple-200 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-slate-300">
                Casperion is consulting the campus archives via Gemma 4...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="mt-2 sm:mt-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center gap-2 glass-panel p-2 rounded-2xl border border-white/10 shadow-2xl focus-within:border-purple-400/60 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all"
        >
          {/* Voice input button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl border transition-all ${
              isListening
                ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
                : 'bg-navy-900 hover:bg-navy-800 border-white/5 text-slate-400 hover:text-white'
            }`}
            title={isListening ? "Listening... click to stop" : "Click to speak query"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? "Listening to your voice..."
                : "Ask about rooms, labs, timetables, rules, dining, or campus FAQs..."
            }
            disabled={isLoading}
            className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-500 text-xs sm:text-sm px-2 focus:outline-none focus:ring-0"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-3 pt-1.5">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            Bounded RAG Grounding: Never invents rooms or timetables.
          </span>
          <span className="hidden sm:inline">Press Enter to send</span>
        </div>
      </div>
    </div>
  );
}
