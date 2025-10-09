# AskGear App

## Overview
AskGear is a mobile-first camera expert assistant app built with React, TypeScript, and Vite. Users can browse top camera queries and have AI-powered conversations about cameras and photography gear.

## Project Setup (Completed - October 9, 2025)
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand with localStorage persistence
- **AI Integration**: Vercel AI SDK + OpenRouter API
- **Icons**: Lucide React

## Architecture

### Frontend Structure
- `src/components/` - React components
  - `BottomTabs.tsx` - Main tab navigation
  - `TopQueriesTab.tsx` - Pre-configured camera queries
  - `ChatTab.tsx` - AI chat interface with streaming responses
  - `BottomSheet.tsx` - Modal sheet component
  - Other extract sheets for future features
- `src/lib/` - API clients and utilities
  - `openrouter.ts` - OpenRouter API client configuration
- `src/store/` - Zustand state management
  - `chat.ts` - Chat state with localStorage persistence

### Key Features
1. Bottom tab navigation between Top Queries and Chat
2. Top Queries tab with 8 camera-related query cards
3. Chat tab with multi-turn AI conversations
4. Streaming AI responses via OpenRouter
5. Message history persists (last 20 messages in localStorage)
6. Mobile-first responsive design with 48px touch targets

### Configuration
- **Server**: Vite dev server on port 5000 (0.0.0.0)
- **Replit Proxy**: Configured with HMR over WSS on port 443
- **Environment**: `VITE_OPENROUTER_API_KEY` for OpenRouter API access

### AI Models Available
- Default: `openai/gpt-4o-mini` (fast and cost-effective)
- Also available: Claude Sonnet, Gemini Flash, Llama 3

## Recent Changes
- October 9, 2025: Initial Replit setup
  - Configured Vite for Replit environment (port 5000, 0.0.0.0 host)
  - Set up HMR for proxy/iframe compatibility
  - Added environment variables configuration
  - Updated .gitignore for Node.js project

## Development Workflow
- Run `npm run dev` to start the development server
- App available at the Replit webview URL
- Changes hot-reload automatically
- Chat messages persist across refreshes

## User Preferences
- Mobile-first design prioritized
- Clean, minimal UI with camera expertise focus
