import { beforeEach, describe, expect, test, vi } from "vitest";

import { getBibles, getVerse, searchForVerses } from "./apiBible";

function createFetchResponse(data: Record<string, unknown>) {
  return {
    ok: true,
    json: () => new Promise((resolve) => resolve(data)),
  } as Response;
}

describe("getBibles()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  test("does not require any input", async () => {
    const mockedFetch = vi.mocked(global.fetch);
    mockedFetch.mockResolvedValue(createFetchResponse({}));

    await getBibles();

    expect(mockedFetch).toBeCalledWith(
      "https://api.scripture.api.bible/v1/bibles",
      expect.any(Object),
    );
  });

  test("formats optional input into kebab-case query string parameters", async () => {
    const mockedFetch = vi.mocked(global.fetch);
    mockedFetch.mockResolvedValue(createFetchResponse({}));

    await getBibles({
      language: "eng",
      ids: ["de4e12af7f28f599-02", "32664dc3288a28df-02"],
      includeFullDetails: true,
    });

    expect(mockedFetch).toBeCalledWith(
      "https://api.scripture.api.bible/v1/bibles?language=eng&ids=de4e12af7f28f599-02%2C32664dc3288a28df-02&include-full-details=true",
      expect.any(Object),
    );
  });

  test("throws an error for a non-200 status code", async () => {
    const mockedFetch = vi.mocked(global.fetch);
    const errorResponse = {
      ok: false,
      status: 400,
      statusText: "Bad Request",
    } as Response;

    mockedFetch.mockResolvedValue(errorResponse);

    await expect(() => getBibles()).rejects.toThrowError(
      "Request failed with status code 400 Bad Request: https://api.scripture.api.bible/v1/bibles",
    );
  });
});

describe("getVerse()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  test("uses default values", async () => {
    const mockedFetch = vi.mocked(global.fetch);
    mockedFetch.mockResolvedValue(createFetchResponse({}));

    await getVerse({
      bibleId: "de4e12af7f28f599-02",
      verseId: "1JN.1.9",
    });

    expect(mockedFetch).toBeCalledWith(
      "https://api.scripture.api.bible/v1/bibles/de4e12af7f28f599-02/verses/1JN.1.9?content-type=json&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false&use-org-id=false",
      expect.any(Object),
    );
  });

  test("uses optional input instead of default values", async () => {
    const mockedFetch = vi.mocked(global.fetch);
    mockedFetch.mockResolvedValue(createFetchResponse({}));

    await getVerse({
      bibleId: "de4e12af7f28f599-02",
      verseId: "1JN.1.9",
      contentType: "html",
      includeNotes: true,
    });

    expect(mockedFetch).toBeCalledWith(
      "https://api.scripture.api.bible/v1/bibles/de4e12af7f28f599-02/verses/1JN.1.9?content-type=html&include-notes=true&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false&use-org-id=false",
      expect.any(Object),
    );
  });

  test("throws an error for a non-200 status code", async () => {
    const mockedFetch = vi.mocked(global.fetch);
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
      "Request failed with status code 400 Bad Request: https://api.scripture.api.bible/v1/bibles/de4e12af7f28f599-02/verses/1JN.1.9?content-type=json&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false&use-org-id=false",
    );
  });
});

describe("searchForVerses()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  test("only requires bibleId", async () => {
    const mockedFetch = vi.mocked(global.fetch);
    mockedFetch.mockResolvedValue(createFetchResponse({}));

    await searchForVerses({
      bibleId: "de4e12af7f28f599-02",
    });

    expect(mockedFetch).toBeCalledWith(
      "https://api.scripture.api.bible/v1/bibles/de4e12af7f28f599-02/search",
      expect.any(Object),
    );
  });

  test("formats optional input into kebab-case query string parameters", async () => {
    const mockedFetch = vi.mocked(global.fetch);
    mockedFetch.mockResolvedValue(createFetchResponse({}));

    await searchForVerses({
      bibleId: "de4e12af7f28f599-02",
      query: "John 3",
    });

    expect(mockedFetch).toBeCalledWith(
      "https://api.scripture.api.bible/v1/bibles/de4e12af7f28f599-02/search?query=John+3",
      expect.any(Object),
    );
  });

  test("throws an error for a non-200 status code", async () => {
    const mockedFetch = vi.mocked(global.fetch);
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
      "Request failed with status code 400 Bad Request: https://api.scripture.api.bible/v1/bibles/de4e12af7f28f599-02/search?query=John+3",
    );
  });
});
