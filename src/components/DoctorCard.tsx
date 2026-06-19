import type { Doctor } from '../types/api';
import styles from './DoctorCard.module.css';

interface DoctorCardProps {
  doctor: Doctor;
  rank: number;
  index: number;
}

function getRibbonTier(rank: number): 'gold' | 'silver' | 'standard' {
  if (rank === 1) return 'gold';
  if (rank <= 3) return 'silver';
  return 'standard';
}

export function DoctorCard({ doctor, rank, index }: DoctorCardProps) {
  const ribbonTier = getRibbonTier(rank);

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${index * 80}ms` }}
      aria-label={`${doctor.name}, rank ${rank}`}
    >
      <div className={styles.ribbon} data-tier={ribbonTier}>
        <span className={styles.rankNumber}>{rank}</span>
        <span className={styles.rankLabel}>
          {rank === 1 ? 'Top match' : `Rank ${rank}`}
        </span>
      </div>

      <div className={styles.body}>
        <header className={styles.header}>
          <h3 className={styles.name}>{doctor.name}</h3>
          <p className={styles.specialty}>{doctor.specialty}</p>
        </header>

        <dl className={styles.credentials}>
          <div className={styles.credential}>
            <dt>Medical school</dt>
            <dd>{doctor.university}</dd>
            <span className={styles.rankBadge}>#{doctor.universityRank} nationally</span>
          </div>
          <div className={styles.credential}>
            <dt>Experience</dt>
            <dd>
              <span className={styles.experienceYears}>{doctor.yearsOfExperience}</span>
              <span className={styles.experienceUnit}>years</span>
            </dd>
          </div>
        </dl>

        <footer className={styles.footer}>
          <span className={styles.location}>
            {doctor.city}, {doctor.state}
            {doctor.zipCode !== '00000' && (
              <span className={styles.zip}> · {doctor.zipCode}</span>
            )}
          </span>
          <span className={styles.rating} aria-label={`Rating ${doctor.rating} out of 5`}>
            <span className={styles.ratingValue}>{doctor.rating.toFixed(1)}</span>
            <span className={styles.ratingMax}>/5</span>
          </span>
        </footer>
      </div>
    </article>
  );
}
