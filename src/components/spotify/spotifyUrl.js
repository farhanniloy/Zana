export function resolveSpotifyUrl(value) {
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

export function isSpotifyArtworkUrl(value) {
    if (typeof value !== "string") return false;

    try {
        const url = new URL(value);
        const hostname = url.hostname.toLowerCase();
        const isSpotifyCdn = /^image-cdn-[a-z0-9-]+\.spotifycdn\.com$/.test(hostname);
        const isScdn = ["i.scdn.co", "mosaic.scdn.co"].includes(hostname);

        return url.protocol === "https:" && !url.username && !url.password && (isSpotifyCdn || isScdn);
    } catch {
        return false;
    }
}
