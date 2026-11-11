
import express from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { getOrCreateUserProfile } from "./authRoutes.js";

const router = express.Router();
console.log("✅ LOADED FEED ROUTES:", import.meta.url);

const isValidId = (id) => /^\d+$/.test(String(id));

async function getAuthenticatedUser(req) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];

  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) return null;

  return data.user;
}

async function getCommentUserId(req) {
  const authUser = await getAuthenticatedUser(req);

  if (!authUser) return null;

  const { data: profile, error } = await supabaseAdmin
    .from("User")
    .select("UserID")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  if (error) throw error;

  return profile?.UserID ?? null;
}

// ======================================================
// GET REVIEWS
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

    if (reviewsError) throw reviewsError;

    if (!reviews?.length) {
      return res.json({
        success: true,
        reviews: [],
      });
    }

    const userIds = [
      ...new Set(
        reviews
          .map((review) => review.UserID)
          .filter((id) => id != null)
      ),
    ];

    let users = [];

    if (userIds.length) {
      const result = await supabaseAdmin
        .from("User")
        .select(
          "UserID, User_Name, User_Avatar_URL, Active_Frame_RewardsID"
        )
        .in("UserID", userIds);

      if (result.error) throw result.error;

      users = result.data || [];
    }

    const userMap = new Map(
      users.map((user) => [
        String(user.UserID),
        user,
      ])
    );

    const reviewIds = reviews.map(
      (review) => review.ReviewsID
    );

    const { data: likes, error: likesError } =
      await supabaseAdmin
        .from("Review_Likes")
        .select("ReviewsID, UserID")
        .in("ReviewsID", reviewIds);

    if (likesError) throw likesError;

    const likeCountMap = new Map();

    for (const like of likes || []) {
      const key = String(like.ReviewsID);

      likeCountMap.set(
        key,
        (likeCountMap.get(key) || 0) + 1
      );
    }

    let currentUserId = null;

    const authUser = await getAuthenticatedUser(req);

    if (authUser) {
      const { data: profile, error } = await supabaseAdmin
        .from("User")
        .select("UserID")
        .eq("auth_user_id", authUser.id)
        .maybeSingle();

      if (error) throw error;

      currentUserId = profile?.UserID ?? null;
    }

    const likedReviewIds = new Set();

    if (currentUserId != null) {
      for (const like of likes || []) {
        if (
          String(like.UserID) === String(currentUserId)
        ) {
          likedReviewIds.add(String(like.ReviewsID));
        }
      }
    }

    const savedReviewIds = new Set();

    if (currentUserId != null) {
      const { data: savedRows, error } =
        await supabaseAdmin
          .from("Saved_Reviews")
          .select("ReviewsID")
          .eq("UserID", currentUserId)
          .in("ReviewsID", reviewIds);

      if (error) throw error;

      for (const item of savedRows || []) {
        savedReviewIds.add(String(item.ReviewsID));
      }
    }

    const bookIds = [
      ...new Set(
        reviews
          .map((review) => review.BooksID)
          .filter((id) => id != null)
      ),
    ];

    let books = [];

    if (bookIds.length) {
      const { data, error } = await supabaseAdmin
        .from("Books")
        .select("BooksID, Books_Cover")
        .in("BooksID", bookIds);

      if (error) throw error;

      books = data || [];
    }

    const bookCoverMap = new Map(
      books.map((book) => [
        String(book.BooksID),
        book.Books_Cover,
      ])
    );

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
        Like_Count:
          likeCountMap.get(reviewKey) || 0,
        Liked_By_Me:
          likedReviewIds.has(reviewKey),
        Saved_By_Me:
          savedReviewIds.has(reviewKey),
      };
    });

    return res.json({
      success: true,
      reviews: formattedReviews,
    });
  } catch (error) {
    console.error("[REVIEW GET]", error);

    return res.status(500).json({
      success: false,
      message: "ไม่สามารถดึงรีวิวได้",
      error: error.message,
    });
  }
});

// ======================================================
// POST REVIEW
// ======================================================

router.post("/reviews/test", async (req, res) => {
  let createdBookId = null;
  let subcategoryBookId = null;
  let insertedSubcategoryIds = [];

  try {
    const {
      BooksID,
      newBook,
      mainCategory,
      subCategory,
      subCategories,
      rating,
      reviewText,
      imageUrl,
    } = req.body;

    const authUser = await getAuthenticatedUser(req);

    if (!authUser) {
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อนเขียนรีวิว",
      });
    }

    const categoryIds = {
      Mystery: 1,
      Fantasy: 2,
      Horror: 3,
      "Historical Fiction": 4,
      Yaoi: 5,
      Yuri: 6,
      Romance: 7,
    };

    const categoryName = String(
      mainCategory || ""
    ).trim();

    const categoriseId = categoryIds[categoryName];

    if (!categoriseId) {
      return res.status(400).json({
        success: false,
        message: "กรุณาเลือกหมวดหมู่หลักที่ถูกต้อง",
      });
    }

    const allowedSubCategories = [
      "Drama",
      "Feel Good",
      "Comedy",
      "Adventure",
      "Action",
      "Psychological",
      "Suspense",
      "Dark",
      "Slice of Life",
      "Supernatural",
    ];

    const rawSubCategories = Array.isArray(subCategories)
      ? subCategories
      : String(subCategory || "").split(",");

    const selectedSubCategories = [
      ...new Set(
        rawSubCategories
          .map((item) => String(item).trim())
          .filter(Boolean)
      ),
    ];

    if (
      selectedSubCategories.length < 1 ||
      selectedSubCategories.length > 3
    ) {
      return res.status(400).json({
        success: false,
        message: "กรุณาเลือกหมวดรองตั้งแต่ 1 ถึง 3 หมวด",
      });
    }

    const invalidSubCategories =
      selectedSubCategories.filter(
        (category) =>
          !allowedSubCategories.includes(category)
      );

    if (invalidSubCategories.length) {
      return res.status(400).json({
        success: false,
        message:
          "พบหมวดรองที่ไม่ถูกต้อง: " +
          invalidSubCategories.join(", "),
      });
    }

    if (!reviewText?.trim()) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อความรีวิว",
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

    const userProfile =
      await getOrCreateUserProfile(authUser);

    let selectedBook = null;

    // กรณีเพิ่มหนังสือใหม่
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

      const title = String(
        newBook.title || ""
      ).trim();

      const synopsis = String(
        newBook.synopsis || ""
      ).trim();

      const coverUrl = String(
        newBook.coverUrl || ""
      ).trim();

      if (!title || !synopsis || !coverUrl) {
        return res.status(400).json({
          success: false,
          message:
            "กรุณากรอกชื่อหนังสือ เรื่องย่อ และรูปปกให้ครบ",
        });
      }

      const escapedTitle = title.replace(
        /[\\%_]/g,
        "\\$&"
      );

      const {
        data: matchingBooks,
        error: duplicateError,
      } = await supabaseAdmin
        .from("Books")
        .select("BooksID, Books_title, Books_Cover")
        .ilike("Books_title", escapedTitle)
        .limit(50);

      if (duplicateError) throw duplicateError;

      const normalizedTitle =
        title.trim().toLocaleLowerCase();

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
          message:
            "มีหนังสือชื่อนี้อยู่ในฐานข้อมูลแล้ว กรุณาเลือกหนังสือเดิม",
          existingBook: duplicate,
        });
      }

      const {
        data: insertedBook,
        error: insertBookError,
      } = await supabaseAdmin
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

      if (insertBookError) throw insertBookError;

      selectedBook = insertedBook;
      createdBookId = insertedBook.BooksID;

      const { error: categoryLinkError } =
        await supabaseAdmin
          .from("Book_Categorise")
          .insert({
            BooksID: selectedBook.BooksID,
            CategoriseID: categoriseId,
          });

      if (categoryLinkError) throw categoryLinkError;
    } else {
      // กรณีเลือกหนังสือที่มีอยู่แล้ว
      const bookId = Number(BooksID);

      if (
        !Number.isSafeInteger(bookId) ||
        bookId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "กรุณาเลือกหนังสือจากฐานข้อมูลก่อนเขียนรีวิว",
        });
      }

      const {
        data: existingBook,
        error: bookError,
      } = await supabaseAdmin
        .from("Books")
        .select(`
          BooksID,
          Books_title,
          Book_Synopsis,
          Books_Cover
        `)
        .eq("BooksID", bookId)
        .maybeSingle();

      if (bookError) throw bookError;

      if (!existingBook) {
        return res.status(404).json({
          success: false,
          message: "ไม่พบหนังสือที่เลือกในฐานข้อมูล",
        });
      }

      selectedBook = existingBook;
    }

    // เชื่อมหมวดหมู่รองกับหนังสือ
    subcategoryBookId = selectedBook.BooksID;

    const {
      data: subcategoryRows,
      error: subcategoryError,
    } = await supabaseAdmin
      .from("Subcategorise")
      .select(
        "SubcategoriseID, Subcategorise_Name"
      )
      .in(
        "Subcategorise_Name",
        selectedSubCategories
      );

    if (subcategoryError) throw subcategoryError;

    const subcategoryMap = new Map(
      (subcategoryRows || []).map((item) => [
        String(item.Subcategorise_Name).trim(),
        item.SubcategoriseID,
      ])
    );

    const missingSubCategories =
      selectedSubCategories.filter(
        (category) => !subcategoryMap.has(category)
      );

    if (missingSubCategories.length) {
      throw new Error(
        "ไม่พบหมวดรองในฐานข้อมูล: " +
        missingSubCategories.join(", ")
      );
    }

    const selectedSubcategoryIds =
      selectedSubCategories.map(
        (category) => subcategoryMap.get(category)
      );

    const {
      data: existingSubcategoryLinks,
      error: existingLinksError,
    } = await supabaseAdmin
      .from("Book_Subcategorise")
      .select("SubcategoriseID")
      .eq("BooksID", selectedBook.BooksID)
      .in(
        "SubcategoriseID",
        selectedSubcategoryIds
      );

    if (existingLinksError) throw existingLinksError;

    const existingSubcategoryIds = new Set(
      (existingSubcategoryLinks || []).map(
        (item) => String(item.SubcategoriseID)
      )
    );

    const newSubcategoryLinks =
      selectedSubcategoryIds
        .filter(
          (id) =>
            !existingSubcategoryIds.has(String(id))
        )
        .map((id) => ({
          BooksID: selectedBook.BooksID,
          SubcategoriseID: id,
        }));

    if (newSubcategoryLinks.length) {
      const {
        data: insertedLinks,
        error: insertLinksError,
      } = await supabaseAdmin
        .from("Book_Subcategorise")
        .insert(newSubcategoryLinks)
        .select("SubcategoriseID");

      if (insertLinksError) throw insertLinksError;

      insertedSubcategoryIds = (
        insertedLinks || []
      ).map((item) => item.SubcategoriseID);
    }

    // บันทึกรีวิว
    const {
      data: newReview,
      error: reviewError,
    } = await supabaseAdmin
      .from("Reviews")
      .insert({
        UserID: userProfile.UserID,
        BooksID: selectedBook.BooksID,
        Book_Title: selectedBook.Books_title,
        Main_Category: categoryName,
        Sub_Category:
          selectedSubCategories.join(", "),
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

    if (reviewError) throw reviewError;

    return res.status(201).json({
      success: true,
      message: "บันทึกรีวิวสำเร็จ",
      review: {
        ...newReview,
        Books_Cover:
          selectedBook.Books_Cover || null,
        User_Name: userProfile.User_Name,
      },
    });
  } catch (error) {
    console.error("[REVIEW POST]", error);

    // Cleanup ความสัมพันธ์หมวดรองที่เพิ่งเพิ่ม
    if (
      subcategoryBookId !== null &&
      insertedSubcategoryIds.length
    ) {
      const { error } = await supabaseAdmin
        .from("Book_Subcategorise")
        .delete()
        .eq("BooksID", subcategoryBookId)
        .in(
          "SubcategoriseID",
          insertedSubcategoryIds
        );

      if (error) {
        console.error(
          "[REVIEW] Cleanup subcategory:",
          error
        );
      }
    }

    // Cleanup หนังสือใหม่หากบันทึกรีวิวล้มเหลว
    if (createdBookId !== null) {
      const { error: categoryError } =
        await supabaseAdmin
          .from("Book_Categorise")
          .delete()
          .eq("BooksID", createdBookId);

      if (categoryError) {
        console.error(
          "[REVIEW] Cleanup category:",
          categoryError
        );
      }

      const { error: bookError } =
        await supabaseAdmin
          .from("Books")
          .delete()
          .eq("BooksID", createdBookId);

      if (bookError) {
        console.error(
          "[REVIEW] Cleanup book:",
          bookError
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
// ======================================================

router.post(
  "/reviews/:reviewId/like",
  async (req, res) => {
    console.log("✅ POST COMMENT HIT:", req.params.reviewId);
    try {
      const { reviewId } = req.params;

      if (!isValidId(reviewId)) {
        return res.status(400).json({
          success: false,
          message: "รหัสรีวิวไม่ถูกต้อง",
        });
      }

      const authUser =
        await getAuthenticatedUser(req);

      if (!authUser) {
        return res.status(401).json({
          success: false,
          message: "กรุณาเข้าสู่ระบบก่อนกดใจ",
        });
      }

      const userProfile =
        await getOrCreateUserProfile(authUser);

      const {
        data: existingReview,
        error: reviewError,
      } = await supabaseAdmin
        .from("Reviews")
        .select("ReviewsID")
        .eq("ReviewsID", reviewId)
        .maybeSingle();

      if (reviewError) throw reviewError;

      if (!existingReview) {
        return res.status(404).json({
          success: false,
          message: "ไม่พบรีวิวนี้",
        });
      }

      const {
        data: existingLike,
        error: likeCheckError,
      } = await supabaseAdmin
        .from("Review_Likes")
        .select("ReviewsID, UserID")
        .eq("ReviewsID", reviewId)
        .eq("UserID", userProfile.UserID)
        .maybeSingle();

      if (likeCheckError) throw likeCheckError;

      let liked;

      if (existingLike) {
        const { error } = await supabaseAdmin
          .from("Review_Likes")
          .delete()
          .eq("ReviewsID", reviewId)
          .eq("UserID", userProfile.UserID);

        if (error) throw error;

        liked = false;
      } else {
        const { error } = await supabaseAdmin
          .from("Review_Likes")
          .insert({
            ReviewsID: reviewId,
            UserID: userProfile.UserID,
          });

        if (error && error.code !== "23505") {
          throw error;
        }

        liked = true;
      }

      const { count, error: countError } =
        await supabaseAdmin
          .from("Review_Likes")
          .select("ReviewsID", {
            count: "exact",
            head: true,
          })
          .eq("ReviewsID", reviewId);

      if (countError) throw countError;

      return res.json({
        success: true,
        liked,
        likeCount: count || 0,
      });
    } catch (error) {
      console.error("[REVIEW LIKE]", error);

      return res.status(500).json({
        success: false,
        message: "ไม่สามารถกดใจรีวิวได้",
        error: error.message,
      });
    }
  }
);

// ======================================================
// GET COMMENTS
// ======================================================

router.get(
  "/reviews/:reviewId/comments",
  async (req, res) => {
    try {
      const { reviewId } = req.params;

      if (!isValidId(reviewId)) {
        return res.status(400).json({
          success: false,
          message: "รหัสรีวิวไม่ถูกต้อง",
        });
      }

      const { data: comments, error } =
        await supabaseAdmin
          .from("Review_Comments")
          .select(`
            CommentID,
            ReviewsID,
            UserID,
            Content,
            Created_At
          `)
          .eq("ReviewsID", reviewId)
          .order("Created_At", {
            ascending: false,
          });

      if (error) throw error;

      const userIds = [
        ...new Set(
          (comments || []).map(
            (comment) => comment.UserID
          )
        ),
      ];

      let users = [];

      if (userIds.length) {
        const result = await supabaseAdmin
          .from("User")
          .select(
            "UserID, User_Name, User_Avatar_URL"
          )
          .in("UserID", userIds);

        if (result.error) throw result.error;

        users = result.data || [];
      }

      const userMap = new Map(
        users.map((user) => [
          String(user.UserID),
          user,
        ])
      );

      const currentUserId =
        await getCommentUserId(req);

      const formattedComments = (
        comments || []
      ).map((comment) => {
        const user = userMap.get(
          String(comment.UserID)
        );

        return {
          ...comment,
          User_Name:
            user?.User_Name || "Reader",
          User_Avatar_URL:
            user?.User_Avatar_URL || null,
        };
      });

      return res.json({
        success: true,
        currentUserId,
        comments: formattedComments,
      });
    } catch (error) {
      console.error("[COMMENTS GET]", error);

      return res.status(500).json({
        success: false,
        message: "โหลดความคิดเห็นไม่สำเร็จ",
      });
    }
  }
);

// ======================================================
// POST COMMENT
// ======================================================

router.post(
  "/reviews/:reviewId/comments",
  async (req, res) => {
    try {
      const { reviewId } = req.params;

      if (!isValidId(reviewId)) {
        return res.status(400).json({
          success: false,
          message: "รหัสรีวิวไม่ถูกต้อง",
        });
      }

      const content =
        typeof req.body?.content === "string"
          ? req.body.content.trim()
          : "";

      if (!content || content.length > 1000) {
        return res.status(400).json({
          success: false,
          message:
            "ความคิดเห็นต้องมี 1–1000 ตัวอักษร",
        });
      }

      const userId =
        await getCommentUserId(req);

      if (userId == null) {
        return res.status(401).json({
          success: false,
          message:
            "กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น",
        });
      }

      const {
        data: existingReview,
        error: reviewError,
      } = await supabaseAdmin
        .from("Reviews")
        .select("ReviewsID")
        .eq("ReviewsID", reviewId)
        .maybeSingle();

      if (reviewError) throw reviewError;

      if (!existingReview) {
        return res.status(404).json({
          success: false,
          message: "ไม่พบรีวิวนี้",
        });
      }

      const {
        data: comment,
        error: insertError,
      } = await supabaseAdmin
        .from("Review_Comments")
        .insert({
          ReviewsID: Number(reviewId),
          UserID: userId,
          Content: content,
        })
        .select(`
          CommentID,
          ReviewsID,
          UserID,
          Content,
          Created_At
        `)
        .single();

      if (insertError) throw insertError;

      return res.status(201).json({
        success: true,
        comment,
      });
    } catch (error) {
      console.error("[COMMENTS POST]", error);

      return res.status(500).json({
        success: false,
        message: "ส่งความคิดเห็นไม่สำเร็จ",
      });
    }
  }
);

// ======================================================
// DELETE COMMENT
// ======================================================

router.delete(
  "/reviews/:reviewId/comments/:commentId",
  async (req, res) => {
    try {
      const { reviewId, commentId } = req.params;

      if (
        !isValidId(reviewId) ||
        !isValidId(commentId)
      ) {
        return res.status(400).json({
          success: false,
          message: "รหัสไม่ถูกต้อง",
        });
      }

      const userId =
        await getCommentUserId(req);

      if (userId == null) {
        return res.status(401).json({
          success: false,
          message: "กรุณาเข้าสู่ระบบ",
        });
      }

      const {
        data: existing,
        error: lookupError,
      } = await supabaseAdmin
        .from("Review_Comments")
        .select("CommentID, UserID")
        .eq("CommentID", commentId)
        .eq("ReviewsID", reviewId)
        .maybeSingle();

      if (lookupError) throw lookupError;

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "ไม่พบความคิดเห็น",
        });
      }

      if (
        String(existing.UserID) !==
        String(userId)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "ลบได้เฉพาะความคิดเห็นของตัวเอง",
        });
      }

      const { error: deleteError } =
        await supabaseAdmin
          .from("Review_Comments")
          .delete()
          .eq("CommentID", commentId)
          .eq("ReviewsID", reviewId)
          .eq("UserID", userId);

      if (deleteError) throw deleteError;

      return res.json({
        success: true,
      });
    } catch (error) {
      console.error("[COMMENTS DELETE]", error);

      return res.status(500).json({
        success: false,
        message: "ลบความคิดเห็นไม่สำเร็จ",
      });
    }
  }
);

export default router;
