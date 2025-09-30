import { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useChatStore } from '../store/chat';
import { openrouter, DEFAULT_MODEL } from '../lib/openrouter';
import { streamText } from 'ai';
import clsx from 'clsx';

export function ChatTab() {
  const { messages, addMessage, updateMessage, isLoading, setLoading, clearMessages } = useChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    setInput('');
    setLoading(true);

    // Add user message
    addMessage({ role: 'user', content: userInput });

    // Add empty assistant message
    const assistantId = addMessage({ role: 'assistant', content: '' });

    try {
      const { textStream } = await streamText({
        model: openrouter(DEFAULT_MODEL),
        messages: [
          {
            role: 'system',
            content: 'You are a helpful camera expert assistant. Provide concise, accurate information about cameras, photography, and gear.'
          },
          ...messages.map(m => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content
          })),
          { role: 'user', content: userInput }
        ],
      });

      let fullContent = '';
      for await (const chunk of textStream) {
        fullContent += chunk;
        updateMessage(assistantId, fullContent);
      }
    } catch (error) {
      console.error('Chat error:', error);
      updateMessage(
        assistantId,
        'Sorry, I encountered an error. Please check your OpenRouter API key in .env.local and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Chat</h1>
          <p className="text-xs text-gray-600">Ask about cameras</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear
          </button>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Start a conversation
            </h2>
            <p className="text-sm text-gray-500 max-w-sm">
              Ask me to compare cameras, recommend models, or answer photography questions
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={clsx(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={clsx(
                    'max-w-[85%] px-4 py-3 rounded-lg',
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content || (message.role === 'assistant' && '...')}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about cameras..."
            disabled={isLoading}
            rows={1}
            className={clsx(
              'flex-1 resize-none',
              'px-4 py-3 rounded-lg',
              'border-2 border-gray-200',
              'focus:outline-none focus:border-blue-500',
              'text-base',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={clsx(
              'w-11 h-11 rounded-lg flex items-center justify-center',
              'bg-blue-600 text-white',
              'hover:bg-blue-700 active:scale-95',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}