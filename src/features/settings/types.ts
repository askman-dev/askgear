export type ProviderType = 'openrouter' | 'z.ai' | 'kimi' | 'siliconflow' | 'custom';

export interface ProviderSetting {
  id: string;
  provider: ProviderType;
  defaultModel: string;
  miniModel?: string;
  apiKey: string;
  isActive: boolean;
  isBuiltIn: boolean;
}
