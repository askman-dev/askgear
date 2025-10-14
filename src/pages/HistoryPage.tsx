import { useEffect } from 'react';
import { Clock, BrainCircuit } from 'lucide-react';
import { useSolveStore, type SolveMetadata } from '@store/solve';
import { shallow } from 'zustand/shallow';
import clsx from 'clsx';

function HistoryItem({ solve, onSelect }: { solve: SolveMetadata; onSelect: (id: string) => void; }) {
  const formattedDate = new Date(solve.timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      onClick={() => onSelect(solve.id)}
      className={clsx(
        'p-4 rounded-2xl border border-gray-200',
        'bg-white shadow-sm',
        'transition-all duration-200',
        'min-h-[88px] flex flex-col justify-between',
        'cursor-pointer hover:border-violet-300 hover:shadow-md'
      )}
    >
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
          {solve.question || '无标题问题'}
        </h3>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
        <Clock className="w-3 h-3" />
        <span>{formattedDate}</span>
      </div>
    </div>
  );
}

export function HistoryPage() {
  // Subscribe to state and actions separately to prevent re-render loops
  const solveMetas = useSolveStore((s) => s.solveMetas);
  const fetchHistory = useSolveStore((s) => s.fetchHistory);
  const startSolveFromHistory = useSolveStore((s) => s.startSolveFromHistory);

  // Fetch history from IndexedDB ONLY when the component mounts
  useEffect(() => {
    void fetchHistory();
  }, []); // The empty dependency array is critical to break the loop

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="sticky top-0 z-10 px-4 py-4 bg-gray-50/80 backdrop-blur">
        <h1 className="text-2xl font-bold text-gray-900">历史</h1>
      </header>

      {solveMetas.length > 0 ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {solveMetas.map((solve) => (
            <HistoryItem key={solve.id} solve={solve} onSelect={startSolveFromHistory} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <BrainCircuit className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-800">暂无历史记录</h2>
          <p className="text-sm text-gray-500 mt-1">你进行的每一次解题都会被记录在这里。</p>
        </div>
      )}
    </div>
  );
}