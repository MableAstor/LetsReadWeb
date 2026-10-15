
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleConfirm = async (e) => {
    e.preventDefault();

    setMessage("");
    setErrorMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        console.error("Password reset error:", error.message);
        setErrorMessage(
          "ส่งคำขอรีเซ็ตรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
        );
        return;
      }

      setMessage(
        "หากอีเมลนี้ลงทะเบียนไว้ ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านให้ กรุณาตรวจสอบกล่องจดหมายและ Spam"
      );
    } catch (error) {
      console.error("Password reset error:", error);
      setErrorMessage("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative font-sans">
      <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-12 md:p-16 flex flex-col items-center justify-between gap-10">

        <div className="w-20 h-20 mb-3 text-black flex items-center justify-center">
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

        <h1 className="text-base md:text-md font-bold text-black text-center mb-6 leading-snug">
          Enter the email address associated with your account
          <br />
          to receive a password reset link.
        </h1>

        <form onSubmit={handleConfirm} className="w-full flex flex-col space-y-3">
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Email :
            </label>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none shadow-sm"
              required
              disabled={loading}
            />
          </div>

          {message && (
            <p role="status" className="text-sm text-green-700">
              {message}
            </p>
          )}

          {errorMessage && (
            <p role="alert" className="text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white hover:bg-gray-50 disabled:opacity-60 text-black text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
            >
              {loading ? "Sending..." : "Confirm"}
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => navigate("/Login")}
              className="w-full py-3 bg-white hover:bg-gray-50 text-black text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
            >
              Go back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
