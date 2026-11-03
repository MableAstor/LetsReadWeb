import { supabase } from "../lib/supabase";

const API_URL = (
  
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

console.log("[Session] API_URL:", API_URL);
console.log("[Session] VITE_API_URL:", import.meta.env.VITE_API_URL);

// อ่าน Access Token จาก Supabase Auth
async function getAccessToken() {
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

// เรียก API สำหรับ Session
async function sessionRequest(path, options = {}) {
  const token = await getAccessToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message || "ไม่สามารถดำเนินการกับ Session ได้"
    );
  }

  return result;
}

// สร้าง Session
export const createSession = async () => {
  const result = await sessionRequest("/api/sessions", {
    method: "POST",
  });

  if (!result?.session?.SessionsID) {
    throw new Error("ไม่พบ SessionsID จาก Backend");
  }

  return result.session.SessionsID;
};

// ปิด Session
export const closeSession = async (sessionId) => {
  if (!sessionId) return;

  return sessionRequest(
    `/api/sessions/${encodeURIComponent(sessionId)}/close`,
    { method: "PATCH" }
  );
};