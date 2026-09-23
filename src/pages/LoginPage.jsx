import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ฟังก์ชันเวลากดปุ่มกากบาท ให้ย้อนกลับไปหน้าที่แล้ว
  const handleClose = () => {
    navigate(-1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login with:', { email, password });
  };

  return (
    // 1. พื้นหลังเต็มจอ ไล่เฉดสีพาสเทลตามภาพ
    <div className="min-h-screen w-full bg-gradient-to-tr from-[#dce7f8] via-[#f7e4e5] to-[#fdedcd] flex items-center justify-center p-4 relative font-sans">
      
      {/* ข้อความบอกชื่อมุมซ้ายบน */}
      <span className="absolute top-4 left-6 text-gray-400 text-xs font-medium">
        PC log in
      </span>

      {/* 2. กล่องการ์ดสีขาวตรงกลาง */}
      <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
        
        {/* ปุ่มกากบาท (X) ปิดหน้าต่าง เพื่อย้อนกลับ */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-6 right-8 text-gray-800 hover:text-black text-2xl font-bold p-1 cursor-pointer transition"
        >
          ✕
        </button>

        {/* --- ฝั่งซ้าย: โลโก้และข้อความต้อนรับ --- */}
        <div className="w-full md:w-5/12 flex flex-col items-center text-center">
          {/* ไอคอนรูปหนังสือเปิด */}
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

        {/* --- ฝั่งขวา: ฟอร์มกรอกข้อมูลและปุ่ม Social Login --- */}
        <div className="w-full md:w-6/12 flex flex-col">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ช่องกรอก Email */}
            <div>
              <label className="block text-sm font-bold text-black mb-1.5">
                Email :
              </label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#dcdcdc] rounded-lg text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
            </div>

            {/* ช่องกรอก Password */}
            <div>
              <label className="block text-sm font-bold text-black mb-1.5">
                Password :
              </label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#dcdcdc] rounded-lg text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
            </div>

            {/* ลิงก์ Create Account และ Forgot password? */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <button
                type="button"
                className="font-bold text-black hover:underline cursor-pointer"
              >
                Create Account
              </button>
              <button
                type="button"
                className="font-bold text-black underline hover:text-blue-600 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          </form>

          {/* เส้นคั่น "Log in With" */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-400"></div>
            <span className="flex-shrink mx-3 text-xs font-bold text-black">
              Log in With
            </span>
            <div className="flex-grow border-t border-gray-400"></div>
          </div>

          {/* ปุ่ม Social Login */}
          <div className="space-y-3">
            {/* ปุ่ม Facebook */}
            <button
              type="button"
              className="w-full py-2.5 px-5 rounded-xl text-white font-medium text-xs flex items-center justify-center gap-3 bg-gradient-to-r from-[#1877F2] to-[#92bcf7] shadow-sm hover:opacity-95 transition cursor-pointer"
            >
              <span className="text-base font-bold bg-white text-[#1877F2] rounded-full w-5 h-5 flex items-center justify-center">
                f
              </span>
              <span className="text-black font-semibold">Log in with Facebook</span>
            </button>

            {/* ปุ่ม Google */}
            <button
              type="button"
              className="w-full py-2.5 px-5 rounded-xl font-medium text-xs flex items-center justify-center gap-3 bg-gradient-to-r from-[#feeef1] via-[#d7e5fa] to-[#d6f6db] border border-gray-100 shadow-sm hover:opacity-95 transition cursor-pointer"
            >
              <span className="text-sm font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent">
                G
              </span>
              <span className="text-black font-semibold">Log in with Google</span>
            </button>

            {/* ปุ่ม Line */}
            <button
              type="button"
              className="w-full py-2.5 px-5 rounded-xl font-medium text-xs flex items-center justify-center gap-3 bg-gradient-to-r from-[#06C755] to-[#97f2a9] shadow-sm hover:opacity-95 transition cursor-pointer"
            >
              <span className="text-[10px] font-black bg-white text-[#06C755] px-1 py-0.5 rounded">
                LINE
              </span>
              <span className="text-black font-semibold">Log in with Line</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}