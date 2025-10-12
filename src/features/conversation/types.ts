export type Part =
  | { id: string; type: 'text'; content: string }
  | { id: string; type: 'tool'; toolName: string; status: 'pending' | 'done' | 'error'; args?: any };

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content?: string;
  parts?: Part[];
}

export type LLMMessage = { role: 'user' | 'assistant' | 'system'; content: string };

export interface SendArgs {
  llmMessages: LLMMessage[];
  addToolPart: (toolName: string, args?: any) => string; // returns partId
  finishToolPart: (partId: string, status: 'done' | 'error') => void;
}

export type DoStream = (args: SendArgs) => Promise<{ textStream: AsyncIterable<string> }>;

export interface ConversationConfig {
  system?: string;
  defaultDoStream?: DoStream;
}
