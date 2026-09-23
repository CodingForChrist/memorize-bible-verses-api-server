import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  transformVerseReferenceToVerseId,
  transformVerseReferenceToPassageId,
} from "./transform-verse-reference.ts";

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
