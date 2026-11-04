import { describe, test } from "node:test";
import assert from "node:assert/strict";

const appUserId = process.env.APPLICATION_USER_ID as string;
const baseUrl = process.env.BASE_URL as string;

const urlForGetBiblesEndpoint = `${baseUrl}/api/v1/bibles`;

describe("Get Bibles Endpoint", () => {
  test("should successfully return all bibles", async () => {
    const response = await fetch(urlForGetBiblesEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Application-User-Id": appUserId,
      },
      body: JSON.stringify({
        language: "eng",
        includeFullDetails: false,
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(typeof body, "object");
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 20);

    const firstBible = body.data[0];
    assert.deepEqual(Object.keys(firstBible), [
      "id",
      "dblId",
      "abbreviation",
      "abbreviationLocal",
      "name",
      "nameLocal",
      "description",
      "descriptionLocal",
      "relatedDbl",
      "type",
      "updatedAt",
      "language",
      "countries",
      "audioBibles",
    ]);
  });

  test("should successfully return a single bible", async () => {
    const response = await fetch(urlForGetBiblesEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Application-User-Id": appUserId,
      },
      body: JSON.stringify({
        // Berean Standard Bible (BSB)
        ids: ["bba9f40183526463-01"],
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(typeof body, "object");
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length === 1);
  });

  test("should error for an invalid language code", async () => {
    const response = await fetch(urlForGetBiblesEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Application-User-Id": appUserId,
      },
      body: JSON.stringify({
        // language codes should be 3 characters
        language: "english",
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(typeof body, "object");

    const { error, errorDescription } = body;
    assert.equal(error, "Bad Request");
    assert.match(
      errorDescription,
      /✖ Too big: expected string to have exactly 3 characters\n {2}→ at language/,
    );
  });
});
