import React, { useState, useEffect } from 'react';
import {
  Search,
  Building2,
  Layers,
  Users,
  Compass,
  MapPin,
  MessageSquare,
  Sparkles,
  Accessibility,
  Check,
  Tag,
  BookOpen,
  Coffee,
  Cpu
} from 'lucide-react';
import { playMessagePop, playGhostChime } from '../utils/audio';

export default function CampusDirectory({
  onNavigateToRoom,
  onAskGhostAbout
}) {
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [roomsRes, bldgRes, deptRes, amenRes] = await Promise.all([
          fetch('/api/campus/rooms').then((r) => r.json()),
          fetch('/api/campus/buildings').then((r) => r.json()),
          fetch('/api/campus/departments').then((r) => r.json()),
          fetch('/api/campus/amenities').then((r) => r.json())
        ]);
        setRooms(roomsRes || []);
        setBuildings(bldgRes || []);
        setDepartments(deptRes || []);
        setAmenities(amenRes || []);
      } catch (err) {
        console.error('Failed to load campus directory:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = [
    { id: 'all', label: 'All Places', count: rooms.length + departments.length + amenities.length },
    { id: 'labs', label: 'Labs & Research', icon: Cpu },
    { id: 'classrooms', label: 'Lecture Halls', icon: Layers },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'amenities', label: 'Dining & Services', icon: Coffee },
  ];

  // Filter items
  const filteredRooms = rooms.filter((r) => {
    // Category check
    if (activeCategory === 'labs' && !r.type.toLowerCase().includes('lab')) return false;
    if (activeCategory === 'classrooms' && (r.type.toLowerCase().includes('lab') || r.type.toLowerCase().includes('dining'))) return false;
    if (activeCategory === 'departments' || activeCategory === 'amenities') return false;

    // Building check
    if (selectedBuilding !== 'all' && r.building_id !== selectedBuilding) return false;

    // Floor check
    if (selectedFloor !== 'all' && !r.floor.toLowerCase().includes(selectedFloor.toLowerCase())) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = r.code.toLowerCase().includes(q);
      const matchName = r.name.toLowerCase().includes(q);
      const matchBldg = r.building_name.toLowerCase().includes(q);
      const matchFeat = (r.features || []).some((f) => f.toLowerCase().includes(q));
      return matchCode || matchName || matchBldg || matchFeat;
    }

    return true;
  });

  const filteredDepartments = departments.filter((d) => {
    if (activeCategory !== 'all' && activeCategory !== 'departments') return false;
    if (selectedBuilding !== 'all') return false; // Departments are linked across buildings
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.head.toLowerCase().includes(q) ||
        d.office.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredAmenities = amenities.filter((a) => {
    if (activeCategory !== 'all' && activeCategory !== 'amenities') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.specialty.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalResults = filteredRooms.length + filteredDepartments.length + filteredAmenities.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-5 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950/80 border border-cyan-400/40 text-cyan-300">
                Official Directory
              </span>
              <span className="text-xs text-purple-300 font-mono">
                Specter Campus v1.0
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Campus Facilities & Directory
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Browse verified classrooms, computer labs, department chairs, and student amenities. 
              Click any room code to visualize its location on the interactive 2D map.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-navy-900/90 px-4 py-2.5 rounded-2xl border border-white/10 text-center">
              <span className="text-xl font-bold text-cyan-300 block">{rooms.length}</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Rooms & Labs</span>
            </div>
            <div className="bg-navy-900/90 px-4 py-2.5 rounded-2xl border border-white/10 text-center">
              <span className="text-xl font-bold text-purple-300 block">{buildings.length}</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Buildings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by room (e.g. ST-101), lab name, faculty, or feature..."
              className="w-full bg-navy-900/90 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Building Select */}
          <div className="sm:col-span-3">
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full bg-navy-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-purple-400"
            >
              <option value="all">All Buildings</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Floor Select */}
          <div className="sm:col-span-3">
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full bg-navy-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-purple-400"
            >
              <option value="all">All Floors</option>
              <option value="Ground">Ground Floor</option>
              <option value="1st">1st Floor</option>
              <option value="2nd">2nd Floor</option>
              <option value="3rd">3rd Floor</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none">
          {categories.map((c) => {
            const active = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setActiveCategory(c.id);
                  playMessagePop();
                }}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40'
                    : 'bg-navy-900/80 hover:bg-navy-800 text-slate-300 border border-white/5'
                }`}
              >
                {c.icon && <c.icon className="w-3.5 h-3.5" />}
                <span>{c.label}</span>
              </button>
            );
          })}

          <span className="ml-auto text-xs text-slate-500 font-mono whitespace-nowrap pl-2">
            Showing {totalResults} entries
          </span>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-3" />
          <p>Loading campus directory records...</p>
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-white/5 text-slate-400 space-y-2">
          <Compass className="w-10 h-10 text-purple-400 mx-auto opacity-60" />
          <h3 className="text-lg font-bold text-white">No campus records matched</h3>
          <p className="text-xs max-w-md mx-auto">
            Try adjusting your search keywords or clearing building and floor filters.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedBuilding('all'); setSelectedFloor('all'); setActiveCategory('all'); }}
            className="mt-2 px-4 py-1.5 rounded-xl bg-purple-600/30 text-purple-200 border border-purple-500/30 text-xs font-semibold hover:bg-purple-600/50"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Room Cards */}
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-purple-400/50 hover:shadow-xl hover:shadow-purple-950/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-300">
                    {room.code}
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-white/5">
                    {room.type}
                  </span>
                </div>

                <h3 className="font-bold text-base text-white group-hover:text-purple-200 transition-colors">
                  {room.name}
                </h3>

                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{room.building_name}</span>
                  <span className="text-slate-600">•</span>
                  <span>{room.floor}</span>
                </div>

                {/* Features tags */}
                {room.features && room.features.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {room.features.slice(0, 3).map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-navy-900/90 text-slate-300 border border-white/5"
                      >
                        {f}
                      </span>
                    ))}
                    {room.features.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 text-slate-400">
                        +{room.features.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Accessibility */}
                {room.accessibility && (
                  <p className="mt-2.5 text-[11px] text-slate-400 flex items-start gap-1.5 bg-navy-950/60 p-2 rounded-lg border border-white/5">
                    <Accessibility className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{room.accessibility}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  onClick={() => onNavigateToRoom(room.code)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-400/30 hover:border-cyan-400/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>Navigate</span>
                </button>

                <button
                  onClick={() => onAskGhostAbout(`Tell me full details about ${room.code} (${room.name})`)}
                  className="py-1.5 px-3 rounded-xl bg-purple-950/80 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  title="Ask Ghost assistant about this room"
                >
                  <MessageSquare className="w-3 h-3 text-purple-400" />
                  <span className="hidden sm:inline">Ask Ghost</span>
                </button>
              </div>
            </div>
          ))}

          {/* Department Cards */}
          {filteredDepartments.map((dept) => (
            <div
              key={dept.id}
              className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-indigo-400/50 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300">
                  Academic Department
                </span>
                <h3 className="font-bold text-base text-white mt-2">{dept.name}</h3>
                <p className="text-xs text-slate-300 mt-1">
                  <strong>Head:</strong> {dept.head}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  <strong>Office:</strong> {dept.office}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-mono text-[11px]">
                  {dept.email}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {dept.programs.map((p, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-navy-900 border border-white/5 text-slate-300">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5">
                <button
                  onClick={() => onAskGhostAbout(`What programs and courses are offered by the ${dept.name}?`)}
                  className="w-full py-1.5 px-3 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Ask Ghost about Department</span>
                </button>
              </div>
            </div>
          ))}

          {/* Amenity Cards */}
          {filteredAmenities.map((amen) => (
            <div
              key={amen.id}
              className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-cyan-400/50 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  Campus Service & Dining
                </span>
                <h3 className="font-bold text-base text-white mt-2">{amen.name}</h3>
                <p className="text-xs text-slate-300 mt-1">
                  <strong>Location:</strong> {amen.location}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  <strong>Hours:</strong> {amen.hours}
                </p>
                <p className="text-xs text-slate-300 mt-2 bg-navy-950/60 p-2 rounded-lg border border-white/5">
                  {amen.specialty}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5">
                <button
                  onClick={() => onAskGhostAbout(`Tell me the location, menu, and payment options for ${amen.name}`)}
                  className="w-full py-1.5 px-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Ask Ghost about {amen.name}</span>
                </button>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}
