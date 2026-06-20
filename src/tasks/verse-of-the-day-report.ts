import { parseVerseReferenceIntoParts } from "../bible-verse-reference-helper.ts";
import bookList from "../data/book-list.json" with { type: "json" };

import bookCategories from "../data/book-categories.json" with { type: "json" };
import verseOfTheDayList2026 from "../data/verse-of-the-day/verse-of-the-day-list-2026.json" with { type: "json" };

import dayjs from "dayjs";

type Verse = {
  verse: string;
  date: string;
  formattedDate: string;
  plan?: string;
  description?: string;
};

const oldTestamentBookNames = new Set(
  bookList.data.slice(0, 39).map(({ name }) => name),
);
oldTestamentBookNames.delete("Psalms");
oldTestamentBookNames.add("Psalm");

const newTestamentBookNames = new Set(
  bookList.data.slice(39).map(({ name }) => name),
);

function groupVersesByMonth() {
  return Object.groupBy(verseOfTheDayList2026, ({ date }) => {
    const dayjsDate = dayjs(date);
    return dayjsDate.format("MMMM");
  }) as Record<string, Verse[]>;
}

function getVerseCountByTestament(verses: Verse[]) {
  const results = {
    oldTestamentCount: 0,
    newTestamentCount: 0,
  };

  for (const { verse } of verses) {
    const { fullBookName } = parseVerseReferenceIntoParts(verse);
    if (oldTestamentBookNames.has(fullBookName)) {
      results.oldTestamentCount += 1;
    } else if (newTestamentBookNames.has(fullBookName)) {
      results.newTestamentCount += 1;
    } else {
      throw new Error(`Book name not found for verse: ${verse}`);
    }
  }
  return results;
}

function getVerseCountByCategory(verses: Verse[]) {
  const oldTestamentCategoryCount = new Map<string, number>();
  const newTestamentCategoryCount = new Map<string, number>();

  for (const { verse } of verses) {
    const { fullBookName } = parseVerseReferenceIntoParts(verse);

    if (oldTestamentBookNames.has(fullBookName)) {
      for (const { categoryName, bookNames } of bookCategories.oldTestament) {
        if (!oldTestamentCategoryCount.has(categoryName)) {
          oldTestamentCategoryCount.set(categoryName, 0);
        }

        if (bookNames.includes(fullBookName)) {
          const currentCount = oldTestamentCategoryCount.get(categoryName) || 0;
          oldTestamentCategoryCount.set(categoryName, currentCount + 1);
        }
      }
    } else {
      for (const { categoryName, bookNames } of bookCategories.newTestament) {
        if (!newTestamentCategoryCount.has(categoryName)) {
          newTestamentCategoryCount.set(categoryName, 0);
        }

        if (bookNames.includes(fullBookName)) {
          const currentCount = newTestamentCategoryCount.get(categoryName) || 0;
          newTestamentCategoryCount.set(categoryName, currentCount + 1);
        }
      }
    }
  }

  return {
    oldTestamentCategoryCount: {
      ...Object.fromEntries(oldTestamentCategoryCount),
    },
    newTestamentCategoryCount: {
      ...Object.fromEntries(newTestamentCategoryCount),
    },
  };
}

function getVerseCountByBook(verses: Verse[]) {
  const counterMap = new Map<string, number>();

  for (const { verse } of verses) {
    const { fullBookName } = parseVerseReferenceIntoParts(verse);
    const currentCount = counterMap.get(fullBookName) || 0;
    counterMap.set(fullBookName, currentCount + 1);
  }

  const sortedResults: Record<string, number> = {};

  for (const { name } of bookList.data) {
    const bookCount = counterMap.get(name);
    if (bookCount) {
      sortedResults[name] = bookCount;
    }
  }

  return sortedResults;
}

function printReport() {
  const report = [];
  for (const [monthName, verses] of Object.entries(groupVersesByMonth())) {
    report.push({
      monthName,
      ...getVerseCountByTestament(verses),
      ...getVerseCountByCategory(verses),
      ...getVerseCountByBook(verses),
    });
  }

  return report;
}

console.log(printReport());
