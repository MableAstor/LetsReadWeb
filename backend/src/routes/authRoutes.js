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
// ดึงรีวิวจาก Reviews และชื่อผู้รีวิวจาก User
// ======================================================
router.get("/reviews/test", async (req, res) => {
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
      const { data, error: usersError } = await supabaseAdmin
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
// EXPORT ROUTER
// ต้องมี export default เพียงครั้งเดียว
// ======================================================
export default router;
