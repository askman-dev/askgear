export type RecognizeStatus = 'idle' | 'analyzing' | 'done' | 'error';

export interface ImageRef {
  id: string;
  src: string; // object URL or public URL
  width?: number;
  height?: number;
  mimeType?: string;
  file?: File;
}

export interface RecognizedQuestion {
  id: string;
  title: string;
  previewText?: string;
  analysisPreview?: string;
  metadata?: Record<string, unknown>;
}

export interface RecognizeQuestionsInput {
  image: ImageRef;
  locale?: string;
  maxItems?: number;
}

export interface RecognizeQuestionsResult {
  questions: RecognizedQuestion[];
  timings?: Record<string, number>;
}

export type RecognizeEvent =
  | { type: 'progress'; stage: 'idle' | 'analyzing' | 'done'; found?: number }
  | { type: 'partial'; text: string }
  | { type: 'complete'; result: RecognizeQuestionsResult }
  | { type: 'error'; error: Error };

export interface RecognizeQuestionsProvider {
  recognize(
    input: RecognizeQuestionsInput,
    onEvent?: (evt: RecognizeEvent) => void
  ): { promise: Promise<RecognizeQuestionsResult>; cancel: () => void };
}
