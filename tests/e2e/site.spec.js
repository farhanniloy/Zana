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
    for (const width of [320, 375, 640, 768, 1024, 1280, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/");
        await expect(page.getByRole("heading", { name: "I'm Zana" })).toBeVisible();

        const heroBorders = await page.locator('section[aria-labelledby="home-title"]').evaluate((element) => ({
            borderWidth: getComputedStyle(element).borderTopWidth,
            insetBorder: getComputedStyle(element, "::after").display,
        }));
        expect(heroBorders.borderWidth).toBe("1px");
        expect(heroBorders.insetBorder).toBe("block");
        await expect(page.locator('section[aria-labelledby="home-title"] img'))
            .toHaveCSS("filter", "sepia(0.24) saturate(0.88) brightness(0.9) contrast(1.04)");
        if (width <= 640) {
            const heroHeight = await page.locator('section[aria-labelledby="home-title"]').evaluate((element) =>
                element.getBoundingClientRect().height,
            );
            expect(heroHeight).toBeGreaterThanOrEqual(370);
            expect(heroHeight).toBeLessThanOrEqual(400);
            await expect(page.locator('section[aria-labelledby="home-title"] img'))
                .toHaveCSS("object-position", width <= 380 ? "0% 54%" : "20% 54%");
            const heroSpacing = await page.locator('section[aria-labelledby="home-title"]').evaluate((element) => {
                const welcome = element.querySelector("div > span");
                const cta = element.querySelector("a");
                const note = element.querySelector(":scope > span:last-child");
                return {
                    top: welcome.getBoundingClientRect().top - element.getBoundingClientRect().top,
                    ctaToNote: note.getBoundingClientRect().top - cta.getBoundingClientRect().bottom,
                    bottom: element.getBoundingClientRect().bottom - note.getBoundingClientRect().bottom,
                };
            });
            expect(heroSpacing.top).toBeGreaterThanOrEqual(25);
            expect(heroSpacing.ctaToNote).toBeGreaterThanOrEqual(20);
            expect(heroSpacing.bottom).toBeGreaterThanOrEqual(17);
        }
        const cta = await page.getByRole("link", { name: "Dive into my thoughts" }).boundingBox();
        const note = await page.locator('section[aria-labelledby="home-title"] > span:last-child').boundingBox();
        expect(cta.y + cta.height).toBeLessThan(note.y);

        const background = await page.locator(".container").evaluate((element) => {
            const style = getComputedStyle(element);
            return {
                image: style.backgroundImage,
                size: style.backgroundSize,
                color: getComputedStyle(document.documentElement).getPropertyValue("--bg").trim(),
            };
        });
        expect(background.color).toBe("#160e07");
        if (width <= 640) {
            expect(background.image).toContain("leather-patina-mobile.webp");
            expect(background.image).toContain("radial-gradient");
            expect(background.size.startsWith("280px 280px")).toBe(true);
        } else {
            expect(background.image).toContain("leather-patina.svg");
            const expectedTextureSize = width <= 1024 ? "800px 800px" : "900px 900px";
            expect(background.size.startsWith(expectedTextureSize)).toBe(true);
        }

        const listeningRoom = page.locator('section[aria-labelledby="listening-title"]');
        await expect(listeningRoom.getByRole("link", { name: "Open the Playlist" }))
            .toHaveAttribute("href", "/playlist");
        const backgroundBeforeHover = await listeningRoom.evaluate((element) => getComputedStyle(element).backgroundColor);
        await listeningRoom.hover();
        await expect.poll(() => listeningRoom.evaluate((element) => getComputedStyle(element).backgroundColor))
            .toBe(backgroundBeforeHover);

        const notebookCollage = page.locator('[aria-label="Reading and writing photographs"]');
        const collageImages = notebookCollage.locator(":scope > div");
        if (width <= 760) {
            await expect(notebookCollage).toBeVisible();
            await expect(collageImages).toHaveCount(3);
            await expect.poll(() => collageImages.evaluateAll((images) =>
                images.every((image) => image.querySelector("img")?.getBoundingClientRect().height > 0),
            )).toBe(true);
        } else {
            await expect(notebookCollage).toBeVisible();
            await expect(collageImages).toHaveCount(3);
            await expect.poll(() => collageImages.evaluateAll((images) =>
                images.every((image) => image.querySelector("img")?.getBoundingClientRect().height > 0),
            )).toBe(true);
        }
        const writingColumns = await page.locator('[aria-labelledby="writings-title"] article').first().evaluate((article) =>
            getComputedStyle(article.parentElement).gridTemplateColumns.split(" ").length,
        );
        expect(writingColumns).toBe(width <= 520 ? 1 : width <= 900 ? 2 : 3);
        const homeWritingImage = page.locator('[aria-labelledby="writings-title"] article').first().locator("img");
        await expect(homeWritingImage).toHaveCSS("filter", "sepia(0.36) saturate(0.68) brightness(0.74) contrast(1.06)");
        await page.locator('[aria-labelledby="writings-title"] article').first().hover();
        await expect(homeWritingImage).toHaveCSS("filter", "sepia(0.36) saturate(0.68) brightness(0.74) contrast(1.06)");
        await expect(page.locator('[aria-labelledby="notebook-title"] img').first())
            .toHaveCSS("filter", "sepia(0.36) saturate(0.68) brightness(0.74) contrast(1.06)");
        const notebookSection = page.locator('[aria-labelledby="notebook-title"]');
        const notebookIntroBox = await notebookSection.locator(":scope > div").nth(0).boundingBox();
        const notebookRoom = notebookSection.getByRole("img", { name: "A warmly lit reading room filled with books" }).locator("xpath=..");
        if (width <= 760) {
            await expect(notebookRoom).toBeHidden();
            const notebookCollageBox = await notebookCollage.boundingBox();
            expect(notebookCollageBox.width).toBeGreaterThan(width * 0.75);
            expect(notebookIntroBox.y).toBeLessThan(notebookCollageBox.y);
            const notebookEntriesBox = await notebookSection.locator(":scope > div").nth(3).boundingBox();
            expect(notebookEntriesBox.y).toBeGreaterThanOrEqual(notebookCollageBox.y + notebookCollageBox.height);
            expect(notebookEntriesBox.y).toBeGreaterThanOrEqual(notebookIntroBox.y + notebookIntroBox.height);
        } else {
            await expect(notebookRoom).toBeVisible();
            const notebookRoomBox = await notebookRoom.boundingBox();
            const notebookCollageBox = await notebookCollage.boundingBox();
            const notebookEntriesBox = await notebookSection.locator(":scope > div").nth(3).boundingBox();
            expect(notebookRoomBox.x).toBeGreaterThan(notebookCollageBox.x + notebookCollageBox.width);
            expect(notebookIntroBox.y).toBeGreaterThanOrEqual(notebookCollageBox.y + notebookCollageBox.height);
            expect(notebookEntriesBox.y).toBeGreaterThanOrEqual(notebookIntroBox.y + notebookIntroBox.height);
        }
        await expect(page.locator('[aria-labelledby="listening-title"] img').first())
            .toHaveCSS("filter", "sepia(0.24) saturate(0.88) brightness(0.9) contrast(1.04)");
        const essayLink = page.locator('[aria-labelledby="writings-title"] article').first()
            .getByRole("link", { name: "Read the essay" });
        if (width <= 640) {
            await expect(essayLink).toBeHidden();
        } else {
            await expect(essayLink).toBeVisible();
        }

        const unsafeOutboundLinks = await page.locator('a[target="_blank"]').evaluateAll((links) =>
            links.filter((link) =>
                !link.relList.contains("noopener") || !link.relList.contains("noreferrer"),
            ).map((link) => link.href),
        );
        expect(unsafeOutboundLinks).toEqual([]);

        const dimensions = await page.evaluate(() => ({
            viewport: document.documentElement.clientWidth,
            page: document.documentElement.scrollWidth,
        }));
        expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport);
    }

    for (const [width, expectedColumns] of [[375, 1], [768, 2], [1440, 3]]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/blog");
        await expect.poll(() => page.locator("main article").first().evaluate((article) =>
            getComputedStyle(article.parentElement).gridTemplateColumns.split(" ").length,
        )).toBe(expectedColumns);
        const cardImage = page.locator("main article").first().locator("img");
        await expect(cardImage).toHaveCSS("filter", "sepia(0.36) saturate(0.68) brightness(0.74) contrast(1.06)");
        await page.locator("main article").first().hover();
        await expect(cardImage).toHaveCSS("filter", "sepia(0.36) saturate(0.68) brightness(0.74) contrast(1.06)");
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
    await expect(page.locator("main header > span")).toHaveCSS("font-size", "11px");
    await expect(page.locator("form input[type=search]")).toHaveCSS("font-size", "16px");
    await expect(page.locator("form button")).toHaveCSS("font-size", "15px");

    await page.goto("/blog");
    const firstCard = page.locator("article").first();
    await expect(firstCard.locator("time")).toHaveCSS("font-size", "13px");
    await expect(firstCard.locator("h3")).toHaveCSS("font-size", "22px");
    await expect(firstCard.locator("p")).toHaveCSS("font-size", "15px");
});

test("admin users are readable and fit on narrow screens", async ({ page }) => {
    await page.route("**/api/admin/users", (route) => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
            users: [{
                id: "responsive-user",
                email: "averylonguseremail.address@example.com",
                name: "A Very Long Display Name",
                username: "averylongusernamehere",
                role: "MODERATOR",
            }],
        }),
    }));

    for (const width of [320, 375, 600, 768, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/admin/users");
        await expect(page.getByText("averylonguseremail.address@example.com")).toBeVisible();

        const layout = await page.locator("main").evaluate((main) => {
            const table = main.querySelector("table");
            const row = main.querySelector("tbody tr");
            return {
                viewport: document.documentElement.clientWidth,
                scrollWidth: document.documentElement.scrollWidth,
                tableDisplay: getComputedStyle(table).display,
                rowWidth: row.getBoundingClientRect().width,
            };
        });
        expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewport);

        if (width <= 700) {
            expect(layout.tableDisplay).toBe("block");
            await expect(page.getByRole("button", { name: "Save username for averylonguseremail.address@example.com" }))
                .toBeVisible();
            expect(layout.rowWidth).toBeLessThan(layout.viewport);
        } else {
            expect(layout.tableDisplay).toBe("table");
        }
    }
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
    await page.route(/^https:\/\/drive\.google\.com\/thumbnail\?/, (route) => route.abort());
    await page.goto("/write");

    const title = `Playwright journal ${Date.now()}`;
    const slug = title.toLowerCase().replaceAll(" ", "-");
    await page.getByPlaceholder("Title").fill(title);
    await page.getByLabel("URL / Slug").fill(slug);
    await page.getByPlaceholder("Excerpt / preview text for the card").fill("An automated publishing workflow check.");
    await page.locator('[contenteditable="true"]').fill("This article was created by the end-to-end test.");
    const thumbnailSource = page.getByRole("group", { name: "Thumbnail image source" });
    await thumbnailSource.getByRole("button", { name: "Google Drive" }).click();
    await page.getByLabel("Google Drive thumbnail share link")
        .fill("https://drive.google.com/file/d/thumbnail_test_id/view?usp=sharing");
    await page.getByRole("button", { name: "Use Google Drive image" }).click();
    await expect(page.getByAltText("Selected post thumbnail preview"))
        .toHaveAttribute("src", /drive\.google\.com\/thumbnail\?id=thumbnail_test_id/);

    await page.getByRole("button", { name: "Add media (remote image, YouTube, Facebook, audio)" }).click();
    const bodyImageSource = page.getByRole("group", { name: "Body image source" });
    await bodyImageSource.getByRole("button", { name: "Google Drive" }).click();
    await page.getByPlaceholder("https://drive.google.com/file/d/…/view")
        .fill("https://drive.google.com/file/d/body_image_test_id/view?usp=sharing");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.locator('[contenteditable="true"] img'))
        .toHaveAttribute("src", /drive\.google\.com\/thumbnail\?id=body_image_test_id/);
    await page.getByRole("button", { name: "Publish" }).click();

    await expect(page).toHaveURL(new RegExp(`/posts/${slug}$`));
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.locator("article .description img"))
        .toHaveAttribute("src", /drive\.google\.com\/thumbnail\?id=body_image_test_id/);
    await expect(page.getByRole("heading", { name: "Comments" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete", exact: true }).first()).toBeVisible();

    const comment = `Automated comment ${Date.now()}`;
    await page.getByPlaceholder("Write a comment...").fill(comment);
    await page.getByRole("button", { name: "Send" }).click();
    const commentContent = page.getByText(comment);
    await expect(commentContent).toBeVisible();
    page.once("dialog", (dialog) => dialog.accept());
    await commentContent.locator("xpath=..").getByRole("button", { name: "Delete" }).click();
    await expect(commentContent).toHaveCount(0);
});

test("playlist page renders configured embeds and admin editing controls", async ({ page }) => {
    await signInAsLocalAdmin(page);
    await page.route(
        /^https:\/\/(?:[^/]+\.spotifycdn\.com|[^/]+\.scdn\.co)\//,
        (route) => route.abort(),
    );
    await page.goto("/playlist");

    await expect(page.getByRole("heading", { name: "The listening room" })).toBeVisible();
    await expect(page.locator("iframe").first()).toBeVisible();
    await expect(page.locator("main section img").first()).toBeVisible();
    await expect.poll(() => page.locator("main section img").evaluateAll((images) =>
        images.every((image) => image.complete && image.naturalWidth > 0),
    )).toBe(true);
    await expect.poll(() => page.locator("main section img").evaluateAll((images) =>
        images.every((image) => image.alt.includes("vintage turntable")),
    )).toBe(true);
    await page.getByRole("button", { name: "Edit playlists" }).click();
    await expect(page.getByRole("heading", { name: "Manage the listening room" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add playlist" })).toBeVisible();
    await page.getByRole("button", { name: "Close editor" }).click();
});
