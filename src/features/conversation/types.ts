export type Part =
  | { id: string; type: 'text'; content: string }
  | { id: string; type: 'reasoning'; content: string }
  | { id: string; type: 'tool'; toolName: string; status: 'pending' | 'done' | 'error'; args?: any };

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content?: string;
  parts?: Part[];
  // Optional UI hint for special rendering (kept optional to avoid coupling)
  displayType?: string;
}

export type LLMMessage = { role: 'user' | 'assistant' | 'system'; content: string | any[] };

export interface SendArgs {
  llmMessages: LLMMessage[];
  addToolPart: (toolName: string, args?: any) => string; // returns partId
  finishToolPart: (partId: string, status: 'done' | 'error') => void;
  abortSignal?: AbortSignal;
}

export type DoStream = (
  args: SendArgs
) => Promise<{ fullStream: AsyncIterable<any> } | { textStream: AsyncIterable<string> }>;

export interface ConversationConfig {
  system?: string;
  defaultDoStream?: DoStream;
  solveId?: string;
}
