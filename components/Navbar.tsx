import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { ShieldCheck, Search, LogIn, LogOut, Loader2 } from 'lucide-react';
import { signInWithGoogle, logout, auth } from '../services/firebase';
import { User } from 'firebase/auth';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
      alert("登入失敗，請稍後再試");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setView(ViewState.HOME); // Go home on logout
    } catch (error) {
      console.error("Logout failed", error);
    }
  }

  return (
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

          <div className="flex items-center space-x-4 md:space-x-6">
            <button
              onClick={() => setView(ViewState.HOME)}
              className={`${currentView === ViewState.HOME ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-700'
                } px-3 py-2 text-sm transition-colors hidden md:block`}
            >
              首頁
            </button>
            <button
              onClick={() => setView(ViewState.DEMO)}
              className={`${currentView === ViewState.DEMO ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-700'
                } px-3 py-2 text-sm transition-colors flex items-center`}
            >
              <Search className="w-4 h-4 mr-1.5" />
              理賠諮詢
            </button>

            {/* Auth Section */}
            <div className="border-l border-gray-200 pl-4 ml-2">
              {loading ? (
                <div className="w-8 h-8 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : user ? (
                <div className="flex items-center gap-3">
                  <img
                    src={user.photoURL || "https://ui-avatars.com/api/?name=User"}
                    alt={user.displayName || "User"}
                    className="w-8 h-8 rounded-full border border-gray-200"
                    title={user.displayName || "User"}
                  />
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-500 transition-colors p-1"
                    title="登出"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  登入
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
