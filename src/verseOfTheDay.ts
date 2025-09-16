import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";

dayjs.extend(dayOfYear);
dayjs.extend(localizedFormat);
dayjs.extend(utc);

import verseOfTheDayList from "./data/verseOfTheDayList.json";

export function getVerseReferenceOfTheDay(
  dateISOStringWithTimezoneOffset: string,
) {
  const originalTimezone = dateISOStringWithTimezoneOffset.slice(-6);
  const dayjsDate = dayjs(dateISOStringWithTimezoneOffset).utcOffset(
    originalTimezone,
  );

  const dayOfTheYear = dayjsDate.dayOfYear();
  const dayOfTheYearIndex = dayOfTheYear - 1;

  let verseReference: string;

  if (dayOfTheYearIndex < verseOfTheDayList.length) {
    verseReference = verseOfTheDayList[dayOfTheYearIndex];
  } else {
    // TODO: add more verse references to get to 366
    verseReference =
      verseOfTheDayList[dayOfTheYearIndex - verseOfTheDayList.length];
  }

  return {
    verseReference,
    dayOfTheYear,
    formattedDate: dayjsDate.format("LLL"),
  };
}
