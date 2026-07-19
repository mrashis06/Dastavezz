import { SmartTemplatesRegistry } from '@/templates';
import { formatWithRuleEngine } from './templateFormatter';

export interface TransformationResult {
  content: string;
  templateId: string;
  templateName: string;
  isAI: boolean;
  error?: string;
}

/**
 * Transforms document content into the layout structure of a selected template.
 * Uses Gemini AI custom prompt if possible; falls back to rule engine formatting on network error.
 */
export async function transformDocumentWithTemplate(
  content: string,
  templateId: string,
  useAI = true
): Promise<TransformationResult> {
  const config = SmartTemplatesRegistry.getById(templateId);
  const templateName = config?.name || templateId;

  if (!content || !content.trim()) {
    return {
      content: config?.sampleContent || '',
      templateId,
      templateName,
      isAI: false,
    };
  }

  if (useAI && config) {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'custom',
          text: content,
          command: `${config.promptInstruction}\n\nIMPORTANT: Return ONLY the transformed Markdown text. Do NOT include markdown wrap backticks (\`\`\`markdown) around the response. Do NOT add meta commentary.`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.content) {
          let cleanedContent = data.content.trim();
          // Remove backticks if model wrapped response in ```markdown ... ```
          cleanedContent = cleanedContent.replace(/^```markdown\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
          return {
            content: cleanedContent,
            templateId,
            templateName,
            isAI: true,
          };
        }
      }
    } catch (err) {
      console.warn('[SmartTemplateEngine] AI transformation failed, falling back to rule engine:', err);
    }
  }

  // Rule-based fallback transformation
  const ruleFormatted = formatWithRuleEngine(content, templateId);
  return {
    content: ruleFormatted,
    templateId,
    templateName,
    isAI: false,
  };
}
