import { z } from "zod/v4";
import { searchForVerses } from "../apiBible.ts";
import type { Request, Response } from "express";

export default async function searchRouteHandler(req: Request, res: Response) {
  const schema = z.object({
    bibleId: z.string().min(4).max(40),
    query: z.string().min(4).max(40),
    limit: z.number().optional(),
    offset: z.number().optional(),
    contentType: z.enum(["relevance", "relevance", "canonical"]).optional(),
    range: z.string().optional(),
    fuzziness: z.string().optional(),
  });

  const trustedInput = schema.parse({
    ...req.params,
    ...req.body,
  });

  const results = await searchForVerses(trustedInput);
  res.status(200).json(results);
}
