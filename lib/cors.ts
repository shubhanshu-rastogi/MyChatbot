const parseAllowedOrigins = (): string[] => {
  const raw = process.env.CORS_ALLOWED_ORIGINS?.trim();
  if (!raw) return [];

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const resolveAllowedOrigin = (requestOrigin: string | null): string => {
  const configured = parseAllowedOrigins();

  if (configured.length === 0) {
    return requestOrigin?.trim() || "*";
  }

  if (requestOrigin && configured.includes(requestOrigin)) {
    return requestOrigin;
  }

  return configured[0];
};

export const buildCorsHeaders = (request: Request): Record<string, string> => {
  const requestOrigin = request.headers.get("origin");
  const allowedOrigin = resolveAllowedOrigin(requestOrigin);

  return {
    "access-control-allow-origin": allowedOrigin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-request-id",
    "access-control-max-age": "86400",
    vary: "origin"
  };
};
