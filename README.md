# AskGear Frontend

AskGear is a learning assistant focused on math and puzzle solving. Users can capture questions, let the recognizer extract structured text, and drive an agent-style conversation to analyse or explore related practice.

## Setup

- `yarn install`  
- `cp .env.local.example .env.local` and add `VITE_OPENROUTER_API_KEY`, `DEFAULT_MODEL`, `MINI_MODEL`  
- `yarn dev` (Vite selects an available port automatically)  
- `yarn build` / `yarn test:recognize` for verification

## Core Features

- 将试卷或截图快速转换为可阅读的题干，省去手动录入的繁琐。  
- 借助“分析”标签实时追踪 AI 的推理过程，得到逐步讲解与最终答案。  
- “同类型题 / 题目卡片”标签让学习者可以随时切换到相关练习或题卡整理视图，把知识点连结在一起。

## Further Guidance

Project architecture, import rules, and naming conventions are documented in `AGENTS.md`. Refer there before adding pages, features, or shared components. For code style and linting tips see the inline comments and package scripts above.
