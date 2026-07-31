import { createContext } from "react";
import type { User } from "../types/user";

/** Access/refresh token pair issued by the Watchly auth API. */
export interface AuthSession {
  accessToken: string;
  refreshToken: string;
}

/**
 * Tracks an account that has signed up (or attempted login) but not yet
 * completed phone verification. `demoOtp` is only present while the
 * backend runs in DEMO_MODE and is rendered on the verification screen.
 */
export interface PendingVerification {
  userId: string;
  phone: string;
  demoOtp: string | null;
}

export interface AuthContextValue {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  isPlatformAdmin: boolean;
  pendingVerification: PendingVerification | null;
  signUp: (
    name: string,
    email: string,
    phone: string,
    password: string,
  ) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<void>;
  resendOtp: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (fields: {
    name?: string;
    profile_image_url?: string;
  }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
