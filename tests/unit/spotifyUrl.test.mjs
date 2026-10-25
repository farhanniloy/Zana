import test from "node:test";
import assert from "node:assert/strict";
import { resolveSpotifyUrl } from "../../src/components/spotify/spotifyUrl.js";

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
