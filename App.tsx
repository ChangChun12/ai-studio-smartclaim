
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ChatInterface from './components/ChatInterface';
import AgentLogin from './components/AgentLogin';
import AgentDashboard from './components/AgentDashboard';
import CustomerDetail from './components/CustomerDetail';
import { ViewState, Customer } from './types';
import { isAgentMode } from './services/agentAuthService';
import { auth } from './services/firebase';
import { getCustomer } from './services/customerService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [isAgentAuthenticated, setIsAgentAuthenticated] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // 監聽 auth 狀態變化
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      setIsAgentAuthenticated(isAgentMode());
    });
    return () => unsubscribe();
  }, []);

  const handleAgentLoginSuccess = () => {
    // 強制更新狀態
    setIsAgentAuthenticated(true);
    // 確保切換到 AGENT view
    setCurrentView(ViewState.AGENT);
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setIsNewCustomer(false);
  };

  const handleNewCustomer = () => {
    setSelectedCustomerId(null);
    setIsNewCustomer(true);
  };

  const handleBackToDashboard = () => {
    setSelectedCustomerId(null);
    setIsNewCustomer(false);
  };

  // 檢查專員模式權限
  const renderAgentView = () => {
    if (!isAgentAuthenticated) {
      return <AgentLogin onLoginSuccess={handleAgentLoginSuccess} setView={setCurrentView} />;
    }

    if (selectedCustomerId || isNewCustomer) {
      return (
        <CustomerDetail
          customerId={selectedCustomerId}
          onBack={handleBackToDashboard}
          onStartAIAnalysis={async () => {
            if (selectedCustomerId) {
              const customer = await getCustomer(selectedCustomerId);
              setSelectedCustomer(customer);
            }
            setCurrentView(ViewState.DEMO);
          }}
        />
      );
    }

    return (
      <AgentDashboard
        onSelectCustomer={handleSelectCustomer}
        onNewCustomer={handleNewCustomer}
        onBackToHome={() => setCurrentView(ViewState.HOME)}
      />
    );
  };

  return (
    <div className={`${currentView === ViewState.DEMO ? 'h-screen overflow-hidden' : 'min-h-screen'} flex flex-col`}>
      {currentView !== ViewState.AGENT && (
        <Navbar
          currentView={currentView}
          setView={setCurrentView}
        />
      )}

      <main className={currentView === ViewState.AGENT ? 'flex-grow' : 'flex-grow h-0'}>
        {currentView === ViewState.HOME && <Home setView={setCurrentView} />}
        {currentView === ViewState.DEMO && <ChatInterface selectedCustomer={selectedCustomer} />}
        {currentView === ViewState.AGENT && renderAgentView()}
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
