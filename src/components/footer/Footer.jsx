import Link from "next/link";
import styles from "./footer.module.css";

const socialLinks = [
    { label: "GitHub", href: "https://github.com/niloy-farhan" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/niloy-farhan-6067b422b/" },
    { label: "X", href: "https://twitter.com/MrFarhanNiloy" },
    { label: "Facebook", href: "https://facebook.com/nulll.me" },
];

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.signature}>
                <Link href="/" className={styles.logo}>nil.</Link>
                <p>Pages, thoughts, and small things worth keeping.</p>
            </div>
            <nav className={styles.footerLinks} aria-label="Footer navigation">
                <Link href="/blog">Writings</Link>
                <Link href="/notebook">Notebook</Link>
                <Link href="/playlist">Playlist</Link>
                <Link href="/about">About</Link>
                <Link href="/archive">Archive</Link>
            </nav>
            <div className={styles.socialLinks} aria-label="Social profiles">
                {socialLinks.map(({ label, href }) => (
                    <a href={href} key={label} target="_blank" rel="noopener noreferrer">{label}</a>
                ))}
            </div>
        </footer>
    );
}
