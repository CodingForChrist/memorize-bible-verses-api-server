import { describe, expect, test, vi } from "vitest";

import { getDayOfYear, getVerseReferenceOfTheDay } from "./verseOfTheDay";

vi.mock("./data/verseOfTheDayList.json", () => {
  return {
    default: ["Genesis 1:1", "John 3:16", "Psalm 23:1"],
  };
});

describe("getDayOfYear()", () => {
  test("should return the expected day of the year", () => {
    expect(getDayOfYear(new Date("2024-01-01T11:00:00+05:00"))).toBe(1);
    expect(getDayOfYear(new Date("2024-01-20T11:00:00+05:00"))).toBe(20);
    expect(getDayOfYear(new Date("2024-02-01T11:00:00+05:00"))).toBe(32);
    expect(getDayOfYear(new Date("2024-03-01T11:00:00+05:00"))).toBe(61);
    // 2024 is a leap year
    expect(getDayOfYear(new Date("2024-12-31T11:00:00+05:00"))).toBe(366);
  });
});

describe("getVerseReferenceOfTheDay()", () => {
  test("should return a verse reference in the collection", () => {
    expect(
      getVerseReferenceOfTheDay(new Date("2024-01-01T11:00:00+05:00")),
    ).toBe("Genesis 1:1");
    expect(
      getVerseReferenceOfTheDay(new Date("2024-01-02T11:00:00+05:00")),
    ).toBe("John 3:16");
    expect(
      getVerseReferenceOfTheDay(new Date("2024-01-03T11:00:00+05:00")),
    ).toBe("Psalm 23:1");
    // loop back to the beginning of the collection
    expect(
      getVerseReferenceOfTheDay(new Date("2024-01-04T11:00:00+05:00")),
    ).toBe("Genesis 1:1");
  });
});
