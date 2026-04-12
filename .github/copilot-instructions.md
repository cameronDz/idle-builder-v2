# Copilot instructions for Idle Builder v2

## Project context
- This is a React 19 + TypeScript + Vite 7 game project.
- Package manager is **pnpm** (required). Use Node 20+ and pnpm 9+.
- Keep changes small, targeted, and consistent with current code style.

## Always follow this workflow
1. Install dependencies: `corepack enable && corepack prepare pnpm@9 --activate && pnpm install --frozen-lockfile`
2. Validate before and after meaningful code edits:
   - `pnpm lint`
   - `pnpm build`
3. Do not introduce new tooling unless explicitly requested.

## Codebase map
- App entry: `src/main.tsx`, `src/App.tsx`
- UI components: `src/components/*`
- Game logic hooks: `src/hooks/*`
- Game config and balance data: `src/config/*`
- Shared types: `src/types/game.ts`
- Utility helpers: `src/utils/*`
- Styling: CSS Modules and `src/index.css`

## Implementation preferences
- Prefer existing hooks/utils/patterns over adding new abstractions.
- Maintain strict TypeScript correctness.
- Keep UI behavior predictable and avoid hidden side effects.
- Preserve current naming conventions and file organization.

## Pull request quality
- Summarize what changed and why.
- Include what validation was run and results.
- Flag tradeoffs and follow-ups explicitly.
