import { useEffect, useState } from "react";
import UserAvatar from "./UserAvatar";
import { supabase } from "../lib/supabase";

export default function ReviewInput({ onClick }) {
  const [profile, setProfile] = useState(null);
  const [userName, setUserName] = useState("J");

  // โหลดรูปโปรไฟล์ของผู้ใช้ปัจจุบัน
  useEffect(() => {
    let active = true;

    const loadUserProfile = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) return;

        const fallbackName =
          user.user_metadata?.username ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "J";

        if (active) {
          setUserName(fallbackName);
        }

        const { data, error } = await supabase
          .from("User")
          .select("User_Name, User_Avatar_URL")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (active && data) {
          setProfile(data);
          setUserName(data.User_Name || fallbackName);
        }
      } catch (error) {
        console.error(
          "[ReviewInput] Load profile error:",
          error
        );
      }
    };

    loadUserProfile();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-2xl items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">

      {/* รูปโปรไฟล์ ไม่มีกรอบ */}
      <UserAvatar
        avatarUrl={profile?.User_Avatar_URL}
        userName={profile?.User_Name || userName}
        size={40}
      />

      {/* ปุ่มเปิดหน้าต่างเขียนรีวิว */}
      <button
        type="button"
        onClick={onClick}
        className="flex h-10 min-w-0 flex-1 items-center rounded-full border bg-muted/50 px-4 text-left text-sm text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Write a review...
      </button>

    </div>
  );
}