import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Plus,
    Phone,
    Mail,
    FileText,
    Calendar,
    AlertCircle,
    TrendingUp,
    Loader2,
    Edit,
    Trash2,
    Clock,
    LogOut
} from 'lucide-react';
import { Customer, Policy } from '../types';
import { subscribeToCustomers, deleteCustomer, searchCustomers } from '../services/customerService';
import { getCurrentAgent } from '../services/agentAuthService';

interface AgentDashboardProps {
    onSelectCustomer: (customerId: string) => void;
    onNewCustomer: () => void;
    onBackToHome?: () => void;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ onSelectCustomer, onNewCustomer, onBackToHome }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState(true);
    const agent = getCurrentAgent();

    // 訂閱客戶資料
    useEffect(() => {
        const unsubscribe = subscribeToCustomers((data) => {
            setCustomers(data);
            setFilteredCustomers(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 搜尋過濾
    useEffect(() => {
        const filtered = searchCustomers(customers, searchKeyword);
        setFilteredCustomers(filtered);
    }, [searchKeyword, customers]);

    // 計算統計數據
    const stats = {
        totalCustomers: customers.length,
        expiringPolicies: customers.reduce((count, c) =>
            count + c.policies.filter(p => p.status === 'expiring_soon').length, 0
        ),
        expiredPolicies: customers.reduce((count, c) =>
            count + c.policies.filter(p => p.status === 'expired').length, 0
        ),
        newThisMonth: customers.filter(c => {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return c.createdAt > monthAgo;
        }).length
    };

    const handleDelete = async (customerId: string, customerName: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (window.confirm(`確定要刪除客戶「${customerName}」嗎?\n此操作無法復原。`)) {
            try {
                await deleteCustomer(customerId);
            } catch (error) {
                alert('刪除失敗,請稍後再試');
            }
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">客戶管理</h1>
                            <p className="text-gray-600 mt-1">歡迎回來, {agent?.displayName}</p>
                        </div>
                        <div className="flex gap-3">
                            {onBackToHome && (
                                <button
                                    onClick={onBackToHome}
                                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    返回首頁
                                </button>
                            )}
                            <button
                                onClick={onNewCustomer}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
                            >
                                <Plus className="w-5 h-5" />
                                新增客戶
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">客戶總數</p>
                                    <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalCustomers}</p>
                                </div>
                                <Users className="w-8 h-8 text-blue-600 opacity-50" />
                            </div>
                        </div>

                        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-orange-600 font-medium">即將到期</p>
                                    <p className="text-2xl font-bold text-orange-900 mt-1">{stats.expiringPolicies}</p>
                                </div>
                                <AlertCircle className="w-8 h-8 text-orange-600 opacity-50" />
                            </div>
                        </div>

                        <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-600 font-medium">已到期</p>
                                    <p className="text-2xl font-bold text-red-900 mt-1">{stats.expiredPolicies}</p>
                                </div>
                                <Clock className="w-8 h-8 text-red-600 opacity-50" />
                            </div>
                        </div>

                        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 font-medium">本月新增</p>
                                    <p className="text-2xl font-bold text-green-900 mt-1">{stats.newThisMonth}</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-green-600 opacity-50" />
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-6 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="搜尋客戶姓名、電話或 Email..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Customer List */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-gray-600">載入客戶資料中...</span>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-20">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {searchKeyword ? '找不到符合的客戶' : '尚無客戶資料'}
                        </p>
                        {!searchKeyword && (
                            <button
                                onClick={onNewCustomer}
                                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                立即新增第一位客戶 →
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">客戶姓名</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">聯絡方式</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">保單數量</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">最近更新</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredCustomers.map((customer) => {
                                    const expiringCount = customer.policies.filter(p => p.status === 'expiring_soon').length;
                                    const expiredCount = customer.policies.filter(p => p.status === 'expired').length;

                                    return (
                                        <tr
                                            key={customer.id}
                                            onClick={() => onSelectCustomer(customer.id)}
                                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                                        {customer.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{customer.name}</p>
                                                        {customer.email && (
                                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                                <Mail className="w-3 h-3" />
                                                                {customer.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-700 flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    {customer.phone}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium text-gray-900">{customer.policies.length}</span>
                                                    {expiringCount > 0 && (
                                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                                                            {expiringCount} 即將到期
                                                        </span>
                                                    )}
                                                    {expiredCount > 0 && (
                                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                                                            {expiredCount} 已到期
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-600 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {formatDate(customer.updatedAt)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onSelectCustomer(customer.id);
                                                        }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="編輯"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(customer.id, customer.name, e)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="刪除"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentDashboard;