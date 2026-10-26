import Image from "next/image";
import { randomInt } from "node:crypto";
import Link from "next/link";
import { ClosingNote } from "@/components/footer/Footer";
import prisma from "@/utils/connect";
import Featured from "@/components/featured/Featured";
import WritingCard from "@/components/writing/WritingCard";
import SpotifyCompactPlayer from "@/components/spotify/SpotifyCompactPlayer";
import { getSpotifyPlaylistConfig } from "@/utils/spotifyConfig";
import { defaultAboutContent } from "@/utils/aboutContent";
import { getSafePostImageUrl } from "@/utils/imageUrl";
import { getSpotifyPlaylistTracks } from "@/utils/spotifyPlaylistTracks";
import styles from "./homeEditorial.module.css";

const getWriting = () =>
    prisma.post.findMany({
        where: {
            approved: true,
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
    const [writings, notebook, savedAbout, savedPlaylists] = await Promise.all([
        getWriting(),
        getNotebook(),
        prisma.pageContent.findUnique({ where: { slug: "about" }, select: { content: true } }),
        prisma.pageContent.findUnique({ where: { slug: "playlists" }, select: { content: true } }),
    ]);
    const aboutContent = savedAbout
        ? { ...defaultAboutContent, ...JSON.parse(savedAbout.content) }
        : defaultAboutContent;
    const aboutImage = getSafePostImageUrl(aboutContent.profileImage) || defaultAboutContent.profileImage;
    const aboutName = [aboutContent.firstName, aboutContent.lastName].filter(Boolean).join(" ");
    const aboutSummary = aboutContent.bioOne.length > 180
        ? `${aboutContent.bioOne.slice(0, 180).trimEnd()}…`
        : aboutContent.bioOne;
    const playlistSettings = getSpotifyPlaylistConfig(savedPlaylists?.content);
    const defaultPlaylist = playlistSettings.playlists.find(
        (playlist) => playlist.id === playlistSettings.defaultId,
    ) || playlistSettings.playlists[0];
    const playlistTracks = await getSpotifyPlaylistTracks(defaultPlaylist.url);
    const selectedTrack = playlistTracks.length
        ? playlistTracks[randomInt(playlistTracks.length)]
        : null;

    return (
        <main className={styles.home}>
            <Featured />

            <section className={styles.listening} aria-labelledby="listening-title">
                <span className={styles.listeningGrain} aria-hidden="true" />
                <SpotifyCompactPlayer
                    url={selectedTrack?.uri || defaultPlaylist.url}
                    title={`Default Spotify playlist: ${defaultPlaylist.title}`}
                    tracks={playlistTracks}
                    metadata={selectedTrack
                        ? {
                            id: selectedTrack.id,
                            title: selectedTrack.title,
                            artist: `From ${defaultPlaylist.title}`,
                            artworkUrl: selectedTrack.artworkUrl,
                        }
                        : {
                            title: defaultPlaylist.title,
                            artist: "Selected listening-room playlist",
                        }}
                />
            </section>

            <section className={styles.section} aria-labelledby="writings-title">
                <div className={styles.sectionHeading}>
                    <div>
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
                        <Image src="/images/notebook 1.jpg" alt="A collection of handwritten journal pages and sketches" fill sizes="(max-width: 1024px) 35vw, 25vw" />
                    </div>
                    <div className={styles.notebookImage}>
                        <Image src="/images/notebook 3.jpg" alt="A handwritten story on aged paper beside an ink bottle" fill sizes="(max-width: 1024px) 35vw, 25vw" />
                    </div>
                    <div className={styles.notebookImage}>
                        <Image src="/images/notebook 6.jpg" alt="A coffee cup beside handwritten journal pages" fill sizes="(max-width: 1024px) 35vw, 25vw" />
                    </div>
                </div>
                <div className={styles.notebookRoom}>
                    <Image src="/images/hero image 2.jpg" alt="A warmly lit reading room filled with books" fill sizes="(max-width: 760px) 45vw, 40vw" />
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
                        src={aboutImage}
                        alt={`Portrait of ${aboutName}`}
                        fill
                        sizes="(max-width: 760px) 40vw, (max-width: 1200px) 32vw, 400px"
                        unoptimized={aboutImage.startsWith("https://")}
                    />
                </div>
                <div className={styles.aboutCopy}>
                    <span className={styles.sectionIndex}><span aria-hidden="true">+</span> ABOUT</span>
                    <h2 id="about-title">{aboutContent.lede}</h2>
                    <p>{aboutSummary}</p>
                    <Link href="/about" className={styles.textLink}>More about me <span aria-hidden="true">→</span></Link>
                </div>
            </section>
            <ClosingNote />
        </main>
    );
}
