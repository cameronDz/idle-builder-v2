import { useEffect } from 'react';
import { Grid } from './components/Grid';
import { ResourceBar } from './components/ResourceBar';
import { PrestigePanel } from './components/PrestigePanel';
import { OfflineProgressModal } from './components/OfflineProgressModal';
import { useResources } from './hooks/useResources';
import { useProductionTick } from './hooks/useProductionTick';
import { useGridSystem } from './hooks/useGridSystem';
import { usePrestige } from './hooks/usePrestige';
import { useOfflineProgress } from './hooks/useOfflineProgress';
import styles from './App.module.css';

function App() {
  const { resources, canAfford, spend, earn, resetResources } = useResources();
  const gridSystem = useGridSystem();
  const {
    timesPrestiged,
    globalMultiplier,
    costDiscount,
    buildSpeedDiscount,
    canPrestige,
    requiredCastleLevel,
    setCastleLevel,
    prestige,
  } = usePrestige();

  const { productionPerSecond } = useProductionTick(
    gridSystem.buildingInstances,
    earn,
    globalMultiplier
  );

  const { offlineResult, dismissOfflineResult } = useOfflineProgress(
    gridSystem.buildingInstances,
    globalMultiplier,
    earn
  );

  // Keep the prestige hook informed of the Stone Castle's current level so it
  // can compute canPrestige against the tiered castle-level requirements.
  const castleInstance = gridSystem.buildingInstances.find(
    i => i.buildingTypeId === 'stone_castle'
  );
  const castleLevel = castleInstance?.buildingTimer.level ?? 0;
  useEffect(() => {
    setCastleLevel(castleLevel);
  }, [castleLevel, setCastleLevel]);

  const handlePrestige = () => {
    prestige(gridSystem.clearGrid, resetResources);
  };

  return (
    <div className={styles.app}>
      {offlineResult && (
        <OfflineProgressModal result={offlineResult} onDismiss={dismissOfflineResult} />
      )}

      <header className={styles.header}>
        <h1 className={styles.title}>{'🏰 Idle Builder v2'}</h1>
        <p className={styles.subtitle}>{'Settlement building idle game with resource production'}</p>
      </header>

      <ResourceBar resources={resources} productionPerSecond={productionPerSecond} />

      <main className={styles.main}>
        <div className={styles.container}>
          <Grid
            {...gridSystem}
            resources={resources}
            canAfford={canAfford}
            spend={spend}
            resetResources={resetResources}
            costDiscount={costDiscount}
            buildSpeedDiscount={buildSpeedDiscount}
          />

          <div className={styles.sidePanel}>
            <PrestigePanel
              timesPrestiged={timesPrestiged}
              castleLevel={castleLevel}
              requiredCastleLevel={requiredCastleLevel}
              canPrestige={canPrestige}
              onPrestige={handlePrestige}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
