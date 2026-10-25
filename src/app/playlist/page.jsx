import Image from "next/image";
import { SiSpotify } from "react-icons/si";
import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import SpotifyEmbed from "@/components/spotify/SpotifyEmbed";
import { getSpotifyPlaylistConfig } from "@/utils/spotifyConfig";
import { resolveSpotifyUrl } from "@/components/spotify/spotifyUrl";
import PlaylistAdminEditor from "./PlaylistAdminEditor";
import styles from "../libraryPages.module.css";

export const dynamic = "force-dynamic";
export const metadata = {
    title: "Playlist",
    description: "A listening room for the music that keeps company with the writing.",
    alternates: { canonical: "/playlist" },
};

const getPlaylistArtwork = async (url) => {
    const spotify = resolveSpotifyUrl(url);
    if (!spotify || spotify.type !== "playlist") return null;

    try {
        const response = await fetch(
            `https://open.spotify.com/oembed?url=${encodeURIComponent(spotify.openUrl)}`,
            { next: { revalidate: 86400 }, signal: AbortSignal.timeout(5000) },
        );
        if (!response.ok) {
            console.warn("Spotify playlist artwork request failed", {
                playlistId: spotify.id,
                status: response.status,
            });
            return null;
        }

        const metadata = await response.json();
        if (typeof metadata.thumbnail_url !== "string") return null;

        const artwork = new URL(metadata.thumbnail_url);
        if (
            artwork.protocol !== "https:" ||
            !["image-cdn-ak.spotifycdn.com", "i.scdn.co", "mosaic.scdn.co"].includes(artwork.hostname)
        ) {
            console.warn("Spotify returned an untrusted playlist artwork URL", {
                playlistId: spotify.id,
            });
            return null;
        }

        return artwork.toString();
    } catch (error) {
        console.warn("Could not retrieve Spotify playlist artwork", {
            playlistId: spotify.id,
            error,
        });
        return null;
    }
};

export default async function PlaylistPage() {
    const [savedPlaylists, session] = await Promise.all([
        prisma.pageContent.findUnique({ where: { slug: "playlists" }, select: { content: true } }),
        getAuthSession(),
    ]);
    const settings = getSpotifyPlaylistConfig(savedPlaylists?.content);
    const user = session?.user?.email
        ? await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true },
        })
        : null;
    const isAdmin = user?.role === "ADMIN";
    const playlistsWithArtwork = await Promise.all(settings.playlists.map(async (playlist) => ({
        ...playlist,
        artwork: await getPlaylistArtwork(playlist.url),
    })));

    return (
        <main className={`${styles.page} ${styles.playlistPage}`}>
            <h1 className={styles.visuallyHidden}>The listening room</h1>
            {isAdmin && <PlaylistAdminEditor settings={settings} />}
            {settings.playlists.length > 0 ? (
                <div className={styles.playlists}>
                    {playlistsWithArtwork.map((playlist) => {
                        const spotify = resolveSpotifyUrl(playlist.url);
                        const isDefault = playlist.id === settings.defaultId;
                        return (
                            <section className={styles.playlist} key={playlist.id}>
                                <div className={styles.playlistArtworkColumn}>
                                    <div className={styles.playlistCover}>
                                        <Image
                                            src={playlist.artwork || "/images/music 3.jpg"}
                                            alt={playlist.artwork ? `Cover artwork for ${playlist.title}` : "A vintage turntable, records, and headphones in warm lamplight"}
                                            fill
                                            sizes="(max-width: 760px) 100vw, 330px"
                                            unoptimized={Boolean(playlist.artwork)}
                                        />
                                        <span className={styles.playlistCoverGrain} aria-hidden="true" />
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
                                    <span className={styles.kicker}>
                                        {isDefault ? "DEFAULT PLAYLIST · HOMEPAGE PLAYER" : "A PLAYLIST · SPOTIFY INTEGRATION"}
                                    </span>
                                    <h2>{playlist.title}</h2>
                                    <p className={styles.playlistDescription}>{playlist.description}</p>
                                    <div className={styles.playlistWaveform} role="img" aria-label="Decorative waveform">
                                        <SiSpotify aria-hidden="true" />
                                        {[9, 15, 22, 13, 19, 26, 11, 21, 14, 24, 12, 18, 25, 10, 17, 22, 13, 8].map((height, bar) => (
                                            <span key={bar} style={{ height }} aria-hidden="true" />
                                        ))}
                                    </div>
                                    <div className={styles.playlistPlayer}>
                                        <SpotifyEmbed
                                            url={playlist.url}
                                            title={`Spotify playlist player: ${playlist.title}`}
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
                    <p>No playlists have been added yet. No Spotify API credentials or playback claims are needed: Spotify supplies the actual player.</p>
                </div>
            )}
        </main>
    );
}
