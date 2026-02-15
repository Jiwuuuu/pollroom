import { test, expect } from "@playwright/test";

/** Helper: create a poll and return the poll page URL */
async function createPoll(page: import("@playwright/test").Page, question: string, options: string[]) {
  await page.goto("/");
  await page.getByLabel("Question").fill(question);

  for (let i = 0; i < options.length; i++) {
    if (i >= 2) {
      await page.getByRole("button", { name: "Add Option" }).click();
    }
    await page.getByPlaceholder(`Option ${i + 1}`).fill(options[i]);
  }

  await page.getByRole("button", { name: "Create Poll" }).click();
  await page.waitForURL(/\/poll\/[\w-]+/);
  return page.url();
}

test.describe("Voting Flow", () => {
  test("should allow voting and show results", async ({ page }) => {
    const pollUrl = await createPoll(page, "Favorite fruit?", ["Apple", "Banana", "Cherry"]);

    // Should see voting view with options
    await expect(page.getByText("Apple")).toBeVisible();
    await expect(page.getByText("Banana")).toBeVisible();
    await expect(page.getByText("Cherry")).toBeVisible();
    await expect(page.getByRole("button", { name: "Vote" })).toBeVisible();

    // Select "Banana" and vote
    await page.getByText("Banana").click();
    await page.getByRole("button", { name: "Vote" }).click();

    // Should switch to results view
    await expect(page.getByText("Vote recorded")).toBeVisible();

    // Results should show percentages / vote counts
    await expect(page.getByText(/100%/)).toBeVisible();
    await expect(page.getByText("1 vote total")).toBeVisible();
  });

  test("should prevent double voting (same browser)", async ({ page }) => {
    const pollUrl = await createPoll(page, "Best color?", ["Red", "Blue"]);

    // Vote
    await page.getByText("Red").click();
    await page.getByRole("button", { name: "Vote" }).click();
    await expect(page.getByText("Vote recorded")).toBeVisible();

    // Revisit the same poll — should see results, not voting form
    await page.goto(pollUrl);
    
    // Should NOT see the Vote button (already voted)
    await expect(page.getByRole("button", { name: "Vote" })).not.toBeVisible();
    
    // Should see results
    await expect(page.getByText("vote total")).toBeVisible();
  });

  test("should show 404 for non-existent poll", async ({ page }) => {
    await page.goto("/poll/00000000-0000-0000-0000-000000000000");

    await expect(page.getByText("This poll doesn't exist")).toBeVisible();
  });
});
