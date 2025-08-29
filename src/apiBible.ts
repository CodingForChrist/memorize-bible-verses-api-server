import { HTTPError } from "./HTTPError";
import logger from "./logger";
import Cache from "./cache";

import bibleListFixtureData from "./fixtures/bibleList.json";

const baseUrl = "https://rest.api.bible/v1";
const bibleApiKey = process.env.BIBLE_API_KEY as string;
const inMemoryMode = process.env.API_CLIENT_BEHAVIOR_IN_MEMORY_MODE as string;

const ONE_HOUR_IN_MILLISECONDS = 60 * 60 * 1000;
export const cache = new Cache(ONE_HOUR_IN_MILLISECONDS);

type RequestInput = {
  url: URL;
  label: string;
};

async function request({ url, label }: RequestInput) {
  const urlString = url.toString();
  const cacheValue = cache.get(urlString);

  logger.debug({ url: urlString }, label);

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

  return data as Record<string, any>;
}

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

  if (inMemoryMode === "true") {
    logger.debug("bible list loaded from fixture data");
    return bibleListFixtureData;
  }

  const data = await request({ url, label: "getBibles" });
  return data;
}

type GetBooksInput = {
  bibleId: string;
  includeChapters?: boolean;
  includeChaptersAndSections?: boolean;
};

export async function getBooks(getBooksInput: GetBooksInput) {
  const { bibleId, ...queryParamInput } = getBooksInput;
  const url = new URL(`${baseUrl}/bibles/${bibleId}/books`);

  const defaultValues = {
    includeChapters: false,
    includeChaptersAndSections: false,
  };

  url.search = getQueryStringFromObject({
    ...defaultValues,
    ...queryParamInput,
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
  const { bibleId, verseId, ...queryParamInput } = getVerseInput;
  const url = new URL(`${baseUrl}/bibles/${bibleId}/verses/${verseId}`);

  const defaultValues = {
    contentType: "html",
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
  const { bibleId, passageId, ...queryParamInput } = getPassageInput;
  const url = new URL(`${baseUrl}/bibles/${bibleId}/passages/${passageId}`);

  const defaultValues = {
    contentType: "html",
    includeNotes: false,
    includeTitles: true,
    includeChapterNumbers: false,
    includeVerseNumbers: true,
    includeVerseSpans: false,
    useOrgId: false,
  };

  url.search = getQueryStringFromObject({
    ...defaultValues,
    ...queryParamInput,
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
  const { bibleId, ...queryParamInput } = searchForVersesInput;
  const url = new URL(`${baseUrl}/bibles/${bibleId}/search`);
  url.search = getQueryStringFromObject(queryParamInput);

  const data = await request({ url, label: "search" });
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
