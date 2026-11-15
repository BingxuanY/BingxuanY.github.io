const { test, expect } = require("@playwright/test");
const { preparePage, stabilizeVisuals } = require("./helpers");

test("blog displays only the centered message", async ({ page }) => {
  await preparePage(page, "light");
  await page.goto("/al-folio/blog/", { waitUntil: "networkidle" });
  await stabilizeVisuals(page);

  await expect(page.getByText("my floating thoughts need to be captured :D", { exact: true })).toBeVisible();
  await expect(page.locator(".af-pagination, .post-list, .tag-list, .category-list")).toHaveCount(0);
});

test("search is omitted while the theme toggle remains available", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "theme controls are collapsed under the mobile menu");

  await preparePage(page, "light");
  await page.goto("/al-folio/", { waitUntil: "networkidle" });
  await stabilizeVisuals(page);

  await expect(page.locator("#search-toggle, ninja-keys")).toHaveCount(0);
  await expect(page.locator("#light-toggle")).toBeVisible();
  await expect(page.locator("#light-toggle")).toHaveCSS("cursor", "pointer");
});

test("mobile navbar can expand and collapse", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only navigation behavior");

  await preparePage(page, "light");
  await page.goto("/al-folio/", { waitUntil: "networkidle" });

  const toggle = page.locator(".navbar-toggler").first();
  await expect(toggle).toBeVisible();

  const nav = page.locator(".navbar-collapse").first();
  await toggle.click();
  await expect(nav).toHaveClass(/show/);

  await toggle.click();
  await expect(nav).not.toHaveClass(/show/);
});

test("navbar menu stays right-aligned on desktop", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "desktop-only alignment contract");

  await preparePage(page, "light");
  await page.goto("/al-folio/", { waitUntil: "networkidle" });
  await stabilizeVisuals(page);

  const alignment = await page.evaluate(() => {
    const container = document.querySelector("#navbar .container");
    const menu = document.querySelector("#navbarNav .navbar-menu-list");
    if (!container || !menu) {
      return null;
    }
    const containerBox = container.getBoundingClientRect();
    const menuBox = menu.getBoundingClientRect();
    return {
      containerRight: containerBox.right,
      menuRight: menuBox.right,
    };
  });

  expect(alignment).not.toBeNull();
  expect(Math.abs(alignment.menuRight - alignment.containerRight)).toBeLessThanOrEqual(24);
});

test("project cards retain their hover lift", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "hover-specific assertion is desktop-only");

  await preparePage(page, "light");
  await page.goto("/al-folio/projects/", { waitUntil: "networkidle" });
  await stabilizeVisuals(page);

  const card = page.locator(".projects .hoverable").first();
  await expect(card).toBeVisible();

  const before = await card.boundingBox();
  await card.hover();
  await page.waitForTimeout(150);
  const after = await card.boundingBox();

  expect(before).not.toBeNull();
  expect(after).not.toBeNull();
  expect(after.y).toBeLessThan(before.y);
});

test("active pages emit no client-side errors", async ({ page }) => {
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      failures.push(message.text());
    }
  });

  await preparePage(page, "light");
  const pages = ["/al-folio/", "/al-folio/projects/", "/al-folio/blog/"];

  for (const target of pages) {
    await page.goto(target, { waitUntil: "networkidle" });
    await stabilizeVisuals(page);
  }

  const jqueryFailures = failures.filter((message) => /\$\s*is not defined|lightbox/i.test(message));
  expect(jqueryFailures).toEqual([]);
});
