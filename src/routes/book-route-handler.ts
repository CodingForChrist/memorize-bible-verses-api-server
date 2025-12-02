import { z } from "zod/v4";
import { getBooks } from "../api-bible.ts";
import type { Request, Response } from "express";

export default async function bookRouteHandler(
  request: Request,
  response: Response,
) {
  const schema = z.object({
    bibleId: z.string().min(4).max(40),
    includeChapters: z.boolean().optional(),
    includeChaptersAndSections: z.boolean().optional(),
  });

  const trustedInput = schema.parse({
    ...request.params,
    ...request.body,
  });

  const results = await getBooks(trustedInput);
  response.status(200).json(results);
}
