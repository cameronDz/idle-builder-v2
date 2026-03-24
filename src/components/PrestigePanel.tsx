import { useState } from 'react';
import type { Resources } from '../types/game';
import {
  computeGlobalMultiplier,
  computeStartingResources,
  computeCostDiscount,
  computeRequiredCastleLevel,
  MAX_PRESTIGES,
} from '../hooks/usePrestige';
import { RESOURCE_KEYS, RESOURCE_EMOJIS } from '../utils/buildingUtils';
import styles from './PrestigePanel.module.css';

interface PrestigePanelProps {
  timesPrestiged: number;
  /** Current Stone Castle timer level (0 = not yet levelled up). */
  castleLevel: number;
  /** Required castle level for the next prestige (from hook). */
  requiredCastleLevel: number;
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
 * Renders starting resources as one line per resource type (current → next).
 */
function StartingResourceLines({ current, next }: { current: Resources; next: Resources }) {
  const lines = RESOURCE_KEYS.filter(k => next[k] > 0);
  return (
    <div className={styles.resourceLines}>
      {lines.map(k => (
        <div key={k}>{`${RESOURCE_EMOJIS[k]}${current[k]} → ${RESOURCE_EMOJIS[k]}${next[k]}`}</div>
      ))}
    </div>
  );
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
 * The prestige button is only enabled when the Stone Castle is at the required
 * level for the next prestige tier and max prestige has not been reached.
 */
export function PrestigePanel({
  timesPrestiged,
  castleLevel,
  requiredCastleLevel,
  canPrestige,
  onPrestige,
}: PrestigePanelProps) {
  const nextPrestigeCount = timesPrestiged + 1;
  const isMaxPrestige = timesPrestiged >= MAX_PRESTIGES;
  const castleRequirementMet = castleLevel >= requiredCastleLevel;

  // Show next-tier requirement when available
  const nextRequiredCastleLevel = isMaxPrestige
    ? null
    : computeRequiredCastleLevel(nextPrestigeCount + 1);

  const currentMultiplier = computeGlobalMultiplier(timesPrestiged);
  const nextMultiplier = computeGlobalMultiplier(nextPrestigeCount);

  const currentStarting = computeStartingResources(timesPrestiged);
  const nextStarting = computeStartingResources(nextPrestigeCount);

  const currentDiscount = computeCostDiscount(timesPrestiged);
  const nextDiscount = computeCostDiscount(nextPrestigeCount);

  const [isExpanded, setIsExpanded] = useState(true);

  const handlePrestige = () => {
    if (!canPrestige) return;
    if (!window.confirm('Prestige? Your grid will be cleared and resources reset. All 3 permanent bonuses will increase.')) return;
    onPrestige();
  };

  return (
    <div className={styles.panel}>
      <button
        className={styles.header}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label="Toggle prestige panel"
      >
        <h2 className={styles.title}>{'✨ Prestige'}</h2>
        <div className={styles.headerRight}>
          {timesPrestiged > 0 && (
            <span className={styles.badge}>
              {isMaxPrestige ? `★ Max Prestige` : `×${timesPrestiged} Prestige`}
            </span>
          )}
          <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>{'▾'}</span>
        </div>
      </button>

      {isExpanded && (
        <>
      {/* Castle level requirement row */}
      <div className={styles.bonuses}>
        <div className={styles.bonusRow}>
          <span className={styles.bonusIcon}>{'🏰'}</span>
          <span className={styles.bonusLabel}>
            {isMaxPrestige ? 'Castle Requirement' : `Castle Required (Prestige ${nextPrestigeCount})`}
          </span>
          <span className={`${styles.bonusValue} ${isMaxPrestige ? styles.active : castleRequirementMet ? styles.active : styles.unmet}`}>
            {isMaxPrestige
              ? '★ Max reached'
              : `Lv ${castleLevel} / ${requiredCastleLevel}`}
          </span>
        </div>

        {/* Tier preview: show the requirement for the next tier if it differs */}
        {!isMaxPrestige && nextRequiredCastleLevel !== null && nextRequiredCastleLevel !== requiredCastleLevel && (
          <div className={styles.bonusRow}>
            <span className={styles.bonusIcon}>{''}</span>
            <span className={styles.bonusLabel}>{`Castle Required (Prestige ${nextPrestigeCount + 1}+)`}</span>
            <span className={styles.bonusValue}>{`Lv ${nextRequiredCastleLevel}`}</span>
          </div>
        )}
      </div>

      <div className={styles.bonuses}>
        {/* Example 1 */}
        <div className={styles.bonusRow}>
          <span className={styles.bonusIcon}>{'⚡'}</span>
          <span className={styles.bonusLabel}>
            {'Production Multiplier'}
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
          </span>
          <span className={`${styles.bonusValue} ${timesPrestiged > 0 ? styles.active : ''}`}>
            {canPrestige
              ? <StartingResourceLines current={currentStarting} next={nextStarting} />
              : formatResources(currentStarting)}
          </span>
        </div>

        {/* Example 3 */}
        <div className={styles.bonusRow}>
          <span className={styles.bonusIcon}>{'🏷️'}</span>
          <span className={styles.bonusLabel}>
            {'Cost Discount'}
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
          {isMaxPrestige ? '★ Max Prestige Reached' : '✨ Prestige & Reset'}
        </button>
        <p className={`${styles.hint} ${canPrestige ? styles.hintReady : ''}`}>
          {isMaxPrestige
            ? '🏆 You have reached maximum prestige!'
            : castleRequirementMet
              ? `🎉 Castle Lv ${castleLevel} — requirement met, prestige ready!`
              : `Upgrade the 🏰 Castle to level ${requiredCastleLevel} to prestige`}
        </p>
      </div>
        </>
      )}
    </div>
  );
}
