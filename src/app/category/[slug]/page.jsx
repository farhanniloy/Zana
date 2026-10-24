export const dynamic = "force-dynamic";

import CardList from "@/components/cardList/CardList";
import prisma from "@/utils/connect";
import styles from "../../blog/blogPage.module.css";

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const category = await prisma.category.findUnique({
        where: { slug },
        select: { title: true },
    });
    const title = category?.title || slug.replace(/-/g, " ");

    return {
        title: `${title} writings`,
        description: `Browse writings filed under ${title}.`,
        alternates: { canonical: `/category/${encodeURIComponent(slug)}` },
    };
}

export default async function CategoryPage({ params, searchParams }) {
    const { slug } = await params;
    const query = await searchParams;
    const page = Number.parseInt(query?.page, 10) || 1;
    const search = typeof query?.q === "string" ? query.q : "";
    const category = await prisma.category.findUnique({
        where: { slug },
        select: { title: true },
    });
    const title = category?.title || slug.replace(/-/g, " ");
    const paginationPrefix = `/category/${encodeURIComponent(slug)}${search ? `?q=${encodeURIComponent(search)}` : ""}`;

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <span className={styles.kicker}>A shelf in the library</span>
                <h1>{title}</h1>
                <p>Writings gathered around this subject.</p>
            </header>
            <CardList
                page={page}
                cat={slug}
                search={search}
                paginationPrefix={paginationPrefix}
                formAction={`/category/${encodeURIComponent(slug)}`}
            />
        </main>
    );
}
