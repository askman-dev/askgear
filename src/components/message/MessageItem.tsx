import clsx from 'clsx';
import { Loader2, Code2, Eye } from 'lucide-react';
import type { Message } from './types';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  if (message.role === 'user') {
    return (
      <div className={clsx('flex', 'justify-end')}>
        <div className={clsx('max-w-[80%] rounded-2xl px-4 py-2.5', 'bg-violet-600 text-white')}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  // assistant / system / tool (we primarily render assistant parts here)
  return (
    <div className={clsx('flex', 'justify-start')}>
      <div className="max-w-[80%] space-y-2">
        {(message.parts || []).map((part) => (
          part.type === 'text' ? (
            <div key={part.id} className={clsx('rounded-2xl px-4 py-2.5', 'bg-gray-100 text-gray-900')}>
              <p className="text-sm whitespace-pre-wrap">{part.content}</p>
            </div>
          ) : (
            <div key={part.id} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg w-fit">
              {part.status === 'pending' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : part.toolName === 'EditReactComponent' ? (
                <Code2 className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span className="text-xs text-blue-700">
                {part.toolName === 'EditReactComponent'
                  ? (part.status === 'pending' ? '组件更新中…' : part.status === 'done' ? '组件已更新' : '组件更新失败')
                  : (part.status === 'pending' ? '预览刷新中…' : part.status === 'done' ? '预览已刷新' : '预览刷新失败')}
              </span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

