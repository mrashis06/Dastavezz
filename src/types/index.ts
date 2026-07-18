export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  defaultTitle: string;
  content: string;
}

export interface GeminiResponse {
  success: boolean;
  content: string;
  error?: string;
}

export interface ExportSettings {
  pageSize: 'A4' | 'Letter';
  margins: 'standard' | 'narrow' | 'wide';
  fontSize: 'sm' | 'base' | 'lg';
  theme: 'professional' | 'minimal' | 'academic';
}
