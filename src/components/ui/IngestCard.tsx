import { PlusCircle, ChevronRight, Play } from 'lucide-react';
import clsx from 'clsx';

interface IngestCardProps {
  title: string;
  description: string;
  meta?: string; // e.g., "Today • 23 min"
  onClick?: () => void;
  trailing?: 'chevron' | 'play';
}

export function IngestCard({ title, description, meta = 'Today • 23 min', onClick, trailing = 'chevron' }: IngestCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'w-full text-left',
        'bg-white rounded-2xl shadow-sm',
        'p-4 flex items-center gap-4',
        'transition-transform active:scale-[0.99]',
      )}
    >
      {/* Thumbnail placeholder */}
      <div className="w-24 h-24 rounded-2xl bg-gray-200 flex items-center justify-center shrink-0">
        {/* simple abstract placeholders */}
        <div className="w-12 h-12 bg-gray-300 rounded-xl" />
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-semibold text-gray-900 truncate">{title}</div>
        <div className="text-gray-600 mt-1 line-clamp-2">{description}</div>

        <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
          <PlusCircle className="w-4 h-4" />
          <span className="truncate">{meta}</span>
        </div>
      </div>

      {/* Trailing */}
      <div className="self-center text-gray-400">
        {trailing === 'play' ? (
          <Play className="w-6 h-6" />
        ) : (
          <ChevronRight className="w-6 h-6" />
        )}
      </div>
    </button>
  );
}
