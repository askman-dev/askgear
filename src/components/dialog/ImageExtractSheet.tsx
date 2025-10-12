import { useEffect, useRef, useState } from 'react';
import { BottomSheet } from '../ui/BottomSheet';

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

  // Load a real preset image (place file at: public/presets/seamo-2022-paper-a.jpg)
  const handlePreset = async () => {
    try {
      const url = '/presets/seamo-2022-paper-a.jpg';
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('failed to load preset image');
      const blob = await resp.blob();
      const presetFile = new File([blob], 'seamo-2022-paper-a.jpg', { type: blob.type || 'image/jpeg' });
      onFile(presetFile);
    } catch (e) {
      console.error('加载预设图片失败: ', e);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-semibold text-gray-900">拍照或图片</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreset}
            className="px-4 h-10 rounded-full bg-gray-100 text-gray-800 shadow-sm active:scale-[0.98] hover:bg-gray-200 transition-colors"
          >
            预设内容
          </button>
          <button
            onClick={handleContinue}
            className="px-5 h-10 rounded-full bg-violet-600 text-white shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!file}
          >
            继续
          </button>
        </div>
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
