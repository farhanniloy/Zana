import styles from "./copyright.module.css"
import {FaCopyright} from "react-icons/fa6";
import {FaGithub} from "react-icons/fa";

const Copyright = () => {
    return(
        <a
            className={styles.copyright}
            href="https://nilll.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="All rights reserved by @nil. View source."
        >
            <span className={styles.text}>
                <FaCopyright aria-hidden="true" /> All rights reserved by <strong>@nil</strong>
                <span> | </span>
                <span><FaGithub aria-hidden="true" /> source</span>
            </span>
        </a>
    )
}

export default Copyright