import { writeFile } from "node:fs/promises";
import { getBooks } from "../services/api-bible/index.ts";

const bible = {
  id: "b8ee27bcd1cae43a-01",
  abbreviationLocal: "NASB 1995",
};

const bookList = await getBooks(bible.id);

const __dirname = import.meta.dirname;

try {
  await writeFile(
    `${__dirname}/../data/book-list.json`,
    JSON.stringify(bookList, undefined, 2),
    { encoding: "utf8" },
  );

  console.log("✅  Book list has been updated");
  process.exitCode = 0;
} catch (error) {
  console.error("Error writing book list file:", error);
  process.exitCode = 1;
}
