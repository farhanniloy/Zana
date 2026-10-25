import styles from "./copyright.module.css"

const Copyright = () => {
    return(
        <a
            className={styles.copyright}
            href="https://nilll.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Designed and developed by @nil. Visit the author's website."
        >
            <span className={styles.text}>
                Designed &amp; developed by <strong>@nil</strong>
            </span>
        </a>
    )
}

export default Copyright