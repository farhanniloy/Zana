import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { PrismaClient: PrismaClient } = require("@prisma/client");
const { PrismaClient: LocalPrismaClient } = require("@prisma/local-preview-client");

const databaseUrl = process.env.DATABASE_URL;
if (!/^postgres(?:ql)?:\/\//i.test(databaseUrl || "")) {
    throw new Error("Set DATABASE_URL to the Neon PostgreSQL connection string.");
}
if (process.env.CONFIRM_LOCAL_CONTENT_IMPORT !== "yes") {
    throw new Error("Set CONFIRM_LOCAL_CONTENT_IMPORT=yes to confirm this additive import.");
}

const localDatabaseUrl =
    process.env.LOCAL_DATABASE_URL ||
    pathToFileURL(resolve("prisma/local.db")).href;
const localPrisma = new LocalPrismaClient({
    datasources: { db: { url: localDatabaseUrl } },
});
const postgresPrisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
});

async function main() {
    const [categories, posts, comments, pageContents] = await Promise.all([
        localPrisma.category.findMany(),
        localPrisma.post.findMany({
            include: { categories: { select: { categorySlug: true } } },
            orderBy: { createdAt: "asc" },
        }),
        localPrisma.comment.findMany({ orderBy: { createdAt: "asc" } }),
        localPrisma.pageContent.findMany({
            where: { slug: { in: ["about", "playlists"] } },
        }),
    ]);

    const authorEmails = [
        ...new Set([
            ...posts.map((post) => post.userEmail),
            ...comments.map((comment) => comment.userEmail).filter(Boolean),
        ]),
    ];
    const authors = await localPrisma.user.findMany({
        where: { email: { in: authorEmails } },
        select: { email: true, name: true, username: true, image: true },
    });

    for (const category of categories) {
        await postgresPrisma.category.upsert({
            where: { slug: category.slug },
            update: {},
            create: {
                slug: category.slug,
                title: category.title,
                img: category.img,
            },
        });
    }

    for (const author of authors) {
        await postgresPrisma.user.upsert({
            where: { email: author.email },
            update: {},
            create: {
                email: author.email,
                name: author.name,
                username: author.username,
                image: author.image,
                role: "USER",
            },
        });
    }

    const postIdsBySlug = new Map();
    for (const post of posts) {
        const importedPost = await postgresPrisma.post.upsert({
            where: { slug: post.slug },
            update: {},
            create: {
                createdAt: post.createdAt,
                slug: post.slug,
                title: post.title,
                summary: post.summary,
                desc: post.desc,
                img: post.img,
                views: post.views,
                catSlug: post.catSlug,
                userEmail: post.userEmail,
                approved: post.approved,
            },
            select: { id: true },
        });
        postIdsBySlug.set(post.slug, importedPost.id);
    }

    const postCategories = posts.flatMap((post) =>
        post.categories.map(({ categorySlug }) => ({
            postId: postIdsBySlug.get(post.slug),
            categorySlug,
        })),
    );
    if (postCategories.length) {
        await postgresPrisma.postCategory.createMany({
            data: postCategories,
            skipDuplicates: true,
        });
    }

    for (const comment of comments) {
        await postgresPrisma.comment.upsert({
            where: { id: comment.id },
            update: {},
            create: {
                id: comment.id,
                createdAt: comment.createdAt,
                desc: comment.desc,
                userEmail: comment.userEmail,
                name: comment.name,
                avatar: comment.avatar,
                postSlug: comment.postSlug,
            },
        });
    }

    for (const pageContent of pageContents) {
        await postgresPrisma.pageContent.upsert({
            where: { slug: pageContent.slug },
            update: {},
            create: pageContent,
        });
    }

    console.log(
        `Imported local content: ${posts.length} posts, ${categories.length} categories, ` +
            `${postCategories.length} post-category links, ${comments.length} comments, ` +
            `${pageContents.length} page settings, and ${authors.length} author profiles.`,
    );
    console.log("Existing Neon records were left unchanged; local login credentials were not imported.");
}

try {
    await main();
} finally {
    await Promise.all([localPrisma.$disconnect(), postgresPrisma.$disconnect()]);
}
