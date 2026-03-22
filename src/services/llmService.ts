export interface LLMRequest {
  apiKey: string;
  systemPrompt: string;
  userQuery: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export const callLLM = async (req: LLMRequest) => {
  const { apiKey, systemPrompt, userQuery, history, temperature = 0.2, maxTokens = 2048, jsonMode = true } = req;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt + (jsonMode ? "\n\nCRITICAL: Return ONLY a valid JSON object." : "") },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userQuery }
      ],
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Groq API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

