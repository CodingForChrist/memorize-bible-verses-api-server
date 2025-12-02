import { Router } from "express";

import bibleRouteHandler from "./bible-route-handler.ts";
import bookRouteHandler from "./book-route-handler.ts";
import singleVerseRouteHandler from "./single-verse-route-handler.ts";
import passageRouteHandler from "./passage-route-handler.ts";
import searchRouteHandler from "./search-route-handler.ts";
import verseOfTheDayRouteHandler from "./verse-of-the-day-route-handler.ts";

import authorizationMiddleware from "../authorization-middleware.ts";

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
