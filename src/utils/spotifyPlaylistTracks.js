import { resolveSpotifyUrl } from "@/components/spotify/spotifyUrl";

const TRACK_ROW_PATTERN = /<[^>]*data-testid="track-row"[^>]*>/g;

function decodeHtml(value) {
    return value
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;|&#39;/g, "'");
}

export async function getSpotifyPlaylistTracks(playlistUrl) {
    const playlist = resolveSpotifyUrl(playlistUrl);
    if (!playlist || playlist.type !== "playlist") return [];

    try {
        const response = await fetch(`https://open.spotify.com/playlist/${playlist.id}`, {
            next: { revalidate: 86400 },
            signal: AbortSignal.timeout(7000),
        });
        if (!response.ok) {
            console.warn("Spotify playlist track request failed", {
                playlistId: playlist.id,
                status: response.status,
            });
            return [];
        }

        const html = await response.text();
        const rows = [...html.matchAll(TRACK_ROW_PATTERN)];
        const tracks = rows.flatMap((row, index) => {
            const tag = row[0];
            const id = tag.match(/aria-labelledby="[^"]*spotify:track:([A-Za-z0-9]+)/)?.[1];
            const title = tag.match(/aria-label="([^"]+)"/)?.[1];
            if (!id || !title) return [];

            const end = rows[index + 1]?.index ?? html.length;
            const rowHtml = html.slice(row.index, end);
            const artworkUrl = rowHtml.match(/<img[^>]+src="(https:\/\/i\.scdn\.co\/image\/[^"]+)"/)?.[1];

            return [{
                id,
                uri: `spotify:track:${id}`,
                title: decodeHtml(title),
                artworkUrl: artworkUrl || null,
            }];
        });

        const uniqueTracks = [...new Map(tracks.map((track) => [track.id, track])).values()];
        if (!uniqueTracks.length) {
            console.warn("Spotify playlist returned no readable track metadata", {
                playlistId: playlist.id,
            });
        }
        return uniqueTracks;
    } catch (error) {
        console.warn("Could not retrieve Spotify playlist tracks", {
            playlistId: playlist.id,
            error,
        });
        return [];
    }
}
