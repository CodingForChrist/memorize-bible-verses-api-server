import { describe, expect, test } from "vitest";
import dayjs from "dayjs";
import isLeapYear from "dayjs/plugin/isLeapYear.js";
import dayOfYear from "dayjs/plugin/dayOfYear.js";

import { parseVerseReferenceIntoParts } from "../../bible-verse-reference-helper.ts";

import verseOfTheDayList2025 from "./verse-of-the-day-list-2025.json" with { type: "json" };
import verseOfTheDayList2026 from "./verse-of-the-day-list-2026.json" with { type: "json" };
import bookList from "../book-list.json" with { type: "json" };

dayjs.extend(isLeapYear);
dayjs.extend(dayOfYear);

type VerseOfTheDayList = {
  verse: string;
  date: string;
  formattedDate: string;
  plan?: string;
  description?: string;
}[];

describe.for([
  ["2025", verseOfTheDayList2025],
  ["2026", verseOfTheDayList2026],
] as [string, VerseOfTheDayList][])(
  "verses for year %s",
  ([year, verseOfTheDayList]) => {
    const verses = verseOfTheDayList.map(({ verse }) => verse);

    test("should not contain duplicate verses", () => {
      expect(verses.length).toBe(new Set(verses).size);
    });

    test("should have one verse for each day of the year", () => {
      if (dayjs(`${year}-01-01`).isLeapYear()) {
        expect(verses.length).toBe(366);
      } else {
        expect(verses.length).toBe(365);
      }
    });

    test("date should match array index for day of year", () => {
      for (const [
        index,
        { date, formattedDate },
      ] of verseOfTheDayList.entries()) {
        const dayjsDate = dayjs(date);
        expect(dayjsDate.dayOfYear() - 1).toBe(index);
        expect(dayjsDate.format("dddd, MMMM D, YYYY")).toBe(formattedDate);
      }
    });

    describe.for(verses)("validate verse %s", (verse) => {
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
  },
);
