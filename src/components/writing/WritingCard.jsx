import Image from "next/image";
import Link from "next/link";
import styles from "./writingCard.module.css";

const formatDate = (date) =>
    new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(date));

export function getReadingTime(html = "") {
    const words = html
        .replace(/<[^>]*>/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 220));
}

export default function WritingCard({ post, variant = "standard" }) {
    const excerpt = post.summary || post.desc.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const categories = post.categories?.map((item) => item.category?.title || item.categorySlug) || [];

    return (
        <article className={`${styles.card} ${styles[variant] || ""}`}>
            <Link className={styles.cover} href={`/posts/${encodeURIComponent(post.slug)}`} tabIndex={-1} aria-hidden="true">
                <Image
                    src={post.img || "/images/hero image 2.jpg"}
                    alt=""
                    fill
                    sizes={variant === "feature" ? "(max-width: 760px) 100vw, 55vw" : "(max-width: 760px) 100vw, 33vw"}
                    className={styles.image}
                />
            </Link>
            <div className={styles.copy}>
                <div className={styles.meta}>
                    <time dateTime={new Date(post.createdAt).toISOString()}>{formatDate(post.createdAt)}</time>
                    <span aria-hidden="true">·</span>
                    <span>{getReadingTime(post.desc)} min read</span>
                </div>
                <h3 className={styles.title}>
                    <Link href={`/posts/${encodeURIComponent(post.slug)}`}>{post.title}</Link>
                </h3>
                <p className={styles.excerpt}>{excerpt}</p>
                {categories.length > 0 && (
                    <div className={styles.tags} aria-label="Categories">
                        {categories.slice(0, 2).map((category, index) => (
                            <Link
                                href={`/category/${encodeURIComponent(post.categories[index].categorySlug)}`}
                                key={`${post.id}-${category}`}
                            >
                                {category}
                            </Link>
                        ))}
                    </div>
                )}
                <Link className={styles.readLink} href={`/posts/${encodeURIComponent(post.slug)}`}>
                    Read the essay <span aria-hidden="true">→</span>
                </Link>
            </div>
        </article>
    );
}
