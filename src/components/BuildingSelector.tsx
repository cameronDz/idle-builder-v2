import { buildings } from '../config/buildings';
import type { BuildingConfig } from '../config/buildings';
import type { Resources } from '../types/game';
import styles from './BuildingSelector.module.css';
import { formatTime } from '../utils/timeUtils';
import { applyDiscount, hasAnyCost, RESOURCE_KEYS } from '../utils/buildingUtils';
import { ResourceIcon } from './ResourceIcon';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

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

  const productionEntries = RESOURCE_KEYS.filter(k => config.production[k] > 0);

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
          {RESOURCE_KEYS
            .filter(k => discountedCost[k] > 0)
            .map(k => (
              <span key={k} className={resources[k] < discountedCost[k] ? styles.costUnaffordable : ''}>
                <ResourceIcon resource={k} size={12} />
                {`${discountedCost[k]} `}
              </span>
            ))}
          {isFree && 'Free'}
        </span>
        {productionEntries.length > 0 && (
          <span className={styles.production}>
            +{productionEntries.map((k, i) => (
              <span key={k}>
                {i > 0 && ' '}
                <ResourceIcon resource={k} size={12} />
                {`${config.production[k]}/s`}
              </span>
            ))}
          </span>
        )}
      </div>
      <span className={styles.count}>
        {count}/{config.maxCount}
      </span>
    </button>
  );
}

export function BuildingSelector({ onSelect, onCancel, getBuildingCount, canAfford, resources, costDiscount }: BuildingSelectorProps) {
  useBodyScrollLock();
  const foundationIsBuilt = buildings.some(b => b.isFoundation && getBuildingCount(b.id) > 0);

  // When no castle exists, promote it to the top of the list so the player
  // can see immediately what they need to build first.
  const orderedBuildings = foundationIsBuilt
    ? buildings
    : [
        ...buildings.filter(b => b.isFoundation),
        ...buildings.filter(b => !b.isFoundation),
      ];

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
          {orderedBuildings.map(config => (
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
