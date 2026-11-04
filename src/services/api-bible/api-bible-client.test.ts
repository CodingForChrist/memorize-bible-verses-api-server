import assert from "node:assert/strict";
import { beforeEach, describe, test, mock } from "node:test";

import { ApiBibleClient } from "./api-bible-client.ts";

import bibleListFixtureData from "../../data/bible-list.json" with { type: "json" };
import bookListFixtureData from "../../data/book-list.json" with { type: "json" };

process.env.BIBLE_API_KEY = "test-value";

const bible = {
  id: "b8ee27bcd1cae43a-01",
  abbreviationLocal: "NASB 1995",
};

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

describe("getBibles()", () => {
  const mockedFetch = mock.fn(async (_url) =>
    mockResponse(200, bibleListFixtureData),
  );
  beforeEach(() => {
    mockedFetch.mock.resetCalls();
  });

  test("does not require any input", async () => {
    const apiBibleClient = new ApiBibleClient({
      bibleClientFetch: mockedFetch,
    });
    await apiBibleClient.getBibles();
    assert.equal(mockedFetch.mock.calls.length, 1);

    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(
      firstCall.arguments[0],
      "https://rest.api.bible/v1/bibles?language=eng&include-full-details=false",
    );
  });

  test("supports optional input", async () => {
    const apiBibleClient = new ApiBibleClient({
      bibleClientFetch: mockedFetch,
    });
    await apiBibleClient.getBibles({
      language: "eng",
      ids: ["de4e12af7f28f599-02", "32664dc3288a28df-02"],
      includeFullDetails: true,
    });

    assert.equal(mockedFetch.mock.calls.length, 1);

    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(
      firstCall.arguments[0],
      "https://rest.api.bible/v1/bibles?language=eng&ids=de4e12af7f28f599-02%2C32664dc3288a28df-02&include-full-details=true",
    );
  });

  test("throws an error for a non-200 status code", async () => {
    mockedFetch.mock.mockImplementationOnce(async () =>
      mockResponse(400, { message: "Bad Request" }),
    );
    const apiBibleClient = new ApiBibleClient({
      bibleClientFetch: mockedFetch,
    });
    await assert.rejects(async () => await apiBibleClient.getBibles(), {
      message: "Bad Request",
    });
  });

  test("caches successful responses", async () => {
    const apiBibleClient = new ApiBibleClient({
      bibleClientFetch: mockedFetch,
    });

    const cacheKey = "getBibles_{includeFullDetails:false,language:eng}";

    assert.equal(apiBibleClient.cache.get(cacheKey), undefined);
    await apiBibleClient.getBibles();

    assert.equal(mockedFetch.mock.calls.length, 1);
    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(
      firstCall.arguments[0],
      "https://rest.api.bible/v1/bibles?language=eng&include-full-details=false",
    );

    mockedFetch.mock.resetCalls();

    // the cache should contain the response data after the first call
    assert.deepEqual(apiBibleClient.cache.get(cacheKey), bibleListFixtureData);

    // should read value from cache instead of fetching from api
    const cachedData = await apiBibleClient.getBibles();
    assert.equal(mockedFetch.mock.calls.length, 0);
    assert.deepEqual(cachedData, bibleListFixtureData);
  });
});

describe("getBooks()", () => {
  const mockedFetch = mock.fn(async (_url) =>
    mockResponse(200, bookListFixtureData),
  );
  beforeEach(() => {
    mockedFetch.mock.resetCalls();
  });

  test("uses default values", async () => {
    const apiBibleClient = new ApiBibleClient({
      bibleClientFetch: mockedFetch,
    });
    await apiBibleClient.getBooks(bible.id);
    assert.equal(mockedFetch.mock.calls.length, 1);

    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(
      firstCall.arguments[0],
      "https://rest.api.bible/v1/bibles/b8ee27bcd1cae43a-01/books?include-chapters=false&include-chapters-and-sections=false",
    );
  });

  test("supports optional input", async () => {
    const apiBibleClient = new ApiBibleClient({
      bibleClientFetch: mockedFetch,
    });
    await apiBibleClient.getBooks(bible.id, {
      includeChapters: true,
      includeChaptersAndSections: true,
    });

    assert.equal(mockedFetch.mock.calls.length, 1);

    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(
      firstCall.arguments[0],
      "https://rest.api.bible/v1/bibles/b8ee27bcd1cae43a-01/books?include-chapters=true&include-chapters-and-sections=true",
    );
  });

  test("throws an error for a non-200 status code", async () => {
    mockedFetch.mock.mockImplementationOnce(async () =>
      mockResponse(400, { message: "Bad Request" }),
    );
    const apiBibleClient = new ApiBibleClient({
      bibleClientFetch: mockedFetch,
    });
    await assert.rejects(async () => await apiBibleClient.getBooks(bible.id), {
      message: "Bad Request",
    });
  });

  test("caches successful responses", async () => {
    const apiBibleClient = new ApiBibleClient({
      bibleClientFetch: mockedFetch,
    });

    const cacheKey =
      "getBooks_b8ee27bcd1cae43a-01_{includeChapters:false,includeChaptersAndSections:false}";

    assert.equal(apiBibleClient.cache.get(cacheKey), undefined);
    await apiBibleClient.getBooks(bible.id);

    assert.equal(mockedFetch.mock.calls.length, 1);
    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(
      firstCall.arguments[0],
      "https://rest.api.bible/v1/bibles/b8ee27bcd1cae43a-01/books?include-chapters=false&include-chapters-and-sections=false",
    );

    mockedFetch.mock.resetCalls();

    // the cache should contain the response data after the first call
    assert.deepEqual(apiBibleClient.cache.get(cacheKey), bookListFixtureData);

    // should read value from cache instead of fetching from api
    const cachedData = await apiBibleClient.getBooks(bible.id);
    assert.equal(mockedFetch.mock.calls.length, 0);
    assert.deepEqual(cachedData, bookListFixtureData);
  });
});

describe("getPassage()", () => {
  const passageFixtureData = {
    data: {
      id: "GAL.5.22-GAL.5.23",
      orgId: "GAL.5.22-GAL.5.23",
      bibleId: "b8ee27bcd1cae43a-01",
      bookId: "GAL",
      chapterIds: ["GAL.5"],
      reference: "Galatians 5:22-23",
      content:
        "     [22] But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness,faithfulness,  [23] gentleness, self-control; against such things there is no law. \n",
      verseCount: 2,
      copyright:
        "NEW AMERICAN STANDARD BIBLE® NASB® Copyright © 1960,1962,1963,1968,1971,1972,1973,1975,1977,1995 by The Lockman Foundation A Corporation Not for Profit La Habra, CA All Rights Reserved www.lockman.org",
    },
  };
  const mockedFetch = mock.fn(async (_url) =>
    mockResponse(200, passageFixtureData),
  );
  beforeEach(() => {
    mockedFetch.mock.resetCalls();
  });

  test("uses default values", async () => {
    const apiBibleClient = new ApiBibleClient({
      bibleClientFetch: mockedFetch,
    });
    await apiBibleClient.getPassage(bible.id, "GAL.5.22-GAL.5.23");
    assert.equal(mockedFetch.mock.calls.length, 1);

    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(
      firstCall.arguments[0],
      "https://rest.api.bible/v1/bibles/b8ee27bcd1cae43a-01/passages/GAL.5.22-GAL.5.23?content-type=json&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false",
    );
  });

  test("supports optional input", async () => {
    const apiBibleClient = new ApiBibleClient({
      bibleClientFetch: mockedFetch,
    });
    await apiBibleClient.getPassage(bible.id, "GAL.5.22-GAL.5.23", {
      contentType: "html",
      includeNotes: true,
    });

    assert.equal(mockedFetch.mock.calls.length, 1);

    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(
      firstCall.arguments[0],
      "https://rest.api.bible/v1/bibles/b8ee27bcd1cae43a-01/passages/GAL.5.22-GAL.5.23?content-type=html&include-notes=true&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false",
    );
  });

  test("throws an error for a non-200 status code", async () => {
    mockedFetch.mock.mockImplementationOnce(async () =>
      mockResponse(400, { message: "Bad Request" }),
    );
    const apiBibleClient = new ApiBibleClient({
      bibleClientFetch: mockedFetch,
    });
    await assert.rejects(
      async () =>
        await apiBibleClient.getPassage(bible.id, "GAL.5.22-GAL.5.23"),
      {
        message: "Bad Request",
      },
    );
  });

  test("caches successful responses", async () => {
    const apiBibleClient = new ApiBibleClient({
      bibleClientFetch: mockedFetch,
    });

    const cacheKey =
      "getPassage_b8ee27bcd1cae43a-01_GAL.5.22-GAL.5.23_{contentType:json,includeChapterNumbers:false,includeNotes:false,includeTitles:false,includeVerseNumbers:false,includeVerseSpans:false}";

    assert.equal(apiBibleClient.cache.get(cacheKey), undefined);
    await apiBibleClient.getPassage(bible.id, "GAL.5.22-GAL.5.23");

    assert.equal(mockedFetch.mock.calls.length, 1);
    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(
      firstCall.arguments[0],
      "https://rest.api.bible/v1/bibles/b8ee27bcd1cae43a-01/passages/GAL.5.22-GAL.5.23?content-type=json&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false",
    );

    mockedFetch.mock.resetCalls();

    // the cache should contain the response data after the first call
    assert.deepEqual(apiBibleClient.cache.get(cacheKey), passageFixtureData);

    // should read value from cache instead of fetching from api
    const cachedData = await apiBibleClient.getPassage(
      bible.id,
      "GAL.5.22-GAL.5.23",
    );
    assert.equal(mockedFetch.mock.calls.length, 0);
    assert.deepEqual(cachedData, passageFixtureData);
  });
});
