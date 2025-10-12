import { createOpenAI } from '@ai-sdk/openai';

// Create OpenRouter client
export const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://askgear.app',
    'X-Title': 'AskGear'
  }
});

// Available models via OpenRouter
export const MODELS = {
  DEFAULT: (import.meta as any).env?.DEFAULT_MODEL || (import.meta as any).env?.VITE_DEFAULT_MODEL || 'openai/gpt-5-chat',
  MINI: (import.meta as any).env?.MINI_MODEL || (import.meta as any).env?.VITE_MINI_MODEL || 'openai/gpt-5-mini',
};

// Export convenient constants
export const DEFAULT_MODEL = MODELS.DEFAULT;
export const MINI_MODEL = MODELS.MINI;
