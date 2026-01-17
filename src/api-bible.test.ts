import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  getBibles,
  getBooks,
  getVerse,
  searchForVerses,
  cache,
} from "./api-bible.ts";

function createFetchResponse(data: Record<string, unknown>) {
  return {
    ok: true,
    json: () => new Promise((resolve) => resolve(data)),
  } as Response;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("PINO_LOG_LEVEL", "error");
  vi.stubEnv("BIBLE_API_KEY", "test-value");

  cache.clear();
  globalThis.fetch = vi.fn();
});

describe("getBibles()", () => {
  test("does not require any input", async () => {
    const mockedFetch = vi.mocked(globalThis.fetch);
    mockedFetch.mockResolvedValue(createFetchResponse({}));

    await getBibles();

    expect(mockedFetch).toBeCalledWith(
      "https://rest.api.bible/v1/bibles?language=eng&include-full-details=false",
      expect.any(Object),
    );
  });

  test("formats optional input into kebab-case query string parameters", async () => {
    const mockedFetch = vi.mocked(globalThis.fetch);
    mockedFetch.mockResolvedValue(createFetchResponse({}));

    await getBibles({
      language: "eng",
      ids: "de4e12af7f28f599-02,32664dc3288a28df-02",
      includeFullDetails: true,
    });

    expect(mockedFetch).toBeCalledWith(
      "https://rest.api.bible/v1/bibles?language=eng&include-full-details=true&ids=de4e12af7f28f599-02%2C32664dc3288a28df-02",
      expect.any(Object),
    );
  });

  test("throws an error for a non-200 status code", async () => {
    const mockedFetch = vi.mocked(globalThis.fetch);
    const errorResponse = {
      ok: false,
      status: 400,
      statusText: "Bad Request",
    } as Response;

    mockedFetch.mockResolvedValue(errorResponse);

    await expect(() => getBibles()).rejects.toThrowError(
      "Request failed with status code 400 Bad Request: https://rest.api.bible/v1/bibles",
    );
  });

  test("caches successful responses", async () => {
    const mockResponseData = {};
    const requestURL =
      "https://rest.api.bible/v1/bibles?language=eng&include-full-details=false";

    const mockedFetch = vi.mocked(globalThis.fetch);
    mockedFetch.mockResolvedValue(createFetchResponse(mockResponseData));

    expect(cache.get(requestURL)).toBeUndefined();
    await getBibles();

    expect(mockedFetch).toBeCalledWith(requestURL, expect.any(Object));

    mockedFetch.mockClear();

    // should read value from cache instead of fetching from api
    expect(cache.get(requestURL)).toEqual(mockResponseData);
    await getBibles();

    expect(mockedFetch).toHaveBeenCalledTimes(0);
  });
});

describe("getBooks()", () => {
  test("uses default values", async () => {
    const mockedFetch = vi.mocked(globalThis.fetch);
    mockedFetch.mockResolvedValue(createFetchResponse({}));

    await getBooks({
      bibleId: "de4e12af7f28f599-02",
    });

    expect(mockedFetch).toBeCalledWith(
      "https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/books?include-chapters=false&include-chapters-and-sections=false",
      expect.any(Object),
    );
  });

  test("uses optional input instead of default values", async () => {
    const mockedFetch = vi.mocked(globalThis.fetch);
    mockedFetch.mockResolvedValue(createFetchResponse({}));

    await getBooks({
      bibleId: "de4e12af7f28f599-02",
      includeChapters: true,
      includeChaptersAndSections: true,
    });

    expect(mockedFetch).toBeCalledWith(
      "https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/books?include-chapters=true&include-chapters-and-sections=true",
      expect.any(Object),
    );
  });

  test("throws an error for a non-200 status code", async () => {
    const mockedFetch = vi.mocked(globalThis.fetch);
    const errorResponse = {
      ok: false,
      status: 400,
      statusText: "Bad Request",
    } as Response;

    mockedFetch.mockResolvedValue(errorResponse);

    await expect(() =>
      getBooks({
        bibleId: "de4e12af7f28f599-02",
      }),
    ).rejects.toThrowError(
      "Request failed with status code 400 Bad Request: https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/books?include-chapters=false&include-chapters-and-sections=false",
    );
  });

  test("caches successful responses", async () => {
    const mockResponseData = {};
    const requestURL =
      "https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/books?include-chapters=false&include-chapters-and-sections=false";

    const mockedFetch = vi.mocked(globalThis.fetch);
    mockedFetch.mockResolvedValue(createFetchResponse(mockResponseData));

    expect(cache.get(requestURL)).toBeUndefined();

    await getBooks({
      bibleId: "de4e12af7f28f599-02",
    });

    expect(mockedFetch).toBeCalledWith(requestURL, expect.any(Object));

    mockedFetch.mockClear();

    // should read value from cache instead of fetching from api
    expect(cache.get(requestURL)).toEqual(mockResponseData);

    await getBooks({
      bibleId: "de4e12af7f28f599-02",
    });

    expect(mockedFetch).toHaveBeenCalledTimes(0);
  });
});

describe("getVerse()", () => {
  test("uses default values", async () => {
    const mockedFetch = vi.mocked(globalThis.fetch);
    mockedFetch.mockResolvedValue(createFetchResponse({}));

    await getVerse({
      bibleId: "de4e12af7f28f599-02",
      verseId: "1JN.1.9",
    });

    expect(mockedFetch).toBeCalledWith(
      "https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/verses/1JN.1.9?content-type=json&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false&use-org-id=false",
      expect.any(Object),
    );
  });

  test("uses optional input instead of default values", async () => {
    const mockedFetch = vi.mocked(globalThis.fetch);
    mockedFetch.mockResolvedValue(createFetchResponse({}));

    await getVerse({
      bibleId: "de4e12af7f28f599-02",
      verseId: "1JN.1.9",
      contentType: "html",
      includeNotes: true,
    });

    expect(mockedFetch).toBeCalledWith(
      "https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/verses/1JN.1.9?content-type=html&include-notes=true&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false&use-org-id=false",
      expect.any(Object),
    );
  });

  test("throws an error for a non-200 status code", async () => {
    const mockedFetch = vi.mocked(globalThis.fetch);
    const errorResponse = {
      ok: false,
      status: 400,
      statusText: "Bad Request",
    } as Response;

    mockedFetch.mockResolvedValue(errorResponse);

    await expect(() =>
      getVerse({
        bibleId: "de4e12af7f28f599-02",
        verseId: "1JN.1.9",
      }),
    ).rejects.toThrowError(
      "Request failed with status code 400 Bad Request: https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/verses/1JN.1.9?content-type=json&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false&use-org-id=false",
    );
  });

  test("caches successful responses", async () => {
    const mockResponseData = {};
    const requestURL =
      "https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/verses/1JN.1.9?content-type=json&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false&use-org-id=false";

    const mockedFetch = vi.mocked(globalThis.fetch);
    mockedFetch.mockResolvedValue(createFetchResponse(mockResponseData));

    expect(cache.get(requestURL)).toBeUndefined();

    await getVerse({
      bibleId: "de4e12af7f28f599-02",
      verseId: "1JN.1.9",
    });

    expect(mockedFetch).toBeCalledWith(requestURL, expect.any(Object));

    mockedFetch.mockClear();

    // should read value from cache instead of fetching from api
    expect(cache.get(requestURL)).toEqual(mockResponseData);

    await getVerse({
      bibleId: "de4e12af7f28f599-02",
      verseId: "1JN.1.9",
    });

    expect(mockedFetch).toHaveBeenCalledTimes(0);
  });
});

describe("searchForVerses()", () => {
  test("only requires bibleId and query", async () => {
    const mockedFetch = vi.mocked(globalThis.fetch);
    mockedFetch.mockResolvedValue(createFetchResponse({}));

    await searchForVerses({
      bibleId: "de4e12af7f28f599-02",
      query: "John 3",
    });

    expect(mockedFetch).toBeCalledWith(
      "https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/search?query=John+3",
      expect.any(Object),
    );
  });

  test("supports optional input", async () => {
    const mockedFetch = vi.mocked(globalThis.fetch);
    mockedFetch.mockResolvedValue(createFetchResponse({}));

    await searchForVerses({
      bibleId: "de4e12af7f28f599-02",
      query: "John 3",
      limit: 3,
      sort: "canonical",
    });

    expect(mockedFetch).toBeCalledWith(
      "https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/search?query=John+3&limit=3&sort=canonical",
      expect.any(Object),
    );
  });

  test("throws an error for a non-200 status code", async () => {
    const mockedFetch = vi.mocked(globalThis.fetch);
    const errorResponse = {
      ok: false,
      status: 400,
      statusText: "Bad Request",
    } as Response;

    mockedFetch.mockResolvedValue(errorResponse);

    await expect(() =>
      searchForVerses({
        bibleId: "de4e12af7f28f599-02",
        query: "John 3",
      }),
    ).rejects.toThrowError(
      "Request failed with status code 400 Bad Request: https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/search?query=John+3",
    );
  });

  test("caches successful responses", async () => {
    const mockResponseData = {};
    const requestURL =
      "https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/search?query=John+3";
    const mockedFetch = vi.mocked(globalThis.fetch);
    mockedFetch.mockResolvedValue(createFetchResponse(mockResponseData));

    expect(cache.get(requestURL)).toBeUndefined();

    await searchForVerses({
      bibleId: "de4e12af7f28f599-02",
      query: "John 3",
    });

    expect(mockedFetch).toBeCalledWith(requestURL, expect.any(Object));

    mockedFetch.mockClear();

    // should read value from cache instead of fetching from api
    expect(cache.get(requestURL)).toEqual(mockResponseData);

    await searchForVerses({
      bibleId: "de4e12af7f28f599-02",
      query: "John 3",
    });

    expect(mockedFetch).toHaveBeenCalledTimes(0);
  });
});
