import { supabase } from "../lib/supabase";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// บันทึกประวัติ Swipe ผ่าน Backend
export const saveSwipeHistory = async ({
  action,
  bookId,
  sessionId,
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
    }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message || "ไม่สามารถบันทึกประวัติ Swipe ได้"
    );
  }

  return result.swipe;
};