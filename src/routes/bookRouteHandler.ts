import { z } from "zod/v4";
import { getBooks } from "../apiBible.ts";
import type { Request, Response } from "express";

export default async function bookRouteHandler(req: Request, res: Response) {
  const schema = z.object({
    bibleId: z.string().min(4).max(40),
    includeChapters: z.boolean().optional(),
    includeChaptersAndSections: z.boolean().optional(),
  });

  const trustedInput = schema.parse({
    ...req.params,
    ...req.body,
  });

  const results = await getBooks(trustedInput);
  res.status(200).json(results);
}
