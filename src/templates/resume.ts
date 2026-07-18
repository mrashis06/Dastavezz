import { DocumentTemplate } from '../types';

export const resumeTemplate: DocumentTemplate = {
  id: 'resume',
  name: 'Professional Resume',
  description: 'A clean, modern markdown layout for professional resumes and CVs.',
  defaultTitle: 'My_Resume',
  content: `# John Doe
**Senior Frontend Engineer** | +1 (555) 019-2834 | john.doe@email.com | github.com/johndoe

---

## Executive Summary
Results-driven software engineer with 5+ years of experience building scalable web applications. Specialized in TypeScript, React, and Next.js, with a proven track record of optimizing page speeds, enhancing user experience, and leading technical teams.

## Work Experience

### **Senior Software Engineer** — TechVanguard Solutions
*Jan 2024 - Present | San Francisco, CA*
- Orchestrated the migration of a legacy dashboard to **Next.js 15**, improving core web vitals by 35% and boosting SEO rankings.
- Spearheaded a reusable UI component library using **Tailwind CSS**, reducing team-wide feature implementation time by 20%.
- Mentored 4 junior engineers and introduced strict code review guidelines, leading to a 15% reduction in production hotfixes.

### **Software Engineer** — Innovate Labs
*Mar 2021 - Dec 2023 | Seattle, WA*
- Developed dynamic data visualization dashboards utilizing React and Chart.js, rendering datasets with over 50,000 nodes smoothly.
- Implemented state-of-the-art authentication flows using Firebase Auth, securing APIs and reducing signup drop-off by 10%.
- Streamlined CI/CD pipelines, decreasing code deployment build times by 8 minutes per release cycle.

## Education

### **B.S. in Computer Science**
*University of Washington | 2017 - 2021*
- **GPA**: 3.8/4.0
- **Honors**: Magna Cum Laude, Dean's List (all semesters)

## Technical Skills
- **Languages**: TypeScript, JavaScript, HTML5, CSS3, SQL
- **Frameworks & Libraries**: React, Next.js, Node.js, Express, Tailwind CSS
- **Tools & Platforms**: Firebase, Git, Docker, AWS (S3, EC2), Vercel
`
};
