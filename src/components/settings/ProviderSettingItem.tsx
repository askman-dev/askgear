import type { ProviderSetting } from '@features/settings/types';
import { Edit, Trash2 } from 'lucide-react';

interface ProviderSettingItemProps {
  setting: ProviderSetting;
  onEdit: () => void;
  onDelete: () => void;
  onSetActive: () => void;
}

export function ProviderSettingItem({ setting, onEdit, onDelete, onSetActive }: ProviderSettingItemProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200 flex items-center gap-4">
      <input
        type="radio"
        name="active-setting"
        checked={setting.isActive}
        onChange={onSetActive}
        className="form-radio h-5 w-5 text-gray-900 focus:ring-gray-900 border-gray-300 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{setting.isBuiltIn ? 'Built-in Default' : setting.provider}</p>
        <p className="text-sm text-gray-500 truncate">{setting.defaultModel}</p>
        {setting.miniModel && <p className="text-xs text-gray-400 truncate">Mini: {setting.miniModel}</p>}
      </div>
      {!setting.isBuiltIn && (
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="p-2 text-gray-500 hover:text-gray-800">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-2 text-gray-500 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}