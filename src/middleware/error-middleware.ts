import { z, ZodError } from "zod/v4";
import {
  BibleError,
  BadRequestError,
  InvalidInputError,
  AuthError,
} from "@americanbible/api-bible-sdk";
import { HTTPError } from "../services/api-bible/http-error.ts";
import type { Request, Response, NextFunction } from "express";

export default async function errorMiddleware(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof AuthError) {
    response.status(error.statusCode).json({
      error: error.name,
      errorDescription: error.message,
    });
  } else if (error instanceof InvalidInputError) {
    response.status(400).json({
      error: "Bad Request",
      errorDescription: error.message,
    });
  } else if (error instanceof BadRequestError) {
    response.status(error.statusCode).json({
      error: "Bad Request",
      errorDescription: error.message,
    });
  } else if (error instanceof BibleError) {
    response.status(500).json({
      error: error.name,
      errorDescription: error.message,
    });
  }
  // TODO: remove custom HTTPError
  else if (error instanceof HTTPError) {
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
