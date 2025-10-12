import type {
  RecognizeEvent,
  RecognizeQuestionsInput,
  RecognizeQuestionsProvider,
  RecognizeQuestionsResult,
} from '../types';
import { preprocessImageToMax1024 } from '../preprocess';
import { streamText } from 'ai';
import { openrouter, MINI_MODEL } from '@lib/openrouter';

function toSystemPrompt() {
  return [
    'You are an assistant that extracts exam questions from a single photo.',
    'Return a compact JSON with an array named "questions". Each item must have:',
    '{"id": string, "title": string, "previewText"?: string, "analysisPreview"?: string}.',
    'Do not include markdown or extra text outside JSON.',
  ].join(' ');
}

function tryParseQuestions(text: string): RecognizeQuestionsResult {
  // Attempt to extract first JSON block
  const match = text.match(/\{[\s\S]*\}/);
  const jsonText = match ? match[0] : text;
  try {
    const obj = JSON.parse(jsonText);
    if (Array.isArray(obj?.questions)) {
      return { questions: obj.questions } as RecognizeQuestionsResult;
    }
  } catch {}
  // Fallback to single item
  return {
    questions: [
      { id: 'q1', title: '从图片中识别出的题目', previewText: text.slice(0, 120) },
    ],
  };
}

export const LLMRecognizer: RecognizeQuestionsProvider = {
  recognize(input: RecognizeQuestionsInput, onEvent?: (evt: RecognizeEvent) => void) {
    const ac = new AbortController();
    const { signal } = ac;

    const promise = (async (): Promise<RecognizeQuestionsResult> => {
      onEvent?.({ type: 'progress', stage: 'analyzing' });

      // Preprocess image (max side 1024)
      const source = input.image.file ?? input.image.src;
      const pre = await preprocessImageToMax1024(source as any);

      // Compose multi-modal message
      const messages = [
        { role: 'system' as const, content: toSystemPrompt() },
        {
          role: 'user' as const,
          content: [
            { type: 'text', text: 'Extract questions as JSON.' },
            { type: 'image', image: pre.dataUrl },
          ],
        },
      ];

      let full = '';
      const { textStream } = await streamText({
        model: openrouter.chat(MINI_MODEL),
        messages: messages as any,
        abortSignal: signal,
      });

      for await (const chunk of textStream) {
        full += chunk;
        onEvent?.({ type: 'partial', text: full });
      }

      const result = tryParseQuestions(full);
      onEvent?.({ type: 'progress', stage: 'done', found: result.questions.length });
      onEvent?.({ type: 'complete', result });
      return result;
    })();

    return {
      promise,
      cancel: () => ac.abort(),
    };
  },
};
