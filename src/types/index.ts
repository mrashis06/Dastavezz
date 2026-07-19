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
  pageSize: 'A4' | 'Letter' | 'Legal' | 'A3' | 'A5' | 'B5';
  orientation: 'portrait' | 'landscape';
  margins: 'standard' | 'narrow' | 'wide' | 'custom';
  customMargins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  fontSize: 'sm' | 'base' | 'lg';
  theme: 'professional' | 'minimal' | 'academic';
}

export interface AIDocumentContext {
  template: string | null;
  title: string;
  content: string;
  selectedText?: string;
  wordCount: number;
}

import { Timestamp } from 'firebase/firestore';

export interface DocumentVersion {
  id: string;
  timestamp: Timestamp | null;
  action: string;
  content: string;
  title: string;
  previewSnippet: string;
  authorName?: string;
}

export interface UserProfile {
  fullName: string;
  email: string | null;
  provider: 'email' | 'google';
  emailVerified: boolean;
  avatar: string | null;
  createdAt: any;
  updatedAt: any;
}
