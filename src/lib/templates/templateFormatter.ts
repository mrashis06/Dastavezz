import { analyzeDocument } from './templateAnalyzer';
import { SmartTemplatesRegistry } from '@/templates';

/**
 * Deterministically formats raw text into a target template structure using rule-based layout rules.
 * Serves as an instant transformation fallback when AI API is unavailable or offline.
 */
export function formatWithRuleEngine(content: string, templateId: string): string {
  if (!content || !content.trim()) {
    const config = SmartTemplatesRegistry.getById(templateId);
    return config ? config.sampleContent : '';
  }

  const analysis = analyzeDocument(content);
  const { title, headings, paragraphs, lists, contactInfo } = analysis;

  if (templateId === 'resume') {
    return formatAsResume(title, paragraphs, lists, contactInfo, headings);
  } else if (templateId === 'business-letter') {
    return formatAsBusinessLetter(title, paragraphs, lists, contactInfo);
  } else if (templateId === 'project-report') {
    return formatAsProjectReport(title, paragraphs, lists, headings);
  }

  return content;
}

function formatAsResume(
  title: string,
  paragraphs: string[],
  lists: string[][],
  contact: { name?: string; email?: string; phone?: string },
  headings: { level: number; text: string }[]
): string {
  const name = contact.name || title || 'YOUR NAME';
  const contactLine = [contact.email, contact.phone, 'Location']
    .filter(Boolean)
    .join(' | ');

  let output = `# ${name.toUpperCase()}\n${contactLine}\n\n`;

  if (paragraphs.length > 0) {
    output += `## Professional Summary\n${paragraphs[0]}\n\n`;
  }

  output += `## Key Qualifications & Experience\n\n`;

  // Render lists or remaining paragraphs
  if (lists.length > 0) {
    lists.forEach((list) => {
      list.forEach((item) => {
        output += `- ${item}\n`;
      });
      output += '\n';
    });
  }

  if (paragraphs.length > 1) {
    output += `## Additional Details\n\n`;
    paragraphs.slice(1).forEach((p) => {
      output += `${p}\n\n`;
    });
  }

  return output.trim();
}

function formatAsBusinessLetter(
  title: string,
  paragraphs: string[],
  lists: string[][],
  contact: { name?: string; email?: string; phone?: string }
): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  let output = `**${contact.name || 'Sender Name'}**\n`;
  if (contact.email) output += `${contact.email}\n`;
  if (contact.phone) output += `${contact.phone}\n`;
  output += `\n${dateStr}\n\n`;

  output += `**Recipient Name / Organization**\nRecipient Address Line\n\n`;
  output += `**Subject: ${title !== 'Untitled Document' ? title : 'Formal Business Communication'}**\n\n`;
  output += `Dear Recipient,\n\n`;

  if (paragraphs.length > 0) {
    paragraphs.forEach((p) => {
      output += `${p}\n\n`;
    });
  } else {
    output += `Please accept this correspondence regarding our formal business matters.\n\n`;
  }

  if (lists.length > 0) {
    lists.forEach((list) => {
      list.forEach((item) => {
        output += `- ${item}\n`;
      });
      output += '\n';
    });
  }

  output += `Thank you for your time and consideration.\n\nSincerely,\n\n**${contact.name || 'Sender Name'}**`;

  return output.trim();
}

function formatAsProjectReport(
  title: string,
  paragraphs: string[],
  lists: string[][],
  headings: { level: number; text: string }[]
): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  let output = `# ${title || 'Technical Project Report'}\n\n`;
  output += `**Date:** ${dateStr}  \n**Status:** Final Draft  \n\n`;

  if (paragraphs.length > 0) {
    output += `> **Executive Summary:** ${paragraphs[0]}\n\n---\n\n`;
  } else {
    output += `> **Executive Summary:** Overview and findings of the project document.\n\n---\n\n`;
  }

  output += `## 1. Introduction & Objectives\n\n`;
  const bodyParagraphs = paragraphs.length > 1 ? paragraphs.slice(1) : paragraphs;

  if (bodyParagraphs.length > 0) {
    output += `${bodyParagraphs[0]}\n\n`;
  }

  output += `## 2. Key Details & Methodology\n\n`;

  if (bodyParagraphs.length > 1) {
    bodyParagraphs.slice(1).forEach((p) => {
      output += `${p}\n\n`;
    });
  }

  if (lists.length > 0) {
    lists.forEach((list) => {
      list.forEach((item, idx) => {
        output += `${idx + 1}. ${item}\n`;
      });
      output += '\n';
    });
  }

  output += `## 3. Conclusion & Recommendations\n\n`;
  output += `Based on the findings outlined above, all project objectives have been evaluated and approved for implementation.`;

  return output.trim();
}
