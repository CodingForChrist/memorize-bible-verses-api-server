import { describe, expect, test } from "vitest";

import {
  parseVerseReferenceIntoParts,
  transformVerseReferenceToVerseId,
  transformVerseReferenceToPassageId,
} from "./bible-verse-reference-helper.ts";

describe("parseVerseReferenceIntoParts()", () => {
  test("should get parts for valid verse reference", () => {
    expect(parseVerseReferenceIntoParts("Galatians 2:20")).toEqual({
      bookName: "Galatians",
      bookNumber: undefined,
      chapter: 2,
      fullBookName: "Galatians",
      verseCount: 1,
      verseNumberEnd: 20,
      verseNumberStart: 20,
    });
    expect(parseVerseReferenceIntoParts("2 Corithians 5:17")).toEqual({
      bookName: "Corithians",
      bookNumber: 2,
      chapter: 5,
      fullBookName: "2 Corithians",
      verseCount: 1,
      verseNumberEnd: 17,
      verseNumberStart: 17,
    });

    expect(parseVerseReferenceIntoParts("Song of Solomon 2:1")).toEqual({
      bookName: "Song of Solomon",
      bookNumber: undefined,
      chapter: 2,
      fullBookName: "Song of Solomon",
      verseCount: 1,
      verseNumberEnd: 1,
      verseNumberStart: 1,
    });

    expect(parseVerseReferenceIntoParts("3 John 1:7-8")).toEqual({
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
    expect(() => parseVerseReferenceIntoParts("111")).toThrowError(
      /Book number must be a single digit followed by a space/,
    );

    expect(() => parseVerseReferenceIntoParts("4 John 1:1")).toThrowError(
      /Invalid book number "4"/,
    );

    expect(() => parseVerseReferenceIntoParts("1 11")).toThrowError(
      /Failed to parse book name out of the verse reference/,
    );

    expect(() => parseVerseReferenceIntoParts("invalid-data")).toThrowError(
      /Must include a single space to separate the book name from the chapter/,
    );

    expect(() => parseVerseReferenceIntoParts("invalid data")).toThrowError(
      /Must include a single space to separate the book name from the chapter/,
    );

    expect(() => parseVerseReferenceIntoParts("Genesis 1A:1")).toThrowError(
      /Chapter must be a number/,
    );

    expect(() => parseVerseReferenceIntoParts("Genesis 1:A")).toThrowError(
      /Verse must be a number/,
    );
  });
});

describe("transformVerseReferenceToVerseId()", () => {
  test("should get verseId for valid verse reference", () => {
    expect(transformVerseReferenceToVerseId("Psalms 23:1")).toBe("PSA.23.1");
    expect(transformVerseReferenceToVerseId("Psalm 23:1")).toBe("PSA.23.1");
    expect(transformVerseReferenceToVerseId("Revelation 3:20")).toBe(
      "REV.3.20",
    );
    expect(transformVerseReferenceToVerseId("Revelations 3:20")).toBe(
      "REV.3.20",
    );
    expect(transformVerseReferenceToVerseId("Galatians 2:20")).toBe("GAL.2.20");
    expect(transformVerseReferenceToVerseId("2 Corinthians 5:17")).toBe(
      "2CO.5.17",
    );
  });

  test("should throw an error for an invalid verse reference", () => {
    // Corthians is purposely misspelled and should be Corinthians
    expect(() =>
      transformVerseReferenceToVerseId("2 Corthians 5:17"),
    ).toThrowError(/Failed to look up book name for "2 Corthians"/);
  });
});

describe("transformVerseReferenceToPassageId()", () => {
  test("should get passageId for valid verse reference", () => {
    expect(transformVerseReferenceToPassageId("Psalm 23:1-6")).toBe(
      "PSA.23.1-PSA.23.6",
    );
    expect(transformVerseReferenceToPassageId("2 Corinthians 5:17")).toBe(
      "2CO.5.17",
    );
  });

  test("should throw an error for an invalid verse reference", () => {
    // Corthians is purposely misspelled and should be Corinthians
    expect(() =>
      transformVerseReferenceToPassageId("2 Corthians 5:17"),
    ).toThrowError(/Failed to look up book name for "2 Corthians"/);
  });
});
