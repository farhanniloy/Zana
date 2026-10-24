export const dynamic = "force-dynamic";

import CardList from "@/components/cardList/CardList";
import styles from "../blog/blogPage.module.css";

export const metadata = {
    title: "Notebook",
    description: "Short thoughts, collected notes, and loose pages from the journal.",
    alternates: { canonical: "/notebook" },
};

export default async function NotebookPage({ searchParams }) {
    const params = await searchParams;
    const page = Number.parseInt(params?.page, 10) || 1;
    const search = typeof params?.q === "string" ? params.q : "";
    const paginationPrefix = `/notebook?cat=notebook${search ? `&q=${encodeURIComponent(search)}` : ""}`;

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <span className={styles.kicker}>Loose pages & marginalia</span>
                <h1>The notebook</h1>
                <p>Short observations, reading notes, and unfinished thoughts from the same post archive.</p>
            </header>
            <CardList
                page={page}
                cat="notebook"
                search={search}
                paginationPrefix={paginationPrefix}
                formAction="/notebook"
            />
        </main>
    );
}
