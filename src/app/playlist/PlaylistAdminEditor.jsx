"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../libraryPages.module.css";

const createPlaylist = () => ({
    id: crypto.randomUUID(),
    title: "",
    description: "",
    url: "",
});

export default function PlaylistAdminEditor({ settings }) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [playlists, setPlaylists] = useState(settings.playlists);
    const [defaultId, setDefaultId] = useState(settings.defaultId);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const updatePlaylist = (id, field, value) => {
        setPlaylists((current) => current.map((playlist) =>
            playlist.id === id ? { ...playlist, [field]: value } : playlist
        ));
    };

    const addPlaylist = () => {
        const playlist = createPlaylist();
        setPlaylists((current) => [...current, playlist]);
        if (playlists.length === 0) setDefaultId(playlist.id);
    };

    const removePlaylist = (id) => {
        const remaining = playlists.filter((playlist) => playlist.id !== id);
        setPlaylists(remaining);
        if (defaultId === id && remaining.length) setDefaultId(remaining[0].id);
    };

    const save = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            const response = await fetch("/api/admin/playlists", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ playlists, defaultId }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Could not save playlists.");
            setPlaylists(result.playlists);
            setDefaultId(result.defaultId);
            setEditing(false);
            router.refresh();
        } catch (saveError) {
            console.error("Failed to save playlists", saveError);
            setError(saveError.message || "Could not save playlists.");
        } finally {
            setSaving(false);
        }
    };

    if (!editing) {
        return (
            <div className={styles.playlistAdminActions}>
                <button
                    type="button"
                    className={styles.playlistAdminButton}
                    onClick={() => {
                        setPlaylists(settings.playlists);
                        setDefaultId(settings.defaultId);
                        setError("");
                        setEditing(true);
                    }}
                >
                    Edit playlists
                </button>
            </div>
        );
    }

    return (
        <form className={styles.playlistEditor} onSubmit={save}>
            <div className={styles.playlistEditorHeading}>
                <div>
                    <span className={styles.kicker}>ADMIN PLAYLIST SETTINGS</span>
                    <h2>Manage the listening room</h2>
                    <p>Choose one default playlist for the homepage player.</p>
                </div>
                <button type="button" className={styles.playlistAdminButton} onClick={() => setEditing(false)}>
                    Close editor
                </button>
            </div>
            {playlists.map((playlist, index) => (
                <fieldset className={styles.playlistEditorItem} key={playlist.id}>
                    <legend>Playlist {index + 1}</legend>
                    <label>
                        <span>Title</span>
                        <input
                            type="text"
                            value={playlist.title}
                            onChange={(event) => updatePlaylist(playlist.id, "title", event.target.value)}
                            maxLength={120}
                            required
                        />
                    </label>
                    <label>
                        <span>Spotify playlist URL</span>
                        <input
                            type="url"
                            value={playlist.url}
                            onChange={(event) => updatePlaylist(playlist.id, "url", event.target.value)}
                            placeholder="https://open.spotify.com/playlist/..."
                            required
                        />
                    </label>
                    <label>
                        <span>Description</span>
                        <textarea
                            value={playlist.description}
                            onChange={(event) => updatePlaylist(playlist.id, "description", event.target.value)}
                            maxLength={500}
                            rows={2}
                        />
                    </label>
                    <div className={styles.playlistEditorItemActions}>
                        <label className={styles.defaultPlaylistChoice}>
                            <input
                                type="radio"
                                name="default-playlist"
                                value={playlist.id}
                                checked={defaultId === playlist.id}
                                onChange={() => setDefaultId(playlist.id)}
                            />
                            <span>Use as homepage default</span>
                        </label>
                        <button
                            type="button"
                            className={styles.playlistRemoveButton}
                            onClick={() => removePlaylist(playlist.id)}
                            disabled={playlists.length === 1}
                        >
                            Remove
                        </button>
                    </div>
                </fieldset>
            ))}
            <div className={styles.playlistEditorFooter}>
                <button type="button" className={styles.playlistAdminButton} onClick={addPlaylist}>
                    Add playlist
                </button>
                {error && <p className={styles.playlistEditorError} role="alert">{error}</p>}
                <div className={styles.playlistEditorActions}>
                    <button type="submit" className={styles.playlistAdminButton} disabled={saving}>
                        {saving ? "Saving..." : "Save playlists"}
                    </button>
                    <button
                        type="button"
                        className={styles.playlistCancelButton}
                        onClick={() => setEditing(false)}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </form>
    );
}
