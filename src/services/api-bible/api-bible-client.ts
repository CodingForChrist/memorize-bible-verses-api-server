import { TTLCache } from "@isaacs/ttlcache";
import { HTTPError } from "./http-error.ts";
import logger from "../logger.ts";
import { formatSearchParameters } from "./format-url.ts";

import bibleListFixtureData from "../../data/bible-list.json" with { type: "json" };

type CacheData = Record<string, unknown>;

export class ApiBibleClient {
  private readonly baseUrl = "https://rest.api.bible/v1";
  private readonly bibleApiKey = process.env.BIBLE_API_KEY as string;
  private readonly isInMemoryMode =
    process.env.API_CLIENT_BEHAVIOR_IN_MEMORY_MODE === "true";

  readonly cache: TTLCache<string, CacheData>;

  constructor(cache?: TTLCache<string, CacheData>) {
    this.cache =
      cache ??
      new TTLCache<string, CacheData>({
        max: 10_000,
        // one day in milliseconds
        ttl: 24 * 60 * 60 * 1000,
      });
  }
  async #request({ url, label }: { url: URL; label: string }) {
    const urlString = url.toString();
    const cacheValue = this.cache.get(urlString);

    logger.debug({ url: urlString, foundInCache: Boolean(cacheValue) }, label);

    if (cacheValue) {
      return cacheValue;
    }

    const response = await fetch(urlString, {
      method: "GET",
      headers: {
        "api-key": this.bibleApiKey,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new HTTPError(response, url);
    }

    const data = await response.json();
    this.cache.set(urlString, data);

    return data as Record<string, unknown>;
  }

  async getBibles(
    getBiblesInput: {
      language?: string;
      abbreviation?: string;
      name?: string;
      ids?: string;
      includeFullDetails?: boolean;
    } = {},
  ) {
    if (this.isInMemoryMode) {
      logger.debug("bible list loaded from fixture data");
      return bibleListFixtureData;
    }

    const url = new URL(`${this.baseUrl}/bibles`);

    const defaultValues = {
      language: "eng",
      includeFullDetails: false,
    };

    url.search = formatSearchParameters({
      ...defaultValues,
      ...getBiblesInput,
    }).toString();

    const data = await this.#request({ url, label: "getBibles" });
    return data;
  }

  async getBooks(getBooksInput: {
    bibleId: string;
    includeChapters?: boolean;
    includeChaptersAndSections?: boolean;
  }) {
    const { bibleId, ...queryParameterInput } = getBooksInput;
    const url = new URL(`${this.baseUrl}/bibles/${bibleId}/books`);

    const defaultValues = {
      includeChapters: false,
      includeChaptersAndSections: false,
    };

    url.search = formatSearchParameters({
      ...defaultValues,
      ...queryParameterInput,
    }).toString();

    const data = await this.#request({ url, label: "getBooks" });
    return data;
  }

  async getVerse(getVerseInput: {
    bibleId: string;
    verseId: string;
    contentType?: "html" | "json" | "text";
    includeNotes?: boolean;
    includeTitles?: boolean;
    includeChapterNumbers?: boolean;
    includeVerseNumbers?: boolean;
    includeVerseSpans?: boolean;
    useOrgId?: boolean;
  }) {
    const { bibleId, verseId, ...queryParameterInput } = getVerseInput;
    const url = new URL(`${this.baseUrl}/bibles/${bibleId}/verses/${verseId}`);

    const defaultValues = {
      contentType: "json",
      includeNotes: false,
      includeTitles: false,
      includeChapterNumbers: false,
      includeVerseNumbers: false,
      includeVerseSpans: false,
      useOrgId: false,
    };

    url.search = formatSearchParameters({
      ...defaultValues,
      ...queryParameterInput,
    }).toString();

    const data = await this.#request({ url, label: "getVerse" });
    return data;
  }

  async getPassage(getPassageInput: {
    bibleId: string;
    passageId: string;
    contentType?: "html" | "json" | "text";
    includeNotes?: boolean;
    includeTitles?: boolean;
    includeChapterNumbers?: boolean;
    includeVerseNumbers?: boolean;
    includeVerseSpans?: boolean;
    parallels?: string;
    useOrgId?: boolean;
  }) {
    const { bibleId, passageId, ...queryParameterInput } = getPassageInput;
    const url = new URL(
      `${this.baseUrl}/bibles/${bibleId}/passages/${passageId}`,
    );

    const defaultValues = {
      contentType: "json",
      includeNotes: false,
      includeTitles: true,
      includeChapterNumbers: false,
      includeVerseNumbers: true,
      includeVerseSpans: false,
      useOrgId: false,
    };

    url.search = formatSearchParameters({
      ...defaultValues,
      ...queryParameterInput,
    }).toString();

    const data = await this.#request({ url, label: "getPassage" });
    return data;
  }

  async searchForVerses(searchForVersesInput: {
    bibleId: string;
    query: string;
    limit?: number;
    offset?: number;
    sort?: "relevance" | "canonical" | "reverse-canonical";
    range?: string;
    fuzziness?: string;
  }) {
    const { bibleId, ...queryParameterInput } = searchForVersesInput;
    const url = new URL(`${this.baseUrl}/bibles/${bibleId}/search`);
    url.search = formatSearchParameters(queryParameterInput).toString();

    const data = await this.#request({ url, label: "search" });
    return data;
  }
}
