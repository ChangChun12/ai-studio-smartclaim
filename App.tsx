
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ChatInterface from './components/ChatInterface';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        currentView={currentView} 
        setView={setCurrentView} 
      />
      
      <main className="flex-grow">
        {currentView === ViewState.HOME && <Home setView={setCurrentView} />}
        {currentView === ViewState.DEMO && <ChatInterface />}
      </main>
      
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
