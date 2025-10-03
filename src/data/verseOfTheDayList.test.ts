import { describe, expect, test } from "vitest";

import verseOfTheDayList from "./verseOfTheDayList";
import { data as books } from "./bookList.json";
import { parseVerseReferenceIntoParts } from "../bibleVerseReferenceHelper";

describe("verseOfTheDayList", () => {
  test("should not contain duplicates", () => {
    expect(verseOfTheDayList.length).toBe(new Set(verseOfTheDayList).size);
  });

  test("should spell bible book names correctly", () => {
    const bookNames = ["Psalm", ...books.map(({ name }) => name)];

    for (const verse of verseOfTheDayList) {
      const foundBook = bookNames.find((name) => {
        return verse.startsWith(name);
      });

      if (!foundBook) {
        throw new Error(`Unknown book name for verse "${verse}"`);
      }
    }
  });

  test("should be in expected verse reference format", () => {
    for (const verse of verseOfTheDayList) {
      try {
        parseVerseReferenceIntoParts(verse);
      } catch (error) {
        throw new Error(`Invalid verse format for "${verse}", ${error}`);
      }
    }
  });

  // test("should have 366 verses", () => {
  //   expect(verseOfTheDayList.length).toBe(366);
  // });
});
