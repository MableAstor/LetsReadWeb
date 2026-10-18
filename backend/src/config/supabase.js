import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// อ่านค่าจากไฟล์ .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY;
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY;

// ตรวจสอบว่ามี Environment Variables ครบหรือไม่
if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL in .env");
}

if (!supabasePublishableKey) {
  throw new Error(
    "Missing SUPABASE_PUBLISHABLE_KEY in .env"
  );
}

if (!supabaseSecretKey) {
  throw new Error(
    "Missing SUPABASE_SECRET_KEY in .env"
  );
}

// Client สำหรับการใช้งานทั่วไป
export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);

// Admin Client สำหรับ Backend เท่านั้น
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);