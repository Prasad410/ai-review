import type { ReactNode } from 'react';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <svg
            className={styles.logo}
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
            <path
              d="M16 8v16M10 14h12M10 18h12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className={styles.brandName}>Meridian</span>
        </div>
        <p className={styles.tagline}>Physician discovery</p>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <p>Rankings based on medical school prestige and clinical experience.</p>
      </footer>
    </div>
  );
}
