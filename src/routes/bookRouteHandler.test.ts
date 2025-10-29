import { beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import express from "express";

import bookRouteHandler from "./bookRouteHandler.ts";
import errorMiddleware from "../errorMiddleware.ts";

import type { Express } from "express";

vi.mock("../apiBible.ts", () => ({
  getBooks: vi.fn(() =>
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
}));

describe("bookRouteHandler", () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post("/api/v1/bibles/:bibleId/books", bookRouteHandler);
    app.use(errorMiddleware);
  });

  test("should return 200 with minimal required input", async () => {
    const response = await request(app)
      .post("/api/v1/bibles/32664dc3288a28df-02/books")
      .send({});

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);

    const [firstBook] = response.body.data;
    expect(firstBook.name).toBe("Genesis");
  });

  test("should return 200 with optional input", async () => {
    const response = await request(app)
      .post("/api/v1/bibles/32664dc3288a28df-02/books")
      .send({
        includeChapters: true,
        includeChaptersAndSections: false,
      });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);

    const [firstBook] = response.body.data;
    expect(firstBook.name).toBe("Genesis");
  });

  test("should return 400 for invalid bible id", async () => {
    const response = await request(app).post("/api/v1/bibles/1/books").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Bad Request",
      errorDescription:
        "✖ Too small: expected string to have >=4 characters\n  → at bibleId",
    });
  });

  test("should return 400 for invalid POST body", async () => {
    const response = await request(app)
      .post("/api/v1/bibles/32664dc3288a28df-02/books")
      .send({
        includeChapters: "invalid data",
        includeChaptersAndSections: "invalid data",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Bad Request",
      errorDescription:
        "✖ Invalid input: expected boolean, received string\n  → at includeChapters" +
        "\n✖ Invalid input: expected boolean, received string\n  → at includeChaptersAndSections",
    });
  });
});
