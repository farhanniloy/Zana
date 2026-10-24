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
