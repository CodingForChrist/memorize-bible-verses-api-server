import { writeFile } from "node:fs/promises";
import "dotenv/config";

import { getBibles } from "../apiBible.ts";

const biblesIds = [
  {
    id: "b8ee27bcd1cae43a-01",
    abbreviationLocal: "NASB 1995",
  },
  {
    id: "a761ca71e0b3ddcf-01",
    abbreviationLocal: "NASB",
  },
  {
    id: "bba9f40183526463-01",
    abbreviationLocal: "BSB",
  },
  {
    id: "de4e12af7f28f599-02",
    abbreviationLocal: "KJV",
  },
  {
    id: "06125adad2d5898a-01",
    abbreviationLocal: "ASV",
  },
  {
    id: "9879dbb7cfe39e4d-04",
    abbreviationLocal: "WEB",
  },
  {
    id: "63097d2a0a2f7db3-01",
    abbreviationLocal: "NKJV",
  },
];

const bibleList = await getBibles({
  includeFullDetails: true,
  language: "eng",
  ids: biblesIds.map((b) => b.id).join(","),
});

const __dirname = import.meta.dirname;

try {
  await writeFile(
    `${__dirname}/../data/bibleList.json`,
    JSON.stringify(bibleList, null, 2),
    { encoding: "utf-8" },
  );

  console.log("✅  Bible list has been updated");
  process.exitCode = 0;
} catch (error) {
  console.error("Error writing bible list file:", error);
  process.exitCode = 1;
}
