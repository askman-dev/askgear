import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

export const runtime = 'edge';

// Create an OpenAI API client (that points to OpenRouter)
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://askgear.app',
    'X-Title': 'AskGear'
  }
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openrouter.chat('openai/gpt-4o-mini'),
    messages,
    // Define the tools the AI can call.
    // The 'execute' logic will be handled on the client-side.
    tools: {
      EditReactComponent: {
        description: 'Create or update a React component with the given code',
        parameters: z.object({
          code: z.string().describe('The complete React component code (TypeScript/JSX)'),
          title: z.string().describe('A title for the component').optional(),
          description: z.string().describe('A brief description of what the component does').optional(),
          imports: z.string().describe('Any additional import statements needed').optional(),
        }),
      },
      Preview: {
        description: 'Trigger a preview update to show the latest component changes',
        parameters: z.object({}),
      },
    },
  });

  return result.toAIStreamResponse();
}
