# Optimization mode

Focus on practical performance improvements with low risk.

Process:
1. Identify likely hot paths in rendering, state updates, and tick/loop logic.
2. Propose measurable optimizations in priority order.
3. Separate quick wins from deeper refactors.
4. For each recommendation, include:
   - Expected benefit
   - Risk level
   - Validation plan

Use code context from:
- #file:../../src/hooks/useProductionTick.ts
- #file:../../src/components/Grid.tsx
- #file:../../src/App.tsx
