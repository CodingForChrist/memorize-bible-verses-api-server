import { HTTPError } from "./HTTPError";
import logger from "./logger";
import Cache from "./cache";

import bibleListFixtureData from "./fixtures/bibleList.json";

const baseUrl = "https://api.scripture.api.bible/v1";
const bibleApiKey = process.env.BIBLE_API_KEY as string;
const inMemoryMode = process.env.API_CLIENT_BEHAVIOR_IN_MEMORY_MODE as string;

const ONE_HOUR_IN_MILLISECONDS = 60 * 60 * 1000;
export const cache = new Cache(ONE_HOUR_IN_MILLISECONDS);

type GetBiblesInput = {
  language?: string;
  abbreviation?: string;
  name?: string;
  ids?: string;
  includeFullDetails?: boolean;
};

export async function getBibles(getBiblesInput: GetBiblesInput = {}) {
  const url = new URL(`${baseUrl}/bibles`);
  url.search = getQueryStringFromObject(getBiblesInput);

  const urlString = url.toString();
  const cacheValue = cache.get(urlString);

  logger.debug({ url: urlString }, "getBibles");

  if (cacheValue) {
    return cacheValue;
  }

  if (inMemoryMode === "true") {
    logger.debug("bible list loaded from fixture data");
    return bibleListFixtureData;
  }

  const response = await fetch(urlString, {
    method: "GET",
    headers: {
      "Api-Key": bibleApiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new HTTPError(response, url);
  }

  const data = await response.json();
  cache.set(urlString, data);

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
  const { bibleId, verseId, ...queryParamInput } = getVerseInput;
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
    ...queryParamInput,
  });

  const urlString = url.toString();
  const cacheValue = cache.get(urlString);

  logger.debug({ url: urlString }, "getVerse");

  if (cacheValue) {
    return cacheValue;
  }

  const response = await fetch(urlString, {
    method: "GET",
    headers: {
      "Api-Key": bibleApiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new HTTPError(response, url);
  }

  const data = await response.json();
  cache.set(urlString, data);

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
  const { bibleId, ...queryParamInput } = searchForVersesInput;
  const url = new URL(`${baseUrl}/bibles/${bibleId}/search`);
  url.search = getQueryStringFromObject(queryParamInput);

  const urlString = url.toString();
  const cacheValue = cache.get(urlString);

  logger.debug({ url: urlString }, "searchForVerses");

  if (cacheValue) {
    return cacheValue;
  }

  const response = await fetch(urlString, {
    method: "GET",
    headers: {
      "Api-Key": bibleApiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new HTTPError(response, url);
  }

  const data = await response.json();
  cache.set(urlString, data);

  return data;
}

type GetQueryStringFromObjectInput = {
  [key: string]: string | string[] | number | boolean | undefined;
};

function getQueryStringFromObject(params: GetQueryStringFromObjectInput) {
  const approvedParams: { [key: string]: string } = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }

    const kebabCaseKey = camelCaseToKebabCase(key);
    approvedParams[kebabCaseKey] = String(value);
  }

  const urlSearchParams = new URLSearchParams(approvedParams);
  return urlSearchParams.toString();
}

function camelCaseToKebabCase(camelCaseString: string) {
  return camelCaseString
    .split("")
    .map((letter, id) => {
      if (letter.toUpperCase() === letter) {
        return `${id !== 0 ? "-" : ""}${letter.toLowerCase()}`;
      } else {
        return letter;
      }
    })
    .join("");
}
