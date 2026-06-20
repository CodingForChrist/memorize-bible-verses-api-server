import type { Request, Response, NextFunction } from "express";

export default async function errorMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const appUserId = request.get("application-user-id") ?? "";

  if (getAllowedAppUserIds().includes(appUserId)) {
    return next();
  }

  response.status(401).json({
    error: "Unauthorized",
    errorDescription:
      "You must pass a valid application-user-id request header to use this API",
  });
}

function getAllowedAppUserIds() {
  const appUserIdsString = process.env.APPLICATION_USER_IDS ?? "";
  return appUserIdsString.split(",");
}
