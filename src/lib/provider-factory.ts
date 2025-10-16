import { createOpenRouter, OpenRouter } from '@openrouter/ai-sdk-provider';
import type { ProviderSetting } from '@features/settings/types';
import { orProvider as defaultOrProvider } from './openrouter-provider';

/**
 * Creates an AI client instance based on the provided setting.
 * Falls back to the default built-in provider if the setting is null or unsupported.
 * @param setting The active provider setting, or null.
 * @returns An AI provider instance.
 */
export function createAiClient(setting: ProviderSetting | null): OpenRouter {
  if (!setting) {
    return defaultOrProvider;
  }

  switch (setting.provider) {
    case 'openrouter':
      return createOpenRouter({
        apiKey: setting.apiKey,
      });
    
    // TODO: Add cases for other providers like 'kimi', 'z.ai' etc.
    // For now, they fall through to the default.
    case 'kimi':
    case 'z.ai':
    case 'siliconflow':
    case 'custom':
      console.warn(`Provider "${setting.provider}" is not yet supported. Falling back to default.`);
      return defaultOrProvider;

    default:
      return defaultOrProvider;
  }
}
