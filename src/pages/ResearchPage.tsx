import { Library, MoreVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ImageExtractSheet } from '@components/dialog/ImageExtractSheet';
import { ImageRecognizeSheet } from '@components/dialog/ImageRecognizeSheet';
import type { ImageRef, SolveInput } from '@features/recognize';
import { useSolveStore } from '@store/solve';

interface ResearchPageProps {
  onStartChat?: (opts?: { prefill?: string; solveData?: SolveInput }) => void;
  onStartArtifact?: (text: string) => void;
}

export function ResearchPage({ onStartChat, onStartArtifact: _onStartArtifact }: ResearchPageProps) {
  const [openImageSheet, setOpenImageSheet] = useState(false);
  const [imageSheetKey, setImageSheetKey] = useState(0);
  const [openRecognizeSheet, setOpenRecognizeSheet] = useState(false);
  const [pendingImage, setPendingImage] = useState<ImageRef | null>(null);
  const addSolve = useSolveStore((s) => s.addSolve);

  useEffect(() => {
    return () => {
      if (pendingImage?.file && pendingImage.src.startsWith('blob:')) {
        URL.revokeObjectURL(pendingImage.src);
      }
    };
  }, [pendingImage]);

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Top App Bar */}
      <header className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Library className="w-6 h-6 text-gray-800" />
            <h1 className="text-2xl font-bold text-gray-900">数学与谜题</h1>
          </div>
          <div className="flex items-center gap-4 text-gray-700">
            <MoreVertical className="w-6 h-6" />
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Card 1: 拍照解题 */}
        <div
          className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors aspect-square"
          onClick={() => setOpenImageSheet(true)}
        >
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            {/* Placeholder for a more specific icon */}
            <div className="w-10 h-10 rounded-lg bg-gray-200" />
          </div>
          <div className="mt-4 font-semibold text-lg text-gray-900">拍照解题</div>
          <div className="mt-1 text-sm text-gray-600">拍题，或选择图片，AI 会帮你分析思路</div>
        </div>

        {/* Card 2: 概念词典 */}
        <div
          className="bg-white rounded-2xl shadow-sm p-6 flex flex-row items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => { /* Logic for this feature to be added */ }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0">
            {/* Placeholder for a more specific icon */}
            <div className="w-10 h-10 rounded-lg bg-gray-200" />
          </div>
          <div className="flex flex-col">
            <div className="font-semibold text-lg text-gray-900">概念词典</div>
            <div className="mt-1 text-sm text-gray-600">AI 助你掌握核心概念</div>
          </div>
        </div>
      </div>

      {/* Sheets */}
      <ImageExtractSheet
        key={imageSheetKey}
        open={openImageSheet}
        onClose={() => setOpenImageSheet(false)}
        onContinue={(file) => {
          const id = `img_${Date.now()}`;
          const src = URL.createObjectURL(file);
          const imageRef: ImageRef = { id, src, file, mimeType: file.type };
          setPendingImage(imageRef);
          setOpenImageSheet(false);
          setOpenRecognizeSheet(true);
        }}
      />

      <ImageRecognizeSheet
        open={openRecognizeSheet}
        onClose={() => setOpenRecognizeSheet(false)}
        image={pendingImage}
        onClear={() => {
          if (pendingImage?.src && pendingImage.src.startsWith('blob:')) {
            URL.revokeObjectURL(pendingImage.src);
          }
          setPendingImage(null);
          setOpenRecognizeSheet(false);
          setImageSheetKey((k) => k + 1); // force remount to clear internal state
          setOpenImageSheet(true);
        }}
        onContinue={({ image, question }) => {
          const payload: SolveInput = {
            id: image.id,
            timestamp: Date.now(),
            image,
            question,
            meta: { provider: 'llm', model: 'MINI' },
          };

          // Persist to IndexedDB and update state store
          void addSolve(payload);

          setOpenRecognizeSheet(false);
          onStartChat?.({ solveData: payload });
        }}
      />
    </div>
  );
}
