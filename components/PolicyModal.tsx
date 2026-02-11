import React, { useState } from 'react';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import { Policy, PolicyType, Currency, PaymentFrequency } from '../types';
import { uploadPolicyDocument } from '../services/policyFileService';

interface PolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (policy: Omit<Policy, 'id' | 'status'>) => Promise<void>;
    customerId: string;
    existingPolicies: Policy[];
    editingPolicy?: Policy;
}

const PolicyModal: React.FC<PolicyModalProps> = ({
    isOpen,
    onClose,
    onSave,
    customerId,
    existingPolicies,
    editingPolicy
}) => {
    const [loading, setLoading] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // 表單狀態
    const [policyNumber, setPolicyNumber] = useState(editingPolicy?.policyNumber || '');
    const [policyName, setPolicyName] = useState(editingPolicy?.policyName || '');
    const [insuranceCompany, setInsuranceCompany] = useState(editingPolicy?.insuranceCompany || '');
    const [coverageType, setCoverageType] = useState(editingPolicy?.coverageType || '');
    const [policyType, setPolicyType] = useState<PolicyType>(editingPolicy?.policyType || 'main');
    const [parentPolicyId, setParentPolicyId] = useState(editingPolicy?.parentPolicyId || '');
    const [premium, setPremium] = useState(editingPolicy?.premium || 0);
    const [currency, setCurrency] = useState<Currency>(editingPolicy?.currency || 'TWD');
    const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>(editingPolicy?.paymentFrequency || 'annual');
    const [startDate, setStartDate] = useState(
        editingPolicy?.startDate ? new Date(editingPolicy.startDate).toISOString().split('T')[0] : ''
    );
    const [endDate, setEndDate] = useState(
        editingPolicy?.endDate ? new Date(editingPolicy.endDate).toISOString().split('T')[0] : ''
    );
    const [notes, setNotes] = useState(editingPolicy?.notes || '');
    const [documentUrl, setDocumentUrl] = useState(editingPolicy?.documentUrl || '');
    const [documentName, setDocumentName] = useState(editingPolicy?.documentName || '');

    // 主約選項 (只顯示主約)
    const mainPolicies = existingPolicies.filter(p => p.policyType === 'main');

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 檢查檔案類型
        if (file.type !== 'application/pdf') {
            alert('請上傳 PDF 檔案');
            return;
        }

        // 檢查檔案大小 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('檔案大小不能超過 10MB');
            return;
        }

        setUploadingFile(true);
        setUploadProgress(0);
        try {
            const tempPolicyId = editingPolicy?.id || `temp_${Date.now()}`;
            const result = await uploadPolicyDocument(
                customerId,
                tempPolicyId,
                file,
                (progress) => {
                    setUploadProgress(Math.round(progress));
                }
            );
            setDocumentUrl(result.url);
            setDocumentName(result.name);
        } catch (error) {
            alert('檔案上傳失敗');
        } finally {
            setUploadingFile(false);
            setUploadProgress(0);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 驗證必填欄位
        if (!policyName || !startDate || !endDate) {
            alert('請填寫必填欄位');
            return;
        }

        // 如果是附約,必須選擇主約
        if (policyType === 'rider' && !parentPolicyId) {
            alert('附約必須選擇關聯的主約');
            return;
        }

        setLoading(true);
        try {
            await onSave({
                policyNumber,
                policyName,
                insuranceCompany,
                coverageType,
                policyType,
                parentPolicyId: policyType === 'rider' ? parentPolicyId : undefined,
                premium,
                currency,
                paymentFrequency,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                notes,
                documentUrl,
                documentName
            });
            onClose();
        } catch (error) {
            alert('儲存失敗');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {editingPolicy ? '編輯保單' : '新增保單'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* 基本資訊 */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">基本資訊</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    保單號碼
                                </label>
                                <input
                                    type="text"
                                    value={policyNumber}
                                    onChange={(e) => setPolicyNumber(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="例: ABC123456"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    保單名稱 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={policyName}
                                    onChange={(e) => setPolicyName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="例: 終身醫療保險"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    保險公司
                                </label>
                                <input
                                    type="text"
                                    value={insuranceCompany}
                                    onChange={(e) => setInsuranceCompany(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="例: 國泰人壽"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    保險類型
                                </label>
                                <select
                                    value={coverageType}
                                    onChange={(e) => setCoverageType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">選擇保險類型</option>
                                    <option value="醫療險">醫療險</option>
                                    <option value="壽險">壽險</option>
                                    <option value="意外險">意外險</option>
                                    <option value="癌症險">癌症險</option>
                                    <option value="重大疾病險">重大疾病險</option>
                                    <option value="車險">車險</option>
                                    <option value="其他">其他</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 保單類型 */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">保單類型</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    主約/附約 <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={policyType}
                                    onChange={(e) => setPolicyType(e.target.value as PolicyType)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="main">主約</option>
                                    <option value="rider">附約</option>
                                </select>
                            </div>
                            {policyType === 'rider' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        關聯主約 <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={parentPolicyId}
                                        onChange={(e) => setParentPolicyId(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">選擇主約</option>
                                        {mainPolicies.map(policy => (
                                            <option key={policy.id} value={policy.id}>
                                                {policy.policyName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 費用資訊 */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">費用資訊</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    保費金額
                                </label>
                                <input
                                    type="number"
                                    value={premium || ''}
                                    onChange={(e) => setPremium(Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    幣別
                                </label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value as Currency)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="TWD">新台幣 (TWD)</option>
                                    <option value="USD">美元 (USD)</option>
                                    <option value="CNY">人民幣 (CNY)</option>
                                    <option value="HKD">港幣 (HKD)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    繳費頻率
                                </label>
                                <select
                                    value={paymentFrequency}
                                    onChange={(e) => setPaymentFrequency(e.target.value as PaymentFrequency)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="annual">年繳</option>
                                    <option value="semiannual">半年繳</option>
                                    <option value="quarterly">季繳</option>
                                    <option value="monthly">月繳</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 保障期間 */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">保障期間</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    投保日期 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    到期日 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* 保單文件 */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">保單文件</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                上傳保單 PDF
                            </label>
                            {documentUrl ? (
                                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <FileText className="w-5 h-5 text-green-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-green-900">{documentName}</p>
                                        <a
                                            href={documentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-green-600 hover:underline"
                                        >
                                            查看檔案
                                        </a>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDocumentUrl('');
                                            setDocumentName('');
                                        }}
                                        className="text-sm text-red-600 hover:text-red-700"
                                    >
                                        移除
                                    </button>
                                </div>
                            ) : uploadingFile ? (
                                <div className="p-6 border-2 border-blue-300 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                        <span className="text-sm font-medium text-blue-900">
                                            上傳中... {uploadProgress}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">點擊上傳 PDF 檔案</p>
                                    <p className="text-xs text-gray-400 mt-1">最大 10MB</p>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* 備註 */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">備註</h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="其他說明..."
                        />
                    </div>

                    {/* 按鈕 */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    儲存中...
                                </>
                            ) : (
                                '儲存保單'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            取消
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PolicyModal;
