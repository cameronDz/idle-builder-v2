import type { BuildingConfig } from '../config/buildings';
import type { BuildingInstance, BuildingTimer, Resources } from '../types/game';
import { formatTime } from '../utils/timeUtils';
import { getUpgradeCost, formatCost, hasAnyCost } from '../utils/buildingUtils';
import styles from './BuildingDetail.module.css';

interface BuildingDetailProps {
  config: BuildingConfig;
  instance: BuildingInstance;
  timerState: BuildingTimer;
  isBuildLimitReached: boolean;
  canAfford: (cost: Resources) => boolean;
  onStart: () => void;
  onFinish: () => void;
  onAcknowledge: () => void;
  onClose: () => void;
}

export function BuildingDetail({
  config,
  instance,
  timerState,
  isBuildLimitReached,
  canAfford,
  onStart,
  onFinish,
  onAcknowledge,
  onClose,
}: BuildingDetailProps) {
  const level = timerState.level;

  const upgradeCost = getUpgradeCost(config, level);
  const upgradeCostStr = formatCost(upgradeCost);
  const hasUpgradeCost = hasAnyCost(upgradeCost);
  const canAffordUpgrade = !hasUpgradeCost || canAfford(upgradeCost);

  const currentIcon =
    level >= 5 ? config.ultraIcon : level >= 2 ? config.enhancedIcon : config.icon;

  const multiplier = level > 0 ? Math.pow(config.productionMultiplier, level - 1) : 1;
  const productionParts: string[] = [];
  if (config.production.gold > 0) productionParts.push(`💰${(config.production.gold * multiplier).toFixed(1)}`);
  if (config.production.wood > 0) productionParts.push(`🌲${(config.production.wood * multiplier).toFixed(1)}`);
  if (config.production.stone > 0) productionParts.push(`🪨${(config.production.stone * multiplier).toFixed(1)}`);
  if (config.production.ore > 0) productionParts.push(`🔩${(config.production.ore * multiplier).toFixed(1)}`);
  if (config.production.food > 0) productionParts.push(`🍖${(config.production.food * multiplier).toFixed(1)}`);
  const productionStr = productionParts.length > 0 ? productionParts.join(' ') + '/s' : null;

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

          {productionStr && (
            <div className={styles.row}>
              <span className={styles.label}>{'Production'}</span>
              <span className={`${styles.value} ${styles.production}`}>{`+${productionStr}`}</span>
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
              <span className={`${styles.value} ${canAffordUpgrade ? '' : styles.costUnaffordable}`}>
                {upgradeCostStr}
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
              disabled={isBuildLimitReached || !canAffordUpgrade}
              title={
                isBuildLimitReached
                  ? 'Max concurrent builds reached'
                  : !canAffordUpgrade
                    ? 'Not enough resources'
                    : 'Start construction'
              }
            >
              {`▶ Start Construction (${formatTime(timerState.timeRemaining)})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
