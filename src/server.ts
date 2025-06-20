import express, { Request, Response } from "express";
import cors from "cors";
import { z } from "zod/v4";

import "dotenv/config";

import { getBibles, getVerse, searchForVerses } from "./apiBible";
import authorizationMiddleware from "./authorizationMiddleware";
import errorMiddleware from "./errorMiddleware";
import logger from "./logger";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.post(
  "/api/v1/bibles",
  authorizationMiddleware,
  async (req: Request, res: Response) => {
    const schema = z.object({
      language: z.string().length(3).optional(),
      abbreviation: z.string().optional(),
      name: z.string().optional(),
      ids: z.coerce.string().optional(),
      includeFullDetails: z.boolean().optional(),
    });

    const trustedInput = schema.parse(req.body);
    const results = await getBibles(trustedInput);
    res.status(200).json(results);
  },
);

app.post(
  "/api/v1/bibles/:bibleId/verses/:verseId",
  authorizationMiddleware,
  async (req: Request, res: Response) => {
    const schema = z.object({
      bibleId: z.string().min(4).max(40),
      verseId: z.string().min(4).max(40),
      contentType: z.enum(["html", "json", "text"]).optional(),
      includeNotes: z.boolean().optional(),
      includeTitles: z.boolean().optional(),
      includeChapterNumbers: z.boolean().optional(),
      includeVerseNumbers: z.boolean().optional(),
      includeVerseSpans: z.boolean().optional(),
      useOrgId: z.boolean().optional(),
    });

    const trustedInput = schema.parse({
      ...req.params,
      ...req.body,
    });

    const results = await getVerse(trustedInput);
    res.status(200).json(results);
  },
);

app.post(
  "/api/v1/bibles/:bibleId/search/verse-reference",
  authorizationMiddleware,
  async (req: Request, res: Response) => {
    const schema = z.object({
      bibleId: z.string().min(4).max(40),
      query: z
        .string()
        .min(4)
        .max(40)
        .refine(
          (value) => {
            const characterCount = value.match(/:/g)?.length;
            return characterCount === 1;
          },
          {
            message:
              "bible verse reference must include a single colon character to separate the chapter from the verse (e.g. John 3:16)",
          },
        ),
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
  },
);

app.use(errorMiddleware);

const hostname = process.env.HOSTNAME ?? "localhost";
const port = process.env.PORT ?? 4000;

app.listen({ port, hostname }, (error) => {
  logger.info(`API server listening at http://localhost:${port}`);

  if (error) {
    logger.error(error, "API server failed to start");
  }
});
