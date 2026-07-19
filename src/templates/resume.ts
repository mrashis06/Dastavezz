import { SmartTemplateConfig } from './types';

export const resumeTemplateConfig: SmartTemplateConfig = {
  id: 'resume',
  name: 'Professional Resume',
  description: 'Clean, modern ATS-friendly layout for professional resumes and CVs.',
  category: 'resume',
  defaultTitle: 'Professional Resume',
  promptInstruction: `
You are a top-tier resume architect. Convert the provided input document into a clean, modern, ATS-friendly Markdown Resume.

Structure Guidelines:
1. HEADER: Header block with Name (# Full Name) centered or top-left, followed by contact details (email | phone | location | links).
2. SUMMARY: Executive summary section if applicable (## Professional Summary).
3. EXPERIENCE: ## Professional Experience (using ### Job Title | Company | Dates, followed by bulleted achievement points).
4. EDUCATION: ## Education (### Degree | Institution | Year).
5. SKILLS: ## Technical Skills (organized by category in bullet points).
6. PROJECTS: ## Featured Projects (if relevant).

Preserve 100% of the user's original facts, skills, jobs, and details. Do NOT invent fake experience.
  `.trim(),
  styles: {
    typography: {
      fontFamily: 'Inter, sans-serif',
      baseFontSize: 'base',
      headingScale: '1.25',
    },
    hierarchy: {
      h1: 'text-2xl font-bold uppercase tracking-tight',
      h2: 'text-base font-bold text-blue-600 dark:text-blue-400 border-b pb-1 uppercase tracking-wide',
      h3: 'text-sm font-semibold text-slate-800 dark:text-slate-200',
    },
    layout: {
      pageSize: 'A4',
      margins: 'narrow',
      sectionSpacing: '1.25rem',
      lineHeight: '1.5',
      alignment: 'left',
    },
    elements: {
      headerStyle: 'border-b pb-4 text-center',
      footerStyle: 'text-xs text-center text-slate-400',
      listStyle: 'list-disc pl-5 space-y-1',
      accentColor: '#2563EB',
    },
  },
  sampleContent: `# JOHN DOE
john.doe@example.com | (555) 019-2831 | San Francisco, CA | linkedin.com/in/johndoe

## Professional Summary
Results-driven Senior Software Engineer with 6+ years of experience designing high-throughput web applications and scalable cloud architecture. Proven track record in TypeScript, React, Next.js, and Distributed Systems.

## Professional Experience

### Senior Full Stack Engineer | TechCorp Inc.
*Jan 2022 – Present | San Francisco, CA*
- Architectural lead for core SaaS platform serving 500k+ monthly active users.
- Reduced database query latency by 45% through Redis caching strategies.
- Mentored junior engineers and led weekly code quality workshops.

### Frontend Developer | InnovateLabs
*Jun 2018 – Dec 2021 | San Jose, CA*
- Developed responsive React dashboard components used across 12 product lines.
- Implemented automated CI/CD pipeline reducing release deployment time by 60%.

## Technical Skills
- **Languages:** TypeScript, JavaScript, Python, Go, SQL, HTML5, CSS3
- **Frameworks:** React, Next.js, Node.js, Express, Tailwind CSS
- **Tools & Cloud:** Firebase, AWS, Docker, Git, CI/CD pipelines, Jest

## Education

### B.S. in Computer Science | University of California, Berkeley
*Graduated May 2018 | GPA: 3.8/4.0*
`.trim(),
};
