
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // 1. ตรวจสอบสถานะการเข้าสู่ระบบ
  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("[Auth] Event:", event);

        if (mounted) {
          setSession(currentSession);
          setLoading(false);

          if (!currentSession) {
            setProfile(null);
          }
        }
      }
    );

    const loadSession = async () => {
      try {
        const { data, error } =
          await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error("[Auth] Get session error:", error.message);
          setSession(null);
          setProfile(null);
          return;
        }

        setSession(data?.session ?? null);
      } catch (error) {
        console.error("[Auth] Session error:", error);

        if (mounted) {
          setSession(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2. ซิงก์ข้อมูลผู้ใช้ไปยัง Backend
  useEffect(() => {
    const accessToken = session?.access_token;

    if (!accessToken) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    let cancelled = false;

    const syncProfile = async () => {
      setProfileLoading(true);
      setProfile(null);

      try {
        console.log("[Auth] Starting profile sync...");

        const response = await fetch(
          `${API_URL}/api/auth/sync-profile`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          console.error(
            "[Auth] Profile sync failed:",
            result.message,
            result.error ?? ""
          );
          return;
        }

        if (!result?.user?.UserID) {
          console.error(
            "[Auth] Backend response ไม่มี UserID:",
            result
          );
          return;
        }

        setProfile(result.user);

        console.log(
          "[Auth] Profile sync successful:",
          result.user
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "[Auth] Cannot connect to profile sync API:",
            error
          );
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    };

    syncProfile();

    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  // 3. ส่งข้อมูลให้ Component อื่นใช้งาน
  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        userId: profile?.UserID ?? null,
        loading,
        profileLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
