// OpenRouter provider for AI SDK (optional path to test reasoning streaming)
// Requires: @openrouter/ai-sdk-provider (added in package.json)
// Usage: import { orProvider } from '@lib/openrouter-provider';
//        const model = orProvider(MINI_MODEL)

import { createOpenRouter, openrouter as defaultOpenRouter } from '@openrouter/ai-sdk-provider';

export function getOpenRouterProvider() {
  const apiKey = (import.meta as any).env?.VITE_OPENROUTER_API_KEY;
  if (apiKey) {
    return createOpenRouter({
      apiKey,
      // extraBody: can be used to set defaults like reasoning
    });
  }
  // fallback to default instance (expects env at runtime)
  return defaultOpenRouter;
}

export const orProvider = getOpenRouterProvider();

