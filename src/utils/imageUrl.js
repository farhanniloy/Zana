export function getSafePostImageUrl(value) {
    if (typeof value !== "string" || !value.trim()) return null;

    const driveImageUrl = getGoogleDriveImageUrl(value);
    if (driveImageUrl) return driveImageUrl;

    const imageUrl = value.trim();
    if (imageUrl.startsWith("/") && !imageUrl.startsWith("//") && !imageUrl.includes("..")) {
        return imageUrl;
    }

    try {
        const parsed = new URL(imageUrl);
        const hostname = parsed.hostname.toLowerCase();
        const isIpAddress = /^\[?[0-9a-f:.]+\]?$/i.test(hostname);
        const isLocalHost =
            hostname === "localhost" ||
            hostname.endsWith(".localhost") ||
            hostname.endsWith(".local");
        if (
            parsed.protocol === "https:" &&
            !parsed.username &&
            !parsed.password &&
            !isLocalHost &&
            !isIpAddress &&
            hostname.includes(".")
        ) {
            return parsed.toString();
        }
    } catch {
        return null;
    }

    return null;
}

export function getGoogleDriveImageUrl(value) {
    if (typeof value !== "string" || !value.trim()) return null;

    try {
        const sharedUrl = new URL(value.trim());
        if (
            sharedUrl.protocol !== "https:" ||
            !["drive.google.com", "www.drive.google.com"].includes(sharedUrl.hostname) ||
            sharedUrl.username ||
            sharedUrl.password
        ) {
            return null;
        }

        const filePathMatch = sharedUrl.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)(?:\/|$)/);
        const supportsIdQuery = ["/open", "/uc", "/thumbnail"].includes(sharedUrl.pathname);
        const fileId = filePathMatch?.[1] || (supportsIdQuery ? sharedUrl.searchParams.get("id") : null);
        if (!fileId || !/^[A-Za-z0-9_-]+$/.test(fileId)) return null;

        const imageUrl = new URL("https://drive.google.com/thumbnail");
        imageUrl.searchParams.set("id", fileId);
        imageUrl.searchParams.set("sz", "w2000");
        const resourceKey = sharedUrl.searchParams.get("resourcekey");
        if (resourceKey) imageUrl.searchParams.set("resourcekey", resourceKey);
        return imageUrl.toString();
    } catch {
        return null;
    }
}
