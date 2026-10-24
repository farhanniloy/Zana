
export const dynamic = "force-dynamic";

import React from "react";
import styles from "./cardList.module.css";
import Pagination from "../pagination/Pagination";
import Card from "../card/Card";
import prisma from "@/utils/connect";

const getData = async (page, cat, search) => {
    try {
        const POST_PER_PAGE = 10;
        const filters = [];
        if (cat) {
            filters.push({
                OR: [
                    { catSlug: cat },
                    { categories: { some: { categorySlug: cat } } },
                ],
            });
        }
        if (search) {
            filters.push({
                OR: [
                    { title: { contains: search } },
                    { summary: { contains: search } },
                ],
            });
        }
        const query = {
            take: POST_PER_PAGE,
            skip: POST_PER_PAGE * (page - 1),
            where: {
                approved: true,
                ...(filters.length ? { AND: filters } : {}),
            },
            orderBy: { createdAt: "desc" },
        };

        const [posts, count] = await prisma.$transaction([
            prisma.post.findMany({
                ...query,
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    summary: true,
                    desc: true,
                    img: true,
                    catSlug: true,
                    createdAt: true,
                    categories: {
                        select: {
                            categorySlug: true,
                            category: { select: { title: true } },
                        },
                    },
                },
            }),
            prisma.post.count({ where: query.where }),
        ]);

        return { posts, count };
    } catch (err) {
        console.error('Error fetching posts', err);
        return { posts: [], count: 0 };
    }
};

const CardList = async ({ page, cat, search, paginationPrefix = "", formAction = "/blog" }) => {
    const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
    const { posts = [], count = 0 } = await getData(safePage, cat, search?.trim());

    const POST_PER_PAGE = 10;
    const totalPages = Math.max(1, Math.ceil(count / POST_PER_PAGE));

    const hasPrev = POST_PER_PAGE * (safePage - 1) > 0;
    const hasNext = POST_PER_PAGE * (safePage - 1) + POST_PER_PAGE < count;

    return (
        <div className={styles.container}>
            <form className={styles.search} action={formAction} method="get">
                {cat && <input type="hidden" name="cat" value={cat} />}
                <label htmlFor="writing-search">Search the collection</label>
                <div className={styles.searchControls}>
                    <input id="writing-search" name="q" type="search" defaultValue={search || ""} placeholder="A title or idea…" />
                    <button type="submit">Search</button>
                </div>
            </form>
            <div className={styles.posts}>
                {(posts || []).map((item) => (
                    <Card item={item} key={item.id ?? item._id ?? item.slug} />
                ))}
            </div>
            {posts.length === 0 && (
                <p className={styles.empty}>No writings match this shelf yet. Try another search or browse the full archive.</p>
            )}
            {totalPages > 1 && (
                <Pagination page={safePage} totalPages={totalPages} hasPrev={hasPrev} hasNext={hasNext} hrefPrefix={paginationPrefix} />
            )}
        </div>
    );
};

export default CardList;