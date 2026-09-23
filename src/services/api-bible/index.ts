import { ApiBibleClient } from "./api-bible-client.ts";

const apiBibleClient = new ApiBibleClient();

export const getBibles = apiBibleClient.getBibles.bind(apiBibleClient);
export const getBooks = apiBibleClient.getBooks.bind(apiBibleClient);
export const getVerse = apiBibleClient.getVerse.bind(apiBibleClient);
export const getPassage = apiBibleClient.getPassage.bind(apiBibleClient);
export const searchForVerses =
  apiBibleClient.searchForVerses.bind(apiBibleClient);
