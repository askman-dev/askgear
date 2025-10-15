import { useCallback, useEffect, useRef, useState } from 'react';
import type { ConversationConfig, DoStream, LLMMessage, Message, Part } from './types';
import { useSolveStore } from '@store/solve';

export function useConversation(config?: ConversationConfig) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const currentAssistantIdRef = useRef<string | null>(null);
  const sendingRef = useRef(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounced function to update the database
  const debouncedUpdate = useCallback((solveId: string, msgs: Message[]) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      useSolveStore.getState().updateMessages(solveId, msgs);
    }, 1000); // 1-second debounce
  }, []);

  // Effect to persist messages when they change
  useEffect(() => {
    if (config?.solveId && messages.length > 0) {
      debouncedUpdate(config.solveId, messages);
    }
    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [messages, config?.solveId, debouncedUpdate]);

  // Compute the minimal suffix to append from an incoming delta to avoid duplicated text
  function computeDeltaSuffix(prevText: string, delta: string): string {
    if (!delta) return '';
    if (!prevText) return delta;
    // If the provider sends snapshots that start with previous text
    if (delta.startsWith(prevText)) return delta.slice(prevText.length);
    // Find the largest overlap between suffix(prev) and prefix(delta)
    const maxOverlap = Math.min(prevText.length, 200);
    for (let k = maxOverlap; k > 0; k--) {
      if (prevText.slice(-k) === delta.slice(0, k)) {
        return delta.slice(k);
      }
    }
    // No overlap — append as-is
    return delta;
  }

  const addToolPart = useCallback((toolName: string, args?: any) => {
    const partId = `part-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const assistantId = currentAssistantIdRef.current;
    if (!assistantId) return partId;
    setMessages(prev => prev.map(m => {
      if (m.id !== assistantId || !m.parts) return m;
      const parts: Part[] = [...m.parts, { id: partId, type: 'tool', toolName, status: 'pending', args } as Part & { type: 'tool' }];
      return { ...m, parts } as Message;
    }));
    return partId;
  }, []);

  const finishToolPart = useCallback((partId: string, status: 'done' | 'error') => {
    const assistantId = currentAssistantIdRef.current;
    if (!assistantId) return;
    setMessages(prev => prev.map(m => {
      if (m.id !== assistantId || !m.parts) return m;
      const parts = m.parts.map(p => (p.id === partId && p.type === 'tool' ? ({ ...p, status } as Part & { type: 'tool' }) : p));
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
        const prevText = (last as any).content as string;
        const toAppend = computeDeltaSuffix(prevText, delta);
        (last as any).content = prevText + toAppend;
      }
      return { ...m, parts } as Message;
    }));
  }, []);

  const appendAssistantReasoning = useCallback((assistantId: string, delta: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== assistantId || !m.parts) return m;
      const parts = [...m.parts];
      const last = parts[parts.length - 1];
      if (!last || last.type !== 'reasoning') {
        parts.push({ id: `part-${Date.now()}`, type: 'reasoning', content: delta } as any);
      } else {
        const prevText = (last as any).content as string;
        const toAppend = computeDeltaSuffix(prevText, delta);
        (last as any).content = prevText + toAppend;
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
      // Convert UI message history to AI message history
      ...base.map((m): LLMMessage => {
        if (typeof m.content === 'string') {
          return { role: m.role as 'user' | 'assistant' | 'system', content: m.content };
        }
        // Handle multimodal user messages
        if (m.role === 'user' && Array.isArray(m.content)) {
          return { role: 'user', content: m.content } as any;
        }
        // Handle assistant messages with parts
        if (m.role === 'assistant' && m.parts) {
          const textContent = m.parts.filter(p => p.type === 'text').map(p => (p as any).content).join('\n');
          return { role: 'assistant', content: textContent };
        }
        // Fallback for unexpected message shapes
        return { role: m.role as 'user' | 'assistant' | 'system', content: '' };
      })
    ];

    try {
      const runner = doStream ?? config?.defaultDoStream;
      if (!runner) throw new Error('No stream runner provided');

      const result = await runner({ llmMessages, addToolPart, finishToolPart });

      if ('fullStream' in result && result.fullStream) {
        for await (const part of (result as any).fullStream) {
          const t = String(part?.type ?? '');
          const delta = String(
            part?.textDelta ?? part?.delta?.text ?? part?.delta?.output_text ?? part?.text ?? ''
          );
          if (!delta) continue;
          const isReasoning = t === 'reasoning-delta' || t === 'response.reasoning.delta' || /reasoning-?delta$/.test(t);
          const isText = t === 'text-delta' || t === 'response.output_text.delta' || /output_text\.delta$/.test(t) || /(^|\.)text-delta$/.test(t);

          if (isReasoning) {
            appendAssistantReasoning(assistantId, delta);
          } else if (isText) {
            appendAssistantText(assistantId, delta);
          }
        }
      } else if ('textStream' in result && (result as any).textStream) {
        for await (const chunk of (result as any).textStream) {
          if (chunk) appendAssistantText(assistantId, chunk);
        }
      } else {
        throw new Error('Invalid stream runner result');
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
  }, [messages, isLoading, config?.system, config?.defaultDoStream, addToolPart, finishToolPart, appendAssistantText, appendAssistantReasoning]);

  return {
    messages,
    isLoading,
    send,
    addToolPart,
    finishToolPart,
    setMessages, // expose for advanced cases
  };
}
