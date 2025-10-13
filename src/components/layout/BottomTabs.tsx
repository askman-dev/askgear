import { useState } from 'react';
import { Star, History, Trophy } from 'lucide-react';
import { AchievementsPage, ChatPage, ResearchPage, ArtifactPage, ChallengePage } from '@pages/index';
import clsx from 'clsx';
import type { SolveInput } from '@features/recognize';

type TabId = 'research' | 'history' | 'challenge';
type ViewType = 'main' | 'chat' | 'artifact';

export function BottomTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('research');
  const [view, setView] = useState<ViewType>('main');
  const [chatPrefill, setChatPrefill] = useState<string | undefined>(undefined);
  const [artifactText, setArtifactText] = useState<string | undefined>(undefined);
  const [solveContext, setSolveContext] = useState<SolveInput | null>(null);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Container with max-width */}
      <div className="flex flex-col h-screen max-w-2xl mx-auto w-full bg-white shadow-lg">
        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {view === 'artifact' ? (
            <ArtifactPage initialText={artifactText} onBack={() => setView('main')} />
          ) : view === 'chat' ? (
            <ChatPage
              onBack={() => {
                setView('main');
                setSolveContext(null); // Clear solve context on back
              }}
              initialInput={chatPrefill}
              solveContext={solveContext}
            />
          ) : activeTab === 'research' ? (
            <ResearchPage 
              onStartChat={(opts) => {
                if (opts?.solveData) {
                  setSolveContext(opts.solveData);
                } else {
                  setChatPrefill(opts?.prefill);
                }
                setView('chat');
              }}
              onStartArtifact={(text: string) => { setArtifactText(text); setView('artifact'); }}
            />
          ) : activeTab === 'history' ? (
            <AchievementsPage />
          ) : (
            <ChallengePage />
          )}
        </div>

        {/* Bottom Tab Bar - hide in artifact/chat view */}
        {view === 'main' && (
          <nav className="flex border-t border-gray-200 bg-white">
            <button
              onClick={() => {
                setView('main');
                setActiveTab('research');
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
                  'inline-flex flex-col items-center gap-1 px-3 py-1',
                  activeTab === 'research'
                    ? 'text-violet-700'
                    : 'text-gray-600'
                )}
              >
                <Star className="w-5 h-5" />
                <span className="text-xs font-medium">研习</span>
              </span>
            </button>

            <button
              onClick={() => {
                setView('main');
                setActiveTab('challenge');
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
                  'inline-flex flex-col items-center gap-1 px-3 py-1',
                  activeTab === 'challenge'
                    ? 'text-violet-700'
                    : 'text-gray-600'
                )}
              >
                <Trophy className="w-5 h-5" />
                <span className="text-xs font-medium">挑战</span>
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
                  'inline-flex flex-col items-center gap-1 px-3 py-1',
                  activeTab === 'history'
                    ? 'text-violet-700'
                    : 'text-gray-600'
                )}
              >
                <History className="w-5 h-5" />
                <span className="text-xs font-medium">历史</span>
              </span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
