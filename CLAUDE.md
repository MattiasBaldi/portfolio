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
- **GSAP** for animations (with Draggable, InertiaPlugin, ScrollToPlugin)
- **React Three Fiber + Drei** for 3D/WebGL components
- **React Router DOM** for routing
- **Zustand** for state management
- **Leva** for debug UI controls

## Architecture

### Entry Points
- `src/main.tsx` - React root mount
- `src/App.tsx` - Main application component, defines `ProjectData` and `Data` types

### Component Structure
- `src/components/Header.tsx` - Expandable header with accordion bio section (uses ResizeObserver for dynamic height)
- `src/components/projects/Project.tsx` - Main interactive project card with GSAP-animated expand/collapse (coordinates 6+ animated elements)
- `src/components/projects/Marquee.tsx` - Horizontal infinite scroll gallery using GSAP's `horizontalLoop` helper (~270 lines) with Draggable + InertiaPlugin for momentum-based scrolling
- `src/components/projects/Gallery.tsx` - Full-screen lightbox with keyboard navigation (Escape/Arrow keys) and sub-components (Lightbox, GalleryHeader, NavigationArrows)

### 3D Components
- `src/R3F/R3F.tsx` - React Three Fiber canvas wrapper
- `src/R3F/Profile.tsx` - Animated 3D mesh

### State & Hooks
- `src/stores/useStores.ts` - Zustand store (currently empty scaffold)
- `src/hooks/useDebug.ts` - Enables debug mode via `#debug` URL hash
- `src/hooks/useAnimations.ts` - `useAccordion` hook with GSAP timeline for project expand/collapse animations

### Utilities
- `src/utils/media.ts` - `getMedia()` helper for responsive breakpoints (mobile/desktop/touch/mouse/hover)

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

## Animation Architecture

### useAccordion Hook Pattern
- Creates a single reusable GSAP timeline per project card
- Uses `reversed()` method to toggle animations forward/backward
- Wraps handlers with `contextSafe` to prevent memory leaks
- Synchronizes 6 child elements with staggered timing
- Responsive: calculates title offset based on actual DOM measurements
- Timeline reuse: updates variable properties on re-toggle for performance

### Marquee Implementation
- **horizontalLoop helper**: Custom GSAP function for seamless infinite scroll (~270 lines)
- **Drag interaction**: Draggable plugin with custom snap logic
- **Inertia**: Momentum-based friction and deceleration via InertiaPlugin
- **Video support**: Auto-detects `.webm`, `.mp4`, `.mov`, `.m4v`, `.ogg` formats
- **Lazy loading**: Waits for all video metadata before starting animations
- **Responsive heights**: 250px mobile, 500px desktop

### Event Handling Patterns
- Heavy use of `e.stopPropagation()` to prevent parent handlers from triggering
- Gallery uses `e.target === e.currentTarget` pattern for backdrop click detection
- Links in header prevent accordion toggle with `e.stopPropagation()`

## Responsive Design

### Media Query Utilities
Use `getMedia()` helper instead of CSS media queries in JS:
```typescript
getMedia("mobile")    // max-width: 1023px
getMedia("desktop")   // min-width: 1024px
getMedia("touch")     // pointer: coarse
getMedia("hover")     // hover: hover
```

### Breakpoints
- Mobile: < 1024px
- Tablet: ≥ 768px
- Desktop: ≥ 1200px
- Padding scales: 10px (mobile) → 40px (tablet) → 150px (desktop)

## Media Type Detection

Components auto-detect video vs. image formats:
```typescript
const isVideo = /\.(webm|mp4|mov|m4v|ogg)$/i.test(url);
```

## Vite Configuration

- **Dev server**: Configured to allow Cloudflare tunnel hosts (`allowedHosts: ['.trycloudflare.com']`)
- **Build output**: Automatic bundle visualizer opens post-build in browser
- Shows gzip and brotli compression sizes at `dist/stats.html`

## Code Directives

The codebase uses `@claude` comments to mark sections that should not be modified:
```typescript
// @claude dont touch this
```

These markers appear in critical animation helper functions (e.g., `horizontalLoop` in useAnimations.ts:77).
