
import { supabase } from "../lib/supabase";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// บันทึก Swipe และรับ Preferences จาก Backend
export const saveSwipeHistory = async ({
  action,
  bookId,
  sessionId,
  requestId,
}) => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  const token = data?.session?.access_token;

  if (!token) {
    throw new Error("กรุณาเข้าสู่ระบบก่อนบันทึกประวัติ");
  }

  const response = await fetch(`${API_URL}/api/swipes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      action,
      bookId,
      sessionId,
      requestId: requestId || crypto.randomUUID(),
    }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success !== true) {
    throw new Error(
      result?.message || "ไม่สามารถบันทึกประวัติ Swipe ได้"
    );
  }

  if (result.swipeSaved !== true) {
    throw new Error("ไม่สามารถยืนยันการบันทึก Swipe ได้");
  }

  return result;
};

// คำนวณ User Preferences ใหม่จากประวัติ Swipe
export const rebuildPreferences = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  const token = data?.session?.access_token;

  if (!token) {
    throw new Error("กรุณาเข้าสู่ระบบก่อนคำนวณ Preferences");
  }

  const response = await fetch(
    `${API_URL}/api/swipes/rebuild-preferences`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success !== true) {
    throw new Error(
      result?.message ||
        "ไม่สามารถคำนวณ User Preferences ได้"
    );
  }

  return result;
};
