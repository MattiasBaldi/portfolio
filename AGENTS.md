# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the React + TypeScript app. Entry points: `src/main.tsx` (root mount) and `src/App.tsx` (top-level layout/data types).
- Feature code lives under `src/components/`, `src/hooks/`, `src/stores/`, `src/utils/`, and `src/R3F/` (Three Fiber).
- Content/data is in `src/data/`; static assets are in `src/assets/` and `public/`.
- Build output goes to `dist/`. Media optimization helpers live in `optimize-media.sh`.

## Build, Test, and Development Commands
- `npm run dev`: start the Vite dev server.
- `npm run build`: create a production build in `dist/` and open the bundle visualizer (`dist/stats.html`).
- `npm run preview`: serve the production build locally.
- `npm run lint`: run ESLint across the repo.

## Coding Style & Naming Conventions
- Use TypeScript/TSX; the project is strict (`tsconfig.json`).
- Match existing formatting: 2-space indentation, no semicolons, and React components in `PascalCase`.
- Hooks follow `useX` naming; Zustand store modules live in `src/stores/`.
- Respect `// @claude dont touch this` markers (see `CLAUDE.md`) and avoid edits in those blocks.

## Testing Guidelines
- There is no test suite wired into `npm scripts` yet.
- If you add tests, prefer Vitest and name files `*.test.ts`/`*.test.tsx`, colocated with the module or under `src/__tests__/`.
- Document how to run new tests in this file or `CLAUDE.md`.

## Commit & Pull Request Guidelines
- Recent commits use short, imperative subjects (e.g., “Fix marquee not starting on mobile…”, “Compress…”, “Update…”). Keep messages brief and descriptive.
- PRs should include a clear summary, relevant issue links, and screenshots or short clips for visual changes.
- Note any media size changes and list the commands run (`npm run build`, `npm run lint`, etc.).

## Configuration & Debug Tips
- Append `#debug` to the URL to enable Leva debug panels.
- Use `src/utils/media.ts` helpers for responsive breakpoints instead of ad-hoc media checks.
