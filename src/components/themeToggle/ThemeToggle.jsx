"use client";

import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import styles from "./themeToggle.module.css";

export default function ThemeToggle() {
    const { toggle, theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    return (
        <button
            className={styles.container}
            type="button"
            role="switch"
            aria-checked={!isDark}
            aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
            onClick={toggle}
        >
            <span aria-hidden="true">{isDark ? "☾" : "☼"}</span>
        </button>
    );
}
