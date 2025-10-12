import { useEffect, useMemo, useRef } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { useRecognizeQuestions } from '@features/recognize/useRecognizeQuestions';
import type { ImageRef, RecognizedQuestion } from '@features/recognize';
import { ThinkingIndicator } from '../ui/ThinkingIndicator';

interface ImageRecognizeSheetProps {
  open: boolean;
  onClose: () => void;
  image: ImageRef | null;
  onContinue?: (opts: { image: ImageRef; question: RecognizedQuestion }) => void;
  onClear?: () => void;
}

export function ImageRecognizeSheet({ open, onClose, image, onContinue, onClear }: ImageRecognizeSheetProps) {
  const { status, found, result, error, partial, start, cancel } = useRecognizeQuestions();
  const lastImageIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      cancel();
      return;
    }
    if (image && image.id !== lastImageIdRef.current) {
      lastImageIdRef.current = image.id;
      start(image);
    }
  }, [open, image, start]);

  // cancel on unmount only (avoid canceling on every re-render)
  useEffect(() => {
    return () => {
      cancel();
    };
  }, []);

  const questions = useMemo(() => result?.questions ?? [], [result]);

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-semibold text-gray-900">识别题目</h2>
        <div className="text-sm text-gray-500">
          {status === 'analyzing' && (
            <span className="inline-flex items-center gap-2">
              <ThinkingIndicator subtle text={`Thinking${typeof found === 'number' ? ` · 已发现 ${found}` : ''}`} />
            </span>
          )}
          {status === 'done' && (
            <button
              className="text-gray-600 hover:text-gray-900 underline underline-offset-2"
              onClick={() => (onClear ? onClear() : onClose())}
            >
              清空
            </button>
          )}
          {status === 'error' && (
            <button
              className="text-rose-600 hover:text-rose-700 underline underline-offset-2"
              onClick={() => (onClear ? onClear() : onClose())}
            >
              清空
            </button>
          )}
        </div>
      </div>

      {/* Unified scrollable area (includes image + results) */}
      <div className="space-y-3 max-h-[70vh] overflow-y-auto overscroll-contain pr-1">
        {image && (
          <div>
            <img src={image.src} alt="原图预览" className="w-full h-48 object-contain rounded-xl bg-gray-50 border border-gray-200" />
          </div>
        )}
        {status === 'done' && (
          <div className="text-sm text-gray-600">共 {questions.length} 道题目</div>
        )}
        {status === 'analyzing' && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/60 p-3 text-gray-700">
            <div className="text-xs mb-1 text-gray-500">模型输出进度</div>
            <div className="text-sm whitespace-pre-wrap leading-snug line-clamp-2">
              {partial || '…'}
            </div>
          </div>
        )}
        {status === 'error' && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            发生错误：{error?.message}
          </div>
        )}
        {status !== 'analyzing' && questions.map((q) => (
          <div key={q.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">{q.title}</div>
                {q.previewText && (
                  <div className="text-gray-700 mt-1 line-clamp-2">{q.previewText}</div>
                )}
                {q.analysisPreview && (
                  <div className="text-gray-500 mt-1 text-sm line-clamp-2">解析：{q.analysisPreview}</div>
                )}
              </div>
              <button
                className="shrink-0 px-4 h-9 rounded-full bg-violet-600 text-white shadow-sm active:scale-[0.98]"
                onClick={() => image && onContinue?.({ image, question: q })}
              >
                继续
              </button>
            </div>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}
