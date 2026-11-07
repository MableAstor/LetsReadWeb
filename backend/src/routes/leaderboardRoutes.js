import express from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { getOrCreateUserProfile } from "./authRoutes.js";

const router = express.Router();

const PAGE_SIZE = 1000;
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

// ======================================================
// คำนวณเวลาเริ่มต้น Leaderboard รายเดือนตามเวลาไทย
//
// เริ่มวันที่ 1 ของเดือน เวลา 00:00 น.
// เมื่อขึ้นเดือนใหม่ ระบบจะเปลี่ยนช่วงเวลาคำนวณอัตโนมัติ
// ======================================================

function getMonthStart(now) {
  // แปลงเวลาปัจจุบันเป็นเวลาไทย
  const bangkokNow = new Date(
    now.getTime() + BANGKOK_OFFSET_MS
  );

  const year = bangkokNow.getUTCFullYear();
  const month = bangkokNow.getUTCMonth();

  // คำนวณเวลาเริ่มต้นวันที่ 1 เวลา 00:00 น. ของไทย
  const startTime =
    Date.UTC(year, month, 1) - BANGKOK_OFFSET_MS;

  return new Date(startTime).toISOString();
}

// ======================================================
// GET LEADERBOARD
// GET /api/auth/leaderboard
//
// นับเฉพาะรีวิวที่สร้างภายในเดือนปัจจุบัน
// เริ่มวันที่ 1 เวลา 00:00 น. ตามเวลาไทย
// ไม่ลบรีวิวเก่าจากฐานข้อมูล
// ======================================================

router.get("/leaderboard", async (req, res) => {
  try {
    // --------------------------------------------------
    // 1. ตรวจสอบผู้ใช้ที่เข้าสู่ระบบ
    // --------------------------------------------------

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบเพื่อดูอันดับของคุณ",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    const { data: authData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่",
      });
    }

    const currentProfile = await getOrCreateUserProfile(
      authData.user
    );

    // --------------------------------------------------
    // 2. กำหนดช่วงเวลาของอันดับรายเดือน
    // --------------------------------------------------

    const now = new Date();

    const periodStart = getMonthStart(now);
    const periodEnd = now.toISOString();

    // --------------------------------------------------
    // 3. โหลดรายชื่อผู้ใช้
    // --------------------------------------------------

    const { data: users, error: usersError } =
      await supabaseAdmin
        .from("User")
        .select("UserID, User_Name")
        .order("UserID", { ascending: true });

    if (usersError) {
      throw usersError;
    }

    // --------------------------------------------------
    // 4. โหลดรีวิวเฉพาะในเดือนปัจจุบัน
    //
    // เริ่มวันที่ 1 เวลา 00:00 น. จนถึงปัจจุบัน
    // โหลดเป็นชุดละ 1,000 รายการ
    // --------------------------------------------------

    const reviewRows = [];
    let offset = 0;

    while (true) {
      const { data: page, error: reviewsError } =
        await supabaseAdmin
          .from("Reviews")
          .select("ReviewsID, UserID, Created_At")
          .gte("Created_At", periodStart)
          .lte("Created_At", periodEnd)
          .order("Created_At", { ascending: true })
          .order("ReviewsID", { ascending: true })
          .range(offset, offset + PAGE_SIZE - 1);

      if (reviewsError) {
        throw reviewsError;
      }

      const rows = page || [];

      reviewRows.push(...rows);

      // หากข้อมูลในชุดนี้ไม่เต็ม แสดงว่าโหลดครบแล้ว
      if (rows.length < PAGE_SIZE) {
        break;
      }

      offset += PAGE_SIZE;
    }

    // --------------------------------------------------
    // 5. นับจำนวนรีวิวของผู้ใช้แต่ละคนในเดือนนี้
    // --------------------------------------------------

    const reviewCountMap = new Map();

    for (const review of reviewRows) {
      const userId = String(review.UserID);

      reviewCountMap.set(
        userId,
        (reviewCountMap.get(userId) || 0) + 1
      );
    }

    // --------------------------------------------------
    // 6. สร้างคะแนนและจัดอันดับ
    //
    // คะแนนมาจากรีวิวในเดือนปัจจุบันเท่านั้น
    // ผู้ใช้ที่ไม่มีรีวิวในเดือนนี้จะมีคะแนน 0
    // --------------------------------------------------

    const rankedUsers = (users || [])
      .map((user) => ({
        UserID: user.UserID,
        name: user.User_Name || "ผู้ใช้",
        reviews:
          reviewCountMap.get(String(user.UserID)) || 0,
        isCurrentUser:
          String(user.UserID) ===
          String(currentProfile.UserID),
      }))
      .sort((a, b) => {
        // รีวิวมากกว่าอยู่ก่อน
        if (b.reviews !== a.reviews) {
          return b.reviews - a.reviews;
        }

        // หากคะแนนเท่ากัน ให้เรียงตามชื่อ
        const nameComparison = a.name.localeCompare(
          b.name,
          "th"
        );

        if (nameComparison !== 0) {
          return nameComparison;
        }

        return String(a.UserID).localeCompare(
          String(b.UserID),
          undefined,
          { numeric: true }
        );
      })
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));

    // --------------------------------------------------
    // 7. ค้นหาอันดับของผู้ใช้ปัจจุบัน
    // --------------------------------------------------

    const currentUser = rankedUsers.find(
      (user) => user.isCurrentUser
    );

    if (!currentUser) {
      throw new Error(
        "ไม่พบโปรไฟล์ผู้ใช้ในตาราง User"
      );
    }

    // --------------------------------------------------
    // 8. หาอันดับก่อนหน้า
    // คำนวณจำนวนรีวิวที่ต้องเพิ่มเพื่อแซงอันดับนั้น
    // --------------------------------------------------

    const previousRank =
      rankedUsers.find(
        (user) => user.rank === currentUser.rank - 1
      ) || null;

    const reviewsNeeded = previousRank
      ? Math.max(
          0,
          previousRank.reviews - currentUser.reviews + 1
        )
      : 0;

    // --------------------------------------------------
    // 9. เตรียมรายการ TOP 5
    // หากผู้ใช้ปัจจุบันอยู่นอก TOP 5 ให้แสดงเพิ่ม
    // --------------------------------------------------

    const rankings = rankedUsers.slice(0, 5);

    if (currentUser.rank > 5) {
      rankings.push(currentUser);
    }

    // --------------------------------------------------
    // 10. ส่งข้อมูลกลับให้หน้า Leaderboard
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      period: "monthly",
      periodStart,
      periodEnd,
      rankings,
      currentUser,
      previousRank: previousRank
        ? {
            rank: previousRank.rank,
            reviews: previousRank.reviews,
          }
        : null,
      reviewsNeeded,
    });
  } catch (error) {
    console.error("[LEADERBOARD] Error:", error);

    return res.status(500).json({
      success: false,
      message: "ไม่สามารถโหลดตารางอันดับได้",
      error: error.message,
    });
  }
});

export default router;