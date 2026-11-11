import express from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/sessions
// สร้าง Session โดยใช้ UserID จาก Access Token เท่านั้น
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.userProfile.UserID;

    const { data, error } = await supabaseAdmin
      .from("Sessions")
      .insert({ UserID: userId })
      .select("SessionsID, Started_At, Ended_At, UserID")
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "สร้าง Session สำเร็จ",
      session: data,
    });
  } catch (error) {
    console.error("[SESSION] Create error:", error);
    return res.status(500).json({
      success: false,
      message: "ไม่สามารถสร้าง Session ได้",
      error: error.message,
    });
  }
});

// PATCH /api/sessions/:sessionId/close
// ปิดเฉพาะ Session ที่เป็นของผู้ใช้ที่ยืนยันตัวตนแล้วและยังไม่ถูกปิด
router.patch("/:sessionId/close", requireAuth, async (req, res) => {
  try {
    const sessionId = Number(req.params.sessionId);
    const userId = req.userProfile.UserID;

    if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
      return res.status(400).json({
        success: false,
        message: "SessionsID ไม่ถูกต้อง",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("Sessions")
      .update({ Ended_At: new Date().toISOString() })
      .eq("SessionsID", sessionId)
      .eq("UserID", userId)
      .is("Ended_At", null)
      .select("SessionsID, Started_At, Ended_At, UserID")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ Session ที่ยังเปิดอยู่ของผู้ใช้นี้",
      });
    }

    return res.status(200).json({
      success: true,
      message: "ปิด Session สำเร็จ",
      session: data,
    });
  } catch (error) {
    console.error("[SESSION] Close error:", error);
    return res.status(500).json({
      success: false,
      message: "ไม่สามารถปิด Session ได้",
      error: error.message,
    });
  }
});

export default router;
