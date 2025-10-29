import express from "express";
import cors from "cors";

import "dotenv/config";

import errorMiddleware from "./errorMiddleware.ts";
import logger from "./logger.ts";
import routes from "./routes/index.ts";

import type { Request, Response, NextFunction } from "express";

const app = express();

app.disable("x-powered-by");

app.use(cors());
app.use(express.json());
app.use(routes);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.use(errorMiddleware);

app.use((_req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    error: "404 Not Found",
  });
});

const hostname = process.env.HOSTNAME ?? "localhost";
const port = process.env.PORT ?? 4000;

app.listen({ port, hostname }, (error) => {
  logger.info(`API server listening at http://localhost:${port}`);

  if (error) {
    logger.error(error, "API server failed to start");
  }
});
