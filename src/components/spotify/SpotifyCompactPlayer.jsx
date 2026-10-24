"use client";

import Image from "next/image";
import Link from "next/link";
import { SiSpotify } from "react-icons/si";
import { useEffect, useRef, useState } from "react";
import styles from "./spotifyEmbed.module.css";
import { resolveSpotifyUrl } from "./spotifyUrl";

let iframeApiPromise;

function loadSpotifyIframeApi() {
    if (window.SpotifyIframeApi) return Promise.resolve(window.SpotifyIframeApi);
    if (iframeApiPromise) return iframeApiPromise;

    iframeApiPromise = new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => {
            iframeApiPromise = null;
            reject(new Error("Spotify's embedded player controls did not become ready."));
        }, 10000);

        window.onSpotifyIframeApiReady = (api) => {
            window.clearTimeout(timeout);
            window.SpotifyIframeApi = api;
            resolve(api);
        };

        const script = document.createElement("script");
        script.src = "https://open.spotify.com/embed/iframe-api/v1";
        script.async = true;
        script.onerror = () => {
            window.clearTimeout(timeout);
            iframeApiPromise = null;
            reject(new Error("Spotify's embedded player controls could not be loaded."));
        };
        document.head.appendChild(script);
    });

    return iframeApiPromise;
}

function PlayIcon({ paused }) {
    return paused ? (
        <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M5 3.5 13 8l-8 4.5z" />
        </svg>
    ) : (
        <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 3h3v10H4zm5 0h3v10H9z" />
        </svg>
    );
}

export default function SpotifyCompactPlayer({ url, title = "Listen on Spotify", metadata }) {
    const spotify = resolveSpotifyUrl(url);
    const spotifyOpenUrl = spotify?.openUrl;
    const playerRef = useRef(null);
    const controllerRef = useRef(null);
    const [api, setApi] = useState(null);
    const [controllerReady, setControllerReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [apiError, setApiError] = useState(false);

    useEffect(() => {
        let active = true;
        loadSpotifyIframeApi()
            .then((loadedApi) => {
                if (active) setApi(loadedApi);
            })
            .catch(() => {
                if (active) setApiError(true);
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!api || !spotifyOpenUrl || !playerRef.current) return undefined;

        let active = true;
        let controller;

        try {
            api.createController(
                playerRef.current,
                {
                    url: `${spotifyOpenUrl}?utm_source=generator&theme=0`,
                    width: "1",
                    height: "1",
                },
                (createdController) => {
                    if (!active) {
                        createdController.destroy();
                        return;
                    }

                    controller = createdController;
                    controllerRef.current = createdController;
                    createdController.addListener("playback_started", () => setIsPlaying(true));
                    createdController.addListener("playback_update", (event) => {
                        setIsPlaying(!event.data.isPaused);
                    });
                    setControllerReady(true);
                },
            );
        } catch {
            setApiError(true);
        }

        return () => {
            active = false;
            controller?.destroy();
            controllerRef.current = null;
            setControllerReady(false);
        };
    }, [api, spotifyOpenUrl]);

    function togglePlayback() {
        try {
            controllerRef.current?.togglePlay();
        } catch {
            setApiError(true);
            setControllerReady(false);
        }
    }

    function restartPlayback() {
        try {
            controllerRef.current?.restart();
        } catch {
            setApiError(true);
            setControllerReady(false);
        }
    }

    if (!spotify) {
        return (
            <div className={styles.empty}>
                <p>Choose a record for the listening room by setting <code>NEXT_PUBLIC_SPOTIFY_FEATURED_URL</code>.</p>
                <p>Your regular browsing and writing remain available without Spotify.</p>
            </div>
        );
    }

    const trackName = metadata?.title || title;
    const artistName = [metadata?.artist, metadata?.version].filter(Boolean).join(" · ") || "Spotify track";
    const artworkUrl = metadata?.artworkUrl || "/images/music 2.jpg";
    const embedUrl = `https://open.spotify.com/embed/${spotify.type}/${spotify.id}?utm_source=generator&theme=0`;

    return (
        <div className={styles.listeningPlayer}>
            <span className={styles.nowPlaying}>
                <span aria-hidden="true">◆</span>
                <Link href="/playlist">{isPlaying ? "NOW PLAYING · OPEN LISTENING ROOM ↗" : "THE LISTENING ROOM · VIEW PLAYLIST ↗"}</Link>
            </span>
            <div className={styles.trackRow}>
                <Link className={styles.trackArtwork} href="/playlist" aria-label="Open the listening room playlist">
                    <Image
                        src={artworkUrl}
                        alt={metadata?.artworkUrl
                            ? `Album artwork for ${trackName} by ${artistName}`
                            : "A vintage record player in warm lamplight"}
                        fill
                        sizes="(max-width: 600px) 56px, 58px"
                        unoptimized={Boolean(metadata?.artworkUrl)}
                    />
                </Link>
                <div className={styles.trackDetails}>
                    <h2 id="listening-title"><Link href="/playlist">{trackName}</Link></h2>
                    <p>{artistName}</p>
                    <div className={styles.trackControls}>
                        <button
                            type="button"
                            className={styles.transportButton}
                            onClick={restartPlayback}
                            disabled={!controllerReady}
                            aria-label="Restart featured Spotify track"
                            title="Restart track"
                        >
                            <svg viewBox="0 0 16 16" aria-hidden="true">
                                <path d="M4.3 5.2A4.5 4.5 0 1 1 3.5 9M4 2.8v2.8H1.2" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            className={`${styles.transportButton} ${styles.mainTransport}`}
                            onClick={togglePlayback}
                            disabled={!controllerReady}
                            aria-label={isPlaying ? "Pause featured Spotify track" : "Play featured Spotify track"}
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            <PlayIcon paused={!isPlaying} />
                        </button>
                    </div>
                </div>
                <div className={styles.spotifyBrand}>
                    <a href={spotify.openUrl} target="_blank" rel="noopener noreferrer">
                        <span>Open on Spotify</span>
                        <SiSpotify aria-hidden="true" />
                    </a>
                    <span className={styles.brandWave} role="img" aria-label="Decorative Spotify waveform">
                        <SiSpotify aria-hidden="true" />
                        {[7, 12, 5, 16, 9, 14, 6, 12, 8, 15, 5, 10, 6, 12, 4, 9].map((height, index) => (
                            <span key={index} style={{ height }} aria-hidden="true" />
                        ))}
                    </span>
                </div>
            </div>
            {api && !apiError && (
                <div className={styles.apiHost} aria-hidden="true">
                    <div ref={playerRef} />
                </div>
            )}
            {apiError && (
                <>
                    <div className={styles.fallbackFrame}>
                        <iframe
                            src={embedUrl}
                            title={title}
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            referrerPolicy="strict-origin-when-cross-origin"
                        />
                    </div>
                    <p className={styles.controlError} role="status">
                        Spotify&apos;s custom controls are unavailable. Use the Spotify player above.
                    </p>
                </>
            )}
        </div>
    );
}
