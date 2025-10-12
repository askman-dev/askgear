import { Bookmark, Folder, MoreVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { IngestCard } from '@components/ui/IngestCard';
import { TextExtractSheet } from '@components/dialog/TextExtractSheet';
import { ImageExtractSheet } from '@components/dialog/ImageExtractSheet';
import { ImageRecognizeSheet } from '@components/dialog/ImageRecognizeSheet';
import type { ImageRef, SolveInput } from '@features/recognize';
import { useSolveStore } from '@store/solve';

interface PracticePageProps {
  onStartChat?: (opts?: { prefill?: string }) => void;
  onStartArtifact?: (text: string) => void;
}

export function PracticePage({ onStartChat, onStartArtifact }: PracticePageProps) {
  const [openTextSheet, setOpenTextSheet] = useState(false);
  const [openImageSheet, setOpenImageSheet] = useState(false);
  const [imageSheetKey, setImageSheetKey] = useState(0);
  const [openRecognizeSheet, setOpenRecognizeSheet] = useState(false);
  const [pendingImage, setPendingImage] = useState<ImageRef | null>(null);
  const setSolve = useSolveStore((s) => s.set);

  useEffect(() => {
    return () => {
      if (pendingImage?.file && pendingImage.src.startsWith('blob:')) {
        URL.revokeObjectURL(pendingImage.src);
      }
    };
  }, [pendingImage]);

  return (
    <div className="h-full overflow-y-auto bg-violet-50">
      {/* Top App Bar */}
      <header className="sticky top-0 z-10 bg-violet-50/80 backdrop-blur border-b border-violet-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Folder className="w-6 h-6 text-gray-800" />
            <h1 className="text-2xl font-bold text-gray-900">Insight</h1>
          </div>
          <div className="flex items-center gap-4 text-gray-700">
            <Bookmark className="w-6 h-6" />
            <MoreVertical className="w-6 h-6" />
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Section: 解题 */}
        <div>
          <div className="text-gray-800 font-semibold mb-3">解题</div>
          <div className="space-y-3">
            <IngestCard
              title="拍照或图片"
              description="上传图片，识别图中信息并提取出数据"
              onClick={() => setOpenImageSheet(true)}
            />
            <IngestCard
              title="输入文字"
              description="粘贴 ChatGPT的输出（或 Markdown格式的文本），提取其中的数据并导出为表格"
              onClick={() => setOpenTextSheet(true)}
            />
          </div>
        </div>

        {/* Section: 找题 */}
        <div className="pt-2">
          <div className="text-gray-800 font-semibold mb-3">找题</div>
          <div className="space-y-3">
            <IngestCard
              title="找相似题"
              description="根据当前题目寻找相似题目"
              onClick={() => onStartChat?.({ prefill: '帮我找一些相似的题目：' })}
            />
            <IngestCard
              title="提出要求"
              description="说出你的要求，让 AI 帮你出题"
              onClick={() => onStartChat?.({ prefill: '根据以下要求出题：' })}
            />
          </div>
        </div>

        {/* Section: AI research */}
        <div className="pt-2">
          <div className="text-gray-800 font-semibold mb-3">AI 深度研究 ...</div>

          <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
            <div className="w-28 h-28 rounded-2xl bg-gray-200 flex items-center justify-center shrink-0">
              <div className="w-14 h-14 bg-gray-300 rounded-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-semibold text-gray-900">
                聊一聊你希望探讨的话题
              </div>
              <div className="text-gray-600 mt-1">supporting text</div>
              <div className="mt-4">
                <button
                  onClick={() => onStartChat?.()}
                  className="px-5 py-2.5 rounded-full bg-violet-600 text-white shadow-sm active:scale-[0.98]"
                >
                  聊一聊
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sheets */}
      <TextExtractSheet
        open={openTextSheet}
        onClose={() => setOpenTextSheet(false)}
        onContinue={(txt) => onStartArtifact?.(txt)}
      />
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
          // Persist structured payload for next page usage
          const payload: SolveInput = { image, question, meta: { provider: 'llm', model: 'MINI' } };
          setSolve(payload);
          setOpenRecognizeSheet(false);
          // Keep artifact flow by passing a summary text for now
          const summary = `从图片解题：\n- 原图: ${image.src}\n- 题目预览: ${question.text.slice(0, 80)}...`;
          onStartArtifact?.(summary);
        }}
      />
    </div>
  );
}
