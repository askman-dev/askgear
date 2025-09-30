import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, content: string) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,

      addMessage: (msg) => {
        const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const newMessage: Message = {
          ...msg,
          id,
          timestamp: Date.now()
        };

        set((state) => ({
          messages: [...state.messages, newMessage]
        }));

        return id;
      },

      updateMessage: (id, content) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, content } : msg
          )
        }));
      },

      clearMessages: () => set({ messages: [] }),

      setLoading: (loading) => set({ isLoading: loading })
    }),
    {
      name: 'askgear-chat-storage',
      // Only persist the last 20 messages
      partialize: (state) => ({
        messages: state.messages.slice(-20)
      })
    }
  )
);