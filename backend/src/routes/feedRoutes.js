import express from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { getOrCreateUserProfile } from "./authRoutes.js";

const router = express.Router();

// ======================================================
// GET REVIEWS
// ดึงรีวิว ชื่อผู้รีวิว จำนวนหัวใจ และสถานะ Like / Save
// ======================================================
router.get("/reviews/test", async (req, res) => {
  try {
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
        .order("Created_At", { ascending: false });

    console.log("[REVIEW] Reviews query:", {
      hasData: Boolean(reviews),
      count: reviews?.length,
      error: reviewsError?.message,
      code: reviewsError?.code,
      details: reviewsError?.details,
    });

    if (reviewsError) {
      throw reviewsError;
    }

    // หากยังไม่มีรีวิว ให้คืนอาร์เรย์ว่าง
    if (!reviews || reviews.length === 0) {
      return res.status(200).json({
        success: true,
        reviews: [],
      });
    }

    // ดึง UserID ที่ไม่ซ้ำกัน
    const userIds = [
      ...new Set(
        reviews
          .map((review) => review.UserID)
          .filter((id) => id !== null && id !== undefined)
      ),
    ];

    let users = [];

    if (userIds.length > 0) {
      const { data, error: usersError } =
        await supabaseAdmin
          .from("User")
          .select(
            "UserID, User_Name, User_Avatar_URL, Active_Frame_RewardsID"
          )
          .in("UserID", userIds);

      console.log("[REVIEW] Users query:", {
        hasData: Boolean(data),
        count: data?.length,
        error: usersError?.message,
        code: usersError?.code,
        details: usersError?.details,
      });

      if (usersError) {
        throw usersError;
      }

      users = data || [];
    }

    // จับคู่รีวิวกับข้อมูลเจ้าของรีวิว
    const userMap = new Map(
      users.map((user) => [
        String(user.UserID),
        {
          User_Name: user.User_Name,
          User_Avatar_URL: user.User_Avatar_URL,
          Active_Frame_RewardsID: user.Active_Frame_RewardsID,
        },
      ])
    );

    const reviewIds = reviews.map(
      (review) => review.ReviewsID
    );

    // ======================================================
    // ดึงจำนวนหัวใจของแต่ละรีวิว
    // ======================================================
    let likes = [];

    if (reviewIds.length > 0) {
      const { data, error: likesError } =
        await supabaseAdmin
          .from("Review_Likes")
          .select("ReviewsID, UserID")
          .in("ReviewsID", reviewIds);

      if (likesError) {
        throw likesError;
      }

      likes = data || [];
    }

    const likeCountMap = new Map();

    for (const like of likes) {
      const reviewKey = String(like.ReviewsID);

      likeCountMap.set(
        reviewKey,
        (likeCountMap.get(reviewKey) || 0) + 1
      );
    }

    // ======================================================
    // ตรวจสอบผู้ใช้ปัจจุบันจาก Access Token
    // ======================================================
    let currentUserId = null;

    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      const accessToken = authHeader.split(" ")[1];

      const { data: authData, error: authError } =
        await supabase.auth.getUser(accessToken);

      if (!authError && authData?.user) {
        const { data: profile, error: profileError } =
          await supabaseAdmin
            .from("User")
            .select("UserID")
            .eq("auth_user_id", authData.user.id)
            .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        currentUserId = profile?.UserID ?? null;
      }
    }

    // ======================================================
    // ตรวจสอบรีวิวที่ผู้ใช้กด Like ไว้
    // ======================================================
    const likedReviewIds = new Set();

    if (currentUserId !== null) {
      for (const like of likes) {
        if (
          String(like.UserID) === String(currentUserId)
        ) {
          likedReviewIds.add(String(like.ReviewsID));
        }
      }
    }

    // ======================================================
    // ตรวจสอบรีวิวที่ผู้ใช้ Save ไว้
    // ======================================================
    const savedReviewIds = new Set();

    if (
      currentUserId !== null &&
      reviewIds.length > 0
    ) {
      const { data: savedRows, error: savedError } =
        await supabaseAdmin
          .from("Saved_Reviews")
          .select("ReviewsID")
          .eq("UserID", currentUserId)
          .in("ReviewsID", reviewIds);

      if (savedError) {
        throw savedError;
      }

      for (const item of savedRows || []) {
        savedReviewIds.add(String(item.ReviewsID));
      }
    }

    // ======================================================
    // ดึงรูปปกหนังสือจากตาราง Books โดยใช้ BooksID
    // ======================================================
    const bookIds = [
      ...new Set(
        reviews
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

      if (booksError) {
        throw booksError;
      }

      books = data || [];
    }

    const bookCoverMap = new Map(
      books.map((book) => [
        String(book.BooksID),
        book.Books_Cover,
      ])
    );

    // ======================================================
    // รวมข้อมูลรีวิว ชื่อผู้ใช้ รูปโปรไฟล์ กรอบ
    // รูปปก Like และ Save
    // ======================================================
    const formattedReviews = reviews.map((review) => {
      const reviewKey = String(review.ReviewsID);

      const reviewUser = userMap.get(
        String(review.UserID)
      );

      return {
        ...review,

        Books_Cover:
          bookCoverMap.get(String(review.BooksID)) || null,

        User_Name:
          reviewUser?.User_Name || "ผู้ใช้",

        User_Avatar_URL:
          reviewUser?.User_Avatar_URL || null,

        Active_Frame_RewardsID:
          reviewUser?.Active_Frame_RewardsID ?? null,

        Like_Count: likeCountMap.get(reviewKey) || 0,
        Liked_By_Me: likedReviewIds.has(reviewKey),
        Saved_By_Me: savedReviewIds.has(reviewKey),
      };
    });

    return res.status(200).json({
      success: true,
      reviews: formattedReviews,
    });
  } catch (error) {
    console.error("[REVIEW] Fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "ไม่สามารถดึงรีวิวได้",
      error: error.message,
    });
  }
});

// ======================================================
// POST REVIEW
// รองรับทั้งหนังสือเดิมและการเพิ่มหนังสือใหม่
// ======================================================
router.post("/reviews/test", async (req, res) => {
  let createdBookId = null;

  try {
    const {
      BooksID,
      newBook,
      mainCategory,
      subCategory,
      rating,
      reviewText,
      imageUrl,
    } = req.body;

    // ======================================================
    // 1. ตรวจสอบ Access Token
    // ======================================================
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อนเขียนรีวิว",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    const { data: authData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: "เซสชันหมดอายุหรือไม่สามารถยืนยันตัวตนได้",
      });
    }

    // ======================================================
    // 2. ตรวจสอบหมวดหมู่หลักและแปลงเป็น CategoriseID
    // ======================================================
    const categoryIds = {
      Mystery: 1,
      Fantasy: 2,
      Horror: 3,
      "Historical Fiction": 4,
      Yaoi: 5,
      Yuri: 6,
      Romance: 7,
    };

    const categoryName = String(mainCategory || "").trim();
    const categoriseId = categoryIds[categoryName];

    if (!categoriseId) {
      return res.status(400).json({
        success: false,
        message: "กรุณาเลือกหมวดหมู่หลักที่ถูกต้อง",
      });
    }

    // ======================================================
    // 3. ตรวจสอบข้อมูลรีวิว
    // ======================================================
    if (
      !subCategory ||
      !reviewText?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกหมวดหมู่และข้อความรีวิวให้ครบ",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isFinite(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "คะแนนรีวิวต้องอยู่ระหว่าง 1 ถึง 5",
      });
    }

    // ======================================================
    // 4. ค้นหาหรือสร้างโปรไฟล์ผู้ใช้
    // ======================================================
    const userProfile = await getOrCreateUserProfile(
      authData.user
    );

    let selectedBook = null;

    // ======================================================
    // 5. กรณีเพิ่มหนังสือใหม่
    // ไม่ต้องส่ง BooksID มา
    // ======================================================
    if (newBook !== null && newBook !== undefined) {
      if (
        typeof newBook !== "object" ||
        Array.isArray(newBook)
      ) {
        return res.status(400).json({
          success: false,
          message: "ข้อมูลหนังสือใหม่ไม่ถูกต้อง",
        });
      }

      const title = String(newBook.title || "").trim();
      const synopsis = String(newBook.synopsis || "").trim();
      const coverUrl = String(newBook.coverUrl || "").trim();

      if (!title || !synopsis || !coverUrl) {
        return res.status(400).json({
          success: false,
          message: "กรุณากรอกชื่อหนังสือ เรื่องย่อ และรูปปกให้ครบ",
        });
      }

      // 5.1 ตรวจสอบชื่อหนังสือซ้ำในฐานข้อมูล
      // ใช้ ilike เพื่อตรวจชื่อที่ตัวพิมพ์เล็ก/ใหญ่ต่างกันด้วย
      const escapedTitle = title.replace(/[\\%_]/g, "\\$&");

      const {
        data: matchingBooks,
        error: duplicateError,
      } = await supabaseAdmin
        .from("Books")
        .select("BooksID, Books_title, Books_Cover")
        .ilike("Books_title", escapedTitle)
        .limit(50);

      if (duplicateError) {
        throw duplicateError;
      }

      const normalizedTitle = title
        .trim()
        .toLocaleLowerCase();

      const duplicate = (matchingBooks || []).find(
        (book) =>
          String(book.Books_title || "")
            .trim()
            .toLocaleLowerCase() === normalizedTitle
      );

      if (duplicate) {
        return res.status(409).json({
          success: false,
          code: "BOOK_ALREADY_EXISTS",
          message: "มีหนังสือชื่อนี้อยู่ในฐานข้อมูลแล้ว กรุณาเลือกหนังสือเดิม",
          existingBook: duplicate,
        });
      }

      // 5.2 เพิ่มข้อมูลหนังสือในตาราง Books
      const { data: insertedBook, error: insertBookError } =
        await supabaseAdmin
          .from("Books")
          .insert({
            Books_title: title,
            Book_Synopsis: synopsis,
            Books_Cover: coverUrl,
          })
          .select(`
            BooksID,
            Books_title,
            Book_Synopsis,
            Books_Cover
          `)
          .single();

      if (insertBookError) {
        throw insertBookError;
      }

      selectedBook = insertedBook;
      createdBookId = insertedBook.BooksID;

      // 5.3 เชื่อมหนังสือกับหมวดหมู่หลัก
      // ตาราง Book_Categorise มี BooksID และ CategoriseID
      const { error: categoryLinkError } =
        await supabaseAdmin
          .from("Book_Categorise")
          .insert({
            BooksID: selectedBook.BooksID,
            CategoriseID: categoriseId,
          });

      if (categoryLinkError) {
        throw categoryLinkError;
      }
    } else {
      // ======================================================
      // 6. กรณีเลือกหนังสือที่มีอยู่แล้ว
      // ======================================================
      const bookId = Number(BooksID);

      if (!Number.isSafeInteger(bookId) || bookId <= 0) {
        return res.status(400).json({
          success: false,
          message: "กรุณาเลือกหนังสือจากฐานข้อมูลก่อนเขียนรีวิว",
        });
      }

      const { data: existingBook, error: bookError } =
        await supabaseAdmin
          .from("Books")
          .select(`
            BooksID,
            Books_title,
            Book_Synopsis,
            Books_Cover
          `)
          .eq("BooksID", bookId)
          .maybeSingle();

      if (bookError) {
        throw bookError;
      }

      if (!existingBook) {
        return res.status(404).json({
          success: false,
          message: "ไม่พบหนังสือที่เลือกในฐานข้อมูล",
        });
      }

      selectedBook = existingBook;
    }

    // ======================================================
    // 7. บันทึกรีวิวลงตาราง Reviews
    // ======================================================
    const { data: newReview, error: reviewError } =
      await supabaseAdmin
        .from("Reviews")
        .insert({
          UserID: userProfile.UserID,
          BooksID: selectedBook.BooksID,
          Book_Title: selectedBook.Books_title,
          Main_Category: categoryName,
          Sub_Category: subCategory.trim(),
          Review_Text: reviewText.trim(),
          Rating: numericRating,
          Image_URL: imageUrl || null,
        })
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
        .single();

    if (reviewError) {
      throw reviewError;
    }

    return res.status(201).json({
      success: true,
      message: "บันทึกรีวิวสำเร็จ",
      review: {
        ...newReview,
        Books_Cover: selectedBook.Books_Cover || null,
        User_Name: userProfile.User_Name,
      },
    });
  } catch (error) {
    console.error("[REVIEW] Save error:", error);

    // หากเพิ่มหนังสือใหม่แล้วขั้นตอนหลังจากนั้นล้มเหลว
    // ลบความสัมพันธ์และหนังสือที่เพิ่งสร้าง
    if (createdBookId !== null) {
      const { error: cleanupCategoryError } =
        await supabaseAdmin
          .from("Book_Categorise")
          .delete()
          .eq("BooksID", createdBookId);

      if (cleanupCategoryError) {
        console.error(
          "[REVIEW] Cleanup category error:",
          cleanupCategoryError
        );
      }

      const { error: cleanupBookError } =
        await supabaseAdmin
          .from("Books")
          .delete()
          .eq("BooksID", createdBookId);

      if (cleanupBookError) {
        console.error(
          "[REVIEW] Cleanup book error:",
          cleanupBookError
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: "ไม่สามารถบันทึกรีวิวได้",
      error: error.message,
    });
  }
});

// ======================================================
// LIKE / UNLIKE REVIEW
// ผู้ใช้หนึ่งคนกดใจรีวิวเดียวกันได้หนึ่งครั้ง
// ======================================================
router.post("/reviews/:reviewId/like", async (req, res) => {
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

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อนกดใจ",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    // ตรวจสอบผู้ใช้กับ Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบใหม่",
      });
    }

    // ค้นหาข้อมูลผู้ใช้ในตาราง User
    const userProfile = await getOrCreateUserProfile(
      authData.user
    );

    // ตรวจสอบว่ามีรีวิวนี้อยู่จริงหรือไม่
    const { data: existingReview, error: reviewError } =
      await supabaseAdmin
        .from("Reviews")
        .select("ReviewsID")
        .eq("ReviewsID", reviewId)
        .maybeSingle();

    if (reviewError) {
      throw reviewError;
    }

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบรีวิวนี้",
      });
    }

    // ตรวจสอบว่าผู้ใช้เคยกดใจรีวิวนี้หรือยัง
    const { data: existingLike, error: likeCheckError } =
      await supabaseAdmin
        .from("Review_Likes")
        .select("ReviewsID, UserID")
        .eq("ReviewsID", reviewId)
        .eq("UserID", userProfile.UserID)
        .maybeSingle();

    if (likeCheckError) {
      throw likeCheckError;
    }

    let liked;

    if (existingLike) {
      // เคยกดใจแล้ว: ลบหัวใจเพื่อยกเลิก
      const { error: deleteError } = await supabaseAdmin
        .from("Review_Likes")
        .delete()
        .eq("ReviewsID", reviewId)
        .eq("UserID", userProfile.UserID);

      if (deleteError) {
        throw deleteError;
      }

      liked = false;
    } else {
      // ยังไม่เคยกดใจ: เพิ่มหัวใจ
      const { error: insertError } = await supabaseAdmin
        .from("Review_Likes")
        .insert({
          ReviewsID: reviewId,
          UserID: userProfile.UserID,
        });

      // ป้องกันข้อมูลซ้ำจากการกดพร้อมกัน
      if (insertError && insertError.code !== "23505") {
        throw insertError;
      }

      liked = true;
    }

    // นับจำนวนหัวใจใหม่จากฐานข้อมูล
    const { count, error: countError } = await supabaseAdmin
      .from("Review_Likes")
      .select("ReviewsID", {
        count: "exact",
        head: true,
      })
      .eq("ReviewsID", reviewId);

    if (countError) {
      throw countError;
    }

    return res.status(200).json({
      success: true,
      liked,
      likeCount: count || 0,
    });
  } catch (error) {
    console.error("[REVIEW LIKE] Error:", error);

    return res.status(500).json({
      success: false,
      message: "ไม่สามารถกดใจรีวิวได้",
      error: error.message,
    });
  }
});

export default router;