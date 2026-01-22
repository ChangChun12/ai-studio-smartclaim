
export enum ViewState {
  HOME = 'HOME',
  DEMO = 'DEMO'
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
