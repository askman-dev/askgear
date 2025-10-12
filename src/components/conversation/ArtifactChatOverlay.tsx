import { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Sparkles, Code2 } from 'lucide-react';
import { streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { openrouter, DEFAULT_MODEL } from '@lib/openrouter';
import { useArtifactStore } from '@store/artifact';
import clsx from 'clsx';
// message types are handled within conversation feature/UI components
import { MessageList } from '@components/message/MessageList';
import { InputBar } from '@components/input/InputBar';
import { ThinkingIndicator } from '@components/ui/ThinkingIndicator';
import { useConversation } from '@features/conversation';

interface ArtifactChatOverlayProps {
  initialText?: string;
  onClose: () => void;
  onBack: () => void;
  onPreviewUpdate?: () => void;
}

// message/part types moved to components/message/types

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
  const conv = useConversation({ system: SYSTEM_PROMPT });
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showCreatedBadge, setShowCreatedBadge] = useState(false);
  const { createArtifact, updateArtifact, currentArtifact } = useArtifactStore();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv.messages, conv.isLoading]);

  // Handle initial text if provided
  useEffect(() => {
    if (initialText && conv.messages.length === 0) {
      void handleSend(initialText);
    }
  }, [initialText]); // Depend on initialText

  const handleSend = async (text?: string) => {
    const userInput = text || input.trim();
    if (!userInput) return;
    setInput('');

    await conv.send(userInput, async ({ llmMessages, addToolPart, finishToolPart }) => {
      const { textStream } = await streamText({
        model: openrouter.chat(DEFAULT_MODEL),
        stopWhen: stepCountIs(5),
        messages: llmMessages,
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
              const partId = addToolPart('EditReactComponent', { title });
              const fullCode = COMPONENT_TEMPLATE(code, imports || '');
              if (currentArtifact) {
                updateArtifact(currentArtifact.id, fullCode, { title, description });
              } else {
                createArtifact(fullCode, { title, description });
                setShowCreatedBadge(true);
              }
              finishToolPart(partId, 'done');
              return { success: true, message: `Component ${title || 'created'} successfully` };
            }
          }),
          Preview: tool({
            description: 'Trigger a preview update to show the latest component changes',
            inputSchema: z.object({}),
            execute: async () => {
              const partId = addToolPart('Preview');
              onPreviewUpdate?.();
              window.dispatchEvent(new CustomEvent('artifact-preview-update', { detail: { artifactId: currentArtifact?.id } }));
              finishToolPart(partId, 'done');
              return { success: true, message: 'Preview updated' };
            }
          })
        }
      });
      return { textStream };
    });
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
          <div className="flex-1 overflow-y-auto p-4 h-[calc(70vh-140px)]">
            {conv.messages.length === 0 && (
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

            <MessageList messages={conv.messages as any} bottomRef={messagesEndRef} />

            {/* Thinking indicator when no active tool is pending */}
            {conv.isLoading && !conv.messages.some(m => m.role === 'assistant' && (m.parts || []).some((p: any) => p.type === 'tool' && p.status === 'pending')) && (
              <ThinkingIndicator />
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleFormSubmit} className="border-t border-gray-200 p-4">
            <InputBar
              value={input}
              onChange={setInput}
              onSubmit={() => handleSend()}
              placeholder="描述组件功能或粘贴数据..."
              disabled={conv.isLoading}
            />
          </form>
        </>
      )}
    </div>
  );
}
