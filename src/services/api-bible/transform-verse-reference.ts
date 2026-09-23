import { parseVerseReference } from "../parse-verse-reference.ts";
import bookList from "../../data/book-list.json" with { type: "json" };

export type VerseId = `${string}.${number}.${number}`;
export type PassageId = `${VerseId}-${VerseId}` | VerseId;

export function transformVerseReferenceToVerseId(verseReference: string) {
  const { fullBookName, chapter, verseNumberStart } =
    parseVerseReference(verseReference);

  const bookId = findBookIdByBookName(fullBookName);

  const verseId: VerseId = `${bookId}.${chapter}.${verseNumberStart}`;
  return verseId;
}

export function transformVerseReferenceToPassageId(verseReference: string) {
  const {
    fullBookName,
    chapter,
    verseNumberStart,
    verseNumberEnd,
    verseCount,
  } = parseVerseReference(verseReference);
  const bookId = findBookIdByBookName(fullBookName);

  if (verseCount > 1) {
    const passageId: PassageId = `${bookId}.${chapter}.${verseNumberStart}-${bookId}.${chapter}.${verseNumberEnd}`;
    return passageId;
  }

  const singleVersePassageId: PassageId = `${bookId}.${chapter}.${verseNumberStart}`;
  return singleVersePassageId;
}

function normalizeBookName(bookName: string) {
  if (bookName === "Psalm") {
    return "Psalms";
  }
  if (bookName === "Revelations") {
    return "Revelation";
  }
  return bookName;
}

function findBookIdByBookName(bookName: string) {
  const foundBook = bookList.data.find((book) => {
    return book.name === normalizeBookName(bookName);
  });

  if (!foundBook) {
    throw new Error(`Failed to look up book name for "${bookName}"`);
  }

  return foundBook.id;
}
