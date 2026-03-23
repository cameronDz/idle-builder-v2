import { buildings } from '../config/buildings';
import type { BuildingConfig } from '../config/buildings';
import type { Resources } from '../types/game';
import styles from './BuildingSelector.module.css';
import { formatTime } from '../utils/timeUtils';
import { applyDiscount, hasAnyCost } from '../utils/buildingUtils';

interface BuildingSelectorProps {
  onSelect: (buildingTypeId: string) => void;
  onCancel: () => void;
  getBuildingCount: (buildingTypeId: string) => number;
  canAfford: (cost: Resources) => boolean;
  resources: Resources;
  /** Example 3 — fractional cost discount from prestige (0–0.5). */
  costDiscount: number;
}

function BuildingCard({
  config,
  count,
  affordable,
  foundationIsBuilt,
  resources,
  costDiscount,
  onSelect,
}: {
  config: BuildingConfig;
  count: number;
  affordable: boolean;
  foundationIsBuilt: boolean;
  resources: Resources;
  costDiscount: number;
  onSelect: () => void;
}) {
  const isMaxed = count >= config.maxCount;
  const requiresFoundation = !config.isFoundation && !foundationIsBuilt;
  const isDisabled = isMaxed || !affordable || requiresFoundation;

  const discountedCost = applyDiscount(config.cost, costDiscount);

  const productionParts: string[] = [];
  if (config.production.gold > 0) productionParts.push(`💰${config.production.gold}`);
  if (config.production.wood > 0) productionParts.push(`🌲${config.production.wood}`);
  if (config.production.stone > 0) productionParts.push(`🪨${config.production.stone}`);
  if (config.production.ore > 0) productionParts.push(`🔩${config.production.ore}`);
  if (config.production.food > 0) productionParts.push(`🍖${config.production.food}`);
  const productionStr = productionParts.length > 0 ? productionParts.join(' ') + '/s' : null;

  const isFree = !hasAnyCost(discountedCost);

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
          {discountedCost.gold > 0 && (
            <span className={resources.gold < discountedCost.gold ? styles.costUnaffordable : ''}>
              {`💰${discountedCost.gold} `}
            </span>
          )}
          {discountedCost.wood > 0 && (
            <span className={resources.wood < discountedCost.wood ? styles.costUnaffordable : ''}>
              {`🌲${discountedCost.wood} `}
            </span>
          )}
          {discountedCost.stone > 0 && (
            <span className={resources.stone < discountedCost.stone ? styles.costUnaffordable : ''}>
              {`🪨${discountedCost.stone} `}
            </span>
          )}
          {discountedCost.ore > 0 && (
            <span className={resources.ore < discountedCost.ore ? styles.costUnaffordable : ''}>
              {`🔩${discountedCost.ore} `}
            </span>
          )}
          {discountedCost.food > 0 && (
            <span className={resources.food < discountedCost.food ? styles.costUnaffordable : ''}>
              {`🍖${discountedCost.food} `}
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

export function BuildingSelector({ onSelect, onCancel, getBuildingCount, canAfford, resources, costDiscount }: BuildingSelectorProps) {
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
              affordable={canAfford(applyDiscount(config.cost, costDiscount))}
              foundationIsBuilt={foundationIsBuilt}
              resources={resources}
              costDiscount={costDiscount}
              onSelect={() => onSelect(config.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
