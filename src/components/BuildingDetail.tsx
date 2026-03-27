import type { BuildingConfig } from '../config/buildings';
import type { BuildingInstance, BuildingTimer, Resources } from '../types/game';
import { formatTime } from '../utils/timeUtils';
import { getUpgradeCost, hasAnyCost, applyDiscount, RESOURCE_KEYS, formatNumber } from '../utils/buildingUtils';
import { ResourceIcon } from './ResourceIcon';
import { TIME_BOOST_TIERS } from '../config/timeBoosts';
import styles from './BuildingDetail.module.css';

interface BuildingDetailProps {
  config: BuildingConfig;
  instance: BuildingInstance;
  timerState: BuildingTimer;
  isBuildLimitReached: boolean;
  canAfford: (cost: Resources) => boolean;
  /** Current player resources, used to colour individual unaffordable costs red. */
  currentResources: Resources;
  /** False when upgradeRequiresMatchingLevel is set and the requirement is not yet met. */
  upgradeRequirementMet: boolean;
  /**
   * The castle's current level, used to cap upgrades for non-foundation buildings.
   * Null when no cap applies (this building IS the castle, or no castle on the grid).
   */
  castleLevelCap: number | null;
  /** Example 3 — fractional cost discount from prestige (0–0.5). */
  costDiscount: number;
  /** Spend resources from the player's pool; returns false if insufficient funds. */
  spend: (cost: Resources) => boolean;
  onStart: () => void;
  onFinish: () => void;
  onAcknowledge: () => void;
  onClose: () => void;
  /** Called when the player chooses to destroy this building. */
  onDestroy: () => void;
  /** Reduce the active construction timer by the given number of milliseconds. */
  onReduceTime: (ms: number) => void;
}

export function BuildingDetail({
  config,
  instance,
  timerState,
  isBuildLimitReached,
  canAfford,
  currentResources,
  upgradeRequirementMet,
  castleLevelCap,
  costDiscount,
  spend,
  onStart,
  onFinish,
  onAcknowledge,
  onClose,
  onDestroy,
  onReduceTime,
}: BuildingDetailProps) {
  const level = timerState.level;

  const rawUpgradeCost = getUpgradeCost(config, level);
  const upgradeCost = applyDiscount(rawUpgradeCost, costDiscount);
  const hasUpgradeCost = hasAnyCost(upgradeCost);
  const canAffordUpgrade = !hasUpgradeCost || canAfford(upgradeCost);

  const castleLevelCapMet = castleLevelCap === null || level < castleLevelCap;

  const boostCostMultiplier = Math.max(1, castleLevelCap !== null ? castleLevelCap : level);

  const currentIcon =
    level >= 5 ? config.ultraIcon : level >= 2 ? config.enhancedIcon : config.icon;

  const multiplier = level > 0 ? Math.pow(config.productionMultiplier, level - 1) : 1;
  const productionEntries = RESOURCE_KEYS.filter(k => config.production[k] > 0);

  const progressColor =
    timerState.progress >= 80
      ? '#22c55e'
      : timerState.progress >= 40
        ? '#eab308'
        : '#3b82f6';

  const statusLabel = timerState.isComplete
    ? '✔ Complete'
    : timerState.hasStarted
      ? `Building… ${formatTime(timerState.timeRemaining)} remaining`
      : 'Not started';

  const canStart = !isBuildLimitReached && canAffordUpgrade && upgradeRequirementMet && castleLevelCapMet;
  const startDisabledTitle = isBuildLimitReached
    ? 'Max concurrent builds reached'
    : !canAffordUpgrade
      ? 'Not enough resources'
      : !upgradeRequirementMet
        ? `Need another building at level ${level} or above to upgrade`
        : !castleLevelCapMet
          ? `Upgrade the castle to level ${level + 1} first`
          : 'Start construction';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <span className={styles.icon}>{currentIcon}</span>
            <div>
              <h2 className={styles.title}>{config.name}</h2>
              <span className={styles.levelBadge}>{`Level ${level}`}</span>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>{'✕'}</button>
        </div>

        <div className={styles.body}>
          <div className={styles.row}>
            <span className={styles.label}>{'Position'}</span>
            <span className={styles.value}>{`(${instance.position.x}, ${instance.position.y})`}</span>
          </div>

          {productionEntries.length > 0 && (
            <div className={styles.row}>
              <span className={styles.label}>{'Production'}</span>
              <span className={`${styles.value} ${styles.production}`}>
                +{productionEntries.map((k, i) => (
                  <span key={k}>
                    {i > 0 && ' '}
                    <ResourceIcon resource={k} size={12} />
                    {formatNumber(config.production[k] * multiplier)}
                  </span>
                ))}/s
              </span>
            </div>
          )}

          <div className={styles.row}>
            <span className={styles.label}>{'Status'}</span>
            <span className={`${styles.value} ${timerState.isComplete ? styles.statusComplete : ''}`}>
              {statusLabel}
            </span>
          </div>

          {!timerState.hasStarted && !timerState.isComplete && hasUpgradeCost && (
            <div className={styles.row}>
              <span className={styles.label}>{'Upgrade Cost'}</span>
              <span className={`${styles.value} ${styles.costParts}`}>
                {RESOURCE_KEYS
                  .filter(k => upgradeCost[k] > 0)
                  .map(k => (
                    <span key={k} className={currentResources[k] >= upgradeCost[k] ? '' : styles.costUnaffordable}>
                      <ResourceIcon resource={k} size={12} />
                      {formatNumber(upgradeCost[k])}
                    </span>
                  ))}
              </span>
            </div>
          )}

          {config.upgradeRequiresMatchingLevel && !timerState.hasStarted && !timerState.isComplete && level > 0 && (
            <div className={styles.row}>
              <span className={styles.label}>{'Upgrade Requires'}</span>
              <span className={`${styles.value} ${upgradeRequirementMet ? styles.requirementMet : styles.requirementUnmet}`}>
                {upgradeRequirementMet
                  ? `✔ Another building at level ${level}+`
                  : `✘ Need another building at level ${level}+`}
              </span>
            </div>
          )}

          {castleLevelCap !== null && !timerState.hasStarted && !timerState.isComplete && (
            <div className={styles.row}>
              <span className={styles.label}>{'Castle Level Cap'}</span>
              <span className={`${styles.value} ${castleLevelCapMet ? styles.requirementMet : styles.requirementUnmet}`}>
                {castleLevelCapMet
                  ? `✔ Castle (Lv ${castleLevelCap}) allows upgrade`
                  : `✘ Castle (Lv ${castleLevelCap}) — upgrade to Lv ${level + 1} required`}
              </span>
            </div>
          )}

          {(timerState.hasStarted || timerState.isComplete) && (
            <div className={styles.progressBarWrapper}>
              <div
                className={styles.progressBar}
                style={{ width: `${timerState.progress}%`, background: progressColor }}
              />
            </div>
          )}

          {timerState.hasStarted && !timerState.isComplete && timerState.timeRemaining > 30000 && (
            <div className={styles.boostSection}>
              <span className={styles.boostLabel}>{'⏩ Speed Up'}</span>
              <div className={styles.boostButtons}>
                {TIME_BOOST_TIERS.filter(tier =>
                  timerState.timeRemaining >= tier.reductionMs * 0.5
                ).slice(-4).map(tier => {
                  const scaledCost: Resources = {
                    gold: tier.cost.gold * boostCostMultiplier,
                    wood: tier.cost.wood * boostCostMultiplier,
                    stone: tier.cost.stone * boostCostMultiplier,
                    ore: tier.cost.ore * boostCostMultiplier,
                    food: tier.cost.food * boostCostMultiplier,
                  };
                  const affordable = canAfford(scaledCost);
                  const costKeys = RESOURCE_KEYS.filter(k => scaledCost[k] > 0);
                  const costStr = costKeys
                    .map(k => `${k}: ${formatNumber(scaledCost[k])}`)
                    .join(', ');
                  return (
                    <button
                      key={tier.id}
                      className={`${styles.boostButton} ${affordable ? '' : styles.boostButtonUnaffordable}`}
                      disabled={!affordable}
                      title={affordable ? `Pay ${costStr} to reduce timer by ${formatTime(tier.reductionMs)}` : `Not enough resources (${costStr})`}
                      onClick={() => {
                        if (!spend(scaledCost)) return;
                        onReduceTime(tier.reductionMs);
                      }}
                    >
                      {`-${formatTime(tier.reductionMs)} — `}
                      {costKeys.map((k, i) => (
                        <span key={k} className={currentResources[k] < scaledCost[k] ? styles.costUnaffordable : ''}>
                          <ResourceIcon resource={k} size={12} />
                          {formatNumber(scaledCost[k])}{i < costKeys.length - 1 ? ' ' : ''}
                        </span>
                      ))}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {timerState.isComplete ? (
            <button className={styles.completeButton} onClick={onAcknowledge}>
              {'✔ Acknowledge & Level Up'}
            </button>
          ) : timerState.hasStarted ? (
            timerState.timeRemaining <= 30000 && (
              <button className={styles.finishButton} onClick={onFinish}>
                {'⚡ Finish Now'}
              </button>
            )
          ) : (
            <button
              className={styles.startButton}
              onClick={onStart}
              disabled={!canStart}
              title={startDisabledTitle}
            >
              {`▶ Start Construction (${formatTime(timerState.timeRemaining)})`}
            </button>
          )}
          {!config.isFoundation && (
            <button
              className={styles.destroyButton}
              onClick={onDestroy}
              title={'Permanently remove this building from the grid'}
            >
              {'🗑️'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
