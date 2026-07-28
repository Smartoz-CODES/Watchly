import { useState, useEffect, useCallback, type ReactNode } from "react";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { AuthContext, type AuthContextValue } from "./AuthContext";
import type { User } from "../types/user";
import { useToast } from "../hooks/use-toast";
import { AUTH_TOASTS } from "../lib/toast-messages";

// Helper that fetch full user record from the users table
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

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const isPlatformAdmin = user?.is_platform_admin ?? false;

  // Session listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, currentSession: Session | null) => {
        setSession(currentSession);
        if (currentSession?.user) {
          const userRecord = await fetchUserRecord(currentSession.user.id);
          setUser(userRecord);
        } else {
          // Logged out or no session, clear user state
          setUser(null);
        }
        setLoading(false);
      },
    );
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // signUp
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
        showToast("Sign up failed", error.message, "error");
        throw error;
      }
    },
    [showToast],
  );

  // verifyOtp
  const verifyOtp = useCallback(
    async (phone: string, token: string) => {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });
      if (error) {
        showToast("Verification failed", error.message, "error");
        throw error;
      }
    },
    [showToast],
  );

  // signIn
  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        showToast(
          AUTH_TOASTS.signInFailed.title,
          AUTH_TOASTS.signInFailed.description,
          "error",
        );
        throw error;
      }
    },
    [showToast],
  );

  // signOut
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showToast("Sign out failed", error.message, "error");
      throw error;
    }
  }, [showToast]);

  // deleteAccount
  const deleteAccount = useCallback(async () => {
    const { error } = await supabase.functions.invoke("delete-account");
    if (error) {
      showToast("Failed to delete account", "Please try again.", "error");
      throw error;
    }
    await supabase.auth.signOut();
  }, [showToast]);

  // Context value
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
