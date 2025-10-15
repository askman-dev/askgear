# Glossary

This document defines key terms, concepts, and code entities within the project to ensure a shared understanding among team members.

---

## Core Concepts

- **Solve by Photo**
  - **Description**: The core feature of the application. Users can upload or take a picture of a problem, and the system will automatically recognize the question and initiate a conversation with an AI to get an analysis and solution.
  - **Source**: `docs/stories/STORY-solve-by-photo.md`

- **Research (研习)**
  - **Description**: The default home page tab of the application, serving as the entry point for core features like "Solve by Photo".
  - **Source**: `src/pages/ResearchPage.tsx`

- **History (历史)**
  - **Description**: One of the main tabs of the application, which displays a list of the user's past solving sessions. Users can re-enter and review previous conversations from here.
  - **Source**: `src/pages/HistoryPage.tsx`

## Architecture & Layers

- **Features**
  - **Description**: A collection of domain logic and core capabilities, including Hooks, adapters, and type definitions, but no UI implementation. This is the "brain" of the application's functionality.
  - **Dependencies**: Depended upon by `Pages` and `Components`; must not depend on them.
  - **Source**: `AGENTS.md`

- **Components**
  - **Description**: Pure, reusable UI elements like buttons, lists, and input bars. They should not contain any cross-domain business logic.
  - **Dependencies**: Depend on `Features` to receive capabilities (via Props), and are used by `Pages` for UI orchestration.
  - **Source**: `AGENTS.md`

- **Pages**
  - **Description**: A "shell" responsible for page orchestration, navigation, and state aggregation. They compose `Components` into a complete user interface.
  - **Dependencies**: Depend on `Components` and `Features`.
  - **Source**: `AGENTS.md`

- **Single Source of Truth**
  - **Description**: An architectural principle stating that a specific domain capability should have a single, unique source in the code. For example, all conversation-related capabilities originate from `@features/conversation`.
  - **Source**: `AGENTS.md`

## Core Data Structures

- **`SolveInput`**
  - **Description**: The data entity representing a complete "solving session" and the main object stored in the database. It includes the initial problem image, the recognized question text, the full conversation history (`messages`), and other metadata.
  - **Source**: `src/features/recognize/types.ts`

- **`Message`**
  - **Description**: Represents a single message within a conversation. It can be from a user or a response from the AI assistant. Each message has a `role` and `content` (or `parts`).
  - **Source**: `src/features/conversation/types.ts`

- **`Part`**
  - **Description**: A component of a `Message`. Used to support multiple content types in a single AI response, such as plain text (`text`), thought processes (`reasoning`), or tool calls (`tool`).
  - **Source**: `src/features/conversation/types.ts`

- **`ImageRef`**
  - **Description**: A data structure that references an image, containing a unique ID, an accessible `src` (URL), and an optional raw `File` object.
  - **Source**: `src/features/recognize/types.ts`

- **`RecognizedQuestion`**
  - **Description**: Represents the question text recognized from an image, containing an ID and `text` content.
  - **Source**: `src/features/recognize/types.ts`