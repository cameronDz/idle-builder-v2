import { useEffect } from 'react';
import { Grid } from './components/Grid';
import { ResourceBar } from './components/ResourceBar';
import { PrestigePanel } from './components/PrestigePanel';
import { useResources } from './hooks/useResources';
import { useProductionTick } from './hooks/useProductionTick';
import { useGridSystem } from './hooks/useGridSystem';
import { usePrestige } from './hooks/usePrestige';
import styles from './App.module.css';

function App() {
  const { resources, canAfford, spend, earn, resetResources } = useResources();
  const gridSystem = useGridSystem();
  const {
    timesPrestiged,
    globalMultiplier,
    costDiscount,
    canPrestige,
    setOccupiedCount,
    prestige,
  } = usePrestige();

  const { productionPerSecond } = useProductionTick(
    gridSystem.buildingInstances,
    earn,
    globalMultiplier
  );

  // Keep the prestige hook informed of how many cells are occupied so it can
  // compute canPrestige without needing grid internals.
  const occupiedCount = gridSystem.buildingInstances.length;
  useEffect(() => {
    setOccupiedCount(occupiedCount);
  }, [occupiedCount, setOccupiedCount]);

  const handlePrestige = () => {
    prestige(gridSystem.clearGrid, resetResources);
  };

  return (
    <div className={styles.app}>
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
          />

          <div className={styles.sidePanel}>
            <PrestigePanel
              timesPrestiged={timesPrestiged}
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
