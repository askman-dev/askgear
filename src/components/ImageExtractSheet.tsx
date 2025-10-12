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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-semibold text-gray-900">拍照或图片</h2>
        <button
          onClick={handleContinue}
          className="px-5 h-10 rounded-full bg-violet-600 text-white shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!file}
        >
          继续
        </button>
      </div>

      <div className="mb-4">
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
    </BottomSheet>
  );
}
