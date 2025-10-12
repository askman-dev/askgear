import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Recognizer } from './index';
import type {
  ImageRef,
  RecognizeQuestionsResult,
  RecognizeStatus,
} from './types';

export function useRecognizeQuestions() {
  const [status, setStatus] = useState<RecognizeStatus>('idle');
  const [found, setFound] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<RecognizeQuestionsResult | null>(null);
  const [partial, setPartial] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);

  const cancelRef = useRef<null | (() => void)>(null);

  useEffect(() => () => { cancelRef.current?.(); }, []);

  const start = useCallback((image: ImageRef) => {
    setStatus('analyzing');
    setFound(undefined);
    setResult(null);
    setError(null);
    setPartial('');

    const { promise, cancel } = Recognizer.recognize(
      { image },
      (evt) => {
        if (evt.type === 'progress') {
          if (evt.stage === 'analyzing') {
            setStatus('analyzing');
            if (typeof evt.found === 'number') setFound(evt.found);
          } else if (evt.stage === 'done') {
            setStatus('done');
          }
        } else if (evt.type === 'partial') {
          setPartial(evt.text);
        } else if (evt.type === 'complete') {
          setResult(evt.result);
          setStatus('done');
          setPartial('');
        } else if (evt.type === 'error') {
          setError(evt.error);
          setStatus('error');
        }
      }
    );

    cancelRef.current = cancel;

    promise.catch((e) => {
      setError(e instanceof Error ? e : new Error('Unknown error'));
      setStatus('error');
    });
  }, []);

  const state = useMemo(
    () => ({ status, found, result, error, partial }),
    [status, found, result, error, partial]
  );

  return { ...state, start, cancel: () => cancelRef.current?.() };
}
