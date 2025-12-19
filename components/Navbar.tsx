
import React, { useState } from 'react';
import { ViewState, UserProfile } from '../types';
import { ShieldCheck, Search, LogOut, ChevronDown, Briefcase, LogIn, BookText } from 'lucide-react';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  user?: UserProfile | null;
  onLogout?: () => void;
  onOpenAgentLogin: () => void;
  onOpenUserLogin: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, user, onLogout, onOpenAgentLogin, onOpenUserLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setView(ViewState.HOME)}>
            <div className={`rounded-lg p-1.5 mr-2 ${currentView === ViewState.AGENT_DASHBOARD ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
              {currentView === ViewState.AGENT_DASHBOARD ? (
                 <Briefcase className="h-6 w-6 text-white" />
              ) : (
                 <ShieldCheck className="h-6 w-6 text-white" />
              )}
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
               {currentView === ViewState.AGENT_DASHBOARD ? 'SmartClaim 專員管理後台' : '智能保單檢索系統'}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-6">
            {currentView === ViewState.AGENT_DASHBOARD ? (
              <button
                onClick={() => setView(ViewState.HOME)}
                className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm transition-colors font-medium"
              >
                返回使用者模式
              </button>
            ) : (
              <>
                <button
                  onClick={() => setView(ViewState.HOME)}
                  className={`${
                    currentView === ViewState.HOME ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-700'
                  } px-3 py-2 text-sm transition-colors hidden md:block`}
                >
                  專案首頁
                </button>
                <button
                  onClick={() => setView(ViewState.DOCS)}
                  className={`${
                    currentView === ViewState.DOCS ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-700'
                  } px-3 py-2 text-sm transition-colors flex items-center`}
                >
                  <BookText className="w-4 h-4 mr-1.5" />
                  系統文件
                </button>
                <button
                  onClick={() => setView(ViewState.DEMO)}
                  className={`${
                    currentView === ViewState.DEMO ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-700'
                  } px-3 py-2 text-sm transition-colors flex items-center`}
                >
                  <Search className="w-4 h-4 mr-1.5" />
                  理賠諮詢展示
                </button>
              </>
            )}

            {/* User Profile or Login Button */}
            {user ? (
              <div className="relative ml-2">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 pl-4 border-l border-gray-200 hover:bg-gray-50 py-1 pr-2 rounded-full transition-colors"
                >
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                  />
                  <span className="text-sm font-medium text-gray-700 hidden md:block">{user.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {isMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsMenuOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      {currentView !== ViewState.AGENT_DASHBOARD && (
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenAgentLogin();
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center transition-colors border-b border-gray-50"
                        >
                          <Briefcase className="w-4 h-4 mr-2" />
                          切換至專員模式
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (onLogout) onLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        登出帳戶
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
               <button
                  onClick={onOpenUserLogin}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm active:scale-95"
               >
                  <LogIn className="w-4 h-4" />
                  登入
               </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;