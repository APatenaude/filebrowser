import { expect, test } from "../test-setup";

test.use({ viewport: { width: 500, height: 800 } });

test("mobile FAB opens create actions and makes a folder", async ({ page, checkForErrors }) => {
  await page.goto("/files/");
  await expect(page).toHaveTitle("Graham's Filebrowser - Files - playwright-files");

  const fab = page.locator('[data-testid="file-actions-fab"]');
  await fab.waitFor({ state: "visible" });
  await fab.click();

  const menu = page.locator("#context-menu");
  await menu.waitFor({ state: "visible" });
  await expect(menu.locator('button[aria-label="New folder"]')).toBeVisible();
  await expect(menu.locator('button[aria-label="New file"]')).toBeVisible();
  await expect(menu.locator('button[aria-label="Upload"]')).toBeVisible();
  await expect(menu.locator('button[aria-label="Select multiple"]')).toBeVisible();

  await menu.locator('button[aria-label="New folder"]').click();
  await page.locator('input[aria-label="New Folder Name"]').fill("fab-folder");
  await page.locator('button[aria-label="Create"]').click();
  await page.locator('a[aria-label="fab-folder"]').waitFor({ state: "visible" });

  checkForErrors();
});
