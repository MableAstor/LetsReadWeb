import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({
      message: error.message,
    });
  }

  return res.status(200).json({
    message: "Login successful",
    user: data.user,
    session: data.session,
  });
});
router.post("/register", async (req, res) => {
  const { email, username, password, confirmPassword } = req.body;

  if (!email || !username || !password || !confirmPassword) {
    return res.status(400).json({
      message: "กรุณากรอกข้อมูลให้ครบ",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "รหัสผ่านไม่ตรงกัน",
    });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  return res.status(201).json({
    message: "สมัครสมาชิกสำเร็จ",
    user: data.user,
  });
});

export default router;