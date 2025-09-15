import verseOfTheDayList from "./data/verseOfTheDayList.json";

export function getDayOfYear(date: Date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff =
    date.getTime() -
    start.getTime() +
    (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  return day;
}

export function getVerseReferenceOfTheDay(date: Date = new Date()) {
  const dayOfYearIndex = getDayOfYear(date) - 1;

  // TODO: add more verse references to get to 366
  if (dayOfYearIndex >= verseOfTheDayList.length) {
    return verseOfTheDayList[dayOfYearIndex - verseOfTheDayList.length];
  }

  return verseOfTheDayList[dayOfYearIndex];
}
