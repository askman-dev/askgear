import type { Message } from './types';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  bottomRef?: React.RefObject<HTMLDivElement | null>;
}

export function MessageList({ messages, bottomRef }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div key={msg.id}>
          <MessageItem message={msg} />
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
