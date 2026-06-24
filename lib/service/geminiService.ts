export async function getCarbonInsights(entries: unknown[]): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Analyze the following carbon emission entries and provide insights:\n${JSON.stringify(entries, null, 2)}`,
              },
            ],
          },
        ],
      }),
    },
  );

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No insights available';
}

export async function auditCalculation(
  category: string,
  subType: string,
  value: number,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Audit the following carbon emission calculation:\nCategory: ${category}\nSub-type: ${subType}\nValue: ${value}\nProvide a brief audit assessment.`,
              },
            ],
          },
        ],
      }),
    },
  );

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No audit result available';
}
