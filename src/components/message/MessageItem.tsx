import clsx from 'clsx';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { Loader2, Code2, Eye, ChevronRight, X } from 'lucide-react';
import { createPortal } from 'react-dom';
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
        <div className={clsx('max-w-[80%] rounded-2xl px-4 py-2.5 bg-gray-200 text-gray-800')}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  // assistant / system / tool (we primarily render assistant parts here)
  return (
    <div className={clsx('flex', 'justify-start')}>
      <div className="w-full max-w-full space-y-2">
        {(message.parts || []).map((part, index, arr) => {
          if (part.type === 'text') {
            return (
              <div key={part.id} className="py-1">
                <p className="text-sm whitespace-pre-wrap text-gray-900">{part.content}</p>
              </div>
            );
          }
          if (part.type === 'reasoning') {
            const hasTextAfter = arr.slice(index + 1).some((p) => p.type === 'text' && typeof p.content === 'string' && p.content.length > 0);
            return <ReasoningBlock key={part.id} content={part.content} hasTextAfter={hasTextAfter} />;
          }
          // Tool parts
          return (
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
          );
        })}
      </div>
    </div>
  );
}

type ReasoningBlock = { type: 'heading' | 'paragraph'; text: string };

function normalizeReasoning(content: string): ReasoningBlock[] {
  if (!content) return [];
  const expanded = content.replace(/\*\*(.+?)\*\*/g, (_match, inner) => `\n**${inner}**\n`);
  const lines = expanded.split(/\r?\n+/).map(line => line.trim()).filter(Boolean);
  const blocks: ReasoningBlock[] = [];
  const paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length) {
      blocks.push({ type: 'paragraph', text: paragraphBuffer.join('\n') });
      paragraphBuffer.length = 0;
    }
  };

  for (const line of lines) {
    const headingMatch = line.match(/^\*\*(.+?)\*\*$/);
    if (headingMatch) {
      flushParagraph();
      blocks.push({ type: 'heading', text: headingMatch[1].trim() });
    } else {
      paragraphBuffer.push(line);
    }
  }
  flushParagraph();

  if (blocks.length === 0) {
    return [{ type: 'paragraph', text: content }];
  }
  return blocks;
}

function ReasoningBlock({ content, hasTextAfter }: { content: string; hasTextAfter: boolean }) {
  const blocks = useMemo(() => normalizeReasoning(content), [content]);
  const [open, setOpen] = useState(false);
  const headings = blocks.filter((b) => b.type === 'heading');
  const latestHeading = headings.length > 0 ? headings[headings.length - 1].text : '思考中…';
  const shouldAnimate = !hasTextAfter && !open;

  const overlay = open
    ? createPortal(
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-black/70 backdrop-blur-sm pt-10"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md mx-auto px-4 pb-12"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-3xl bg-[#1f1f1f] text-gray-100 shadow-2xl border border-white/10 max-h-[85vh] flex flex-col overflow-hidden">
              <div className="sticky top-0 z-10 flex items-start gap-3 px-6 pt-6 pb-4 bg-[#1f1f1f]/95 backdrop-blur-sm">
                <div className="text-sm font-semibold leading-6 text-gray-100 flex-1">
                  {latestHeading}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-700/60 transition"
                  aria-label="关闭思考详情"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-6 pb-7 space-y-4 overflow-y-auto flex-1">
                {renderReasoningBlocks(blocks)}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex items-center gap-2 text-xs font-semibold text-gray-600 active:opacity-80 transition"
    >
      <span
        className={clsx('truncate', shouldAnimate ? 'thinking-pulse text-transparent bg-clip-text' : 'text-gray-600')}
      >
        {latestHeading}
      </span>
      <ChevronRight className="w-3 h-3 text-gray-400" />
    </button>
      {overlay}
    </>
  );
}

function renderReasoningBlocks(blocks: ReasoningBlock[]) {
  const elements: JSX.Element[] = [];
  let currentGroup: string[] = [];

  const flushGroup = () => {
    if (currentGroup.length === 0) return;
    elements.push(
      <div
        key={`paragraph-${elements.length}`}
        className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed"
      >
        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-300" />
        <p className="whitespace-pre-wrap flex-1">{currentGroup.join('\n')}</p>
      </div>
    );
    currentGroup = [];
  };

  blocks.forEach((block, idx) => {
    if (block.type === 'heading') {
      if (idx !== 0) {
        flushGroup();
      }
      elements.push(
        <div
          key={`heading-${elements.length}`}
          className="text-xs font-semibold text-gray-400 uppercase tracking-wide"
        >
          {block.text}
        </div>
      );
    } else {
      currentGroup.push(block.text);
    }
  });

  flushGroup();
  return elements;
}
