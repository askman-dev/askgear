import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface ThinkingIndicatorProps {
  text?: string;
  className?: string;
  subtle?: boolean;
}

export function ThinkingIndicator({ text = 'Thinking…', className, subtle = false }: ThinkingIndicatorProps) {
  return (
    <div className={clsx('flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit', subtle ? 'bg-gray-100' : 'bg-gray-100', className)}>
      <Loader2 className={clsx('w-3.5 h-3.5 animate-spin', subtle ? 'text-gray-500' : 'text-gray-500')} />
      <span className={clsx('text-xs', subtle ? 'text-gray-600' : 'text-gray-700')}>{text}</span>
    </div>
  );
}
