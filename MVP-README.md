# AskGear MVP - Basic Interactive Prototype

## ✅ Completed Features

1. **Bottom Tab Navigation** - Switch between Top Queries and Chat tabs
2. **Top Queries Tab** - Display list of 8 camera-related query cards (display only, no tap functionality yet)
3. **Chat Tab** - Multi-turn conversation with streaming AI responses via OpenRouter
4. **Message History** - Persists last 20 messages in localStorage
5. **Mobile-First Design** - 48px touch targets, responsive layout, iOS-optimized inputs

## 🚀 Getting Started

### 1. Setup OpenRouter API Key

1. Get an API key from [OpenRouter.ai](https://openrouter.ai/)
2. Open `.env.local` and replace `your-api-key-here` with your actual key:

```bash
VITE_OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
```

### 2. Run the Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5173/

### 3. Test the App

**Top Queries Tab:**
- View 8 pre-configured camera queries
- Cards are display-only (tap functionality coming in next iteration)

**Chat Tab:**
- Ask questions about cameras
- AI responds with streaming text (character-by-character)
- Multi-turn conversation with context
- Messages persist across refreshes (last 20 stored)
- Clear history with "Clear" button

## 📱 Mobile Testing

The app is mobile-first and should work great on:
- iOS Safari
- Chrome on Android
- Desktop browsers (responsive)

To test on your phone:
1. Run `npm run dev -- --host`
2. Access from phone using your computer's IP address

## 🏗️ Project Structure

```
src/
├── components/
│   ├── BottomTabs.tsx       # Main tab navigation
│   ├── TopQueriesTab.tsx    # Query list view
│   └── ChatTab.tsx          # Chat interface with streaming
├── lib/
│   └── openrouter.ts        # OpenRouter API client
├── store/
│   └── chat.ts              # Zustand chat state
├── App.tsx                  # Main app component
└── index.css                # Tailwind + mobile styles
```

## 🎯 Available AI Models

Default: `openai/gpt-4o-mini` (fast and cost-effective)

Other models available in `src/lib/openrouter.ts`:
- `anthropic/claude-3.5-sonnet`
- `google/gemini-flash-1.5`
- `meta-llama/llama-3.2-3b-instruct:free`

## 🐛 Troubleshooting

**Chat not working?**
- Check that your API key is set correctly in `.env.local`
- Restart the dev server after changing `.env.local`
- Check browser console for errors

**Styles not loading?**
- Ensure Tailwind CSS is configured: `tailwind.config.js` and `postcss.config.js` exist
- Check that `index.css` has Tailwind directives

## 📝 What's Next (Post-MVP)

- [ ] Add query tap interaction → auto-send to Chat tab
- [ ] Parse markdown tables from AI responses
- [ ] Create interactive comparison table component
- [ ] Integrate real camera database
- [ ] Add loading skeletons
- [ ] Improve error handling
- [ ] Add tests

## 🔧 Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **State**: Zustand with localStorage persistence
- **AI**: Vercel AI SDK + OpenRouter
- **Icons**: Lucide React

## 📦 Dependencies

Key packages:
- `ai` ^5.0.44 - Vercel AI SDK for streaming
- `@ai-sdk/openai` ^2.0.0 - OpenAI-compatible provider
- `zustand` ^4.5.0 - State management
- `tailwindcss` ^4.1.11 - Styling
- `lucide-react` ^0.544.0 - Icons

## 🎉 Success Criteria (All Met!)

✅ User can switch between two tabs
✅ Top Queries tab shows 8+ query cards
✅ Chat tab accepts user input
✅ AI responses stream character-by-character
✅ Conversation history persists on refresh
✅ Multi-turn conversation works (remembers context)
✅ Works on mobile device (responsive)
✅ Dev server running and accessible

---

**Built in 1 day! 🚀**