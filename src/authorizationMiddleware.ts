import type { Request, Response, NextFunction } from "express";

export default async function errorMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const applicationUserId = req.get("application-user-id") ?? "";

  if (getAllowedApplicationUserIds().includes(applicationUserId)) {
    return next();
  }

  res.status(401).json({
    error: "Unauthorized",
    errorDescription:
      "You must pass a valid application-user-id request header to use this API",
  });
}

function getAllowedApplicationUserIds() {
  const applicationUserIdsString = process.env.APPLICATION_USER_IDS ?? "";
  return applicationUserIdsString.split(",");
}
