import React, { useState } from 'react';
import { Shield, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { agentLogin } from '../services/agentAuthService';
import { ViewState } from '../types';

interface AgentLoginProps {
    onLoginSuccess: () => void;
    setView: (view: ViewState) => void;
}

const AgentLogin: React.FC<AgentLoginProps> = ({ onLoginSuccess, setView }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await agentLogin(email, password);
            onLoginSuccess();
        } catch (err: any) {
            setError(err.message || '登入失敗');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">專員登入</h1>
                    <p className="text-gray-600">SmartClaim 客戶管理系統</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                專員 Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="agent@smartclaim.com"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                disabled={loading}
                            />
                            <p className="mt-1 text-xs text-gray-500">請使用 @smartclaim.com 結尾的 email</p>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                密碼
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                disabled={loading}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-red-800">{error}</div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    登入中...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    登入
                                </>
                            )}
                        </button>
                    </form>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-800">
                            <strong>測試帳號:</strong> agent@smartclaim.com<br />
                            <strong>密碼:</strong> agent2026
                        </p>
                        <p className="text-xs text-blue-600 mt-2">
                            ※ 如果帳號不存在,請聯繫系統管理員建立專員帳號
                        </p>
                    </div>
                </div>

                {/* Back Button */}
                <button
                    onClick={() => setView(ViewState.HOME)}
                    className="mt-6 w-full text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                    ← 返回首頁
                </button>
            </div>
        </div>
    );
};

export default AgentLogin;
