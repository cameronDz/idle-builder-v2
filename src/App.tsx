import { Grid } from './components/Grid';
import { ResourceBar } from './components/ResourceBar';
import { useResources } from './hooks/useResources';
import { useProductionTick } from './hooks/useProductionTick';
import { useGridSystem } from './hooks/useGridSystem';
import styles from './App.module.css';

function App() {
  const { resources, canAfford, spend, earn, resetResources } = useResources();
  const gridSystem = useGridSystem();
  const { productionPerSecond } = useProductionTick(gridSystem.buildingInstances, earn);

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
          />
        </div>
      </main>
    </div>
  );
}

export default App;
