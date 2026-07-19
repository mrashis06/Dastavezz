import { DocumentAnalysis } from '@/templates/types';

/**
 * Analyzes markdown or plain text to extract structural elements (headings, paragraphs, lists, contact info).
 */
export function analyzeDocument(content: string): DocumentAnalysis {
  if (!content || !content.trim()) {
    return {
      title: 'Untitled Document',
      headings: [],
      paragraphs: [],
      lists: [],
      contactInfo: {},
      hasStructure: false,
    };
  }

  const lines = content.split('\n');
  const headings: { level: number; text: string }[] = [];
  const paragraphs: string[] = [];
  const lists: string[][] = [];
  let currentList: string[] = [];

  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}/;

  let nameMatch: string | undefined;
  let emailMatch: string | undefined;
  let phoneMatch: string | undefined;

  // Extract contact info
  const emailFound = content.match(emailRegex);
  if (emailFound) emailMatch = emailFound[0];

  const phoneFound = content.match(phoneRegex);
  if (phoneFound && phoneFound[0].length >= 8) phoneMatch = phoneFound[0];

  let potentialTitle = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (currentList.length > 0) {
        lists.push([...currentList]);
        currentList = [];
      }
      continue;
    }

    // Heading match
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (currentList.length > 0) {
        lists.push([...currentList]);
        currentList = [];
      }
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      headings.push({ level, text });
      if (level === 1 && !potentialTitle) {
        potentialTitle = text;
      }
      continue;
    }

    // List match
    const listMatch = line.match(/^([*-]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      currentList.push(listMatch[2].trim());
      continue;
    }

    // Paragraph
    if (currentList.length > 0) {
      lists.push([...currentList]);
      currentList = [];
    }
    paragraphs.push(line);

    // If no title yet, check if first non-empty line could be a name
    if (!nameMatch && i < 3 && line.length < 40 && !line.includes('@')) {
      nameMatch = line.replace(/[#*`]/g, '').trim();
    }
  }

  if (currentList.length > 0) {
    lists.push([...currentList]);
  }

  return {
    title: potentialTitle || nameMatch || 'Untitled Document',
    headings,
    paragraphs,
    lists,
    contactInfo: {
      name: nameMatch,
      email: emailMatch,
      phone: phoneMatch,
    },
    hasStructure: headings.length > 0 || lists.length > 0,
  };
}
