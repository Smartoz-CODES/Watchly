import { useState, useCallback, type ReactNode } from "react";
import {
  AuthContext,
  type AuthContextValue,
  type AuthSession,
  type PendingVerification,
} from "./AuthContext";
import type { User } from "../types/user";
import {
  authApi,
  usersApi,
  isApiError,
  mapApiUser,
  storeTokens,
  storeUser,
  getStoredUser,
  getAccessToken,
  getRefreshToken,
  clearSession,
} from "../lib/api";
import { useToast } from "../hooks/use-toast";
import { AUTH_TOASTS } from "../lib/toast-messages";

// Restores a persisted session synchronously on first render. The auth
// API has no "current user" endpoint, so the stored user is the source
// of truth until a protected request forces a token refresh.
function restoreSession(): { user: User | null; session: AuthSession | null } {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const user = getStoredUser();
  if (accessToken && refreshToken && user) {
    return { user, session: { accessToken, refreshToken } };
  }
  clearSession();
  return { user: null, session: null };
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initial = restoreSession();
  const [user, setUser] = useState<User | null>(initial.user);
  const [session, setSession] = useState<AuthSession | null>(initial.session);
  const [pendingVerification, setPendingVerification] =
    useState<PendingVerification | null>(null);
  // Session restore is synchronous (localStorage), so nothing is ever
  // "still loading" — but the flag stays in the contract because
  // ProtectedRoute and LandingRedirect key off it.
  const [loading] = useState(false);
  const { showToast } = useToast();

  const isPlatformAdmin = user?.is_platform_admin ?? false;

  const establishSession = useCallback(
    (apiUser: Parameters<typeof mapApiUser>[0], tokens: AuthSession) => {
      const mapped = mapApiUser(apiUser, getStoredUser());
      storeTokens(tokens);
      storeUser(mapped);
      setUser(mapped);
      setSession(tokens);
      setPendingVerification(null);
    },
    [],
  );

  // signUp — creates an unverified account and stages OTP verification.
  const signUp = useCallback(
    async (name: string, email: string, phone: string, password: string) => {
      try {
        const data = await authApi.signup({
          name,
          email,
          phoneNumber: phone,
          password,
        });
        setPendingVerification({
          userId: data.user.id,
          phone: data.user.phoneNumber,
          demoOtp: data.otp.demoOtp ?? null,
        });
      } catch (err) {
        if (isApiError(err) && err.code === "ACCOUNT_ALREADY_EXISTS") {
          showToast(
            AUTH_TOASTS.accountAlreadyExists.title,
            AUTH_TOASTS.accountAlreadyExists.description,
            "error",
          );
        } else if (isApiError(err)) {
          showToast("Sign up failed", err.message, "error");
        } else {
          showToast("Sign up failed", "Please try again.", "error");
        }
        throw err;
      }
    },
    [showToast],
  );

  // verifyOtp — keeps the historical (phone, token) signature; the
  // backend verifies by userId, which lives in pendingVerification.
  const verifyOtp = useCallback(
    async (_phone: string, token: string) => {
      if (!pendingVerification) {
        showToast(
          "Verification failed",
          "Start again from the sign up form.",
          "error",
        );
        throw new Error("No pending verification");
      }
      try {
        const data = await authApi.verifyPhone(
          pendingVerification.userId,
          token,
        );
        establishSession(data.user, data.tokens);
      } catch (err) {
        if (isApiError(err) && err.code === "PHONE_ALREADY_VERIFIED") {
          showToast(
            "Already verified",
            "Your phone is already verified — please log in.",
            "info",
          );
        }
        throw err;
      }
    },
    [pendingVerification, establishSession, showToast],
  );

  // resendOtp — issues a fresh code for the staged account.
  const resendOtp = useCallback(async () => {
    if (!pendingVerification) {
      throw new Error("No pending verification");
    }
    const data = await authApi.resendOtp(pendingVerification.userId);
    setPendingVerification({
      ...pendingVerification,
      demoOtp: data.otp.demoOtp ?? null,
    });
  }, [pendingVerification]);

  // signIn — authenticates and creates a device session. A correct
  // password on an unverified account routes back into OTP verification
  // (guide: 403 PHONE_NOT_VERIFIED with error.details.userId).
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const data = await authApi.login(email, password);
        establishSession(data.user, data.tokens);
      } catch (err) {
        if (isApiError(err) && err.code === "PHONE_NOT_VERIFIED") {
          const userId =
            typeof err.details?.userId === "string" ? err.details.userId : "";
          setPendingVerification({ userId, phone: "", demoOtp: null });
        }
        throw err;
      }
    },
    [establishSession],
  );

  // signOut — revokes the server session (best effort) and always
  // clears local state, per the guide's recommended flow.
  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Session may already be expired/revoked — local cleanup still runs.
    } finally {
      clearSession();
      setUser(null);
      setSession(null);
      setPendingVerification(null);
    }
  }, []);

  const updateProfile = useCallback(
    async (fields: { name?: string; profile_image_url?: string }) => {
      if (!user) throw new Error("No authenticated user");
      const apiUser = await usersApi.update({
        name: fields.name,
        profileImageUrl: fields.profile_image_url,
      });
      const updated = mapApiUser(apiUser, user);
      storeUser(updated);
      setUser(updated);
    },
    [user],
  );

  const deleteAccount = useCallback(async () => {
    try {
      await usersApi.remove();
    } finally {
      clearSession();
      setUser(null);
      setSession(null);
      setPendingVerification(null);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    session,
    loading,
    isPlatformAdmin,
    pendingVerification,
    signUp,
    verifyOtp,
    resendOtp,
    signIn,
    signOut,
    deleteAccount,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
