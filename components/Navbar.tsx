
import React from 'react';
import { ViewState } from '../types';
import { ShieldCheck, Search } from 'lucide-react';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
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
              className={`${
                currentView === ViewState.HOME ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 text-sm transition-colors hidden md:block`}
            >
              首頁
            </button>
            <button
              onClick={() => setView(ViewState.DEMO)}
              className={`${
                currentView === ViewState.DEMO ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 text-sm transition-colors flex items-center`}
            >
              <Search className="w-4 h-4 mr-1.5" />
              理賠諮詢
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
