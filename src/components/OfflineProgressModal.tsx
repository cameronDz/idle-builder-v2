import type { Resources } from '../types/game';
import { formatTime } from '../utils/timeUtils';
import { RESOURCE_KEYS, RESOURCE_EMOJIS, formatNumber } from '../utils/buildingUtils';
import type { OfflineResult } from '../hooks/useOfflineProgress';
import styles from './OfflineProgressModal.module.css';

interface OfflineProgressModalProps {
  result: OfflineResult;
  onDismiss: () => void;
}

export function OfflineProgressModal({ result, onDismiss }: OfflineProgressModalProps) {
  const { earned, elapsedMs, isMaxTime } = result;

  const resourceRows = RESOURCE_KEYS.filter(key => earned[key] > 0);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="offline-title">
        <div className={styles.header}>
          <span className={styles.icon}>⏳</span>
          <h2 className={styles.title} id="offline-title">Welcome Back!</h2>
        </div>

        {isMaxTime ? (
          <p className={styles.maxTimeMessage}>
            {'Maximum offline time reached! (3 hours)'}
          </p>
        ) : (
          <p className={styles.awayMessage}>
            {'You were away for '}
            <strong>{formatTime(elapsedMs)}</strong>
            {'.'}
          </p>
        )}

        {resourceRows.length > 0 ? (
          <>
            <p className={styles.earnedLabel}>Resources generated while you were away:</p>
            <ul className={styles.resourceList}>
              {resourceRows.map(key => (
                <li key={key} className={styles.resourceRow}>
                  <span className={styles.resourceIcon}>{RESOURCE_EMOJIS[key]}</span>
                  <span className={styles.resourceName}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                  <span className={styles.resourceAmount}>
                    {'+'}
                    {formatNumber(earned[key as keyof Resources])}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className={styles.noResources}>No resources were produced (no active buildings).</p>
        )}

        <button className={styles.okButton} onClick={onDismiss}>
          {'✔ Collect & Continue'}
        </button>
      </div>
    </div>
  );
}
