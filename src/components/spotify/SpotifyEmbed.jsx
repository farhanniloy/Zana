import styles from "./spotifyEmbed.module.css";
import { resolveSpotifyUrl } from "./spotifyUrl";

export default function SpotifyEmbed({ url, title = "Listen on Spotify", compact = false, showOpenLink = true }) {
    const spotify = resolveSpotifyUrl(url);

    if (!spotify) {
        return (
            <div className={styles.empty}>
                <p>Choose a record for the listening room by setting <code>NEXT_PUBLIC_SPOTIFY_FEATURED_URL</code>.</p>
                <p>Your regular browsing and writing remain available without Spotify.</p>
            </div>
        );
    }

    return (
        <div className={`${styles.embedCard} ${compact ? styles.compact : ""}`}>
            <div className={styles.frame}>
                <iframe
                    className={styles.iframe}
                    src={`https://open.spotify.com/embed/${spotify.type}/${spotify.id}?utm_source=generator&theme=0`}
                    title={title}
                    loading="lazy"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                />
            </div>
            {showOpenLink && (
                <a className={styles.openLink} href={spotify.openUrl} target="_blank" rel="noopener noreferrer">
                    Open in Spotify <span aria-hidden="true">↗</span>
                </a>
            )}
        </div>
    );
}
