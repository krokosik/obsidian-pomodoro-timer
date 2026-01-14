# AGENTS.md - Obsidian Pomodoro Timer Plugin

This document provides guidelines for AI coding agents working on this codebase.

## Project Overview

An Obsidian plugin implementing a Pomodoro timer with task tracking, logging, and
integration with Daily/Weekly notes. Built with TypeScript and Svelte 4.

**Tech Stack:** TypeScript 5.2, Svelte 4.2, esbuild, Obsidian API

## Build Commands

```bash
# Development build (with watch mode)
npm run dev

# Production build (includes type checking)
npm run build

# Type check only (no emit)
npx tsc -noEmit -skipLibCheck

# Lint (ESLint with TypeScript plugin)
npx eslint src/**/*.ts

# Format code with Prettier
npx prettier --write "src/**/*.{ts,svelte}"

# Version bump for releases
npm run version
```

## Testing

**No test framework is currently configured.** There are no test files in the project.
If adding tests, consider using Vitest for TypeScript/Svelte compatibility.

## Code Style Guidelines

### Formatting (Prettier)

- **Indentation:** 4 spaces (NOT tabs, despite .editorconfig)
- **Quotes:** Single quotes (`'`)
- **Semicolons:** None (no trailing semicolons)
- **Trailing commas:** Always use trailing commas
- **Line width:** 80 characters max
- **Arrow function parens:** Always include `(x) => x`

```typescript
// Correct
const foo = (x: number) => {
    return x + 1
}

// Incorrect
const foo = x => {
    return x + 1;
}
```

### Imports

1. **Path aliases:** Use bare module names from `src/` (configured in tsconfig baseUrl)
2. **Order:** External packages first, then local modules
3. **Type imports:** Use `type` keyword for type-only imports

```typescript
// External packages
import { Notice, Plugin, WorkspaceLeaf } from 'obsidian'
import { writable, derived } from 'svelte/store'

// Local modules (use bare names, not relative paths)
import Timer from 'Timer'
import PomodoroSettings, { type Settings } from 'Settings'
import { extractHashtags, ensureFileExists } from 'utils'
import type { TaskItem } from 'Tasks'
```

### TypeScript Conventions

- **Strict null checks:** Enabled - handle `null`/`undefined` explicitly
- **No implicit any:** Enabled - always provide type annotations
- **Type exports:** Export types alongside values when needed

```typescript
// Type definitions
export type Mode = 'WORK' | 'BREAK'

export interface Settings {
    workLen: number
    breakLen: number
    autostart: boolean
}

// String literal unions for constrained values
type LogFileType = 'DAILY' | 'WEEKLY' | 'FILE' | 'NONE'
type LogLevel = 'ALL' | 'WORK' | 'BREAK'
```

### Naming Conventions

- **Classes:** PascalCase (`PomodoroTimerPlugin`, `TaskTracker`)
- **Interfaces/Types:** PascalCase (`TimerState`, `TaskItem`)
- **Functions/methods:** camelCase (`toggleTimer`, `getSettings`)
- **Variables:** camelCase (`workLen`, `customSound`)
- **Constants:** camelCase for objects, SCREAMING_SNAKE_CASE for primitives
- **Files:**
  - TypeScript classes: PascalCase (`Timer.ts`, `Settings.ts`)
  - Svelte components: PascalCase with suffix (`TimerViewComponent.svelte`)
  - Utilities: camelCase (`utils.ts`, `stores.ts`)

### Svelte Components

- Use `lang="ts"` in script blocks
- Props use `export let` syntax
- Reactive statements with `$:` for derived values
- Store subscriptions use `$store` syntax

```svelte
<script lang="ts">
import type Timer from 'Timer'

export let timer: Timer

$: strokeOffset = $timer.remained.millis / $timer.count * offset
</script>
```

### State Management

Uses Svelte stores pattern:

```typescript
import { writable, derived } from 'svelte/store'
import type { Readable } from 'svelte/store'

// Class implementing Readable interface
export default class Timer implements Readable<TimerStore> {
    private store: Readable<TimerStore>
    public subscribe  // Exposed for Svelte's $ syntax

    constructor() {
        let store = writable(this.state)
        this.update = store.update
        this.store = derived(store, ($state) => ({
            ...$state,
            computed: this.computeValue($state),
        }))
        this.subscribe = this.store.subscribe
    }
}
```

### Error Handling

- Use Obsidian's `Notice` class for user-facing messages
- Throw `Error` with descriptive messages for invalid states
- Handle async operations with try/catch

```typescript
import { Notice } from 'obsidian'

// User notifications
new Notice('Timer reset')
new Notice(`Timer mode: ${t.mode}`)

// Error handling
if (file instanceof TFile) {
    // handle file
} else {
    throw new Error(`invalid file path: ${path}`)
}
```

### Obsidian Plugin Patterns

- Main class extends `Plugin` with `onload()`/`onunload()` lifecycle
- Settings extend `PluginSettingTab`
- Views extend `ItemView`
- Use `this.addCommand()`, `this.addRibbonIcon()`, `this.registerView()`

```typescript
export default class PomodoroTimerPlugin extends Plugin {
    async onload() {
        // Initialize settings, timer, tasks
        this.registerView(VIEW_TYPE_TIMER, (leaf) => new TimerView(this, leaf))
        this.addRibbonIcon('timer', 'Toggle timer panel', () => { ... })
        this.addCommand({ id: 'toggle-timer', name: 'Toggle timer', callback: ... })
    }

    onunload() {
        // Cleanup subscriptions, terminate workers
    }
}
```

### Web Workers

Worker files use `.worker.ts` suffix and are inlined during build:

```typescript
// @ts-ignore
import Worker from 'clock.worker'

this.clock = Worker()
this.clock.onmessage = ({ data }: any) => {
    this.tick(data as number)
}
```

## Project Structure

```
src/
├── main.ts                 # Plugin entry point
├── Timer.ts                # Core timer logic with Svelte store
├── TimerView.ts            # Obsidian ItemView wrapper
├── TimerViewComponent.svelte
├── Tasks.ts                # Task management store
├── TasksComponent.svelte
├── TaskTracker.ts          # Active task tracking
├── Settings.ts             # Plugin settings with Svelte store
├── Logger.ts               # Session logging
├── clock.worker.ts         # Web Worker for timing
├── utils.ts                # Utility functions
├── stores.ts               # Store exports
└── serializer/             # Task format parsers
    ├── TaskModels.ts       # Types and regex patterns
    ├── DefaultTaskSerializer.ts
    └── DataviewTaskSerializer.ts
```

## Key Dependencies

- `obsidian` - Obsidian API types
- `obsidian-daily-notes-interface` - Daily/Weekly notes integration
- `svelte` / `svelte-preprocess` - UI framework
- `esbuild` / `esbuild-svelte` - Build tooling

## ESLint Rules

- `@typescript-eslint/no-unused-vars`: Error (args: none)
- `@typescript-eslint/ban-ts-comment`: Off (allows @ts-ignore)
- `@typescript-eslint/no-empty-function`: Off
- `no-prototype-builtins`: Off
