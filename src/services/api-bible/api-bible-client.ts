import {
  createBibleClient,
  type BibleClient,
  type BibleListParams,
  type ApiResponse,
  type BookListParams,
  type ContentRenderingParams,
  type SearchParams,
} from "@americanbible/api-bible-sdk";
import { TTLCache } from "@isaacs/ttlcache";
import logger from "../logger.ts";
import { createCacheKey } from "./cache-key.ts";

import bibleListFixtureData from "../../data/bible-list.json" with { type: "json" };

type ApiBibleClientInput = {
  cache?: TTLCache<string, CacheData>;
  bibleClientFetch?: typeof globalThis.fetch;
};

type CacheData = ApiResponse<unknown>;

export class ApiBibleClient {
  private readonly bibleClient: BibleClient;
  private readonly baseUrl = "https://rest.api.bible/v1";
  private readonly isInMemoryMode: boolean;
  readonly cache: TTLCache<string, CacheData>;

  constructor({ cache, bibleClientFetch }: ApiBibleClientInput = {}) {
    this.isInMemoryMode =
      process.env.API_CLIENT_BEHAVIOR_IN_MEMORY_MODE === "true";

    this.bibleClient = createBibleClient({
      apiKey: process.env.BIBLE_API_KEY as string,
      fetch: bibleClientFetch ?? fetch,
    });
    this.cache =
      cache ??
      new TTLCache<string, CacheData>({
        max: 10_000,
        // one day in milliseconds
        ttl: 24 * 60 * 60 * 1000,
      });
  }

  #getFromCache({
    cacheKey,
    logLabel,
  }: {
    cacheKey: string;
    logLabel: string;
  }) {
    const cacheValue = this.cache.get(cacheKey);

    logger.debug(
      { cacheKey, foundInCache: Boolean(cacheValue) },
      `${logLabel} cache lookup`,
    );
    return cacheValue;
  }

  async getBibles(bibleListParameters: BibleListParams = {}) {
    if (this.isInMemoryMode) {
      logger.debug("bible list loaded from fixture data");
      return bibleListFixtureData;
    }

    const parameters = {
      language: "eng",
      includeFullDetails: false,
      ...bibleListParameters,
    };

    const cacheKey = `getBibles_${createCacheKey(parameters)}`;
    const cacheValue = this.#getFromCache({ cacheKey, logLabel: "getBibles" });

    if (cacheValue) {
      return cacheValue;
    }

    const jsonData = await this.bibleClient.bibles.list(parameters);
    this.cache.set(cacheKey, jsonData);
    return jsonData;
  }

  async getBooks(bibleId: string, bookListParameters: BookListParams = {}) {
    const parameters = {
      includeChapters: false,
      includeChaptersAndSections: false,
      ...bookListParameters,
    };

    const cacheKey = `getBooks_${bibleId}_${createCacheKey(parameters)}`;
    const cacheValue = this.#getFromCache({ cacheKey, logLabel: "getBooks" });

    if (cacheValue) {
      return cacheValue;
    }

    const jsonData = await this.bibleClient.books.list(bibleId, parameters);
    this.cache.set(cacheKey, jsonData);
    return jsonData;
  }

  async getVerse(
    bibleId: string,
    verseId: string,
    contentRenderingParameters: ContentRenderingParams = {},
  ) {
    const parameters = {
      contentType: "json",
      includeNotes: false,
      includeTitles: false,
      includeChapterNumbers: false,
      includeVerseNumbers: false,
      includeVerseSpans: false,
      ...contentRenderingParameters,
    } as const;

    const cacheKey = `getVerse_${bibleId}_${verseId}_${createCacheKey(parameters)}`;
    const cacheValue = this.#getFromCache({ cacheKey, logLabel: "getVerse" });

    if (cacheValue) {
      return cacheValue;
    }

    const jsonData = await this.bibleClient.verses.get(
      bibleId,
      verseId,
      parameters,
    );
    this.cache.set(cacheKey, jsonData);
    return jsonData;
  }

  async getPassage(
    bibleId: string,
    passageId: string,
    contentRenderingParameters: ContentRenderingParams = {},
  ) {
    const parameters = {
      contentType: "json",
      includeNotes: false,
      includeTitles: false,
      includeChapterNumbers: false,
      includeVerseNumbers: false,
      includeVerseSpans: false,
      ...contentRenderingParameters,
    } as const;

    const cacheKey = `getPassage_${bibleId}_${passageId}_${createCacheKey(parameters)}`;
    const cacheValue = this.#getFromCache({ cacheKey, logLabel: "getPassage" });

    if (cacheValue) {
      return cacheValue;
    }

    const jsonData = await this.bibleClient.passages.get(
      bibleId,
      passageId,
      parameters,
    );
    this.cache.set(cacheKey, jsonData);
    return jsonData;
  }

  async searchForVerses(bibleId: string, searchParameters: SearchParams) {
    const parameters = {
      limit: 3,
      sort: "canonical",
      ...searchParameters,
    } as const;

    const cacheKey = `searchForVerses${bibleId}_${createCacheKey(parameters)}`;
    const cacheValue = this.#getFromCache({
      cacheKey,
      logLabel: "searchForVerses",
    });

    if (cacheValue) {
      return cacheValue;
    }

    const jsonData = await this.bibleClient.search.search(bibleId, parameters);
    this.cache.set(cacheKey, jsonData);
    return jsonData;
  }
}
