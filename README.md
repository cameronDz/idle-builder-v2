# Idle Builder v2

**Idle Builder v2** — A settlement-building idle game with resource production, building synergies, and prestige resets. Built with React 19 + TypeScript + Vite 7.

Place buildings on a 5×5 grid, manage resources, level up your settlement, and eventually prestige for permanent multipliers. Progress persists even when you're away.

---

## How to Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173/idle-builder-v2/](http://localhost:5173/idle-builder-v2/) in your browser.

## How to Build

```bash
pnpm build
```

Output is written to `dist/`.

## How to Deploy

GitHub Pages auto-deploys on every push to `main` via GitHub Actions. The live URL is:

[https://camerondz.github.io/idle-builder-v2/](https://camerondz.github.io/idle-builder-v2/)

For public release (Session 5), the built `dist/` folder will be uploaded to [itch.io](https://itch.io).

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Language | TypeScript ~5.8 |
| Build Tool | Vite 7 |
| Package Manager | pnpm 9 |
| Styling | CSS Modules |
| Persistence | localStorage |
| Deployment | GitHub Pages (dev), itch.io (release) |

---

## Project Structure

```
idle-builder-v2/
├── .github/workflows/     # GitHub Actions CI/CD
│   └── deploy.yml         # Auto-deploy to GitHub Pages on push to main
├── docs/
│   ├── DESIGN.md          # Full game design document
│   ├── DECISIONS.md       # Key architecture decisions with rationale
│   └── SESSION_LOG.md     # Session-by-session progress notes
├── src/
│   ├── assets/            # Static assets (icons, images)
│   ├── components/        # React UI components
│   │   ├── BuildingSelector  # Modal to pick building type when placing
│   │   ├── Grid              # 5×5 grid container
│   │   ├── GridCell          # Individual cell (empty / occupied states)
│   │   └── ResourceBar       # Top bar showing gold/wood/stone counts
│   ├── config/
│   │   └── buildings.ts   # Building definitions (costs, production, timers)
│   ├── hooks/
│   │   ├── useGridSystem.ts  # Grid state management + localStorage persistence
│   │   └── useTimer.ts       # Construction timer (offline-aware, per-level scaling)
│   ├── types/
│   │   └── game.ts        # All core TypeScript interfaces
│   ├── utils/
│   │   └── timeUtils.ts   # formatTime helper (ms → "1m 30s")
│   ├── App.tsx            # Root component
│   ├── index.css          # Global reset / base styles
│   └── main.tsx           # React entry point
├── index.html             # Vite entry HTML
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Game Overview

See [docs/DESIGN.md](docs/DESIGN.md) for the full game design document.

**Core loop:**
1. Place a building on the grid (costs resources)
2. Start the construction timer
3. Wait — timer runs even when offline via localStorage
4. Complete → building produces resources per tick
5. Level up (longer timer, higher output)
6. Fill the grid → unlock prestige
7. Prestige → reset grid, gain permanent multiplier
8. Repeat with boosted rates

**Session Plan:**
- **Session 1** — Scaffold + grid + timer system *(this PR)*
- **Session 2** — Resource system, building costs, production ticks
- **Session 3** — Synergies, prestige, juice & polish
- **Session 4** — Bug bash, mobile responsiveness, persistence hardening
- **Session 5** — Build, deploy to itch.io, release