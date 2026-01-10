# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # Production build (outputs to dist/, auto-opens bundle visualizer)
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Tech Stack

- **React 19** with TypeScript (strict mode enabled)
- **Vite 7** for build tooling
- **Tailwind CSS 4** (via @tailwindcss/vite plugin)
- **GSAP** for animations (with Draggable and InertiaPlugin for marquee)
- **React Three Fiber + Drei** for 3D/WebGL components
- **Zustand** for state management
- **Leva** for debug UI controls

## Architecture

### Entry Points
- `src/main.tsx` - React root mount
- `src/App.tsx` - Main application component, defines `ProjectData` and `Data` types

### Component Structure
- `src/components/Header.tsx` - Expandable header with accordion bio section
- `src/components/projects/Project.tsx` - Project cards with GSAP-animated expand/collapse
- `src/components/projects/Marquee.tsx` - Horizontal infinite scroll gallery using GSAP's `horizontalLoop` helper

### 3D Components
- `src/R3F/R3F.tsx` - React Three Fiber canvas wrapper
- `src/R3F/Profile.tsx` - Animated 3D mesh

### State & Hooks
- `src/stores/useStores.ts` - Zustand store (currently empty scaffold)
- `src/hooks/useDebug.ts` - Enables debug mode via `#debug` URL hash
- `src/hooks/useAnimations.ts` - `useToggle` hook with GSAP timeline for project expand/collapse animations

### Data
- `src/data/data.json` - Project data array (id, name, description, thumbnail, media, category, year)

## Debug Mode

Append `#debug` to the URL to show Leva debug panels for tweaking animation parameters, layout gaps, and marquee settings.

## TypeScript Config

Uses strict TypeScript with additional checks:
- `noUncheckedIndexedAccess`
- `exactOptionalPropertyTypes`
- `verbatimModuleSyntax`

Module resolution is set to `bundler` mode for Vite compatibility.
