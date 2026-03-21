import type { Resources } from '../types/game';
import styles from './ResourceBar.module.css';

interface ResourceBarProps {
  resources: Resources;
  productionPerSecond: Resources;
}

export function ResourceBar({ resources, productionPerSecond }: ResourceBarProps) {
  return (
    <div className={styles.resourceBar}>
      <div className={styles.resource}>
        <span className={styles.resourceLabel}>{'Gold'}</span>
        <span className={styles.resourceValue}>
          {`💰 ${Math.floor(resources.gold)}`}
          {productionPerSecond.gold > 0 && (
            <span className={styles.perSecond}>{` (+${productionPerSecond.gold.toFixed(1)}/s)`}</span>
          )}
        </span>
      </div>
      <span className={styles.separator}>{'|'}</span>
      <div className={styles.resource}>
        <span className={styles.resourceLabel}>{'Wood'}</span>
        <span className={styles.resourceValue}>
          {`🌲 ${Math.floor(resources.wood)}`}
          {productionPerSecond.wood > 0 && (
            <span className={styles.perSecond}>{` (+${productionPerSecond.wood.toFixed(1)}/s)`}</span>
          )}
        </span>
      </div>
      <span className={styles.separator}>{'|'}</span>
      <div className={styles.resource}>
        <span className={styles.resourceLabel}>{'Stone'}</span>
        <span className={styles.resourceValue}>
          {`🪨 ${Math.floor(resources.stone)}`}
          {productionPerSecond.stone > 0 && (
            <span className={styles.perSecond}>{` (+${productionPerSecond.stone.toFixed(1)}/s)`}</span>
          )}
        </span>
      </div>
      <span className={styles.separator}>{'|'}</span>
      <div className={styles.resource}>
        <span className={styles.resourceLabel}>{'Ore'}</span>
        <span className={styles.resourceValue}>
          {`🔩 ${Math.floor(resources.ore)}`}
          {productionPerSecond.ore > 0 && (
            <span className={styles.perSecond}>{` (+${productionPerSecond.ore.toFixed(1)}/s)`}</span>
          )}
        </span>
      </div>
      <span className={styles.separator}>{'|'}</span>
      <div className={styles.resource}>
        <span className={styles.resourceLabel}>{'Food'}</span>
        <span className={styles.resourceValue}>
          {`🍖 ${Math.floor(resources.food)}`}
          {productionPerSecond.food > 0 && (
            <span className={styles.perSecond}>{` (+${productionPerSecond.food.toFixed(1)}/s)`}</span>
          )}
        </span>
      </div>
    </div>
  );
}
