import { describe, expect, test, vi } from "vitest";

import { getVerseReferenceOfTheDay } from "./verseOfTheDay";

vi.mock("./data/verseOfTheDayList.json", () => {
  return {
    default: ["Genesis 1:1", "John 3:16", "Psalm 23:1"],
  };
});

describe("getVerseReferenceOfTheDay()", () => {
  test("should return a verse reference in the collection", () => {
    expect(getVerseReferenceOfTheDay("2024-01-01T11:00:00+05:00")).toBe(
      "Genesis 1:1",
    );
    expect(getVerseReferenceOfTheDay("2024-01-02T11:00:00+05:00")).toBe(
      "John 3:16",
    );
    expect(getVerseReferenceOfTheDay("2024-01-03T11:00:00+05:00")).toBe(
      "Psalm 23:1",
    );
    // loop back to the beginning of the collection
    expect(getVerseReferenceOfTheDay("2024-01-04T11:00:00+05:00")).toBe(
      "Genesis 1:1",
    );
  });
});
