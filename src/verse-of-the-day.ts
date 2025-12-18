import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear.js";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import utc from "dayjs/plugin/utc.js";

import verseOfTheDayList2025 from "./data/verse-of-the-day/verse-of-the-day-list-2025.json" with { type: "json" };
import verseOfTheDayList2026 from "./data/verse-of-the-day/verse-of-the-day-list-2026.json" with { type: "json" };

dayjs.extend(dayOfYear);
dayjs.extend(localizedFormat);
dayjs.extend(utc);

const supportedYears = [2025, 2026];

export function getVerseReferenceOfTheDay(
  dateISOStringWithTimezoneOffset: string,
) {
  const originalTimezone = dateISOStringWithTimezoneOffset.slice(-6);
  const dayjsDate = dayjs(dateISOStringWithTimezoneOffset).utcOffset(
    originalTimezone,
  );

  if (dayjsDate.isValid() === false) {
    throw new Error(
      `Invalid date. Received: ${dateISOStringWithTimezoneOffset}`,
    );
  }

  const year = dayjsDate.year();

  if (supportedYears.includes(year) === false) {
    throw new Error(
      `Invalid year. Supported years are ${supportedYears.join(", ")}. Received: ${year}`,
    );
  }

  const verseOfTheDayList =
    year === 2025 ? verseOfTheDayList2025 : verseOfTheDayList2026;

  const dayOfTheYear = dayjsDate.dayOfYear();
  const dayOfTheYearIndex = dayOfTheYear - 1;

  const verseReference = verseOfTheDayList[dayOfTheYearIndex].verse;

  return {
    verseReference,
    dayOfTheYear,
    formattedDate: dayjsDate.format("LLL"),
  };
}

export function getVerseList(year: number) {
  if (supportedYears.includes(year) === false) {
    throw new Error(
      `Invalid year. Supported years are ${supportedYears.join(", ")}. Received: ${year}`,
    );
  }

  const verseOfTheDayList =
    year === 2025 ? verseOfTheDayList2025 : verseOfTheDayList2026;

  return verseOfTheDayList;
}
