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
   LIBRARY: ค้นหาหนังสือ
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

   ลำดับรูป:
   1. รูปจาก Reviews.Image_URL ของหนังสือ
   2. รูปปกจาก Books.Books_Cover
   ====================================================== */
router.get("/shelves", async (req, res) => {
  try {
    const userProfile = await getLibraryUser(req);

    // 1. ดึงรายการหนังสือในชั้นของผู้ใช้
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

    // 2. ดึง BooksID ที่ไม่ซ้ำกัน
    const bookIds = [
      ...new Set(
        shelves
          .map((item) => item.BooksID)
          .filter((id) => id !== null && id !== undefined)
      ),
    ];

    // 3. ดึงรายละเอียดหนังสือและรูปปกจาก Books
    let books = [];

    if (bookIds.length > 0) {
      const { data, error: booksError } =
        await supabaseAdmin
          .from("Books")
          .select(
            "BooksID, Books_title, Books_Cover, Book_Synopsis"
          )
          .in("BooksID", bookIds);

      if (booksError) throw booksError;

      books = data || [];
    }

    const bookMap = new Map(
      books.map((book) => [
        String(book.BooksID),
        book,
      ])
    );

    // ======================================================
    // 4. ดึงรูปจากรีวิวที่เกี่ยวข้องกับหนังสือเหล่านี้
    // เรียงรีวิวใหม่ไปเก่า เพื่อให้เลือกภาพล่าสุดที่มีรูป
    // ======================================================
    const reviewImageMap = new Map();

    if (bookIds.length > 0) {
      const { data: reviewImages, error: reviewImagesError } =
        await supabaseAdmin
          .from("Reviews")
          .select("BooksID, Image_URL, Created_At")
          .in("BooksID", bookIds)
          .not("Image_URL", "is", null)
          .order("Created_At", { ascending: false });

      if (reviewImagesError) throw reviewImagesError;

      for (const review of reviewImages || []) {
        const bookKey = String(review.BooksID);
        const imageUrl = String(review.Image_URL || "").trim();

        // เก็บรูปแรกของแต่ละเล่ม ซึ่งเป็นรูปจากรีวิวล่าสุดที่มีรูป
        if (imageUrl && !reviewImageMap.has(bookKey)) {
          reviewImageMap.set(bookKey, imageUrl);
        }
      }
    }

    // ======================================================
    // 5. รวมข้อมูลชั้นหนังสือและเลือกรูปที่จะแสดง
    // ถ้ามีรูปรีวิว ใช้รูปรีวิวก่อน มิฉะนั้นใช้ Books_Cover
    // ======================================================
    const result = shelves.map((item) => {
      const book = bookMap.get(String(item.BooksID));

      if (!book) {
        return {
          ...item,
          Book: null,
        };
      }

      const reviewImage = reviewImageMap.get(
        String(item.BooksID)
      );

      return {
        ...item,
        Book: {
          ...book,

          // ส่งรูปที่ควรแสดงใน Library ผ่าน Books_Cover
          // เพื่อให้หน้าเว็บเดิมที่อ่าน Book.Books_Cover ใช้งานได้
          Books_Cover: reviewImage || book.Books_Cover || null,
        },
      };
    });

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

// ======================================================
// GET SAVED REVIEWS
// ดึงรีวิวที่ผู้ใช้บันทึกไว้ พร้อมรูปปกจาก Books
// ======================================================
router.get("/saved-reviews", async (req, res) => {
  try {
    // ตรวจสอบ Access Token
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบเพื่อดู Saved Books",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    const { data: authData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบใหม่",
      });
    }

    // ค้นหาผู้ใช้ในตาราง User
    const userProfile = await getOrCreateUserProfile(
      authData.user
    );

    // ดึงรายการรีวิวที่ผู้ใช้บันทึกไว้
    const { data: savedRows, error: savedError } =
      await supabaseAdmin
        .from("Saved_Reviews")
        .select("ReviewsID, Created_At")
        .eq("UserID", userProfile.UserID)
        .order("Created_At", { ascending: false });

    if (savedError) throw savedError;

    if (!savedRows || savedRows.length === 0) {
      return res.status(200).json({
        success: true,
        reviews: [],
      });
    }

    // ดึงข้อมูลรีวิว
    const reviewIds = savedRows.map(
      (item) => item.ReviewsID
    );

    const { data: reviews, error: reviewsError } =
      await supabaseAdmin
        .from("Reviews")
        .select(`
          ReviewsID,
          UserID,
          BooksID,
          Book_Title,
          Main_Category,
          Sub_Category,
          Review_Text,
          Rating,
          Image_URL,
          Created_At
        `)
        .in("ReviewsID", reviewIds);

    if (reviewsError) throw reviewsError;

    const reviewList = reviews || [];

    // ======================================================
    // ดึงรูปปกจาก Books สำหรับกรณีที่รีวิวไม่มี Image_URL
    // ======================================================
    const bookIds = [
      ...new Set(
        reviewList
          .map((review) => review.BooksID)
          .filter((id) => id !== null && id !== undefined)
      ),
    ];

    let books = [];

    if (bookIds.length > 0) {
      const { data, error: booksError } =
        await supabaseAdmin
          .from("Books")
          .select("BooksID, Books_Cover")
          .in("BooksID", bookIds);

      if (booksError) throw booksError;

      books = data || [];
    }

    const bookCoverMap = new Map(
      books.map((book) => [
        String(book.BooksID),
        book.Books_Cover,
      ])
    );

    // ======================================================
    // ดึงจำนวน Like ของรีวิวใน Saved Books
    // ======================================================
    let likes = [];

    if (reviewIds.length > 0) {
      const { data, error: likesError } =
        await supabaseAdmin
          .from("Review_Likes")
          .select("ReviewsID, UserID")
          .in("ReviewsID", reviewIds);

      if (likesError) throw likesError;

      likes = data || [];
    }

    const likeCountMap = new Map();
    const likedReviewIds = new Set();

    for (const like of likes) {
      const reviewKey = String(like.ReviewsID);

      likeCountMap.set(
        reviewKey,
        (likeCountMap.get(reviewKey) || 0) + 1
      );

      if (
        String(like.UserID) === String(userProfile.UserID)
      ) {
        likedReviewIds.add(reviewKey);
      }
    }

    // ดึงชื่อผู้เขียนรีวิว
    const userIds = [
      ...new Set(
        reviewList
          .map((item) => item.UserID)
          .filter((id) => id !== null && id !== undefined)
      ),
    ];

    let users = [];

    if (userIds.length > 0) {
      const { data, error: usersError } =
        await supabaseAdmin
          .from("User")
          .select("UserID, User_Name")
          .in("UserID", userIds);

      if (usersError) throw usersError;

      users = data || [];
    }

    const userMap = new Map(
      users.map((user) => [
        String(user.UserID),
        user.User_Name,
      ])
    );

    const reviewMap = new Map(
      reviewList.map((review) => [
        String(review.ReviewsID),
        review,
      ])
    );

    // ======================================================
    // รวมข้อมูลและเพิ่มรูปปกจาก Books
    // ReviewCard สามารถใช้ Image_URL ก่อน Books_Cover ได้
    // ======================================================
    const formattedReviews = savedRows
      .map((saved) => {
        const review = reviewMap.get(
          String(saved.ReviewsID)
        );

        if (!review) return null;

        return {
          ...review,

          Books_Cover:
            bookCoverMap.get(String(review.BooksID)) || null,

          User_Name:
            userMap.get(String(review.UserID)) || "ผู้ใช้",

          Saved_At: saved.Created_At,
          Saved_By_Me: true,

          Like_Count:
            likeCountMap.get(String(review.ReviewsID)) || 0,

          Liked_By_Me:
            likedReviewIds.has(String(review.ReviewsID)),
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      reviews: formattedReviews,
    });
  } catch (error) {
    console.error("[SAVED REVIEWS] Fetch error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "ไม่สามารถโหลด Saved Books ได้",
      error: error.message,
    });
  }
});

// ======================================================
// SAVE / UNSAVE REVIEW
// ======================================================
router.post("/reviews/:reviewId/save", async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!/^\d+$/.test(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "รหัสรีวิวไม่ถูกต้อง",
      });
    }

    // ตรวจสอบ Access Token
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อนบันทึกรีวิว",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    const { data: authData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบใหม่",
      });
    }

    // ค้นหาผู้ใช้ในตาราง User
    const userProfile = await getOrCreateUserProfile(
      authData.user
    );

    // ตรวจสอบว่ารีวิวมีอยู่จริง
    const { data: review, error: reviewError } =
      await supabaseAdmin
        .from("Reviews")
        .select("ReviewsID")
        .eq("ReviewsID", reviewId)
        .maybeSingle();

    if (reviewError) throw reviewError;

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบรีวิวนี้",
      });
    }

    // ตรวจสอบว่าผู้ใช้บันทึกรีวิวนี้ไว้แล้วหรือยัง
    const { data: existingSave, error: saveCheckError } =
      await supabaseAdmin
        .from("Saved_Reviews")
        .select("ReviewsID")
        .eq("ReviewsID", reviewId)
        .eq("UserID", userProfile.UserID)
        .maybeSingle();

    if (saveCheckError) throw saveCheckError;

    let saved;

    if (existingSave) {
      // ถ้าบันทึกไว้แล้ว ให้ยกเลิกการบันทึก
      const { error: deleteError } = await supabaseAdmin
        .from("Saved_Reviews")
        .delete()
        .eq("ReviewsID", reviewId)
        .eq("UserID", userProfile.UserID);

      if (deleteError) throw deleteError;

      saved = false;
    } else {
      // ถ้ายังไม่เคยบันทึก ให้เพิ่มลง Saved_Reviews
      const { error: insertError } = await supabaseAdmin
        .from("Saved_Reviews")
        .insert({
          ReviewsID: reviewId,
          UserID: userProfile.UserID,
        });

      if (insertError && insertError.code !== "23505") {
        throw insertError;
      }

      saved = true;
    }

    return res.status(200).json({
      success: true,
      saved,
      message: saved
        ? "บันทึกรีวิวแล้ว"
        : "ยกเลิกการบันทึกแล้ว",
    });
  } catch (error) {
    console.error("[SAVE REVIEW] Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "ไม่สามารถบันทึกรีวิวได้",
      error: error.message,
    });
  }
});

export default router;
