import { TTLCache } from "@isaacs/ttlcache";
import { HTTPError } from "./http-error.ts";
import logger from "./logger.ts";

import bibleListFixtureData from "./data/bible-list.json" with { type: "json" };

const baseUrl = "https://rest.api.bible/v1";
const bibleApiKey = process.env.BIBLE_API_KEY as string;
const inMemoryMode = process.env.API_CLIENT_BEHAVIOR_IN_MEMORY_MODE === "true";

const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
export const cache = new TTLCache<string, Record<string, unknown>>({
  max: 10_000,
  ttl: ONE_DAY_IN_MILLISECONDS,
});

type RequestInput = {
  url: URL;
  label: string;
};

async function request({ url, label }: RequestInput) {
  const urlString = url.toString();
  const cacheValue = cache.get(urlString);

  logger.debug({ url: urlString, foundInCache: Boolean(cacheValue) }, label);

  if (cacheValue) {
    return cacheValue;
  }

  const response = await fetch(urlString, {
    method: "GET",
    headers: {
      "api-key": bibleApiKey,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new HTTPError(response, url);
  }

  const data = await response.json();
  cache.set(urlString, data);

  return data as Record<string, unknown>;
}

type GetBiblesInput = {
  language?: string;
  abbreviation?: string;
  name?: string;
  ids?: string;
  includeFullDetails?: boolean;
};

export async function getBibles(getBiblesInput: GetBiblesInput = {}) {
  if (inMemoryMode) {
    logger.debug("bible list loaded from fixture data");
    return bibleListFixtureData;
  }

  const url = new URL(`${baseUrl}/bibles`);

  const defaultValues = {
    language: "eng",
    includeFullDetails: false,
  };

  url.search = getQueryStringFromObject({
    ...defaultValues,
    ...getBiblesInput,
  });

  const data = await request({ url, label: "getBibles" });
  return data;
}

type GetBooksInput = {
  bibleId: string;
  includeChapters?: boolean;
  includeChaptersAndSections?: boolean;
};

export async function getBooks(getBooksInput: GetBooksInput) {
  const { bibleId, ...queryParameterInput } = getBooksInput;
  const url = new URL(`${baseUrl}/bibles/${bibleId}/books`);

  const defaultValues = {
    includeChapters: false,
    includeChaptersAndSections: false,
  };

  url.search = getQueryStringFromObject({
    ...defaultValues,
    ...queryParameterInput,
  });

  const data = await request({ url, label: "getBooks" });
  return data;
}

type GetVerseInput = {
  bibleId: string;
  verseId: string;
  contentType?: "html" | "json" | "text";
  includeNotes?: boolean;
  includeTitles?: boolean;
  includeChapterNumbers?: boolean;
  includeVerseNumbers?: boolean;
  includeVerseSpans?: boolean;
  useOrgId?: boolean;
};

export async function getVerse(getVerseInput: GetVerseInput) {
  const { bibleId, verseId, ...queryParameterInput } = getVerseInput;
  const url = new URL(`${baseUrl}/bibles/${bibleId}/verses/${verseId}`);

  const defaultValues = {
    contentType: "json",
    includeNotes: false,
    includeTitles: false,
    includeChapterNumbers: false,
    includeVerseNumbers: false,
    includeVerseSpans: false,
    useOrgId: false,
  };

  url.search = getQueryStringFromObject({
    ...defaultValues,
    ...queryParameterInput,
  });

  const data = await request({ url, label: "getVerse" });
  return data;
}

type GetPassageInput = {
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
};

export async function getPassage(getPassageInput: GetPassageInput) {
  const { bibleId, passageId, ...queryParameterInput } = getPassageInput;
  const url = new URL(`${baseUrl}/bibles/${bibleId}/passages/${passageId}`);

  const defaultValues = {
    contentType: "json",
    includeNotes: false,
    includeTitles: true,
    includeChapterNumbers: false,
    includeVerseNumbers: true,
    includeVerseSpans: false,
    useOrgId: false,
  };

  url.search = getQueryStringFromObject({
    ...defaultValues,
    ...queryParameterInput,
  });

  const data = await request({ url, label: "getPassage" });
  return data;
}

type SearchInput = {
  bibleId: string;
  query: string;
  limit?: number;
  offset?: number;
  sort?: "relevance" | "canonical" | "reverse-canonical";
  range?: string;
  fuzziness?: string;
};

export async function searchForVerses(searchForVersesInput: SearchInput) {
  const { bibleId, ...queryParameterInput } = searchForVersesInput;
  const url = new URL(`${baseUrl}/bibles/${bibleId}/search`);
  url.search = getQueryStringFromObject(queryParameterInput);

  const data = await request({ url, label: "search" });
  return data;
}

type GetQueryStringFromObjectInput = {
  [key: string]: string | string[] | number | boolean | undefined;
};

function getQueryStringFromObject(parameters: GetQueryStringFromObjectInput) {
  const approvedParameters: { [key: string]: string } = {};

  for (const [key, value] of Object.entries(parameters)) {
    if (value === undefined) {
      continue;
    }

    const kebabCaseKey = camelCaseToKebabCase(key);
    approvedParameters[kebabCaseKey] = String(value);
  }

  const urlSearchParameters = new URLSearchParams(approvedParameters);
  return urlSearchParameters.toString();
}

function camelCaseToKebabCase(camelCaseString: string) {
  return [...camelCaseString]
    .map((letter, id) => {
      return letter.toUpperCase() === letter
        ? `${id === 0 ? "" : "-"}${letter.toLowerCase()}`
        : letter;
    })
    .join("");
}
