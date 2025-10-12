import type {
  RecognizeEvent,
  RecognizeQuestionsInput,
  RecognizeQuestionsProvider,
  RecognizeQuestionsResult,
} from '../types';

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(t);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    }
  });
}

export const MockRecognizer: RecognizeQuestionsProvider = {
  recognize(input: RecognizeQuestionsInput, onEvent?: (evt: RecognizeEvent) => void) {
    const ac = new AbortController();
    const { signal } = ac;

    const promise = (async (): Promise<RecognizeQuestionsResult> => {
      onEvent?.({ type: 'progress', stage: 'analyzing' });

      // Simulate staged progress
      await sleep(400, signal);
      onEvent?.({ type: 'progress', stage: 'analyzing', found: 1 });
      await sleep(350, signal);
      onEvent?.({ type: 'progress', stage: 'analyzing', found: 2 });
      await sleep(300, signal);

      const baseTitle = input.image.src.includes('seamo-2022')
        ? 'SEAMO 2022 模拟题'
        : '识别的题目';

      const result: RecognizeQuestionsResult = {
        questions: [
          {
            id: 'q1',
            title: `${baseTitle} A1：函数与不等式`,
            previewText: '已知 f(x)=ax^2+bx+c，若 … 求参数范围',
            analysisPreview: '判别式与单调性结合，作二次函数图像分析 …',
          },
          {
            id: 'q2',
            title: `${baseTitle} A2：数列与极限`,
            previewText: '数列 {a_n} 满足递推关系 … 求极限',
            analysisPreview: '构造辅助数列，使用单调有界原理 …',
          },
          {
            id: 'q3',
            title: `${baseTitle} B1：解析几何`,
            previewText: '已知椭圆 … 过定点直线斜率范围',
            analysisPreview: '焦点性质 + 斜率参数方程联立消元 …',
          },
        ],
      };

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
