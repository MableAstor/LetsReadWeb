import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import FacebookIcon from "../assets/facebook-logo.png";
import LineIcon from "../assets/line-logo.png";
import googleIcon from "../assets/google-logo.png";

import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");

  // ========================================
  // ย้อนกลับไปหน้าก่อนหน้า
  // ========================================
  const handleClose = () => {
    navigate(-1);
  };

  // ========================================
  // LOGIN ด้วย Google, Facebook และ LINE
  // ========================================
  const handleSocialLogin = async (provider) => {
    if (loading || socialLoading) return;

    setSocialLoading(provider);

    try {
      console.log("[Social Login] Starting:", provider);

      // ตั้งค่า OAuth โดยคงวิธีเดิมไว้
      const options = {
        redirectTo: `${window.location.origin}/home`,
        skipBrowserRedirect: true,
      };

      // ให้ Google แสดงหน้าเลือกบัญชีทุกครั้ง
      if (provider === "google") {
        options.queryParams = {
          prompt: "select_account",
        };
      }

      const { data, error } =
        await supabase.auth.signInWithOAuth({
          provider,
          options,
        });

      if (error) {
        throw error;
      }

      if (!data?.url) {
        throw new Error(
          "Supabase ไม่ได้ส่ง URL สำหรับเข้าสู่ระบบกลับมา"
        );
      }

      console.log("[Social Login] Redirecting:", provider);

      // ไปยังหน้าเข้าสู่ระบบของผู้ให้บริการ
      window.location.assign(data.url);
    } catch (error) {
      console.error(
        `[Social Login] ${provider} error:`,
        error
      );

      const providerName =
        provider === "google"
          ? "Google"
          : provider === "facebook"
            ? "Facebook"
            : "LINE";

      alert(
        `เข้าสู่ระบบด้วย ${providerName} ไม่สำเร็จ\n${
          error?.message || "กรุณาลองใหม่อีกครั้ง"
        }`
      );

      setSocialLoading("");
    }
  };

  // ========================================
  // LOGIN ด้วย Email และ Password
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading || socialLoading) return;

    setLoading(true);

    try {
      // 1. ส่งข้อมูลไปยัง Backend
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      // 2. อ่านผลลัพธ์จาก Backend
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error("[Login] Backend error:", result);

        alert(
          result.message ||
            "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูล"
        );

        return;
      }

      // 3. ตรวจสอบ Session
      const { session, profile } = result;

      if (
        !session?.access_token ||
        !session?.refresh_token
      ) {
        console.error("[Login] Missing session:", result);

        alert(
          "ไม่พบข้อมูล Session กรุณาลองเข้าสู่ระบบใหม่"
        );

        return;
      }

      // 4. ตรวจสอบโปรไฟล์ทดลอง
      if (!profile) {
        console.error(
          "[Login] Missing test profile:",
          result
        );

        alert(
          "เข้าสู่ระบบได้ แต่ไม่พบโปรไฟล์ทดลอง กรุณาตรวจสอบ Backend"
        );

        return;
      }

      console.log("[Login] Test profile:", profile);

      // 5. บันทึก Session ให้ Supabase ฝั่ง Frontend
      const { error: sessionError } =
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

      if (sessionError) {
        console.error(
          "[Login] Set session error:",
          sessionError.message
        );

        alert(
          "ไม่สามารถบันทึกสถานะเข้าสู่ระบบได้"
        );

        return;
      }

      // 6. ไปหน้าหลัก
      alert("เข้าสู่ระบบสำเร็จ");

      navigate("/home", { replace: true });
    } catch (error) {
      console.error("[Login] Unexpected error:", error);

      alert(
        "ไม่สามารถเชื่อมต่อ Backend ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่"
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // UI
  // ========================================
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative font-sans">
      <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">

        {/* ปุ่มย้อนกลับ */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-6 right-8 text-gray-800 hover:text-black text-2xl font-bold p-1 cursor-pointer transition"
        >
          ✕
        </button>

        {/* ฝั่งซ้าย: โลโก้และข้อความ */}
        <div className="w-full md:w-5/12 flex flex-col items-center text-center">
          <div className="w-24 h-24 mb-6 text-black flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold text-black tracking-wide mb-2">
            Let’s read LOG IN
          </h1>

          <h2 className="text-sm font-bold text-black mb-1">
            Welcome back, reader!
          </h2>

          <p className="text-xs text-gray-700">
            Ready to find your next favorite book?
          </p>
        </div>

        {/* ฝั่งขวา: ฟอร์มล็อกอิน */}
        <div className="w-full md:w-6/12 flex flex-col">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-bold text-black mb-1.5"
              >
                Email :
              </label>

              <input
                id="login-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#dcdcdc] rounded-lg text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-bold text-black mb-1.5"
              >
                Password :
              </label>

              <input
                id="login-password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#dcdcdc] rounded-lg text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                autoComplete="current-password"
                required
              />
            </div>

            {/* สมัครสมาชิก / ลืมรหัสผ่าน */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <button
                type="button"
                onClick={() => navigate("/Signin")}
                className="font-bold text-black hover:underline cursor-pointer"
              >
                Create Account
              </button>

              <button
                type="button"
                onClick={() => navigate("/forgotpass")}
                className="font-bold text-black underline hover:text-blue-600 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* ปุ่ม Login */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || Boolean(socialLoading)}
                className="w-full py-3 bg-[#dcdcdc] hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed text-black text-xs font-bold rounded-lg transition cursor-pointer"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </div>
          </form>

          {/* เส้นคั่น */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-400" />

            <span className="flex-shrink mx-3 text-xs font-bold text-black">
              Log in With
            </span>

            <div className="flex-grow border-t border-gray-400" />
          </div>

          {/* Social Login */}
          <div className="space-y-3">

            {/* Facebook */}
            <button
              type="button"
              disabled={loading || Boolean(socialLoading)}
              onClick={() => handleSocialLogin("facebook")}
              className="w-full py-3 px-5 rounded-xl font-medium text-xs grid grid-cols-[28px_1fr_28px] items-center bg-gradient-to-r from-[#1877F2] to-[#92bcf7] shadow-sm hover:opacity-95 disabled:opacity-60 transition cursor-pointer"
            >
              <img
                src={FacebookIcon}
                alt="Facebook Logo"
                className="w-7 h-7 object-contain"
              />

              <span className="text-black font-semibold text-center">
                {socialLoading === "facebook"
                  ? "Connecting..."
                  : "Log in with Facebook"}
              </span>

              <div className="w-7" />
            </button>

            {/* Google */}
            <button
              type="button"
              disabled={loading || Boolean(socialLoading)}
              onClick={() => handleSocialLogin("google")}
              className="w-full py-3 px-5 rounded-xl font-medium text-xs grid grid-cols-[28px_1fr_28px] items-center bg-gradient-to-r from-[#feeef1] via-[#d7e5fa] to-[#d6f6db] border border-gray-100 shadow-sm hover:opacity-95 disabled:opacity-60 transition cursor-pointer"
            >
              <img
                src={googleIcon}
                alt="Google Logo"
                className="w-7 h-7 object-contain"
              />

              <span className="text-black font-semibold text-center">
                {socialLoading === "google"
                  ? "Connecting..."
                  : "Log in with Google"}
              </span>

              <div className="w-7" />
            </button>

            {/* LINE */}
            <button
              type="button"
              disabled={loading || Boolean(socialLoading)}
              onClick={() =>
                handleSocialLogin("custom:line-oauth")
              }
              className="w-full py-3 px-5 rounded-xl font-medium text-xs grid grid-cols-[28px_1fr_28px] items-center bg-gradient-to-r from-[#06C755] to-[#97f2a9] shadow-sm hover:opacity-95 disabled:opacity-60 transition cursor-pointer"
            >
              <img
                src={LineIcon}
                alt="LINE Logo"
                className="w-7 h-7 object-contain"
              />

              <span className="text-black font-semibold text-center">
                {socialLoading === "custom:line-oauth"
                  ? "Connecting..."
                  : "Log in with Line"}
              </span>

              <div className="w-7" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
