import { DocumentTemplate } from '../types';
import { resumeTemplate } from './resume';
import { businessLetterTemplate } from './businessLetter';
import { projectReportTemplate } from './projectReport';
import { coverLetterTemplate } from './coverLetter';

export const templates: DocumentTemplate[] = [
  resumeTemplate,
  businessLetterTemplate,
  projectReportTemplate,
  coverLetterTemplate
];

export { resumeTemplate, businessLetterTemplate, projectReportTemplate, coverLetterTemplate };
