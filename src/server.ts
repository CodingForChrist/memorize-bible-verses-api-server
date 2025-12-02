import express from "express";
import cors from "cors";

import "dotenv/config";

import errorMiddleware from "./error-middleware.ts";
import logger from "./logger.ts";
import routes from "./routes/index.ts";

import type { Request, Response, NextFunction } from "express";

const app = express();

app.disable("x-powered-by");

app.use(cors());
app.use(express.json());
app.use(routes);

app.get("/health", (_request: Request, response: Response) => {
  response.status(200).send("OK");
});

app.use(errorMiddleware);

app.use((_request: Request, response: Response, _next: NextFunction) => {
  response.status(404).json({
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
