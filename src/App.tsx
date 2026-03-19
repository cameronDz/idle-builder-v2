import { Grid } from './components/Grid';
import { ResourceBar } from './components/ResourceBar';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>{'🏰 Idle Builder v2'}</h1>
        <p className={styles.subtitle}>{'Settlement building idle game with resource production'}</p>
      </header>

      <ResourceBar />

      <main className={styles.main}>
        <div className={styles.container}>
          <Grid />
        </div>
      </main>
    </div>
  );
}

export default App;
