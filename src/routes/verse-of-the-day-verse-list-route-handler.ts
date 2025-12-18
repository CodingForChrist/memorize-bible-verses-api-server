import { z } from "zod/v4";
import { getVerseList } from "../verse-of-the-day.ts";
import type { Request, Response } from "express";

export default function verseOfTheDayVerseListRouteHandler(
  request: Request,
  response: Response,
) {
  const schema = z.object({
    year: z.enum(["2025", "2026"]).transform(Number),
  });

  const { year } = schema.parse({
    ...request.body,
  });

  const verseList = getVerseList(year);
  response.status(200).json(verseList);
}
