# Game Design Document — Idle Builder v2

**Last updated:** 2026-03-19

---

## One-Liner

> Place buildings on a grid, start construction timers, level them up, manage resources, and grow your settlement — progress persists even when you're away.

---

## Core Loop

1. **PLACE** building on grid (costs resources)
2. **START** construction timer
3. **WAIT** (idle — timer runs even offline via localStorage)
4. **COMPLETE** → building produces resources per tick
5. **LEVEL UP** (costs more resources, longer timer, higher output)
6. **FILL GRID** → unlock prestige
7. **PRESTIGE** → reset grid, gain permanent multiplier
8. **REPEAT** from step 1 with boosted rates

---

## Features by Priority

### P0 — Core (Sessions 1–2)
- Grid-based building placement (5×5)
- Real-time construction timers (persisted offline via localStorage)
- Building leveling with escalating durations (`duration * 2.5^level`)
- Concurrent build limits (max 3 buildings under construction at once)
- Resource system: gold, wood, stone
- Building costs (deducted on placement)
- Building production (awarded on tick)

### P1 — Core-ish (Session 3)
- Building synergies (adjacent buildings boost each other's production)
- Prestige / reset mechanic (permanent global multiplier)
- Mobile-responsive layout

### P2 — Polish (Session 3–4)
- Achievement system
- Sound effects & visual juice
- Tiered visual upgrades: base icon → enhanced icon → ultra icon (based on level)

---

## Architecture

```
src/
├── assets/icons/           # Placeholder SVGs / emoji strings
├── components/
│   ├── BuildingSelector    # Modal overlay: pick building type from list
│   ├── Grid                # 5×5 grid container, manages cell state
│   ├── GridCell            # Individual cell: empty (+) or occupied (building)
│   └── ResourceBar         # Persistent top bar: gold/wood/stone counts
├── config/
│   └── buildings.ts        # BuildingConfig[] — all building definitions
├── hooks/
│   ├── useGridSystem.ts    # Grid state, placement, removal, persistence
│   └── useTimer.ts         # Per-building construction timer, offline sync
├── types/
│   └── game.ts             # All core interfaces
└── utils/
    └── timeUtils.ts        # formatTime(ms) → "1m 30s"
```

---

## Data Models

```typescript
interface Resources {
  gold: number;
  wood: number;
  stone: number;
}

interface BuildingTimer {
  hasStarted: boolean;
  isComplete: boolean;
  level: number;
  progress: number;        // 0–100
  timeRemaining: number;   // ms
}

interface GridPosition {
  x: number;
  y: number;
}

interface BuildingInstance {
  buildingTypeId: string;
  id: string;
  level: number;
  position: GridPosition;
  buildingTimer: BuildingTimer;
}

interface GridCell {
  buildingInstance: BuildingInstance | null;
  isOccupied: boolean;
  position: GridPosition;
}

interface BuildingConfig {
  id: string;
  name: string;
  duration: number;             // base ms
  maxCount: number;
  icon: string;                 // emoji or SVG path
  enhancedIcon: string;
  ultraIcon: string;
  cost: Resources;
  upgradeCostMultiplier: number;
  production: Resources;
  productionMultiplier: number;
}

interface PrestigeState {
  timesPrestiged: number;
  globalMultiplier: number;
}
```

---

## Buildings

| Building | Duration | Max | Cost (G/W/S) | Production (G/W/S) |
|---|---|---|---|---|
| Wooden House | 3s | 8 | 0/10/0 | 1/0/0 |
| Farm | 6s | 6 | 5/15/0 | 0/2/0 |
| Stone Castle | 12s | 2 | 50/30/40 | 5/0/3 |
| Windmill | 4.5s | 4 | 10/20/5 | 2/1/0 |
| Watch Tower | 9s | 3 | 20/25/15 | 3/0/2 |
| Barn | 4s | 5 | 5/20/0 | 1/1/0 |
| Forge | 7.5s | 3 | 25/10/20 | 2/0/3 |
| Market | 10s | 2 | 30/20/10 | 5/1/1 |
| Ore Mine | 8s | 3 | 15/15/10 | 1/0/4 |

All buildings: `upgradeCostMultiplier: 1.8`, `productionMultiplier: 1.5`

---

## Session Plan

| Session | Goals |
|---|---|
| **1** | Scaffold new repo, port grid + timer system, get core placement working |
| **2** | Resource system, building costs, production ticks |
| **3** | Synergies, prestige, juice & polish |
| **4** | Bug bash, mobile responsiveness, persistence hardening |
| **5** | Build, deploy to itch.io, release, marketing |

---

## Scope Cuts

The following are explicitly **out of scope** for v2:

- No multiplayer
- No server-side persistence
- No in-app purchases / monetization
- No procedural map generation
- No complex tech trees (flat building list only)
- No Phaser or game engine (React is the right tool for a UI-driven idle game)
