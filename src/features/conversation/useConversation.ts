import { useCallback, useRef, useState } from 'react';
import type { ConversationConfig, DoStream, LLMMessage, Message, Part } from './types';

function getTextFromMessage(m: Message): string {
  if (m.content) return m.content;
  if (m.parts) return m.parts.filter(p => p.type === 'text').map(p => (p as any).content).join('\n');
  return '';
}

export function useConversation(config?: ConversationConfig) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const currentAssistantIdRef = useRef<string | null>(null);
  const sendingRef = useRef(false);

  const addToolPart = useCallback((toolName: string, args?: any) => {
    const partId = `part-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const assistantId = currentAssistantIdRef.current;
    if (!assistantId) return partId;
    setMessages(prev => prev.map(m => {
      if (m.id !== assistantId || !m.parts) return m;
      const parts: Part[] = [...m.parts, { id: partId, type: 'tool', toolName, status: 'pending', args } as any];
      return { ...m, parts } as Message;
    }));
    return partId;
  }, []);

  const finishToolPart = useCallback((partId: string, status: 'done' | 'error') => {
    const assistantId = currentAssistantIdRef.current;
    if (!assistantId) return;
    setMessages(prev => prev.map(m => {
      if (m.id !== assistantId || !m.parts) return m;
      const parts = m.parts.map(p => (p.id === partId && p.type === 'tool' ? ({ ...p, status } as any) : p));
      return { ...m, parts } as Message;
    }));
  }, []);

  const appendAssistantText = useCallback((assistantId: string, delta: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== assistantId || !m.parts) return m;
      const parts = [...m.parts];
      const last = parts[parts.length - 1];
      if (!last || last.type !== 'text') {
        parts.push({ id: `part-${Date.now()}`, type: 'text', content: delta } as any);
      } else {
        (last as any).content = (last as any).content + delta;
      }
      return { ...m, parts } as Message;
    }));
  }, []);

  const send = useCallback(async (input: string, doStream?: DoStream) => {
    const text = input.trim();
    if (!text) return;
    if (isLoading || sendingRef.current) return;

    sendingRef.current = true;
    setIsLoading(true);

    const userMsg: Message = { id: `msg-${Date.now()}`, role: 'user', content: text } as Message;
    const base = (prev => [...prev, userMsg])(messages);
    setMessages(base);

    const assistantId = `msg-${Date.now()}-assistant`;
    currentAssistantIdRef.current = assistantId;
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', parts: [] } as Message]);

    const llmMessages: LLMMessage[] = [
      ...(config?.system ? [{ role: 'system' as const, content: config.system }] : []),
      ...base.map(m => ({ role: (m.role as 'user' | 'assistant' | 'system'), content: getTextFromMessage(m) })),
    ];

    try {
      const runner = doStream ?? config?.defaultDoStream;
      if (!runner) throw new Error('No stream runner provided');

      const { textStream } = await runner({ llmMessages, addToolPart, finishToolPart });

      let full = '';
      for await (const chunk of textStream) {
        full += chunk;
        if (chunk) appendAssistantText(assistantId, chunk);
      }
    } catch (e) {
      // fallback error message
      setMessages(prev => prev.map(m => {
        if (m.id !== assistantId || !m.parts) return m;
        const parts = [...m.parts];
        const last = parts[parts.length - 1];
        const errText = '抱歉，处理您的请求时出现错误。';
        if (!last || last.type !== 'text') {
          parts.push({ id: `part-${Date.now()}`, type: 'text', content: errText } as any);
        } else {
          (last as any).content = errText;
        }
        return { ...m, parts } as Message;
      }));
    } finally {
      setIsLoading(false);
      sendingRef.current = false;
      currentAssistantIdRef.current = null;
    }
  }, [messages, isLoading, config?.system, config?.defaultDoStream, addToolPart, finishToolPart, appendAssistantText]);

  return {
    messages,
    isLoading,
    send,
    addToolPart,
    finishToolPart,
    setMessages, // expose for advanced cases
  };
}
