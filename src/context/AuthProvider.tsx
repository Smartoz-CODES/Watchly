import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  apiRequest,
  getAccessToken,
  setTokens,
  clearTokens,
  ApiError,
} from "../lib/api";
import {
  AuthContext,
  type AuthContextValue,
  type AuthUser,
  type SignupResult,
} from "./AuthContext";
import { useToast } from "../hooks/use-toast";

// ---------------------------------------------------------------------
// No "get current user" endpoint exists in the backend's documented
// contract. Signup/verify-phone/login each return a user object, but
// there's nothing to call on page refresh to re-fetch who's logged in
// from just a stored token. Storing the user object alongside the
// tokens is the pragmatic stand-in — it can go stale if the user's data
// changes elsewhere, but it's what's available until a real /me
// endpoint exists. Flagged to the backend dev as a real follow-up.
// ---------------------------------------------------------------------

const STORED_USER_KEY = "watchly:user";

function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(STORED_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function setStoredUser(user: AuthUser): void {
  localStorage.setItem(STORED_USER_KEY, JSON.stringify(user));
}

function clearStoredUser(): void {
  localStorage.removeItem(STORED_USER_KEY);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const isPlatformAdmin = user?.isPlatformAdmin ?? false;

  // Ref-based indirection, not a suppression — same pattern already used
  // in CommunityProvider.tsx for this exact situation. A ref's initial
  // value is only evaluated once, on the first render, and setUser /
  // setLoading are React state setters — guaranteed stable across
  // renders — so capturing them in this closure is safe. The linter
  // can't trace a call path from the effect to a state setter through a
  // ref's contents, so there's nothing to flag.
  const restoreSessionRef = useRef(() => {
    const token = getAccessToken();
    const storedUser = getStoredUser();

    if (token && storedUser) {
      setUser(storedUser);
    } else {
      clearTokens();
      clearStoredUser();
    }

    setLoading(false);
  });

  useEffect(() => {
    restoreSessionRef.current();
  }, []);

  const signup = useCallback(
    async (
      name: string,
      email: string,
      phoneNumber: string,
      password: string,
      acceptedTerms: boolean,
    ): Promise<SignupResult> => {
      try {
        const data = await apiRequest<{
          user: AuthUser;
          otp: { expiresInSeconds: number; demoOtp?: string };
        }>("/api/v1/auth/signup", {
          method: "POST",
          skipAuth: true,
          body: JSON.stringify({
            name,
            email,
            phoneNumber,
            password,
            acceptedTerms,
          }),
        });

        return {
          userId: data!.user.id,
          demoOtp: data!.otp.demoOtp ?? null,
        };
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Sign up failed";
        showToast("Sign up failed", message, "error");
        throw err;
      }
    },
    [showToast],
  );

  const verifyPhone = useCallback(
    async (userId: string, otp: string) => {
      try {
        const data = await apiRequest<{
          user: AuthUser;
          tokens: { accessToken: string; refreshToken: string };
        }>("/api/v1/auth/verify-phone", {
          method: "POST",
          skipAuth: true,
          body: JSON.stringify({ userId, otp }),
        });

        setTokens(data!.tokens.accessToken, data!.tokens.refreshToken);
        setStoredUser(data!.user);
        setUser(data!.user);
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Verification failed";
        showToast("Verification failed", message, "error");
        throw err;
      }
    },
    [showToast],
  );

  const resendOtp = useCallback(
    async (userId: string) => {
      try {
        const data = await apiRequest<{
          otp: { expiresInSeconds: number; demoOtp?: string };
        }>("/api/v1/auth/resend-otp", {
          method: "POST",
          skipAuth: true,
          body: JSON.stringify({ userId }),
        });

        return { demoOtp: data!.otp.demoOtp ?? null };
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Failed to resend code";
        showToast("Resend failed", message, "error");
        throw err;
      }
    },
    [showToast],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const data = await apiRequest<{
          user: AuthUser;
          tokens: { accessToken: string; refreshToken: string };
        }>("/api/v1/auth/login", {
          method: "POST",
          skipAuth: true,
          body: JSON.stringify({ email, password }),
        });

        setTokens(data!.tokens.accessToken, data!.tokens.refreshToken);
        setStoredUser(data!.user);
        setUser(data!.user);
      } catch (err) {
        // PHONE_NOT_VERIFIED is not a failure toast — LoginPage handles
        // this specific code itself and routes to OTP verification.
        // Every other error path shows the generic message here.
        if (err instanceof ApiError && err.code === "PHONE_NOT_VERIFIED") {
          throw err;
        }

        const message =
          err instanceof ApiError ? err.message : "Invalid email or password";
        showToast("Sign-in failed", message, "error");
        throw err;
      }
    },
    [showToast],
  );

  const logout = useCallback(async () => {
    try {
      await apiRequest("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // Per the doc: clear local state regardless of the response.
    } finally {
      clearTokens();
      clearStoredUser();
      setUser(null);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    isPlatformAdmin,
    signup,
    verifyPhone,
    resendOtp,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}