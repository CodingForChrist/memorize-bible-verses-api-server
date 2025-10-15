import { describe, expect, test } from "vitest";

import verseOfTheDayList from "./verseOfTheDayList.ts";
import bookList from "./bookList.json" with { type: "json" };
import { parseVerseReferenceIntoParts } from "../bibleVerseReferenceHelper.ts";

describe("verseOfTheDayList", () => {
  test("should not contain duplicates", () => {
    expect(verseOfTheDayList.length).toBe(new Set(verseOfTheDayList).size);
  });

  test("should have 366 verses", () => {
    expect(verseOfTheDayList.length).toBe(366);
  });
});

describe.for(verseOfTheDayList)("validate verse %s", (verse) => {
  test("should spell bible book name correctly", () => {
    const bookNames = ["Psalm", ...bookList.data.map(({ name }) => name)];
    const foundBook = bookNames.find((name) => {
      return verse.startsWith(name);
    });

    if (!foundBook) {
      throw new Error(`Unknown book name for verse "${verse}"`);
    }
  });

  test("should be in expected verse reference format", () => {
    try {
      parseVerseReferenceIntoParts(verse);
    } catch (error) {
      throw new Error(`Invalid verse format for "${verse}", ${error}`);
    }
  });

  test("should not be longer than 4 verses", () => {
    const { verseCount } = parseVerseReferenceIntoParts(verse);
    if (verseCount > 4) {
      throw new Error(
        `verse reference range contains too many verses ${verse}`,
      );
    }
  });
});
