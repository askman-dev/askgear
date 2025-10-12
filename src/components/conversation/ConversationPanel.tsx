import { useEffect, useRef, useState } from 'react';
import { streamText } from 'ai';
import { openrouter, DEFAULT_MODEL } from '@lib/openrouter';
import { InputBar } from '@components/input/InputBar';
import { ThinkingIndicator } from '@components/ui/ThinkingIndicator';
import { useConversation } from '@features/conversation';
import { MessageList } from '@components/message/MessageList';

interface ConversationPanelProps {
  system?: string;
  initialInput?: string;
}

// message shape handled in conversation feature

export function ConversationPanel({ system, initialInput }: ConversationPanelProps) {
  const conv = useConversation({ system });
  const [input, setInput] = useState(initialInput ?? '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    await conv.send(text, async ({ llmMessages }) => {
      const { textStream } = await streamText({
        model: openrouter.chat(DEFAULT_MODEL),
        messages: llmMessages,
      });
      return { textStream };
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
