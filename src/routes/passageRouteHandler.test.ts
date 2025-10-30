import { beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import express from "express";

import passageRouteHandler from "./passageRouteHandler.ts";
import errorMiddleware from "../errorMiddleware.ts";

import type { Express } from "express";

vi.mock("../apiBible.ts", () => ({
  getPassage: vi.fn(() =>
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
}));

describe("passageRouteHandler", () => {
  let app: Express;

  beforeEach(() => {
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

    expect(response.status).toBe(200);
    expect(typeof response.body.data).toBe("object");

    const { reference } = response.body.data;
    expect(reference).toBe("Acts 3:14-15");
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

    expect(response.status).toBe(200);
    expect(typeof response.body.data).toBe("object");

    const { reference } = response.body.data;
    expect(reference).toBe("Acts 3:14-15");
  });

  test("should return 400 for invalid bible id", async () => {
    const response = await request(app)
      .post("/api/v1/bibles/1/passages/verse-reference")
      .send({ verseReference: "Acts 3:14-15" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Bad Request",
      errorDescription:
        "✖ Too small: expected string to have >=4 characters\n  → at bibleId",
    });
  });

  test("should return 400 for invalid verse reference", async () => {
    const response = await request(app)
      .post("/api/v1/bibles/bba9f40183526463-01/passages/verse-reference")
      .send({ verseReference: "FakeBookName 3:14-15" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Bad Request",
      errorDescription:
        '✖ Error: Failed to look up book name for "FakeBookName"\n  → at verseReference',
    });
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

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Bad Request",
      errorDescription:
        '✖ Invalid option: expected one of "html"|"json"|"text"\n  → at contentType' +
        "\n✖ Invalid input: expected boolean, received string\n  → at includeNotes" +
        "\n✖ Invalid input: expected boolean, received string\n  → at includeTitles",
    });
  });
});
