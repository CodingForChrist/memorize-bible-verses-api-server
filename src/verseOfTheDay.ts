import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";

dayjs.extend(dayOfYear);

import verseOfTheDayList from "./data/verseOfTheDayList.json";

export function getVerseReferenceOfTheDay(
  dateISOStringWithTimezoneOffset: string,
) {
  const dayOfYearIndex = dayjs(dateISOStringWithTimezoneOffset).dayOfYear() - 1;

  // TODO: add more verse references to get to 366
  if (dayOfYearIndex >= verseOfTheDayList.length) {
    return verseOfTheDayList[dayOfYearIndex - verseOfTheDayList.length];
  }

  return verseOfTheDayList[dayOfYearIndex];
}
