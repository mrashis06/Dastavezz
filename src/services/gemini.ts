import { GeminiResponse } from '../types';

/**
 * Helper function to post request to /api/gemini route.
 */
async function postToGeminiApi(action: 'improve' | 'rewrite' | 'summarize' | 'title', text: string): Promise<GeminiResponse> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, text }),
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
export const improveDocument = async (text: string): Promise<GeminiResponse> => {
  return postToGeminiApi('improve', text);
};

/**
 * Function to rewrite documents in a business-appropriate, formal tone via Gemini API.
 */
export const rewriteProfessionally = async (text: string): Promise<GeminiResponse> => {
  return postToGeminiApi('rewrite', text);
};

/**
 * Function to extract an executive summary, bullet points, and word counts via Gemini API.
 */
export const summarizeDocument = async (text: string): Promise<GeminiResponse> => {
  return postToGeminiApi('summarize', text);
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
