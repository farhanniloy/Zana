import Image from "next/image";
import Link from "next/link";
import styles from "./featured.module.css";

export default function Featured() {
    return (
        <section className={styles.hero} aria-labelledby="home-title">
            <Image
                className={styles.heroImage}
                src="/images/Zana%20Hero%20Image.jpg"
                alt=""
                fill
                priority
                sizes="(max-width: 640px) 100vw, 1100px"
            />
            <span className={styles.grain} aria-hidden="true" />
            <div className={styles.heroText}>
                <span className={styles.welcome}>hiya!!,</span>
                <h1 id="home-title">I&apos;m Zana</h1>
                <p>
                    Welcome to my small world of words, where stories, thoughts and imagination come together. I live between the pages of old stories, music, the smell of coffee and the chaotic world of my creativity.
                </p>
                <Link className={styles.cta} href="/blog">Dive into my thoughts <span aria-hidden="true">→</span></Link>
            </div>
            <span className={styles.heroNote}>A quiet corner for curious minds</span>
        </section>
    );
}
