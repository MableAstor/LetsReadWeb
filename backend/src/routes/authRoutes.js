import express from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";

const router = express.Router();

// ======================================================
// HELPER: GET OR CREATE USER PROFILE
// เชื่อม Supabase Auth กับตาราง User ด้วย auth_user_id
// ======================================================
async function getOrCreateUserProfile(authUser) {
  if (!authUser?.id) {
    throw new Error("ไม่พบข้อมูลผู้ใช้จาก Supabase Auth");
  }

  const email = authUser.email;

  const metadataName =
    authUser.user_metadata?.User_Name ||
    authUser.user_metadata?.username ||
    authUser.user_metadata?.full_name ||
    authUser.user_metadata?.name ||
    (email ? email.split("@")[0] : "User");

  // ค้นหาผู้ใช้ด้วย Auth UUID
  const { data: existingUser, error: findError } = await supabaseAdmin
    .from("User")
    .select("UserID, auth_user_id, User_Name, User_Email")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (existingUser) {
    // อัปเดตอีเมลเมื่อมีการเปลี่ยนแปลง
    const { data: updatedUser, error: updateError } =
      await supabaseAdmin
        .from("User")
        .update({
          User_Email: email || existingUser.User_Email,
        })
        .eq("UserID", existingUser.UserID)
        .select("UserID, auth_user_id, User_Name, User_Email")
        .single();

    if (updateError) {
      throw updateError;
    }

    return updatedUser;
  }

  // ตรวจสอบว่ามีผู้ใช้เดิมที่ใช้อีเมลนี้หรือไม่
  const { data: emailUser, error: emailError } = await supabaseAdmin
    .from("User")
    .select("UserID, auth_user_id, User_Name, User_Email")
    .eq("User_Email", email)
    .maybeSingle();

  if (emailError) {
    throw emailError;
  }

  if (emailUser) {
    // ผูก Auth UUID กับผู้ใช้เดิม
    const { data: linkedUser, error: linkError } =
      await supabaseAdmin
        .from("User")
        .update({
          auth_user_id: authUser.id,
        })
        .eq("UserID", emailUser.UserID)
        .select("UserID, auth_user_id, User_Name, User_Email")
        .single();

    if (linkError) {
      throw linkError;
    }

    return linkedUser;
  }

  // สร้างโปรไฟล์ผู้ใช้ใหม่
  // ไม่บันทึกรหัสผ่านจาก Supabase Auth ลง User_password
  const { data: newUser, error: insertError } = await supabaseAdmin
    .from("User")
    .insert({
      auth_user_id: authUser.id,
      User_Name: metadataName,
      User_Email: email,
    })
    .select("UserID, auth_user_id, User_Name, User_Email")
    .single();

  if (insertError) {
    throw insertError;
  }

  return newUser;
}

// ======================================================
// LOGIN
// ======================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกอีเมลและรหัสผ่าน",
      });
    }

    // เข้าสู่ระบบด้วย Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    // เชื่อมบัญชี Auth กับตาราง User
    const userProfile = await getOrCreateUserProfile(data.user);

    return res.status(200).json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      session: data.session,
      user: userProfile,
    });
  } catch (error) {
    console.error("[LOGIN] Error:", error);

    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
      error: error.message,
    });
  }
});

// ======================================================
// REGISTER
// ======================================================
router.post("/register", async (req, res) => {
  try {
    const { email, username, password, confirmPassword } = req.body;

    if (!email || !username || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบทุกช่อง",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน",
      });
    }

    // สมัครสมาชิกผ่าน Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          User_Name: username,
          username,
        },
      },
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // เมื่อ Supabase คืนข้อมูล Auth user มา ให้สร้างโปรไฟล์
    if (data.user) {
      const userProfile = await getOrCreateUserProfile({
        ...data.user,
        email: data.user.email || email,
        user_metadata: {
          ...data.user.user_metadata,
          User_Name: username,
          username,
        },
      });

      return res.status(201).json({
        success: true,
        message: data.session
          ? "สมัครสมาชิกสำเร็จ"
          : "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี",
        user: userProfile,
        session: data.session,
      });
    }

    return res.status(201).json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมล",
    });
  } catch (error) {
    console.error("[REGISTER] Error:", error);

    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสมัครสมาชิก",
      error: error.message,
    });
  }
});

// ======================================================
// GET REVIEWS
// ดึงรีวิว ชื่อผู้รีวิว จำนวนหัวใจ และสถานะหัวใจของผู้ใช้
// ======================================================
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
          .select("UserID, User_Name")
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

    // จับคู่รีวิวกับชื่อผู้ใช้
    const userMap = new Map(
      users.map((user) => [
        String(user.UserID),
        user.User_Name,
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
    // เพิ่ม: ตรวจสอบรีวิวที่ผู้ใช้ Save ไว้
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
    // รวมข้อมูลรีวิว ชื่อผู้ใช้ Like และ Save
    // ======================================================
    const formattedReviews = reviews.map((review) => {
      const reviewKey = String(review.ReviewsID);

      return {
        ...review,
        User_Name:
          userMap.get(String(review.UserID)) || "ผู้ใช้",
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
// บันทึกรีวิวลง Reviews โดยใช้ UserID จากตาราง User
// ======================================================
router.post("/reviews/test", async (req, res) => {
  try {
    const {
      bookName,
      mainCategory,
      subCategory,
      rating,
      reviewText,
      imageUrl,
    } = req.body;

    // ตรวจสอบ Access Token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อนเขียนรีวิว",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    // ตรวจสอบบัญชีผู้ใช้จาก Token
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

    // ค้นหาหรือสร้างโปรไฟล์ใน User
    const userProfile = await getOrCreateUserProfile(authData.user);

    // บันทึกรีวิวโดยใช้ UserID ซึ่งเป็น FK ของตาราง User
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

    if (reviewError) {
      throw reviewError;
    }

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

// ======================================================
// SYNC PROFILE
// ซิงก์โปรไฟล์หลัง OAuth เช่น Google
// ======================================================
router.post("/sync-profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "ไม่พบ Access Token",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    const { data: authData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: "ไม่สามารถยืนยันตัวตนได้",
      });
    }

    const userProfile = await getOrCreateUserProfile(authData.user);

    return res.status(200).json({
      success: true,
      message: "ซิงก์โปรไฟล์สำเร็จ",
      user: userProfile,
    });
  } catch (error) {
    console.error("[SYNC PROFILE] Error:", error);

    return res.status(500).json({
      success: false,
      message: "ไม่สามารถซิงก์โปรไฟล์ได้",
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

      if (insertError) {
        // รองรับกรณีที่มีการบันทึกรายการซ้ำพร้อมกัน
        if (insertError.code !== "23505") {
          throw insertError;
        }
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

    return res.status(500).json({
      success: false,
      message: "ไม่สามารถบันทึกรีวิวได้",
      error: error.message,
    });
  }
});
// ======================================================
// GET SAVED REVIEWS
// ดึงรีวิวที่ผู้ใช้บันทึกไว้
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

    // ยังไม่มีรายการที่บันทึกไว้
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

    // ดึงชื่อผู้เขียนรีวิว
    const userIds = [
      ...new Set((reviews || []).map((item) => item.UserID)),
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
      (reviews || []).map((review) => [
        String(review.ReviewsID),
        review,
      ])
    );

    // เรียงตามวันที่บันทึก และเพิ่มชื่อผู้รีวิว
    const formattedReviews = savedRows
      .map((saved) => {
        const review = reviewMap.get(
          String(saved.ReviewsID)
        );

        if (!review) return null;

        return {
          ...review,
          User_Name:
            userMap.get(String(review.UserID)) || "ผู้ใช้",
          Saved_At: saved.Created_At,
          Saved_By_Me: true,
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      reviews: formattedReviews,
    });
  } catch (error) {
    console.error("[SAVED REVIEWS] Fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "ไม่สามารถโหลด Saved Books ได้",
      error: error.message,
    });
  }
});
export default router;