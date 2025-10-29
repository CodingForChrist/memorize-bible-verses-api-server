import { beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import express from "express";

import bibleRouteHandler from "./bibleRouteHandler.ts";
import errorMiddleware from "../errorMiddleware.ts";

import type { Express } from "express";

vi.mock("../apiBible.ts", () => ({
  getBibles: vi.fn(() =>
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
}));

describe("bibleRouteHandler", () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post("/api/v1/bibles", bibleRouteHandler);
    app.use(errorMiddleware);
  });

  test("should return 200 with minimal required input", async () => {
    const response = await request(app).post("/api/v1/bibles").send({});

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);

    const [firstBible] = response.body.data;
    expect(firstBible.name).toBe("Berean Standard Bible");
  });

  test("should return 200 with optional input", async () => {
    const response = await request(app).post("/api/v1/bibles").send({
      ids: "bba9f40183526463-01,de4e12af7f28f599-02,b8ee27bcd1cae43a-01",
      includeFullDetails: true,
      language: "eng",
    });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);

    const [firstBible] = response.body.data;
    expect(firstBible.name).toBe("Berean Standard Bible");
  });

  test("should return 400 for invalid POST body", async () => {
    const response = await request(app).post("/api/v1/bibles").send({
      includeFullDetails: "invalid data",
      language: "english", // should be 3-letter code
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Bad Request",
      errorDescription:
        "✖ Too big: expected string to have <=3 characters\n  → at language" +
        "\n✖ Invalid input: expected boolean, received string\n  → at includeFullDetails",
    });
  });
});
