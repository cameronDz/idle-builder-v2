# Session Log

## Session 1.2 — 2026-03-20 → 2026-03-21
### Goals
- Bug fixes and QoL improvements to the building timer and placement flow

### What got done
- **Bug fix:** Buildings completing via the natural timer tick no longer stay stuck — the tick now increments `level` on completion (was only setting `isComplete: true`, leaving level at 0)
- **Bug fix:** Fixed React 18 Strict Mode double-invocation corrupting `localStorage` inside a state updater; moved `saveToStorage` on completion into a `useEffect` so it runs as a proper side effect
- **Bug fix:** All buildings now correctly display their persisted level after a page reload (the `initialState` fallback in `useTimer` was returning `level: 0` for idle-between-builds state instead of reading `stored.level`)
- **Feature:** Buildings now auto-start construction immediately when placed (if under the concurrent build limit)
- **Feature:** Added "Clear Resources" button next to "Clear Grid" — resets resources to starting values with a confirmation dialog
- **Feature:** Added resource labels above each counter in the ResourceBar: 💰 Gold, 🌲 Wood, 🪨 Stone, 🔩 Ore, 🍖 Food
- **Feature:** Updated wood emoji to 🌲 and stone emoji to 🪨 for broader platform compatibility; fixed stone production emoji in BuildingSelector (was incorrectly showing ⛏️)
- **Feature:** Production info added to BuildingSelector cards (base rate before placing) and to placed building cells (current rate scaled by level)
- **Feature:** Concurrent build slots now count completed-but-unacknowledged buildings — you must click "✔ Complete" before a new building slot opens; the badge shows `⚒ X/3 slots`
- **Feature:** Added Ore (🔩) and Food (🍖) as new resource types; all buildings updated with ore/food costs and production where appropriate; ResourceBar, BuildingSelector, and GridCell production displays all updated
- **Feature:** Added Lumber Yard as a 10th building — produces wood (🌲 +3/s), icons: 🪺 / 🌳 / 🏭; removed the short-lived lumber resource that was introduced alongside it

### What's broken/missing
- No prestige system
- No building detail/info panel (icon click is wired but renders nothing)

### Next session priorities
- Building detail modal (show full stats, upgrade cost, production at next level)
- Prestige system

---

## Session 1 — 2026-03-19
### Goals
- Scaffold new repo
- Port grid + timer system from idle-builder-ui
- Get core building placement working

### What got done
- Created idle-builder-v2 repo
- Full project scaffold: package.json, tsconfig, vite.config, eslint config
- All core types (Resources, BuildingTimer, GridCell, BuildingInstance, etc.)
- Building config with 9 building types
- useTimer hook (localStorage persistence, offline progress, level scaling)
- useGridSystem hook (5×5 grid, placement, removal, persistence)
- Grid, GridCell, BuildingSelector, ResourceBar components
- GitHub Actions deploy workflow for GitHub Pages

### What's broken/missing
- ResourceBar is a stub (no live resource counts)
- No resource tick engine (buildings don't actually produce resources yet)
- No building costs deducted on placement
- No prestige system

### Next session priorities
- Session 2: Resource system, building costs, production ticks
  - Implement useResources hook
  - Wire building costs to placement
  - Implement production tick engine (gold/wood/stone per completed building)
  - Connect ResourceBar to live resource state

---

## Session 2 — [DATE]
### Goals
### What got done
### What's broken/missing
### Next session priorities

---

## Session 3 — [DATE]
### Goals
### What got done
### What's broken/missing
### Next session priorities

---

## Session 4 — [DATE]
### Goals
### What got done
### What's broken/missing
### Next session priorities

---

## Session 5 — [DATE]
### Goals
### What got done
### What's broken/missing
### Next session priorities
