import { DocumentTemplate } from '../types';

export const businessLetterTemplate: DocumentTemplate = {
  id: 'business-letter',
  name: 'Business Letter',
  description: 'A formal letter layout adhering to standard professional correspondence conventions.',
  defaultTitle: 'Formal_Letter',
  content: `**[Your Name]**
[Your Title]
[Your Company/Organization]
[Street Address]
[City, State, Zip Code]
[Your Email]
[Your Phone Number]

July 18, 2026

**[Recipient Name]**
[Recipient Title]
[Recipient Company/Organization]
[Street Address]
[City, State, Zip Code]

---

### Subject: [Clear, Concise Subject Line]

Dear **[Recipient Name]**,

I am writing to you today regarding **[Primary Purpose of Letter]**. On behalf of [Your Company/Organization], we are excited to outline the details of our upcoming partnership proposal and schedule a formal discussion at your earliest convenience.

As we discussed in our preliminary meeting, our key objectives are to streamline product distribution pipelines and reduce overhead operational costs. We believe that integrating our software infrastructure will yield a mutually beneficial outcome for both of our user bases.

Specifically, we propose the following timeline:
- **Phase 1: Integration Assessment** — Completing technical discovery by August 15th.
- **Phase 2: Pilot Rollout** — Deploying to a select staging environment by September 30th.
- **Phase 3: Full Release** — Official public rollout target date of November 1st.

Please review the attached contract drafts, and let us know if there are any clauses you would like to negotiate or expand upon. I am available for a brief virtual sync next Tuesday morning if that fits your schedule.

Thank you for your time, consideration, and continued collaboration.

Sincerely,

*(Signature)*

**[Your Name]**
[Your Title]
[Your Company/Organization]
`
};
