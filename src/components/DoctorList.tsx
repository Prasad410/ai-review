import type { Doctor, SearchMeta } from '../types/api';
import { DoctorCard } from './DoctorCard';
import { ReviewForm } from './ReviewForm';
import styles from './DoctorList.module.css';

interface DoctorListProps {
  doctors: Doctor[];
  meta: SearchMeta;
}

export function DoctorList({ doctors, meta }: DoctorListProps) {
  return (
    <section className={styles.section} aria-labelledby="results-heading">
      <header className={styles.header}>
        <h2 id="results-heading" className={styles.heading}>
          {meta.totalResults} specialists found
        </h2>
        <p className={styles.meta}>
          Ranked by medical school prestige and years of experience
        </p>
      </header>

      <ol className={styles.list}>
        {doctors.map((doctor, index) => (
          <li key={doctor.id}>
            <DoctorCard doctor={doctor} rank={index + 1} index={index} />
          </li>
        ))}
      </ol>

      <ReviewForm />
    </section>
  );
}
