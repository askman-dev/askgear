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
  GPT4O_MINI: 'openai/gpt-4o-mini',
  CLAUDE_SONNET: 'anthropic/claude-3.5-sonnet',
  GEMINI_FLASH: 'google/gemini-flash-1.5',
  LLAMA_3: 'meta-llama/llama-3.2-3b-instruct:free'
};

// Default model for MVP
export const DEFAULT_MODEL = MODELS.GPT4O_MINI;