import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { ShieldCheck, User as UserIconLucide, LogOut, ChevronDown } from 'lucide-react';
import { auth } from '../services/firebase';
import { logoutUser } from '../services/userAuthService';
import { User } from 'firebase/auth';
import UserAuthModal from './UserAuthModal';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setShowUserMenu(false);
      setView(ViewState.HOME);
    } catch (error) {
      console.error("登出失敗", error);
    }
  };

  // 點擊外部關閉選單
  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setView(ViewState.HOME)}>
              <div className="rounded-lg p-1.5 mr-2 bg-emerald-600">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                智能保單檢索系統
              </span>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={() => setView(ViewState.HOME)}
                className={`text-sm font-medium transition-colors ${currentView === ViewState.HOME
                    ? 'text-emerald-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                首頁
              </button>

              <button
                onClick={() => setView(ViewState.DEMO)}
                className={`text-sm font-medium transition-colors ${currentView === ViewState.DEMO
                    ? 'text-emerald-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                理賠諮詢
              </button>

              <button
                onClick={() => setView(ViewState.AGENT)}
                className={`text-sm font-medium transition-colors ${currentView === ViewState.AGENT
                    ? 'text-emerald-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                專員模式
              </button>

              {/* 使用者登入/選單 */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(!showUserMenu);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-medium">
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user.displayName || user.email}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* 下拉選單 */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user.displayName || '使用者'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        登出
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <UserIconLucide className="w-4 h-4" />
                  登入
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 登入彈窗 */}
      <UserAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
        }}
      />
    </>
  );
};

export default Navbar;
