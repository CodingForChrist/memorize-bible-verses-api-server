import { describe, test } from "node:test";
import assert from "node:assert/strict";

const baseUrl = process.env.BASE_URL as string;
const urlForHealthEndpoint = `${baseUrl}/health`;

describe("Health Check Endpoint", () => {
  test("status should be UP", async () => {
    const response = await fetch(urlForHealthEndpoint, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(typeof body, "object");

    const { status, checks } = body;

    assert.equal(status, "UP");
    assert.equal(checks.apiBible.status, "UP");
  });
});
