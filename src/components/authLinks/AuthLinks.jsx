"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import styles from "./authLinks.module.css";

export default function AuthLinks() {
    const { data: session, status } = useSession();
    const role = session?.user?.role;
    const username = session?.user?.username || session?.user?.name;
    const usernameSlug = username?.startsWith("@") ? username.slice(1) : username;

    if (status === "loading") return null;

    if (status !== "authenticated") {
        return <Link href="/login" className={styles.link}>Sign in</Link>;
    }

    return (
        <div className={styles.links}>
            <Link href="/write" className={styles.link}>Write</Link>
            {(role === "ADMIN" || role === "MODERATOR") && (
                <Link href="/admin/moderation" className={styles.link}>Moderation</Link>
            )}
            {role === "ADMIN" && <Link href="/admin/users" className={styles.link}>Users</Link>}
            {usernameSlug && (
                <Link href={`/u/${encodeURIComponent(usernameSlug)}`} className={styles.link}>Profile</Link>
            )}
            <button className={styles.logout} type="button" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
            </button>
        </div>
    );
}
