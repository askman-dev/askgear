import { useState } from 'react';
import { Star, History } from 'lucide-react';
import { TopQueriesTab } from './TopQueriesTab';
import { ChatTab } from './ChatTab';
import { InsightTab } from './InsightTab';
import clsx from 'clsx';

type TabId = 'start' | 'history';

export function BottomTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('start');
  const [view, setView] = useState<'main' | 'chat'>('main');
  const [chatPrefill, setChatPrefill] = useState<string | undefined>(undefined);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Container with max-width */}
      <div className="flex flex-col h-screen max-w-2xl mx-auto w-full bg-white shadow-lg">
        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {view === 'chat' ? (
            <ChatTab onBack={() => setView('main')} initialInput={chatPrefill} />
          ) : activeTab === 'start' ? (
            <InsightTab onStartChat={(opts) => { setChatPrefill(opts?.prefill); setView('chat'); }} />
          ) : (
            <TopQueriesTab />
          )}
        </div>

        {/* Bottom Tab Bar */}
        <nav className="flex border-t border-gray-200 bg-white">
          <button
            onClick={() => {
              setView('main');
              setActiveTab('start');
            }}
            className={clsx(
              'flex-1 flex items-center justify-center',
              'min-h-[56px] py-2 px-2',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
            )}
          >
            <span
              className={clsx(
                'inline-flex items-center gap-1 px-3 py-1 rounded-full',
                activeTab === 'start'
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-600'
              )}
            >
              <Star className="w-5 h-5" />
              <span className="text-sm font-medium">开始</span>
            </span>
          </button>

          <button
            onClick={() => {
              setView('main');
              setActiveTab('history');
            }}
            className={clsx(
              'flex-1 flex items-center justify-center',
              'min-h-[56px] py-2 px-2',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
            )}
          >
            <span
              className={clsx(
                'inline-flex items-center gap-1 px-3 py-1 rounded-full',
                activeTab === 'history'
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-600'
              )}
            >
              <History className="w-5 h-5" />
              <span className="text-sm font-medium">历史</span>
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
}
