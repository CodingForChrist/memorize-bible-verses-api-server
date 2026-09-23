import assert from "node:assert/strict";
import { beforeEach, describe, test, mock } from "node:test";

process.env.PINO_LOG_LEVEL = "error";
process.env.BIBLE_API_KEY = "test-value";

import { ApiBibleClient } from "./api-bible-client.ts";

function createFetchResponse(data: Record<string, unknown>) {
  return Promise.resolve({
    ok: true,
    json: () => new Promise((resolve) => resolve(data)),
  } as Response);
}

describe("getBibles()", () => {
  const mockedFetch = mock.fn(createFetchResponse);
  beforeEach(() => {
    mockedFetch.mock.resetCalls();
    mock.method(globalThis, "fetch", mockedFetch);
  });

  test("does not require any input", async () => {
    const apiBibleClient = new ApiBibleClient();
    await apiBibleClient.getBibles();
    assert.equal(mockedFetch.mock.calls.length, 1);

    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(
      firstCall.arguments[0],
      "https://rest.api.bible/v1/bibles?language=eng&include-full-details=false",
    );
  });

  test("formats optional input into kebab-case query string parameters", async () => {
    const apiBibleClient = new ApiBibleClient();
    await apiBibleClient.getBibles({
      language: "eng",
      ids: "de4e12af7f28f599-02,32664dc3288a28df-02",
      includeFullDetails: true,
    });

    assert.equal(mockedFetch.mock.calls.length, 1);

    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(
      firstCall.arguments[0],
      "https://rest.api.bible/v1/bibles?language=eng&include-full-details=true&ids=de4e12af7f28f599-02%2C32664dc3288a28df-02",
    );
  });

  test("throws an error for a non-200 status code", async () => {
    const errorResponse = {
      ok: false,
      status: 400,
      statusText: "Bad Request",
    } as Response;

    mockedFetch.mock.mockImplementationOnce(() =>
      Promise.resolve(errorResponse),
    );
    const apiBibleClient = new ApiBibleClient();
    await assert.rejects(async () => await apiBibleClient.getBibles(), {
      message:
        "Request failed with status code 400 Bad Request: https://rest.api.bible/v1/bibles?language=eng&include-full-details=false",
    });
  });

  test("caches successful responses", async () => {
    const mockResponseData = {
      data: [
        {
          id: "bba9f40183526463-01",
          dblId: "bba9f40183526463",
          name: "Berean Standard Bible",
          nameLocal: "English: Berean Standard Bible",
          abbreviation: "BSB",
          abbreviationLocal: "BSB",
          description: "Berean Standard Bible",
          descriptionLocal: "English: Berean Standard Bible",
          language: {
            id: "eng",
            name: "English",
            nameLocal: "English",
            script: "Latin",
            scriptDirection: "LTR",
          },
          countries: [
            {
              id: "US",
              name: "United States of America",
              nameLocal: "United States of America",
            },
            {
              id: "GB",
              name: "United Kingdom of Great Britain and Northern Ireland",
              nameLocal: "United Kingdom of Great Britain and Northern Ireland",
            },
          ],
        },
      ],
    };
    const requestURL =
      "https://rest.api.bible/v1/bibles?language=eng&include-full-details=false";

    mockedFetch.mock.mockImplementationOnce(() =>
      createFetchResponse(mockResponseData),
    );

    const apiBibleClient = new ApiBibleClient();

    assert.equal(apiBibleClient.cache.get(requestURL), undefined);
    await apiBibleClient.getBibles();

    assert.equal(mockedFetch.mock.calls.length, 1);
    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(firstCall.arguments[0], requestURL);

    mockedFetch.mock.resetCalls();

    // the cache should contain the response data after the first call
    assert.deepEqual(apiBibleClient.cache.get(requestURL), mockResponseData);

    // should read value from cache instead of fetching from api
    const cachedData = await apiBibleClient.getBibles();
    assert.equal(mockedFetch.mock.calls.length, 0);
    assert.deepEqual(cachedData, mockResponseData);
  });
});

describe("getBooks()", () => {
  const mockedFetch = mock.fn(createFetchResponse);
  beforeEach(() => {
    mockedFetch.mock.resetCalls();
    mock.method(globalThis, "fetch", mockedFetch);
  });

  test("uses default values", async () => {
    const apiBibleClient = new ApiBibleClient();
    await apiBibleClient.getBooks({
      bibleId: "de4e12af7f28f599-02",
    });

    assert.equal(mockedFetch.mock.calls.length, 1);

    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(
      firstCall.arguments[0],
      "https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/books?include-chapters=false&include-chapters-and-sections=false",
    );
  });

  test("supports optional input", async () => {
    const apiBibleClient = new ApiBibleClient();
    await apiBibleClient.getBooks({
      bibleId: "de4e12af7f28f599-02",
      includeChapters: true,
      includeChaptersAndSections: true,
    });

    assert.equal(mockedFetch.mock.calls.length, 1);

    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(
      firstCall.arguments[0],
      "https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/books?include-chapters=true&include-chapters-and-sections=true",
    );
  });

  test("throws an error for a non-200 status code", async () => {
    const errorResponse = {
      ok: false,
      status: 400,
      statusText: "Bad Request",
    } as Response;

    mockedFetch.mock.mockImplementationOnce(() =>
      Promise.resolve(errorResponse),
    );
    const apiBibleClient = new ApiBibleClient();

    await assert.rejects(
      async () =>
        await apiBibleClient.getBooks({ bibleId: "de4e12af7f28f599-02" }),
      {
        message:
          "Request failed with status code 400 Bad Request: https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/books?include-chapters=false&include-chapters-and-sections=false",
      },
    );
  });

  test("caches successful responses", async () => {
    const mockResponseData = {
      data: [
        {
          id: "GEN",
          bibleId: "32664dc3288a28df-02",
          abbreviation: "Gen",
          name: "Genesis",
          nameLong: "The First Book of Moses, Commonly Called Genesis",
        },
        {
          id: "EXO",
          bibleId: "32664dc3288a28df-02",
          abbreviation: "Exo",
          name: "Exodus",
          nameLong: "The Second Book of Mosis, Commonly Called Exodus",
        },
      ],
    };

    const requestURL =
      "https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/books?include-chapters=false&include-chapters-and-sections=false";

    mockedFetch.mock.mockImplementationOnce(() =>
      createFetchResponse(mockResponseData),
    );

    const apiBibleClient = new ApiBibleClient();

    assert.equal(apiBibleClient.cache.get(requestURL), undefined);
    await apiBibleClient.getBooks({
      bibleId: "de4e12af7f28f599-02",
    });

    assert.equal(mockedFetch.mock.calls.length, 1);
    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(firstCall.arguments[0], requestURL);

    mockedFetch.mock.resetCalls();

    // the cache should contain the response data after the first call
    assert.deepEqual(apiBibleClient.cache.get(requestURL), mockResponseData);

    // should read value from cache instead of fetching from api
    const cachedData = await apiBibleClient.getBooks({
      bibleId: "de4e12af7f28f599-02",
    });
    assert.equal(mockedFetch.mock.calls.length, 0);
    assert.deepEqual(cachedData, mockResponseData);
  });
});

describe("getVerse()", () => {
  const mockedFetch = mock.fn(createFetchResponse);
  beforeEach(() => {
    mockedFetch.mock.resetCalls();
    mock.method(globalThis, "fetch", mockedFetch);
  });

  test("uses default values", async () => {
    const apiBibleClient = new ApiBibleClient();
    await apiBibleClient.getVerse({
      bibleId: "de4e12af7f28f599-02",
      verseId: "1JN.1.9",
    });

    assert.equal(mockedFetch.mock.calls.length, 1);

    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(
      firstCall.arguments[0],
      "https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/verses/1JN.1.9?content-type=json&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false&use-org-id=false",
    );
  });

  test("supports optional input", async () => {
    const apiBibleClient = new ApiBibleClient();
    await apiBibleClient.getVerse({
      bibleId: "de4e12af7f28f599-02",
      verseId: "1JN.1.9",
      contentType: "html",
      includeNotes: true,
    });

    assert.equal(mockedFetch.mock.calls.length, 1);

    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(
      firstCall.arguments[0],
      "https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/verses/1JN.1.9?content-type=html&include-notes=true&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false&use-org-id=false",
    );
  });

  test("throws an error for a non-200 status code", async () => {
    const errorResponse = {
      ok: false,
      status: 400,
      statusText: "Bad Request",
    } as Response;

    mockedFetch.mock.mockImplementationOnce(() =>
      Promise.resolve(errorResponse),
    );
    const apiBibleClient = new ApiBibleClient();

    await assert.rejects(
      async () =>
        await apiBibleClient.getVerse({
          bibleId: "de4e12af7f28f599-02",
          verseId: "1JN.1.9",
        }),
      {
        message:
          "Request failed with status code 400 Bad Request: https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/verses/1JN.1.9?content-type=json&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false&use-org-id=false",
      },
    );
  });

  test("caches successful responses", async () => {
    const mockResponseData = {
      data: {
        id: "GAL.2.20",
        orgId: "GAL.2.20",
        bookId: "GAL",
        chapterId: "GAL.2",
        bibleId: "32664dc3288a28df-02",
        reference: "Galatians 2:20",
        content: [
          {
            name: "para",
            type: "tag",
            attrs: { style: "p" },
            items: [
              {
                text: "I have been crucified with Christ, and it is no longer I who live, but Christ lives in me. That life which I now live in the flesh, I live by faith in the Son of God, who loved me and gave himself up for me. ",
                type: "text",
                attrs: { verseId: "GAL.2.20", verseOrgIds: ["GAL.2.20"] },
              },
            ],
          },
        ],
        verseCount: 1,
        copyright: "PUBLIC DOMAIN (not copyrighted)",
        next: { id: "GAL.2.21", number: "21" },
        previous: { id: "GAL.2.19", number: "19" },
      },
    };

    const requestURL =
      "https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/verses/1JN.1.9?content-type=json&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false&use-org-id=false";

    mockedFetch.mock.mockImplementationOnce(() =>
      createFetchResponse(mockResponseData),
    );

    const apiBibleClient = new ApiBibleClient();

    assert.equal(apiBibleClient.cache.get(requestURL), undefined);
    await apiBibleClient.getVerse({
      bibleId: "de4e12af7f28f599-02",
      verseId: "1JN.1.9",
    });
    assert.equal(mockedFetch.mock.calls.length, 1);
    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(firstCall.arguments[0], requestURL);

    mockedFetch.mock.resetCalls();

    // the cache should contain the response data after the first call
    assert.deepEqual(apiBibleClient.cache.get(requestURL), mockResponseData);

    // should read value from cache instead of fetching from api
    const cachedData = await apiBibleClient.getVerse({
      bibleId: "de4e12af7f28f599-02",
      verseId: "1JN.1.9",
    });
    assert.equal(mockedFetch.mock.calls.length, 0);
    assert.deepEqual(cachedData, mockResponseData);
  });
});

describe("searchForVerses()", () => {
  const mockedFetch = mock.fn(createFetchResponse);
  beforeEach(() => {
    mockedFetch.mock.resetCalls();
    mock.method(globalThis, "fetch", mockedFetch);
  });

  test("only requires bibleId and query", async () => {
    const apiBibleClient = new ApiBibleClient();
    await apiBibleClient.searchForVerses({
      bibleId: "de4e12af7f28f599-02",
      query: "John 3",
    });

    assert.equal(mockedFetch.mock.calls.length, 1);

    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(
      firstCall.arguments[0],
      "https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/search?query=John+3",
    );
  });

  test("supports optional input", async () => {
    const apiBibleClient = new ApiBibleClient();
    await apiBibleClient.searchForVerses({
      bibleId: "de4e12af7f28f599-02",
      query: "John 3",
      limit: 3,
      sort: "canonical",
    });

    assert.equal(mockedFetch.mock.calls.length, 1);

    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(
      firstCall.arguments[0],
      "https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/search?query=John+3&limit=3&sort=canonical",
    );
  });

  test("throws an error for a non-200 status code", async () => {
    const errorResponse = {
      ok: false,
      status: 400,
      statusText: "Bad Request",
    } as Response;

    mockedFetch.mock.mockImplementationOnce(() =>
      Promise.resolve(errorResponse),
    );
    const apiBibleClient = new ApiBibleClient();

    await assert.rejects(
      async () =>
        await apiBibleClient.searchForVerses({
          bibleId: "de4e12af7f28f599-02",
          query: "John 3",
        }),
      {
        message:
          "Request failed with status code 400 Bad Request: https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/search?query=John+3",
      },
    );
  });

  test("caches successful responses", async () => {
    const mockResponseData = {
      data: {
        query: "make disciples of all nations",
        limit: 10,
        offset: 0,
        total: 1,
        verseCount: 1,
        verses: [
          {
            id: "MAT.28.19",
            orgId: "MAT.28.19",
            bookId: "MAT",
            bibleId: "32664dc3288a28df-02",
            chapterId: "MAT.28",
            reference: "Matthew 28:19",
            text: "Go  and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit,",
          },
        ],
      },
    };

    const requestURL =
      "https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/search?query=make+disciples+of+all+nations";

    mockedFetch.mock.mockImplementationOnce(() =>
      createFetchResponse(mockResponseData),
    );

    const apiBibleClient = new ApiBibleClient();

    assert.equal(apiBibleClient.cache.get(requestURL), undefined);
    await apiBibleClient.searchForVerses({
      bibleId: "de4e12af7f28f599-02",
      query: "make disciples of all nations",
    });
    assert.equal(mockedFetch.mock.calls.length, 1);
    const firstCall = mockedFetch.mock.calls[0];
    assert.equal(firstCall.arguments[0], requestURL);

    mockedFetch.mock.resetCalls();

    // the cache should contain the response data after the first call
    assert.deepEqual(apiBibleClient.cache.get(requestURL), mockResponseData);

    // should read value from cache instead of fetching from api
    const cachedData = await apiBibleClient.searchForVerses({
      bibleId: "de4e12af7f28f599-02",
      query: "make disciples of all nations",
    });
    assert.equal(mockedFetch.mock.calls.length, 0);
    assert.deepEqual(cachedData, mockResponseData);
  });
});
