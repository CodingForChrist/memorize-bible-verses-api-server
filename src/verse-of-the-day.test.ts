import { describe, expect, test, vi } from "vitest";

import { getVerseReferenceOfTheDay } from "./verse-of-the-day.ts";

vi.mock("./data/verse-of-the-day/verse-of-the-day-list-2025.json", () => {
  return {
    default: [
      {
        verse: "Genesis 1:1",
        date: "2025-01-01",
        formattedDate: "Wednesday, January 1, 2025",
      },
      {
        verse: "Genesis 1:2",
        date: "2025-01-02",
        formattedDate: "Thursday, January 2, 2025",
      },
      {
        verse: "Genesis 1:3",
        date: "2025-01-03",
        formattedDate: "Friday, January 3, 2025",
      },
    ],
  };
});

describe("getVerseReferenceOfTheDay()", () => {
  test("should return a verse reference in the collection", () => {
    expect(getVerseReferenceOfTheDay("2025-01-01T00:00:00+05:00")).toEqual({
      verseReference: "Genesis 1:1",
      dayOfTheYear: 1,
      formattedDate: "January 1, 2025 12:00 AM",
    });
    expect(getVerseReferenceOfTheDay("2025-01-02T00:00:00+05:00")).toEqual({
      verseReference: "Genesis 1:2",
      dayOfTheYear: 2,
      formattedDate: "January 2, 2025 12:00 AM",
    });
    expect(getVerseReferenceOfTheDay("2025-01-03T00:00:00+05:00")).toEqual({
      verseReference: "Genesis 1:3",
      dayOfTheYear: 3,
      formattedDate: "January 3, 2025 12:00 AM",
    });
  });

  test("should throw an error for an invalid date", () => {
    expect(() =>
      getVerseReferenceOfTheDay("2024-01-01T00:00:00+05:00"),
    ).toThrowError(
      /Invalid year. Supported years are 2025, 2026. Received: 2024/,
    );
    expect(() =>
      getVerseReferenceOfTheDay("2027-12-31T00:00:00+05:00"),
    ).toThrowError(
      /Invalid year. Supported years are 2025, 2026. Received: 2027/,
    );
    expect(() => getVerseReferenceOfTheDay("some bad value")).toThrowError(
      /Invalid date/,
    );
  });
});
