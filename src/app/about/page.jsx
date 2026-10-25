import { getAuthSession } from "@/utils/auth";
import { defaultAboutContent } from "@/utils/aboutContent";
import prisma from "@/utils/connect";
import { getSafePostImageUrl } from "@/utils/imageUrl";
import AboutPageContent from "./AboutPageContent";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "About",
    description: "Learn about Farhan Niloy, the writer behind this personal journal.",
    alternates: { canonical: "/about" },
};

export default async function AboutPage() {
    const [savedContent, session] = await Promise.all([
        prisma.pageContent.findUnique({ where: { slug: "about" } }),
        getAuthSession(),
    ]);
    const savedValues = savedContent
        ? { ...defaultAboutContent, ...JSON.parse(savedContent.content) }
        : defaultAboutContent;
    const content = {
        ...savedValues,
        profileImage: getSafePostImageUrl(savedValues.profileImage) || defaultAboutContent.profileImage,
    };
    const user = session?.user?.email
        ? await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true },
        })
        : null;

    return <AboutPageContent content={content} isAdmin={user?.role === "ADMIN"} />;
}
