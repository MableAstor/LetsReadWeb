import express from "express";
import { supabase } from "../config/supabase.js";
import { getOrCreateUserProfile } from "../utils/userProfile.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกอีเมลและรหัสผ่าน",
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    const userProfile = await getOrCreateUserProfile(data.user);

    return res.status(200).json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      session: data.session,
      user: userProfile,
    });
  } catch (error) {
    console.error("[LOGIN] Error:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
      error: error.message,
    });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, username, password, confirmPassword } = req.body;

    if (!email || !username || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบทุกช่อง",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน",
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          User_Name: username,
          username,
        },
      },
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (data.user) {
      const userProfile = await getOrCreateUserProfile({
        ...data.user,
        email: data.user.email || email,
        user_metadata: {
          ...data.user.user_metadata,
          User_Name: username,
          username,
        },
      });

      return res.status(201).json({
        success: true,
        message: data.session
          ? "สมัครสมาชิกสำเร็จ"
          : "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี",
        user: userProfile,
        session: data.session,
      });
    }

    return res.status(201).json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมล",
    });
  } catch (error) {
    console.error("[REGISTER] Error:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสมัครสมาชิก",
      error: error.message,
    });
  }
});

// POST /api/auth/sync-profile
// ใช้ซิงก์โปรไฟล์หลัง OAuth เช่น Google
router.post("/sync-profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "ไม่พบ Access Token",
      });
    }

    const accessToken = authHeader.slice("Bearer ".length).trim();

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "ไม่พบ Access Token",
      });
    }

    const { data: authData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: "ไม่สามารถยืนยันตัวตนได้",
      });
    }

    const userProfile = await getOrCreateUserProfile(authData.user);

    return res.status(200).json({
      success: true,
      message: "ซิงก์โปรไฟล์สำเร็จ",
      user: userProfile,
    });
  } catch (error) {
    console.error("[SYNC PROFILE] Error:", error);
    return res.status(500).json({
      success: false,
      message: "ไม่สามารถซิงก์โปรไฟล์ได้",
      error: error.message,
    });
  }
});

export default router;
