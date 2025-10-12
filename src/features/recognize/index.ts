import { LLMRecognizer } from './providers/llm';
import type { RecognizeQuestionsProvider } from './types';

function selectProvider(): RecognizeQuestionsProvider {
  // Production uses LLM provider only. Tests may import mock directly from their own paths.
  return LLMRecognizer;
}

export const Recognizer: RecognizeQuestionsProvider = selectProvider();

export * from './types';
