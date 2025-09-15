import { data as books } from "./data/bookList.json";

export type VerseId = `${string}.${number}.${number}`;
export type PassageId = `${VerseId}-${VerseId}` | VerseId;

export type SingleVerseReference =
  | `${string} ${number}:${number}`
  | `${number} ${string} ${number}:${number}`;

export type VerseReferenceRange =
  | `${string} ${number}:${number}-${number}`
  | `${number} ${string} ${number}:${number}-${number}`;

export function parseVerseReferenceIntoParts(
  verseReference: SingleVerseReference | VerseReferenceRange,
) {
  let bookNumber;
  let verseReferenceWithoutBookNumber = verseReference;

  // get book number
  if (Number.isInteger(Number(verseReference.charAt(0)))) {
    if (verseReference.charAt(1) !== " ") {
      throw new Error("Book number must be a single digit followed by a space");
    }

    if (Object.keys(["1", "2", "3"]).includes(verseReference.charAt(0))) {
      verseReferenceWithoutBookNumber = verseReference
        .substring(1)
        .trim() as SingleVerseReference;
      bookNumber = Number(verseReference.charAt(0));
    } else {
      throw new Error(`Invalid book number "${verseReference.charAt(0)}"`);
    }
  }

  // get book name
  const bookNameRegExpMatchArray =
    verseReferenceWithoutBookNumber.match(/[a-zA-Z]+/);
  if (!bookNameRegExpMatchArray) {
    throw new Error("Failed to parse book name out of the verse reference");
  }
  const bookName = bookNameRegExpMatchArray[0];
  const fullBookName = bookNumber ? `${bookNumber} ${bookName}` : bookName;

  const spaceIndex = verseReference.indexOf(fullBookName) + fullBookName.length;
  if (verseReference.charAt(spaceIndex) !== " ") {
    throw new Error(
      "Must include a single space to separate the book name from the chapter",
    );
  }

  // get chapter and verse
  const chapterAndVerses = verseReferenceWithoutBookNumber
    .split(bookName)[1]
    .trim();

  if (chapterAndVerses.match(/:/g)?.length !== 1) {
    throw new Error(
      "Must include a single colon character to separate the chapter from the verse",
    );
  }

  const [chapter, verseResult] = chapterAndVerses.split(":");
  const [verseNumberStart, verseNumberEnd] = verseResult.includes("-")
    ? verseResult.split("-")
    : [verseResult, verseResult];

  if (!Number.isInteger(Number(chapter))) {
    throw new Error("Chapter must be a number");
  }

  if (
    !Number.isInteger(Number(verseNumberStart)) ||
    !Number.isInteger(Number(verseNumberEnd))
  ) {
    throw new Error("Verse must be a number");
  }

  const verseCount = 1 + Number(verseNumberEnd) - Number(verseNumberStart);

  return {
    fullBookName,
    bookName,
    bookNumber,
    chapter: Number(chapter),
    verseNumberStart: Number(verseNumberStart),
    verseNumberEnd: Number(verseNumberEnd),
    verseCount,
  };
}

export function transformVerseReferenceToVerseId(
  verseReference: SingleVerseReference,
) {
  const { fullBookName, chapter, verseNumberStart } =
    parseVerseReferenceIntoParts(verseReference);

  const bookId = findBookIdByBookName(fullBookName);

  const verseId: VerseId = `${bookId}.${chapter}.${verseNumberStart}`;
  return verseId;
}

export function transformVerseReferenceToPassageId(
  verseReference: SingleVerseReference | VerseReferenceRange,
) {
  const {
    fullBookName,
    chapter,
    verseNumberStart,
    verseNumberEnd,
    verseCount,
  } = parseVerseReferenceIntoParts(verseReference);
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
  return bookName;
}

function findBookIdByBookName(bookName: string) {
  const foundBook = books.find((book) => {
    return book.name === normalizeBookName(bookName);
  });

  if (!foundBook) {
    throw new Error(`Failed to look up book name for "${bookName}"`);
  }

  return foundBook.id;
}
