import { useEffect, useRef, useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { streamText } from 'ai';
import { openrouter, DEFAULT_MODEL } from '../lib/openrouter';
import clsx from 'clsx';

interface ConversationPanelProps {
  system?: string;
  initialInput?: string;
}

type Msg = { id: string; role: 'user' | 'assistant' | 'system'; content: string };

export function ConversationPanel({ system, initialInput }: ConversationPanelProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState(initialInput ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialInput && messages.length === 0) {
      // auto-send prefill once
      setInput('');
      void handleSend(initialInput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialInput]);

  const handleSend = async (prefill?: string) => {
    if (isLoading) return;
    const text = (prefill ?? input).trim();
    if (!text) return;

    setIsLoading(true);
    if (!prefill) setInput('');

    const userMsg: Msg = { id: `msg-${Date.now()}`, role: 'user', content: text };
    const base = [...messages, userMsg];
    setMessages(base);
    const assistantId = `msg-${Date.now()}-assistant`;
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      const { textStream } = await streamText({
        model: openrouter.chat(DEFAULT_MODEL),
        messages: [
          ...(system ? [{ role: 'system' as const, content: system }] : []),
          ...base.map(m => ({ role: m.role, content: m.content })),
        ],
      });

      let acc = '';
      for await (const chunk of textStream) {
        acc += chunk;
        setMessages(prev => prev.map(m => (m.id === assistantId ? { ...m, content: acc } : m)));
      }
    } catch (err) {
      // show error fallback
      setMessages(prev => prev.map(m => (m.id === assistantId ? { ...m, content: '抱歉，出现错误，请稍后重试。' } : m)));
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={clsx('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={clsx(
                'max-w-[85%] px-4 py-3 rounded-lg',
                m.role === 'user' ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-900'
              )}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{m.content || (m.role === 'assistant' && '...')}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg w-fit">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span className="text-xs text-blue-700">Thinking…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-end gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="请输入…"
            disabled={isLoading}
            className="flex-1 h-11 rounded-2xl border border-gray-300 bg-gray-50 px-4 outline-none text-gray-900 placeholder:text-gray-500"
          />
          <button
            onClick={() => void handleSend()}
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-11 h-11 rounded-full bg-violet-600 text-white flex items-center justify-center active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

