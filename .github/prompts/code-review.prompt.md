# Code review mode

Review the current changes for:
- Correctness and edge cases
- Type safety and maintainability
- Unintended gameplay regressions
- Performance pitfalls
- Security concerns (if any input, storage, or network paths are touched)

Output format:
1. High-priority issues
2. Medium-priority issues
3. Nice-to-have improvements
4. Summary verdict

Use repository context from:
- #file:../../.github/copilot-instructions.md
- #file:../../src/types/game.ts
