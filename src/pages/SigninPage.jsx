import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FacebookIcon from "../assets/facebook-logo.png";
import LineIcon from "../assets/line-logo.png";
import googleIcon from "../assets/google-logo.png";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function SignInPage() {
  const navigate = useNavigate();

  // State สำหรับเปิด-ปิดดูรหัสผ่านทั้งสองช่อง
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // จัดการข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message);
        return;
      }

      alert("สมัครสมาชิกสำเร็จ");
      navigate("/Login");
    } catch (error) {
      console.error(error);
      alert("ไม่สามารถเชื่อมต่อ Server ได้");
    }
  };

  const handleSocialLogin = async (provider) => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/home`,
    },
  });

  if (error) {
    console.error("Social login error:", error);
    alert("เข้าสู่ระบบไม่สำเร็จ: " + error.message);
  }
};

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative font-sans">
      {/* กล่องการ์ดสีขาวตรงกลาง */}
      <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-12 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* ปุ่มกากบาท (X) มุมขวาบน */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-6 right-8 text-gray-800 hover:text-black text-2xl font-bold p-1 cursor-pointer transition"
        >
          ✕
        </button>

        {/* --- ฝั่งซ้าย: โลโก้และข้อความต้อนรับ --- */}
        <div className="w-full md:w-5/12 flex flex-col items-center text-center">
          {/* ไอคอนรูปเล่มหนังสือ */}
          <div className="w-20 h-20 mb-4 text-black flex items-center justify-center">
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
            Let’s read SIGN IN
          </h1>
          <h2 className="text-sm font-bold text-black mb-1">
            Welcome to Let’s Read!
          </h2>
          <p className="text-xs text-gray-700">
            Your next favorite story is waiting for you.
          </p>
        </div>

        {/* --- ฝั่งขวา: ฟอร์มสมัคร 4 ช่อง + ปุ่ม Social --- */}
        <div className="w-full md:w-6/12 flex flex-col">
          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* ช่อง Email */}
            <div>
              <label className="block text-md font-bold text-black mb-1">
                Email :
              </label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-3 bg-[#dcdcdc] rounded-lg text-xs text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
                required
              />
            </div>

            {/* ช่อง Username */}
            <div>
              <label className="block text-md font-bold text-black mb-1">
                Username :
              </label>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3.5 py-3 bg-[#dcdcdc] rounded-lg text-xs text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
                required
              />
            </div>

            {/* ช่อง Password */}
            <div>
              <label className="block text-md font-bold text-black mb-1">
                Password :
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-3.5 pr-11 py-3 bg-[#dcdcdc] rounded-lg text-xs text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* ช่อง Confirm Password */}
            <div>
              <label className="block text-md font-bold text-black mb-1">
                Confirm Password :
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-3.5 pr-11 py-3 bg-[#dcdcdc] rounded-lg text-xs text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* ปุ่ม Sign in สีเทา */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-[#dcdcdc] hover:bg-gray-300 text-black text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Sign in
              </button>
            </div>
          </form>

          {/* เส้นคั่น "Sign in With" */}
          <div className="relative flex py-3 items-center">
            <div className="flex-grow border-t border-gray-400"></div>
            <span className="flex-shrink mx-3 text-xs font-bold text-black">
              Sign in With
            </span>
            <div className="flex-grow border-t border-gray-400"></div>
          </div>

          {/* ปุ่ม Social Login */}
          <div className="space-y-3">
            {/* ปุ่ม Facebook */}
            <button
              type="button"
              onClick={() => handleSocialLogin("facebook")}
              className="w-full py-3 px-5 rounded-xl font-medium text-xs grid grid-cols-[28px_1fr_28px] items-center bg-gradient-to-r from-[#1877F2] to-[#92bcf7] shadow-sm hover:opacity-95 transition cursor-pointer"
            >
              <img
                src={FacebookIcon}
                alt="Facebook Logo"
                className="w-7 h-7 object-contain"
              />
              <span className="text-black font-semibold text-center">
                Log in with Facebook
              </span>
              <div className="w-7"></div>
            </button>

            {/* ปุ่ม Google */}
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              className="w-full py-3 px-5 rounded-xl font-medium text-xs grid grid-cols-[28px_1fr_28px] items-center bg-gradient-to-r from-[#feeef1] via-[#d7e5fa] to-[#d6f6db] border border-gray-100 shadow-sm hover:opacity-95 transition cursor-pointer"
            >
              <img
                src={googleIcon}
                alt="Google Logo"
                className="w-7 h-7 object-contain"
              />
              <span className="text-black font-semibold text-center">
                Log in with Google
              </span>
              <div className="w-7"></div>
            </button>

            {/* ปุ่ม Line */}
            <button
              type="button"
              onClick={() => handleSocialLogin("custom:line")}
              className="w-full py-3 px-5 rounded-xl font-medium text-xs grid grid-cols-[28px_1fr_28px] items-center bg-gradient-to-r from-[#06C755] to-[#97f2a9] shadow-sm hover:opacity-95 transition cursor-pointer"
            >
              <img
                src={LineIcon}
                alt="Line Logo"
                className="w-7 h-7 object-contain"
              />
              <span className="text-black font-semibold text-center">
                Log in with Line
              </span>
              <div className="w-7"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}