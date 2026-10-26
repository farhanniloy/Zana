import styles from "./loading.module.css";

export default function Loading() {
    return (
        <main className={styles.container} aria-busy="true" aria-label="Loading page">
            <span className={styles.kicker}>A quiet moment</span>
            <div className={styles.title} />
            <div className={styles.line} />
            <div className={styles.lineShort} />
        </main>
    );
}
