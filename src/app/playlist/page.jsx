import SpotifyEmbed from "@/components/spotify/SpotifyEmbed";
import styles from "../libraryPages.module.css";

const playlistUrls = (process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_URLS || process.env.NEXT_PUBLIC_SPOTIFY_FEATURED_URL || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

const playlistTitles = (process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_TITLES || "")
    .split(",")
    .map((title) => title.trim());

export const metadata = {
    title: "Playlist",
    description: "A listening room for the music that keeps company with the writing.",
    alternates: { canonical: "/playlist" },
};

export default function PlaylistPage() {
    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <span className={styles.kicker}>The listening room</span>
                <h1>Playlist</h1>
                <p>Records for late hours, slow mornings, and the pages in between.</p>
            </header>
            {playlistUrls.length > 0 ? (
                <div className={styles.playlists}>
                    {playlistUrls.map((url, index) => (
                        <section className={styles.playlist} key={`${url}-${index}`}>
                            <h2>{playlistTitles[index] || (index === 0 ? "On the turntable" : `Listening note ${index + 1}`)}</h2>
                            <SpotifyEmbed url={url} title={`Spotify player: ${playlistTitles[index] || "Listening room"}`} />
                        </section>
                    ))}
                </div>
            ) : (
                <div className={styles.setup}>
                    <h2>The shelf is ready for a record.</h2>
                    <p>Add Spotify links in <code>NEXT_PUBLIC_SPOTIFY_FEATURED_URL</code> or a comma-separated list in <code>NEXT_PUBLIC_SPOTIFY_PLAYLIST_URLS</code>.</p>
                    <p>Optionally set matching comma-separated labels with <code>NEXT_PUBLIC_SPOTIFY_PLAYLIST_TITLES</code>. No Spotify API credentials or playback claims are needed: Spotify supplies the actual player.</p>
                </div>
            )}
        </main>
    );
}
