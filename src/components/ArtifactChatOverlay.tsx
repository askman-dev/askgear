import { useState, useEffect, useRef } from 'react';
import { X, Send, ChevronDown, Sparkles, Loader2, Code2, Eye } from 'lucide-react';
import { streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { openrouter, DEFAULT_MODEL } from '../lib/openrouter';
import { useArtifactStore } from '../store/artifact';
import clsx from 'clsx';

interface ArtifactChatOverlayProps {
  initialText?: string;
  onClose: () => void;
  onBack: () => void;
  onPreviewUpdate?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolInvocations?: any[];
}

// Component template for new React components
const COMPONENT_TEMPLATE = (code: string, imports: string = '') => `
${imports}

${code}
`;

// System prompt for artifact creation
const SYSTEM_PROMPT = `You are an expert React developer assistant that creates reusable React components.
You have access to tools to create and preview React components.

Available libraries and utilities (already imported in the preview environment):
- React (React, useState, useEffect, useRef, etc.)
- Tailwind CSS (for styling with className)
- Lucide React icons (import { IconName } from 'lucide-react')
- clsx (for conditional classes)

When creating components:
1. Always use TypeScript interfaces for props
2. Use Tailwind CSS for all styling (no inline styles or CSS files)
3. Make components responsive and mobile-first
4. Include proper TypeScript types
5. Use semantic HTML elements
6. Add appropriate ARIA labels for accessibility
7. Make components self-contained and reusable

Component code should be a complete, valid React component that can be rendered directly.
Export the component as the default export.

When the user provides data (like a table or structured information):
1. Parse and understand the data structure
2. Create an appropriate component to display it
3. Make it interactive and visually appealing
4. Add sorting, filtering, or search capabilities if relevant`;

export function ArtifactChatOverlay({ initialText, onClose, onPreviewUpdate }: ArtifactChatOverlayProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSending = useRef(false); // Synchronous guard
  const [showCreatedBadge, setShowCreatedBadge] = useState(false);
  const { createArtifact, updateArtifact, currentArtifact } = useArtifactStore();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle initial text if provided
  useEffect(() => {
    if (initialText && messages.length === 0) {
      handleSend(initialText);
    }
  }, [initialText]); // Depend on initialText

  const handleSend = async (text?: string) => {
    const userInput = text || input.trim();
    if (!userInput || isLoading || isSending.current) return;

    isSending.current = true;
    setIsLoading(true);
    setInput('');

    // 1) add user message
    const userMsg = { id: `msg-${Date.now()}`, role: 'user' as const, content: userInput };
    const baseMessages: Message[] = [...messages, userMsg];
    setMessages(baseMessages);

    // 2) add assistant placeholder with "Thinking"
    const assistantId = `msg-${Date.now()}-assistant`;
    setMessages(prev => [
      ...prev,
      { id: assistantId, role: 'assistant', content: 'Thinking', toolInvocations: [] }
    ]);

    // Helpers to manage tool step badges
    const addToolStep = (toolName: string, args?: any) => {
      const callId = `tool-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setMessages(prev => prev.map(m => m.id === assistantId
        ? { ...m, toolInvocations: [ ...(m.toolInvocations || []), { id: callId, toolName, status: 'pending', args } ] }
        : m
      ));
      return callId;
    };
    const finishToolStep = (callId: string) => {
      setMessages(prev => prev.map(m => m.id === assistantId
        ? { ...m, toolInvocations: (m.toolInvocations || []).map((t: any) => t.id === callId ? { ...t, status: 'done' } : t) }
        : m
      ));
    };

    try {
      const { textStream } = await streamText({
        model: openrouter.chat(DEFAULT_MODEL),
        stopWhen: stepCountIs(5),
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...baseMessages.map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content }))
        ],
        tools: {
          EditReactComponent: tool({
            description: 'Create or update a React component with the given code',
            inputSchema: z.object({
              code: z.string().describe('The complete React component code (TypeScript/JSX)'),
              title: z.string().describe('A title for the component').optional(),
              description: z.string().describe('A brief description of what the component does').optional(),
              imports: z.string().describe('Any additional import statements needed').optional(),
            }),
            execute: async ({ code, title, description, imports }: any) => {
              const callId = addToolStep('EditReactComponent', { title });
              const fullCode = COMPONENT_TEMPLATE(code, imports || '');
              if (currentArtifact) {
                updateArtifact(currentArtifact.id, fullCode, { title, description });
              } else {
                createArtifact(fullCode, { title, description });
                setShowCreatedBadge(true);
              }
              finishToolStep(callId);
              return { success: true, message: `Component ${title || 'created'} successfully` };
            }
          }),
          Preview: tool({
            description: 'Trigger a preview update to show the latest component changes',
            inputSchema: z.object({}),
            execute: async () => {
              const callId = addToolStep('Preview');
              onPreviewUpdate?.();
              window.dispatchEvent(new CustomEvent('artifact-preview-update', { detail: { artifactId: currentArtifact?.id } }));
              finishToolStep(callId);
              return { success: true, message: 'Preview updated' };
            }
          })
        }
      });

      // 3) stream tokens into the same assistant message
      let full = '';
      for await (const chunk of textStream) {
        full += chunk;
        const content = full.length > 0 ? full : 'Thinking';
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content } : m));
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: '抱歉，处理您的请求时出现错误。请检查网络连接或 API 密钥配置。' } : m));
    } finally {
      setIsLoading(false);
      isSending.current = false;
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div
      className={clsx(
        'fixed inset-x-0 bg-white shadow-2xl transition-all duration-300 z-40',
        'max-w-2xl mx-auto rounded-t-2xl',
        isExpanded ? 'bottom-0 h-[70vh]' : 'bottom-0 h-16'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronDown
              className={clsx(
                'w-5 h-5 text-gray-600 transition-transform',
                isExpanded ? '' : 'rotate-180'
              )}
            />
          </button>
          <Sparkles className="w-5 h-5 text-violet-600" />
          <h3 className="font-semibold text-gray-900">AI 组件创建助手</h3>
        </div>
        <div className="flex items-center gap-2">
          {showCreatedBadge && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
              <Code2 className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700">组件已创建</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(70vh-140px)]">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-block p-4 bg-violet-50 rounded-xl mb-3">
                  <Sparkles className="w-8 h-8 text-violet-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  开始创建 React 组件
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  描述你想要的功能，或粘贴数据让 AI 生成合适的展示组件
                </p>
                {initialText && (
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-left max-w-md mx-auto">
                    <p className="text-xs font-semibold text-violet-700 mb-1">初始数据：</p>
                    <p className="text-xs text-gray-700 line-clamp-3">
                      {initialText}
                    </p>
                  </div>
                )}
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  className={clsx(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={clsx(
                      'max-w-[80%] rounded-2xl px-4 py-2.5',
                      msg.role === 'user'
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
                
                {/* Tool invocation indicators */}
                {msg.toolInvocations && msg.toolInvocations.length > 0 && (
                  <div className="flex justify-start mt-2 space-x-2">
                    {msg.toolInvocations.map((tool: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg">
                        {tool.status === 'pending' ? (
                          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                        ) : tool.toolName === 'EditReactComponent' ? (
                          <Code2 className="w-3 h-3 text-blue-600" />
                        ) : (
                          <Eye className="w-3 h-3 text-blue-600" />
                        )}
                        <span className="text-xs text-blue-700">
                          {tool.toolName === 'EditReactComponent'
                            ? (tool.status === 'pending' ? '组件更新中…' : '组件已更新')
                            : (tool.status === 'pending' ? '预览刷新中…' : '预览已刷新')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Streaming uses an assistant placeholder with 'Thinking', so no extra spinner here */}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleFormSubmit} className="border-t border-gray-200 p-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 min-h-[44px] max-h-32 rounded-2xl border border-gray-300 bg-gray-50 px-4 py-2 flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleFormSubmit(e as any);
                    }
                  }}
                  placeholder="描述组件功能或粘贴数据..."
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-500"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="shrink-0 w-11 h-11 rounded-full bg-violet-600 text-white flex items-center justify-center active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
