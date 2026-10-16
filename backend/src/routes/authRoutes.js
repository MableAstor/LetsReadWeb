
import express from "express";
import {
  supabase,
  supabaseAdmin,
} from "../config/supabase.js";

const router = express.Router();

// ========================================
// LOGIN
// เข้าสู่ระบบและตรวจสอบโปรไฟล์ใน User_Test
// ========================================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // 1. ตรวจสอบข้อมูล
  if (!email || !password) {
    return res.status(400).json({
      message: "กรุณากรอกอีเมลและรหัสผ่าน",
    });
  }

  try {
    // 2. เข้าสู่ระบบผ่าน Supabase Auth
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error) {
      return res.status(401).json({
        message: error.message,
      });
    }

    const authUser = data.user;

    // 3. ค้นหาโปรไฟล์ใน User_Test ด้วย auth_user_id
    const {
      data: existingProfile,
      error: findError,
    } = await supabaseAdmin
      .from("User_Test")
      .select("UserID, auth_user_id, User_Name, User_Email")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();

    if (findError) {
      console.error(
        "Find User_Test error:",
        findError.message
      );

      return res.status(500).json({
        message: "ไม่สามารถตรวจสอบโปรไฟล์ทดลองได้",
      });
    }

    let profile = existingProfile;

    // 4. ถ้าไม่มีโปรไฟล์ ให้สร้างใน User_Test
    if (!profile) {
      const username =
        authUser.user_metadata?.username ||
        authUser.email?.split("@")[0] ||
        "User";

      const {
        data: newProfile,
        error: insertError,
      } = await supabaseAdmin
        .from("User_Test")
        .insert({
          auth_user_id: authUser.id,
          User_Name: username,
          User_Email: authUser.email ?? email.trim(),
        })
        .select("UserID, auth_user_id, User_Name, User_Email")
        .single();

      if (insertError) {
        console.error(
          "Create User_Test profile error:",
          insertError.message
        );

        return res.status(500).json({
          message:
            "เข้าสู่ระบบสำเร็จ แต่สร้างโปรไฟล์ทดลองไม่สำเร็จ",
        });
      }

      profile = newProfile;
    }

    // 5. ส่งข้อมูลกลับ Frontend
    return res.status(200).json({
      message: "เข้าสู่ระบบสำเร็จ",
      user: authUser,
      session: data.session,
      profile: {
        UserID: profile.UserID,
        User_Name: profile.User_Name,
        User_Email: profile.User_Email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
    });
  }
});

// ========================================
// REGISTER - TEST
// สมัครสมาชิกและบันทึกลง User_Test
// ========================================
router.post("/register", async (req, res) => {
  const {
    email,
    username,
    password,
    confirmPassword,
  } = req.body;

  // 1. ตรวจสอบข้อมูล
  if (
    !email ||
    !username ||
    !password ||
    !confirmPassword
  ) {
    return res.status(400).json({
      message: "กรุณากรอกข้อมูลให้ครบ",
    });
  }

  const cleanEmail = email.trim();
  const cleanUsername = username.trim();

  if (!cleanUsername) {
    return res.status(400).json({
      message: "กรุณากรอกชื่อผู้ใช้",
    });
  }

  // 2. ตรวจสอบรหัสผ่าน
  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "รหัสผ่านไม่ตรงกัน",
    });
  }

  try {
    // 3. สร้างบัญชีผ่าน Supabase Auth
    const {
      data,
      error: authError,
    } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          username: cleanUsername,
        },
      },
    });

    if (authError) {
      console.error(
        "Auth register error:",
        authError.message
      );

      return res.status(400).json({
        message: authError.message,
      });
    }

    if (!data.user) {
      return res.status(400).json({
        message: "ไม่สามารถสร้างบัญชีผู้ใช้ได้",
      });
    }

    // 4. ตรวจสอบว่ามีโปรไฟล์นี้ใน User_Test แล้วหรือยัง
    const {
      data: existingProfile,
      error: findError,
    } = await supabaseAdmin
      .from("User_Test")
      .select("UserID, auth_user_id, User_Name, User_Email")
      .eq("auth_user_id", data.user.id)
      .maybeSingle();

    if (findError) {
      console.error(
        "Find User_Test during register error:",
        findError.message
      );

      return res.status(500).json({
        message:
          "สร้างบัญชี Auth แล้ว แต่ตรวจสอบโปรไฟล์ทดลองไม่สำเร็จ",
      });
    }

    let profile = existingProfile;

    // 5. ถ้ายังไม่มี ให้สร้างโปรไฟล์ทดลอง
    if (!profile) {
      const {
        data: newProfile,
        error: insertError,
      } = await supabaseAdmin
        .from("User_Test")
        .insert({
          auth_user_id: data.user.id,
          User_Name: cleanUsername,
          User_Email: data.user.email ?? cleanEmail,
        })
        .select("UserID, auth_user_id, User_Name, User_Email")
        .single();

      if (insertError) {
        console.error(
          "User_Test insert error:",
          insertError.message
        );

        return res.status(500).json({
          message:
            "สร้างบัญชี Auth แล้ว แต่บันทึกโปรไฟล์ทดลองไม่สำเร็จ",
        });
      }

      profile = newProfile;
    }

    // 6. ส่งผลลัพธ์กลับ Frontend
    return res.status(201).json({
      message: "สมัครสมาชิกทดลองสำเร็จ",
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      profile: {
        UserID: profile.UserID,
        User_Name: profile.User_Name,
        User_Email: profile.User_Email,
      },
    });
  } catch (error) {
    console.error("Register test error:", error);

    return res.status(500).json({
      message: "เกิดข้อผิดพลาดในการสมัครสมาชิกทดลอง",
    });
  }
});

/* ========================================
   GET REVIEWS FOR FEED
   ดึงรีวิว ชื่อผู้รีวิว และ URL รูปภาพ
======================================== */
router.get("/reviews/test", async (req, res) => {
  try {
    const { data: reviews, error } = await supabaseAdmin
      .from("Reviews_Test")
      .select(
        "ReviewsID, auth_user_id, Book_Title, Main_Category, Sub_Category, Review_Text, Rating, Image_URL, Created_At"
      )
      .order("Created_At", { ascending: false });

    if (error) {
      console.error("[REVIEW] Load reviews error:", error.message);

      return res.status(500).json({
        message: "โหลดรีวิวไม่สำเร็จ",
      });
    }

    const userIds = [
      ...new Set(
        (reviews ?? []).map((review) => review.auth_user_id)
      ),
    ];

    let profileMap = new Map();

    if (userIds.length > 0) {
      const { data: profiles, error: profileError } =
        await supabaseAdmin
          .from("User_Test")
          .select("auth_user_id, User_Name")
          .in("auth_user_id", userIds);

      if (profileError) {
        console.error(
          "[REVIEW] Load reviewer names error:",
          profileError.message
        );
      } else {
        profileMap = new Map(
          (profiles ?? []).map((profile) => [
            profile.auth_user_id,
            profile.User_Name,
          ])
        );
      }
    }

    const feedReviews = (reviews ?? []).map((review) => ({
      ...review,
      User_Name:
        profileMap.get(review.auth_user_id) || "Reader",
    }));

    return res.json({ reviews: feedReviews });
  } catch (error) {
    console.error("[REVIEW] Feed error:", error);

    return res.status(500).json({
      message: "เกิดข้อผิดพลาดขณะโหลด Feed",
    });
  }
});

/* ========================================
   POST REVIEW
   รับชื่อหนังสือที่ผู้ใช้พิมพ์เอง
   และบันทึก URL รูปภาพลง Reviews_Test
======================================== */
router.post("/reviews/test", async (req, res) => {
  try {
    // 1. ตรวจสอบ Access Token
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "กรุณาเข้าสู่ระบบก่อนเขียนรีวิว",
      });
    }

    const accessToken = authHeader.slice(7);

    // 2. ตรวจสอบผู้ใช้กับ Supabase Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return res.status(401).json({
        message: "กรุณาเข้าสู่ระบบใหม่",
      });
    }

    // 3. รับข้อมูลจากฟอร์ม
    const {
      bookName,
      mainCategory,
      subCategory,
      rating,
      reviewText,
      imageUrl,
    } = req.body;

    const cleanBookName = String(bookName ?? "").trim();
    const cleanReview = String(reviewText ?? "").trim();
    const ratingNumber = Number(rating);

    if (!cleanBookName) {
      return res.status(400).json({
        message: "กรุณากรอกชื่อหนังสือ",
      });
    }

    if (
      !Number.isInteger(ratingNumber) ||
      ratingNumber < 1 ||
      ratingNumber > 5
    ) {
      return res.status(400).json({
        message: "กรุณาเลือกคะแนน 1–5 ดาว",
      });
    }

    if (!cleanReview) {
      return res.status(400).json({
        message: "กรุณาเขียนข้อความรีวิว",
      });
    }

    // 4. บันทึกลง Reviews_Test
    const { data: review, error: insertError } =
      await supabaseAdmin
        .from("Reviews_Test")
        .insert({
          auth_user_id: user.id,
          BooksID: null,
          Book_Title: cleanBookName,
          Main_Category:
            String(mainCategory ?? "").trim() || null,
          Sub_Category:
            String(subCategory ?? "").trim() || null,
          Review_Text: cleanReview,
          Rating: ratingNumber,
          Image_URL: imageUrl || null,
        })
        .select(
          "ReviewsID, auth_user_id, Book_Title, Main_Category, Sub_Category, Review_Text, Rating, Image_URL, Created_At"
        )
        .single();

    if (insertError) {
      console.error(
        "[REVIEW] Save error:",
        insertError.message
      );

      return res.status(500).json({
        message: "บันทึกรีวิวไม่สำเร็จ",
        error: insertError.message,
      });
    }

    console.log("[REVIEW] Saved:", review.ReviewsID);

    return res.status(201).json({
      message: "บันทึกรีวิวสำเร็จ",
      review,
    });
  } catch (error) {
    console.error("[REVIEW] Unexpected error:", error);

    return res.status(500).json({
      message: "เกิดข้อผิดพลาดขณะบันทึกรีวิว",
    });
  }
});

// ========================================
// SYNC PROFILE - GOOGLE / SOCIAL LOGIN
// บันทึกข้อมูลผู้ใช้ลง User_Test หลัง OAuth Login
// ========================================
router.post("/sync-profile", async (req, res) => {
  try {
    // 1. รับ Access Token จาก Frontend
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "ไม่พบ Access Token",
      });
    }

    const accessToken = authHeader.slice(7);

    // 2. ตรวจสอบตัวตนผู้ใช้กับ Supabase Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.error(
        "[SYNC PROFILE] Auth error:",
        authError?.message
      );

      return res.status(401).json({
        message: "ไม่สามารถยืนยันตัวตนผู้ใช้ได้",
      });
    }

    // 3. ตรวจสอบอีเมล
    if (!user.email) {
      return res.status(400).json({
        message: "บัญชีนี้ไม่มีอีเมล",
      });
    }

    // 4. ดึงชื่อจากข้อมูลบัญชี
    const username =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.username ||
      user.email.split("@")[0];

    // 5. เพิ่มหรืออัปเดตข้อมูลใน User_Test
    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("User_Test")
      .upsert(
        {
          auth_user_id: user.id,
          User_Name: username,
          User_Email: user.email,
        },
        {
          onConflict: "auth_user_id",
        }
      )
      .select(
        "UserID, auth_user_id, User_Name, User_Email"
      )
      .single();

    if (profileError) {
      console.error(
        "[SYNC PROFILE] Database error:",
        profileError.message
      );

      return res.status(500).json({
        message: "บันทึกข้อมูลใน User_Test ไม่สำเร็จ",
        error: profileError.message,
      });
    }

    console.log(
      "[SYNC PROFILE] Success:",
      profile.User_Email
    );

    // 6. ส่งข้อมูลกลับ Frontend
    return res.status(200).json({
      message: "ซิงก์ข้อมูลผู้ใช้สำเร็จ",
      profile,
    });
  } catch (error) {
    console.error("[SYNC PROFILE] Error:", error);

    return res.status(500).json({
      message: "เกิดข้อผิดพลาดในการซิงก์ข้อมูลผู้ใช้",
    });
  }
});

export default router;
