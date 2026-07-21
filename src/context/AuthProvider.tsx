import { useState, useEffect, useCallback, type ReactNode } from "react";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { AuthContext, type AuthContextValue } from "./AuthContext";
import type { User } from "../types/user";
import { useToast } from "../hooks/use-toast";

// ─── Helper: fetch full user record from the users table ──────────────────────
// Supabase Auth stores only auth-level data (email, phone, metadata).
// Our users table has the full profile including is_platform_admin.
// This function fetches it using the auth user's id as the lookup key.

async function fetchUserRecord(authUserId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", authUserId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as User;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // loading starts true. ProtectedRoute waits for it to flip false
  // before deciding whether to render or redirect. Without this,
  // every page refresh would briefly flash the login screen even
  // for users who are already authenticated.
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const isPlatformAdmin = user?.is_platform_admin ?? false;

  // ─── Session listener ──────────────────────────────────────────────────────
  // onAuthStateChange fires immediately with the current session on mount
  // (INITIAL_SESSION event), then fires again on every login, logout, or
  // token refresh. This is the single source of truth for auth state.

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, currentSession: Session | null) => {
        setSession(currentSession);

        if (currentSession?.user) {
          // Fetch the full user record from our users table so we have
          // is_platform_admin and all other custom fields, not just what
          // Supabase Auth stores.
          const userRecord = await fetchUserRecord(currentSession.user.id);
          setUser(userRecord);
        } else {
          // Logged out or no session — clear user state
          setUser(null);
        }

        // Whether we got a session or not, the initial check is done.
        // Flip loading to false so ProtectedRoute can make its decision.
        setLoading(false);
      },
    );

    // Clean up the subscription when the provider unmounts.
    // Without this, the listener keeps firing after logout.
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ─── signUp ────────────────────────────────────────────────────────────────
  // TRD Section 11.1: supabase.auth.signUp({ email, password, phone,
  // options: { data: { name } } })
  // name goes in options.data (Supabase user_metadata) so it is stored
  // alongside the auth record. After this call succeeds, the OTP screen
  // appears. verifyOtp completes the registration.

  const signUp = useCallback(
    async (name: string, email: string, phone: string, password: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        phone,
        options: {
          data: { name },
        },
      });

      if (error) {
        showToast(error.message, "error");
        throw error;
      }
      // On success: Supabase sends OTP to the phone number.
      // SignupPage moves to Step 2 (OTPInput) after this resolves.
    },
    [showToast],
  );

  // ─── verifyOtp ─────────────────────────────────────────────────────────────
  // TRD Section 11.1: supabase.auth.verifyOtp({ phone, token, type: 'sms' })
  // Called from SignupPage Step 2 when the user submits their OTP code.
  // On success: onAuthStateChange fires, user record is fetched, session
  // is established. SignupPage handles the community param check and redirect.

  const verifyOtp = useCallback(
    async (phone: string, token: string) => {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });

      if (error) {
        showToast(error.message, "error");
        throw error;
      }
      // On success: onAuthStateChange fires automatically.
      // SignupPage handles redirect after this resolves.
    },
    [showToast],
  );

  // ─── signIn ────────────────────────────────────────────────────────────────
  // TRD Section 11.1: supabase.auth.signInWithPassword({ email, password })
  // TRD FR-02: show a single generic error — do not reveal whether the
  // email exists or the password was wrong.

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        showToast("Invalid email or password", "error");
        throw error;
      }
    },
    [showToast],
  );

  // ─── signOut ───────────────────────────────────────────────────────────────
  // TRD Section 11.1: supabase.auth.signOut()
  // onAuthStateChange fires after this and sets user/session to null.

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      showToast(error.message, "error");
      throw error;
    }
  }, [showToast]);

  // ─── deleteAccount ─────────────────────────────────────────────────────────
  // LLD Section 6.1: calls a Supabase Edge Function that sets
  // is_deleted = true, deleted_at = now(), anonymizes PII (name, email,
  // phone), then signs the user out.
  // NDPA compliance: soft delete preserves referential integrity across
  // six tables while removing personally identifying information.

  const deleteAccount = useCallback(async () => {
    const { error } = await supabase.functions.invoke("delete-account");

    if (error) {
      showToast("Failed to delete account. Please try again.", "error");
      throw error;
    }

    await supabase.auth.signOut();
  }, [showToast]);

  // ─── Context value ─────────────────────────────────────────────────────────

  const value: AuthContextValue = {
    user,
    session,
    loading,
    isPlatformAdmin,
    signUp,
    verifyOtp,
    signIn,
    signOut,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
