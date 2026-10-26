import test from "node:test";
import assert from "node:assert/strict";
import { getGoogleDriveImageUrl, getSafePostImageUrl } from "../../src/utils/imageUrl.js";
import { sanitizePostHtml } from "../../src/utils/sanitizeHtml.js";

test("converts Google Drive share links to direct image URLs", () => {
    assert.equal(
        getGoogleDriveImageUrl("https://drive.google.com/file/d/abc_123-xyz/view?usp=sharing"),
        "https://drive.google.com/thumbnail?id=abc_123-xyz&sz=w2000",
    );
    assert.equal(
        getGoogleDriveImageUrl("https://drive.google.com/open?id=abc123&resourcekey=key123"),
        "https://drive.google.com/thumbnail?id=abc123&sz=w2000&resourcekey=key123",
    );
});

test("rejects non-Drive or insecure share links", () => {
    assert.equal(getGoogleDriveImageUrl("http://drive.google.com/file/d/abc123/view"), null);
    assert.equal(getGoogleDriveImageUrl("https://drive.google.com.evil.test/file/d/abc123/view"), null);
    assert.equal(getGoogleDriveImageUrl("https://example.com/file/d/abc123/view"), null);
    assert.equal(getGoogleDriveImageUrl("https://drive.google.com/drive/folders?id=abc123"), null);
    assert.equal(getGoogleDriveImageUrl("not a URL"), null);
});

test("continues to allow HTTPS CDN images for post thumbnails", () => {
    assert.equal(
        getSafePostImageUrl("https://cdn.example.com/image.jpg"),
        "https://cdn.example.com/image.jpg",
    );
    assert.equal(
        getSafePostImageUrl("https://drive.google.com/file/d/abc123/view"),
        "https://drive.google.com/thumbnail?id=abc123&sz=w2000",
    );
});

test("normalizes Google Drive links for thumbnails and body images on save", () => {
    const driveShareUrl = "https://drive.google.com/file/d/abc123/view?usp=sharing";
    const directImageUrl = "https://drive.google.com/thumbnail?id=abc123&sz=w2000";

    assert.equal(getSafePostImageUrl(driveShareUrl), directImageUrl);
    assert.equal(
        sanitizePostHtml(`<p><img src="${driveShareUrl}" alt="Drive image"></p>`),
        `<p><img src="${directImageUrl}" alt="Drive image"></p>`,
    );
    assert.match(
        sanitizePostHtml('<p><img src="https://cdn.example.com/story.jpg" alt="CDN image"></p>'),
        /https:\/\/cdn\.example\.com\/story\.jpg/,
    );
});
