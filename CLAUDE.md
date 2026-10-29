# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a custom shadcn/ui component registry built with Next.js 15, allowing distribution of custom React components, hooks, pages, and other files to any React project via the `shadcn` CLI.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the Next.js application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

### Registry Management
- `npm run registry:build` - Build the registry using `shadcn build` command
  - This processes `registry.json` and generates static JSON files in `public/r/`
  - Each component definition becomes a standalone registry file

## Architecture

### Registry System
The core architecture revolves around the registry system defined in `registry.json`:

- **Registry Definition**: `registry.json` contains component metadata including dependencies, file paths, and types
- **File Organization**: Registry items are organized under `registry/blocks/` with component-specific subdirectories
- **Build Output**: `shadcn build` generates static JSON files in `public/r/` that are consumable by the shadcn CLI
- **Route Handler**: The app serves registry items via both static files and API routes

### Component Structure
Registry components follow this pattern:
- **Types**: `types.ts` - TypeScript interfaces and type definitions
- **Core Logic**: Main component files (`.tsx`) and utility files (`.ts`)
- **Examples**: Demonstration components in `example/` subdirectories
- **Supporting Files**: CSS files, hooks, and utility libraries as needed

### Key Dependencies
- **Tailwind CSS v4**: Used for styling (note: differs from standard shadcn v3)
- **Radix UI**: Component primitives for accessible UI components
- **React Hook Form + Zod**: Form handling and validation
- **Class Variance Authority**: Styling utilities

### Configuration
- **shadcn Config**: `components.json` defines aliases, styling preferences, and icon library
- **Path Aliases**: Uses `@/` prefix mapping to root directory via TypeScript paths
- **Styling**: "new-york" style variant with CSS variables and Lucide icons

### Confirmation Dialog System
The confirmation dialog system is inspired by [Sonner](https://github.com/emilkowalski/sonner) and follows similar API patterns:

**Sonner-inspired API:**
- `dialog()` - Create custom dialogs programmatically
- `dialog.dismiss(id?, reason?, value?)` - Dismiss specific dialog or all dialogs (matches Sonner's `toast.dismiss()`)
- `dialog.countdown()`, `dialog.typeToConfirm()` - Specialized dialog types
- Observable pattern for state management similar to Sonner's toast system

**Architecture:**
- `DialogProvider.tsx`: Context provider for dialog state management (like Sonner's `<Toaster />`)
- `dialog.ts`: Main API for programmatic dialog creation with Sonner-like interface
- `state.ts`: Observable-based state management following Sonner patterns
- `types.ts`: TypeScript interfaces including `DialogResult` with dialog ID tracking
- Multiple example dialogs demonstrating different use cases

**Key Features:**
- Support for custom dialog IDs (like Sonner's toast IDs)
- Programmatic dismissal by ID or dismiss all dialogs
- Promise-based API returning `DialogResult` with confirmation state
- Multiple concurrent dialogs support

## File Organization

- `app/` - Next.js 15 app router pages, one demo route per registry item
- `registry/<item-name>/` - **all registry item source lives here**, one directory per item
- `components/ui/` - vendored shadcn primitives, CLI-managed (`shadcn add button` writes here)
- `lib/utils.ts` - the standard `cn` helper
- `public/r/` - generated registry JSON files (build output)

### Registry item layout

Each item owns a directory and keeps everything related to it inside:

```
registry/<item-name>/
├── components/   React components
├── hooks/        React hooks
├── lib/          non-React logic
├── types/        type-only modules
├── docs/         design notes
└── README.md
```

Rules, following shadcn's own registry guidance:

- Import between an item's own files with `@/registry/<item-name>/…`; the CLI
  rewrites these to the consumer's aliases on install.
- Import shadcn primitives with `@/components/ui/…`.
- Never reach across items with a relative path (`../other-item/…`).
- Give every file in `registry.json` an explicit `target`.
- For an item whose files import each other across subfolders, keep the item
  under one target root and use relative imports between its files, so the
  paths survive installation regardless of consumer aliases. `store-slice`
  is the reference example.

See `registry/README.md` for the item index and the current publish status of
each one.