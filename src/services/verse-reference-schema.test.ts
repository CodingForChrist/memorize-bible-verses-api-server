import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { VerseReferenceSchema } from "./verse-reference-schema.ts";

describe("VerseReferenceSchema", () => {
  describe("Valid Reference Parsing", () => {
    for (const { input, expected } of [
      {
        input: "John 3:16",
        expected: {
          fullBookName: "John",
          bookName: "John",
          bookNumber: undefined,
          chapter: 3,
          verseNumberStart: 16,
          verseNumberEnd: 16,
          verseCount: 1,
        },
      },
      {
        input: "2 Corinthians 5:17",
        expected: {
          fullBookName: "2 Corinthians",
          bookName: "Corinthians",
          bookNumber: 2,
          chapter: 5,
          verseNumberStart: 17,
          verseNumberEnd: 17,
          verseCount: 1,
        },
      },
      {
        input: "3 John 1:4",
        expected: {
          fullBookName: "3 John",
          bookName: "John",
          bookNumber: 3,
          chapter: 1,
          verseNumberStart: 4,
          verseNumberEnd: 4,
          verseCount: 1,
        },
      },
      {
        input: "Song of Solomon 2:1-3",
        expected: {
          fullBookName: "Song of Solomon",
          bookName: "Song of Solomon",
          bookNumber: undefined,
          chapter: 2,
          verseNumberStart: 1,
          verseNumberEnd: 3,
          verseCount: 3,
        },
      },
      {
        input: "Revelation 19:13-16",
        expected: {
          fullBookName: "Revelation",
          bookName: "Revelation",
          bookNumber: undefined,
          chapter: 19,
          verseNumberStart: 13,
          verseNumberEnd: 16,
          verseCount: 4,
        },
      },
      {
        input: "GALATIANS 5:22-23",
        expected: {
          fullBookName: "Galatians",
          bookName: "Galatians",
          bookNumber: undefined,
          chapter: 5,
          verseNumberStart: 22,
          verseNumberEnd: 23,
          verseCount: 2,
        },
      },
      {
        input: "revelation 4:11",
        expected: {
          fullBookName: "Revelation",
          bookName: "Revelation",
          bookNumber: undefined,
          chapter: 4,
          verseNumberStart: 11,
          verseNumberEnd: 11,
          verseCount: 1,
        },
      },
      {
        input: "  John 3:16  ",
        expected: {
          fullBookName: "John",
          bookName: "John",
          bookNumber: undefined,
          chapter: 3,
          verseNumberStart: 16,
          verseNumberEnd: 16,
          verseCount: 1,
        },
      },
    ]) {
      test(`should successfully parse "${input}"`, () => {
        assert.deepEqual(VerseReferenceSchema.parse(input), expected);
      });
    }
  });

  describe("Invalid Reference Rejections", () => {
    for (const { input, expectedError } of [
      {
        input: "",
        expectedError: "Too small: expected string to have >=6 characters",
      },
      {
        input: "John3:16",
        expectedError: "Could not find a valid chapter number before the colon",
      },
      {
        input: "John 316",
        expectedError:
          "Missing a colon ':' to separate the chapter from the verse",
      },
      {
        input: "1John 5:4",
        expectedError: "Book number '1' must be followed by a space",
      },
      {
        input: "John 3::16",
        expectedError: "Must include only a single colon character",
      },
      {
        input: "John John 3:16",
        expectedError: "Invalid book name",
      },
      {
        input: "invalidBookName 3:16",
        expectedError: "Invalid book name",
      },
      {
        input: "Galatians 5:20-19",
        expectedError: "End verse cannot be less than start verse",
      },
      {
        input: "John 3:16-abc",
        expectedError: "Invalid verse number",
      },
      {
        input: "John abc:16",
        expectedError: "Could not find a valid chapter number before the colon",
      },
      {
        input: "John 3:16-17-18",
        expectedError: "Verse range can only contain a single dash",
      },
      {
        input: "John 3:0",
        expectedError: "Too small: expected number to be >=1",
      },
      {
        input: "John 0:16",
        expectedError: "Too small: expected number to be >=1",
      },
      {
        input: "4 Kings 1:1",
        expectedError: "Book numbers can only be 1, 2, or 3",
      },
    ]) {
      test(`should throw validation error for "${input}"`, () => {
        const { success, error } = VerseReferenceSchema.safeParse(input);
        assert.equal(success, false);

        if (success) {
          return;
        }

        assert.equal(error.issues.length > 0, true);
        assert.match(error.issues[0].message, new RegExp(expectedError, "i"));
      });
    }
  });
});
