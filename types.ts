
export enum ViewState {
  HOME = 'HOME',
  DEMO = 'DEMO',
  ABOUT = 'ABOUT',
  AGENT_DASHBOARD = 'AGENT_DASHBOARD',
  DOCS = 'DOCS'
}

export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

export interface PolicyChunk {
  id: string;
  company: string;
  policyName: string;
  sectionTitle: string;
  content: string;
  type: 'Health' | 'Auto' | 'Life' | 'Accident';
}

export interface PdfPage {
  pageNumber: number;
  content: string;
}

export interface StructuredResponse {
  status: 'analysis' | 'clarification'; // New: Distinguish between final advice and asking for more info
  response: string;
  checklist?: string[];
  key_points?: string[];
  warning?: string;
  original_terms?: string;
  follow_up?: string; // New: Specific question to ask the user
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  retrievedChunks?: PolicyChunk[];
  guidance?: string[];
  structuredData?: StructuredResponse;
}

export interface UploadedDocument {
  id: string;
  name: string;
  pages: PdfPage[];
  fullText: string;
  fileUrl: string;
  chatHistory: Message[];
  suggestedQuestions?: string[]; // New: Store AI-generated questions for this document
}

export interface ResearchMetric {
  label: string;
  value: string;
  description: string;
}

// Agent / CRM Related Types
export interface ClientSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastInteraction: string;
  policyCount: number;
  riskStatus: 'Low' | 'Medium' | 'High';
  tags: string[];
  notes: string;
  mockPolicies: { name: string; type: string; coverage: string }[];
}