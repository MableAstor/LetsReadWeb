import express from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/swipes
// บันทึก Swipe_History โดยใช้ UserID จาก Access Token
router.post("/", requireAuth, async (req, res) => {
  try {
    const { action, bookId, sessionId } = req.body;
    const userId = req.userProfile.UserID;

    const numericBookId = Number(bookId);
    const numericSessionId = Number(sessionId);

    if (
      typeof action !== "string" ||
      !action.trim() ||
      action.trim().length > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Swipe_Action ต้องเป็นข้อความความยาว 1–50 ตัวอักษร",
      });
    }

    if (!Number.isSafeInteger(numericBookId) || numericBookId <= 0) {
      return res.status(400).json({
        success: false,
        message: "BooksID ไม่ถูกต้อง",
      });
    }

    if (!Number.isSafeInteger(numericSessionId) || numericSessionId <= 0) {
      return res.status(400).json({
        success: false,
        message: "SessionsID ไม่ถูกต้อง",
      });
    }

    // ตรวจสอบว่า Session เป็นของผู้ใช้คนนี้และยังเปิดอยู่
    // ให้สอดคล้องกับ Composite Foreign Key (SessionsID, UserID)
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("Sessions")
      .select("SessionsID, UserID, Ended_At")
      .eq("SessionsID", numericSessionId)
      .eq("UserID", userId)
      .maybeSingle();

    if (sessionError) throw sessionError;

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ Session ของผู้ใช้นี้",
      });
    }

    if (session.Ended_At !== null) {
      return res.status(409).json({
        success: false,
        message: "Session นี้ถูกปิดแล้ว ไม่สามารถบันทึก Swipe ได้",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("Swipe_History")
      .insert({
        Swipe_Action: action.trim(),
        UserID: userId,
        BooksID: numericBookId,
        SessionsID: numericSessionId,
      })
      .select(`
        Swipe_HistoryID,
        Swipe_Action,
        Created_At,
        UserID,
        BooksID,
        SessionsID
      `)
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "บันทึกประวัติการ Swipe สำเร็จ",
      swipe: data,
    });
  } catch (error) {
    console.error("[SWIPE] Save error:", error);
    return res.status(500).json({
      success: false,
      message: "ไม่สามารถบันทึกประวัติการ Swipe ได้",
      error: error.message,
    });
  }
});

export default router;
