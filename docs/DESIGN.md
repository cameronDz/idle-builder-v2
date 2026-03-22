# Game Design Document — Idle Builder v2

**Last updated:** 2026-03-22

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
- ✅ Grid-based building placement (5×5)
- ✅ Real-time construction timers (persisted offline via localStorage)
- ✅ Building leveling with escalating durations (`duration * 2.5^level`)
- ✅ Concurrent build limits (max 3 buildings under construction at once)
- ✅ Resource system: gold, wood, stone, ore, food
- ✅ Building costs (deducted on placement)
- ✅ Building production (awarded on tick)

### P1 — Core-ish (Session 3)
- ⬜ Building synergies (building A at level X boosts production if building B exists at level Y — see § Building Synergies below)
- ⬜ Prestige / reset mechanic (permanent global multiplier)
- ⬜ Mobile-responsive layout

### P2 — Polish (Session 3–4)
- ⬜ Achievement system
- ⬜ Sound effects & visual juice
- ✅ Tiered visual upgrades: base icon → enhanced icon → ultra icon (based on level)

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
  progress: number; // 0–100
  timeRemaining: number; // ms
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
  duration: number; // base ms
  maxCount: number;
  icon: string; // emoji or SVG path
  enhancedIcon: string;
  ultraIcon: string;
  cost: Resources;
  upgradeCostMultiplier: number;
  production: Resources;
  productionMultiplier: number;
  synergies?: SynergyCondition[]; // optional; unlocks production boosts based on partner level
}

interface SynergyCondition {
  partnerBuildingId: string; // building type that must exist on the grid
  partnerMinLevel: number;   // partner must be at this level or above
  selfMinLevel: number;      // this building must be at this level or above
  bonus: number;             // fractional multiplier added to base, e.g. 0.25 for +25%
}

interface PrestigeState {
  timesPrestiged: number;
  globalMultiplier: number;
}
```

---

## Buildings

All five resource columns are: **Gold / Wood / Stone / Ore / Food**

| Building | Duration | Max | Cost (G/W/S/O/F) | Production /s (G/W/S/O/F) |
|---|---|---|---|---|
| 🏠 Wooden House | 3s | 8 | 0/10/0/0/0 | **2**/0/0/0/0 |
| 🌾 Farm | 6s | 6 | 5/15/0/0/0 | **1**/0/0/0/**5** |
| 🏰 Stone Castle | 12s | 2 | 50/30/40/10/0 | **8**/0/**5**/**2**/**2** |
| 🌀 Windmill | 4.5s | 4 | 10/20/5/0/0 | **2**/**1**/0/0/**2** |
| 🗼 Watch Tower | 9s | 3 | 20/25/15/5/0 | **3**/0/**2**/0/0 |
| 🏚️ Barn | 4s | 5 | 5/20/0/0/0 | **1**/**1**/0/0/**4** |
| ⚒️ Forge | 7.5s | 3 | 25/10/20/0/0 | **2**/0/**3**/**2**/0 |
| 🏪 Market | 10s | 2 | 30/20/10/0/0 | **5**/**1**/**1**/**1**/**1** |
| ⛏️ Ore Mine | 8s | 3 | 15/15/10/0/0 | **1**/0/**4**/**3**/0 |
| 🪵 Lumber Yard | 5s | 4 | 10/25/5/0/0 | 0/**3**/0/0/0 |
| 🪨 Quarry | 6s | 4 | 10/5/0/0/0 | 0/0/**3**/0/0 |

All buildings: `upgradeCostMultiplier: 1.8`, `productionMultiplier: 1.5`

---

## Building Synergies

> Planned for Session 3. Uses a **level-requirement model** — no spatial constraint, cost is progression-based leveling (see Decision 10).

### Boost model

A building's production is multiplied by `1 + sum(bonus from all satisfied conditions)` where each condition in `config.synergies` contributes its `bonus` when satisfied. A condition is satisfied when:
- **this building** is at `selfMinLevel` or above, AND
- **at least one instance** of `partnerBuildingId` exists anywhere on the grid at `partnerMinLevel` or above

Example: A level 3 Forge with a level 2 Lumber Yard AND a level 2 Ore Mine satisfies both of its conditions and produces at `base × (1 + 0.25 + 0.25)` = `base × 1.5` — 50% more output.

### Synergy conditions

| Building | Self Min Level | Requires Partner | Partner Min Level | Bonus |
|---|---|---|---|---|
| 🌾 Farm | 2 | 🏚️ Barn | 1 | +25% production |
| 🏚️ Barn | 2 | 🌾 Farm | 1 | +25% production |
| ⚒️ Forge | 3 | 🪵 Lumber Yard | 2 | +25% production |
| ⚒️ Forge | 3 | ⛏️ Ore Mine | 2 | +25% production |
| ⛏️ Ore Mine | 3 | 🪨 Quarry | 2 | +20% production |
| 🏠 Wooden House | 2 | 🏪 Market | 2 | +20% production |
| 🏰 Stone Castle | 2 | 🗼 Watch Tower | 2 | +30% production |

Synergies are **stackable** within the same building: a Forge that satisfies both conditions produces at `base × 1.5`. Synergies are **not bidirectional** by default — the Farm gets a boost from having a Barn, but not vice-versa, unless the Barn also has its own condition (as above).

### Implementation plan (Session 3)

1. **`SynergyCondition` interface (`types/game.ts`)** — add the interface as shown in § Data Models.
2. **`BuildingConfig` (`config/buildings.ts`)** — add optional `synergies?: SynergyCondition[]` field; populate for the 7 conditions above (covering 5 unique building relationships).
3. **`useProductionTick` (`hooks/useProductionTick.ts`)** — before the per-instance loop, build a `Map<buildingTypeId, maxLevel>` from all completed instances; then for each active instance, iterate `config.synergies`, check `effectiveLevel >= cond.selfMinLevel` and `partnerLevels.get(cond.partnerBuildingId) >= cond.partnerMinLevel`, and accumulate `synergyBonus`; multiply production by `1 + synergyBonus`.
4. **`BuildingDetail` (`components/BuildingDetail.tsx`)** — add a "Synergies" subsection to the info panel listing each condition, its level requirements, and whether it is currently active. This is the primary player communication surface for this feature.

No new `Resources` fields, no localStorage migration, no grid position lookup required.

---

## Building Balance — Analysis & Changes

### Overview

- **Early game (free/cheap):** Wooden House (free) and Quarry (10g/5w) are the starting buildings. Barn and Farm are the next step.
- **Mid game:** Windmill, Watch Tower, Forge, Lumber Yard, Ore Mine all require moderate mixed resources.
- **Late game:** Stone Castle and Market are the most expensive and most powerful buildings.
- **Resource loops:** Wood comes from Lumber Yard; Stone from Quarry/Ore Mine; Ore from Ore Mine/Forge; Food from Farm/Barn/Windmill; Gold from most buildings.

### Suggestion 1 — Wooden House: specialize on gold (implemented)

**Problem:** The original Wooden House produced both 💰1 gold *and* 🍖1 food per second, making it an overly general starter building that competed with dedicated food producers (Farm, Barn) before the player had any of them. This blurred the production identity of early buildings.

**Change:** Wooden House now produces 💰**2** gold/s and no food. It becomes a pure economic building — residents paying rent — while food production is cleanly delegated to Farm and Barn.

### Suggestion 2 — Farm: produce food, not wood (implemented)

**Problem:** The original Farm produced 🌲2 wood/s + 🍖3 food/s. Farms don't harvest lumber; that overlap with the Lumber Yard was confusing and diluted the Lumber Yard's purpose as the wood specialist.

**Change:** Farm now produces 💰**1** gold/s (selling crops) + 🍖**5** food/s and no wood. This makes Farm the dominant food producer, creates a clear thematic role, and gives the Lumber Yard exclusive ownership of wood production in the early game.

### Suggestion 3 — Stone Castle: reward the investment (implemented)

**Problem:** The original Stone Castle cost 50g/30w/40s/10o — the most expensive building in the game by a wide margin — yet only produced 💰5 gold/s + 🪨3 stone/s. The Market, costing less than half as much (30g/20w/10s), produced the same 5 gold plus four other resources. The Castle offered no meaningful incentive to invest.

**Change:** Stone Castle now produces 💰**8**/🪨**5**/🔩**2**/🍖**2** per second. The Castle becomes a true multi-resource powerhouse that justifies its premium cost and serves as a strong late-game target.

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
- No population or energy resource types — these require new game-loop mechanics (cap logic, running costs) that don't fit the current accumulate-and-spend model; deferred to v3 (see Decision 8)
