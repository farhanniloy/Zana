"use client";

import Image from "next/image";
import Link from "next/link";
import { SiSpotify } from "react-icons/si";
import { useCallback, useEffect, useRef, useState } from "react";
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

export default function SpotifyCompactPlayer({ url, title = "Listen on Spotify", metadata, tracks = [] }) {
    const spotify = resolveSpotifyUrl(url);
    const spotifyOpenUrl = spotify?.openUrl;
    const playerRef = useRef(null);
    const controllerRef = useRef(null);
    const pendingTrackIdRef = useRef(null);
    const currentTrackIdRef = useRef(metadata?.id);
    const autoAdvanceTrackIdRef = useRef(null);
    const playbackProgressRef = useRef({ trackId: null, position: 0, duration: 0 });
    const isPlayingRef = useRef(false);
    const manualPauseRef = useRef(false);
    const [api, setApi] = useState(null);
    const [controllerReady, setControllerReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [apiError, setApiError] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(metadata);
    const [currentTrackId, setCurrentTrackId] = useState(metadata?.id);

    const playTrack = useCallback((track) => {
        try {
            const controller = controllerRef.current;
            if (!controller) return;
            pendingTrackIdRef.current = track.id;
            controller.loadUri(track.uri);
            controller.togglePlay();
            currentTrackIdRef.current = track.id;
            manualPauseRef.current = false;
            setCurrentTrackId(track.id);
            setCurrentTrack({
                id: track.id,
                title: track.title,
                artist: metadata?.artist,
                artworkUrl: track.artworkUrl,
            });
        } catch {
            setApiError(true);
            setControllerReady(false);
        }
    }, [metadata]);

    const playNextTrack = useCallback(() => {
        if (tracks.length < 2) return;

        const currentIndex = tracks.findIndex((track) => track.id === currentTrackIdRef.current);
        playTrack(tracks[(currentIndex + 1) % tracks.length]);
    }, [playTrack, tracks]);

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
                    const updateCurrentTrack = (playingURI) => {
                        const track = tracks.find((item) => item.uri === playingURI);
                        if (track) {
                            currentTrackIdRef.current = track.id;
                            setCurrentTrackId(track.id);
                            setCurrentTrack({
                                id: track.id,
                                title: track.title,
                                artist: metadata?.artist,
                                artworkUrl: track.artworkUrl,
                            });
                        }
                    };
                    createdController.addListener("playback_started", (event) => {
                        const startedTrack = tracks.find((item) => item.uri === event.data.playingURI);
                        if (startedTrack && playbackProgressRef.current.trackId !== startedTrack.id) {
                            playbackProgressRef.current = {
                                trackId: startedTrack.id,
                                position: 0,
                                duration: 0,
                            };
                            autoAdvanceTrackIdRef.current = null;
                        }
                        isPlayingRef.current = true;
                        setIsPlaying(true);
                        updateCurrentTrack(event.data.playingURI);
                        if (startedTrack?.id === pendingTrackIdRef.current) {
                            pendingTrackIdRef.current = null;
                        }
                    });
                    createdController.addListener("playback_update", (event) => {
                        const { duration, isPaused, playingURI, position } = event.data;
                        const loadedTrack = tracks.find((item) => item.uri === playingURI);
                        const progress = playbackProgressRef.current;
                        if (loadedTrack && progress.trackId !== loadedTrack.id) {
                            playbackProgressRef.current = {
                                trackId: loadedTrack.id,
                                position: 0,
                                duration: 0,
                            };
                            autoAdvanceTrackIdRef.current = null;
                        }
                        const trackProgress = playbackProgressRef.current;
                        trackProgress.duration = duration || trackProgress.duration;
                        trackProgress.position = Math.max(trackProgress.position, position || 0);

                        const wasPlaying = isPlayingRef.current;
                        isPlayingRef.current = !isPaused;
                        setIsPlaying(!event.data.isPaused);
                        updateCurrentTrack(playingURI);
                        if (loadedTrack?.id === pendingTrackIdRef.current && event.data.isPaused) {
                            pendingTrackIdRef.current = null;
                            createdController.togglePlay();
                        }
                        const reachedTrackEnd = trackProgress.duration > 0
                            && trackProgress.position >= trackProgress.duration - 2000;
                        const endedNaturally = !manualPauseRef.current
                            && reachedTrackEnd
                            && (!isPaused || wasPlaying);
                        if (
                            endedNaturally
                            && tracks.length > 1
                            && loadedTrack?.id === currentTrackIdRef.current
                            && autoAdvanceTrackIdRef.current !== loadedTrack.id
                        ) {
                            autoAdvanceTrackIdRef.current = loadedTrack.id;
                            playNextTrack();
                        }
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
    }, [api, metadata?.artist, playNextTrack, playTrack, spotifyOpenUrl, tracks]);

    function togglePlayback() {
        try {
            manualPauseRef.current = isPlayingRef.current;
            controllerRef.current?.togglePlay();
        } catch {
            setApiError(true);
            setControllerReady(false);
        }
    }

    function playPreviousTrack() {
        if (!controllerReady || tracks.length < 2) return;

        const currentIndex = tracks.findIndex((track) => track.id === currentTrackIdRef.current);
        const previousIndex = currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1;
        playTrack(tracks[previousIndex]);
    }

    if (!spotify) {
        return (
            <div className={styles.empty}>
                <p>Choose a Spotify playlist in the listening room settings.</p>
                <p>Your regular browsing and writing remain available without Spotify.</p>
            </div>
        );
    }

    const trackName = currentTrack?.title || title;
    const isPlaylist = spotify.type === "playlist";
    const artistName = [currentTrack?.artist, currentTrack?.version].filter(Boolean).join(" · ") ||
        (isPlaylist ? "Spotify playlist" : "Spotify track");
    const artworkUrl = currentTrack?.artworkUrl || "/images/music 2.jpg";
    const embedUrl = `https://open.spotify.com/embed/${spotify.type}/${spotify.id}?utm_source=generator&theme=0`;

    return (
        <div className={styles.listeningPlayer}>
            <span className={styles.nowPlaying}>
                <span aria-hidden="true">◆</span>
                {isPlaying ? `NOW PLAYING · ${trackName}` : "THE LISTENING ROOM"}
            </span>
            <div className={styles.trackRow}>
                <div className={styles.trackArtwork}>
                    <Image
                        src={artworkUrl}
                        alt={currentTrack?.artworkUrl
                            ? `Album artwork for ${trackName} by ${artistName}`
                            : "A vintage record player in warm lamplight"}
                        fill
                        sizes="(max-width: 600px) 56px, 58px"
                        unoptimized={Boolean(metadata?.artworkUrl)}
                    />
                </div>
                <div className={styles.trackDetails}>
                    <h2 id="listening-title">{trackName}</h2>
                    <p>{artistName}</p>
                    <div className={styles.trackControls}>
                        <button
                            type="button"
                            className={styles.transportButton}
                            onClick={playPreviousTrack}
                            disabled={!controllerReady}
                            aria-label="Play previous song in the default Spotify playlist"
                            title="Previous track"
                        >
                            <svg viewBox="0 0 16 16" aria-hidden="true">
                                <path d="M13 3.5v9L7 8zM6 3.5v9H4v-9z" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            className={`${styles.transportButton} ${styles.mainTransport}`}
                            onClick={togglePlayback}
                            disabled={!controllerReady}
                            aria-label={isPlaylist
                                ? isPlaying ? "Pause default Spotify playlist" : "Play default Spotify playlist"
                                : isPlaying ? "Pause featured Spotify track" : "Play featured Spotify track"}
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            <PlayIcon paused={!isPlaying} />
                        </button>
                        {tracks.length > 1 && (
                            <button
                                type="button"
                                className={styles.transportButton}
                                onClick={playNextTrack}
                                disabled={!controllerReady}
                                aria-label="Play next song in the default Spotify playlist"
                                title="Next track"
                            >
                                <svg viewBox="0 0 16 16" aria-hidden="true">
                                    <path d="M3 3.5v9l6-4.5zM10 3.5v9h2v-9z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                <div className={styles.spotifyBrand}>
                    <Link href="/playlist">
                        <span>Open the Playlist</span>
                        <SiSpotify aria-hidden="true" />
                    </Link>
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
