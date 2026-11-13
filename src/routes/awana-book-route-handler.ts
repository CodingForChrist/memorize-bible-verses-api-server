import { z } from "zod/v4";
import { getBooks } from "../services/api-bible/index.ts";
import type { Request, Response } from "express";

export default async function bookRouteHandler(
  request: Request,
  response: Response,
) {
  const schema = z.object({
    awanaBookId: z.string().optional(),
    includeMemoryVerses: z.boolean().default(false),
  });

  const { awanaBookId, includeMemoryVerses } = schema.parse({
    ...request.params,
    ...request.body,
  });

  const results = await getBooks(trustedBibleId, trustedParameters);
  response.status(200).json(results);
}
