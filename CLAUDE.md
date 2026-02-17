# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MARK CMS is a local-first Markdown content management system built with **Tauri 2** (Rust backend) + **React 19** (TypeScript frontend) + **Vite 7**. Desktop app targeting macOS. Default language is Japanese.

## Commands

```bash
npm run dev          # Start Vite dev server (port 1420)
npm run build        # Production build (tsc + vite build)
npm run tauri dev    # Run full Tauri desktop app in dev mode
npm run tauri build  # Build distributable desktop app
npm run lint         # Check with Biome
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format with Biome
```

No test framework is configured yet.

## Architecture

### Frontend (`src/`)

- **Entry**: `main.tsx` → `App.tsx` (router + context providers)
- **Pages**: `pages/` — PascalCase with "Page" suffix (e.g., `EditorPage.tsx`)
- **Components**: `components/` — organized by domain (`layout/`, `editor/`)
- **Hooks**: `hooks/` — `useWorkspace` (workspace state), `useTheme` (light/dark), `useLocale` (i18n)
- **Commands**: `commands/` — Tauri IPC wrappers (`workspace.ts`, `config.ts`, `files.ts`)
- **Types**: `types/` — shared TypeScript interfaces (`workspace.ts`, `content.ts`)
- **i18n**: `i18n/` — translations for 6 locales (ja, en, de, fr, zh, ko)
- **Styles**: `styles/` — `variables.css` (spacing/sizing tokens), `theme.css` (light/dark color tokens), `global.css` (reset/base)

### Backend (`src-tauri/src/`)

- **Entry**: `main.rs` → `lib.rs` (app setup, command registration)
- **Commands**: `commands/` — `workspace.rs`, `config.rs`, `files.rs` — Tauri IPC handlers
- **Models**: `models/` — `workspace.rs`, `content_type.rs`, `markdown_file.rs`
- **Errors**: `errors.rs` — `CmsError` via `thiserror`, serialized to frontend

### Routing

```
/                                    → WelcomePage (workspace selection)
/content/:contentTypeId              → ContentTypePage (file list)
/content/:contentTypeId/:filename    → EditorPage (markdown editor)
/settings                            → SettingsPage (workspace config)
/global-settings                     → GlobalSettingsPage (theme, language)
```

### State Management

No external state library. Three nested context providers in `App.tsx`:
1. **LocaleProvider** — current locale + translations (`t` object), persisted in localStorage
2. **WorkspaceProvider** — workspace path, config, open/close/updateConfig methods
3. **useTheme** — standalone hook, light/dark toggle, persisted in localStorage

### Data Flow

- Workspace config lives at `<workspace>/.markcms/config.json`
- Content types define folder paths, frontmatter schemas, and sort settings
- Markdown files use YAML frontmatter; parsed by `gray-matter` (frontend) and `serde_yaml` (Rust)
- All file I/O goes through Tauri commands (React → `@tauri-apps/api/core.invoke` → Rust)

## Code Style (Biome)

- **Indentation**: Tabs
- **Quotes**: Double quotes
- **Semicolons**: Always
- **Line width**: 100 characters

## Naming Conventions

- **React components/pages**: PascalCase (`Sidebar.tsx`, `EditorPage.tsx`)
- **Hooks**: `use` prefix, camelCase (`useWorkspace.tsx`)
- **CSS**: matches component name (`Sidebar.css`)
- **TypeScript type files**: camelCase (`workspace.ts`)
- **Rust files**: snake_case (`content_type.rs`)

## Design System

Brand defined in `brand.md`. Key tokens:
- **Primary color**: `#598D76`
- **Font**: Noto Sans JP (400/500/600/700), line-height 1.8 for body (Japanese-optimized)
- **CSS custom properties**: defined in `src/styles/variables.css` and `src/styles/theme.css`
- **Theming**: `[data-theme="light|dark"]` selectors on `:root`
- No CSS framework or component library — all custom

## Key Patterns

- Rust commands use `#[tauri::command]` with `CmsResult<T>` return type
- Rust models serialize with `serde(rename_all = "camelCase")` for JS interop
- TipTap editor with markdown extension for WYSIWYG editing
- Frontmatter schema is config-driven (field types: string, text, number, boolean, date, datetime, select, string[])
