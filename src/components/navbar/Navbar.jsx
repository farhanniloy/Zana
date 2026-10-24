'use client';

import { useEffect, useState } from 'react';
import styles from "./navbar.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthLinks from "@/components/authLinks/AuthLinks";
import ThemeToggle from "@/components/themeToggle/ThemeToggle";

const navigation = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Writings" },
    { href: "/notebook", label: "Notebook" },
    { href: "/playlist", label: "Playlist" },
    { href: "/about", label: "About" },
    { href: "/archive", label: "Archive" },
];

const isCurrentPage = (pathname, href) => {
    if (href === "/blog") {
        return pathname === href || pathname.startsWith("/posts/") || pathname.startsWith("/category/");
    }
    return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
};

export default function Navbar() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!menuOpen) return;
        const closeOnEscape = (event) => {
            if (event.key === "Escape") setMenuOpen(false);
        };
        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [menuOpen]);

    return (
        <header className={styles.container}>
            <Link href="/" className={styles.logo} aria-label="Zana home">
                <span>Zana</span>
                <small>A personal journal</small>
            </Link>

            <div className={styles.right}>
                <nav className={styles.navLinks} aria-label="Main navigation">
                    {navigation.map(({ href, label }) => (
                        <Link
                            href={href}
                            key={href}
                            className={styles.links}
                            aria-current={isCurrentPage(pathname, href) ? "page" : undefined}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
                <div className={styles.authWrapper}><AuthLinks /></div>
                <ThemeToggle />
                <button
                    className={styles.menuButton}
                    type="button"
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={menuOpen}
                    aria-controls="site-mobile-menu"
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <span />
                    <span />
                </button>
            </div>

            <nav
                id="site-mobile-menu"
                className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}
                aria-label="Mobile navigation"
                aria-hidden={!menuOpen}
            >
                {navigation.map(({ href, label }) => (
                    <Link
                        href={href}
                        key={href}
                        className={styles.mobileLink}
                        aria-current={isCurrentPage(pathname, href) ? "page" : undefined}
                        tabIndex={menuOpen ? 0 : -1}
                    >
                        {label}
                    </Link>
                ))}
                <div className={styles.mobileAuth}><AuthLinks /></div>
            </nav>
        </header>
    );
}
