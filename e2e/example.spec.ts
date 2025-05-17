import { test, expect } from "@playwright/test";

test("basic test", async ({ page }) => {
  await page.goto("/");
  // Replace with a relevant selector for your landing page
  await expect(page.locator("body")).toContainText("checkaroundme");
});
