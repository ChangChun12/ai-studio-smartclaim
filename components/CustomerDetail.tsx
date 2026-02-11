import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Save, Loader2, Phone, Mail, FileText, Trash2, Edit2, Download, MessageSquare } from 'lucide-react';
import { Customer, Policy, Currency, PaymentFrequency } from '../types';
import { getCustomer, addCustomer, updateCustomer, addPolicyToCustomer, updatePolicy, deletePolicy } from '../services/customerService';
import PolicyModal from './PolicyModal';

interface CustomerDetailProps {
    customerId: string | null;
    onBack: () => void;
    onStartAIAnalysis?: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customerId, onBack, onStartAIAnalysis }) => {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(false);
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<Policy | undefined>(undefined);

    // Form states
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadCustomer();
    }, [customerId]);

    const loadCustomer = async () => {
        if (!customerId) {
            // 新客戶模式
            setCustomer(null);
            setEditingCustomer(true);
            setLoading(false);
            return;
        }

        try {
            const data = await getCustomer(customerId);
            if (data) {
                setCustomer(data);
                setName(data.name);
                setPhone(data.phone);
                setEmail(data.email || '');
                setNotes(data.notes || '');
            }
        } catch (error) {
            alert('載入客戶資料失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCustomer = async () => {
        if (!name.trim() || !phone.trim()) {
            alert('請填寫姓名和電話');
            return;
        }

        setSaving(true);
        try {
            if (customer) {
                // 更新現有客戶
                await updateCustomer(customer.id, { name, phone, email, notes });
                alert('儲存成功');
                setEditingCustomer(false);
                loadCustomer();
            } else {
                // 新增客戶
                await addCustomer({
                    name,
                    phone,
                    email,
                    notes,
                    policies: []
                });
                alert('客戶新增成功');
                onBack(); // 返回客戶列表
            }
        } catch (error) {
            alert('儲存失敗');
        } finally {
            setSaving(false);
        }
    };

    const handleSavePolicy = async (policyData: Omit<Policy, 'id' | 'status'>) => {
        if (!customer) return;

        try {
            if (editingPolicy) {
                // 更新保單
                await updatePolicy(customer.id, editingPolicy.id, policyData);
            } else {
                // 新增保單
                await addPolicyToCustomer(customer.id, policyData);
            }
            loadCustomer();
            setShowPolicyModal(false);
            setEditingPolicy(undefined);
        } catch (error) {
            throw error;
        }
    };

    const handleDeletePolicy = async (policyId: string) => {
        if (!customer) return;

        if (window.confirm('確定要刪除此保單嗎?')) {
            try {
                await deletePolicy(customer.id, policyId);
                loadCustomer();
            } catch (error) {
                alert('刪除失敗');
            }
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-green-100 text-green-700',
            expiring_soon: 'bg-orange-100 text-orange-700',
            expired: 'bg-red-100 text-red-700'
        };
        const labels = {
            active: '生效中',
            expiring_soon: '即將到期',
            expired: '已到期'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    const getPolicyTypeBadge = (type: string) => {
        return type === 'main' ? (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">主約</span>
        ) : (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">附約</span>
        );
    };

    const getCurrencySymbol = (currency: Currency) => {
        const symbols = {
            TWD: 'NT$',
            USD: 'US$',
            CNY: '¥',
            HKD: 'HK$'
        };
        return symbols[currency];
    };

    const getFrequencyLabel = (frequency: PaymentFrequency) => {
        const labels = {
            annual: '年繳',
            semiannual: '半年繳',
            quarterly: '季繳',
            monthly: '月繳'
        };
        return labels[frequency];
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('zh-TW');
    };

    // 組織保單為階層結構 (主約 + 附約)
    const organizedPolicies = customer ? (() => {
        const mainPolicies = customer.policies.filter(p => p.policyType === 'main');
        return mainPolicies.map(main => ({
            main,
            riders: customer.policies.filter(p => p.policyType === 'rider' && p.parentPolicyId === main.id)
        }));
    })() : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-6">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        返回客戶列表
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {customer ? customer.name : '新增客戶'}
                            </h1>
                            {customer && (
                                <p className="text-gray-600 mt-1">
                                    {customer.policies.length} 個保單 • 最後更新: {formatDate(customer.updatedAt)}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            {customer && onStartAIAnalysis && (
                                <button
                                    onClick={onStartAIAnalysis}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    AI 分析
                                </button>
                            )}
                            {customer && !editingCustomer && (
                                <button
                                    onClick={() => setEditingCustomer(true)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    編輯資料
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
                {/* Customer Info Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">客戶資料</h2>

                    {editingCustomer ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        姓名 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="請輸入姓名"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        電話 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="0912-345-678"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="example@email.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">備註</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="客戶備註..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSaveCustomer}
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    儲存
                                </button>
                                {customer && (
                                    <button
                                        onClick={() => {
                                            setEditingCustomer(false);
                                            setName(customer.name);
                                            setPhone(customer.phone);
                                            setEmail(customer.email || '');
                                            setNotes(customer.notes || '');
                                        }}
                                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        取消
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : customer ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">電話</p>
                                    <p className="font-medium text-gray-900">{customer.phone}</p>
                                </div>
                            </div>
                            {customer.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{customer.email}</p>
                                    </div>
                                </div>
                            )}
                            {customer.notes && (
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-500 mb-1">備註</p>
                                    <p className="text-gray-700">{customer.notes}</p>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Policies Section */}
                {customer && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">保單列表</h2>
                            <button
                                onClick={() => {
                                    setEditingPolicy(undefined);
                                    setShowPolicyModal(true);
                                }}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                新增保單
                            </button>
                        </div>

                        {/* Policies List */}
                        {customer.policies.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>尚無保單資料</p>
                                <p className="text-sm mt-1">點擊上方「新增保單」按鈕開始新增</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {organizedPolicies.map(({ main, riders }) => (
                                    <div key={main.id} className="space-y-2">
                                        {/* 主約 */}
                                        <PolicyCard
                                            policy={main}
                                            onEdit={() => {
                                                setEditingPolicy(main);
                                                setShowPolicyModal(true);
                                            }}
                                            onDelete={() => handleDeletePolicy(main.id)}
                                            getStatusBadge={getStatusBadge}
                                            getPolicyTypeBadge={getPolicyTypeBadge}
                                            getCurrencySymbol={getCurrencySymbol}
                                            getFrequencyLabel={getFrequencyLabel}
                                            formatDate={formatDate}
                                        />

                                        {/* 附約 */}
                                        {riders.map(rider => (
                                            <div key={rider.id} className="ml-8 relative">
                                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-200"></div>
                                                <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-purple-200"></div>
                                                <PolicyCard
                                                    policy={rider}
                                                    onEdit={() => {
                                                        setEditingPolicy(rider);
                                                        setShowPolicyModal(true);
                                                    }}
                                                    onDelete={() => handleDeletePolicy(rider.id)}
                                                    getStatusBadge={getStatusBadge}
                                                    getPolicyTypeBadge={getPolicyTypeBadge}
                                                    getCurrencySymbol={getCurrencySymbol}
                                                    getFrequencyLabel={getFrequencyLabel}
                                                    formatDate={formatDate}
                                                    isRider
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Policy Modal */}
            {customer && (
                <PolicyModal
                    isOpen={showPolicyModal}
                    onClose={() => {
                        setShowPolicyModal(false);
                        setEditingPolicy(undefined);
                    }}
                    onSave={handleSavePolicy}
                    customerId={customer.id}
                    existingPolicies={customer.policies}
                    editingPolicy={editingPolicy}
                />
            )}
        </div>
    );
};

// 保單卡片組件
interface PolicyCardProps {
    policy: Policy;
    onEdit: () => void;
    onDelete: () => void;
    getStatusBadge: (status: string) => React.ReactElement;
    getPolicyTypeBadge: (type: string) => React.ReactElement;
    getCurrencySymbol: (currency: Currency) => string;
    getFrequencyLabel: (frequency: PaymentFrequency) => string;
    formatDate: (date: Date) => string;
    isRider?: boolean;
}

const PolicyCard: React.FC<PolicyCardProps> = ({
    policy,
    onEdit,
    onDelete,
    getStatusBadge,
    getPolicyTypeBadge,
    getCurrencySymbol,
    getFrequencyLabel,
    formatDate,
    isRider = false
}) => {
    return (
        <div className={`border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors ${isRider ? 'bg-purple-50/30' : 'bg-white'}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        {getPolicyTypeBadge(policy.policyType)}
                        <h3 className="font-semibold text-gray-900">{policy.policyName}</h3>
                        {getStatusBadge(policy.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                        {policy.policyNumber && (
                            <div>
                                <p className="text-gray-500">保單號碼</p>
                                <p className="font-medium text-gray-900">{policy.policyNumber}</p>
                            </div>
                        )}
                        {policy.insuranceCompany && (
                            <div>
                                <p className="text-gray-500">保險公司</p>
                                <p className="font-medium text-gray-900">{policy.insuranceCompany}</p>
                            </div>
                        )}
                        {policy.coverageType && (
                            <div>
                                <p className="text-gray-500">保險類型</p>
                                <p className="font-medium text-gray-900">{policy.coverageType}</p>
                            </div>
                        )}
                        {policy.premium > 0 && (
                            <div>
                                <p className="text-gray-500">保費</p>
                                <p className="font-medium text-gray-900">
                                    {getCurrencySymbol(policy.currency)} {policy.premium.toLocaleString()} / {getFrequencyLabel(policy.paymentFrequency)}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-gray-500">投保日期</p>
                            <p className="font-medium text-gray-900">{formatDate(policy.startDate)}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">到期日</p>
                            <p className="font-medium text-gray-900">{formatDate(policy.endDate)}</p>
                        </div>
                        {policy.documentUrl && (
                            <div className="md:col-span-2">
                                <p className="text-gray-500 mb-1">保單文件</p>
                                <a
                                    href={policy.documentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                                >
                                    <FileText className="w-4 h-4" />
                                    {policy.documentName || '查看文件'}
                                    <Download className="w-3 h-3" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex gap-2 ml-4">
                    <button
                        onClick={onEdit}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="編輯保單"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="刪除保單"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail;
