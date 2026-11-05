import express from "express";
import { supabaseAdmin } from "../config/supabase.js";

const router = express.Router();

const PAGE_SIZE = 1000;
const BOOK_BATCH_SIZE = 500;
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

// ======================================================
// คำนวณเวลาเริ่มต้นของ Viral ตามเวลาไทย
//
// Weekly: วันจันทร์ เวลา 00:00 น.
// Monthly: วันที่ 1 เวลา 00:00 น.
// ======================================================
function getViralPeriodStart(period, now) {
  const bangkokNow = new Date(
    now.getTime() + BANGKOK_OFFSET_MS
  );

  const year = bangkokNow.getUTCFullYear();
  const month = bangkokNow.getUTCMonth();
  const date = bangkokNow.getUTCDate();

  let startTime;

  if (period === "weekly") {
    const dayOfWeek = bangkokNow.getUTCDay();

    const daysSinceMonday = (dayOfWeek + 6) % 7;

    startTime =
      Date.UTC(
        year,
        month,
        date - daysSinceMonday
      ) - BANGKOK_OFFSET_MS;
  } else {
    startTime =
      Date.UTC(year, month, 1) - BANGKOK_OFFSET_MS;
  }

  return new Date(startTime).toISOString();
}

// ======================================================
// GET VIRAL BOOKS
//
// GET /api/auth/viral-books?period=weekly
// GET /api/auth/viral-books?period=monthly
// ======================================================
router.get("/viral-books", async (req, res) => {
  try {
    const { period } = req.query;

    // 1. ตรวจสอบช่วงเวลา
    if (!["weekly", "monthly"].includes(period)) {
      return res.status(400).json({
        success: false,
        message: "period ต้องเป็น weekly หรือ monthly",
      });
    }

    // 2. กำหนดช่วงเวลา
    const now = new Date();

    const periodStart = getViralPeriodStart(period, now);
    const periodEnd = now.toISOString();

    // 3. ดึงรีวิวตามช่วงเวลาที่เลือก
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

      if (rows.length < PAGE_SIZE) {
        break;
      }

      offset += PAGE_SIZE;
    }

    // 4. นับจำนวนรีวิวตาม BooksID
    const reviewCountMap = new Map();

    for (const review of reviewRows) {
      const bookId = String(review.BooksID);

      reviewCountMap.set(
        bookId,
        (reviewCountMap.get(bookId) || 0) + 1
      );
    }

    // หากไม่มีรีวิวในช่วงเวลานี้
    if (reviewCountMap.size === 0) {
      return res.status(200).json({
        success: true,
        period,
        periodStart,
        periodEnd,
        totalBooks: 0,
        books: [],
      });
    }

    // 5. ดึงข้อมูลหนังสือจากตาราง Books
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

    // 6. เพิ่มจำนวนรีวิวให้หนังสือ
    const viralBooks = books.map((book) => ({
      ...book,
      Review_Count:
        reviewCountMap.get(String(book.BooksID)) || 0,
    }));

    // 7. เรียงจากจำนวนรีวิวมากไปน้อย
    viralBooks.sort((a, b) => {
      if (b.Review_Count !== a.Review_Count) {
        return b.Review_Count - a.Review_Count;
      }

      return String(a.Books_title || "").localeCompare(
        String(b.Books_title || ""),
        "th"
      );
    });

    // 8. ส่งข้อมูลกลับ Frontend
    return res.status(200).json({
      success: true,
      period,
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
