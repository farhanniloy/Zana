import test from "node:test";
import assert from "node:assert/strict";
import { isSpotifyArtworkUrl, resolveSpotifyUrl } from "../../src/components/spotify/spotifyUrl.js";

test("resolves Spotify track links and URIs", () => {
    assert.deepEqual(
        resolveSpotifyUrl("spotify:track:abc123"),
        {
            type: "track",
            id: "abc123",
            openUrl: "https://open.spotify.com/track/abc123",
        },
    );
    assert.deepEqual(
        resolveSpotifyUrl("https://open.spotify.com/embed/playlist/xyz789?si=share"),
        {
            type: "playlist",
            id: "xyz789",
            openUrl: "https://open.spotify.com/playlist/xyz789",
        },
    );
});

test("rejects malformed and untrusted Spotify links", () => {
    assert.equal(resolveSpotifyUrl("https://example.com/track/abc123"), null);
    assert.equal(resolveSpotifyUrl("http://open.spotify.com/track/abc123"), null);
    assert.equal(resolveSpotifyUrl("spotify:unknown:abc123"), null);
    assert.equal(resolveSpotifyUrl(""), null);
});

test("accepts Spotify artwork CDN hosts used by different playlists", () => {
    for (const host of [
        "image-cdn-ak.spotifycdn.com",
        "image-cdn-fa.spotifycdn.com",
        "i.scdn.co",
        "mosaic.scdn.co",
    ]) {
        assert.equal(isSpotifyArtworkUrl(`https://${host}/image/cover`), true);
    }
});

test("rejects insecure and non-Spotify artwork URLs", () => {
    assert.equal(isSpotifyArtworkUrl("http://image-cdn-fa.spotifycdn.com/image/cover"), false);
    assert.equal(isSpotifyArtworkUrl("https://spotifycdn.com.evil.test/image/cover"), false);
    assert.equal(isSpotifyArtworkUrl("https://example.com/image/cover"), false);
});
