import { Clock } from 'lucide-react';
import clsx from 'clsx';

interface Query {
  id: number;
  title: string;
  category: string;
  estimatedTime?: string;
}

const QUERIES: Query[] = [
  { id: 1, title: 'Compare GR4 vs X100-7', category: 'Compact Cameras', estimatedTime: '2s' },
  { id: 2, title: 'Best cameras under $1500', category: 'Budget', estimatedTime: '2s' },
  { id: 3, title: 'Sony A7IV vs Canon R6 II', category: 'Full Frame', estimatedTime: '2s' },
  { id: 4, title: 'Fujifilm X-T5 review', category: 'Reviews', estimatedTime: '2s' },
  { id: 5, title: 'Best street photography cameras', category: 'Use Case', estimatedTime: '2s' },
  { id: 6, title: 'Cameras released in 2025', category: 'Latest', estimatedTime: '2s' },
  { id: 7, title: 'Nikon Z6 III vs Z8', category: 'Full Frame', estimatedTime: '2s' },
  { id: 8, title: 'Best travel cameras 2025', category: 'Use Case', estimatedTime: '2s' },
];

export function TopQueriesTab() {
  return (
    <div className="h-full overflow-y-auto">
      <header className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <h1 className="text-2xl font-bold text-gray-900">历史</h1>
        <p className="text-sm text-gray-600 mt-1">最近的查询</p>
      </header>

      <div className="p-4 space-y-3">
        {QUERIES.map((query) => (
          <div
            key={query.id}
            className={clsx(
              'p-4 rounded-2xl border border-gray-200',
              'bg-white shadow-sm',
              'transition-all duration-200',
              'min-h-[88px] flex flex-col justify-between',
              // Temporarily disabled interaction
              'opacity-75 cursor-not-allowed'
            )}
          >
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {query.title}
              </h3>
              <p className="text-sm text-gray-600">
                {query.category}
              </p>
            </div>

            {query.estimatedTime && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                <Clock className="w-3 h-3" />
                <span>{query.estimatedTime}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 text-center text-sm text-gray-500">功能即将上线</div>
    </div>
  );
}
