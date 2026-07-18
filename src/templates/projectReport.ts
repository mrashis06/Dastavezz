import { DocumentTemplate } from '../types';

export const projectReportTemplate: DocumentTemplate = {
  id: 'project-report',
  name: 'Project Report',
  description: 'An executive-level progress report template complete with sections and tables.',
  defaultTitle: 'Q2_Project_Report',
  content: `# Project Dastavezz: Q2 Progress Report

**Prepared by:** [Project Management Office]  
**Date:** July 18, 2026  
**Status:** Green (On Track)

---

## 1. Executive Summary
This report summarizes the operational developments, engineering achievements, and upcoming milestones for **Project Dastavezz** during the second quarter of fiscal year 2026. Overall, development velocity remains high, and key deliverables are on schedule.

## 2. Project Objectives
Our primary goal is to establish a modular, scalable AI-powered Document Workspace. The target metrics for this release are:
- **System Latency**: Under 250ms for text rendering.
- **Conversion Accuracy**: 99.8% preservation of markdown elements to PDF/DOCX layouts.
- **AI Assist Processing Speed**: Under 2.0s response time from the Gemini interface.

## 3. Key Metrics & Status Update

| Milestone | Target Date | Actual Date | Status |
| :--- | :--- | :--- | :--- |
| Core Boilerplate | July 15, 2026 | July 18, 2026 | Complete |
| Workspace UI Layout | July 20, 2026 | July 18, 2026 | Complete |
| Firebase Integration | August 5, 2026 | Pending | Scheduled |
| Gemini API Connect | August 10, 2026 | Pending | Scheduled |
| PDF/DOCX Exporters | August 20, 2026 | Pending | Scheduled |

## 4. Key Engineering Accomplishments
- **Modular Directory Scaffolding**: Setup the standard \`src/\` layout with standalone component, hook, and service domains.
- **Theme Definition**: Tailored custom CSS styles mapping tailwind tokens to support modern dark/light gradients and responsive grid viewports.
- **Responsive Workspace Panels**: Built interactive panels for file editing and real-time previews to simulate a professional IDE environment.

## 5. Upcoming Milestones & Risks
### Risks
- **Rate Limits**: Connecting to Google Gemini API might require rate-limit handling on peak concurrent users.
- **Formatting Nuances**: PDF layout compilation can differ depending on local typography settings.

### Next Steps
1. Configure Firebase App settings for real-time document sync.
2. Formulate prompts for the Gemini document improvement service.
3. Incorporate standard export packages (\`jspdf\`, \`docx\`) inside the exporter hook.
`
};
