import express from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { getOrCreateUserProfile } from "../utils/userProfile.js";

const router = express.Router();

// GET /api/reviews/test
// ดึงรีวิวและชื่อผู้รีวิว
router.get("/test", async (req, res) => {
  try {
    const { data: reviews, error: reviewsError } = await supabaseAdmin
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

    if (reviewsError) throw reviewsError;

    if (!reviews?.length) {
      return res.status(200).json({
        success: true,
        reviews: [],
      });
    }

    const userIds = [
      ...new Set(
        reviews
          .map((review) => review.UserID)
          .filter((id) => id !== null && id !== undefined)
      ),
    ];

    let users = [];

    if (userIds.length > 0) {
      const { data, error: usersError } = await supabaseAdmin
        .from("User")
        .select("UserID, User_Name")
        .in("UserID", userIds);

      if (usersError) throw usersError;
      users = data || [];
    }

    const userMap = new Map(
      users.map((user) => [String(user.UserID), user.User_Name])
    );

    const formattedReviews = reviews.map((review) => ({
      ...review,
      User_Name: userMap.get(String(review.UserID)) || "ผู้ใช้",
    }));

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

// POST /api/reviews/test
// บันทึกรีวิว โดยใช้ UserID ที่ผูกกับ Access Token
router.post("/test", async (req, res) => {
  try {
    const {
      bookName,
      mainCategory,
      subCategory,
      rating,
      reviewText,
      imageUrl,
    } = req.body;

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อนเขียนรีวิว",
      });
    }

    const accessToken = authHeader.slice("Bearer ".length).trim();

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อนเขียนรีวิว",
      });
    }

    const { data: authData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: "เซสชันหมดอายุหรือไม่สามารถยืนยันตัวตนได้",
      });
    }

    if (!bookName || !mainCategory || !subCategory || !reviewText) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกชื่อหนังสือ หมวดหมู่ และข้อความรีวิว",
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

    const userProfile = await getOrCreateUserProfile(authData.user);

    const { data: newReview, error: reviewError } = await supabaseAdmin
      .from("Reviews")
      .insert({
        UserID: userProfile.UserID,
        BooksID: null,
        Book_Title: bookName,
        Main_Category: mainCategory,
        Sub_Category: subCategory,
        Review_Text: reviewText,
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

    if (reviewError) throw reviewError;

    return res.status(201).json({
      success: true,
      message: "บันทึกรีวิวสำเร็จ",
      review: {
        ...newReview,
        User_Name: userProfile.User_Name,
      },
    });
  } catch (error) {
    console.error("[REVIEW] Save error:", error);
    return res.status(500).json({
      success: false,
      message: "ไม่สามารถบันทึกรีวิวได้",
      error: error.message,
    });
  }
});

export default router;
