
import { supabase } from "../lib/supabase";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

async function accessToken() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  const token = data?.session?.access_token;

  if (!token) {
    throw new Error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
  }

  return token;
}

async function postAuthenticated(path, body) {
  const token = await accessToken();

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success !== true) {
    throw new Error(
      result?.message || `Backend ตอบกลับ HTTP ${response.status}`
    );
  }

  return result;
}

// บันทึก Swipe และรับ Preference ล่าสุด
export async function saveSwipeHistory({
  action,
  bookId,
  sessionId,
  requestId,
}) {
  if (!requestId) {
    throw new Error("ไม่พบ requestId ของ Swipe");
  }

  const result = await postAuthenticated("/api/swipes", {
    action,
    bookId,
    sessionId,
    requestId,
  });

  if (result.swipeSaved !== true) {
    throw new Error("ไม่สามารถยืนยันการบันทึก Swipe ได้");
  }

  return result;
}

// โหลด Preference ที่คำนวณจาก Swipe_History
export async function rebuildPreferences() {
  const result = await postAuthenticated(
    "/api/swipes/rebuild-preferences",
    {}
  );

  if (!Array.isArray(result.preferences)) {
    throw new Error(
      "Backend ส่ง User_Preferences ในรูปแบบไม่ถูกต้อง"
    );
  }

  return result.preferences;
}
