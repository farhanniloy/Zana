"use client";

import { useState } from "react";
import Image from "next/image";

const FALLBACK_ARTWORK = "/images/music 3.jpg";
const FALLBACK_ALT = "A vintage turntable, records, and headphones in warm lamplight";

export default function PlaylistArtwork({ artwork, title, sizes }) {
    const [failedArtwork, setFailedArtwork] = useState(null);
    const useFallback = !artwork || failedArtwork === artwork;

    return (
        <Image
            src={useFallback ? FALLBACK_ARTWORK : artwork}
            alt={useFallback ? FALLBACK_ALT : `Cover artwork for ${title}`}
            fill
            sizes={sizes}
            unoptimized={!useFallback}
            onError={() => {
                if (!useFallback) {
                    console.warn("Spotify playlist artwork failed to load; using fallback artwork.", {
                        playlist: title,
                    });
                    setFailedArtwork(artwork);
                }
            }}
        />
    );
}
