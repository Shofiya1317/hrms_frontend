import { GoogleGenAI, Type } from '@google/genai';

/**
 * Safely read required env variables
 */
function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

/**
 * Initialize AI client (SERVER SIDE ONLY)
 */
const ai = new GoogleGenAI({
  apiKey: getRequiredEnv('API_KEY'),
});

/**
 * Types (optional but recommended)
 */
type CarbonEntry = {
  description: string;
  totalKgCO2e: number;
};

type CarbonInsightsResponse = {
  insights: {
    title: string;
    suggestion: string;
    impact: string;
  }[];
};

/**
 * Generate carbon reduction insights
 */
export async function getCarbonInsights(
  entries: CarbonEntry[],
): Promise<CarbonInsightsResponse> {
  const summaryText = entries
    .map(
      (e) => `${e.description}: ${e.totalKgCO2e.toFixed(2)} kgCO2e`,
    )
    .join(', ');

  const response = await ai.models.generateContent({
    // ✅ valid model
    model: 'gemini-2.0-flash',

    contents: `Analyze this carbon footprint data for an organization: ${summaryText}. Provide 3 specific reduction strategies based on DEFRA 2025 best practices. Return in JSON format.`,

    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          insights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                suggestion: { type: Type.STRING },
                impact: { type: Type.STRING },
              },
              required: ['title', 'suggestion', 'impact'],
            },
          },
        },
        required: ['insights'],
      },
    },
  });

  // ✅ Type-safe guard
  if (!response.text) {
    throw new Error('Empty AI response');
  }

  return JSON.parse(response.text);
}

/**
 * Audit single calculation
 */
export async function auditCalculation(
  category: string,
  subType: string,
  value: number,
): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',

    contents: `As a carbon audit expert using DEFRA 2025 factors, verify if a calculation for ${value} units of ${subType} in the ${category} category seems reasonable for an SME. Provide a one sentence expert validation.`,
  });

  return response.text ?? 'No response from AI';
}
