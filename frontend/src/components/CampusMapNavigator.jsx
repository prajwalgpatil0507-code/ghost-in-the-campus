import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Navigation,
  Accessibility,
  Clock,
  ArrowRight,
  Layers,
  Building,
  Info,
  CheckCircle,
  Footprints,
  Sparkles
} from 'lucide-react';
import { playMessagePop, playGhostChime } from '../utils/audio';

export default function CampusMapNavigator({
  highlightedRoomCode,
  onAskGhostAbout
}) {
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState('Ground Floor');
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Route finder state
  const [routeOrigin, setRouteOrigin] = useState('Main Gate (Security Post A)');
  const [routeDest, setRouteDest] = useState('ST-101');
  const [accessibleMode, setAccessibleMode] = useState(false);
  const [routeResult, setRouteResult] = useState(null);
  const [isRouting, setIsRouting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [bldgRes, roomsRes] = await Promise.all([
          fetch('/api/campus/buildings').then((r) => r.json()),
          fetch('/api/campus/rooms').then((r) => r.json())
        ]);
        setBuildings(bldgRes || []);
        setRooms(roomsRes || []);

        // If a room was passed from Chat or Directory, auto-select it
        if (highlightedRoomCode) {
          const match = (roomsRes || []).find(
            (r) => r.code.toLowerCase() === highlightedRoomCode.toLowerCase()
          );
          if (match) {
            setSelectedRoom(match);
            const parentBldg = (bldgRes || []).find((b) => b.id === match.building_id);
            if (parentBldg) setSelectedBuilding(parentBldg);
            setSelectedFloor(match.floor);
            setRouteDest(match.code);
          }
        } else if (bldgRes && bldgRes.length > 0) {
          setSelectedBuilding(bldgRes[0]);
        }
      } catch (err) {
        console.error('Failed to load map data:', err);
      }
    }
    loadData();
  }, [highlightedRoomCode]);

  const handleSelectBuilding = (bldg) => {
    playMessagePop();
    setSelectedBuilding(bldg);
    // Find rooms in this building
    const bldgRooms = rooms.filter((r) => r.building_id === bldg.id);
    if (bldgRooms.length > 0) {
      setSelectedRoom(bldgRooms[0]);
      setSelectedFloor(bldgRooms[0].floor);
    }
  };

  const handleSelectRoom = (room) => {
    playGhostChime();
    setSelectedRoom(room);
    setRouteDest(room.code);
    setSelectedFloor(room.floor);
    const parentBldg = buildings.find((b) => b.id === room.building_id);
    if (parentBldg) setSelectedBuilding(parentBldg);
  };

  const calculateRoute = async () => {
    setIsRouting(true);
    playMessagePop();
    try {
      const res = await fetch('/api/campus/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: routeOrigin,
          destination: routeDest,
          accessibility_mode: accessibleMode
        })
      });
      const data = await res.json();
      setRouteResult(data);
      playGhostChime();
    } catch (err) {
      console.error('Route error:', err);
    } finally {
      setIsRouting(false);
    }
  };

  const floors = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'];

  // Current building rooms filtered by floor
  const activeRooms = rooms.filter(
    (r) =>
      selectedBuilding &&
      r.building_id === selectedBuilding.id &&
      r.floor.toLowerCase().includes(selectedFloor.toLowerCase().split(' ')[0])
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-5 animate-fadeIn">
      
      {/* Top Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-950/80 border border-purple-400/40 text-purple-300">
              Interactive Blueprint
            </span>
            <span className="text-xs text-cyan-300 font-mono">
              Live Campus Map & Wayfinding
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Campus Navigator & Building Map
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Explore 2D architectural building blocks, select floors, inspect room capacities and amenities, or calculate walking directions.
          </p>
        </div>

        {/* Floor Switcher */}
        <div className="flex items-center gap-1 bg-navy-900/90 p-1.5 rounded-2xl border border-white/10 shadow-inner">
          {floors.map((fl) => {
            const active = selectedFloor.toLowerCase().includes(fl.toLowerCase().split(' ')[0]);
            return (
              <button
                key={fl}
                onClick={() => {
                  setSelectedFloor(fl);
                  playMessagePop();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {fl.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Map & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Visual 2D Map (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl">
            
            {/* Map Header */}
            <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                Specter University Concourse (Top-Down View)
              </span>
              <span className="font-mono text-[11px] text-purple-300">
                Scale: 1px = 0.8m
              </span>
            </div>

            {/* SVG Interactive Canvas */}
            <div className="relative w-full aspect-[4/3] bg-navy-950/90 rounded-2xl border border-purple-500/20 overflow-hidden shadow-inner flex items-center justify-center p-2">
              
              {/* Subtle Grid Background */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #8b5cf6 1px, transparent 1px), linear-gradient(to bottom, #8b5cf6 1px, transparent 1px)',
                  backgroundSize: '32px 32px'
                }}
              />

              <svg viewBox="0 0 700 480" className="w-full h-full select-none">
                <defs>
                  {/* Glowing line gradient */}
                  <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>

                  <filter id="mapGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Campus Perimeter Boundary */}
                <rect
                  x="20"
                  y="20"
                  width="660"
                  height="440"
                  rx="18"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />

                {/* Walkway Paths */}
                {/* Main Concourse Loop */}
                <path
                  d="M 120 400 L 120 220 L 260 220 L 260 380 L 460 380 L 460 220 L 580 220 L 580 400"
                  fill="none"
                  stroke="#1e294b"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 120 220 L 220 120 L 420 120 L 460 220"
                  fill="none"
                  stroke="#1e294b"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Central Courtyard & Fountain */}
                <circle cx="340" cy="240" r="30" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="340" cy="240" r="14" fill="#083344" />
                <text x="340" y="244" fill="#38bdf8" fontSize="9" textAnchor="middle" fontWeight="bold">
                  ⛲ Plaza
                </text>

                {/* Main Campus Gate at bottom */}
                <g transform="translate(300, 430)">
                  <rect x="0" y="0" width="80" height="26" rx="6" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1.5" />
                  <text x="40" y="16" fill="#c084fc" fontSize="9" textAnchor="middle" fontWeight="bold">
                    ⛩️ MAIN GATE
                  </text>
                </g>

                {/* Buildings SVG Elements */}
                {/* 1. Science & Tech Block (ST) */}
                <g
                  onClick={() => handleSelectBuilding(buildings.find((b) => b.id === 'st-block') || { id: 'st-block', name: 'Science & Tech Block', code: 'ST' })}
                  className="cursor-pointer group"
                >
                  <rect
                    x="80"
                    y="60"
                    width="140"
                    height="110"
                    rx="12"
                    fill={selectedBuilding?.id === 'st-block' ? '#2e1065' : '#0f172a'}
                    stroke={selectedBuilding?.id === 'st-block' ? '#a855f7' : '#334155'}
                    strokeWidth={selectedBuilding?.id === 'st-block' ? '3' : '1.5'}
                    className="transition-all duration-300 group-hover:stroke-purple-400"
                  />
                  <rect x="90" y="70" width="30" height="20" rx="4" fill="#581c87" />
                  <text x="105" y="84" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">ST</text>
                  <text x="150" y="98" fill="#f1f5f9" fontSize="11" fontWeight="bold">Science & Tech</text>
                  <text x="150" y="114" fill="#94a3b8" fontSize="9">ST-101 • ST-204</text>
                  <text x="150" y="128" fill="#94a3b8" fontSize="9">ST-301 (Labs)</text>
                  <circle cx="195" cy="80" r="4" fill="#10b981" />
                </g>

                {/* 2. Alan Turing AI Center (TAI) */}
                <g
                  onClick={() => handleSelectBuilding(buildings.find((b) => b.id === 'turing-tower') || { id: 'turing-tower', name: 'Alan Turing AI Center', code: 'TAI' })}
                  className="cursor-pointer group"
                >
                  <rect
                    x="270"
                    y="50"
                    width="140"
                    height="110"
                    rx="12"
                    fill={selectedBuilding?.id === 'turing-tower' ? '#083344' : '#0f172a'}
                    stroke={selectedBuilding?.id === 'turing-tower' ? '#06b6d4' : '#334155'}
                    strokeWidth={selectedBuilding?.id === 'turing-tower' ? '3' : '1.5'}
                    className="transition-all duration-300 group-hover:stroke-cyan-400"
                  />
                  <rect x="280" y="60" width="34" height="20" rx="4" fill="#155e75" />
                  <text x="297" y="74" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">TAI</text>
                  <text x="340" y="88" fill="#f1f5f9" fontSize="11" fontWeight="bold">Turing AI Hub</text>
                  <text x="340" y="104" fill="#94a3b8" fontSize="9">TAI-102 Robotics</text>
                  <text x="340" y="118" fill="#94a3b8" fontSize="9">TAI-201 Deep Learning</text>
                  <circle cx="390" cy="70" r="4" fill="#06b6d4" />
                </g>

                {/* 3. Apex Sports Arena (SGA) */}
                <g
                  onClick={() => handleSelectBuilding(buildings.find((b) => b.id === 'sports-arena') || { id: 'sports-arena', name: 'Sports Complex', code: 'SGA' })}
                  className="cursor-pointer group"
                >
                  <rect
                    x="470"
                    y="60"
                    width="140"
                    height="100"
                    rx="12"
                    fill={selectedBuilding?.id === 'sports-arena' ? '#1e1b4b' : '#0f172a'}
                    stroke={selectedBuilding?.id === 'sports-arena' ? '#8b5cf6' : '#334155'}
                    strokeWidth={selectedBuilding?.id === 'sports-arena' ? '3' : '1.5'}
                    className="transition-all duration-300 group-hover:stroke-purple-400"
                  />
                  <rect x="480" y="70" width="34" height="20" rx="4" fill="#3730a3" />
                  <text x="497" y="84" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">SGA</text>
                  <text x="540" y="98" fill="#f1f5f9" fontSize="11" fontWeight="bold">Sports Complex</text>
                  <text x="540" y="114" fill="#94a3b8" fontSize="9">Gym • Courts</text>
                </g>

                {/* 4. Administrative Quad (ADM) */}
                <g
                  onClick={() => handleSelectBuilding(buildings.find((b) => b.id === 'admin-quad') || { id: 'admin-quad', name: 'Admin Quad', code: 'ADM' })}
                  className="cursor-pointer group"
                >
                  <rect
                    x="70"
                    y="250"
                    width="130"
                    height="110"
                    rx="12"
                    fill={selectedBuilding?.id === 'admin-quad' ? '#1e1b4b' : '#0f172a'}
                    stroke={selectedBuilding?.id === 'admin-quad' ? '#8b5cf6' : '#334155'}
                    strokeWidth={selectedBuilding?.id === 'admin-quad' ? '3' : '1.5'}
                    className="transition-all duration-300 group-hover:stroke-purple-400"
                  />
                  <rect x="80" y="260" width="36" height="20" rx="4" fill="#4338ca" />
                  <text x="98" y="274" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">ADM</text>
                  <text x="135" y="288" fill="#f1f5f9" fontSize="11" fontWeight="bold">Admin Quad</text>
                  <text x="135" y="304" fill="#94a3b8" fontSize="9">ADM-101 Registrar</text>
                  <text x="135" y="318" fill="#94a3b8" fontSize="9">ADM-014 Health</text>
                </g>

                {/* 5. Central Library (LIB) */}
                <g
                  onClick={() => handleSelectBuilding(buildings.find((b) => b.id === 'central-lib') || { id: 'central-lib', name: 'Central Library', code: 'LIB' })}
                  className="cursor-pointer group"
                >
                  <rect
                    x="230"
                    y="290"
                    width="140"
                    height="110"
                    rx="12"
                    fill={selectedBuilding?.id === 'central-lib' ? '#083344' : '#0f172a'}
                    stroke={selectedBuilding?.id === 'central-lib' ? '#06b6d4' : '#334155'}
                    strokeWidth={selectedBuilding?.id === 'central-lib' ? '3' : '1.5'}
                    className="transition-all duration-300 group-hover:stroke-cyan-400"
                  />
                  <rect x="240" y="300" width="34" height="20" rx="4" fill="#0e7490" />
                  <text x="257" y="314" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">LIB</text>
                  <text x="300" y="328" fill="#f1f5f9" fontSize="11" fontWeight="bold">Ada Lovelace Lib</text>
                  <text x="300" y="344" fill="#94a3b8" fontSize="9">LIB-105 Study</text>
                  <text x="300" y="358" fill="#94a3b8" fontSize="9">LIB-201 Archives</text>
                </g>

                {/* 6. Student Center (SC) */}
                <g
                  onClick={() => handleSelectBuilding(buildings.find((b) => b.id === 'student-center') || { id: 'student-center', name: 'Ghost Commons', code: 'SC' })}
                  className="cursor-pointer group"
                >
                  <rect
                    x="410"
                    y="280"
                    width="140"
                    height="110"
                    rx="12"
                    fill={selectedBuilding?.id === 'student-center' ? '#2e1065' : '#0f172a'}
                    stroke={selectedBuilding?.id === 'student-center' ? '#a855f7' : '#334155'}
                    strokeWidth={selectedBuilding?.id === 'student-center' ? '3' : '1.5'}
                    className="transition-all duration-300 group-hover:stroke-purple-400"
                  />
                  <rect x="420" y="290" width="30" height="20" rx="4" fill="#6b21a8" />
                  <text x="435" y="304" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">SC</text>
                  <text x="475" y="318" fill="#f1f5f9" fontSize="11" fontWeight="bold">Ghost Commons</text>
                  <text x="475" y="334" fill="#94a3b8" fontSize="9">SC-102 Cafe</text>
                  <text x="475" y="348" fill="#94a3b8" fontSize="9">Food Court</text>
                </g>

                {/* Dynamic Route Waypoints Line if route calculated */}
                {routeResult && (
                  <g filter="url(#mapGlow)">
                    <path
                      d="M 340 430 L 340 380 L 260 380 L 260 220 L 150 170"
                      fill="none"
                      stroke="url(#routeGrad)"
                      strokeWidth="5"
                      strokeDasharray="8 4"
                      className="animate-pulse"
                    />
                    <circle cx="340" cy="430" r="6" fill="#06b6d4" />
                    <circle cx="150" cy="170" r="7" fill="#a855f7" />
                  </g>
                )}
              </svg>

              {/* Map Floating Legend */}
              <div className="absolute bottom-3 left-3 bg-navy-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-3 text-[10px] text-slate-300">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span> Academic
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span> Research & Lib
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span> Open
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 text-center">
              💡 Tip: Click any campus building above to inspect its floor plans and verified laboratories.
            </p>
          </div>

          {/* Building Inspector */}
          {selectedBuilding && (
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/30 text-purple-300">
                    {selectedBuilding.code}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {selectedBuilding.name}
                  </h3>
                </div>
                <span className="text-xs text-cyan-300 font-mono">
                  {selectedBuilding.floors} Floors Total
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedBuilding.description}
              </p>

              {/* Amenities */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(selectedBuilding.amenities || []).map((amen, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2.5 py-0.5 rounded-lg bg-navy-900/90 text-slate-300 border border-white/5"
                  >
                    ✓ {amen}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Route Finder & Room Details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Wayfinder Route Planner */}
          <div className="glass-panel-glow p-5 rounded-3xl border-purple-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Campus Wayfinder Navigator
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                Turn-by-turn
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Origin */}
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Starting Point (From):</label>
                <select
                  value={routeOrigin}
                  onChange={(e) => setRouteOrigin(e.target.value)}
                  className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="Main Gate (Security Post A)">⛩️ Main Gate (Security Post A)</option>
                  <option value="Ada Lovelace Central Library">📚 Ada Lovelace Central Library</option>
                  <option value="Ghost Commons Food Court">☕ Ghost Commons Food Court</option>
                  <option value="Admin Quadrangle (ADM-101)">🏛️ Admin Quadrangle (ADM-101)</option>
                  <option value="Science & Tech Ground Floor">🔬 Science & Tech Ground Floor</option>
                </select>
              </div>

              {/* Destination */}
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Target Destination (To):</label>
                <select
                  value={routeDest}
                  onChange={(e) => setRouteDest(e.target.value)}
                  className="w-full bg-navy-900 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-400"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.code}>
                      {r.code}: {r.name} ({r.floor})
                    </option>
                  ))}
                </select>
              </div>

              {/* Accessibility Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-navy-900/60 border border-white/5">
                <div className="flex items-center gap-2">
                  <Accessibility className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300">ADA Accessible Route (Elevator & Ramps only)</span>
                </div>
                <input
                  type="checkbox"
                  checked={accessibleMode}
                  onChange={(e) => setAccessibleMode(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4 bg-navy-950 border-white/20"
                />
              </div>

              {/* Route Action Button */}
              <button
                onClick={calculateRoute}
                disabled={isRouting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                <Footprints className="w-4 h-4" />
                <span>{isRouting ? 'Computing shortest path...' : 'Calculate Walking Route'}</span>
              </button>
            </div>

            {/* Route Results Box */}
            {routeResult && (
              <div className="mt-3 pt-3 border-t border-white/10 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between bg-navy-950/80 p-3 rounded-xl border border-purple-500/20">
                  <div className="flex items-center gap-2 text-cyan-300">
                    <Clock className="w-4 h-4" />
                    <span className="font-bold text-sm">
                      {routeResult.estimated_walking_minutes} min walk
                    </span>
                  </div>
                  <span className="text-slate-400 text-xs font-mono">
                    ~{routeResult.total_distance_meters} meters
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {routeResult.steps.map((st) => (
                    <div
                      key={st.step}
                      className="flex items-start gap-2.5 bg-navy-900/70 p-2.5 rounded-xl border border-white/5"
                    >
                      <span className="w-5 h-5 rounded-full bg-purple-900/80 text-purple-300 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {st.step}
                      </span>
                      <div className="flex-1">
                        <p className="text-slate-200">{st.instruction}</p>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {st.distance_meters}m
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected Room Details Card */}
          {selectedRoom ? (
            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300">
                  {selectedRoom.code}
                </span>
                <span className="text-xs text-slate-400">
                  Capacity: {selectedRoom.capacity} seats
                </span>
              </div>

              <h4 className="text-base font-bold text-white">
                {selectedRoom.name}
              </h4>

              <div className="text-xs text-slate-300 space-y-1">
                <p>
                  <strong>Building:</strong> {selectedRoom.building_name}
                </p>
                <p>
                  <strong>Floor:</strong> {selectedRoom.floor}
                </p>
                <p>
                  <strong>Type:</strong> {selectedRoom.type}
                </p>
              </div>

              {selectedRoom.accessibility && (
                <div className="bg-navy-950/70 p-2 rounded-xl border border-white/5 text-[11px] text-cyan-300 flex items-start gap-1.5">
                  <Accessibility className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{selectedRoom.accessibility}</span>
                </div>
              )}

              <button
                onClick={() => onAskGhostAbout(`Where is ${selectedRoom.code} (${selectedRoom.name}) and what are its features?`)}
                className="w-full py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Ask Casperion about this Room</span>
              </button>
            </div>
          ) : (
            <div className="glass-panel p-5 rounded-3xl border border-white/10 text-center text-xs text-slate-400">
              Select a room from the building inspector to see details.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
