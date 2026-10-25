export function getSafePostImageUrl(value) {
    if (typeof value !== "string" || !value.trim()) return null;

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
