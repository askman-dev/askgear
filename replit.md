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
  - `BottomTabs.tsx` - Main tab navigation with view state management
  - `TopQueriesTab.tsx` - Pre-configured camera queries
  - `ChatTab.tsx` - AI chat interface with streaming responses
  - `InsightTab.tsx` - Main tab with data extraction options
  - `BottomSheet.tsx` - Modal sheet component
  - `TextExtractSheet.tsx` - Text input modal with continue button
  - `ArtifactCreationView.tsx` - Full-screen artifact creation interface
  - `ArtifactChatOverlay.tsx` - Floating chat overlay for artifact creation
  - Other extract sheets for future features
- `src/lib/` - API clients and utilities
  - `openrouter.ts` - OpenRouter API client configuration
- `src/store/` - Zustand state management
  - `chat.ts` - Chat state with localStorage persistence

### Key Features
1. Bottom tab navigation between Insight and History tabs
2. Text extraction flow with continue button in top-right corner
3. Artifact creation interface with multi-layer UI:
   - Bottom layer: React component preview area
   - Floating overlay: Multi-turn chat interface for component creation
4. Chat tab with multi-turn AI conversations
5. Streaming AI responses via OpenRouter
6. Message history persists (last 20 messages in localStorage)
7. Mobile-first responsive design with 48px touch targets
8. Dynamic view switching (main/chat/artifact)

### Configuration
- **Server**: Vite dev server on port 5000 (0.0.0.0)
- **Replit Proxy**: Configured with HMR over WSS on port 443
- **Environment**: `VITE_OPENROUTER_API_KEY` for OpenRouter API access

### AI Models Available
- Default: `openai/gpt-4o-mini` (fast and cost-effective)
- Also available: Claude Sonnet, Gemini Flash, Llama 3

## Recent Changes
- October 10, 2025: Artifact Creation Feature
  - Modified TextExtractSheet to display continue button in top-right corner
  - Created ArtifactCreationView component for full-screen artifact interface
  - Created ArtifactChatOverlay with collapsible floating chat UI
  - Integrated artifact creation flow into BottomTabs navigation
  - Updated InsightTab to route text extraction to artifact creation
  - Tab bar now hides when in artifact or chat view
  - Fixed TypeScript errors and Vite HMR configuration

- October 10, 2025: Initial Replit setup completed
  - Installed all npm dependencies (228 packages)
  - Configured Vite for Replit environment (port 5000, 0.0.0.0 host)
  - Set up HMR for proxy/iframe compatibility
  - Configured OpenRouter API key via Replit Secrets (VITE_OPENROUTER_API_KEY)
  - Updated .gitignore to exclude environment files
  - Configured deployment for autoscale with build and preview

## Development Workflow
- Run `npm run dev` to start the development server
- App available at the Replit webview URL
- Changes hot-reload automatically via HMR over WebSocket
- Chat messages persist across refreshes in localStorage

## Deployment Configuration
- **Target**: Autoscale (stateless web app)
- **Build**: `npm run build` (TypeScript compilation + Vite build)
- **Run**: `npm run preview` (Vite preview server)

## User Preferences
- Mobile-first design prioritized
- Clean, minimal UI with camera expertise focus
