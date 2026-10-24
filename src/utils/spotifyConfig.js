export const DEFAULT_SPOTIFY_PLAYLIST_URL =
    "https://open.spotify.com/playlist/6YEvU4z160WOpkVhRpbcta?utm_source=generator&si=8e772e10ae1c477a";

export const DEFAULT_SPOTIFY_FEATURED_TRACK_URL =
    "https://open.spotify.com/track/6QAsrXPnMSXIbV0yEJHlEX";

export const DEFAULT_SPOTIFY_FEATURED_TRACK = {
    title: "Nothing Else Matters",
    artist: "Metallica",
    version: "Remastered 2021",
    artworkUrl: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02c1a13209dfe146aef3296e34",
};

function isSpotifyContentUrl(value, type) {
    return typeof value === "string" && (
        new RegExp(`^spotify:${type}:[A-Za-z0-9]+$`).test(value.trim()) ||
        new RegExp(`^https://(?:www\\.)?open\\.spotify\\.com/(?:embed/)?${type}/[A-Za-z0-9]+(?:[/?#]|$)`, "i").test(value.trim())
    );
}

export function getFeaturedSpotifyTrackUrl() {
    const trackOverride = process.env.NEXT_PUBLIC_SPOTIFY_FEATURED_TRACK_URL?.trim();
    if (trackOverride) return trackOverride;

    const legacyOverride = process.env.NEXT_PUBLIC_SPOTIFY_FEATURED_URL?.trim();
    return isSpotifyContentUrl(legacyOverride, "track")
        ? legacyOverride
        : DEFAULT_SPOTIFY_FEATURED_TRACK_URL;
}

export function getFeaturedSpotifyTrackMetadata(url) {
    if (url === DEFAULT_SPOTIFY_FEATURED_TRACK_URL) return DEFAULT_SPOTIFY_FEATURED_TRACK;

    return {
        title: process.env.NEXT_PUBLIC_SPOTIFY_FEATURED_TRACK_TITLE?.trim() || "A featured track",
        artist: process.env.NEXT_PUBLIC_SPOTIFY_FEATURED_TRACK_ARTIST?.trim() || "From the listening room",
        version: "",
    };
}

export function getSpotifyPlaylistUrls() {
    const playlistOverrides = process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_URLS
        ?.split(",")
        .map((url) => url.trim())
        .filter(Boolean);
    if (playlistOverrides?.length) return playlistOverrides;

    const legacyOverride = process.env.NEXT_PUBLIC_SPOTIFY_FEATURED_URL?.trim();
    return isSpotifyContentUrl(legacyOverride, "playlist")
        ? [legacyOverride]
        : [DEFAULT_SPOTIFY_PLAYLIST_URL];
}
