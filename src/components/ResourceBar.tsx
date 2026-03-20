// TODO: Connect to useResources hook in Session 2
// This component will display live gold/wood/stone counts
import styles from './ResourceBar.module.css';

export function ResourceBar() {
  return (
    <div className={styles.resourceBar}>
      <span className={styles.resource}>{'💰 0'}</span>
      <span className={styles.separator}>{'|'}</span>
      <span className={styles.resource}>{'🪵 0'}</span>
      <span className={styles.separator}>{'|'}</span>
      <span className={styles.resource}>{'🪨 0'}</span>
    </div>
  );
}
