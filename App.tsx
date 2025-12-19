
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ChatInterface from './components/ChatInterface';
import Login from './components/Login';
import AgentDashboard from './components/AgentDashboard';
import AgentLoginModal from './components/AgentLoginModal';
import ProjectDocs from './components/ProjectDocs';
import { ViewState, UserProfile } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAgentLogin, setShowAgentLogin] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);

  // Check localStorage for persisted session
  useEffect(() => {
    const savedUser = localStorage.getItem('smartclaim_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
    localStorage.setItem('smartclaim_user', JSON.stringify(newUser));
    setShowUserLogin(false); // Close login modal
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('smartclaim_user');
    setCurrentView(ViewState.HOME);
  };

  const handleAgentLoginSuccess = () => {
    setShowAgentLogin(false);
    setCurrentView(ViewState.AGENT_DASHBOARD);
  };

  // Protected Navigation Handler
  const handleNavigation = (view: ViewState) => {
    // Only Agent Dashboard strictly requires User to be "someone" (or just the code).
    // In this prototype, Agent Dashboard is protected by the 8866 code, but we might want to check for user login too?
    // The previous logic required user login for DEMO. We REMOVE that requirement for DEMO (Guest Mode).
    
    // If user tries to access AGENT_DASHBOARD without user login, we might prompt login, 
    // OR we can say Agent Dashboard is separate. Let's assume standard flow:
    // Guests can see Home and Demo.
    // Agent Mode requires the code (handled by modal), but usually accessed via Navbar which shows up.
    
    // Actually, simply setting the view is fine. 
    // The Agent Login Modal is the gatekeeper for AGENT_DASHBOARD view content if triggered via Navbar logic,
    // but here we just route.
    
    setCurrentView(view);
  };

  const handleOpenAgentLogin = () => {
      setShowAgentLogin(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        currentView={currentView} 
        setView={handleNavigation} 
        user={user}
        onLogout={handleLogout}
        onOpenAgentLogin={handleOpenAgentLogin}
        onOpenUserLogin={() => setShowUserLogin(true)}
      />
      
      <main className="flex-grow">
        {currentView === ViewState.HOME && <Home setView={handleNavigation} />}
        
        {/* ChatInterface now handles "Guest Mode" (user={null}) internally */}
        {currentView === ViewState.DEMO && <ChatInterface user={user} />}
        
        {currentView === ViewState.AGENT_DASHBOARD && <AgentDashboard />}

        {currentView === ViewState.DOCS && <ProjectDocs setView={handleNavigation} />}
      </main>
      
      {/* Modals */}
      {showUserLogin && (
        <Login 
            onLogin={handleLogin} 
            onClose={() => setShowUserLogin(false)} 
        />
      )}

      <AgentLoginModal 
        isOpen={showAgentLogin} 
        onClose={() => setShowAgentLogin(false)} 
        onSuccess={handleAgentLoginSuccess}
      />

      {currentView === ViewState.HOME && (
        <footer className="bg-white border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            <p>© 2025 智能保單檢索系統 (SmartClaim AI) 研究原型。僅供學術展示用途。</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;