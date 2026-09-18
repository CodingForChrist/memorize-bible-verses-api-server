import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  parseVerseReferenceIntoParts,
  transformVerseReferenceToVerseId,
  transformVerseReferenceToPassageId,
} from "./bible-verse-reference-helper.ts";

describe("parseVerseReferenceIntoParts()", () => {
  test("should get parts for valid verse reference", () => {
    assert.deepEqual(parseVerseReferenceIntoParts("Galatians 2:20"), {
      bookName: "Galatians",
      bookNumber: undefined,
      chapter: 2,
      fullBookName: "Galatians",
      verseCount: 1,
      verseNumberEnd: 20,
      verseNumberStart: 20,
    });
    assert.deepEqual(parseVerseReferenceIntoParts("2 Corithians 5:17"), {
      bookName: "Corithians",
      bookNumber: 2,
      chapter: 5,
      fullBookName: "2 Corithians",
      verseCount: 1,
      verseNumberEnd: 17,
      verseNumberStart: 17,
    });

    assert.deepEqual(parseVerseReferenceIntoParts("Song of Solomon 2:1"), {
      bookName: "Song of Solomon",
      bookNumber: undefined,
      chapter: 2,
      fullBookName: "Song of Solomon",
      verseCount: 1,
      verseNumberEnd: 1,
      verseNumberStart: 1,
    });

    assert.deepEqual(parseVerseReferenceIntoParts("3 John 1:7-8"), {
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
    assert.throws(() => parseVerseReferenceIntoParts(3456), {
      message: "Verse reference must be a string",
    });

    assert.throws(() => parseVerseReferenceIntoParts("Job"), {
      message: "Verse reference must be at least 5 characters",
    });

    assert.throws(() => parseVerseReferenceIntoParts("12 Corinthians 5:17"), {
      message: "Book number must be a single digit followed by a space",
    });

    assert.throws(() => parseVerseReferenceIntoParts("4 John 1:1"), {
      message: 'Invalid book number "4"',
    });

    assert.throws(() => parseVerseReferenceIntoParts("1 11111"), {
      message: "Failed to parse book name out of the verse reference",
    });

    assert.throws(() => parseVerseReferenceIntoParts("invalid-data"), {
      message:
        "Must include a single space to separate the book name from the chapter",
    });

    assert.throws(() => parseVerseReferenceIntoParts("invalid data"), {
      message:
        "Must include a single space to separate the book name from the chapter",
    });

    assert.throws(() => parseVerseReferenceIntoParts("Genesis 1A:1"), {
      message: "Chapter must be a number",
    });

    assert.throws(() => parseVerseReferenceIntoParts("Genesis 1:A"), {
      message: "Verse must be a number",
    });
  });
});

describe("transformVerseReferenceToVerseId()", () => {
  test("should get verseId for valid verse reference", () => {
    assert.equal(transformVerseReferenceToVerseId("Psalms 23:1"), "PSA.23.1");
    assert.equal(transformVerseReferenceToVerseId("Psalm 23:1"), "PSA.23.1");
    assert.equal(
      transformVerseReferenceToVerseId("Revelation 3:20"),
      "REV.3.20",
    );
    assert.equal(
      transformVerseReferenceToVerseId("Revelations 3:20"),
      "REV.3.20",
    );
    assert.equal(
      transformVerseReferenceToVerseId("Galatians 2:20"),
      "GAL.2.20",
    );
    assert.equal(
      transformVerseReferenceToVerseId("2 Corinthians 5:17"),
      "2CO.5.17",
    );
  });

  test("should throw an error for an invalid verse reference", () => {
    // Corthians is purposely misspelled and should be Corinthians
    assert.throws(() => transformVerseReferenceToVerseId("2 Corthians 5:17"), {
      message: 'Failed to look up book name for "2 Corthians"',
    });
  });
});

describe("transformVerseReferenceToPassageId()", () => {
  test("should get passageId for valid verse reference", () => {
    assert.equal(
      transformVerseReferenceToPassageId("Psalm 23:1-6"),
      "PSA.23.1-PSA.23.6",
    );
    assert.equal(
      transformVerseReferenceToPassageId("2 Corinthians 5:17"),
      "2CO.5.17",
    );
  });

  test("should throw an error for an invalid verse reference", () => {
    // Corthians is purposely misspelled and should be Corinthians
    assert.throws(
      () => transformVerseReferenceToPassageId("2 Corthians 5:17"),
      {
        message: 'Failed to look up book name for "2 Corthians"',
      },
    );
  });
});
