import { useEffect, useRef, useState } from 'react';
import { BottomSheet } from './BottomSheet';

interface ImageExtractSheetProps {
  open: boolean;
  onClose: () => void;
  onContinue?: (file: File, previewUrl: string) => void;
}

export function ImageExtractSheet({ open, onClose, onContinue }: ImageExtractSheetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handlePick = () => fileInputRef.current?.click();

  const onFile = (f: File | null) => {
    if (!f) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleContinue = () => {
    if (!file || !previewUrl) return;
    onContinue?.(file, previewUrl);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">从图片提取</h2>

      <div className="mb-16">
        <div
          className="border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50/60 cursor-pointer hover:border-violet-400 transition-colors"
          onClick={handlePick}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="预览" className="w-full h-60 object-contain rounded-xl bg-white" />
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-600">
              点击选择图片（支持相册/相机）
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </div>
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
          disabled={!file}
        >
          继续
        </button>
      </div>
    </BottomSheet>
  );
}

