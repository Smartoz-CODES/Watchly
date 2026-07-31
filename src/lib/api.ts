// src/lib/api.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// ---------------------------------------------------------------------
// Token storage — centralized here so AuthProvider and this file agree
// on exactly one source of truth for where tokens live. Per the backend
// doc's own tradeoff: localStorage for this deadline-driven MVP, with
// the acknowledged XSS risk, moving to httpOnly cookies in a later
// hardening pass. Nothing else in the app should read/write these keys
// directly — always go through the functions below.
// ---------------------------------------------------------------------

const ACCESS_TOKEN_KEY = "watchly:access_token";
const REFRESH_TOKEN_KEY = "watchly:refresh_token";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ---------------------------------------------------------------------
// Error shape — matches the backend's documented error contract exactly:
// { success: false, error: { code, message, details } }
// ---------------------------------------------------------------------

export interface ApiErrorShape {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class ApiError extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.code = shape.code;
    this.details = shape.details;
  }
}

// ---------------------------------------------------------------------
// Single-flight refresh — if multiple requests fail with an expired
// token at the same time, only one of them actually calls refresh-token.
// The rest wait behind that same in-flight promise and retry once it
// resolves. This is the exact behavior the backend doc requires
// ("never call refresh concurrently for the same token").
// ---------------------------------------------------------------------

let refreshPromise: Promise<void> | null = null;

async function performTokenRefresh(): Promise<void> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();
    throw new ApiError({
      code: "INVALID_REFRESH_TOKEN",
      message: "No refresh token available",
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const payload = await response.json();

  if (!response.ok) {
    // Per the doc: an invalid/expired/already-used refresh token means
    // the session is genuinely over — clear everything, no retry.
    clearTokens();
    throw new ApiError(payload.error);
  }

  setTokens(payload.data.tokens.accessToken, payload.data.tokens.refreshToken);
}

function refreshTokenOnce(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ---------------------------------------------------------------------
// The main request function every hook should call instead of using
// fetch() directly. Attaches the access token automatically, retries
// exactly once after a successful refresh on a 401, and never retries
// more than once per call (per the doc: "one refresh attempt per failed
// request cycle is enough").
// ---------------------------------------------------------------------

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean; // for signup/login/verify/resend — no token to attach yet
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T | null> {
  const { skipAuth, headers, ...rest } = options;

  const doFetch = async (): Promise<Response> => {
    const accessToken = getAccessToken();

    return fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(!skipAuth && accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {}),
        ...headers,
      },
    });
  };

  let response = await doFetch();

  // A 401 on a protected request (not on signup/login/etc. themselves)
  // means the access token expired — refresh once, then retry the
  // original request exactly one time.
  if (response.status === 401 && !skipAuth) {
    try {
      await refreshTokenOnce();
      response = await doFetch();
    } catch {
      // Refresh itself failed — session is genuinely over.
      // Let the 401 below propagate so the caller can redirect to login.
    }
  }

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json();

  if (!response.ok) {
    throw new ApiError(payload.error);
  }

  return payload.data as T;
}
