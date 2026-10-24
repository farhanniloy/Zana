import styles from "./spotifyEmbed.module.css";

function resolveSpotifyUrl(value) {
    if (typeof value !== "string" || !value.trim()) return null;

    const input = value.trim();
    const uriMatch = input.match(/^spotify:(track|album|playlist|artist|episode|show):([A-Za-z0-9]+)$/);
    if (uriMatch) {
        return {
            type: uriMatch[1],
            id: uriMatch[2],
            openUrl: `https://open.spotify.com/${uriMatch[1]}/${uriMatch[2]}`,
        };
    }

    try {
        const url = new URL(input);
        if (url.protocol !== "https:" || !["open.spotify.com", "www.open.spotify.com"].includes(url.hostname)) {
            return null;
        }

        const [, type, id] = url.pathname.match(/^\/(?:embed\/)?(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]+)/) || [];
        if (!type || !id) return null;

        return {
            type,
            id,
            openUrl: `https://open.spotify.com/${type}/${id}`,
        };
    } catch {
        return null;
    }
}

export default function SpotifyEmbed({ url, title = "Listen on Spotify", compact = false }) {
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
            <iframe
                className={styles.iframe}
                src={`https://open.spotify.com/embed/${spotify.type}/${spotify.id}?utm_source=generator&theme=0`}
                title={title}
                loading="lazy"
                allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
            />
            <a className={styles.openLink} href={spotify.openUrl} target="_blank" rel="noopener noreferrer">
                Open in Spotify <span aria-hidden="true">↗</span>
            </a>
        </div>
    );
}
