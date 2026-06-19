import styles from './StatusMessage.module.css';

interface StatusMessageProps {
  type: 'error' | 'empty' | 'loading';
  message: string;
}

export function StatusMessage({ type, message }: StatusMessageProps) {
  return (
    <div
      className={styles.message}
      data-type={type}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      {type === 'loading' && <span className={styles.shimmer} aria-hidden="true" />}
      <p>{message}</p>
    </div>
  );
}
