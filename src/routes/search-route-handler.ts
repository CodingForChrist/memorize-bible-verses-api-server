import { z } from "zod/v4";
import { searchForVerses } from "../services/api-bible/index.ts";
import type { Request, Response } from "express";

export default async function searchRouteHandler(
  request: Request,
  response: Response,
) {
  const schema = z.object({
    bibleId: z.string().min(4).max(40),
    query: z.string().min(4).max(40),
    limit: z.number().optional(),
    offset: z.number().optional(),
    contentType: z.enum(["relevance", "relevance", "canonical"]).optional(),
    range: z.string().optional(),
    fuzziness: z.enum(["AUTO", "0", "1", "2"]).optional(),
  });

  const { bibleId: trustedBibleId, ...trustedParameters } = schema.parse({
    ...request.params,
    ...request.body,
  });

  const results = await searchForVerses(trustedBibleId, trustedParameters);
  response.status(200).json(results);
}
