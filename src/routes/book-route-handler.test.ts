import assert from "node:assert/strict";
import { beforeEach, describe, test, mock } from "node:test";

import request from "supertest";
import express from "express";

import errorMiddleware from "../error-middleware.ts";

import type { Express } from "express";

mock.module("../api-bible.ts", {
  exports: {
    getBooks: mock.fn(() =>
      Promise.resolve({
        data: [
          {
            id: "GEN",
            bibleId: "32664dc3288a28df-02",
            abbreviation: "Gen",
            name: "Genesis",
            nameLong: "The First Book of Moses, Commonly Called Genesis",
          },
          {
            id: "EXO",
            bibleId: "32664dc3288a28df-02",
            abbreviation: "Exo",
            name: "Exodus",
            nameLong: "The Second Book of Moses, Commonly Called Exodus",
          },
        ],
      }),
    ),
  },
});

describe("bookRouteHandler", () => {
  let app: Express;

  beforeEach(async () => {
    const { default: bookRouteHandler } =
      await import("./book-route-handler.ts");

    app = express();
    app.use(express.json());
    app.post("/api/v1/bibles/:bibleId/books", bookRouteHandler);
    app.use(errorMiddleware);
  });

  test("should return 200 with minimal required input", async () => {
    const response = await request(app)
      .post("/api/v1/bibles/32664dc3288a28df-02/books")
      .send({});

    assert.equal(response.status, 200);
    assert.equal(Array.isArray(response.body.data), true);

    const [firstBook] = response.body.data;
    assert.equal(firstBook.name, "Genesis");
  });

  test("should return 200 with optional input", async () => {
    const response = await request(app)
      .post("/api/v1/bibles/32664dc3288a28df-02/books")
      .send({
        includeChapters: true,
        includeChaptersAndSections: false,
      });

    assert.equal(response.status, 200);
    assert.equal(Array.isArray(response.body.data), true);

    const [firstBook] = response.body.data;
    assert.equal(firstBook.name, "Genesis");
  });

  test("should return 400 for invalid bible id", async () => {
    const response = await request(app).post("/api/v1/bibles/1/books").send({});

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Bad Request");
    assert.equal(
      response.body.errorDescription,
      "✖ Too small: expected string to have >=4 characters\n  → at bibleId",
    );
  });

  test("should return 400 for invalid POST body", async () => {
    const response = await request(app)
      .post("/api/v1/bibles/32664dc3288a28df-02/books")
      .send({
        includeChapters: "invalid data",
        includeChaptersAndSections: "invalid data",
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Bad Request");
    assert.equal(
      response.body.errorDescription,
      "✖ Invalid input: expected boolean, received string\n  → at includeChapters" +
        "\n✖ Invalid input: expected boolean, received string\n  → at includeChaptersAndSections",
    );
  });
});
