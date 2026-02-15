import { test, expect } from "@playwright/test";

/** Helper: create a poll via API and return the poll ID */
async function createPollViaApi(baseURL: string) {
  const res = await fetch(`${baseURL}/api/polls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: "Real-time test poll?",
      options: ["Alpha", "Beta"],
    }),
  });
  const data = await res.json();
  return data.id as string;
}

/** Helper: cast a vote via API with a custom fingerprint and IP */
async function voteViaApi(
  baseURL: string,
  pollId: string,
  optionId: string,
  fingerprint: string
): Promise<number> {
  const res = await fetch(`${baseURL}/api/polls/${pollId}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `voter_id=${fingerprint}`,
      "X-Forwarded-For": `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
    },
    body: JSON.stringify({ optionId }),
  });
  return res.status;
}

test.describe("Real-Time Updates", () => {
  test("should show updated vote count after a new vote arrives", async ({
    page,
    baseURL,
  }) => {
    // Create poll via API
    const pollId = await createPollViaApi(baseURL!);

    // Open poll page and vote
    await page.goto(`/poll/${pollId}`);
    await expect(page.getByText("Real-time test poll?")).toBeVisible();
    await page.getByText("Alpha").click();
    await page.getByRole("button", { name: "Vote" }).click();
    await expect(page.getByText("Vote recorded")).toBeVisible();

    // Should see 1 vote total
    await expect(page.getByText("1 vote total")).toBeVisible();

    // Fetch options to get the Beta option ID
    const pollRes = await fetch(`${baseURL}/api/polls/${pollId}`);
    const pollData = await pollRes.json();
    const betaOption = pollData.options.find(
      (o: { text: string }) => o.text === "Beta"
    );

    // Cast a second vote via API with a different fingerprint and IP
    const status = await voteViaApi(
      baseURL!,
      pollId,
      betaOption.id,
      `test-fp-${Date.now()}`
    );
    expect(status).toBe(201);

    // The page should update to show 2 votes total.
    // This happens via Realtime push if connected, otherwise via polling fallback (~3s).
    await expect(page.getByText("2 votes total")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should show connection status indicator after voting", async ({
    page,
    baseURL,
  }) => {
    const pollId = await createPollViaApi(baseURL!);

    await page.goto(`/poll/${pollId}`);
    await page.getByText("Alpha").click();
    await page.getByRole("button", { name: "Vote" }).click();
    await expect(page.getByText("Vote recorded")).toBeVisible();

    // The ResultsView shows a connection indicator — either "Live" (Realtime
    // connected) or "Reconnecting..." (Realtime not yet connected / fallback).
    // Both prove the indicator component renders correctly.
    await expect(
      page.getByText("Live").or(page.getByText("Reconnecting"))
    ).toBeVisible({ timeout: 10000 });
  });
});

