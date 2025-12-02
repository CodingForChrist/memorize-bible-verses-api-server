import { z } from "zod/v4";
import { getVerse } from "../api-bible.ts";
import { transformVerseReferenceToVerseId } from "../bible-verse-reference-helper.ts";
import type { Request, Response } from "express";

export default async function singleVerseRouteHandler(
  request: Request,
  response: Response,
) {
  const schema = z
    .object({
      bibleId: z.string().min(4).max(40),
      verseReference: z
        .string()
        .min(6)
        .max(40)
        .superRefine((value, context) => {
          try {
            transformVerseReferenceToVerseId(value);
          } catch (error) {
            context.addIssue(String(error as Error));
          }
        }),
      contentType: z.enum(["html", "json", "text"]).optional(),
      includeNotes: z.boolean().optional(),
      includeTitles: z.boolean().optional(),
      includeChapterNumbers: z.boolean().optional(),
      includeVerseNumbers: z.boolean().optional(),
      includeVerseSpans: z.boolean().optional(),
      useOrgId: z.boolean().optional(),
    })
    .transform(({ verseReference, ...rest }) => {
      const verseId = transformVerseReferenceToVerseId(verseReference);
      return {
        ...rest,
        verseId,
      };
    });

  const trustedInput = schema.parse({
    ...request.params,
    ...request.body,
  });

  const results = await getVerse(trustedInput);
  response.status(200).json(results);
}
