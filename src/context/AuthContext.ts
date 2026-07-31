import { createContext } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  phoneVerified: boolean;
  profileImageUrl: string | null;
  isPlatformAdmin: boolean;
}

export interface SignupResult {
  userId: string;
  demoOtp: string | null;
}

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isPlatformAdmin: boolean;

  signup: (
    name: string,
    email: string,
    phoneNumber: string,
    password: string,
    acceptedTerms: boolean,
  ) => Promise<SignupResult>;

  verifyPhone: (userId: string, otp: string) => Promise<void>;

  resendOtp: (userId: string) => Promise<{ demoOtp: string | null }>;

  login: (email: string, password: string) => Promise<void>;

  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
