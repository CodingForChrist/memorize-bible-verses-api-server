import assert from "node:assert/strict";
import { describe, test } from "node:test";
import dayjs from "dayjs";
import isLeapYear from "dayjs/plugin/isLeapYear.js";
import dayOfYear from "dayjs/plugin/dayOfYear.js";

import { parseVerseReferenceIntoParts } from "../../bible-verse-reference-helper.ts";

import verseOfTheDayList2025 from "./verse-of-the-day-list-2025.json" with { type: "json" };
import verseOfTheDayList2026 from "./verse-of-the-day-list-2026.json" with { type: "json" };
import bookList from "../book-list.json" with { type: "json" };

dayjs.extend(isLeapYear);
dayjs.extend(dayOfYear);

function getBibleBookNames() {
  return bookList.data.map(({ name }) => {
    if (name === "Psalms") {
      return "Psalm";
    }
    return name;
  });
}

for (const { year, verseOfTheDayList } of [
  { year: "2025", verseOfTheDayList: verseOfTheDayList2025 },
  { year: "2026", verseOfTheDayList: verseOfTheDayList2026 },
]) {
  describe(`verse-of-the-day list for year ${year}`, () => {
    const verses = verseOfTheDayList.map(({ verse }) => verse);

    test("should not contain duplicate verses", () => {
      const duplicates = verses.filter((verse, index) => {
        return verses.indexOf(verse) !== index;
      });

      assert.equal(
        duplicates.length,
        0,
        `found duplicates: ${duplicates.toString()}`,
      );
    });

    test("should have one verse for each day of the year", () => {
      if (dayjs(`${year}-01-01`).isLeapYear()) {
        assert.equal(verses.length, 366);
      } else {
        assert.equal(verses.length, 365);
      }
    });

    test("should have at least one verse from each book", () => {
      const missingBooks: string[] = [];
      for (const bookName of getBibleBookNames()) {
        const hasBook = verseOfTheDayList.some(({ verse }) => {
          return verse.startsWith(bookName);
        });

        if (!hasBook) {
          missingBooks.push(bookName);
        }
      }

      assert.equal(
        missingBooks.length,
        0,
        `no verses found for the following books: ${missingBooks.toString()}`,
      );
    });

    test("date should match array index for day of year", () => {
      for (const [
        index,
        { date, formattedDate },
      ] of verseOfTheDayList.entries()) {
        const dayjsDate = dayjs(date);
        assert.equal(dayjsDate.dayOfYear() - 1, index);
        assert.equal(dayjsDate.format("dddd, MMMM D, YYYY"), formattedDate);
      }
    });
    for (const verse of verses) {
      describe(`validate verse ${verse}`, () => {
        test("should spell bible book name correctly", () => {
          const hasBook = getBibleBookNames().some((name) => {
            return verse.startsWith(name);
          });

          if (!hasBook) {
            throw new Error(`Unknown book name for verse "${verse}"`);
          }
        });

        test("should be in expected verse reference format", () => {
          try {
            parseVerseReferenceIntoParts(verse);
          } catch (error) {
            throw new Error(`Invalid verse format for "${verse}"`, {
              cause: error,
            });
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
    }
  });
}
