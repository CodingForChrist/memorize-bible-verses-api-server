import { describe, test } from "node:test";
import assert from "node:assert/strict";

const appUserId = process.env.APPLICATION_USER_ID as string;
const baseUrl = process.env.BASE_URL as string;
// Berean Standard Bible (BSB)
const urlForGetPassageEndpoint = `${baseUrl}/api/v1/bibles/bba9f40183526463-01/passages/verse-reference`;

describe("Get Passages Endpoint", () => {
  test("should successfully return 2 Corinthians 5:17", async () => {
    const response = await fetch(urlForGetPassageEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Application-User-Id": appUserId,
      },
      body: JSON.stringify({
        verseReference: "2 Corinthians 5:17",
        contentType: "text",
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(typeof body, "object");
    assert.equal(typeof body.data, "object");

    const { reference, content } = body.data;
    assert.equal(reference, "2 Corinthians 5:17");
    assert.match(
      content,
      /Therefore if anyone is in Christ, he is a new creation\. The old has passed away\. Behold, the new has come!/,
    );
  });

  test("should error for an invalid verse range", async () => {
    const response = await fetch(urlForGetPassageEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Application-User-Id": appUserId,
      },
      body: JSON.stringify({
        verseReference: "2 Corinthians 5:17-10",
        contentType: "text",
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(typeof body, "object");

    const { error, errorDescription } = body;
    assert.equal(error, "Bad Request");
    assert.match(
      errorDescription,
      /✖ Error: End verse cannot be less than start verse\n {2}→ at verseReference/,
    );
  });

  test("should error for a misspelled book name", async () => {
    const response = await fetch(urlForGetPassageEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Application-User-Id": appUserId,
      },
      body: JSON.stringify({
        verseReference: "2 MisspelledBookName 5:17",
        contentType: "text",
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(typeof body, "object");

    const { error, errorDescription } = body;
    assert.equal(error, "Bad Request");
    assert.match(
      errorDescription,
      /✖ Error: Invalid book name\n {2}→ at verseReference/,
    );
  });
});
