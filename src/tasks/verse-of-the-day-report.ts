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

function groupVersesByMonth() {
  return Object.groupBy(verseOfTheDayList2026, ({ date }) => {
    const dayjsDate = dayjs(date);
    return dayjsDate.format("MMMM");
  });
}

function getVerseCountByTestament(verses: Verse[]) {
  const results = {
    oldTestamentCount: 0,
    newTestamentCount: 0,
  };

  let oldTestamentBookNames: string[] = [];
  let newTestamentBookNames: string[] = [];

  for (const { bookNames } of bookCategories.oldTestament) {
    oldTestamentBookNames = [...oldTestamentBookNames, ...bookNames];
  }

  for (const { bookNames } of bookCategories.newTestament) {
    newTestamentBookNames = [...newTestamentBookNames, ...bookNames];
  }

  for (const { verse } of verses) {
    const { fullBookName } = parseVerseReferenceIntoParts(verse);
    if (oldTestamentBookNames.includes(fullBookName)) {
      results.oldTestamentCount += 1;
    } else if (newTestamentBookNames.includes(fullBookName)) {
      results.newTestamentCount += 1;
    } else {
      throw new Error(`Book name not found for verse: ${verse}`);
    }
  }
  return results;
}

function getVerseCountByCategory(verses: Verse[]) {
  const results = {};

  for (const [testament, categories] of Object.entries(bookCategories)) {
    results[testament] = [];

    for (const { verse } of verses) {
      const { fullBookName } = parseVerseReferenceIntoParts(verse);
      for (const { categoryName, bookNames } of categories) {
        if (!results[testament][categoryName]) {
          results[testament][categoryName] = 0;
        }

        if (bookNames.includes(fullBookName)) {
          results[testament][categoryName] += 1;
        }
      }
    }
  }

  return results;
}

function getVerseCountByBook(verses: Verse[]) {
  const results: Record<string, number> = {};

  for (const { verse } of verses) {
    const { fullBookName } = parseVerseReferenceIntoParts(verse);
    if (results[fullBookName]) {
      results[fullBookName] += 1;
    } else {
      results[fullBookName] = 1;
    }
  }

  const sortedResults: Record<string, number> = {};

  for (const { name } of bookList.data) {
    if (results[name]) {
      sortedResults[name] = results[name];
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
