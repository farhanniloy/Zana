export const dynamic = "force-dynamic";

import CardList from "@/components/cardList/CardList";
import styles from "./blogPage.module.css";

export const metadata = {
    title: "Blog",
    description: "Explore the latest posts on philosophy, technology, security, science, and curious ideas.",
    alternates: { canonical: "/blog" },
};

const BlogPage = async ({ searchParams }) => {
    const params = await searchParams;
    const page = parseInt(params?.page, 10) || 1;
    const cat = typeof params?.cat === "string" ? params.cat : "";
    const search = typeof params?.q === "string" ? params.q : "";
    const title = cat ? `${cat.replace(/-/g, " ")} writings` : "The writings";
    const query = new URLSearchParams();
    if (cat) query.set("cat", cat);
    if (search) query.set("q", search);
    const paginationPrefix = `/blog${query.size ? `?${query.toString()}` : ""}`;

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <span className={styles.kicker}>The writing desk</span>
                <h1>{title}</h1>
                <p>Essays, ideas, and little paths of thought gathered in one place.</p>
            </header>
            <CardList
                page={page}
                cat={cat || undefined}
                search={search}
                paginationPrefix={paginationPrefix}
            />
        </main>
    );
};

export default BlogPage;