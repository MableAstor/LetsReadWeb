import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // ========================================
  // 1. ตรวจสอบสถานะการเข้าสู่ระบบ
  // ========================================
  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("[Auth] Event:", event);
        console.log(
          "[Auth] Has session:",
          Boolean(currentSession)
        );

        if (mounted) {
          setSession(currentSession);
          setLoading(false);
        }
      }
    );

    // ตรวจสอบ Session ที่มีอยู่แล้ว
    const loadSession = async () => {
      try {
        const {
          data,
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error(
            "[Auth] Get session error:",
            error.message
          );

          setSession(null);
          return;
        }

        console.log(
          "[Auth] Initial session:",
          Boolean(data?.session)
        );

        setSession(data?.session ?? null);
      } catch (error) {
        console.error(
          "[Auth] Session error:",
          error
        );

        if (mounted) {
          setSession(null);
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

  // ========================================
  // 2. ซิงก์ข้อมูลผู้ใช้ไปยัง Backend
  // รองรับ Google / Facebook / LINE / Email
  // ========================================
  useEffect(() => {
    const accessToken = session?.access_token;

    // ยังไม่ได้เข้าสู่ระบบ ไม่ต้องซิงก์ข้อมูล
    if (!accessToken) {
      return;
    }

    const syncProfile = async () => {
      try {
        console.log(
          "[Auth] Starting profile sync..."
        );

        const response = await fetch(`${API_URL}/sync-profile`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
});

        // อ่านผลลัพธ์จาก Backend
        const result = await response.json();

        if (!response.ok) {
          console.error(
            "[Auth] Profile sync failed:",
            result.message,
            result.error ?? ""
          );

          return;
        }

        console.log(
          "[Auth] Profile sync successful:",
          result.profile
        );
      } catch (error) {
        console.error(
          "[Auth] Cannot connect to profile sync API:",
          error
        );
      }
    };

    // เรียก Backend หลังได้ Session แล้ว
    syncProfile();
  }, [session?.access_token]);

  // ========================================
  // 3. ส่งข้อมูลให้ Component อื่นใช้งาน
  // ========================================
  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ========================================
// Custom Hook
// ========================================
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}