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
- **File Organization**: Registry items are organized under `registry/new-york/blocks/` with component-specific subdirectories
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

### Dialog System Example
The confirmation dialog system demonstrates the registry pattern:
- `DialogProvider.tsx`: Context provider for dialog state management
- `dialog.ts`: API for programmatic dialog creation with observable pattern
- `observable.ts` & `types.ts`: State management utilities
- Multiple example dialogs showing different use cases

## File Organization
- `app/` - Next.js 15 app router pages
- `registry/new-york/blocks/` - Registry component definitions
- `components/` - Shared application components
- `lib/` - Utility functions (including standard `cn` helper)
- `public/r/` - Generated registry JSON files (build output)