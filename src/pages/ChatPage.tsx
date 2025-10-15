import { ArrowLeft } from 'lucide-react';
import { ConversationPanel } from '@components/conversation/ConversationPanel';
import { useEffect, useState } from 'react';
import type { Message } from '@features/conversation';
import type { SolveInput } from '@features/recognize';
import { preprocessImageToMax1024 } from '@features/recognize/preprocess';

interface ChatPageProps {
  onBack?: () => void;
  initialInput?: string;
  solveContext: SolveInput | null;
}

const DEFAULT_SYSTEM_PROMPT = "You are a helpful camera expert assistant. Provide concise, accurate information about cameras, photography, and gear.";
const SOLVE_SYSTEM_PROMPT = "You are a helpful assistant that analyzes and solves problems. Provide clear, step-by-step reasoning.";

export function ChatPage({ onBack, initialInput, solveContext }: ChatPageProps) {
  const [initialMessages, setInitialMessages] = useState<Message[] | undefined>();
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const isSolving = !!solveContext;
  const systemPrompt = isSolving ? SOLVE_SYSTEM_PROMPT : DEFAULT_SYSTEM_PROMPT;
  const pageTitle = isSolving ? '解题' : '聊天';

  useEffect(() => {
    if (!isSolving || !solveContext) {
      setInitialMessages(undefined);
      setLoadingError(null);
      return;
    }

    // If messages already exist in the context, use them directly.
    if (solveContext.messages && solveContext.messages.length > 0) {
      setInitialMessages(solveContext.messages);
      return;
    }

    // Otherwise, create the initial message for a new session.
    let isMounted = true;
    const createInitialMessages = async () => {
      try {
        const imageSource = solveContext.image.file ?? solveContext.image.src;
        const pre = await preprocessImageToMax1024(imageSource);
        const contextMessage: Message = {
          id: 'context-msg-' + solveContext.image.id,
          role: 'user',
          displayType: 'problemContext', // for custom UI rendering
          content: [
            { type: 'text', text: `Problem: ${solveContext.question.text}` },
            { type: 'image', image: pre.dataUrl },
          ] as any,
        };
        if (isMounted) {
          setInitialMessages([contextMessage]);
        }
      } catch (error) {
        console.error("Error preprocessing image for chat:", error);
        if (isMounted) {
          setLoadingError('题目加载失败，请返回重试');
        }
      }
    };

    createInitialMessages();

    return () => { isMounted = false; };
  }, [isSolving, solveContext]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="sticky top-0 z-10 px-3 pt-3 pb-2 flex items-center gap-3 bg-gray-50/80 backdrop-blur">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
          {!isSolving && <p className="text-xs text-gray-600">Ask about cameras</p>}
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">
        {loadingError ? (
          <div className="p-4 text-center text-red-500">{loadingError}</div>
        ) : (isSolving && !initialMessages) ? (
          <div className="p-4 text-center text-gray-500">正在准备题目...</div>
        ) : (
          <ConversationPanel
            key={solveContext?.id ?? 'default'} // Add key to force re-mount
            system={systemPrompt}
            initialInput={isSolving ? undefined : initialInput}
            initialMessages={initialMessages}
            solveId={solveContext?.id}
          />
        )}
      </div>
    </div>
  );
}
