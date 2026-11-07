import express from "express";
import { supabaseAdmin } from "../config/supabase.js";

const router = express.Router();

const PAGE_SIZE = 1000;
const BOOK_BATCH_SIZE = 500;
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

// ======================================================
// คำนวณเวลาเริ่มต้นของ Viral รายเดือนตามเวลาไทย
//
// Monthly: วันที่ 1 เวลา 00:00 น.
// เมื่อขึ้นเดือนใหม่ ระบบจะเปลี่ยนช่วงเวลาคำนวณอัตโนมัติ
// ======================================================

function getViralMonthStart(now) {
  const bangkokNow = new Date(
    now.getTime() + BANGKOK_OFFSET_MS
  );

  const year = bangkokNow.getUTCFullYear();
  const month = bangkokNow.getUTCMonth();

  // เวลาเริ่มต้นวันที่ 1 ของเดือน เวลาไทย
  const startTime =
    Date.UTC(year, month, 1) - BANGKOK_OFFSET_MS;

  return new Date(startTime).toISOString();
}

// ======================================================
// GET VIRAL BOOKS
//
// GET /api/auth/viral-books
//
// นับจำนวนรีวิวเฉพาะเดือนปัจจุบัน
// เริ่มวันที่ 1 เวลา 00:00 น. ตามเวลาไทย
// ======================================================

router.get("/viral-books", async (req, res) => {
  try {
    // ======================================================
    // 1. กำหนดช่วงเวลารายเดือน
    // ======================================================

    const now = new Date();

    const periodStart = getViralMonthStart(now);
    const periodEnd = now.toISOString();

    // ======================================================
    // 2. ดึงรีวิวเฉพาะเดือนปัจจุบัน
    // โหลดข้อมูลเป็นชุดละ 1,000 รายการ
    // ======================================================

    const reviewRows = [];
    let offset = 0;

    while (true) {
      const { data: page, error: reviewsError } =
        await supabaseAdmin
          .from("Reviews")
          .select("ReviewsID, BooksID, Created_At")
          .not("BooksID", "is", null)
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

    // ======================================================
    // 3. นับจำนวนรีวิวตาม BooksID
    // ======================================================

    const reviewCountMap = new Map();

    for (const review of reviewRows) {
      const bookId = String(review.BooksID);

      reviewCountMap.set(
        bookId,
        (reviewCountMap.get(bookId) || 0) + 1
      );
    }

    // หากไม่มีรีวิวในเดือนนี้
    if (reviewCountMap.size === 0) {
      return res.status(200).json({
        success: true,
        period: "monthly",
        periodStart,
        periodEnd,
        totalBooks: 0,
        books: [],
      });
    }

    // ======================================================
    // 4. ดึงข้อมูลหนังสือจากตาราง Books
    // แบ่งโหลดเป็นชุดละ 500 เล่ม
    // ======================================================

    const bookIds = [...reviewCountMap.keys()];

    const books = [];

    for (
      let i = 0;
      i < bookIds.length;
      i += BOOK_BATCH_SIZE
    ) {
      const batchIds = bookIds.slice(
        i,
        i + BOOK_BATCH_SIZE
      );

      const { data, error: booksError } =
        await supabaseAdmin
          .from("Books")
          .select(`
            BooksID,
            Books_title,
            Books_Cover,
            Book_Synopsis
          `)
          .in("BooksID", batchIds);

      if (booksError) {
        throw booksError;
      }

      books.push(...(data || []));
    }

    // ======================================================
    // 5. เพิ่มจำนวนรีวิวให้หนังสือ
    // ======================================================

    const viralBooks = books.map((book) => ({
      ...book,
      Review_Count:
        reviewCountMap.get(String(book.BooksID)) || 0,
    }));

    // ======================================================
    // 6. เรียงจากจำนวนรีวิวมากไปน้อย
    // ======================================================

    viralBooks.sort((a, b) => {
      if (b.Review_Count !== a.Review_Count) {
        return b.Review_Count - a.Review_Count;
      }

      return String(a.Books_title || "").localeCompare(
        String(b.Books_title || ""),
        "th"
      );
    });

    // ======================================================
    // 7. ส่งข้อมูลกลับ Frontend
    // แสดงหนังสือ 100 อันดับแรก
    // ======================================================

    return res.status(200).json({
      success: true,
      period: "monthly",
      periodStart,
      periodEnd,
      totalBooks: viralBooks.length,
      books: viralBooks.slice(0, 100),
    });
  } catch (error) {
    console.error("[HOME VIRAL BOOKS] Error:", error);

    return res.status(500).json({
      success: false,
      message: "ไม่สามารถโหลดหนังสือ Viral ได้",
      error: error.message,
    });
  }
});

export default router;