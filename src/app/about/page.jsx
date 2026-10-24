import Image from "next/image";
import Link from "next/link";
import styles from "./aboutPage.module.css";

export const metadata = {
    title: "About",
    description: "Learn about Farhan Niloy, the writer behind this personal journal.",
    alternates: { canonical: "/about" },
};

const links = [
    { label: "GitHub", href: "https://github.com/niloy-farhan" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/niloy-farhan-6067b422b/" },
    { label: "X", href: "https://twitter.com/MrFarhanNiloy" },
    { label: "Facebook", href: "https://facebook.com/nulll.me" },
];

export default function AboutPage() {
    return (
        <main className={styles.container}>
            <div className={styles.portrait}>
                <Image src="/farhan.jpeg" alt="Portrait of Farhan Niloy" fill sizes="(max-width: 760px) 100vw, 42vw" />
                <span>Dhaka, Bangladesh</span>
            </div>
            <article className={styles.copy}>
                <span className={styles.kicker}>A note from the author</span>
                <h1>Farhan<br /><em>Niloy</em></h1>
                <p className={styles.lede}>Writer. Dreamer. Observer.</p>
                <p>
                    I work where artificial intelligence meets security research. My focus is
                    operating-system-level vulnerability research, red-team operations, and
                    penetration testing. I enjoy going beneath the interface, tracing how systems
                    really behave, and turning broken assumptions into stronger defenses and useful tools.
                </p>
                <p>
                    This journal is a quieter place for philosophy, science, technology, and curious
                    ideas—the things I notice, question, and want to remember.
                </p>
                <div className={styles.details}>
                    <a href="mailto:areyouokaynil@gmail.com">areyouokaynil@gmail.com</a>
                    <a href="tel:+8801794102371">+880 1794102371</a>
                </div>
                <nav className={styles.social} aria-label="Social profiles">
                    {links.map(({ label, href }) => (
                        <a href={href} key={label} target="_blank" rel="noopener noreferrer">{label}</a>
                    ))}
                </nav>
                <Link href="/contact" className={styles.contact}>Write a note <span aria-hidden="true">→</span></Link>
            </article>
        </main>
    );
}
