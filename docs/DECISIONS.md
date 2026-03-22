# Architecture Decision Log — Idle Builder v2

All decisions recorded with rationale to preserve context across sessions.

---

## Decision 1 — New repo vs. reuse existing
**Date:** 2026-03-19
**Decision:** Create `idle-builder-v2` as a new repo.

**Rationale:**
Retrofitting v2 features (resources, prestige, synergies, building costs) into the existing `idle-builder-ui` repo would cost more time than starting clean. The existing repo carries old experiments, a git history shaped around v1 assumptions, and architecture that wasn't designed for the new state model.

The `idle-builder-ui` repo is treated as a **reference**, not a foundation. Core patterns (`useTimer`, `useGridSystem`, `BuildingConfig`, grid rendering) are cherry-picked into v2, but the type system and state management are designed from scratch for the new feature set.

---

## Decision 2 — React vs. Phaser
**Date:** 2026-03-19
**Decision:** Use React 19 + TypeScript + Vite 7.

**Rationale:**
The game is UI-driven (grids, modals, timers, progress bars), not render-driven. Phaser's strengths — sprites, physics, tilemaps, cameras — aren't needed for a 5×5 idle builder.

Using Phaser would mean:
- Fighting the engine to render DOM-style UI elements (Phaser's UI tooling is weak)
- Spending 3–5 of 15 available hours learning the framework instead of building features
- Worse AI code generation (React has far more training data than Phaser)

Learning Phaser is deferred to a future project that actually benefits from a game engine (platformer, roguelite, tower defense with real sprites).

---

## Decision 3 — Grid vs. Tilemap
**Date:** 2026-03-19
**Decision:** Use a 5×5 CSS Grid rendered as DOM `<div>`s, not a tilemap.

**Rationale:**
A tilemap is a rendering system for large scrollable maps with pre-made tile sprites. This game has 25 cells. There is no camera, no scrolling, no sprite sheets.

A grid is a 2D array of `GridCell` objects. Rendering is trivial with CSS `grid-template-columns`. Tilemaps are for games with 200×200 tile worlds — they're overkill for 25 divs.

---

## Decision 4 — Deployment strategy
**Date:** 2026-03-19
**Decision:** GitHub Pages during development, itch.io for public release.

**Rationale:**
GitHub Pages provides zero-friction auto-deploy via GitHub Actions on push to `main`. Since the repo is already on GitHub, there's no need to introduce Vercel or Netlify. The game is static — no server needed.

itch.io is used for the public release (Session 5) because it provides game discoverability, an audience, and a polished release page. GitHub Pages is the dev preview URL only.

---

## Decision 5 — Vercel rejected
**Date:** 2026-03-19
**Decision:** Do not use Vercel.

**Rationale:**
Unnecessary middleman. Already on GitHub, GitHub Pages provides the same auto-deploy workflow with zero new accounts, zero config beyond a GitHub Actions YAML file, and zero cost. Vercel's per-PR preview deployments are not needed for a solo 5-session project on a single branch.

---

## Decision 6 — Framer Motion deferred
**Date:** 2026-03-19
**Decision:** No Framer Motion in Sessions 1–2. Added in Session 3 for juice/polish.

**Rationale:**
Vanilla CSS transitions are sufficient for the core game loop. Adding Framer Motion in Session 1 would add a dependency and cognitive overhead before the mechanics are even working. The core sessions should focus on timers, resources, and grid logic. Animation polish belongs in Session 3.

---

## Decision 7 — Learning Phaser deferred to future project
**Date:** 2026-03-19
**Decision:** Do not use Phaser to learn game engine development within this project.

**Rationale:**
15 hours is enough for one goal: ship a game OR learn an engine — not both. Phaser would require 3–5 hours of framework learning for a game that doesn't benefit from its strengths.

The right time to learn Phaser is on a project that actually calls for it: a platformer, a bullet hell, a roguelite with sprite-based rendering. That project would use Phaser for what it's good at. This project uses React for what it's good at.

---

## Decision 8 — Population and Energy resources deferred out of v2 scope
**Date:** 2026-03-22
**Decision:** Do not add population or energy as resource types in v2.

**Context:** This was raised mid-Session 2 as a possible addition. Session 2's core goals (resource system, building costs, production ticks) are already complete. The remaining session time is budgeted for the prestige system.

**Why it's too aggressive for Session 2:**

1. **Touch-count is high.** Adding any new field to the `Resources` interface cascades into at least 8 files: `types/game.ts`, `useResources.ts`, `useProductionTick.ts`, `buildingUtils.ts`, `buildings.ts` (11 buildings × 2 fields each), `ResourceBar.tsx`, `BuildingSelector.tsx`, `BuildingDetail.tsx`, and `GridCell.tsx`. That is a multi-hour horizontal refactor.

2. **ResourceBar is already at capacity.** It currently shows 5 resources using a mobile scale-down hack (`font-size: 0.75rem` at ≤600 px) to fit on one line. Adding two more columns would immediately break the mobile layout with no clean fix available without a full layout redesign.

3. **localStorage migration is required.** Any player with an existing save would load `population: undefined` and `energy: undefined`, causing runtime NaN errors throughout the resource math. A migration/schema-validation layer would need to be written first.

4. **Population and energy are not "more numbers" — they are different mechanics.** Population is typically a *cap* resource (you need X population before you can build Y). Energy is typically a *running cost* resource (buildings consume it continuously while active). Neither fits the current "accumulate-and-spend" model in `useResources`. Implementing them correctly requires new game loop logic, not just new fields.

5. **Timeline risk is concrete.** Implementing this mid-Session 2 would consume the time reserved for prestige (a Session 3 P1 goal), which would push prestige into Session 4, displacing mobile polish, which would then compress Session 5 (release). The 5-session plan has no slack.

**Resolution:** Population and energy are recorded here as explicit future scope for a v3 or post-release feature. Revisit only after prestige, synergies, and mobile polish are complete.

---

## Decision 9 — Building interdependence (synergies) is confirmed for Session 3; resource specialization was its prerequisite
**Date:** 2026-03-22
**Decision:** Proceed with the planned adjacency-based synergy system in Session 3. The resource-specialization changes made in Session 1.2 are a necessary prerequisite that make this a well-defined, low-risk feature.

**Context:** This was raised mid-Session 2 after the resource-production identities of several buildings were sharpened (Wooden House → gold-only, Farm → food-only, Lumber Yard → wood-only, Quarry → stone-only, etc.). The question was whether that specialization makes interdependence more or less appropriate to add.

**Why the specialization was a prerequisite:**

Before the Session 1.2 changes, buildings had overlapping production roles (Wooden House produced gold *and* food; Farm produced wood *and* food). With overlapping identities, adjacency synergies would have been arbitrary — why would a Wooden House boost a Farm when both were already producing food? The synergy design would have had no thematic grounding.

After specialization, each building has a distinct production identity. Synergy pairs are now thematically obvious and communicate a clear settlement story:

| Pair | Thematic reason |
|---|---|
| 🌾 Farm + 🏚️ Barn | Barn stores what Farm grows — classic food cluster |
| 🌾 Farm + 🌀 Windmill | Windmill grinds farm grain into flour |
| 🪵 Lumber Yard + ⚒️ Forge | Wood provides charcoal fuel for smelting |
| ⛏️ Ore Mine + ⚒️ Forge | Raw ore flows directly into the forge |
| ⛏️ Ore Mine + 🪨 Quarry | Extractive industry — naturally cluster together |
| 🏠 Wooden House + 🏪 Market | Residents are the market's customers |
| 🏰 Stone Castle + 🗼 Watch Tower | Defensive complex — tower guards the castle |

**Why synergies are lower risk than population/energy (Decision 8):**

1. **No new `Resources` fields.** Synergies are a production multiplier applied at tick time. They don't add new counters, don't break `canAfford`/`spend`, and don't require a localStorage migration.
2. **Grid positions already exist.** `BuildingInstance.position` carries `{x, y}`. `useProductionTick` can check cardinal neighbors using the same `buildingInstances` array it already iterates.
3. **Isolated change set.** The implementation requires: a `synergies: string[]` field on `BuildingConfig`, an updated `useProductionTick` that checks neighbors, and synergy data in `buildings.ts`. No UI component needs structural changes — an optional glow/indicator is purely cosmetic and can be added later.
4. **No session-plan disruption.** Synergies are already a Session 3 P1 goal. This is a confirmation that the plan is correct, not a scope change.

**Resolution:** Build adjacency synergies in Session 3 as planned. The Session 1.2 resource-specialization work is the correct foundation. See DESIGN.md § Building Synergies for the proposed synergy pairs and boost model.

---

## Decision 10 — Level-requirement synergy model replaces adjacency model (supersedes Decision 9)
**Date:** 2026-03-22
**Decision:** Replace the adjacency-based synergy model from Decision 9 with a **level-requirement model**: Building A gets a production boost when (a) it is at level X or above, and (b) at least one Building B exists anywhere on the grid at level Y or above.

**Context:** After Decision 9 was recorded, a concern was raised: does the adjacency model silently require more resources? And could synergy instead be "Building A at level X requires Building B at least level Y"?

**Analysis of the adjacency model's hidden costs:**

Both models require the player to invest in two building types — that resource cost is the same. However, adjacency adds a second constraint on top: the buildings must be physically adjacent. On a 5×5 grid this has real consequences:

1. **Cluster tax.** To give a Forge two synergies (Lumber Yard + Ore Mine), both partners must be directly adjacent (up, down, left, or right) to the Forge simultaneously. The Forge must occupy an interior position with its two synergy partners placed around it — a tight spatial constraint on a 25-cell grid.
2. **Hidden strategic cost.** Players lose placement freedom. A Quarry placed for its own strategic reasons may not happen to be next to an Ore Mine. The spatial requirement is an invisible "cost" paid in grid positioning rather than resources.
3. **Harder to communicate.** "Place it next to the other one" is easy to miss; a tooltip saying "Boost unlocks at level X with a level Y partner" is explicit and scannable.

**Why the level-requirement model is better:**

1. **Cost is explicit and progression-based.** The investment required to unlock a synergy is leveling up — something the player is already planning to do. The cost is transparent and in the player's control.
2. **No spatial constraint.** Buildings can be placed anywhere for strategic or aesthetic reasons. The grid remains a pure placement puzzle, not a synergy-cluster puzzle.
3. **Simpler to implement.** `useProductionTick` already iterates `buildingInstances` with level data. A synergy check is a single pass to build a `Map<buildingTypeId, maxLevel>`, then a per-condition lookup. No grid position lookup is required, which removes the need to pass the grid into the hook.
4. **Cleaner data model.** Replaces `synergies: string[]` (adjacent IDs) with `synergies?: SynergyCondition[]`, where each condition specifies `partnerBuildingId`, `partnerMinLevel`, `selfMinLevel`, and `bonus`. This is self-documenting and maps directly to tooltip text.
5. **Ties synergies to the leveling milestone system.** Synergies activate at the same level thresholds that drive the visual tier upgrades (base → enhanced → ultra). Players already understand leveling as a progression goal; synergies ride that same mental model.

**Resolution:** Implement the level-requirement model in Session 3. See DESIGN.md § Building Synergies for the updated synergy table and implementation plan.
