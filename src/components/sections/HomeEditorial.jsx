import Image from "next/image";
import Link from "next/link";
import { ClosingNote } from "@/components/footer/Footer";
import prisma from "@/utils/connect";
import Featured from "@/components/featured/Featured";
import WritingCard from "@/components/writing/WritingCard";
import SpotifyCompactPlayer from "@/components/spotify/SpotifyCompactPlayer";
import {
    getFeaturedSpotifyTrackMetadata,
    getFeaturedSpotifyTrackUrl,
} from "@/utils/spotifyConfig";
import styles from "./homeEditorial.module.css";

const featuredTrack = getFeaturedSpotifyTrackUrl();
const featuredTrackMetadata = getFeaturedSpotifyTrackMetadata(featuredTrack);

const getWriting = () =>
    prisma.post.findMany({
        where: {
            approved: true,
            NOT: [
                { catSlug: "notebook" },
                { categories: { some: { categorySlug: "notebook" } } },
            ],
        },
        take: 6,
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

    return (
        <main className={styles.home}>
            <Featured />

            <section className={styles.listening} aria-labelledby="listening-title">
                <SpotifyCompactPlayer
                    url={featuredTrack}
                    title={`Featured Spotify track: ${featuredTrackMetadata.title}`}
                    metadata={featuredTrackMetadata}
                />
            </section>

            <section className={styles.section} aria-labelledby="writings-title">
                <div className={styles.sectionHeading}>
                    <div>
                        <span className={styles.sectionIndex}><span aria-hidden="true">+</span> WRITINGS</span>
                        <h2 id="writings-title">Writings</h2>
                    </div>
                    <Link href="/blog" className={styles.textLink}>All writings <span aria-hidden="true">→</span></Link>
                </div>
                {writings.length > 0 ? (
                    <div className={styles.writingGrid}>
                        {writings.map((post) => <WritingCard post={post} variant="home" key={post.id} />)}
                    </div>
                ) : (
                    <p className={styles.emptyState}>The desk is quiet for now. New writing will find its place here.</p>
                )}
            </section>

            <section className={styles.notebook} aria-labelledby="notebook-title">
                <div className={styles.notebookIntroBlock}>
                    <span className={styles.sectionIndex}><span aria-hidden="true">+</span> NOTEBOOK</span>
                    <h2 id="notebook-title">The notebook</h2>
                    <p className={styles.notebookIntro}>A collection of thoughts, quotes, and little reminders to stay soft.</p>
                </div>
                <div className={styles.notebookCollage} aria-label="Reading and writing photographs">
                    <div className={styles.notebookImage}>
                        <Image src="/images/notebook 1.jpg" alt="A collection of handwritten journal pages and sketches" fill sizes="(max-width: 760px) 50vw, 25vw" />
                    </div>
                    <div className={styles.notebookImage}>
                        <Image src="/images/notebook 4.jpg" alt="A bundle of handwritten letters tied with string" fill sizes="(max-width: 760px) 50vw, 25vw" />
                    </div>
                    <div className={styles.notebookImage}>
                        <Image src="/images/notebook 6.jpg" alt="A coffee cup beside handwritten journal pages" fill sizes="(max-width: 760px) 50vw, 25vw" />
                    </div>
                    <div className={styles.notebookImage}>
                        <Image src="/images/notebook 7.jpg" alt="An open handwritten journal on a dark wooden desk" fill sizes="(max-width: 760px) 50vw, 25vw" />
                    </div>
                </div>
                <div className={styles.notebookRoom}>
                    <Image src="/images/notebook 3.jpg" alt="A page from a handwritten notebook" fill sizes="(max-width: 760px) 100vw, 40vw" />
                </div>
                <div className={styles.notebookEntries}>
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
                        sizes="(max-width: 760px) 40vw, (max-width: 1200px) 32vw, 400px"
                    />
                </div>
                <div className={styles.aboutCopy}>
                    <span className={styles.sectionIndex}><span aria-hidden="true">+</span> ABOUT</span>
                    <h2 id="about-title">Writer. Dreamer. Observer.</h2>
                    <p>
                        I work where artificial intelligence meets security research, and keep this
                        space for the ideas, questions, and small discoveries that gather along the way.
                    </p>
                    <Link href="/about" className={styles.textLink}>More about me <span aria-hidden="true">→</span></Link>
                </div>
            </section>
            <ClosingNote />
        </main>
    );
}
