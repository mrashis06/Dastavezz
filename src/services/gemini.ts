import { GeminiResponse, AIDocumentContext } from '../types';

/**
 * Helper function to post request to /api/gemini route.
 */
async function postToGeminiApi(
  action: 'improve' | 'rewrite' | 'summarize' | 'title' | 'custom', 
  text: string,
  context?: AIDocumentContext,
  command?: string
): Promise<GeminiResponse> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, text, context, command }),
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! Status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData?.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Ignore JSON parse error on non-JSON response
    }
    throw new Error(errorMessage);
  }

  const data: GeminiResponse = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Gemini API returned an unsuccessful response.');
  }

  return data;
}

/**
 * Function to run document improvement queries via Gemini API.
 */
export const improveDocument = async (text: string, context?: AIDocumentContext): Promise<GeminiResponse> => {
  return postToGeminiApi('improve', text, context);
};

/**
 * Function to rewrite documents in a business-appropriate, formal tone via Gemini API.
 */
export const rewriteProfessionally = async (text: string, context?: AIDocumentContext): Promise<GeminiResponse> => {
  return postToGeminiApi('rewrite', text, context);
};

/**
 * Function to extract an executive summary, bullet points, and word counts via Gemini API.
 */
export const summarizeDocument = async (text: string, context?: AIDocumentContext): Promise<GeminiResponse> => {
  return postToGeminiApi('summarize', text, context);
};

/**
 * Function to suggest 5 relevant document titles via Gemini API based on rich context.
 */
export const suggestTitles = async (context: AIDocumentContext): Promise<string[]> => {
  if (!context || (!context.content.trim() && !context.selectedText?.trim())) {
    return ['Untitled Document'];
  }

  try {
    const response = await postToGeminiApi('title', context.content, context);
    if (response.success && response.content) {
      return response.content
        .split('\n')
        .map(line => line.replace(/^\d+[\.\)\s-]+/, '').trim().replace(/^["']|["']$/g, ''))
        .filter(line => line.length > 0)
        .slice(0, 5);
    }
    throw new Error('Title generation response did not contain content.');
  } catch (error) {
    console.error('Failed to generate titles with Gemini API:', error);
    // Fallback to local generation if API fails, so the user doesn't get blocked
    const sourceText = context.selectedText || context.content;
    const cleanText = sourceText.replace(/[#*`_-]/g, '').trim();
    const words = cleanText.split(/\s+/);
    const titleBase = words.slice(0, 3).join('_').substring(0, 24) || 'Untitled_Document';
    return [
      titleBase,
      `${titleBase}_Draft`,
      `My_${titleBase || 'Document'}`,
      `Refined_${titleBase || 'Document'}`,
      `Final_${titleBase || 'Document'}`
    ];
  }
};

/**
 * Function to suggest a short, relevant document title via Gemini API.
 * Falls back to local generation if the API call fails.
 */
export const generateTitle = async (text: string): Promise<string> => {
  if (!text || text.trim() === '') {
    return 'Untitled Document';
  }

  try {
    const response = await postToGeminiApi('title', text);
    if (response.success && response.content) {
      return response.content.trim().replace(/^["']|["']$/g, '');
    }
    throw new Error('Title generation response did not contain content.');
  } catch (error) {
    console.error('Failed to generate title with Gemini API:', error);
    // Fallback to local generation if API fails, so the user doesn't get blocked
    const cleanText = text.replace(/[#*`_-]/g, '').trim();
    const words = cleanText.split(/\s+/);
    const titleWords = words.slice(0, 3).join('_');
    return titleWords.substring(0, 24) || 'Untitled_Document';
  }
};

/**
 * Function to run custom instructions via Gemini API.
 */
export const runCustomCommand = async (
  text: string, 
  command: string, 
  context?: AIDocumentContext
): Promise<GeminiResponse> => {
  return postToGeminiApi('custom', text, context, command);
};
