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
  resources: Resources;
}

function BuildingCard({
  config,
  count,
  affordable,
  foundationIsBuilt,
  resources,
  onSelect,
}: {
  config: BuildingConfig;
  count: number;
  affordable: boolean;
  foundationIsBuilt: boolean;
  resources: Resources;
  onSelect: () => void;
}) {
  const isMaxed = count >= config.maxCount;
  const requiresFoundation = !config.isFoundation && !foundationIsBuilt;
  const isDisabled = isMaxed || !affordable || requiresFoundation;

  const productionParts: string[] = [];
  if (config.production.gold > 0) productionParts.push(`💰${config.production.gold}`);
  if (config.production.wood > 0) productionParts.push(`🌲${config.production.wood}`);
  if (config.production.stone > 0) productionParts.push(`🪨${config.production.stone}`);
  if (config.production.ore > 0) productionParts.push(`🔩${config.production.ore}`);
  if (config.production.food > 0) productionParts.push(`🍖${config.production.food}`);
  const productionStr = productionParts.length > 0 ? productionParts.join(' ') + '/s' : null;

  const isFree =
    config.cost.gold === 0 &&
    config.cost.wood === 0 &&
    config.cost.stone === 0 &&
    config.cost.ore === 0 &&
    config.cost.food === 0;

  const foundationName = buildings.find(b => b.isFoundation)?.name ?? 'foundation building';

  return (
    <button
      className={`${styles.buildingCard} ${isDisabled ? styles.disabled : ''}`}
      onClick={onSelect}
      disabled={isDisabled}
      title={
        isMaxed
          ? `Max ${config.maxCount} allowed`
          : requiresFoundation
            ? `Build the ${foundationName} first`
            : !affordable
              ? 'Not enough resources'
              : `Place ${config.name}`
      }
    >
      <span className={styles.icon}>{config.icon}</span>
      <div className={styles.info}>
        <span className={styles.name}>{config.name}</span>
        <span className={styles.duration}>{formatTime(config.duration)}</span>
        <span className={styles.cost}>
          {config.cost.gold > 0 && (
            <span className={resources.gold < config.cost.gold ? styles.costUnaffordable : ''}>
              {`💰${config.cost.gold} `}
            </span>
          )}
          {config.cost.wood > 0 && (
            <span className={resources.wood < config.cost.wood ? styles.costUnaffordable : ''}>
              {`🌲${config.cost.wood} `}
            </span>
          )}
          {config.cost.stone > 0 && (
            <span className={resources.stone < config.cost.stone ? styles.costUnaffordable : ''}>
              {`🪨${config.cost.stone} `}
            </span>
          )}
          {config.cost.ore > 0 && (
            <span className={resources.ore < config.cost.ore ? styles.costUnaffordable : ''}>
              {`🔩${config.cost.ore} `}
            </span>
          )}
          {config.cost.food > 0 && (
            <span className={resources.food < config.cost.food ? styles.costUnaffordable : ''}>
              {`🍖${config.cost.food} `}
            </span>
          )}
          {isFree && 'Free'}
        </span>
        {productionStr && <span className={styles.production}>{`+${productionStr}`}</span>}
      </div>
      <span className={styles.count}>
        {count}/{config.maxCount}
      </span>
    </button>
  );
}

export function BuildingSelector({ onSelect, onCancel, getBuildingCount, canAfford, resources }: BuildingSelectorProps) {
  const foundationIsBuilt = buildings.some(b => b.isFoundation && getBuildingCount(b.id) > 0);

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{'Select Building'}</h2>
          <button className={styles.cancelButton} onClick={onCancel}>{'✕'}</button>
        </div>
        {!foundationIsBuilt && (
          <p className={styles.foundationHint}>
            {'🏰 Place the Stone Castle first — it is the foundation of your settlement.'}
          </p>
        )}
        <div className={styles.list}>
          {buildings.map(config => (
            <BuildingCard
              key={config.id}
              config={config}
              count={getBuildingCount(config.id)}
              affordable={canAfford(config.cost)}
              foundationIsBuilt={foundationIsBuilt}
              resources={resources}
              onSelect={() => onSelect(config.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
