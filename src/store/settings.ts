import { create } from 'zustand';
import { db } from '@lib/db';
import type { ProviderSetting } from '@features/settings/types';

interface SettingsStore {
  settings: ProviderSetting[];
  activeSetting: ProviderSetting | null;
  isLoaded: boolean;
  initializeAppDefaults: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  addSetting: (newSetting: Omit<ProviderSetting, 'id' | 'isActive' | 'isBuiltIn'>) => Promise<void>;
  updateSetting: (id: string, updates: Partial<Omit<ProviderSetting, 'id' | 'isBuiltIn'>>) => Promise<void>;
  deleteSetting: (id: string) => Promise<void>;
  setActiveSetting: (id: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: [],
  activeSetting: null,
  isLoaded: false,

  initializeAppDefaults: async () => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      console.log('No built-in provider key found. Skipping default setup.');
      // Still need to fetch user settings
      await get().fetchSettings();
      return;
    }

    const builtInSetting: ProviderSetting = {
      id: 'builtin-default',
      provider: 'openrouter',
      defaultModel: import.meta.env.VITE_DEFAULT_MODEL || 'openai/gpt-4o',
      miniModel: import.meta.env.VITE_MINI_MODEL || 'openai/gpt-4o-mini',
      apiKey,
      isActive: false, // We determine this next
      isBuiltIn: true,
    };

    // Ensure the built-in setting is always up-to-date in the DB
    await db.providerSettings.put(builtInSetting);

    // Check if any setting is active. If not, make the built-in one active.
    const anyActive = await db.providerSettings.where('isActive').equals('true').first();
    if (!anyActive) {
      await db.providerSettings.update('builtin-default', { isActive: true });
    }

    // Now, fetch all settings to populate the store
    await get().fetchSettings();
  },

  fetchSettings: async () => {
    const allSettings = await db.providerSettings.toArray();
    const active = allSettings.find(s => s.isActive) || null;
    set({ settings: allSettings, activeSetting: active, isLoaded: true });
  },

  addSetting: async (newSetting) => {
    const settingWithId: ProviderSetting = {
      ...newSetting,
      id: crypto.randomUUID(),
      isActive: false,
      isBuiltIn: false, // User-added settings are never built-in
    };
    await db.providerSettings.add(settingWithId);
    set(state => ({ settings: [...state.settings, settingWithId] }));
  },

  updateSetting: async (id, updates) => {
    const setting = await db.providerSettings.get(id);
    if (setting) {
      const updatedSetting = { ...setting, ...updates };
      await db.providerSettings.put(updatedSetting);
      set(state => ({
        settings: state.settings.map(s => s.id === id ? updatedSetting : s),
        activeSetting: state.activeSetting?.id === id ? updatedSetting : state.activeSetting,
      }));
    }
  },

  deleteSetting: async (id) => {
    const setting = await db.providerSettings.get(id);
    if (setting?.isBuiltIn) {
      console.error("Cannot delete the built-in provider setting.");
      return; // Prevent deletion
    }
    await db.providerSettings.delete(id);
    set(state => ({
      settings: state.settings.filter(s => s.id !== id),
      activeSetting: state.activeSetting?.id === id ? null : state.activeSetting,
    }));
  },

  setActiveSetting: async (id: string) => {
    const currentActiveId = get().activeSetting?.id;
    if (currentActiveId === id) return;

    let newActiveSetting: ProviderSetting | null = null;

    await db.transaction('rw', db.providerSettings, async () => {
      if (currentActiveId) {
        await db.providerSettings.update(currentActiveId, { isActive: false });
      }
      await db.providerSettings.update(id, { isActive: true });
      newActiveSetting = await db.providerSettings.get(id) ?? null;
    });

    if (newActiveSetting) {
      set(state => ({
        settings: state.settings.map(s => ({ ...s, isActive: s.id === id })),
        activeSetting: newActiveSetting,
      }));
    }
  },
}));
