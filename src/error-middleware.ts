import { z, ZodError } from "zod/v4";
import { HTTPError } from "./http-error.ts";
import type { Request, Response, NextFunction } from "express";

export default async function errorMiddleware(
  error: Error,
  request_: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof HTTPError) {
    try {
      const errorData = await error.response.json();
      response.status(error.response.status).json({
        ...errorData,
        errorDescription: error.toString(),
      });
    } catch {
      response.status(500).json({
        error: "Internal Server Error",
        errorDescription: error.toString(),
      });
    }
  } else if (error instanceof ZodError) {
    response.status(400).json({
      error: "Bad Request",
      errorDescription: z.prettifyError(error),
    });
  } else {
    response.status(500).json({
      error: "Internal Server Error",
      errorDescription: error.toString(),
    });
  }
}
