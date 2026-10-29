import { describe, test } from "node:test";
import assert from "node:assert/strict";

const appUserId = process.env.APPLICATION_USER_ID as string;
const baseUrl = process.env.BASE_URL as string;
const urlForVerseListEndpoint = `${baseUrl}/api/v1/verse-of-the-day/verse-list`;

describe("Verse List Endpoint", () => {
  test("should successfully return verses for 2026", async () => {
    const response = await fetch(urlForVerseListEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Application-User-Id": appUserId,
      },
      body: JSON.stringify({
        year: "2026",
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(body));
    assert.ok(body.length >= 365);

    assert.deepEqual(Object.keys(body[0]), ["verse", "date", "formattedDate"]);
  });

  test("should error for an invalid year", async () => {
    const response = await fetch(urlForVerseListEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Application-User-Id": appUserId,
      },
      body: JSON.stringify({
        // old unsupported year
        year: "2020",
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(typeof body, "object");

    const { error, errorDescription } = body;
    assert.equal(error, "Bad Request");
    assert.match(
      errorDescription,
      /✖ Invalid option: expected one of "2025"|"2026"\n {2}→ at year/,
    );
  });
});
