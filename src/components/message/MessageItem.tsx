import clsx from 'clsx';
import { Loader2, Code2, Eye } from 'lucide-react';
import type { Message } from './types';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  // Custom renderer for the problem context block
  if (message.role === 'user' && (message as any).displayType === 'problemContext') {
    let text = '';
    let imageUrl = '';
    if (Array.isArray(message.content)) {
      // New multimodal content format
      const textPart = message.content.find(p => p.type === 'text');
      const imagePart = message.content.find(p => p.type === 'image');
      if (textPart) text = textPart.text.replace(/^Problem: /, ''); // Clean up prompt prefix
      if (imagePart) imageUrl = imagePart.image as string;
    } else if (typeof message.content === 'object' && message.content !== null) {
      // Backwards compatibility for the old object format, just in case
      text = (message.content as any).text ?? '';
      imageUrl = (message.content as any).imageUrl ?? '';
    }

    return (
      <div className="p-4 rounded-xl bg-gray-100 border border-gray-200">
        <p className="text-sm text-gray-800 whitespace-pre-wrap"><span className="font-semibold">题目：</span>{text}</p>
        {imageUrl && (
          <img src={imageUrl} alt="Problem source" className="mt-3 w-24 h-24 object-contain rounded-lg border bg-white" />
        )}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-sm font-semibold text-gray-800">风格：</span>
          <span className="px-3 py-1 rounded-full bg-white text-sm text-gray-700 border border-gray-200">小学生思维</span>
        </div>
      </div>
    );
  }

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
          ) : part.type === 'reasoning' ? (
            <div key={part.id} className={clsx('rounded-2xl px-3 py-2', 'bg-blue-50 text-blue-700 text-xs')}>
              <p className="whitespace-pre-wrap">{part.content}</p>
            </div>
          ) : ( // Renders tool parts
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

