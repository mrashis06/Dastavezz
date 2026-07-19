import { DocumentTemplate } from '../types';
import { SmartTemplateConfig } from './types';
import { resumeTemplateConfig } from './resume';
import { businessLetterConfig } from './business-letter';
import { projectReportConfig } from './project-report';

export * from './types';
export { resumeTemplateConfig, businessLetterConfig, projectReportConfig };

/**
 * Registry of all available Smart Template configurations
 */
export class SmartTemplatesRegistry {
  public static readonly templates: SmartTemplateConfig[] = [
    resumeTemplateConfig,
    businessLetterConfig,
    projectReportConfig,
  ];

  public static getById(id: string): SmartTemplateConfig | undefined {
    return this.templates.find((t) => t.id === id);
  }
}

/**
 * Backward-compatible DocumentTemplate array for legacy views
 */
export const templates: DocumentTemplate[] = SmartTemplatesRegistry.templates.map((t) => ({
  id: t.id,
  name: t.name,
  description: t.description,
  defaultTitle: t.defaultTitle,
  content: t.sampleContent,
}));
