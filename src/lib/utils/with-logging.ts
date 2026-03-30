import { NextRequest } from "next/server";
import { logger } from "./logger";
import { errorResponse } from "./api-auth";

type RouteHandler = (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<Response>;

/**
 * Wraps a route handler with structured logging.
 * Logs request start, completion (with duration and status), and errors.
 * Can be incrementally adopted — wrap individual handlers as needed.
 *
 * Usage:
 *   export const POST = withLogging("POST /api/v1/auth/login", async (request) => {
 *     // ... your handler logic ...
 *   });
 */
export function withLogging(name: string, handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    const requestId = crypto.randomUUID();
    const start = performance.now();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const path = new URL(request.url).pathname;
    const method = request.method;

    logger.info("request.start", { requestId, path, method, ip });

    try {
      const response = await handler(request, context);
      const durationMs = Math.round(performance.now() - start);

      logger.info("request.complete", {
        requestId,
        path,
        method,
        statusCode: response.status,
        durationMs,
      });

      // Add requestId to response headers for tracing
      response.headers.set("x-request-id", requestId);
      return response;
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);
      const errMessage = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;

      logger.error("request.error", {
        requestId,
        path,
        method,
        durationMs,
        error: errMessage,
        stack: stack,
      });

      return errorResponse(error);
    }
  };
}
