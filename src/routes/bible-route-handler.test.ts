import assert from "node:assert/strict";
import { beforeEach, describe, test, mock } from "node:test";
import request from "supertest";
import express from "express";

import errorMiddleware from "../error-middleware.ts";

import type { Express } from "express";

mock.module("../services/api-bible/index.ts", {
  exports: {
    getBibles: mock.fn(() =>
      Promise.resolve({
        data: [
          {
            id: "bba9f40183526463-01",
            name: "Berean Standard Bible",
            nameLocal: "English: Berean Standard Bible",
            abbreviation: "BSB",
            abbreviationLocal: "BSB",
            description: "Berean Standard Bible",
            descriptionLocal: "English: Berean Standard Bible",
            type: "text",
            updatedAt: "2025-10-01T02:35:46.000Z",
          },
        ],
      }),
    ),
  },
});

describe("bibleRouteHandler", () => {
  let app: Express;

  beforeEach(async () => {
    const { default: bibleRouteHandler } =
      await import("./bible-route-handler.ts");

    app = express();
    app.use(express.json());
    app.post("/api/v1/bibles", bibleRouteHandler);
    app.use(errorMiddleware);
  });

  test("should return 200 with minimal required input", async () => {
    const response = await request(app).post("/api/v1/bibles").send({});

    assert.equal(response.status, 200);
    assert.equal(Array.isArray(response.body.data), true);

    const [firstBible] = response.body.data;
    assert.equal(firstBible.name, "Berean Standard Bible");
  });

  test("should return 200 with optional input", async () => {
    const response = await request(app).post("/api/v1/bibles").send({
      ids: "bba9f40183526463-01,de4e12af7f28f599-02,b8ee27bcd1cae43a-01",
      includeFullDetails: true,
      language: "eng",
    });

    assert.equal(response.status, 200);
    assert.equal(Array.isArray(response.body.data), true);

    const [firstBible] = response.body.data;
    assert.equal(firstBible.name, "Berean Standard Bible");
  });

  test("should return 400 for invalid POST body", async () => {
    const response = await request(app).post("/api/v1/bibles").send({
      includeFullDetails: "invalid data",
      language: "english", // should be 3-letter code
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Bad Request");
    assert.equal(
      response.body.errorDescription,
      "✖ Too big: expected string to have exactly 3 characters\n  → at language" +
        "\n✖ Invalid input: expected boolean, received string\n  → at includeFullDetails",
    );
  });
});
