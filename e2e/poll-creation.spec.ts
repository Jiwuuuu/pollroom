import { test, expect } from "@playwright/test";

test.describe("Poll Creation", () => {
  test("should display the create poll form on homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Create a");
    await expect(page.getByLabel("Question")).toBeVisible();
    await expect(page.getByPlaceholder("Option 1")).toBeVisible();
    await expect(page.getByPlaceholder("Option 2")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Poll" })).toBeVisible();
  });

  test("should create a poll and redirect to poll page", async ({ page }) => {
    await page.goto("/");

    // Fill in question
    await page.getByLabel("Question").fill("What is the best programming language?");

    // Fill in options
    await page.getByPlaceholder("Option 1").fill("TypeScript");
    await page.getByPlaceholder("Option 2").fill("Python");

    // Submit
    await page.getByRole("button", { name: "Create Poll" }).click();

    // Should redirect to /poll/[id]
    await page.waitForURL(/\/poll\/[\w-]+/);
    await expect(page.url()).toMatch(/\/poll\/[\w-]+/);

    // Poll question should be visible
    await expect(page.getByText("What is the best programming language?")).toBeVisible();
  });

  test("should allow adding and removing options", async ({ page }) => {
    await page.goto("/");

    // Should start with 2 option fields
    await expect(page.getByPlaceholder("Option 1")).toBeVisible();
    await expect(page.getByPlaceholder("Option 2")).toBeVisible();

    // Add a 3rd option
    await page.getByRole("button", { name: "Add Option" }).click();
    await expect(page.getByPlaceholder("Option 3")).toBeVisible();

    // Remove the 3rd option
    const removeButtons = page.getByRole("button", { name: /Remove option/ });
    await removeButtons.last().click();
    await expect(page.getByPlaceholder("Option 3")).not.toBeVisible();
  });

  test("should enforce maximum 8 options", async ({ page }) => {
    await page.goto("/");

    // Add options until we reach 8
    for (let i = 0; i < 6; i++) {
      await page.getByRole("button", { name: "Add Option" }).click();
    }

    // "Add Option" button should be gone at 8
    await expect(page.getByRole("button", { name: "Add Option" })).not.toBeVisible();

    // Should show 8/8
    await expect(page.getByText("8/8")).toBeVisible();
  });
});
