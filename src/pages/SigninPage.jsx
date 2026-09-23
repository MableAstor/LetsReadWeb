import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignInPage() {
  const navigate = useNavigate();

  // จัดการข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sign in submit:', formData);
  };

  return (
    // ฉากหลังเต็มจอ ไล่เฉดสีพาสเทล
    <div className="min-h-screen w-full bg-gradient-to-tr from-[#dce7f8] via-[#f7e4e5] to-[#fdedcd] flex items-center justify-center p-4 relative font-sans">
      
      {/* ข้อความมุมซ้ายบน */}
      <span className="absolute top-4 left-6 text-gray-400 text-xs font-medium">
        PC sign in
      </span>

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
              <label className="block text-xs font-bold text-black mb-1">
                Email :
              </label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-1.5 bg-[#dcdcdc] rounded-lg text-xs text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
                required
              />
            </div>

            {/* ช่อง Username */}
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Username :
              </label>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3.5 py-1.5 bg-[#dcdcdc] rounded-lg text-xs text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
                required
              />
            </div>

            {/* ช่อง Password */}
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Password :
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3.5 py-1.5 bg-[#dcdcdc] rounded-lg text-xs text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
                required
              />
            </div>

            {/* ช่อง Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Confirm Password :
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3.5 py-1.5 bg-[#dcdcdc] rounded-lg text-xs text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
                required
              />
            </div>

            {/* ปุ่ม Sign in สีเทา */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2 bg-[#dcdcdc] hover:bg-gray-300 text-black text-xs font-bold rounded-lg transition cursor-pointer"
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
          <div className="space-y-2">
            {/* ปุ่ม Facebook */}
            <button
              type="button"
              className="w-full py-2 px-5 rounded-xl text-black font-semibold text-xs flex items-center justify-center gap-3 bg-gradient-to-r from-[#1877F2] to-[#92bcf7] shadow-sm hover:opacity-95 transition cursor-pointer"
            >
              <span className="text-base font-bold bg-white text-[#1877F2] rounded-full w-5 h-5 flex items-center justify-center">
                f
              </span>
              <span>Log in with Facebook</span>
            </button>

            {/* ปุ่ม Google */}
            <button
              type="button"
              className="w-full py-2 px-5 rounded-xl text-black font-semibold text-xs flex items-center justify-center gap-3 bg-gradient-to-r from-[#feeef1] via-[#d7e5fa] to-[#d6f6db] border border-gray-100 shadow-sm hover:opacity-95 transition cursor-pointer"
            >
              <span className="text-sm font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent">
                G
              </span>
              <span>Log in with Google</span>
            </button>

            {/* ปุ่ม Line */}
            <button
              type="button"
              className="w-full py-2 px-5 rounded-xl text-black font-semibold text-xs flex items-center justify-center gap-3 bg-gradient-to-r from-[#06C755] to-[#97f2a9] shadow-sm hover:opacity-95 transition cursor-pointer"
            >
              <span className="text-[10px] font-black bg-white text-[#06C755] px-1 py-0.5 rounded">
                LINE
              </span>
              <span>Log in with Line</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}