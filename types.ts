
export enum ViewState {
  HOME = 'HOME',
  DEMO = 'DEMO',
  AGENT = 'AGENT'
}

export interface PdfPage {
  pageNumber: number;
  content: string;
}

export interface StructuredResponse {
  status: 'analysis' | 'clarification';
  response: string;
  checklist?: string[];
  key_points?: string[];
  warning?: string;
  original_terms?: string;
  follow_up?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  guidance?: string[];
  structuredData?: StructuredResponse;
  suggestedQuestions?: string[];  // AI 建議的後續問題
}

export interface UploadedDocument {
  id: string;
  name: string;
  pages: PdfPage[];
  fullText: string;
  fileUrl: string;
  chatHistory: Message[];
  suggestedQuestions?: string[];
  summary?: string;
}

export interface ResearchMetric {
  label: string;
  value: string;
  description: string;
}

// Agent Mode Types
export type PolicyStatus = 'active' | 'expiring_soon' | 'expired';
export type PolicyType = 'main' | 'rider'; // 主約/附約
export type Currency = 'TWD' | 'USD' | 'CNY' | 'HKD';
export type PaymentFrequency = 'annual' | 'semiannual' | 'quarterly' | 'monthly';

export interface Policy {
  id: string;
  policyNumber: string;
  policyName: string;
  insuranceCompany: string;
  coverageType: string; // 醫療/壽險/意外/車險等

  // 保單類型
  policyType: PolicyType; // 主約/附約
  parentPolicyId?: string; // 如果是附約,關聯的主約 ID

  // 費用資訊
  premium: number;
  currency: Currency; // 幣別
  paymentFrequency: PaymentFrequency; // 繳費頻率

  // 期間
  startDate: Date;
  endDate: Date;
  status: PolicyStatus;

  // 文件
  documentUrl?: string; // 保單檔案 URL
  documentName?: string; // 檔案名稱

  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  policies: Policy[];
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}
