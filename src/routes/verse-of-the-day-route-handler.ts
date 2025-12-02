import { z } from "zod/v4";
import { getPassage } from "../api-bible.ts";
import { getVerseReferenceOfTheDay } from "../verse-of-the-day.ts";
import { transformVerseReferenceToPassageId } from "../bible-verse-reference-helper.ts";
import type { Request, Response } from "express";

export default async function verseOfTheDayRouteHandler(
  request: Request,
  response: Response,
) {
  const schema = z.object({
    bibleId: z.string().min(4).max(40),
    date: z.iso.datetime({ offset: true }),
  });

  const { bibleId, date } = schema.parse({
    ...request.params,
    ...request.body,
  });

  const { verseReference, dayOfTheYear, formattedDate } =
    getVerseReferenceOfTheDay(date);
  const passageId = transformVerseReferenceToPassageId(verseReference);

  const results = await getPassage({
    bibleId,
    passageId,
  });
  response.status(200).json({
    ...results,
    formattedDate,
    dayOfTheYear,
    verseReference,
  });
}
