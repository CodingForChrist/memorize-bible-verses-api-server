import assert from "node:assert/strict";
import { describe, test, mock } from "node:test";

import { getVerseReferenceOfTheDay } from "./verse-of-the-day.ts";

const verseOfTheDayList = [
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
];

mock.module("../data/verse-of-the-day/verse-of-the-day-list-2025.json", {
  exports: {
    default: verseOfTheDayList,
  },
});

describe("getVerseReferenceOfTheDay()", () => {
  test("should return a verse reference in the collection", () => {
    assert.deepEqual(getVerseReferenceOfTheDay("2025-01-01T00:00:00+05:00"), {
      verseReference: "Genesis 1:1",
      dayOfTheYear: 1,
      formattedDate: "January 1, 2025 12:00 AM",
    });
    assert.deepEqual(getVerseReferenceOfTheDay("2025-01-02T00:00:00+05:00"), {
      verseReference: "Genesis 1:2",
      dayOfTheYear: 2,
      formattedDate: "January 2, 2025 12:00 AM",
    });
    assert.deepEqual(getVerseReferenceOfTheDay("2025-01-03T00:00:00+05:00"), {
      verseReference: "Genesis 1:3",
      dayOfTheYear: 3,
      formattedDate: "January 3, 2025 12:00 AM",
    });
  });

  test("should throw an error for an invalid date", () => {
    assert.throws(
      () => getVerseReferenceOfTheDay("2024-01-01T00:00:00+05:00"),
      {
        message: "Invalid year. Supported years are 2025, 2026. Received: 2024",
      },
    );
    assert.throws(
      () => getVerseReferenceOfTheDay("2027-12-31T00:00:00+05:00"),
      {
        message: "Invalid year. Supported years are 2025, 2026. Received: 2027",
      },
    );
    assert.throws(() => getVerseReferenceOfTheDay("some bad value"), {
      message: "Invalid date. Received: some bad value",
    });
  });
});
