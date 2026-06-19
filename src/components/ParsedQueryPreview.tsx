import type { ParsedPrompt, RankRequest } from '../types/api';
import { toRankRequest } from '../services/promptParser';
import { getRankEndpoint } from '../config/runtimeConfig';
import styles from './ParsedQueryPreview.module.css';

interface ParsedQueryPreviewProps {
  parsed: ParsedPrompt;
}

export function ParsedQueryPreview({ parsed }: ParsedQueryPreviewProps) {
  if (!parsed.specialty && !parsed.place) return null;

  const payload: RankRequest = toRankRequest(parsed);

  return (
    <div className={styles.preview} role="status" aria-live="polite">
      <span className={styles.label}>API request</span>
      <p className={styles.endpoint}>
        <span className={styles.method}>POST</span>
        <code className={styles.url}>{getRankEndpoint()}</code>
      </p>
      <dl className={styles.fields}>
        <div className={styles.field}>
          <dt>specialty</dt>
          <dd>{payload.specialty}</dd>
        </div>
        <div className={styles.field}>
          <dt>place</dt>
          <dd className={styles.mono}>{payload.place}</dd>
        </div>
        <div className={styles.field}>
          <dt>place_type</dt>
          <dd className={styles.mono}>{payload.place_type}</dd>
        </div>
      </dl>
    </div>
  );
}
