import { useState } from 'react';
import { BottomSheet } from './BottomSheet';

interface TextExtractSheetProps {
  open: boolean;
  onClose: () => void;
  onContinue?: (text: string) => void;
}

export function TextExtractSheet({ open, onClose, onContinue }: TextExtractSheetProps) {
  const [text, setText] = useState('');

  const handleContinue = () => {
    onContinue?.(text.trim());
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-semibold text-gray-900">从文本提取</h2>
        <button
          onClick={handleContinue}
          className="px-5 h-10 rounded-full bg-violet-600 text-white shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!text.trim()}
        >
          继续
        </button>
      </div>
      <div className="mb-4">
        <div className="rounded-xl border border-gray-300 bg-gray-50">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="支持 Markdown 格式的文本"
            rows={10}
            className="w-full p-4 bg-transparent outline-none resize-none text-gray-900"
          />
        </div>
      </div>
    </BottomSheet>
  );
}
