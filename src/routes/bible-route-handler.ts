import { z } from "zod/v4";
import { getBibles } from "../api-bible.ts";
import type { Request, Response } from "express";

export default async function bibleRouteHandler(
  request: Request,
  response: Response,
) {
  const schema = z.object({
    language: z.string().length(3).optional(),
    abbreviation: z.string().optional(),
    name: z.string().optional(),
    ids: z.string().optional(),
    includeFullDetails: z.boolean().optional(),
  });

  const trustedInput = schema.parse(request.body);
  const results = await getBibles(trustedInput);
  response.status(200).json(results);
}
