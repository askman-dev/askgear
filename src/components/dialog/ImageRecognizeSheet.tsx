import { useEffect, useMemo, useRef, useState } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { useRecognizeQuestions } from '@features/recognize/useRecognizeQuestions';
import type { ImageRef, RecognizedQuestion } from '@features/recognize';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface ImageRecognizeSheetProps {
  open: boolean;
  onClose: () => void;
  image: ImageRef | null;
  onContinue?: (opts: { image: ImageRef; question: RecognizedQuestion }) => void;
  onClear?: () => void;
}

export function ImageRecognizeSheet({ open, onClose, image, onContinue, onClear }: ImageRecognizeSheetProps) {
  const { status, found, result, error, partial, start, cancel } = useRecognizeQuestions();
  const [preparing, setPreparing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const preview50Words = useMemo(() => {
    if (!partial) return '…';
    const normalized = partial.replace(/\s+/g, ' ').trim();
    if (!normalized) return '…';
    const words = normalized.split(' ');
    return words.slice(-50).join(' ');
  }, [partial]);
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

  // Default select the first question
  useEffect(() => {
    if (questions.length > 0 && !selectedId) {
      setSelectedId(questions[0].id);
    }
  }, [questions, selectedId]);

  // Preparing heuristic: if analyzing and no partial within 1.5s, show "模型准备中…"
  useEffect(() => {
    if (status !== 'analyzing') { setPreparing(false); return; }
    let timer: any;
    if (!partial) {
      timer = setTimeout(() => setPreparing(true), 1500);
    } else {
      setPreparing(false);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [status, partial]);

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-3 pr-1">
        <h2 className="text-2xl font-semibold text-gray-900">识别题目</h2>
        <div className="text-sm text-gray-500">
          {status === 'analyzing' && (
            <button
              className="text-gray-600 hover:text-gray-900 underline underline-offset-2"
              onClick={() => {
                cancel();
                onClear?.();
              }}
            >
              停止
            </button>
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
            <div className="text-xs mb-1 text-gray-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>正在思考</span>
            </div>
            {preparing && !partial ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>模型准备中…</span>
              </div>
            ) : (
              <div className="text-sm whitespace-pre-wrap leading-snug">{preview50Words}</div>
            )}
          </div>
        )}
        {status === 'error' && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            发生错误：{error?.message}
          </div>
        )}
        {status !== 'analyzing' && questions.map((q) => (
          <div
            key={q.id}
            onClick={() => setSelectedId(q.id)}
            className={clsx(
              'rounded-xl border bg-white p-4 transition-colors cursor-pointer',
              selectedId === q.id ? 'border-violet-300 bg-violet-50' : 'border-gray-200'
            )}
          >
            <div className="text-gray-800 text-sm line-clamp-3">{q.text}</div>
            <div className="flex justify-end items-center gap-2 mt-3">
              <button
                className="shrink-0 px-4 h-9 rounded-full bg-violet-600 text-white shadow-sm active:scale-[0.98]"
                onClick={(e) => {
                  e.stopPropagation();
                  image && onContinue?.({
                    image,
                    question: { ...q, text: q.text ?? '' },
                  });
                }}
              >
                解题
              </button>
              <button
                className="shrink-0 px-4 h-9 rounded-full bg-gray-200 text-gray-500 cursor-not-allowed"
                disabled
              >
                对话
              </button>
            </div>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}
