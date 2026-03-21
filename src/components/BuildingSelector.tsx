import { buildings } from '../config/buildings';
import type { BuildingConfig } from '../config/buildings';
import type { Resources } from '../types/game';
import styles from './BuildingSelector.module.css';
import { formatTime } from '../utils/timeUtils';

interface BuildingSelectorProps {
  onSelect: (buildingTypeId: string) => void;
  onCancel: () => void;
  getBuildingCount: (buildingTypeId: string) => number;
  canAfford: (cost: Resources) => boolean;
}

function BuildingCard({
  config,
  count,
  affordable,
  onSelect,
}: {
  config: BuildingConfig;
  count: number;
  affordable: boolean;
  onSelect: () => void;
}) {
  const isMaxed = count >= config.maxCount;
  const isDisabled = isMaxed || !affordable;

  return (
    <button
      className={`${styles.buildingCard} ${isDisabled ? styles.disabled : ''}`}
      onClick={onSelect}
      disabled={isDisabled}
      title={
        isMaxed
          ? `Max ${config.maxCount} allowed`
          : !affordable
            ? 'Not enough resources'
            : `Place ${config.name}`
      }
    >
      <span className={styles.icon}>{config.icon}</span>
      <div className={styles.info}>
        <span className={styles.name}>{config.name}</span>
        <span className={styles.duration}>{formatTime(config.duration)}</span>
        <span className={`${styles.cost} ${!affordable ? styles.costUnaffordable : ''}`}>
          {config.cost.gold > 0 && `💰${config.cost.gold} `}
          {config.cost.wood > 0 && `🪵${config.cost.wood} `}
          {config.cost.stone > 0 && `🪨${config.cost.stone}`}
          {config.cost.gold === 0 && config.cost.wood === 0 && config.cost.stone === 0 && 'Free'}
        </span>
      </div>
      <span className={styles.count}>
        {count}/{config.maxCount}
      </span>
    </button>
  );
}

export function BuildingSelector({ onSelect, onCancel, getBuildingCount, canAfford }: BuildingSelectorProps) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{'Select Building'}</h2>
          <button className={styles.cancelButton} onClick={onCancel}>{'✕'}</button>
        </div>
        <div className={styles.list}>
          {buildings.map(config => (
            <BuildingCard
              key={config.id}
              config={config}
              count={getBuildingCount(config.id)}
              affordable={canAfford(config.cost)}
              onSelect={() => onSelect(config.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
