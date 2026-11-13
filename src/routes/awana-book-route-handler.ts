import { z } from "zod/v4";
import { getAllBooks, getBookById } from "../services/awana-books.ts";
import type { Request, Response } from "express";

export default async function awanaBookRouteHandler(
  request: Request,
  response: Response,
) {
  const schema = z.object({
    awanaBookId: z
      .enum([
        "sparks-wingrunner-handbook",
        "tt-mission-agents-of-grace-kids-handbook",
        "tt-mission-discovery-of-grace-kids-handbook",
      ])
      .optional(),
    includeMemoryVerses: z.boolean().default(false),
  });

  const { awanaBookId, includeMemoryVerses } = schema.parse({
    ...request.params,
    ...request.body,
  });

  const data = awanaBookId
    ? getBookById(awanaBookId, { includeMemoryVerses })
    : getAllBooks({ includeMemoryVerses });

  response.status(200).json(data);
}
