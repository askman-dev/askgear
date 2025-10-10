import { useState } from 'react';
import { X, Send, ChevronDown, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface ArtifactChatOverlayProps {
  initialText?: string;
  onClose: () => void;
  onBack: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ArtifactChatOverlay({ initialText, onClose }: ArtifactChatOverlayProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Placeholder for AI response (UI only, no logic)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '这是一个占位回复。实际的 AI 对话逻辑将在后续实现。',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 500);
  };

  return (
    <div
      className={clsx(
        'fixed inset-x-0 bg-white shadow-2xl transition-all duration-300 z-40',
        'max-w-2xl mx-auto',
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
                isExpanded && 'rotate-180'
              )}
            />
          </button>
          <Sparkles className="w-5 h-5 text-violet-600" />
          <h3 className="font-semibold text-gray-900">创建组件</h3>
        </div>
        <div className="flex items-center gap-2">
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
            {initialText && messages.length === 0 && (
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-violet-700">初始文本：</span>
                  <br />
                  {initialText.substring(0, 200)}
                  {initialText.length > 200 && '...'}
                </p>
              </div>
            )}

            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-block p-4 bg-violet-50 rounded-xl mb-3">
                  <Sparkles className="w-8 h-8 text-violet-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  开始创建组件
                </h4>
                <p className="text-sm text-gray-600">
                  描述你想要的功能，AI 将帮你生成 React 组件
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
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
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 min-h-[44px] max-h-32 rounded-2xl border border-gray-300 bg-gray-50 px-4 py-2 flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="描述你想要的组件功能..."
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="shrink-0 w-11 h-11 rounded-full bg-violet-600 text-white flex items-center justify-center active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
