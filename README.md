# AskGear Frontend

AskGear is a learning assistant focused on math and puzzle solving. Users can capture questions, let the recognizer extract structured text, and drive an agent-style conversation to analyse or explore related practice.

## Setup

- `yarn install`  
- `cp .env.local.example .env.local` and add `VITE_OPENROUTER_API_KEY`, `DEFAULT_MODEL`, `MINI_MODEL`  
- `yarn dev` (Vite selects an available port automatically)  
- `yarn build` / `yarn test:recognize` for verification

## Core Features

- Quickly convert test papers or screenshots into readable question text, eliminating the tedious process of manual input.
- Track the AI's reasoning process in real-time using the "Analysis" tag to get a step-by-step explanation and the final answer.
- The "Similar Problems / Question Cards" tag allows learners to switch to related exercises or a card organization view at any time, connecting different knowledge points.

## Further Guidance

Project architecture, import rules, and naming conventions are documented in `AGENTS.md`. Refer there before adding pages, features, or shared components. For code style and linting tips see the inline comments and package scripts above.
