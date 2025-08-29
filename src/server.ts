import express, { Request, Response } from "express";
import cors from "cors";
import { z } from "zod/v4";

import "dotenv/config";

import {
  getBibles,
  getBooks,
  getVerse,
  getPassage,
  searchForVerses,
} from "./apiBible";
import {
  transformVerseReferenceToVerseId,
  transformVerseReferenceToPassageId,
} from "./bibleVerseReferenceHelper";
import authorizationMiddleware from "./authorizationMiddleware";
import errorMiddleware from "./errorMiddleware";
import logger from "./logger";

import type {
  SingleVerseReference,
  VerseReferenceRange,
} from "./bibleVerseReferenceHelper";

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
  "/api/v1/bibles/:bibleId/books",
  authorizationMiddleware,
  async (req: Request, res: Response) => {
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
  },
);

app.post(
  "/api/v1/bibles/:bibleId/verses/verse-reference",
  authorizationMiddleware,
  async (req: Request, res: Response) => {
    const schema = z
      .object({
        bibleId: z.string().min(4).max(40),
        verseReference: z
          .string()
          .min(6)
          .max(40)
          .superRefine((value, context) => {
            try {
              transformVerseReferenceToVerseId(value as SingleVerseReference);
            } catch (error) {
              context.addIssue(String(error as Error));
            }
          }),
        contentType: z.enum(["html", "json", "text"]).optional(),
        includeNotes: z.boolean().optional(),
        includeTitles: z.boolean().optional(),
        includeChapterNumbers: z.boolean().optional(),
        includeVerseNumbers: z.boolean().optional(),
        includeVerseSpans: z.boolean().optional(),
        useOrgId: z.boolean().optional(),
      })
      .transform(({ verseReference, ...rest }) => {
        const verseId = transformVerseReferenceToVerseId(
          verseReference as SingleVerseReference,
        );
        return {
          ...rest,
          verseId,
        };
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
  "/api/v1/bibles/:bibleId/passages/verse-reference",
  authorizationMiddleware,
  async (req: Request, res: Response) => {
    const schema = z
      .object({
        bibleId: z.string().min(4).max(40),
        verseReference: z
          .string()
          .min(6)
          .max(40)
          .superRefine((value, context) => {
            try {
              transformVerseReferenceToPassageId(
                value as SingleVerseReference | VerseReferenceRange,
              );
            } catch (error) {
              context.addIssue(String(error as Error));
            }
          }),
        contentType: z.enum(["html", "json", "text"]).optional(),
        includeNotes: z.boolean().optional(),
        includeTitles: z.boolean().optional(),
        includeChapterNumbers: z.boolean().optional(),
        includeVerseNumbers: z.boolean().optional(),
        includeVerseSpans: z.boolean().optional(),
        useOrgId: z.boolean().optional(),
        parallels: z.string().optional(),
      })
      .transform(({ verseReference, ...rest }) => {
        const passageId = transformVerseReferenceToPassageId(
          verseReference as SingleVerseReference,
        );
        return {
          ...rest,
          passageId,
        };
      });

    const trustedInput = schema.parse({
      ...req.params,
      ...req.body,
    });

    const results = await getPassage(trustedInput);
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
