import { z, ZodError } from "zod/v4";
import {
  BibleError,
  BadRequestError,
  InvalidInputError,
  AuthError,
  NotFoundError,
} from "@americanbible/api-bible-sdk";
import type { Request, Response, NextFunction } from "express";

export default async function errorMiddleware(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      error: "Bad Request",
      errorDescription: z.prettifyError(error),
    });
  }
  if (error instanceof AuthError) {
    return response.status(error.statusCode).json({
      error: error.name,
      errorDescription: error.message,
    });
  }
  if (error instanceof InvalidInputError) {
    return response.status(400).json({
      error: "Bad Request",
      errorDescription: error.message,
    });
  }
  if (error instanceof BadRequestError) {
    return response.status(error.statusCode).json({
      error: "Bad Request",
      errorDescription: error.message,
    });
  }
  if (error instanceof NotFoundError) {
    return response.status(error.statusCode).json({
      error: "Not Found",
      errorDescription: error.message,
    });
  }
  if (error instanceof BibleError) {
    return response.status(500).json({
      error: error.name,
      errorDescription: error.message,
    });
  }
  return response.status(500).json({
    error: "Internal Server Error",
    errorDescription: error.toString(),
  });
}
