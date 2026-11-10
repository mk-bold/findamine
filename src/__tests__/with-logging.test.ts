import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { withLogging } from "@/lib/utils/with-logging";
import { logger } from "@/lib/utils/logger";
import { ApiError } from "@/lib/utils/api-auth";

vi.mock("@/lib/utils/logger", () => ({ logger: { info: vi.fn(), error: vi.fn() } }));

beforeEach(() => vi.clearAllMocks());

describe("withLogging route wrapper", () => {
  it("passes the request and required Next context through without changing the response", async () => {
    const request = new NextRequest("https://findamine.app/api/example");
    const context = { params: Promise.resolve({ id: "example" }) };
    const response = Response.json({ ok: true }, { status: 201 });
    const handler = vi.fn(async () => response);
    const result = await withLogging("example", handler)(request, context);
    expect(handler).toHaveBeenCalledWith(request, context);
    expect(result).toBe(response);
    expect(result.status).toBe(201);
    expect(result.headers.get("x-request-id")).toBeTruthy();
    expect(logger.info).toHaveBeenCalledWith("request.complete", expect.objectContaining({ statusCode: 201 }));
  });

  it("continues to support handlers which ignore context", async () => {
    const wrapped = withLogging("example", async (request: NextRequest) => Response.json({ method: request.method }));
    const result = await wrapped(new NextRequest("https://findamine.app/api/example"), { params: Promise.resolve({}) });
    expect(await result.json()).toEqual({ method: "GET" });
  });

  it("preserves API error mapping and error logging", async () => {
    const wrapped = withLogging("example", async () => { throw new ApiError(403, "Not permitted"); });
    const result = await wrapped(new NextRequest("https://findamine.app/api/example"), { params: Promise.resolve({}) });
    expect(result.status).toBe(403);
    expect(await result.json()).toEqual({ error: "Not permitted" });
    expect(logger.error).toHaveBeenCalledWith("request.error", expect.objectContaining({ error: "Not permitted" }));
  });
});
