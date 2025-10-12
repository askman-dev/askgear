import type {
  RecognizeEvent,
  RecognizeQuestionsInput,
  RecognizeQuestionsProvider,
  RecognizeQuestionsResult,
  RecognizedQuestion,
} from "../types";
import { preprocessImageToMax1024 } from "../preprocess";
import { streamText } from "ai";
import { MINI_MODEL } from "@lib/openrouter";
import { orProvider } from "@lib/openrouter-provider";
import { k12RecognitionSystemPrompt } from "../prompt";

function tryParseSimple(text: string): RecognizeQuestionsResult {
  const match = text.match(/\{[\s\S]*\}/);
  const jsonText = match ? match[0] : text;
  try {
    const obj = JSON.parse(jsonText);
    if (Array.isArray(obj?.questions)) {
      const qs: RecognizedQuestion[] = obj.questions.map(
        (q: any, i: number) => ({
          id: String(q?.id ?? `q${i + 1}`),
          text: String(q?.text ?? "").trim(),
        })
      );
      return { questions: qs };
    }
  } catch {}
  const single: RecognizedQuestion = { id: "q1", text: text.slice(0, 500) };
  return { questions: [single] };
}

export const LLMRecognizer: RecognizeQuestionsProvider = {
  recognize(
    input: RecognizeQuestionsInput,
    onEvent?: (evt: RecognizeEvent) => void
  ) {
    const ac = new AbortController();
    const { signal } = ac;

    const promise = (async (): Promise<RecognizeQuestionsResult> => {
      onEvent?.({ type: "progress", stage: "analyzing" });

      // Preprocess image (max side 1024)
      const source = input.image.file;
      if (!source) {
        throw new Error('Image file object is missing in Recognizer input.');
      }
      const pre = await preprocessImageToMax1024(source);

      // Compose multi-modal message
      const messages = [
        { role: "system" as const, content: k12RecognitionSystemPrompt() },
        {
          role: "user" as const,
          content: [
            { type: "text", text: "仅输出 JSON。" },
            { type: "image", image: pre.dataUrl },
          ],
        },
      ];
      // messages prepared

      let full = "";
      let preview = "";
      let jsonBuf = "";

      // Use fullStream to capture reasoning and text deltas explicitly
      const model = (orProvider as any)(MINI_MODEL);
      const fullResultHandle = streamText({
        model,
        messages: messages as any,
        abortSignal: signal,
        providerOptions: { openrouter: { reasoning: { effort: "low" } } },
      } as any);
      // fullStream listening start
      for await (const part of (fullResultHandle as any).fullStream) {
        const t = String(part?.type ?? "");
        if (
          t === "reasoning" ||
          t === "response.reasoning.delta" ||
          t.includes("reasoning")
        ) {
          // Prefer `part.text` for reasoning deltas per observed payload
          const delta = String(
            part?.text ?? part?.textDelta ?? part?.delta?.text ?? ""
          );
          if (delta) {
            preview += delta;
            onEvent?.({ type: "partial", text: preview });
          }
          continue;
        }
        if (
          t === "text-delta" ||
          t === "response.output_text.delta" ||
          t.includes("text")
        ) {
          const delta = String(
            part?.text ??
              part?.textDelta ??
              part?.delta?.text ??
              part?.delta?.output_text ??
              ""
          );
          if (!delta) continue;
          full += delta;
          jsonBuf += delta;
          // Prefer current JSON text field as preview
          let candidate: string | undefined = undefined;
          try {
            const mAll = Array.from(
              jsonBuf.matchAll(/\"text\"\s*:\s*\"([^\"]*?)\"/gs)
            );
            if (mAll.length > 0) candidate = mAll[mAll.length - 1][1];
            const mTail = jsonBuf.match(/\"text\"\s*:\s*\"([^\"]*)$/s);
            if (!candidate && mTail) candidate = mTail[1];
          } catch {}
          preview =
            candidate && candidate.length > 0 ? candidate : preview + delta;
          onEvent?.({ type: "partial", text: preview });
          continue;
        }
      }

      const finalResult = tryParseSimple(full);
      onEvent?.({
        type: "progress",
        stage: "done",
        found: finalResult.questions.length,
      });
      onEvent?.({ type: "complete", result: finalResult });
      return finalResult;

      // end fullStream path
    })();

    return {
      promise,
      cancel: () => ac.abort(),
    };
  },
};
