import { useEffect, useState } from 'react';
import type { ProviderSetting, ProviderType } from '@features/settings/types';

interface SettingsFormProps {
  initialData?: ProviderSetting;
  onSave: (data: Omit<ProviderSetting, 'id' | 'isActive' | 'isBuiltIn'>) => void;
  onClose: () => void;
}

const providerTypes: ProviderType[] = ['openrouter', 'z.ai', 'kimi', 'siliconflow', 'custom'];

export function SettingsForm({ initialData, onSave, onClose }: SettingsFormProps) {
  const [provider, setProvider] = useState<ProviderType>('openrouter');
  const [defaultModel, setDefaultModel] = useState('');
  const [miniModel, setMiniModel] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (initialData) {
      setProvider(initialData.provider);
      setDefaultModel(initialData.defaultModel);
      setMiniModel(initialData.miniModel || '');
      setApiKey(initialData.apiKey);
    }
  }, [initialData]);

  const handleSave = () => {
    if (!defaultModel || !apiKey) {
      alert('Please fill out Default Model and API Key.');
      return;
    }
    onSave({ provider, defaultModel, miniModel, apiKey });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{initialData ? 'Edit' : 'Add'} AI Provider</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as ProviderType)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {providerTypes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Default Model</label>
            <input
              type="text"
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              placeholder="e.g., gpt-4-turbo"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Mini Model <span className="text-gray-400">(Optional)</span></label>
            <input
              type="text"
              value={miniModel}
              onChange={(e) => setMiniModel(e.target.value)}
              placeholder="e.g., gpt-4o-mini"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="••••••••••••••••••••"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold text-white bg-gray-800 border border-transparent rounded-lg shadow-sm hover:bg-gray-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}