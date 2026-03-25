import type { Resources } from '../types/game';
import styles from './ResourceBar.module.css';
import { formatNumber } from '../utils/buildingUtils';

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
          {`💰 ${formatNumber(resources.gold)}`}
          {productionPerSecond.gold > 0 && (
            <span className={styles.perSecond}>{` (+${formatNumber(productionPerSecond.gold)}/s)`}</span>
          )}
        </span>
      </div>
      <span className={styles.separator}>{'|'}</span>
      <div className={styles.resource}>
        <span className={styles.resourceLabel}>{'Wood'}</span>
        <span className={styles.resourceValue}>
          {`🌲 ${formatNumber(resources.wood)}`}
          {productionPerSecond.wood > 0 && (
            <span className={styles.perSecond}>{` (+${formatNumber(productionPerSecond.wood)}/s)`}</span>
          )}
        </span>
      </div>
      <span className={styles.separator}>{'|'}</span>
      <div className={styles.resource}>
        <span className={styles.resourceLabel}>{'Stone'}</span>
        <span className={styles.resourceValue}>
          {`🪨 ${formatNumber(resources.stone)}`}
          {productionPerSecond.stone > 0 && (
            <span className={styles.perSecond}>{` (+${formatNumber(productionPerSecond.stone)}/s)`}</span>
          )}
        </span>
      </div>
      <span className={styles.separator}>{'|'}</span>
      <div className={styles.resource}>
        <span className={styles.resourceLabel}>{'Ore'}</span>
        <span className={styles.resourceValue}>
          {`🔩 ${formatNumber(resources.ore)}`}
          {productionPerSecond.ore > 0 && (
            <span className={styles.perSecond}>{` (+${formatNumber(productionPerSecond.ore)}/s)`}</span>
          )}
        </span>
      </div>
      <span className={styles.separator}>{'|'}</span>
      <div className={styles.resource}>
        <span className={styles.resourceLabel}>{'Food'}</span>
        <span className={styles.resourceValue}>
          {`🍖 ${formatNumber(resources.food)}`}
          {productionPerSecond.food > 0 && (
            <span className={styles.perSecond}>{` (+${formatNumber(productionPerSecond.food)}/s)`}</span>
          )}
        </span>
      </div>
    </div>
  );
}
