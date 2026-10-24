import Image from "next/image";
import Link from "next/link";
import prisma from "@/utils/connect";
import Featured from "@/components/featured/Featured";
import WritingCard from "@/components/writing/WritingCard";
import SpotifyEmbed from "@/components/spotify/SpotifyEmbed";
import styles from "./homeEditorial.module.css";

const featuredPlaylist = process.env.NEXT_PUBLIC_SPOTIFY_FEATURED_URL || "";

const getWriting = () =>
    prisma.post.findMany({
        where: {
            approved: true,
            NOT: [
                { catSlug: "notebook" },
                { categories: { some: { categorySlug: "notebook" } } },
            ],
        },
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
            categories: {
                include: { category: { select: { title: true } } },
            },
        },
    });

const getNotebook = () =>
    prisma.post.findMany({
        where: {
            approved: true,
            OR: [
                { catSlug: "notebook" },
                { categories: { some: { categorySlug: "notebook" } } },
            ],
        },
        take: 3,
        orderBy: { createdAt: "desc" },
        select: { id: true, slug: true, title: true, summary: true, desc: true, createdAt: true },
    });

const formatDate = (date) =>
    new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));

export default async function HomeEditorial() {
    const [writings, notebook] = await Promise.all([getWriting(), getNotebook()]);
    const [featured, ...recentWritings] = writings;

    return (
        <main className={styles.home}>
            <Featured />

            <section className={styles.listening} aria-labelledby="listening-title">
                <div className={styles.listeningIntro}>
                    <span className={styles.sectionIndex}>01 / THE LISTENING ROOM</span>
                    <h2 id="listening-title">Now playing</h2>
                    <p>A little music for the pages that take their time.</p>
                    <Link href="/playlist" className={styles.textLink}>Visit the playlist shelf <span aria-hidden="true">→</span></Link>
                </div>
                <div className={styles.player}>
                    <SpotifyEmbed url={featuredPlaylist} title="Featured Spotify listening room" compact />
                </div>
            </section>

            <section className={styles.section} aria-labelledby="writings-title">
                <div className={styles.sectionHeading}>
                    <div>
                        <span className={styles.sectionIndex}>02 / THE WRITING DESK</span>
                        <h2 id="writings-title">Writings</h2>
                    </div>
                    <Link href="/blog" className={styles.textLink}>All writings <span aria-hidden="true">→</span></Link>
                </div>
                {featured ? (
                    <>
                        <WritingCard post={featured} variant="feature" />
                        {recentWritings.length > 0 && (
                            <div className={styles.writingGrid}>
                                {recentWritings.map((post) => <WritingCard post={post} key={post.id} />)}
                            </div>
                        )}
                    </>
                ) : (
                    <p className={styles.emptyState}>The desk is quiet for now. New writing will find its place here.</p>
                )}
            </section>

            <section className={styles.notebook} aria-labelledby="notebook-title">
                <div className={styles.notebookArt}>
                    <Image
                        src="/reading-room.svg"
                        alt="An illustrated lamplit reading room with an open notebook"
                        fill
                        sizes="(max-width: 760px) 100vw, 50vw"
                    />
                </div>
                <div className={styles.notebookCopy}>
                    <span className={styles.sectionIndex}>03 / LOOSE PAGES</span>
                    <h2 id="notebook-title">The notebook</h2>
                    <p className={styles.notebookIntro}>Small observations, unfinished thoughts, and things worth keeping close.</p>
                    {notebook.length > 0 ? (
                        <ul className={styles.noteList}>
                            {notebook.map((note) => (
                                <li key={note.id}>
                                    <Link href={`/posts/${encodeURIComponent(note.slug)}`}>{note.title}</Link>
                                    <time dateTime={new Date(note.createdAt).toISOString()}>{formatDate(note.createdAt)}</time>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.emptyState}>No notebook pages yet.</p>
                    )}
                    <Link href="/notebook" className={styles.textLink}>Browse the notebook <span aria-hidden="true">→</span></Link>
                </div>
            </section>

            <section className={styles.about} aria-labelledby="about-title">
                <div className={styles.portrait}>
                    <Image
                        src="/farhan.jpeg"
                        alt="Portrait of Farhan Niloy"
                        fill
                        sizes="(max-width: 640px) 100vw, 300px"
                    />
                </div>
                <div className={styles.aboutCopy}>
                    <span className={styles.sectionIndex}>04 / A NOTE ABOUT THE AUTHOR</span>
                    <h2 id="about-title">Writer. Dreamer. Observer.</h2>
                    <p>
                        I work where artificial intelligence meets security research, and keep this
                        space for the ideas, questions, and small discoveries that gather along the way.
                    </p>
                    <Link href="/about" className={styles.textLink}>A little more about me <span aria-hidden="true">→</span></Link>
                </div>
            </section>
        </main>
    );
}
