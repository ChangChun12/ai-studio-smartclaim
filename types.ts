
export enum ViewState {
  HOME = 'HOME',
  DEMO = 'DEMO'
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
  suggestedQuestions?: string[];
}

export interface ResearchMetric {
  label: string;
  value: string;
  description: string;
}
