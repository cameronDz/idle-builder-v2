import { useEffect } from 'react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useBodyScrollLock();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-message"
        onClick={handleModalClick}
      >
        <p className={styles.message} id="confirm-dialog-message">{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
