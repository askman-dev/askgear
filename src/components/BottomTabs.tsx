import { useState } from 'react';
import { BarChart3, MessageSquare } from 'lucide-react';
import { TopQueriesTab } from './TopQueriesTab';
import { ChatTab } from './ChatTab';
import clsx from 'clsx';

type TabId = 'queries' | 'chat';

export function BottomTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('queries');

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Container with max-width */}
      <div className="flex flex-col h-screen max-w-2xl mx-auto w-full bg-white shadow-lg">
        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'queries' && <TopQueriesTab />}
          {activeTab === 'chat' && <ChatTab />}
        </div>

        {/* Bottom Tab Bar */}
        <nav className="flex border-t border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab('queries')}
            className={clsx(
              'flex-1 flex flex-col items-center justify-center',
              'min-h-[48px] py-2 px-4',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              activeTab === 'queries'
                ? 'text-blue-600 border-t-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 border-t-2 border-transparent'
            )}
          >
            <BarChart3 className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Top Queries</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={clsx(
              'flex-1 flex flex-col items-center justify-center',
              'min-h-[48px] py-2 px-4',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              activeTab === 'chat'
                ? 'text-blue-600 border-t-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 border-t-2 border-transparent'
            )}
          >
            <MessageSquare className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Chat</span>
          </button>
        </nav>
      </div>
    </div>
  );
}