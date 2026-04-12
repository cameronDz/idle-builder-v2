---
applyTo: "src/**/*.ts,src/**/*.tsx"
---

- Prefer functional React components and hooks already used in this repository.
- Reuse existing game-state patterns from `src/hooks` before creating new state paths.
- Keep logic pure where possible; avoid mutating shared objects.
- Favor small helper extraction over deeply nested component logic.
- Preserve strict typing; avoid `any` unless absolutely unavoidable.
- When changing gameplay values/behavior, keep related config in `src/config` centralized.
