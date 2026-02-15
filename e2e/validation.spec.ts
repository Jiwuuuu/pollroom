import { test, expect } from "@playwright/test";

test.describe("Input Validation", () => {
  test("should reject empty question", async ({ page }) => {
    await page.goto("/");

    // Fill options but leave question empty
    await page.getByPlaceholder("Option 1").fill("Option A");
    await page.getByPlaceholder("Option 2").fill("Option B");

    await page.getByRole("button", { name: "Create Poll" }).click();

    // Should show error toast, not navigate away
    await expect(page.getByText("Please enter a question")).toBeVisible();
    await expect(page).toHaveURL("/");
  });

  test("should reject fewer than 2 options", async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("Question").fill("Test question?");
    await page.getByPlaceholder("Option 1").fill("Only one option");
    // Leave Option 2 empty

    await page.getByRole("button", { name: "Create Poll" }).click();

    await expect(page.getByText("At least 2 options are required")).toBeVisible();
    await expect(page).toHaveURL("/");
  });

  test("should reject duplicate options", async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("Question").fill("Test question?");
    await page.getByPlaceholder("Option 1").fill("Same Text");
    await page.getByPlaceholder("Option 2").fill("same text");

    await page.getByRole("button", { name: "Create Poll" }).click();

    await expect(page.getByText("Duplicate options are not allowed")).toBeVisible();
    await expect(page).toHaveURL("/");
  });
});
