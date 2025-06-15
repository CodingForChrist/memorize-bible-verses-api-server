import { z, ZodError } from "zod/v4";
import { HTTPError } from "./HTTPError";
import type { Request, Response, NextFunction } from "express";

export default async function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof HTTPError) {
    try {
      const errorData = await err.response.json();
      res.status(err.response.status).json({
        ...errorData,
        errorDescription: err.toString(),
      });
    } catch (_error) {
      res.status(500).json({
        error: "Internal Server Error",
        errorDescription: err.toString(),
      });
    }
  } else if (err instanceof ZodError) {
    res.status(400).json({
      error: "Bad Request",
      errorDescription: z.prettifyError(err),
    });
  } else {
    res.status(500).json({
      error: "Internal Server Error",
      errorDescription: err.toString(),
    });
  }
}
