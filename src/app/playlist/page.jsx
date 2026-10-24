import Image from "next/image";
import { SiSpotify } from "react-icons/si";
import SpotifyEmbed from "@/components/spotify/SpotifyEmbed";
import { getSpotifyPlaylistUrls } from "@/utils/spotifyConfig";
import { resolveSpotifyUrl } from "@/components/spotify/spotifyUrl";
import styles from "../libraryPages.module.css";

const playlistUrls = getSpotifyPlaylistUrls();

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
        <main className={`${styles.page} ${styles.playlistPage}`}>
            <h1 className={styles.visuallyHidden}>The listening room</h1>
            {playlistUrls.length > 0 ? (
                <div className={styles.playlists}>
                    {playlistUrls.map((url, index) => {
                        const spotify = resolveSpotifyUrl(url);
                        const title = playlistTitles[index] || (index === 0 ? "Late Night Thoughts" : `Listening note ${index + 1}`);
                        return (
                            <section className={styles.playlist} key={`${url}-${index}`}>
                                <div className={styles.playlistArtworkColumn}>
                                    <div className={styles.playlistCover}>
                                        <Image
                                            src="/images/music 3.jpg"
                                            alt="A vintage turntable, records, and headphones in warm lamplight"
                                            fill
                                            sizes="(max-width: 760px) 100vw, 330px"
                                        />
                                    </div>
                                    {spotify && (
                                        <a
                                            className={styles.playlistSpotifyLink}
                                            href={spotify.openUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <SiSpotify aria-hidden="true" />
                                            Open on Spotify <span aria-hidden="true">↗</span>
                                        </a>
                                    )}
                                </div>
                                <div className={styles.playlistInfo}>
                                    <span className={styles.kicker}>A PLAYLIST · SPOTIFY INTEGRATION</span>
                                    <h2>{title}</h2>
                                    <p className={styles.playlistDescription}>“Songs for the quiet hours<br />and overthinking minds.”</p>
                                    <div className={styles.playlistWaveform} role="img" aria-label="Decorative waveform">
                                        <SiSpotify aria-hidden="true" />
                                        {[9, 15, 22, 13, 19, 26, 11, 21, 14, 24, 12, 18, 25, 10, 17, 22, 13, 8].map((height, bar) => (
                                            <span key={bar} style={{ height }} aria-hidden="true" />
                                        ))}
                                    </div>
                                    <div className={styles.playlistPlayer}>
                                        <SpotifyEmbed
                                            url={url}
                                            title={`Spotify playlist player: ${title}`}
                                            showOpenLink={false}
                                        />
                                    </div>
                                </div>
                            </section>
                        );
                    })}
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
