export const dynamic = "force-dynamic";

import styles from "./singlePage.module.css";
import { cache } from "react";
import { after } from "next/server";
import Image from "next/image";
import Link from 'next/link';
import Comments from "@/components/comments/Comments";

import prisma from "@/utils/connect";

import { getAuthSession } from '@/utils/auth';
import AdminPostControls from '@/components/admin/AdminPostControls';
import { sanitizePostHtml } from '@/utils/sanitizeHtml';

const getData = cache(async (slug) => {
    try {
        const post = await prisma.post.findUnique({
            where: { slug },
            include: {
                user: { select: { name: true, username: true, email: true, image: true } },
                categories: {
                    select: {
                        categorySlug: true,
                        category: { select: { title: true } },
                    },
                },
            },
        });
        return post;
    } catch (err) {
        console.error('Error fetching post', err);
        return null;
    }
});

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await getData(slug);

    if (!post || !post.approved) {
        return {
            title: 'Post not found',
            robots: { index: false, follow: false },
        };
    }

    const description = (post.summary || post.desc || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 160);

    return {
        title: post.title,
        description,
        alternates: { canonical: `/posts/${encodeURIComponent(post.slug)}` },
        openGraph: {
            type: 'article',
            title: post.title,
            description,
            publishedTime: post.createdAt.toISOString(),
            images: post.img ? [{ url: post.img, alt: post.title }] : undefined,
        },
        twitter: {
            card: post.img ? 'summary_large_image' : 'summary',
            title: post.title,
            description,
            images: post.img ? [post.img] : undefined,
        },
    };
}

const SinglePage = async ({ params }) => {
    const { slug } = await params;

    const [data, session] = await Promise.all([getData(slug), getAuthSession()]);
    // restrict viewing unapproved posts to owner or admin
    if (!data) {
        return (
            <div className={styles.container}>
                <div className={styles.infoContainer}>
                    <Link href="/" className={styles.top}>
                        <div className={styles.back}>
                            <p><span className={styles.baack}>&#8617;</span> back to home</p>
                        </div>
                    </Link>
                    <div className={styles.textContainer}>
                        <h2 className={styles.title}>Post not found</h2>
                        <p>Could not load this post. Please try again later.</p>
                    </div>
                </div>
            </div>
        );
    }

    const isOwner = session?.user?.email === data.userEmail;
    const [isAdmin, relatedPosts] = await Promise.all([
        session?.user?.email
            ? prisma.user.findUnique({
                where: { email: session.user.email },
                select: { role: true },
            }).then((user) => user?.role === "ADMIN")
            : false,
        data.approved
            ? Promise.all([
                prisma.post.findFirst({
                    where: { approved: true, createdAt: { gt: data.createdAt } },
                    orderBy: { createdAt: "asc" },
                    select: { slug: true, title: true },
                }),
                prisma.post.findFirst({
                    where: { approved: true, createdAt: { lt: data.createdAt } },
                    orderBy: { createdAt: "desc" },
                    select: { slug: true, title: true },
                }),
            ])
            : [null, null],
    ]);

    if (!data.approved && !isOwner && !isAdmin) {
        return (
            <div className={styles.container}>
                <div className={styles.infoContainer}>
                    <Link href="/" className={styles.top}>
                        <div className={styles.back}>
                            <p><span className={styles.baack}>&#8617;</span> back to home</p>
                        </div>
                    </Link>
                    <div className={styles.textContainer}>
                        <h2 className={styles.title}>Post not found</h2>
                        <p>This post is pending moderation.</p>
                    </div>
                </div>
            </div>
        );
    }

    const [previousPost, nextPost] = relatedPosts;
    const categoryLinks = [
        { slug: data.catSlug, title: data.catSlug },
        ...(data.categories || []).map(({ categorySlug, category }) => ({
            slug: categorySlug,
            title: category?.title || categorySlug,
        })),
    ].filter((category, index, all) => all.findIndex((item) => item.slug === category.slug) === index);
    const wordCount = (data.desc || "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
    const readingMinutes = Math.max(1, Math.ceil(wordCount / 220));
    const publishedDate = new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(data.createdAt));

    after(async () => {
        try {
            await prisma.post.update({ where: { slug }, data: { views: { increment: 1 } } });
        } catch (error) {
            console.warn('Failed to increment post views', error);
        }
    });

    return (
        <main className={styles.container}>
            <div className={styles.topline}>
                <Link href="/blog" className={styles.back}>← Writings</Link>
            </div>
            <header className={styles.articleHeader}>
                <h1 className={styles.title}>{data.title}</h1>
                <div className={styles.articleMeta}>
                    <time dateTime={new Date(data.createdAt).toISOString()}>{publishedDate}</time>
                    <span aria-hidden="true">·</span>
                    <span>{readingMinutes} min read</span>
                    <span aria-hidden="true">·</span>
                    <Link href={`/u/${encodeURIComponent((data.user?.username || data.user?.email?.split("@")[0] || "user").replace(/^@/, ""))}`}>
                        {data.user?.name || data.user?.username || "Journal author"}
                    </Link>
                    {!data.approved && <span className={styles.pending}>Pending review</span>}
                </div>
                <div className={styles.adminControls}>
                    <AdminPostControls slug={slug} canManage={isOwner || isAdmin} />
                </div>
            </header>
            {data?.img && (
                <div className={styles.imageContainer}>
                    <Image src={data.img} alt={`Illustration for ${data.title}`} fill className={styles.image} sizes="(max-width: 760px) 100vw, 920px" preload unoptimized={data.img.startsWith("https://")} />
                </div>
            )}
            <article className={styles.content}>
                <div
                    className={`${styles.description} ql-editor`}
                    dangerouslySetInnerHTML={{ __html: sanitizePostHtml(data?.desc) }}
                />
                {categoryLinks.length > 0 && (
                    <nav className={styles.tags} aria-label="Topics">
                        <span className={styles.topicLabel}>Filed under</span>
                        {categoryLinks.map(({ slug: categorySlug, title }, index) => (
                            <span className={styles.tag} key={categorySlug}>
                                <Link href={`/category/${encodeURIComponent(categorySlug)}`}>{title}</Link>
                                {index < categoryLinks.length - 1 && <span aria-hidden="true">·</span>}
                            </span>
                        ))}
                    </nav>
                )}
                <nav className={styles.postNav} aria-label="Browse other writings">
                    <h2 className={styles.postNavHeading}>Continue reading</h2>
                    {previousPost ? (
                        <Link href={`/posts/${encodeURIComponent(previousPost.slug)}`}>
                            <span>← Previous writing</span>
                            <strong>{previousPost.title}</strong>
                        </Link>
                    ) : <span />}
                    {nextPost ? (
                        <Link href={`/posts/${encodeURIComponent(nextPost.slug)}`}>
                            <span>Next writing →</span>
                            <strong>{nextPost.title}</strong>
                        </Link>
                    ) : <span />}
                </nav>
                <Comments postSlug={slug} />
            </article>
        </main>
    )
};

export default SinglePage;