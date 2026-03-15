import { NextResponse } from "next/server";
import { recordUserDetails } from "@/services/capture/contactCaptureService";
import { notifySiteOwner } from "@/services/notifications/notificationService";
import { parseJsonBody, validateContactCaptureBody } from "@/lib/apiValidation";
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
      getRateLimitKey(request, "capture-contact"),
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
    const validated = validateContactCaptureBody(rawBody);
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

    const contact = await recordUserDetails({
      email: validated.value.email,
      name: validated.value.name,
      notes: validated.value.notes,
      relatedUnknownQuestionId: validated.value.relatedUnknownQuestionId
    });

    await notifySiteOwner({
      type: "recruiter_interest",
      title: "Recruiter follow-up captured",
      message: "A visitor shared contact details for follow-up.",
      metadata: {
        email: contact.email,
        name: contact.name,
        relatedUnknownQuestionId: contact.relatedUnknownQuestionId,
        notes: contact.notes
      }
    });

    return NextResponse.json(
      {
        message:
          "Thank you. Your details are captured and Shubhanshu will follow up soon.",
        contact
      },
      {
        status: 201,
        headers: {
          ...buildCorsHeaders(request),
          "x-request-id": requestId
        }
      }
    );
  } catch (error) {
    console.error("/api/capture/contact failed", { requestId, error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save contact." },
      {
        status: 400,
        headers: {
          ...buildCorsHeaders(request),
          "x-request-id": requestId
        }
      }
    );
  }
}
