import { useState } from 'react';
import { BottomSheet } from './BottomSheet';

interface WebExtractSheetProps {
  open: boolean;
  onClose: () => void;
  onContinue?: (url: string) => void;
}

function isValidUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function WebExtractSheet({ open, onClose, onContinue }: WebExtractSheetProps) {
  const [url, setUrl] = useState('');
  const valid = isValidUrl(url.trim());

  const handleContinue = () => {
    if (!valid) return;
    onContinue?.(url.trim());
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">从网页提取</h2>
      <div className="mb-16">
        <label className="block text-sm text-gray-700 mb-2">输入网址</label>
        <div className="flex items-center gap-2">
          <input
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/page"
            className="flex-1 h-12 px-4 rounded-xl border border-gray-300 outline-none focus:border-violet-500"
          />
        </div>
        {!valid && url.trim().length > 0 && (
          <div className="text-xs text-red-600 mt-2">请输入有效的 URL</div>
        )}
      </div>
      <div className="absolute bottom-4 right-4 left-4 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 h-10 rounded-full bg-gray-100 text-gray-800 shadow-sm active:scale-[0.98]"
        >
          取消
        </button>
        <button
          onClick={handleContinue}
          className="px-5 h-10 rounded-full bg-violet-600 text-white shadow-sm active:scale-[0.98] disabled:opacity-50"
          disabled={!valid}
        >
          继续
        </button>
      </div>
    </BottomSheet>
  );
}

