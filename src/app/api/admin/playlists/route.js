import { NextResponse } from "next/server";
import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { ensureCsrf } from "@/utils/csrf";

function normalizePlaylistUrl(value) {
    if (typeof value !== "string") return null;
    const input = value.trim();
    const uriMatch = input.match(/^spotify:playlist:([A-Za-z0-9]+)$/);
    if (uriMatch) return `https://open.spotify.com/playlist/${uriMatch[1]}`;

    try {
        const url = new URL(input);
        if (
            url.protocol !== "https:" ||
            !["open.spotify.com", "www.open.spotify.com"].includes(url.hostname) ||
            url.username ||
            url.password
        ) {
            return null;
        }
        const [, id] = url.pathname.match(/^\/(?:embed\/)?playlist\/([A-Za-z0-9]+)/) || [];
        return id ? `https://open.spotify.com/playlist/${id}` : null;
    } catch {
        return null;
    }
}

export async function PUT(request) {
    const csrfError = ensureCsrf(request);
    if (csrfError) return csrfError;

    const session = await getAuthSession();
    if (!session?.user?.email) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true },
    });
    if (user?.role !== "ADMIN") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        if (!body || !Array.isArray(body.playlists) || body.playlists.length === 0) {
            return NextResponse.json({ message: "Add at least one playlist" }, { status: 400 });
        }

        const ids = new Set();
        const playlists = [];
        for (const [index, item] of body.playlists.entries()) {
            if (
                !item ||
                typeof item.id !== "string" ||
                !item.id.trim() ||
                item.id.length > 100 ||
                ids.has(item.id) ||
                typeof item.title !== "string" ||
                !item.title.trim() ||
                item.title.trim().length > 120 ||
                typeof item.description !== "string" ||
                item.description.length > 500
            ) {
                return NextResponse.json({ message: `Check playlist ${index + 1}: title and unique ID are required` }, { status: 400 });
            }

            const url = normalizePlaylistUrl(item.url);
            if (!url) {
                return NextResponse.json({ message: `Playlist ${index + 1} needs a valid Spotify playlist URL` }, { status: 400 });
            }

            ids.add(item.id);
            playlists.push({
                id: item.id,
                title: item.title.trim(),
                description: item.description.trim(),
                url,
            });
        }

        if (typeof body.defaultId !== "string" || !ids.has(body.defaultId)) {
            return NextResponse.json({ message: "Choose a default playlist" }, { status: 400 });
        }

        const content = { playlists, defaultId: body.defaultId };
        await prisma.pageContent.upsert({
            where: { slug: "playlists" },
            update: { content: JSON.stringify(content) },
            create: { slug: "playlists", content: JSON.stringify(content) },
        });

        return NextResponse.json(content);
    } catch (error) {
        console.error("Failed to update playlists", error);
        return NextResponse.json({ message: "Failed to update playlists" }, { status: 500 });
    }
}
