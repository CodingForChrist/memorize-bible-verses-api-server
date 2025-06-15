import express, { Request, Response } from "express";
import cors from "cors";
import { z } from "zod/v4";

import { getBibles, getVerse, searchForVerses } from "./apiBible";
import errorMiddleware from "./errorMiddleware";

const app = express();

app.use(cors());
app.use(express.json());

const queryParamBoolean = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

app.get("/api/v1/bibles", async (req: Request, res: Response) => {
  const schema = z.object({
    language: z.string().length(3).optional(),
    abbreviation: z.string().optional(),
    name: z.string().optional(),
    ids: z.array(z.string()).optional(),
    includeFullDetails: queryParamBoolean.optional(),
  });

  const trustedInput = schema.parse(req.query);
  const results = await getBibles(trustedInput);
  res.status(200).json(results);
});

app.get(
  "/api/v1/bibles/:bibleId/verses/:verseId",
  async (req: Request, res: Response) => {
    const schema = z.object({
      bibleId: z.string(),
      verseId: z.string(),
      contentType: z.enum(["html", "json", "text"]).optional(),
      includeNotes: queryParamBoolean.optional(),
      includeTitles: queryParamBoolean.optional(),
      includeChapterNumbers: queryParamBoolean.optional(),
      includeVerseNumbers: queryParamBoolean.optional(),
      includeVerseSpans: queryParamBoolean.optional(),
      useOrgId: queryParamBoolean.optional(),
    });

    const trustedInput = schema.parse({
      ...req.params,
      ...req.query,
    });

    const results = await getVerse(trustedInput);
    res.status(200).json(results);
  },
);

app.get(
  "/api/v1/bibles/:bibleId/search",
  async (req: Request, res: Response) => {
    const schema = z.object({
      bibleId: z.string(),
      query: z.string(),
      limit: z.number().optional(),
      offset: z.number().optional(),
      contentType: z.enum(["relevance", "relevance", "canonical"]).optional(),
      range: z.string().optional(),
      fuzziness: z.string().optional(),
    });

    const trustedInput = schema.parse({
      ...req.params,
      ...req.query,
    });

    const results = await searchForVerses(trustedInput);
    res.status(200).json(results);
  },
);

app.use(errorMiddleware);

const port = process.env.PORT ?? 4000;

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
