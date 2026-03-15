import { NextResponse } from "next/server";
import { orchestrateChatResponse } from "@/services/chat/chatOrchestratorService";
import { parseJsonBody, validateChatBody } from "@/lib/apiValidation";
import { runtimeConfig } from "@/lib/runtimeConfig";
import { checkRateLimit, getRateLimitKey } from "@/services/security/rateLimitService";
import { buildCorsHeaders } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(request)
  });
}

export async function POST(request: Request) {
  const requestId =
    request.headers.get("x-request-id") ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `req-${Date.now()}`);

  try {
    const limit = checkRateLimit(
      getRateLimitKey(request, "chat"),
      runtimeConfig.chat.rateLimitMaxRequests,
      runtimeConfig.chat.rateLimitWindowMs
    );

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait before sending another message.",
          retryAfterSeconds: limit.retryAfterSeconds
        },
        {
          status: 429,
          headers: {
            ...buildCorsHeaders(request),
            "x-request-id": requestId,
            "retry-after": String(limit.retryAfterSeconds),
            "x-ratelimit-remaining": String(limit.remaining)
          }
        }
      );
    }

    const rawBody = await parseJsonBody(request);
    const validated = validateChatBody(rawBody);
    if (!validated.ok || !validated.value) {
      return NextResponse.json(
        { error: validated.error ?? "Invalid request payload." },
        {
          status: 400,
          headers: {
            ...buildCorsHeaders(request),
            "x-request-id": requestId,
            "x-ratelimit-remaining": String(limit.remaining)
          }
        }
      );
    }

    const response = await orchestrateChatResponse(
      validated.value.question,
      validated.value.sessionId
    );

    return NextResponse.json(response, {
      status: 200,
      headers: {
        ...buildCorsHeaders(request),
        "x-request-id": requestId,
        "x-ratelimit-remaining": String(limit.remaining)
      }
    });
  } catch (error) {
    console.error("/api/chat failed", { requestId, error });
    return NextResponse.json(
      { error: "Unable to process chat request." },
      {
        status: 500,
        headers: {
          ...buildCorsHeaders(request),
          "x-request-id": requestId
        }
      }
    );
  }
}
