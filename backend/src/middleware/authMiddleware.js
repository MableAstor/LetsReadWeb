import { supabase } from "../config/supabase.js";
import { getOrCreateUserProfile } from "../utils/userProfile.js";

// ตรวจสอบ Access Token และผูก Auth user กับ UserID ในฐานข้อมูล
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อนใช้งาน",
      });
    }

    const accessToken = authHeader.slice("Bearer ".length).trim();

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "ไม่พบ Access Token",
      });
    }

    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        message: "เซสชันหมดอายุหรือไม่สามารถยืนยันตัวตนได้",
      });
    }

    req.authUser = data.user;
    req.userProfile = await getOrCreateUserProfile(data.user);

    return next();
  } catch (error) {
    console.error("[AUTH MIDDLEWARE] Error:", error);
    return res.status(500).json({
      success: false,
      message: "ไม่สามารถตรวจสอบสิทธิ์ผู้ใช้ได้",
    });
  }
}
