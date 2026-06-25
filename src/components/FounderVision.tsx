import styles from './FounderVision.module.css';

export function FounderVision() {
    return (
        <section className={styles.vision} aria-labelledby="founder-vision-heading">
            <div className={styles.card}>
                <div className={styles.media} role="img" aria-label="Founder vision illustration">
                    <div className={styles.photoPlaceholder}>
                        <span>Founder&apos;s Photo</span>
                    </div>
                </div>
                <div className={styles.body}>
                    <h2 id="founder-vision-heading" className={styles.heading}>
                        Founder&apos;s vision
                    </h2>
                    <p className={styles.copy}>
                        Meridian exists to make specialist discovery simple, transparent, and trustworthy.
                        Our mission is to help people find the right physician near them by surfacing
                        experience, medical school reputation, and local availability in a single place.
                    </p>
                    <p className={styles.copy}>
                        We built this platform so patients can feel confident searching for care without
                        having to sift through overwhelming listings or unclear ratings.
                    </p>
                </div>
            </div>
        </section>
    );
}
