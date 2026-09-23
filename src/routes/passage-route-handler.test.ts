import assert from "node:assert/strict";
import { beforeEach, describe, test, mock } from "node:test";
import request from "supertest";
import express from "express";

import errorMiddleware from "../middleware/error-middleware.ts";

import type { Express } from "express";

mock.module("../services/api-bible/index.ts", {
  exports: {
    getPassage: mock.fn(() =>
      Promise.resolve({
        data: {
          id: "ACT.3.14-ACT.3.15",
          orgId: "ACT.3.14-ACT.3.15",
          bibleId: "bba9f40183526463-01",
          bookId: "ACT",
          chapterIds: ["ACT.3"],
          reference: "Acts 3:14-15",
          content:
            '<p class="m"><span data-number="14" data-sid="ACT 3:14" class="v">14</span>You rejected the Holy and Righteous One and asked that a murderer be released to you. <span data-number="15" data-sid="ACT 3:15" class="v">15</span>You killed the Author of life, but God raised Him from the dead, and we are witnesses of the fact.</p>',
          verseCount: 2,
          copyright:
            "The Holy Bible, Berean Standard Bible, BSB is produced in cooperation with Bible Hub, Discovery Bible, OpenBible.com, and the Berean Bible Translation Committee. This text of God's Word has been dedicated to the public domain",
        },
      }),
    ),
  },
});

describe("passageRouteHandler", () => {
  let app: Express;

  beforeEach(async () => {
    const { default: passageRouteHandler } =
      await import("./passage-route-handler.ts");

    app = express();
    app.use(express.json());
    app.post(
      "/api/v1/bibles/:bibleId/passages/verse-reference",
      passageRouteHandler,
    );
    app.use(errorMiddleware);
  });

  test("should return 200 with minimal required input", async () => {
    const response = await request(app)
      .post("/api/v1/bibles/bba9f40183526463-01/passages/verse-reference")
      .send({ verseReference: "Acts 3:14-15" });

    assert.equal(response.status, 200);
    assert.equal(typeof response.body.data, "object");

    const { reference } = response.body.data;
    assert.equal(reference, "Acts 3:14-15");
  });

  test("should return 200 with optional input", async () => {
    const response = await request(app)
      .post("/api/v1/bibles/bba9f40183526463-01/passages/verse-reference")
      .send({
        verseReference: "Acts 3:14-15",
        contentType: "html",
        includeNotes: true,
        includeTitles: true,
        includeChapterNumbers: true,
        includeVerseNumbers: true,
      });

    assert.equal(response.status, 200);
    assert.equal(typeof response.body.data, "object");

    const { reference } = response.body.data;
    assert.equal(reference, "Acts 3:14-15");
  });

  test("should return 400 for invalid bible id", async () => {
    const response = await request(app)
      .post("/api/v1/bibles/1/passages/verse-reference")
      .send({ verseReference: "Acts 3:14-15" });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Bad Request");
    assert.equal(
      response.body.errorDescription,
      "✖ Too small: expected string to have >=4 characters\n  → at bibleId",
    );
  });

  test("should return 400 for invalid verse reference", async () => {
    const response = await request(app)
      .post("/api/v1/bibles/bba9f40183526463-01/passages/verse-reference")
      .send({ verseReference: "FakeBookName 3:14-15" });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Bad Request");
    assert.equal(
      response.body.errorDescription,
      '✖ Error: Failed to look up book name for "FakeBookName"\n  → at verseReference',
    );
  });

  test("should return 400 for invalid POST body", async () => {
    const response = await request(app)
      .post("/api/v1/bibles/bba9f40183526463-01/passages/verse-reference")
      .send({
        verseReference: "Acts 3:14-15",
        contentType: "unknownType",
        includeNotes: "invalid data",
        includeTitles: "invalid data",
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Bad Request");
    assert.equal(
      response.body.errorDescription,
      '✖ Invalid option: expected one of "html"|"json"|"text"\n  → at contentType' +
        "\n✖ Invalid input: expected boolean, received string\n  → at includeNotes" +
        "\n✖ Invalid input: expected boolean, received string\n  → at includeTitles",
    );
  });
});
