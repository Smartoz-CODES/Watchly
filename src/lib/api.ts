// Watchly Authentication API client.
// Replaces Supabase auth with the custom REST backend documented in
// "Watchly Authentication API — Frontend Integration & Test Handoff".
//
// Base URL comes from VITE_API_BASE_URL (falls back to the Render demo
// deployment). Tokens persist in localStorage per the guide's deadline
// note; a production hardening pass should move the refresh token into
// a Secure, HttpOnly cookie.

import type { User } from "../types/user";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "https://watchly-m7jn.onrender.com";

const AUTH_PREFIX = "/api/v1/auth";

const ACCESS_KEY = "watchly_access_token";
const REFRESH_KEY = "watchly_refresh_token";
const USER_KEY = "watchly_user";

// ---------------------------------------------------------------------------
// Types (exact camelCase field names per the guide)
// ---------------------------------------------------------------------------

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  phoneVerified: boolean;
  profileImageUrl: string | null;
  isPlatformAdmin: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface OtpInfo {
  expiresInSeconds: number;
  demoOtp?: string;
}

export function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    "message" in err
  );
}

// ---------------------------------------------------------------------------
// Token + user storage
// ---------------------------------------------------------------------------

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function storeTokens(tokens: AuthTokens): void {
  localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function storeUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Maps the backend's camelCase user object onto the app-wide snake_case
 * `User` shape so every existing page keeps working untouched.
 * `date_joined` isn't returned by the auth API, so we preserve whatever
 * is already stored (or stamp "now" for a brand-new account).
 */
export function mapApiUser(u: ApiUser, existing?: User | null): User {
  return {
    user_id: u.id,
    name: u.name,
    email: u.email,
    phone_number: u.phoneNumber,
    phone_verified: u.phoneVerified,
    email_verified: u.phoneVerified,
    profile_image_url: u.profileImageUrl,
    is_platform_admin: u.isPlatformAdmin,
    date_joined: existing?.date_joined ?? new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Core request helper
// ---------------------------------------------------------------------------

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  accessToken?: string | null;
}

async function apiRequest<T>(
  path: string,
  { method = "POST", body, accessToken }: RequestOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw {
      code: "NETWORK_ERROR",
      message:
        "Could not reach the Watchly server. Check your connection and try again.",
    } satisfies ApiError;
  }

  if (response.status === 204) return null as T;

  let payload: {
    success: boolean;
    data?: T;
    error?: ApiError;
  };
  try {
    payload = await response.json();
  } catch {
    throw {
      code: "INVALID_RESPONSE",
      message: "The server returned an unexpected response.",
    } satisfies ApiError;
  }

  if (!response.ok || payload.success === false) {
    throw (
      payload.error ?? {
        code: "UNKNOWN_ERROR",
        message: "Something went wrong. Please try again.",
      }
    );
  }

  return payload.data as T;
}

// ---------------------------------------------------------------------------
// Single-flight refresh + authenticated requests
// ---------------------------------------------------------------------------

let refreshPromise: Promise<AuthTokens> | null = null;

async function refreshTokens(): Promise<AuthTokens> {
  // Never call refresh concurrently for the same token (guide §7):
  // queue everything behind one in-flight refresh.
  if (!refreshPromise) {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return Promise.reject({
        code: "INVALID_REFRESH_TOKEN",
        message: "No refresh token available.",
      } satisfies ApiError);
    }
    refreshPromise = apiRequest<{ tokens: AuthTokens }>(
      `${AUTH_PREFIX}/refresh-token`,
      { body: { refreshToken } },
    )
      .then(({ tokens }) => {
        // Atomically replace both tokens; the old refresh token is now dead.
        storeTokens(tokens);
        return tokens;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

const TOKEN_FAILURE_CODES = new Set([
  "INVALID_ACCESS_TOKEN",
  "AUTHENTICATION_REQUIRED",
  "INVALID_SESSION",
]);

/**
 * Sends an authenticated request. On an access-token failure it performs
 * exactly one refresh-and-retry cycle; if the refresh itself fails, the
 * local session is cleared and the error propagates so the caller can
 * route to login.
 */
export async function authedRequest<T>(
  path: string,
  options: Omit<RequestOptions, "accessToken"> = {},
): Promise<T> {
  try {
    return await apiRequest<T>(path, {
      ...options,
      accessToken: getAccessToken(),
    });
  } catch (err) {
    if (!isApiError(err) || !TOKEN_FAILURE_CODES.has(err.code)) throw err;
    try {
      const tokens = await refreshTokens();
      return await apiRequest<T>(path, {
        ...options,
        accessToken: tokens.accessToken,
      });
    } catch (refreshErr) {
      clearSession();
      throw refreshErr;
    }
  }
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

export const authApi = {
  signup(input: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
  }): Promise<{ user: ApiUser; otp: OtpInfo }> {
    return apiRequest(`${AUTH_PREFIX}/signup`, {
      body: { ...input, acceptedTerms: true },
    });
  },

  verifyPhone(
    userId: string,
    otp: string,
  ): Promise<{ user: ApiUser; tokens: AuthTokens }> {
    return apiRequest(`${AUTH_PREFIX}/verify-phone`, {
      body: { userId, otp },
    });
  },

  resendOtp(userId: string): Promise<{ otp: OtpInfo }> {
    return apiRequest(`${AUTH_PREFIX}/resend-otp`, { body: { userId } });
  },

  login(
    email: string,
    password: string,
  ): Promise<{ user: ApiUser; tokens: AuthTokens }> {
    return apiRequest(`${AUTH_PREFIX}/login`, { body: { email, password } });
  },

  /** Revokes the current device session. 204 on success. */
  logout(): Promise<null> {
    return authedRequest(`${AUTH_PREFIX}/logout`);
  },
};
