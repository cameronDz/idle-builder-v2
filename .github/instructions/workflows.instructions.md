---
applyTo: ".github/workflows/**/*.yml,.github/workflows/**/*.yaml"
---

- Keep workflow permissions minimal.
- Prefer pinned major versions of official actions (for example `@v4`, `@v5`).
- Use pnpm for install/build steps in this repository.
- Keep CI commands aligned with local validation (`pnpm lint`, `pnpm build` when relevant).
