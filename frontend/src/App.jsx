import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DemoNoticeBanner from './components/DemoNoticeBanner';
import ChatView from './components/ChatView';
import CampusDirectory from './components/CampusDirectory';
import CampusMapNavigator from './components/CampusMapNavigator';
import RulesAndFaqs from './components/RulesAndFaqs';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [ghostMood, setGhostMood] = useState('friendly');
  const [systemStatus, setSystemStatus] = useState(null);
  const [campusMeta, setCampusMeta] = useState(null);
  const [highlightedRoom, setHighlightedRoom] = useState(null);
  const [initialPrompt, setInitialPrompt] = useState('');

  // Authentication state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ghost_campus_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Fetch backend status and campus metadata
  useEffect(() => {
    async function checkHealth() {
      try {
        const [healthRes, metaRes] = await Promise.all([
          fetch('/api/health').then((r) => r.json()),
          fetch('/api/campus/meta').then((r) => r.json())
        ]);
        setSystemStatus(healthRes);
        setCampusMeta(metaRes);
      } catch (err) {
        console.warn('Backend polling warning:', err);
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    try {
      localStorage.setItem('ghost_campus_user', JSON.stringify(userData));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('ghost_campus_user');
    } catch (e) {
      console.warn('Storage error:', e);
    }
  };

  // Handler to jump to Map with a preselected room
  const handleNavigateToRoom = (roomCode) => {
    setHighlightedRoom(roomCode);
    setActiveTab('map');
  };

  // Handler to jump to Chat with a pre-filled or auto-sent query
  const handleAskGhostAbout = (prompt) => {
    setActiveTab('chat');
    setInitialPrompt(prompt);
  };

  // If no user is logged in, show the beautiful Login & Registration page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 selection:bg-purple-500/30 selection:text-white">
      {/* Demo Notice Banner */}
      <DemoNoticeBanner campusMeta={campusMeta} />

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
        ghostMood={ghostMood}
        setGhostMood={setGhostMood}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-4">
        {activeTab === 'chat' && (
          <ChatView
            systemStatus={systemStatus}
            ghostMood={ghostMood}
            setGhostMood={setGhostMood}
            onNavigateToRoom={handleNavigateToRoom}
            campusMeta={campusMeta}
            autoSendPrompt={initialPrompt}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'directory' && (
          <CampusDirectory
            onNavigateToRoom={handleNavigateToRoom}
            onAskGhostAbout={handleAskGhostAbout}
          />
        )}

        {activeTab === 'map' && (
          <CampusMapNavigator
            highlightedRoomCode={highlightedRoom}
            onAskGhostAbout={handleAskGhostAbout}
          />
        )}

        {activeTab === 'rules' && (
          <RulesAndFaqs
            onAskGhostAbout={handleAskGhostAbout}
          />
        )}
      </main>

      {/* Hackathon Project Footer */}
      <Footer campusMeta={campusMeta} />
    </div>
  );
}
