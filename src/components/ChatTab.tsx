import { ArrowLeft } from 'lucide-react';
import { ConversationPanel } from './ConversationPanel';

interface ChatTabProps {
  onBack?: () => void;
  initialInput?: string;
}

export function ChatTab({ onBack, initialInput }: ChatTabProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <header className="sticky top-0 bg-white border-b border-gray-200 p-3 z-10 flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">聊天</h1>
          <p className="text-xs text-gray-600">Ask about cameras</p>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <ConversationPanel
          system="You are a helpful camera expert assistant. Provide concise, accurate information about cameras, photography, and gear."
          initialInput={initialInput}
        />
      </div>
    </div>
  );
}
