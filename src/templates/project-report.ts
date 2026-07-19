import { SmartTemplateConfig } from './types';

export const projectReportConfig: SmartTemplateConfig = {
  id: 'project-report',
  name: 'Project Report',
  description: 'Structured technical or business report with executive summary, methodology, and findings.',
  category: 'report',
  defaultTitle: 'Technical Project Report',
  promptInstruction: `
You are a senior technical writer. Convert the provided input document into a structured Markdown Project Report.

Structure Guidelines:
1. TITLE & METADATA: # Report Title, Subtitle, Author, Date, Status.
2. EXECUTIVE SUMMARY: > Executive summary block or blockquote (# Executive Summary).
3. INTRODUCTION: ## 1. Introduction (Background and Objectives).
4. METHODOLOGY & SYSTEM ARCHITECTURE: ## 2. System Architecture & Methodology.
5. FINDINGS & ANALYSIS: ## 3. Key Findings & Performance Analysis.
6. CONCLUSION & RECOMMENDATIONS: ## 4. Conclusion & Next Steps.

Preserve 100% of the user's data, metrics, code snippets, numbers, and facts. Do NOT change data.
  `.trim(),
  styles: {
    typography: {
      fontFamily: 'Roboto, sans-serif',
      baseFontSize: 'base',
      headingScale: '1.3',
    },
    hierarchy: {
      h1: 'text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight border-b pb-2 mb-4',
      h2: 'text-lg font-bold text-amber-600 dark:text-amber-400 mt-6 mb-3 border-l-4 border-amber-500 pl-3',
      h3: 'text-base font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2',
    },
    layout: {
      pageSize: 'A4',
      margins: 'standard',
      sectionSpacing: '1.75rem',
      lineHeight: '1.6',
      alignment: 'left',
    },
    elements: {
      headerStyle: 'border-b-2 pb-4 mb-6',
      footerStyle: 'mt-12 border-t pt-4 text-xs text-slate-400 flex justify-between',
      listStyle: 'list-decimal pl-5 space-y-1.5 my-3',
      accentColor: '#D97706',
    },
  },
  sampleContent: `# Project Titan: Next-Generation Document Processing Engine

**Prepared by:** Engineering Systems Team  
**Date:** October 2026  
**Status:** Approved for Production  

> **Executive Summary:** Project Titan successfully modernized the document processing pipeline, reducing average document conversion latency from 3.4 seconds to 450 milliseconds while ensuring zero data loss and 99.99% uptime compliance.

---

## 1. Introduction

### 1.1 Project Overview
The objective of Project Titan was to rebuild legacy monolithic text parsers into a modular microservices platform capable of real-time AI transformations and automated PDF/DOCX exports.

### 1.2 Key Objectives
- Achieve sub-second document transformation speed.
- Support rule-based and AI-powered smart layout adaptation.
- Maintain full backward compatibility with existing document schemas.

---

## 2. System Architecture

The new pipeline utilizes a three-tier decoupled architecture:
1. **Frontend / UI Tier:** Built on Next.js 16, React 19, and Tailwind CSS.
2. **Analysis Engine:** Client-side document parser evaluating heading hierarchies and block node boundaries.
3. **AI Transformation Service:** Asynchronous integration with Google Gemini 3.5 Flash API.

---

## 3. Performance Analysis & Findings

Load tests were conducted over a 48-hour benchmark window with 10,000 concurrent simulated document operations:

- **Mean Latency:** 420 ms
- **99th Percentile Latency:** 890 ms
- **Error Rate:** 0.00%
- **Memory Consumption:** Reduced by 38% compared to legacy stack

---

## 4. Conclusion & Next Steps

Project Titan has met all operational criteria and is fully ready for global rollout.

### Immediate Action Items:
1. Deploy updated microservices to production environment.
2. Enable real-time telemetry monitoring.
3. Schedule team training session for operational support staff.
`.trim(),
};
