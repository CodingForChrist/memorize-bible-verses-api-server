import { Router } from "express";

import bibleRouteHandler from "./bibleRouteHandler.ts";
import bookRouteHandler from "./bookRouteHandler.ts";
import singleVerseRouteHandler from "./singleVerseRouteHandler.ts";
import passageRouteHandler from "./passageRouteHandler.ts";
import searchRouteHandler from "./searchRouteHandler.ts";
import verseOfTheDayRouteHandler from "./verseOfTheDayRouteHandler.ts";

import authorizationMiddleware from "../authorizationMiddleware.ts";

const router = Router();

router.use(authorizationMiddleware);

router.post("/api/v1/bibles", bibleRouteHandler);
router.post("/api/v1/bibles/:bibleId/books", bookRouteHandler);
router.post("/api/v1/bibles/:bibleId/search", searchRouteHandler);
router.post(
  "/api/v1/bibles/:bibleId/verses/verse-reference",
  singleVerseRouteHandler,
);
router.post(
  "/api/v1/bibles/:bibleId/passages/verse-reference",
  passageRouteHandler,
);
router.post(
  "/api/v1/bibles/:bibleId/verse-of-the-day",
  verseOfTheDayRouteHandler,
);

export default router;
