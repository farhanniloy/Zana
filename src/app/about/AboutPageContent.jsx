"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./aboutPage.module.css";

const fields = [
    ["profileImage", "Portrait image URL (public HTTPS URL)"],
    ["location", "Portrait caption"],
    ["kicker", "Intro label"],
    ["firstName", "First name"],
    ["lastName", "Last name"],
    ["lede", "Short introduction"],
    ["bioOne", "About paragraph 1"],
    ["bioTwo", "About paragraph 2"],
    ["email", "Email address"],
    ["phone", "Phone number"],
    ["github", "GitHub URL"],
    ["linkedin", "LinkedIn URL"],
    ["x", "X URL"],
    ["facebook", "Facebook URL"],
];

export default function AboutPageContent({ content, isAdmin }) {
    const router = useRouter();
    const [draft, setDraft] = useState(content);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const updateField = (field, value) => {
        setDraft((current) => ({ ...current, [field]: value }));
    };

    const save = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            const response = await fetch("/api/admin/about", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(draft),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Could not save About page.");
            setDraft(result.content);
            setEditing(false);
            router.refresh();
        } catch (saveError) {
            console.error("Failed to save About page", saveError);
            setError(saveError.message || "Could not save About page.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className={styles.container}>
            {isAdmin && (
                <div className={styles.adminActions}>
                    <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => {
                            setError("");
                            setEditing((current) => !current);
                        }}
                    >
                        {editing ? "Close editor" : "Edit About page"}
                    </button>
                </div>
            )}
            {editing && isAdmin ? (
                <form className={styles.editor} onSubmit={save}>
                    <h1>Edit About page</h1>
                    {fields.map(([field, label]) => (
                        <label className={styles.editorField} key={field}>
                            <span>{label}</span>
                            {["bioOne", "bioTwo"].includes(field) ? (
                                <textarea
                                    value={draft[field]}
                                    onChange={(event) => updateField(field, event.target.value)}
                                    rows={4}
                                    required
                                />
                            ) : (
                                <input
                                    type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                                    value={draft[field]}
                                    onChange={(event) => updateField(field, event.target.value)}
                                    required={["firstName", "lastName", "email"].includes(field)}
                                    placeholder={field === "profileImage" ? "https://example.com/portrait.jpg" : undefined}
                                />
                            )}
                        </label>
                    ))}
                    {error && <p className={styles.editorError} role="alert">{error}</p>}
                    <div className={styles.editorActions}>
                        <button type="submit" className={styles.editButton} disabled={saving}>
                            {saving ? "Saving..." : "Save changes"}
                        </button>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={() => {
                                setDraft(content);
                                setEditing(false);
                                setError("");
                            }}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <div className={styles.portrait}>
                        <Image
                            src={content.profileImage || "/farhan.jpeg"}
                            alt={`Portrait of ${content.firstName} ${content.lastName}`}
                            fill
                            sizes="(max-width: 760px) 100vw, 42vw"
                            unoptimized={content.profileImage?.startsWith("https://")}
                        />
                        <span>{content.location}</span>
                    </div>
                    <article className={styles.copy}>
                        <span className={styles.kicker}>{content.kicker}</span>
                        <h1>{content.firstName}<br /><em>{content.lastName}</em></h1>
                        <p className={styles.lede}>{content.lede}</p>
                        <p>{content.bioOne}</p>
                        <p>{content.bioTwo}</p>
                        <div className={styles.details}>
                            <a href={`mailto:${content.email}`}>{content.email}</a>
                            {content.phone && (
                                <a href={`tel:${content.phone.replace(/[^\d+]/g, "")}`}>{content.phone}</a>
                            )}
                        </div>
                        <nav className={styles.social} aria-label="Social profiles">
                            {[
                                ["GitHub", content.github],
                                ["LinkedIn", content.linkedin],
                                ["X", content.x],
                                ["Facebook", content.facebook],
                            ].filter(([, href]) => href).map(([label, href]) => (
                                <a href={href} key={label} target="_blank" rel="noopener noreferrer">{label}</a>
                            ))}
                        </nav>
                        <Link href="/contact" className={styles.contact}>
                            Write a note <span aria-hidden="true">→</span>
                        </Link>
                    </article>
                </>
            )}
        </main>
    );
}
