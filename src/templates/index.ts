import { DocumentTemplate } from '../types';
import { resumeTemplate } from './resume';
import { businessLetterTemplate } from './businessLetter';
import { projectReportTemplate } from './projectReport';

export const templates: DocumentTemplate[] = [
  resumeTemplate,
  businessLetterTemplate,
  projectReportTemplate
];

export { resumeTemplate, businessLetterTemplate, projectReportTemplate };
