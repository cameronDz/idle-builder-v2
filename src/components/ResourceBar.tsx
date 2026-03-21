import type { Resources } from '../types/game';
import styles from './ResourceBar.module.css';

interface ResourceBarProps {
  resources: Resources;
  productionPerSecond: Resources;
}

export function ResourceBar({ resources, productionPerSecond }: ResourceBarProps) {
  return (
    <div className={styles.resourceBar}>
      <span className={styles.resource}>
        {`💰 ${Math.floor(resources.gold)}`}
        {productionPerSecond.gold > 0 && (
          <span className={styles.perSecond}>{` (+${productionPerSecond.gold.toFixed(1)}/s)`}</span>
        )}
      </span>
      <span className={styles.separator}>{'|'}</span>
      <span className={styles.resource}>
        {`🪵 ${Math.floor(resources.wood)}`}
        {productionPerSecond.wood > 0 && (
          <span className={styles.perSecond}>{` (+${productionPerSecond.wood.toFixed(1)}/s)`}</span>
        )}
      </span>
      <span className={styles.separator}>{'|'}</span>
      <span className={styles.resource}>
        {`🪨 ${Math.floor(resources.stone)}`}
        {productionPerSecond.stone > 0 && (
          <span className={styles.perSecond}>{` (+${productionPerSecond.stone.toFixed(1)}/s)`}</span>
        )}
      </span>
    </div>
  );
}
