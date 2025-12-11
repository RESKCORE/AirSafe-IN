import { DEFAULT_SYSTEM_INSTRUCTION } from '../constants';

export interface ConversationTurn {
  role: 'user' | 'model';
  text: string;
}

// Gemini API key from environment variable (set in Vercel dashboard)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const isApiKeyConfigured = Boolean(apiKey && apiKey !== 'undefined');
const DEFAULT_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
const API_VERSION = 'v1beta';
const getEndpoint = (model: string) =>
  `https://generativelanguage.googleapis.com/${API_VERSION}/models/${model}:generateContent`;

const buildContentsPayload = (conversation: ConversationTurn[]) => {
  return conversation.map((turn) => ({
    role: turn.role,
    parts: [{ text: turn.text }],
  }));
};

export const isGeminiConfigured = () => isApiKeyConfigured;

export const sendMessageToGemini = async (
  conversation: ConversationTurn[],
  systemInstruction?: string
): Promise<string> => {
  if (!isApiKeyConfigured || !apiKey) {
    throw new Error("Missing GEMINI_API_KEY. Add it to your .env.local file and restart the dev server.");
  }

  const endpoint = getEndpoint(DEFAULT_MODEL);

  const payload = {
    contents: buildContentsPayload(conversation),
    systemInstruction: {
      role: 'system',
      parts: [{ text: systemInstruction || DEFAULT_SYSTEM_INSTRUCTION }],
    },
  };

  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = `Gemini request failed (${response.status})`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.error?.message || errorMessage;
    } catch (err) {
      console.error('Unable to parse Gemini error response', err);
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  const textOutput = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text)
    .filter((value: string | undefined) => Boolean(value))
    .join('\n')
    ?.trim();

  if (!textOutput) {
    throw new Error('Gemini response did not include any text output.');
  }

  return textOutput;
};
