import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear.js";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import utc from "dayjs/plugin/utc.js";

import verseOfTheDayList2025 from "./data/verseOfTheDay/verseOfTheDayList2025.json" with { type: "json" };
import verseOfTheDayList2026 from "./data/verseOfTheDay/verseOfTheDayList2026.json" with { type: "json" };

dayjs.extend(dayOfYear);
dayjs.extend(localizedFormat);
dayjs.extend(utc);

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

  if ([2025, 2026].includes(year) === false) {
    throw new Error(
      `Only years 2025 and 2026 are supported. Received: ${year}`,
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
