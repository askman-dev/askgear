# AGENTS 指南（分层架构与约束）

本文件记录在迭代中需长期遵循的“分层与依赖、导入规范、目录与命名”约束，适用于本仓库全部代码。

## 分层架构与依赖方向

- 层级职责
  - Features：领域逻辑与契约（hooks、适配器、类型），不含 UI 与页面编排。
  - Components：纯 UI 组件（原子/复用/组合件），不承载跨域业务逻辑。
  - Pages：页面壳（编排、导航、状态聚合），不实现底层协议与通用引擎。
- 依赖方向（必须单向）
  - Pages → Components → Features。
  - 禁止反向依赖（例如 Features 引用 Components）。
- 单一真相（Single Source of Truth）
  - 对话模型与引擎以 `@features/conversation` 为唯一来源。
  - 图片识别能力以 `@features/recognize` 为唯一来源。
- 组合与注入原则
  - UI 通过组合/props/回调“注入”能力，不直接耦合底层逻辑实现。

## 路径与导入约束

- 别名（统一使用）
  - `@features/*`、`@components/*`、`@pages/*`、`@lib/*`、`@store/*`。
- TypeScript
  - 开启 `verbatimModuleSyntax`；类型一律使用 `import type` 导入。
  - 禁止循环依赖；禁止跨层“侧向”引用（绕过上层进行内部实现耦合）。
- 导出/聚合
  - 允许在子目录设置 `index.ts` 作为 barrel，但禁止多层级链式 re-export（增加调试成本）。

## 目录与命名约束

- 顶层目录（节选）
  - `src/features/*`：领域能力与契约
    - `conversation/*`：对话引擎、消息/分片类型、发送与工具执行契约
    - `recognize/*`：图片识别 Provider、事件模型与 Hook
  - `src/components/*`：纯 UI 组件
    - `conversation/*`：对话视图（消息列表、输入区、Thinking 展示等的组合）
    - `artifact/*`：构件创建/预览等 UI 组合
    - `dialog/*`：底部弹层类组件（统一基于 BottomSheet）
    - `message/*`：消息复用件（列表/项）
    - `input/*`：输入复用件（InputBar 等）
    - `ui/*`：通用基础 UI（BottomSheet、ThinkingIndicator、卡片等）
    - `layout/*`：布局/导航容器（如 BottomTabs）
  - `src/pages/*`：页面壳（仅编排与导航，不落底层协议）
- 命名规范
  - 页面：`*Page`（如 `ChatPage`）。
  - 组合/容器：`*View`、`*Panel`、`*Overlay`（语义区分展示/面板/浮层）。
  - 底部面板：`*Sheet`（如 `ImageRecognizeSheet`）。
  - 复用件：按职能归入 `message/*`、`input/*`、`ui/*` 等子域。

以上为强约束；新模块或文件命名与归档需先对齐本指引，再提交实现。

