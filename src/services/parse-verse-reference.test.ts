import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { parseVerseReference } from "./parse-verse-reference.ts";

describe("parseVerseReference()", () => {
  test("should get parts for valid verse reference", () => {
    assert.deepEqual(parseVerseReference("Galatians 2:20"), {
      bookName: "Galatians",
      bookNumber: undefined,
      chapter: 2,
      fullBookName: "Galatians",
      verseCount: 1,
      verseNumberEnd: 20,
      verseNumberStart: 20,
    });
    assert.deepEqual(parseVerseReference("2 Corithians 5:17"), {
      bookName: "Corithians",
      bookNumber: 2,
      chapter: 5,
      fullBookName: "2 Corithians",
      verseCount: 1,
      verseNumberEnd: 17,
      verseNumberStart: 17,
    });

    assert.deepEqual(parseVerseReference("Song of Solomon 2:1"), {
      bookName: "Song of Solomon",
      bookNumber: undefined,
      chapter: 2,
      fullBookName: "Song of Solomon",
      verseCount: 1,
      verseNumberEnd: 1,
      verseNumberStart: 1,
    });

    assert.deepEqual(parseVerseReference("3 John 1:7-8"), {
      bookName: "John",
      bookNumber: 3,
      chapter: 1,
      fullBookName: "3 John",
      verseCount: 2,
      verseNumberEnd: 8,
      verseNumberStart: 7,
    });
  });

  test("should throw an error for an invalid verse reference", () => {
    // @ts-expect-error passing a number instead of a string
    assert.throws(() => parseVerseReference(3456), {
      message: "Verse reference must be a string",
    });

    assert.throws(() => parseVerseReference("Job"), {
      message: "Verse reference must be at least 5 characters",
    });

    assert.throws(() => parseVerseReference("12 Corinthians 5:17"), {
      message: "Book number must be a single digit followed by a space",
    });

    assert.throws(() => parseVerseReference("4 John 1:1"), {
      message: 'Invalid book number "4"',
    });

    assert.throws(() => parseVerseReference("1 11111"), {
      message: "Failed to parse book name out of the verse reference",
    });

    assert.throws(() => parseVerseReference("invalid-data"), {
      message:
        "Must include a single space to separate the book name from the chapter",
    });

    assert.throws(() => parseVerseReference("invalid data"), {
      message:
        "Must include a single space to separate the book name from the chapter",
    });

    assert.throws(() => parseVerseReference("Genesis 1A:1"), {
      message: "Chapter must be a number",
    });

    assert.throws(() => parseVerseReference("Genesis 1:A"), {
      message: "Verse must be a number",
    });
  });
});
