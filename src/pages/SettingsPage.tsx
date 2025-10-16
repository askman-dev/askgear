import { useEffect, useState } from 'react';
import { useSettingsStore } from '@store/settings';
import { ProviderSettingItem } from '@components/settings/ProviderSettingItem';
import { SettingsForm } from '@components/settings/SettingsForm';
import type { ProviderSetting } from '@features/settings/types';

export function SettingsPage() {
  const {
    settings,
    isLoaded,
    fetchSettings,
    addSetting,
    updateSetting,
    deleteSetting,
    setActiveSetting,
  } = useSettingsStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<ProviderSetting | undefined>();

  useEffect(() => {
    if (!isLoaded) {
      fetchSettings();
    }
  }, [isLoaded, fetchSettings]);

  const handleSave = async (data: Omit<ProviderSetting, 'id' | 'isActive'>) => {
    if (editingSetting) {
      await updateSetting(editingSetting.id, data);
    } else {
      await addSetting(data);
    }
    setIsFormOpen(false);
    setEditingSetting(undefined);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="sticky top-0 z-10 px-4 py-4 bg-gray-50/80 backdrop-blur">
        <h1 className="text-2xl font-bold text-gray-900">设置</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex justify-between items-center pb-2 mb-4 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-600">模型</h2>
          <button
            onClick={() => {
              setEditingSetting(undefined);
              setIsFormOpen(true);
            }}
            className="px-3 py-1 text-sm font-semibold text-white bg-gray-800 rounded-lg shadow-sm hover:bg-gray-700 active:scale-95 transition-transform"
          >
            + 添加
          </button>
        </div>
        <div className="space-y-3">
          {!isLoaded ? (
            <p className="text-gray-500">Loading settings...</p>
          ) : (
            settings.map(setting => (
              <ProviderSettingItem
                key={setting.id}
                setting={setting}
                onEdit={() => {
                  setEditingSetting(setting);
                  setIsFormOpen(true);
                }}
                onDelete={() => deleteSetting(setting.id)}
                onSetActive={() => setActiveSetting(setting.id)}
              />
            ))
          )}
        </div>
      </div>

      {isFormOpen && (
        <SettingsForm
          initialData={editingSetting}
          onSave={handleSave}
          onClose={() => {
            setIsFormOpen(false);
            setEditingSetting(undefined);
          }}
        />
      )}    </div>
  );
}
