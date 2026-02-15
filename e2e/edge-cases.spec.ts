import { test, expect } from "@playwright/test";

test.describe("Edge Cases", () => {
  test("should handle poll with exactly 2 options (minimum)", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Question").fill("Yes or No?");
    await page.getByPlaceholder("Option 1").fill("Yes");
    await page.getByPlaceholder("Option 2").fill("No");
    await page.getByRole("button", { name: "Create Poll" }).click();

    await page.waitForURL(/\/poll\/[\w-]+/);
    await expect(page.getByRole("button", { name: "Yes" })).toBeVisible();
    await expect(page.getByRole("button", { name: "No" })).toBeVisible();
  });

  test("should handle poll with 8 options (maximum)", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Question").fill("Pick a number?");

    const options = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"];
    for (let i = 0; i < options.length; i++) {
      if (i >= 2) {
        await page.getByRole("button", { name: "Add Option" }).click();
      }
      await page.getByPlaceholder(`Option ${i + 1}`).fill(options[i]);
    }

    await page.getByRole("button", { name: "Create Poll" }).click();
    await page.waitForURL(/\/poll\/[\w-]+/);

    // All 8 options should be visible
    for (const opt of options) {
      await expect(page.getByText(opt)).toBeVisible();
    }
  });

  test("should trim whitespace from question and options", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Question").fill("  Trimmed question?  ");
    await page.getByPlaceholder("Option 1").fill("  Option A  ");
    await page.getByPlaceholder("Option 2").fill("  Option B  ");

    await page.getByRole("button", { name: "Create Poll" }).click();
    await page.waitForURL(/\/poll\/[\w-]+/);

    // Should show trimmed text
    await expect(page.getByText("Trimmed question?")).toBeVisible();
  });

  test("should show share link with copy button", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Question").fill("Share test?");
    await page.getByPlaceholder("Option 1").fill("A");
    await page.getByPlaceholder("Option 2").fill("B");
    await page.getByRole("button", { name: "Create Poll" }).click();

    await page.waitForURL(/\/poll\/[\w-]+/);

    // Share link section should be visible
    await expect(page.getByText("Share this poll")).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
  });

  test("should show custom 404 page", async ({ page }) => {
    await page.goto("/nonexistent-page");
    await expect(page.getByText("404")).toBeVisible();
  });

  test("should not allow voting without selecting an option", async ({ page }) => {
    // Create a poll first
    await page.goto("/");
    await page.getByLabel("Question").fill("Click test?");
    await page.getByPlaceholder("Option 1").fill("X");
    await page.getByPlaceholder("Option 2").fill("Y");
    await page.getByRole("button", { name: "Create Poll" }).click();
    await page.waitForURL(/\/poll\/[\w-]+/);

    // Vote button should be disabled without selection
    const voteButton = page.getByRole("button", { name: "Vote" });
    await expect(voteButton).toBeDisabled();
  });
});
