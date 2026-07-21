import { createContext } from "react";
import type { Session } from "@supabase/supabase-js";
import type { User } from "../types/user";

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isPlatformAdmin: boolean;
  signUp: (
    name: string,
    email: string,
    phone: string,
    password: string,
  ) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
