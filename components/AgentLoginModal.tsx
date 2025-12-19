
import React, { useState } from 'react';
import { Briefcase, X, LockKeyhole, ArrowRight, AlertCircle } from 'lucide-react';

interface AgentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AgentLoginModal: React.FC<AgentLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === '8866') {
      onSuccess();
      setCode('');
      setError('');
    } else {
      setError('驗證碼錯誤，請重新輸入。');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-indigo-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">專員身份驗證</h2>
          <p className="text-center text-gray-500 text-sm mb-8">
            請輸入您的 4 位數專員編號<br/>以存取客戶管理系統
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockKeyhole className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                maxLength={4}
                className={`block w-full pl-10 pr-3 py-3 border ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-xl text-center text-2xl tracking-widest font-mono placeholder-gray-300 focus:outline-none focus:ring-2 transition-all`}
                placeholder="0000"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center text-red-600 text-sm mb-6 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center shadow-lg shadow-indigo-200"
            >
              驗證並進入
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </form>
        </div>
        <div className="bg-gray-50 px-8 py-4 text-center">
           <p className="text-xs text-gray-400">僅限授權人員使用 • 預設編號: 8866</p>
        </div>
      </div>
    </div>
  );
};

export default AgentLoginModal;
