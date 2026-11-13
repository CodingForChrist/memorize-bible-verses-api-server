import { describe, test } from "node:test";
import assert from "node:assert/strict";

const appUserId = process.env.APPLICATION_USER_ID as string;
const baseUrl = process.env.BASE_URL as string;

const urlForGetAwanaBooksEndpoint = `${baseUrl}/api/v1/awana-books`;

describe("Get Awana Books Endpoint", () => {
  test("should successfully return all awana books", async () => {
    const response = await fetch(urlForGetAwanaBooksEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Application-User-Id": appUserId,
      },
      body: JSON.stringify({
        includeMemoryVerses: false,
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(typeof body, "object");
    assert.ok(Array.isArray(body));
    assert.ok(body.length >= 3);

    const firstAwanaBook = body[0];
    assert.deepEqual(Object.keys(firstAwanaBook), [
      "id",
      "title",
      "ageGroup",
      "itemNumber",
      "link",
    ]);
  });

  test("should successfully return a single awana book", async () => {
    const bookId = "tt-mission-agents-of-grace-kids-handbook";
    const response = await fetch(`${urlForGetAwanaBooksEndpoint}/${bookId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Application-User-Id": appUserId,
      },
      body: JSON.stringify({
        includeMemoryVerses: true,
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(typeof body, "object");

    const { id, memoryVerses } = body;
    assert.equal(id, bookId);
    assert.ok(Array.isArray(memoryVerses));
    assert.ok(memoryVerses.length > 10);
  });

  test("should error for an invalid awana book id", async () => {
    const response = await fetch(
      `${urlForGetAwanaBooksEndpoint}/invalid-book-id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Application-User-Id": appUserId,
        },
      },
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(typeof body, "object");

    const { error, errorDescription } = body;
    assert.equal(error, "Bad Request");
    assert.match(
      errorDescription,
      /✖ Invalid option: expected one of "sparks-wingrunner-handbook"|"tt-mission-agents-of-grace-kids-handbook"|"tt-mission-discovery-of-grace-kids-handbook"\n {2}→ at awanaBookId/,
    );
  });
});
