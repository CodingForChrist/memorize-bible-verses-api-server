import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

import { getBibles, getVerse, searchForVerses } from "./apiBible";
import { HTTPError } from "./HTTPError";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/v1/bibles", async (req: Request, res: Response) => {
  const {
    language = "eng",
    includeFullDetails = true,
    abbreviation,
    ids,
  } = req.query;
  console.log({ includeFullDetails, ids });
  const results = await getBibles({
    language: String(language),
    includeFullDetails: Boolean(includeFullDetails),
    ids: ids as string[],
  });
  res.status(200).json(results);
});

app.get(
  "/api/v1/bibles/:bibleId/verses/:verseId",
  async (req: Request, res: Response) => {
    const { bibleId, verseId } = req.params;
    const { contentType } = req.query;
    const results = await getVerse({
      bibleId,
      verseId,
      contentType: String(contentType),
    });
    res.status(200).json(results);
  },
);

app.use(
  async (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    try {
      const httpError = err as HTTPError;
      const errorData = await httpError.response.json();
      res.status(httpError.response.status).json({
        ...errorData,
        httpErrorDescription: err.toString(),
      });
    } catch (_error) {
      res.status(500).json({
        error: "Internal Server Error",
        httpErrorDescription: err.toString(),
      });
    }
  },
);

const port = process.env.PORT ?? 4000;

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
