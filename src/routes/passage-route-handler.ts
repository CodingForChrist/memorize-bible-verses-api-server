import { z } from "zod/v4";
import { getPassage } from "../api-bible.ts";
import { transformVerseReferenceToPassageId } from "../bible-verse-reference-helper.ts";
import type { Request, Response } from "express";

export default async function passageRouteHandler(
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
            transformVerseReferenceToPassageId(value);
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
      parallels: z.string().optional(),
    })
    .transform(({ verseReference, ...rest }) => {
      const passageId = transformVerseReferenceToPassageId(verseReference);
      return {
        ...rest,
        passageId,
      };
    });

  const trustedInput = schema.parse({
    ...request.params,
    ...request.body,
  });

  const results = await getPassage(trustedInput);
  response.status(200).json(results);
}
