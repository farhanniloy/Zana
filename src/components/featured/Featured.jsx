import Image from "next/image";
import Link from "next/link";
import styles from "./featured.module.css";

export default function Featured() {
    return (
        <section className={styles.hero} aria-labelledby="home-title">
            <Image
                className={styles.heroImage}
                src="/images/hero image 34.jpg"
                alt=""
                fill
                priority
                sizes="(max-width: 640px) 100vw, 1100px"
            />
            <div className={styles.heroText}>
                <span className={styles.welcome}>welcome,</span>
                <h1 id="home-title">I write<br />things.</h1>
                <p>
                    A digital journal of thoughts, stories, and fragments.
                    Exploring the beauty of words and the warmth of forgotten places.
                </p>
                <Link className={styles.cta} href="/blog">Enter the library <span aria-hidden="true">→</span></Link>
            </div>
            <span className={styles.heroNote}>A quiet corner for curious minds</span>
        </section>
    );
}
