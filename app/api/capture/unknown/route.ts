import { NextResponse } from "next/server";
import { recordUnknownQuestion } from "@/services/capture/unknownQuestionService";
import { notifySiteOwner } from "@/services/notifications/notificationService";
import { parseJsonBody, validateUnknownCaptureBody } from "@/lib/apiValidation";
import { checkRateLimit, getRateLimitKey } from "@/services/security/rateLimitService";
import { runtimeConfig } from "@/lib/runtimeConfig";
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
      getRateLimitKey(request, "capture-unknown"),
      runtimeConfig.capture.rateLimitMaxRequests,
      runtimeConfig.capture.rateLimitWindowMs
    );

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait before submitting again.",
          retryAfterSeconds: limit.retryAfterSeconds
        },
        {
          status: 429,
          headers: {
            ...buildCorsHeaders(request),
            "x-request-id": requestId,
            "retry-after": String(limit.retryAfterSeconds)
          }
        }
      );
    }

    const rawBody = await parseJsonBody(request);
    const validated = validateUnknownCaptureBody(rawBody);
    if (!validated.ok || !validated.value) {
      return NextResponse.json(
        { error: validated.error ?? "Invalid request payload." },
        {
          status: 400,
          headers: {
            ...buildCorsHeaders(request),
            "x-request-id": requestId
          }
        }
      );
    }

    const unknown = await recordUnknownQuestion(
      validated.value.question,
      validated.value.sessionId
    );

    await notifySiteOwner({
      type: "unknown_question",
      title: "Unknown question captured",
      message: "A question was manually recorded through capture API.",
      metadata: {
        unknownQuestionId: unknown.id,
        question: unknown.question,
        sessionId: validated.value.sessionId
      }
    });

    return NextResponse.json(
      { unknown },
      {
        status: 201,
        headers: {
          ...buildCorsHeaders(request),
          "x-request-id": requestId
        }
      }
    );
  } catch (error) {
    console.error("/api/capture/unknown failed", { requestId, error });
    return NextResponse.json(
      { error: "Unable to record unknown question." },
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
