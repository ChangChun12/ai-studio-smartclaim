
import React, { useState } from 'react';
import { ShieldCheck, Loader2, X } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
  onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulate network request/delay for Google OAuth
    setTimeout(() => {
      // Mock User Data representing a successful Google Login
      const mockUser: UserProfile = {
        name: "莊浚",
        email: "jun.zhuang@gmail.com",
        picture: "https://scontent.ftpe7-1.fna.fbcdn.net/v/t1.15752-9/582983729_873427615213729_7668786887289001645_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=9f807c&_nc_ohc=jnCUokt0GD0Q7kNvwEPT7eB&_nc_oc=AdlUkmqJNkTvjBHEqkWIqmPHoIbhxQLsaUnRo9Q5uhNOVNWSaaUVLLPN5gjG0VDWx0eFb9Ki68oNzsJgsQDK5Nro&_nc_zt=23&_nc_ht=scontent.ftpe7-1.fna&oh=03_Q7cD3wGPZ7j4s9kknYlPWeuuV13uCzROL9PyycykIhY5JPPwbA&oe=694FB993"
      };
      onLogin(mockUser);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md border border-gray-100 text-center relative overflow-hidden">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Logo Animation */}
        <div className="mb-8 flex justify-center">
          <div className="bg-emerald-600 p-4 rounded-2xl shadow-lg transform hover:scale-110 transition-transform duration-300">
             <ShieldCheck className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          歡迎使用 <br/>
          <span className="text-emerald-600">SmartClaim AI</span>
        </h1>
        <p className="text-gray-500 mb-10">
          登入帳戶以儲存您的保單分析紀錄<br/>並獲得更精準的個人化建議
        </p>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span className="text-emerald-600">正在連線至 Google...</span>
            </>
          ) : (
            <>
              {/* Google G Logo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>使用 Google 帳戶繼續</span>
            </>
          )}
        </button>

        <div className="mt-8 pt-6 border-t border-gray-100">
           <p className="text-xs text-gray-400">
             繼續使用即代表您同意 SmartClaim AI 的<br/>服務條款與隱私權政策
           </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
