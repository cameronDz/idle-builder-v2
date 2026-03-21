import type { BuildingConfig } from '../config/buildings';
import type { BuildingInstance, BuildingTimer } from '../types/game';
import { formatTime } from '../utils/timeUtils';
import styles from './BuildingDetail.module.css';

interface BuildingDetailProps {
  config: BuildingConfig;
  instance: BuildingInstance;
  timerState: BuildingTimer;
  isBuildLimitReached: boolean;
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
  onStart,
  onFinish,
  onAcknowledge,
  onClose,
}: BuildingDetailProps) {
  const level = timerState.level;

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
              disabled={isBuildLimitReached}
              title={isBuildLimitReached ? 'Max concurrent builds reached' : 'Start construction'}
            >
              {'▶ Start Construction'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
