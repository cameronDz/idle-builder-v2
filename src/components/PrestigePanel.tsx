import type { Resources } from '../types/game';
import {
  computeGlobalMultiplier,
  computeStartingResources,
  computeCostDiscount,
} from '../hooks/usePrestige';
import styles from './PrestigePanel.module.css';

interface PrestigePanelProps {
  timesPrestiged: number;
  canPrestige: boolean;
  onPrestige: () => void;
}

/**
 * Formats a Resources object as a short resource string, e.g. "💰125 🌲62".
 * Only includes resources with a value greater than zero.
 */
function formatResources(r: Resources): string {
  const parts: string[] = [];
  if (r.gold > 0) parts.push(`💰${r.gold}`);
  if (r.wood > 0) parts.push(`🌲${r.wood}`);
  if (r.stone > 0) parts.push(`🪨${r.stone}`);
  if (r.ore > 0) parts.push(`🔩${r.ore}`);
  if (r.food > 0) parts.push(`🍖${r.food}`);
  return parts.join(' ');
}

/**
 * PrestigePanel — displays the three prestige examples and the prestige button.
 *
 * **Example 1 — Production Multiplier**
 * Each prestige adds +50 % to the global production multiplier, boosting every
 * building's resource output for the entire next run.
 *
 * **Example 2 — Starting Resources Bonus**
 * Each prestige increases the starting resource pack by +25 %, giving a head
 * start when the grid is cleared.
 *
 * **Example 3 — Building Cost Discount**
 * Each prestige reduces all building placement and upgrade costs by 10 %,
 * capped at 50 %, making expansion faster in later runs.
 *
 * The prestige button is only enabled once every cell on the 5×5 grid is filled.
 */
export function PrestigePanel({ timesPrestiged, canPrestige, onPrestige }: PrestigePanelProps) {
  const nextPrestigeCount = timesPrestiged + 1;

  const currentMultiplier = computeGlobalMultiplier(timesPrestiged);
  const nextMultiplier = computeGlobalMultiplier(nextPrestigeCount);

  const currentStarting = computeStartingResources(timesPrestiged);
  const nextStarting = computeStartingResources(nextPrestigeCount);

  const currentDiscount = computeCostDiscount(timesPrestiged);
  const nextDiscount = computeCostDiscount(nextPrestigeCount);

  const handlePrestige = () => {
    if (!canPrestige) return;
    if (!window.confirm('Prestige? Your grid will be cleared and resources reset. All 3 permanent bonuses will increase.')) return;
    onPrestige();
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>{'✨ Prestige'}</h2>
        {timesPrestiged > 0 && (
          <span className={styles.badge}>{`×${timesPrestiged} Prestige`}</span>
        )}
      </div>

      <div className={styles.bonuses}>
        {/* Example 1 */}
        <div className={styles.bonusRow}>
          <span className={styles.bonusIcon}>{'⚡'}</span>
          <span className={styles.bonusLabel}>
            {'Production Multiplier'}
            {timesPrestiged > 0 && <em>{' (Example 1)'}</em>}
          </span>
          <span className={`${styles.bonusValue} ${timesPrestiged > 0 ? styles.active : ''}`}>
            {`×${currentMultiplier.toFixed(1)}`}
            {canPrestige && ` → ×${nextMultiplier.toFixed(1)}`}
          </span>
        </div>

        {/* Example 2 */}
        <div className={styles.bonusRow}>
          <span className={styles.bonusIcon}>{'🎒'}</span>
          <span className={styles.bonusLabel}>
            {'Starting Resources'}
            {timesPrestiged > 0 && <em>{' (Example 2)'}</em>}
          </span>
          <span className={`${styles.bonusValue} ${timesPrestiged > 0 ? styles.active : ''}`}>
            {formatResources(currentStarting)}
            {canPrestige && ` → ${formatResources(nextStarting)}`}
          </span>
        </div>

        {/* Example 3 */}
        <div className={styles.bonusRow}>
          <span className={styles.bonusIcon}>{'🏷️'}</span>
          <span className={styles.bonusLabel}>
            {'Cost Discount'}
            {timesPrestiged > 0 && <em>{' (Example 3)'}</em>}
          </span>
          <span className={`${styles.bonusValue} ${timesPrestiged > 0 ? styles.active : ''}`}>
            {`${(currentDiscount * 100).toFixed(0)}%`}
            {canPrestige && ` → ${(nextDiscount * 100).toFixed(0)}%`}
          </span>
        </div>
      </div>

      <div className={styles.footer}>
        <button
          className={styles.prestigeButton}
          onClick={handlePrestige}
          disabled={!canPrestige}
        >
          {'✨ Prestige & Reset'}
        </button>
        <p className={`${styles.hint} ${canPrestige ? styles.hintReady : ''}`}>
          {canPrestige
            ? '🎉 All cells filled — you can prestige!'
            : 'Fill every grid cell to unlock prestige'}
        </p>
      </div>
    </div>
  );
}
