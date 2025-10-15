import { writeFileSync } from "node:fs";
import dayjs from "dayjs";

import verseOfTheDayList from "../data/verseOfTheDayList.ts";

let date = dayjs("2024-12-31");

const outputArray = verseOfTheDayList.map((verse) => {
  date = date.add(1, "day");

  return {
    verse,
    date: date.format("dddd, MMMM D, YYYY"),
  };
});

const __dirname = import.meta.dirname;

writeFileSync(
  `${__dirname}/../data/verseOfTheDay/verseOfTheDayList2025.json`,
  JSON.stringify(outputArray, null, 2),
  { encoding: "utf-8" },
);
