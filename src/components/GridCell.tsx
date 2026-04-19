import { useState } from 'react';
import { useTimer } from '../hooks/useTimer';
import { BuildingDetail } from './BuildingDetail';
import { ConfirmDialog } from './ConfirmDialog';
import { ResourceIcon } from './ResourceIcon';
import type { BuildingInstance, BuildingTimer, Resources } from '../types/game';
import type { BuildingConfig } from '../config/buildings';
import { buildings } from '../config/buildings';
import { getUpgradeCost, hasAnyCost, applyDiscount, RESOURCE_KEYS } from '../utils/buildingUtils';
import { formatTime } from '../utils/timeUtils';
import styles from './GridCell.module.css';

interface OccupiedCellProps {
  instance: BuildingInstance;
  config: BuildingConfig;
  buildingInstances: BuildingInstance[];
  isBuildLimitReached: boolean;
  canAfford: (cost: Resources) => boolean;
  currentResources: Resources;
  spend: (cost: Resources) => boolean;
  onBuildingUpdate: (instanceId: string, timerState: BuildingTimer) => void;
  onDestroyBuilding: (instanceId: string) => void;
  /** Example 3 — fractional cost discount from prestige (0–0.5). */
  costDiscount: number;
  /** Example 4 — fractional build speed discount from prestige (0–0.1). */
  buildSpeedDiscount: number;
}

function OccupiedCell({
  instance,
  config,
  buildingInstances,
  isBuildLimitReached,
  canAfford,
  currentResources,
  spend,
  onBuildingUpdate,
  onDestroyBuilding,
  costDiscount,
  buildSpeedDiscount,
}: OccupiedCellProps) {
  const adjustedDuration = Math.round(config.duration * (1 - buildSpeedDiscount));
  const { timerState, startTimer, completeTimer, acknowledgeComplete, reduceTime } = useTimer(
    adjustedDuration,
    instance.id
  );
  const [showDetail, setShowDetail] = useState(false);
  const [showDestroyConfirm, setShowDestroyConfirm] = useState(false);

  const syncAndUpdate = (updatedState: BuildingTimer) => {
    onBuildingUpdate(instance.id, updatedState);
  };

  /**
   * When upgradeRequiresMatchingLevel is set, at least one other (non-self)
   * building must exist on the grid with level >= this building's current level.
   * The level-0 → 1 auto-build is never gated because it's triggered on
   * placement, before other buildings exist.
   */
  const upgradeRequirementMet = (() => {
    if (!config.upgradeRequiresMatchingLevel) return true;
    const currentLevel = timerState.level;
    if (currentLevel === 0) return true; // initial auto-build is always allowed
    // Require a building of a *different type* (not just a different instance)
    // to be at the required level. This ensures the player has diversified their
    // settlement rather than simply having another instance of the same building.
    return buildingInstances.some(
      other =>
        other.buildingTypeId !== config.id &&
        other.buildingTimer.level >= currentLevel
    );
  })();

  /**
   * The castle's current level acts as an upper bound for all other buildings.
   * No non-foundation building may be upgraded to a level higher than the castle.
   * Returns the castle's current level, or null when no cap applies (i.e. this
   * IS the castle, or no castle exists on the grid yet).
   */
  const castleLevelCap = (() => {
    if (config.isFoundation) return null;
    const castleConfig = buildings.find(b => b.isFoundation);
    if (!castleConfig) return null;
    const castleInstance = buildingInstances.find(i => i.buildingTypeId === castleConfig.id);
    if (!castleInstance) return null;
    return castleInstance.buildingTimer.level;
  })();

  const handleStart = () => {
    if (!upgradeRequirementMet) return;
    if (castleLevelCap !== null && timerState.level >= castleLevelCap) return;
    const rawUpgradeCost = getUpgradeCost(config, timerState.level);
    const upgradeCost = applyDiscount(rawUpgradeCost, costDiscount);
    if (hasAnyCost(upgradeCost)) {
      if (!spend(upgradeCost)) return;
    }
    startTimer();
    const next: BuildingTimer = {
      ...timerState,
      hasStarted: true,
    };
    syncAndUpdate(next);
  };

  const handleFinish = () => {
    completeTimer();
    const next: BuildingTimer = {
      ...timerState,
      hasStarted: true,
      isComplete: true,
      progress: 100,
      timeRemaining: 0,
    };
    syncAndUpdate(next);
  };

  const handleAcknowledge = () => {
    acknowledgeComplete();
    const next: BuildingTimer = {
      hasStarted: false,
      isComplete: false,
      level: timerState.level,
      progress: 0,
      timeRemaining: adjustedDuration,
    };
    syncAndUpdate(next);
  };

  const handleDestroy = () => {
    setShowDestroyConfirm(true);
  };

  // Foundation buildings may only be removed while still at level ≤ 1 and
  // when no other buildings are present on the grid.
  const canDestroy = config.isFoundation
    ? timerState.level <= 1 && buildingInstances.length === 1
    : true;

  const progressColor =
    timerState.progress >= 80
      ? '#22c55e'
      : timerState.progress >= 40
        ? '#eab308'
        : '#3b82f6';

  const currentIcon =
    timerState.level >= 5
      ? config.ultraIcon
      : timerState.level >= 2
        ? config.enhancedIcon
        : config.icon;

  const level = timerState.level;
  const productionEntries = level > 0
    ? RESOURCE_KEYS.filter(k => config.production[k] > 0)
    : [];
  const multiplier = level > 0 ? Math.pow(config.productionMultiplier, level - 1) : 1;

  return (
    <div className={styles.occupiedCell}>
      <button
        className={styles.iconButton}
        onClick={() => setShowDetail(true)}
        title={`${config.name} — click for details`}
      >
        <span className={styles.buildingIcon}>
          <img src={currentIcon} alt={config.name} width="28" height="28" />
        </span>
      </button>
      <span className={styles.buildingName}>{config.name}</span>
      <span className={styles.levelLabel}>{`Lv ${timerState.level}`}</span>
      {productionEntries.length > 0 && (
        <span className={styles.productionInfo}>
          {productionEntries.map((k, i) => (
            <span key={k}>
              {i > 0 && ' '}
              <ResourceIcon resource={k} size={9} />
              {(config.production[k] * multiplier).toFixed(1)}
            </span>
          ))}
          {'/s'}
        </span>
      )}

      {(timerState.hasStarted || timerState.isComplete) && (
        <div className={styles.progressBarWrapper}>
          <div
            className={styles.progressBar}
            style={{ width: `${timerState.progress}%`, background: progressColor }}
          />
        </div>
      )}

      {timerState.isComplete ? (
        <button className={styles.completeButton} onClick={handleAcknowledge}>
          {'✔ Complete'}
        </button>
      ) : timerState.hasStarted ? (
        <>
          <span className={styles.timeRemaining}>{formatTime(timerState.timeRemaining)}</span>
          {timerState.timeRemaining <= 30000 && (
            <button className={styles.finishButton} onClick={handleFinish}>
              {'⚡ Finish'}
            </button>
          )}
        </>
      ) : null}

      {showDestroyConfirm && (
        <ConfirmDialog
          message={`Destroy ${config.name}? This cannot be undone.`}
          confirmLabel="Destroy"
          onConfirm={() => { setShowDestroyConfirm(false); onDestroyBuilding(instance.id); }}
          onCancel={() => setShowDestroyConfirm(false)}
        />
      )}

      {showDetail && (
        <BuildingDetail
          config={config}
          instance={instance}
          timerState={timerState}
          isBuildLimitReached={isBuildLimitReached}
          canAfford={canAfford}
          currentResources={currentResources}
          upgradeRequirementMet={upgradeRequirementMet}
          castleLevelCap={castleLevelCap}
          costDiscount={costDiscount}
          spend={spend}
          onStart={handleStart}
          onFinish={handleFinish}
          onAcknowledge={handleAcknowledge}
          onClose={() => setShowDetail(false)}
          onDestroy={handleDestroy}
          canDestroy={canDestroy}
          onReduceTime={reduceTime}
        />
      )}
    </div>
  );
}

interface GridCellProps {
  cell: {
    isOccupied: boolean;
    position: { x: number; y: number };
    buildingInstance: BuildingInstance | null;
  };
  buildingInstances: BuildingInstance[];
  isBuildLimitReached: boolean;
  canAfford: (cost: Resources) => boolean;
  currentResources: Resources;
  spend: (cost: Resources) => boolean;
  onEmptyCellClick: (position: { x: number; y: number }) => void;
  onBuildingUpdate: (instanceId: string, timerState: BuildingTimer) => void;
  onDestroyBuilding: (instanceId: string) => void;
  getBuildingConfig: (buildingTypeId: string) => BuildingConfig | undefined;
  /** Example 3 — fractional cost discount from prestige (0–0.5). */
  costDiscount: number;
  /** Example 4 — fractional build speed discount from prestige (0–0.1). */
  buildSpeedDiscount: number;
}

export function GridCell({
  cell,
  buildingInstances,
  isBuildLimitReached,
  canAfford,
  currentResources,
  spend,
  onEmptyCellClick,
  onBuildingUpdate,
  onDestroyBuilding,
  getBuildingConfig,
  costDiscount,
  buildSpeedDiscount,
}: GridCellProps) {
  if (!cell.isOccupied || !cell.buildingInstance) {
    return (
      <div
        className={styles.emptyCell}
        onClick={() => onEmptyCellClick(cell.position)}
        title={`Place building at (${cell.position.x}, ${cell.position.y})`}
      >
        <span className={styles.addIcon}>{'+'}</span>
        <span className={styles.positionLabel}>{`${cell.position.x},${cell.position.y}`}</span>
      </div>
    );
  }

  const config = getBuildingConfig(cell.buildingInstance.buildingTypeId);
  if (!config) return null;

  return (
    <OccupiedCell
      instance={cell.buildingInstance}
      config={config}
      buildingInstances={buildingInstances}
      isBuildLimitReached={isBuildLimitReached}
      canAfford={canAfford}
      currentResources={currentResources}
      spend={spend}
      onBuildingUpdate={onBuildingUpdate}
      onDestroyBuilding={onDestroyBuilding}
      costDiscount={costDiscount}
      buildSpeedDiscount={buildSpeedDiscount}
    />
  );
}
