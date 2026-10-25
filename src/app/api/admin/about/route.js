import { NextResponse } from "next/server";
import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { ensureCsrf } from "@/utils/csrf";
import { getSafePostImageUrl } from "@/utils/imageUrl";

const fields = [
    "profileImage",
    "location",
    "kicker",
    "firstName",
    "lastName",
    "lede",
    "bioOne",
    "bioTwo",
    "email",
    "phone",
    "github",
    "linkedin",
    "x",
    "facebook",
];
const MAX_FIELD_LENGTH = 2000;

export async function PUT(request) {
    const csrfError = ensureCsrf(request);
    if (csrfError) return csrfError;

    const session = await getAuthSession();
    if (!session?.user?.email) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true },
    });
    if (user?.role !== "ADMIN") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        if (
            !body ||
            typeof body !== "object" ||
            fields.some((field) => typeof body[field] !== "string" || body[field].length > MAX_FIELD_LENGTH)
        ) {
            return NextResponse.json({ message: "Invalid About page content" }, { status: 400 });
        }
        if (!body.firstName.trim() || !body.lastName.trim() || !body.email.trim()) {
            return NextResponse.json({ message: "Name and email are required" }, { status: 400 });
        }
        const profileImage = getSafePostImageUrl(body.profileImage);
        if (!profileImage) {
            return NextResponse.json(
                { message: "Enter a valid public HTTPS portrait image URL or local image path" },
                { status: 400 },
            );
        }
        body.profileImage = profileImage;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
            return NextResponse.json({ message: "Enter a valid email address" }, { status: 400 });
        }
        for (const field of ["github", "linkedin", "x", "facebook"]) {
            if (!body[field]) continue;
            let url;
            try {
                url = new URL(body[field]);
            } catch {
                return NextResponse.json({ message: `Enter a valid ${field} URL` }, { status: 400 });
            }
            if (url.protocol !== "https:" || url.username || url.password) {
                return NextResponse.json({ message: `Enter a valid ${field} HTTPS URL` }, { status: 400 });
            }
            body[field] = url.toString();
        }

        const content = Object.fromEntries(fields.map((field) => [field, body[field].trim()]));
        await prisma.pageContent.upsert({
            where: { slug: "about" },
            update: { content: JSON.stringify(content) },
            create: { slug: "about", content: JSON.stringify(content) },
        });

        return NextResponse.json({ content });
    } catch (error) {
        console.error("Failed to update About page", error);
        return NextResponse.json({ message: "Failed to update About page" }, { status: 500 });
    }
}
