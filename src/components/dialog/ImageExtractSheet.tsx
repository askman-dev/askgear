import { useRef } from 'react';
import { BottomSheet } from '../ui/BottomSheet';

interface ImageExtractSheetProps {
  open: boolean;
  onClose: () => void;
  onContinue?: (file: File) => void;
}

export function ImageExtractSheet({ open, onClose, onContinue }: ImageExtractSheetProps) {
  const albumInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    // basic file validation: images only
    if (!f.type.startsWith('image/')) {
      // TODO: show error to user
      console.error('Invalid file type');
      return;
    }
    onContinue?.(f);
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
      handleFile(presetFile);
    } catch (e) {
      console.error('加载预设图片失败: ', e);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">选择图片</h2>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="w-full text-center py-4 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-gray-800"
        >
          拍照
        </button>
        <button
          onClick={() => albumInputRef.current?.click()}
          className="w-full text-center py-4 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-gray-800"
        >
          从相册选择
        </button>
        <button
          onClick={handlePreset}
          className="w-full text-center py-4 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-gray-800"
        >
          示例题目
        </button>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={albumInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </BottomSheet>
  );
}
