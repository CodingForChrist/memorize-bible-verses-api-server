import assert from "node:assert/strict";
import { beforeEach, describe, test, mock } from "node:test";
import request from "supertest";
import express from "express";

import errorMiddleware from "../middleware/error-middleware.ts";

import type { Express } from "express";

mock.module("../services/api-bible/index.ts", {
  exports: {
    getVerse: mock.fn(() =>
      Promise.resolve({
        data: {
          id: "JHN.14.6",
          orgId: "JHN.14.6",
          bookId: "JHN",
          chapterId: "JHN.14",
          bibleId: "bba9f40183526463-01",
          reference: "John 14:6",
          content:
            '<p class="b"></p><p class="m">Jesus answered, “I am the way and the truth and the life. No one comes to the Father except through Me. </p>',
          verseCount: 1,
          copyright:
            "The Holy Bible, Berean Standard Bible, BSB is produced in cooperation with Bible Hub, Discovery Bible, OpenBible.com, and the Berean Bible Translation Committee. This text of God's Word has been dedicated to the public domain",
          next: {
            id: "JHN.14.7",
            number: "7",
          },
          previous: {
            id: "JHN.14.5",
            number: "5",
          },
        },
      }),
    ),
  },
});

describe("singleVerseRouteHandler", () => {
  let app: Express;

  beforeEach(async () => {
    const { default: singleVerseRouteHandler } =
      await import("./single-verse-route-handler.ts");

    app = express();
    app.use(express.json());
    app.post(
      "/api/v1/bibles/:bibleId/verses/verse-reference",
      singleVerseRouteHandler,
    );
    app.use(errorMiddleware);
  });

  test("should return 200 with minimal required input", async () => {
    const response = await request(app)
      .post("/api/v1/bibles/bba9f40183526463-01/verses/verse-reference")
      .send({ verseReference: "John 14:6" });

    assert.equal(response.status, 200);
    assert.equal(typeof response.body.data, "object");

    const { reference } = response.body.data;
    assert.equal(reference, "John 14:6");
  });

  test("should return 200 with optional input", async () => {
    const response = await request(app)
      .post("/api/v1/bibles/bba9f40183526463-01/verses/verse-reference")
      .send({
        verseReference: "John 14:6",
        contentType: "html",
        includeNotes: true,
        includeTitles: true,
        includeChapterNumbers: true,
        includeVerseNumbers: true,
      });

    assert.equal(response.status, 200);
    assert.equal(typeof response.body.data, "object");

    const { reference } = response.body.data;
    assert.equal(reference, "John 14:6");
  });

  test("should return 400 for invalid bible id", async () => {
    const response = await request(app)
      .post("/api/v1/bibles/1/verses/verse-reference")
      .send({ verseReference: "John 14:6" });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Bad Request");
    assert.equal(
      response.body.errorDescription,
      "✖ Too small: expected string to have >=4 characters\n  → at bibleId",
    );
  });

  test("should return 400 for invalid verse reference", async () => {
    const response = await request(app)
      .post("/api/v1/bibles/bba9f40183526463-01/verses/verse-reference")
      .send({ verseReference: "FakeBookName 14:6" });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Bad Request");
    assert.equal(
      response.body.errorDescription,
      '✖ Error: Failed to look up book name for "FakeBookName"\n  → at verseReference',
    );
  });

  test("should return 400 for invalid POST body", async () => {
    const response = await request(app)
      .post("/api/v1/bibles/bba9f40183526463-01/verses/verse-reference")
      .send({
        verseReference: "John 14:6",
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
