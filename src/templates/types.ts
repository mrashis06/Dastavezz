export interface TemplateStyleConfig {
  typography: {
    fontFamily: string;
    baseFontSize: 'sm' | 'base' | 'lg';
    headingScale: string;
  };
  hierarchy: {
    h1: string;
    h2: string;
    h3: string;
  };
  layout: {
    pageSize: 'A4' | 'Letter' | 'Legal';
    margins: 'standard' | 'narrow' | 'wide';
    sectionSpacing: string;
    lineHeight: string;
    alignment: 'left' | 'center' | 'justify';
  };
  elements: {
    headerStyle: string;
    footerStyle: string;
    listStyle: string;
    accentColor: string;
  };
}

export interface SmartTemplateConfig {
  id: 'resume' | 'business-letter' | 'project-report' | string;
  name: string;
  description: string;
  category: 'resume' | 'business' | 'report' | 'academic';
  defaultTitle: string;
  promptInstruction: string;
  styles: TemplateStyleConfig;
  sampleContent: string;
}

export interface DocumentAnalysis {
  title: string;
  headings: { level: number; text: string }[];
  paragraphs: string[];
  lists: string[][];
  contactInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  hasStructure: boolean;
}
