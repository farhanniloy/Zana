import Link from "next/link";
import styles from "../libraryPages.module.css";
import contactStyles from "./contactPage.module.css";

export const metadata = {
    title: "Contact",
    description: "Get in touch with Farhan Niloy.",
    alternates: { canonical: "/contact" },
};

export default function ContactPage() {
    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <span className={styles.kicker}>The correspondence desk</span>
                <h1>Contact</h1>
                <p>A question, a thought, or something worth discussing? The inbox is open.</p>
            </header>
            <section className={contactStyles.card} aria-labelledby="contact-heading">
                <h2 id="contact-heading">Send a note</h2>
                <p>The quickest way to reach me is by email. For a call, use the number below.</p>
                <a className={contactStyles.primary} href="mailto:areyouokaynil@gmail.com?subject=A%20note%20from%20your%20journal">
                    areyouokaynil@gmail.com <span aria-hidden="true">↗</span>
                </a>
                <a href="tel:+8801794102371">+880 1794102371</a>
                <Link href="/about">A little more about me <span aria-hidden="true">→</span></Link>
            </section>
        </main>
    );
}
