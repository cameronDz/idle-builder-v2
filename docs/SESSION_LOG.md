# Session Log

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
