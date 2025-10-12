export type RecognizeStatus = 'idle' | 'analyzing' | 'done' | 'error';

export interface ImageRef {
  id: string;
  src: string; // object URL or public URL
  width?: number;
  height?: number;
  mimeType?: string;
  file?: File;
}

// Simplified question: only id + text (question stem)
export interface RecognizedQuestion {
  id: string;
  text: string;
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

// Payload to next page
export interface SolveInput {
  image: ImageRef;
  question: RecognizedQuestion;
  meta?: { provider: 'llm'; model: string; timings?: Record<string, number> };
}
