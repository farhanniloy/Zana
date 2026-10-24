export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/utils/connect";
import styles from "../libraryPages.module.css";

export const metadata = {
    title: "Archive",
    description: "Browse the journal archive by year.",
    alternates: { canonical: "/archive" },
};

const formatDate = (date) =>
    new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(new Date(date));

export default async function ArchivePage() {
    const posts = await prisma.post.findMany({
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        select: { id: true, slug: true, title: true, createdAt: true, catSlug: true },
    });
    const years = new Map();

    for (const post of posts) {
        const year = new Date(post.createdAt).getFullYear();
        years.set(year, [...(years.get(year) || []), post]);
    }

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <span className={styles.kicker}>The index</span>
                <h1>Archive</h1>
                <p>Every published page, filed by the year it found its way here.</p>
            </header>
            {years.size ? (
                <div className={styles.archive}>
                    {[...years.entries()].map(([year, entries]) => (
                        <section className={styles.year} key={year} aria-labelledby={`year-${year}`}>
                            <h2 id={`year-${year}`}>{year}<span>{String(entries.length).padStart(2, "0")} entries</span></h2>
                            <ul>
                                {entries.map((post) => (
                                    <li key={post.id}>
                                        <time dateTime={new Date(post.createdAt).toISOString()}>{formatDate(post.createdAt)}</time>
                                        <Link href={`/posts/${encodeURIComponent(post.slug)}`}>{post.title}</Link>
                                        <Link className={styles.category} href={`/category/${encodeURIComponent(post.catSlug)}`}>{post.catSlug}</Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            ) : (
                <p className={styles.empty}>The archive is waiting for its first page.</p>
            )}
        </main>
    );
}
