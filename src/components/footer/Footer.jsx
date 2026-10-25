import Link from "next/link";
import styles from "./footer.module.css";

export function ClosingNote() {
    return (
        <blockquote className={styles.closingNote}>
            <span className={styles.quoteMark} aria-hidden="true">“</span>
            <div className={styles.quoteCopy}>
                <p>But how could you live and have no story to tell?</p>
                <cite>— Fyodor Dostoevsky</cite>
            </div>
        </blockquote>
    );
}

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.signature}>
                <span className={styles.signatureMark} aria-hidden="true">✦</span>
                <Link href="/" className={styles.logo}>Zana</Link>
                <span className={styles.signatureCaption}>A personal journal</span>
            </div>
            <nav className={styles.footerLinks} aria-label="Footer navigation">
                <Link href="/blog">Writings</Link>
                <Link href="/notebook">Notebook</Link>
                <Link href="/playlist">Playlist</Link>
                <Link href="/about">About</Link>
                <Link href="/archive">Archive</Link>
            </nav>
        </footer>
    );
}
