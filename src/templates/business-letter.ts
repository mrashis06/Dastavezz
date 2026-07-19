import { SmartTemplateConfig } from './types';

export const businessLetterConfig: SmartTemplateConfig = {
  id: 'business-letter',
  name: 'Business Letter',
  description: 'Formal corporate correspondence format with date, salutation, body, and closing.',
  category: 'business',
  defaultTitle: 'Formal Business Letter',
  promptInstruction: `
You are a executive communications officer. Convert the provided input document into a formal Business Letter in Markdown.

Structure Guidelines:
1. SENDER INFO: Sender Name / Address / Contact at top right or left.
2. DATE: Current date line.
3. RECIPIENT INFO: Recipient Name, Title, Company Name, Address.
4. SALUTATION: Dear [Recipient Name/Title],
5. BODY: Clear, professional paragraphs stating purpose, key points, and next steps.
6. CLOSING: "Sincerely," or "Best regards," followed by Sender Name and Title.

Preserve 100% of the user's message, facts, names, and intent. Do NOT change core facts.
  `.trim(),
  styles: {
    typography: {
      fontFamily: 'Georgia, serif',
      baseFontSize: 'base',
      headingScale: '1.2',
    },
    hierarchy: {
      h1: 'text-xl font-bold uppercase tracking-tight border-b pb-2 mb-4',
      h2: 'text-base font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2',
      h3: 'text-sm font-semibold text-slate-700 dark:text-slate-300',
    },
    layout: {
      pageSize: 'Letter',
      margins: 'standard',
      sectionSpacing: '1.5rem',
      lineHeight: '1.625',
      alignment: 'left',
    },
    elements: {
      headerStyle: 'mb-6 text-left',
      footerStyle: 'mt-8 border-t pt-4 text-xs text-slate-400',
      listStyle: 'list-disc pl-5 space-y-1 my-3',
      accentColor: '#10B981',
    },
  },
  sampleContent: `**John Smith**
Managing Director
Acme Corporation
100 Corporate Parkway, Suite 400
New York, NY 10001

October 24, 2026

**Ms. Jane Doe**
Vice President of Strategic Partnerships
Global Enterprises Ltd.
500 Financial Plaza
Chicago, IL 60601

**Subject: Formal Proposal for Enterprise Software Integration**

Dear Ms. Doe,

I am writing to formally submit our proposal regarding the integration of Acme Corporation’s document workflow engine into Global Enterprises’ current IT ecosystem.

Following our recent discussions, our engineering team has outlined a phased implementation plan designed to minimize downtime while optimizing data throughput:

1. **Phase 1 — Initial Setup & API Connection:** Secure authentication and credential handshake configuration.
2. **Phase 2 — System Migration:** Automated migration of legacy document databases into modern Firestore architecture.
3. **Phase 3 — Quality Assurance & Launch:** Rigorous load testing and staff onboarding workshops.

We are confident that this collaboration will increase operational efficiency by over 35% within the first quarter of deployment.

Please review the attached project milestones. Should you have any questions or require further adjustments, please do not hesitate to contact me directly at (555) 019-3829.

Thank you for your time and consideration. We look forward to a successful partnership.

Sincerely,

**John Smith**
Managing Director
Acme Corporation
`.trim(),
};
