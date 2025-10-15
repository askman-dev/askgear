import { useEffect, useRef, useState } from 'react';
import { streamText } from 'ai';
import { DEFAULT_MODEL } from '@lib/openrouter';
import { orProvider } from '@lib/openrouter-provider';
import { InputBar } from '@components/input/InputBar';
import { ThinkingIndicator } from '@components/ui/ThinkingIndicator';
import { useConversation } from '@features/conversation';
import { MessageList } from '@components/message/MessageList';
import type { Message } from '@features/conversation';
import { ChevronRight, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

interface ConversationPanelProps {
  system?: string;
  initialInput?: string;
  initialMessages?: Message[];
  solveId?: string;
}

// message shape handled in conversation feature

export function ConversationPanel({ system, initialInput, initialMessages, solveId }: ConversationPanelProps) {
  const conv = useConversation({ system, solveId });
  const [input, setInput] = useState(initialInput ?? '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'similar' | 'card'>('analysis');

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
        const textPart = firstMessage.content.find((p: any) => p.type === 'text');
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

  const questionMessage = conv.messages.find((m: any) => m.displayType === 'problemContext');
  const conversationMessages = conv.messages.filter((m: any) => m.displayType !== 'problemContext');

  useEffect(() => {
    if (activeTab === 'analysis') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, conversationMessages.length]);

  useEffect(() => {
    setActiveTab('analysis');
  }, [questionMessage?.id]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="px-4 space-y-4">
        {questionMessage && (
          <ProblemSummary
            message={questionMessage}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}
      </div>

      {activeTab === 'analysis' ? (
        <>
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
            <MessageList messages={conversationMessages} bottomRef={messagesEndRef} />
            {conv.isLoading && <ThinkingIndicator />}
          </div>
          <div className="p-4">
            <InputBar
              value={input}
              onChange={setInput}
              onSubmit={() => void handleSend()}
              placeholder="请输入…"
              disabled={conv.isLoading}
            />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center px-4 text-sm text-gray-500">
          此标签内容即将上线，敬请期待。
        </div>
      )}
    </div>
  );
}

interface ProblemSummaryProps {
  message: Message;
  activeTab: 'analysis' | 'similar' | 'card';
  onTabChange: (tab: 'analysis' | 'similar' | 'card') => void;
}

function ProblemSummary({ message, activeTab, onTabChange }: ProblemSummaryProps) {
  const [showDetail, setShowDetail] = useState(false);

  let text = '';
  let imageUrl = '';
  if (Array.isArray(message.content)) {
    const textPart = message.content.find((p: any) => p.type === 'text');
    const imagePart = message.content.find((p: any) => p.type === 'image');
    if (textPart) text = textPart.text.replace(/^Problem: /, '');
    if (imagePart) imageUrl = imagePart.image as string;
  } else if (typeof message.content === 'object' && message.content !== null) {
    text = (message.content as any).text ?? '';
    imageUrl = (message.content as any).imageUrl ?? '';
  }

  const detail = showDetail
    ? createPortal(
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-black/70 backdrop-blur-sm pt-10"
          onClick={() => setShowDetail(false)}
        >
          <div className="w-full max-w-md px-4 pb-12" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-3xl bg-[#1f1f1f] text-gray-100 shadow-2xl border border-white/10 max-h-[85vh] flex flex-col overflow-hidden">
              <div className="sticky top-0 flex items-start gap-3 px-6 pt-6 pb-4 bg-[#1f1f1f]/95 backdrop-blur-sm z-10">
                <div className="text-sm font-semibold leading-6 text-gray-100 flex-1">题目详情</div>
                <button
                  type="button"
                  onClick={() => setShowDetail(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-700/60 transition"
                  aria-label="关闭题目详情"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-6 pb-7 space-y-4 overflow-y-auto flex-1">
                {text && <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-100">{text}</p>}
                {imageUrl && (
                  <img src={imageUrl} alt="题目内容" className="w-full rounded-2xl border border-white/10 bg-white/5" />
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setShowDetail(true)}
        className="w-full flex items-center justify-between gap-3 text-left text-gray-900 active:opacity-80 transition"
      >
        <span className="text-sm font-medium truncate">{text || '题目信息'}</span>
        <span className="flex items-center justify-center w-6 h-6 text-gray-500">
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        {[{ id: 'analysis', label: '分析' }, { id: 'similar', label: '同类型题' }, { id: 'card', label: '题目卡片' }].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id as 'analysis' | 'similar' | 'card')}
            className={clsx(
              'pb-1 border-b-2 transition-colors',
              activeTab === id
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent hover:text-gray-700'
            )}
          >
            {label}
          </button>
        ))}
      </div>



      {detail}
    </div>
  );
}
