import { describe, expect, test, vi } from "vitest";

import { getVerseReferenceOfTheDay } from "./verseOfTheDay";

vi.mock("./data/verseOfTheDayList.json", () => {
  return {
    default: ["Genesis 1:1", "John 3:16", "Psalm 23:1"],
  };
});

describe("getVerseReferenceOfTheDay()", () => {
  test("should return a verse reference in the collection", () => {
    expect(getVerseReferenceOfTheDay("2024-01-01T00:00:00+05:00")).toEqual({
      verseReference: "Genesis 1:1",
      dayOfTheYear: 1,
      formattedDate: "January 1, 2024 12:00 AM",
    });
    expect(getVerseReferenceOfTheDay("2024-01-02T00:00:00+05:00")).toEqual({
      verseReference: "John 3:16",
      dayOfTheYear: 2,
      formattedDate: "January 2, 2024 12:00 AM",
    });
    expect(getVerseReferenceOfTheDay("2024-01-03T00:00:00+05:00")).toEqual({
      verseReference: "Psalm 23:1",
      dayOfTheYear: 3,
      formattedDate: "January 3, 2024 12:00 AM",
    });
    // loop back to the beginning of the collection
    expect(getVerseReferenceOfTheDay("2024-01-04T00:00:00+05:00")).toEqual({
      verseReference: "Genesis 1:1",
      dayOfTheYear: 4,
      formattedDate: "January 4, 2024 12:00 AM",
    });
  });
});
