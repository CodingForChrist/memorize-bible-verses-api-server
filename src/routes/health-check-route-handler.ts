import { ApiBibleClient } from "../services/api-bible/api-bible-client.ts";
import type { Request, Response } from "express";
import npmPackage from "../../package.json" with { type: "json" };

export default async function healthCheckRouteHandler(
  _request: Request,
  response: Response,
) {
  type HealthCheckResponse = {
    status: "UP" | "DOWN";
    timestamp: number;
    version: string;
    checks: {
      apiBible: {
        status: "UP" | "DOWN";
        responseTimeInMilliseconds?: number;
        sampleResponse?: Record<string, unknown>;
      };
    };
  };
  const healthCheckResponse: HealthCheckResponse = {
    status: "UP",
    timestamp: Date.now(),
    version: npmPackage.version,
    checks: {
      apiBible: {
        status: "UP",
      },
    },
  };

  try {
    // use new ApiBibleClient to bypass cache
    const apiBibleClient = new ApiBibleClient();

    const start = performance.now();
    const results = await apiBibleClient.getVerse(
      "bba9f40183526463-01",
      "GAL.2.20",
      { contentType: "text" },
    );
    const end = performance.now();
    const duration = end - start;
    healthCheckResponse.checks.apiBible.responseTimeInMilliseconds = Number(
      duration.toFixed(2),
    );
    healthCheckResponse.checks.apiBible.sampleResponse = results;
  } catch {
    healthCheckResponse.checks.apiBible.status = "DOWN";
  }
  response.status(200).json(healthCheckResponse);
}
