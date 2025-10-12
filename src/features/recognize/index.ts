import { MockRecognizer } from './providers/mock';
import type { RecognizeQuestionsProvider } from './types';

function selectProvider(): RecognizeQuestionsProvider {
  // Future: switch via env var, default to mock
  // const name = import.meta.env.VITE_RECOGNIZER_PROVIDER || 'mock';
  // switch (name) { case 'mock': default: return MockRecognizer; }
  return MockRecognizer;
}

export const Recognizer: RecognizeQuestionsProvider = selectProvider();

export * from './types';
