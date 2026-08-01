// Watchly Authentication API client.
// Replaces Supabase auth with the custom REST backend documented in
// "Watchly Authentication API — Frontend Integration & Test Handoff".
//
// Base URL comes from VITE_API_BASE_URL (falls back to the Render demo
// deployment). Tokens persist in localStorage per the guide's deadline
// note; a production hardening pass should move the refresh token into
// a Secure, HttpOnly cookie.

import type { User } from "../types/user";
import type {
  Community,
  CommunityMembership,
  CommunityRequest,
} from "../types/community";
import type { Alert } from "../types/alert";
import type {
  CreateIncidentInput,
  Evidence,
  Incident,
} from "../types/incident";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "https://watchly-m7jn.onrender.com";

const AUTH_PREFIX = "/api/v1/auth";
const ACCESS_KEY = "watchly_access_token";
const REFRESH_KEY = "watchly_refresh_token";
const USER_KEY = "watchly_user";

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
    typeof err === "object" && err !== null && "code" in err && "message" in err
  );
}

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

let refreshPromise: Promise<AuthTokens> | null = null;

async function refreshTokens(): Promise<AuthTokens> {
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

  logout(): Promise<null> {
    return authedRequest(`${AUTH_PREFIX}/logout`);
  },
};

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

async function apiPaginatedRequest<T>(
  path: string,
  { method = "GET", body, accessToken }: RequestOptions = {},
): Promise<PaginatedResult<T>> {
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

  let payload: {
    success: boolean;
    data?: T[];
    pagination?: PaginationMeta;
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

  return {
    data: payload.data ?? [],
    pagination: payload.pagination as PaginationMeta,
  };
}

async function authedPaginatedRequest<T>(
  path: string,
  options: Omit<RequestOptions, "accessToken"> = {},
): Promise<PaginatedResult<T>> {
  try {
    return await apiPaginatedRequest<T>(path, {
      ...options,
      accessToken: getAccessToken(),
    });
  } catch (err) {
    if (!isApiError(err) || !TOKEN_FAILURE_CODES.has(err.code)) throw err;
    try {
      const tokens = await refreshTokens();
      return await apiPaginatedRequest<T>(path, {
        ...options,
        accessToken: tokens.accessToken,
      });
    } catch (refreshErr) {
      clearSession();
      throw refreshErr;
    }
  }
}

async function authedUpload<T>(path: string, formData: FormData): Promise<T> {
  const doFetch = async (accessToken: string | null): Promise<Response> => {
    return fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: formData,
    });
  };

  const parse = async (response: Response): Promise<T> => {
    let payload: { success: boolean; data?: T; error?: ApiError };
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
  };

  let response: Response;
  try {
    response = await doFetch(getAccessToken());
  } catch {
    throw {
      code: "NETWORK_ERROR",
      message:
        "Could not reach the Watchly server. Check your connection and try again.",
    } satisfies ApiError;
  }

  try {
    return await parse(response);
  } catch (err) {
    if (!isApiError(err) || !TOKEN_FAILURE_CODES.has(err.code)) throw err;
    const tokens = await refreshTokens();
    const retryResponse = await doFetch(tokens.accessToken);
    return parse(retryResponse);
  }
}

function resolveFileUrl(path: string): string {
  return path.startsWith("/") ? `${API_BASE_URL}${path}` : path;
}

interface ApiCommunity {
  id: string;
  name: string;
  slug: string;
  state: string;
  lga: string;
  description: string | null;
  status: "Pending" | "Active" | "Declined";
  memberCount: number;
  adminName: string | null;
  activeSince: string;
}

interface ApiMyCommunity extends ApiCommunity {
  membershipId: string;
  membershipRole: "Member" | "Community Admin";
  smsAlertsEnabled: boolean;
  joinedAt: string;
}

interface ApiCommunityRequest extends ApiCommunity {
  requestedBy: { id: string; name: string; email: string } | null;
  reviewedBy: { id: string; name: string } | null;
  reviewedAt: string | null;
  declineReason: string | null;
  createdAt: string;
}

function mapApiCommunity(api: ApiCommunity): Community {
  return {
    community_id: api.id,
    name: api.name,
    state: api.state,
    lga: api.lga,
    description: api.description,
    slug: api.slug,
    status: api.status,
    member_count: api.memberCount,
    admin_name: api.adminName,
    active_since: api.activeSince,
  };
}

function mapApiMembership(api: ApiMyCommunity): CommunityMembership {
  return {
    membership_id: api.membershipId,
    community_id: api.id,
    membership_role: api.membershipRole,
    sms_alerts_enabled: api.smsAlertsEnabled,
    joined_at: api.joinedAt,
  };
}

function mapApiCommunityRequest(api: ApiCommunityRequest): CommunityRequest {
  return {
    community_id: api.id,
    name: api.name,
    state: api.state,
    lga: api.lga,
    description: api.description,
    status: api.status,
    requested_by: api.requestedBy
      ? {
          user_id: api.requestedBy.id,
          name: api.requestedBy.name,
          email: api.requestedBy.email,
        }
      : { user_id: "", name: "Unknown", email: "" },
    date_created: api.createdAt,
    reviewed_by: api.reviewedBy?.name ?? null,
    reviewed_at: api.reviewedAt,
    decline_reason: api.declineReason,
  };
}

interface ApiEvidence {
  id: string;
  fileUrl: string;
  fileType: "JPEG" | "PNG";
  createdAt: string;
}

interface ApiStatusHistoryEntry {
  status: Incident["current_status"];
  changedBy: string | null;
  reason: string | null;
  timestamp: string;
}

interface ApiIncident {
  id: string;
  displayCode: string;
  reporterId: string | null;
  reporterName: string;
  communityId: string;
  communityName: string;
  category: Incident["category"];
  otherDescription: string | null;
  description: string;
  location: string;
  occurredAt: string;
  createdAt: string;
  currentStatus: Incident["current_status"];
  corroborationCount: number;
  evidence: ApiEvidence[];
  statusHistory: ApiStatusHistoryEntry[];
  hasUserCorroborated: boolean;
}

function mapApiIncident(api: ApiIncident): Incident {
  return {
    incident_id: api.id,
    display_code: api.displayCode,
    reporter_id: api.reporterId,
    reporter_name: api.reporterName,
    community_id: api.communityId,
    community_name: api.communityName,
    category: api.category,
    other_description: api.otherDescription,
    description: api.description,
    location: api.location,
    occurred_at: api.occurredAt,
    created_at: api.createdAt,
    current_status: api.currentStatus,
    corroboration_count: api.corroborationCount,
    evidence: api.evidence.map(
      (item): Evidence => ({
        evidence_id: item.id,
        file_url: resolveFileUrl(item.fileUrl),
        file_type: item.fileType,
        created_at: item.createdAt,
      }),
    ),
    status_history: api.statusHistory.map((entry) => ({
      status: entry.status,
      changed_by: entry.changedBy,
      reason: entry.reason,
      timestamp: entry.timestamp,
    })),
    has_user_corroborated: api.hasUserCorroborated,
  };
}

interface ApiAlert {
  id: string;
  alertType: Alert["alert_type"];
  incidentId: string;
  communityId: string;
  communityName: string;
  incidentCategory: string;
  incidentStatus: Incident["current_status"];
  createdAt: string;
  isRead: boolean;
}

function mapApiAlert(api: ApiAlert): Alert {
  return {
    alert_id: api.id,
    alert_type: api.alertType,
    incident_id: api.incidentId,
    community_id: api.communityId,
    community_name: api.communityName,
    incident_category: api.incidentCategory,
    incident_status: api.incidentStatus,
    created_at: api.createdAt,
    is_read: api.isRead,
  };
}

export interface CommunityFilters {
  state?: string;
  lga?: string;
  search?: string;
}

export interface CommunityRequestInput {
  name: string;
  state: string;
  lga: string;
  description?: string;
}

export const communitiesApi = {
  async search(filters: CommunityFilters = {}): Promise<Community[]> {
    const params = new URLSearchParams();
    if (filters.state) params.set("state", filters.state);
    if (filters.lga) params.set("lga", filters.lga);
    if (filters.search) params.set("search", filters.search);
    const query = params.toString();
    const { data } = await authedPaginatedRequest<ApiCommunity>(
      `/api/v1/communities${query ? `?${query}` : ""}`,
      { method: "GET" },
    );
    return data.map(mapApiCommunity);
  },

  async bySlug(slug: string): Promise<Community> {
    const data = await authedRequest<{ community: ApiCommunity }>(
      `/api/v1/communities/slug/${encodeURIComponent(slug)}`,
      { method: "GET" },
    );
    return mapApiCommunity(data.community);
  },

  async mine(): Promise<{
    communities: Community[];
    memberships: CommunityMembership[];
  }> {
    const data = await authedRequest<{ communities: ApiMyCommunity[] }>(
      "/api/v1/communities/mine",
      { method: "GET" },
    );
    return {
      communities: data.communities.map(mapApiCommunity),
      memberships: data.communities.map(mapApiMembership),
    };
  },

  join(communityId: string): Promise<null> {
    return authedRequest(`/api/v1/communities/${communityId}/join`);
  },

  leave(communityId: string): Promise<null> {
    return authedRequest(`/api/v1/communities/${communityId}/membership`, {
      method: "DELETE",
    });
  },

  async request(
    input: CommunityRequestInput,
  ): Promise<{ status: "created" | "duplicates"; duplicates: Community[] }> {
    const data = await authedRequest<
      | { status: "created"; community: ApiCommunity }
      | { status: "duplicates"; duplicates: ApiCommunity[] }
    >("/api/v1/community-requests", { body: input });
    if (data.status === "duplicates") {
      return {
        status: "duplicates",
        duplicates: data.duplicates.map(mapApiCommunity),
      };
    }
    return { status: "created", duplicates: [] };
  },

  async adminList(
    status: "Pending" | "Active" | "Declined" = "Pending",
  ): Promise<CommunityRequest[]> {
    const { data } = await authedPaginatedRequest<ApiCommunityRequest>(
      `/api/v1/admin/communities?status=${status}`,
      { method: "GET" },
    );
    return data.map(mapApiCommunityRequest);
  },

  approve(communityId: string, assignAdmin: boolean): Promise<null> {
    return authedRequest(`/api/v1/admin/communities/${communityId}/approve`, {
      body: { assignAdmin },
    });
  },

  decline(communityId: string, reason: string): Promise<null> {
    return authedRequest(`/api/v1/admin/communities/${communityId}/decline`, {
      body: { reason },
    });
  },
};

export const incidentsApi = {
  async create(input: CreateIncidentInput): Promise<string> {
    const data = await authedRequest<{ incidentId: string }>(
      "/api/v1/incidents",
      {
        body: {
          communityId: input.community_id,
          category: input.category,
          otherDescription: input.other_description,
          description: input.description,
          location: input.location,
          occurredAt: input.occurred_at,
        },
      },
    );
    return data.incidentId;
  },

  async listByCommunity(
    communityId: string,
    page = 1,
    limit = 20,
  ): Promise<{ incidents: Incident[]; total: number; hasNextPage: boolean }> {
    const { data, pagination } = await authedPaginatedRequest<ApiIncident>(
      `/api/v1/communities/${communityId}/incidents?page=${page}&limit=${limit}`,
      { method: "GET" },
    );
    return {
      incidents: data.map(mapApiIncident),
      total: pagination.total,
      hasNextPage: pagination.hasNextPage,
    };
  },

  async mine(page = 1, limit = 50): Promise<Incident[]> {
    const { data } = await authedPaginatedRequest<ApiIncident>(
      `/api/v1/incidents/mine?page=${page}&limit=${limit}`,
      { method: "GET" },
    );
    return data.map(mapApiIncident);
  },

  async detail(incidentId: string): Promise<Incident> {
    const data = await authedRequest<{ incident: ApiIncident }>(
      `/api/v1/incidents/${incidentId}`,
      { method: "GET" },
    );
    return mapApiIncident(data.incident);
  },

  async updateStatus(
    incidentId: string,
    status: Incident["current_status"],
    reason?: string,
  ): Promise<Incident> {
    const data = await authedRequest<{ incident: ApiIncident }>(
      `/api/v1/incidents/${incidentId}/status`,
      { method: "PATCH", body: { status, reason } },
    );
    return mapApiIncident(data.incident);
  },

  corroborate(incidentId: string): Promise<null> {
    return authedRequest(`/api/v1/incidents/${incidentId}/corroborate`);
  },

  async corroborators(
    incidentId: string,
    page = 1,
    limit = 20,
  ): Promise<{ name: string; timestamp: string }[]> {
    const { data } = await authedPaginatedRequest<{
      name: string;
      timestamp: string;
    }>(
      `/api/v1/incidents/${incidentId}/corroborators?page=${page}&limit=${limit}`,
      { method: "GET" },
    );
    return data;
  },

  async uploadEvidence(incidentId: string, files: File[]): Promise<Evidence[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const data = await authedUpload<{ evidence: ApiEvidence[] }>(
      `/api/v1/incidents/${incidentId}/evidence`,
      formData,
    );
    return data.evidence.map((item) => ({
      evidence_id: item.id,
      file_url: resolveFileUrl(item.fileUrl),
      file_type: item.fileType,
      created_at: item.createdAt,
    }));
  },
};

export const alertsApi = {
  async list(page = 1, limit = 50): Promise<Alert[]> {
    const { data } = await authedPaginatedRequest<ApiAlert>(
      `/api/v1/alerts?page=${page}&limit=${limit}`,
      { method: "GET" },
    );
    return data.map(mapApiAlert);
  },

  markRead(alertId: string): Promise<null> {
    return authedRequest(`/api/v1/alerts/${alertId}/read`);
  },
};

export const usersApi = {
  async me(): Promise<ApiUser> {
    const data = await authedRequest<{ user: ApiUser }>("/api/v1/users/me", {
      method: "GET",
    });
    return data.user;
  },

  async update(fields: {
    name?: string;
    profileImageUrl?: string | null;
  }): Promise<ApiUser> {
    const data = await authedRequest<{ user: ApiUser }>("/api/v1/users/me", {
      method: "PATCH",
      body: fields,
    });
    return data.user;
  },

  remove(): Promise<null> {
    return authedRequest("/api/v1/users/me", { method: "DELETE" });
  },
};
