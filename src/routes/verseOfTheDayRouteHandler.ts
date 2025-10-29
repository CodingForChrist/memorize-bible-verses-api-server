import { z } from "zod/v4";
import { getPassage } from "../apiBible.ts";
import { getVerseReferenceOfTheDay } from "../verseOfTheDay.ts";
import { transformVerseReferenceToPassageId } from "../bibleVerseReferenceHelper.ts";
import type { Request, Response } from "express";

export default async function verseOfTheDayRouteHandler(
  req: Request,
  res: Response,
) {
  const schema = z.object({
    bibleId: z.string().min(4).max(40),
    date: z.iso.datetime({ offset: true }),
  });

  const { bibleId, date } = schema.parse({
    ...req.params,
    ...req.body,
  });

  const { verseReference, dayOfTheYear, formattedDate } =
    getVerseReferenceOfTheDay(date);
  const passageId = transformVerseReferenceToPassageId(verseReference);

  const results = await getPassage({
    bibleId,
    passageId,
  });
  res.status(200).json({
    ...results,
    formattedDate,
    dayOfTheYear,
    verseReference,
  });
}
