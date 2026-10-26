import express from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { getOrCreateUserProfile } from "./authRoutes.js";

const router = express.Router();
/* ======================================================
   LIBRARY: ตรวจสอบผู้ใช้ที่เข้าสู่ระบบ
   ====================================================== */
async function getLibraryUser(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    const error = new Error("กรุณาเข้าสู่ระบบก่อนใช้ Library");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = authHeader.split(" ")[1];

  const { data, error: authError } =
    await supabase.auth.getUser(accessToken);

  if (authError || !data?.user) {
    const error = new Error("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
    error.statusCode = 401;
    throw error;
  }

  return getOrCreateUserProfile(data.user);
}

/* ======================================================
   LIBRARY: ค้นหาหนังสือเพื่อเพิ่มเข้าชั้น
   GET /api/auth/library/books?search=ชื่อหนังสือ
   ====================================================== */
router.get("/library/books", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();

    let query = supabaseAdmin
      .from("Books")
      .select("BooksID, Books_title, Books_Cover, Book_Synopsis")
      .order("BooksID", { ascending: true })
      .limit(50);

    if (search) {
      query = query.ilike("Books_title", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.status(200).json({
      success: true,
      books: data || [],
    });
  } catch (error) {
    console.error("[LIBRARY BOOKS] Error:", error);

    return res.status(500).json({
      success: false,
      message: "ไม่สามารถโหลดรายการหนังสือได้",
      error: error.message,
    });
  }
});

/* ======================================================
   LIBRARY: โหลด Want to Read และ Want to Buy
   GET /api/auth/shelves
   ====================================================== */
router.get("/shelves", async (req, res) => {
  try {
    const userProfile = await getLibraryUser(req);

    const { data: shelves, error: shelvesError } =
      await supabaseAdmin
        .from("User_Shelves")
        .select("UserID, BooksID, Shelve_Type")
        .eq("UserID", userProfile.UserID);

    if (shelvesError) throw shelvesError;

    if (!shelves?.length) {
      return res.status(200).json({
        success: true,
        shelves: [],
      });
    }

    const bookIds = [
      ...new Set(shelves.map((item) => item.BooksID)),
    ];

    const { data: books, error: booksError } =
      await supabaseAdmin
        .from("Books")
        .select("BooksID, Books_title, Books_Cover, Book_Synopsis")
        .in("BooksID", bookIds);

    if (booksError) throw booksError;

    const bookMap = new Map(
      (books || []).map((book) => [
        String(book.BooksID),
        book,
      ])
    );

    const result = shelves.map((item) => ({
      ...item,
      Book: bookMap.get(String(item.BooksID)) || null,
    }));

    return res.status(200).json({
      success: true,
      shelves: result,
    });
  } catch (error) {
    console.error("[LIBRARY SHELVES] Load error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "ไม่สามารถโหลดชั้นหนังสือได้",
    });
  }
});

/* ======================================================
   LIBRARY: เพิ่มหนังสือหรือย้ายชั้น
   POST /api/auth/shelves
   Body: { BooksID, Shelve_Type }
   ====================================================== */
router.post("/shelves", async (req, res) => {
  try {
    const userProfile = await getLibraryUser(req);
    const { BooksID, Shelve_Type } = req.body;

    const bookId = Number(BooksID);
    const validTypes = ["Want to Read", "Want to Buy"];

    if (!Number.isSafeInteger(bookId) || bookId <= 0) {
      return res.status(400).json({
        success: false,
        message: "BooksID ไม่ถูกต้อง",
      });
    }

    if (!validTypes.includes(Shelve_Type)) {
      return res.status(400).json({
        success: false,
        message: "Shelve_Type ต้องเป็น Want to Read หรือ Want to Buy",
      });
    }

    // ตรวจสอบว่าหนังสือมีอยู่ในตาราง Books จริง
    const { data: book, error: bookError } =
      await supabaseAdmin
        .from("Books")
        .select("BooksID")
        .eq("BooksID", bookId)
        .maybeSingle();

    if (bookError) throw bookError;

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบหนังสือในฐานข้อมูล",
      });
    }

    // ตรวจสอบว่าหนังสืออยู่ในชั้นของผู้ใช้นี้แล้วหรือไม่
    const { data: existing, error: existingError } =
      await supabaseAdmin
        .from("User_Shelves")
        .select("BooksID, Shelve_Type")
        .eq("UserID", userProfile.UserID)
        .eq("BooksID", bookId)
        .limit(1)
        .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      // ถ้ามีอยู่แล้ว ให้อัปเดตประเภทชั้นหนังสือ
      const { error: updateError } = await supabaseAdmin
        .from("User_Shelves")
        .update({ Shelve_Type })
        .eq("UserID", userProfile.UserID)
        .eq("BooksID", bookId);

      if (updateError) throw updateError;
    } else {
      // ถ้ายังไม่มี ให้เพิ่มรายการใหม่
      const { error: insertError } = await supabaseAdmin
        .from("User_Shelves")
        .insert({
          UserID: userProfile.UserID,
          BooksID: bookId,
          Shelve_Type,
        });

      if (insertError) throw insertError;
    }

    return res.status(200).json({
      success: true,
      message: "บันทึกหนังสือลงชั้นเรียบร้อยแล้ว",
      BooksID: bookId,
      Shelve_Type,
    });
  } catch (error) {
    console.error("[LIBRARY SHELVES] Save error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "ไม่สามารถบันทึกหนังสือได้",
    });
  }
});

/* ======================================================
   LIBRARY: ลบหนังสือออกจากชั้น
   DELETE /api/auth/shelves/:bookId?type=Want%20to%20Read
   ====================================================== */
router.delete("/shelves/:bookId", async (req, res) => {
  try {
    const userProfile = await getLibraryUser(req);
    const bookId = Number(req.params.bookId);
    const shelfType = String(req.query.type || "");

    const validTypes = ["Want to Read", "Want to Buy"];

    if (!Number.isSafeInteger(bookId) || bookId <= 0) {
      return res.status(400).json({
        success: false,
        message: "BooksID ไม่ถูกต้อง",
      });
    }

    if (!validTypes.includes(shelfType)) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุประเภทชั้นหนังสือให้ถูกต้อง",
      });
    }

    const { data: removedRows, error: deleteError } =
      await supabaseAdmin
        .from("User_Shelves")
        .delete()
        .eq("UserID", userProfile.UserID)
        .eq("BooksID", bookId)
        .eq("Shelve_Type", shelfType)
        .select("BooksID");

    if (deleteError) throw deleteError;

    if (!removedRows?.length) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบหนังสือในชั้นนี้",
      });
    }

    return res.status(200).json({
      success: true,
      message: "นำหนังสือออกจากชั้นเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("[LIBRARY SHELVES] Remove error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "ไม่สามารถลบหนังสือออกจากชั้นได้",
    });
  }
});

export default router;