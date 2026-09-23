export function parseVerseReference(verseReference: string) {
  if (typeof verseReference !== "string") {
    throw new TypeError("Verse reference must be a string");
  }

  if (verseReference.length < 5) {
    throw new TypeError("Verse reference must be at least 5 characters");
  }

  let bookNumber;
  let verseReferenceWithoutBookNumber = verseReference;

  // get book number
  if (Number.isSafeInteger(Number(verseReference.charAt(0)))) {
    if (verseReference.charAt(1) !== " ") {
      throw new Error("Book number must be a single digit followed by a space");
    }

    if (["1", "2", "3"].includes(verseReference.charAt(0))) {
      verseReferenceWithoutBookNumber = verseReference.slice(1).trim();
      bookNumber = Number(verseReference.charAt(0));
    } else {
      throw new Error(`Invalid book number "${verseReference.charAt(0)}"`);
    }
  }

  // get book name
  const bookNameRegExpMatchArray =
    verseReferenceWithoutBookNumber.match(/[a-zA-Z ]+/);
  if (!bookNameRegExpMatchArray) {
    throw new Error("Failed to parse book name out of the verse reference");
  }
  const bookName = bookNameRegExpMatchArray[0].trim();
  const fullBookName = bookNumber ? `${bookNumber} ${bookName}` : bookName;

  const spaceIndex = verseReference.indexOf(fullBookName) + fullBookName.length;
  if (verseReference.charAt(spaceIndex) !== " ") {
    throw new Error(
      "Must include a single space to separate the book name from the chapter",
    );
  }

  // get chapter and verse
  const chapterAndVerses = verseReferenceWithoutBookNumber
    .split(bookName, 2)[1]
    .trim();

  if (chapterAndVerses.match(/:/g)?.length !== 1) {
    throw new Error(
      "Must include a single colon character to separate the chapter from the verse",
    );
  }

  const [chapter, verseResult] = chapterAndVerses.split(":", 2);
  const [verseNumberStart, verseNumberEnd] = verseResult.includes("-")
    ? verseResult.split("-")
    : [verseResult, verseResult];

  if (!Number.isSafeInteger(Number(chapter))) {
    throw new TypeError("Chapter must be a number");
  }

  if (
    !Number.isSafeInteger(Number(verseNumberStart)) ||
    !Number.isSafeInteger(Number(verseNumberEnd))
  ) {
    throw new TypeError("Verse must be a number");
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
