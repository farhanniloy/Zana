import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

async function signInAsLocalAdmin(page) {
    const credentials = JSON.parse(
        await readFile(resolve("prisma/local-admin.credentials"), "utf8"),
    );

    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in with email" }).click();
    await page.getByPlaceholder("Email").fill(credentials.email);
    await page.getByPlaceholder("Password").fill(credentials.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("link", { name: "Moderation", exact: true })).toBeVisible();
}

test("public browsing works at mobile and desktop widths", async ({ page }) => {
    for (const width of [375, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/");
        await expect(page.getByRole("heading", { name: "I write things." })).toBeVisible();

        if (width === 375) {
            await expect(
                page.locator('[aria-label="Reading and writing photographs"] > div').nth(1).locator("img"),
            ).toHaveAttribute("alt", "A handwritten story on aged paper beside an ink bottle");
        }

        const dimensions = await page.evaluate(() => ({
            viewport: document.documentElement.clientWidth,
            page: document.documentElement.scrollWidth,
        }));
        expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport);
    }

    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(page.getByRole("button", { name: "Close navigation menu" })).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open navigation menu" })).toHaveAttribute("aria-expanded", "false");

    const theme = page.getByRole("switch");
    const previousTheme = await theme.getAttribute("aria-checked");
    await theme.click();
    await expect(theme).not.toHaveAttribute("aria-checked", previousTheme);

    await page.goto("/blog?q=playwright-no-matching-post");
    await expect(page.getByText(/No writings match this shelf/)).toBeVisible();
    await expect(page.getByRole("searchbox")).toHaveValue("playwright-no-matching-post");
});

test("admin routes require authentication and moderation can approve a pending post", async ({ page }) => {
    const unauthenticatedResponse = await page.request.get("/api/admin/pending");
    expect(unauthenticatedResponse.status()).toBe(401);

    await signInAsLocalAdmin(page);
    await page.goto("/admin/moderation");
    await expect(page.getByRole("heading", { name: "A Note Awaiting Moderation" })).toBeVisible();
    await page.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByText("No pending posts")).toBeVisible();
});

test("admin can publish a post and add a comment", async ({ page }) => {
    await signInAsLocalAdmin(page);
    await page.goto("/write");

    const title = `Playwright journal ${Date.now()}`;
    const slug = title.toLowerCase().replaceAll(" ", "-");
    await page.getByPlaceholder("Title").fill(title);
    await page.getByLabel("URL / Slug").fill(slug);
    await page.getByPlaceholder("Excerpt / preview text for the card").fill("An automated publishing workflow check.");
    await page.locator('[contenteditable="true"]').fill("This article was created by the end-to-end test.");
    await page.getByRole("button", { name: "Publish" }).click();

    await expect(page).toHaveURL(new RegExp(`/posts/${slug}$`));
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Comments" })).toBeVisible();

    const comment = `Automated comment ${Date.now()}`;
    await page.getByPlaceholder("Write a comment...").fill(comment);
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText(comment)).toBeVisible();
});

test("playlist page renders configured embeds and admin editing controls", async ({ page }) => {
    await signInAsLocalAdmin(page);
    await page.goto("/playlist");

    await expect(page.getByRole("heading", { name: "The listening room" })).toBeVisible();
    await expect(page.locator("iframe").first()).toBeVisible();
    await page.getByRole("button", { name: "Edit playlists" }).click();
    await expect(page.getByRole("heading", { name: "Manage the listening room" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add playlist" })).toBeVisible();
    await page.getByRole("button", { name: "Close editor" }).click();
});
