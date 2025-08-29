import { describe, expect, test } from "vitest";

import {
  parseVerseReferenceIntoParts,
  transformVerseReferenceToVerseId,
  transformVerseReferenceToPassageId,
} from "./bibleVerseReferenceHelper";

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
  });

  test("should throw an error for an invalid verse reference", () => {
    expect(() =>
      // @ts-expect-error invalid input
      parseVerseReferenceIntoParts("111"),
    ).toThrowError(/Book number must be a single digit followed by a space/);

    expect(() => parseVerseReferenceIntoParts("4 John 1:1")).toThrowError(
      /Invalid book number "4"/,
    );

    expect(() =>
      // @ts-expect-error invalid input
      parseVerseReferenceIntoParts("1 11"),
    ).toThrowError(/Failed to parse book name out of the verse reference/);

    expect(() =>
      // @ts-expect-error invalid input
      parseVerseReferenceIntoParts("invalid-data"),
    ).toThrowError(
      /Must include a single space to separate the book name from the chapter/,
    );

    expect(() =>
      // @ts-expect-error invalid input
      parseVerseReferenceIntoParts("invalid data"),
    ).toThrowError(
      /Must include a single colon character to separate the chapter from the verse/,
    );

    expect(() =>
      // @ts-expect-error invalid input
      parseVerseReferenceIntoParts("Genesis A:1"),
    ).toThrowError(/Chapter must be a number/);

    expect(() =>
      // @ts-expect-error invalid input
      parseVerseReferenceIntoParts("Genesis 1:A"),
    ).toThrowError(/Verse must be a number/);
  });
});

describe("transformVerseReferenceToVerseId()", () => {
  test("should get verseId for valid verse reference", () => {
    expect(transformVerseReferenceToVerseId("Psalm 23:1")).toBe("PSA.23.1");
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
