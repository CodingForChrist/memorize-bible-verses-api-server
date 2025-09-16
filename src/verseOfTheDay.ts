import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(dayOfYear);
dayjs.extend(localizedFormat);

import verseOfTheDayList from "./data/verseOfTheDayList.json";

export function getVerseReferenceOfTheDay(
  dateISOStringWithTimezoneOffset: string,
) {
  const dayOfTheYear = dayjs(dateISOStringWithTimezoneOffset).dayOfYear();
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
    formattedDate: dayjs(dateISOStringWithTimezoneOffset).format("LLL"),
  };
}
