// ======================================================
// GET APPEARANCE SETTINGS
// ดึงการตั้งค่าธีมและขนาดตัวอักษรของผู้ใช้
// ======================================================
router.get("/settings/appearance", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อนดูการตั้งค่า",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    const { data: authData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: "เซสชันหมดอายุหรือไม่ถูกต้อง",
      });
    }

    // ดึงโปรไฟล์ผู้ใช้
    const userProfile = await getOrCreateUserProfile(authData.user);

    // ดึงค่าการตั้งค่าจากคอลัมน์ หรือใช้ค่าเริ่มต้นหากยังไม่ได้ตั้ง
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from("User")
      .select("Theme, Font_Size")
      .eq("UserID", userProfile.UserID)
      .maybeSingle();

    if (fetchError) {
      // หากยังไม่มีคอลัมน์ Theme / Font_Size จะคืนค่า default ให้ก่อน
      return res.status(200).json({
        success: true,
        appearance: {
          theme: "light",
          fontSize: "small",
        },
      });
    }

    return res.status(200).json({
      success: true,
      appearance: {
        theme: userData?.Theme || "light",
        fontSize: userData?.Font_Size || "small",
      },
    });
  } catch (error) {
    console.error("[APPEARANCE] Fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "ไม่สามารถดึงข้อมูลการตั้งค่าธีมได้",
      error: error.message,
    });
  }
});

// ======================================================
// UPDATE APPEARANCE SETTINGS
// บันทึกการเปลี่ยนแปลงธีมและขนาดตัวอักษร
// ======================================================
router.put("/settings/appearance", async (req, res) => {
  try {
    const { theme, fontSize } = req.body;

    // ตรวจสอบค่าที่อนุญาต
    const validThemes = ["light", "dark"];
    const validFontSizes = ["small", "medium", "large"];

    if (theme && !validThemes.includes(theme)) {
      return res.status(400).json({
        success: false,
        message: "ค่าธีมไม่ถูกต้อง (รองรับเฉพาะ light หรือ dark)",
      });
    }

    if (fontSize && !validFontSizes.includes(fontSize)) {
      return res.status(400).json({
        success: false,
        message: "ขนาดตัวอักษรไม่ถูกต้อง (รองรับ small, medium, large)",
      });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อนทำการบันทึก",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    const { data: authData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: "เซสชันหมดอายุหรือไม่ถูกต้อง",
      });
    }

    // เตรียมฟิลด์ที่จะบันทึก
    const updateData = {};
    if (theme) updateData.Theme = theme;
    if (fontSize) updateData.Font_Size = fontSize;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุข้อมูลที่ต้องการแก้ไข (theme หรือ fontSize)",
      });
    }

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from("User")
      .update(updateData)
      .eq("auth_user_id", authData.user.id)
      .select("UserID, auth_user_id, Theme, Font_Size")
      .single();

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({
      success: true,
      message: "บันทึกการตั้งค่าเรียบร้อยแล้ว",
      appearance: {
        theme: updatedUser?.Theme || theme,
        fontSize: updatedUser?.Font_Size || fontSize,
      },
    });
  } catch (error) {
    console.error("[APPEARANCE] Update error:", error);

    return res.status(500).json({
      success: false,
      message: "ไม่สามารถบันทึกการตั้งค่าได้",
      error: error.message,
    });
  }
});