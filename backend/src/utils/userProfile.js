import { supabaseAdmin } from "../config/supabase.js";

// เชื่อม Supabase Auth กับตาราง User ด้วย auth_user_id
export async function getOrCreateUserProfile(authUser) {
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

  const columns = "UserID, auth_user_id, User_Name, User_Email";

  // ค้นหาด้วย Supabase Auth UUID ก่อน
  const { data: existingUser, error: findError } = await supabaseAdmin
    .from("User")
    .select(columns)
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  if (findError) throw findError;

  if (existingUser) {
    const { data, error } = await supabaseAdmin
      .from("User")
      .update({ User_Email: email || existingUser.User_Email })
      .eq("UserID", existingUser.UserID)
      .select(columns)
      .single();

    if (error) throw error;
    return data;
  }

  // รองรับบัญชี User เดิมที่ยังไม่ได้ผูก Auth UUID
  if (email) {
    const { data: emailUser, error: emailError } = await supabaseAdmin
      .from("User")
      .select(columns)
      .eq("User_Email", email)
      .maybeSingle();

    if (emailError) throw emailError;

    if (emailUser) {
      const { data, error } = await supabaseAdmin
        .from("User")
        .update({ auth_user_id: authUser.id })
        .eq("UserID", emailUser.UserID)
        .select(columns)
        .single();

      if (error) throw error;
      return data;
    }
  }

  // สร้างโปรไฟล์ใหม่ โดยไม่เก็บรหัสผ่านในตาราง User
  const { data: newUser, error: insertError } = await supabaseAdmin
    .from("User")
    .insert({
      auth_user_id: authUser.id,
      User_Name: metadataName,
      User_Email: email,
    })
    .select(columns)
    .single();

  if (insertError) throw insertError;
  return newUser;
}
