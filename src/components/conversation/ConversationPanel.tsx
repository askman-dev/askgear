import { useEffect, useRef, useState } from 'react';
import { streamText } from 'ai';
import { DEFAULT_MODEL } from '@lib/openrouter';
import { orProvider } from '@lib/openrouter-provider';
import { InputBar } from '@components/input/InputBar';
import { ThinkingIndicator } from '@components/ui/ThinkingIndicator';
import { useConversation } from '@features/conversation';
import { MessageList } from '@components/message/MessageList';
import type { Message } from '@features/conversation';

interface ConversationPanelProps {
  system?: string;
  initialInput?: string;
  initialMessages?: Message[];
}

// message shape handled in conversation feature

export function ConversationPanel({ system, initialInput, initialMessages }: ConversationPanelProps) {
  const conv = useConversation({ system });
  const [input, setInput] = useState(initialInput ?? '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessages && conv.messages.length === 0) {
      conv.setMessages(initialMessages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessages]);

  useEffect(() => {
    // If the conversation is initialized with a context block, kick off the conversation.
    const firstMessage = conv.messages[0] as any;
    if (conv.messages.length === 1 && firstMessage?.displayType === 'problemContext') {
      let problemText = '';
      if (Array.isArray(firstMessage.content)) {
        const textPart = firstMessage.content.find(p => p.type === 'text');
        if (textPart) {
          problemText = textPart.text.replace(/^Problem: /, '');
        }
      }
      const fullPrompt = `请帮我讲解这个题目: "${problemText}"`;
      void handleSend(fullPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conv.messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv.messages, conv.isLoading]);

  useEffect(() => {
    if (initialInput && conv.messages.length === 0) {
      // auto-send prefill once
      setInput('');
      void handleSend(initialInput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialInput]);

  const handleSend = async (prefill?: string) => {
    const text = (prefill ?? input).trim();
    if (!text) return;
    if (!prefill) setInput('');

    await conv.send(text, async ({ llmMessages, abortSignal }) => {
      const model = (orProvider as any)(DEFAULT_MODEL);
      const result = streamText({
        model,
        messages: llmMessages as any,
        abortSignal,
        providerOptions: { openrouter: { reasoning: { effort: 'medium' } } },
      } as any);
      return { fullStream: (result as any).fullStream };
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MessageList messages={conv.messages} bottomRef={messagesEndRef} />
        {conv.isLoading && <ThinkingIndicator />}
      </div>
      <div className="border-t border-gray-200 p-4 bg-white">
        <InputBar value={input} onChange={setInput} onSubmit={() => void handleSend()} placeholder="请输入…" disabled={conv.isLoading} />
      </div>
    </div>
  );
}
