import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleConfirm = (e) => {
    e.preventDefault();
    console.log('Sending reset email to:', email);
    // เพิ่มคำสั่งส่งเมลหรือ alert แจ้งเตือนได้ตรงนี้
  };

  return (
    // พื้นหลังไล่เฉดสีชมพูพีชไปส้มอ่อนเต็มจอ จัดองค์ประกอบกึ่งกลาง
    <div className="min-h-screen w-full bg-gradient-to-b from-[#ffd3cb] via-[#ffd6c0] to-[#fed3a7] flex flex-col items-center justify-center p-4 font-sans relative">
      
      {/* ข้อความบอกชื่อหน้ามุมซ้ายบน */}
      <span className="absolute top-4 left-6 text-gray-400 text-xs font-medium">
        forgot
      </span>

      <div className="w-full max-w-sm flex flex-col items-center">
        
        {/* ไอคอนรูปเล่มหนังสือเปิด */}
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

        {/* ข้อความคำแนะนำ */}
        <h1 className="text-base font-semibold text-black text-center mb-6 leading-snug">
          please type in your email <br /> address
        </h1>

        {/* ฟอร์มกรอก Email และปุ่มกดยืนยัน */}
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
              className="w-full px-4 py-2 bg-white rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none shadow-sm"
              required
            />
          </div>

          {/* ปุ่ม Confirm */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2 bg-white hover:bg-gray-50 text-black text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
            >
              Confirm
            </button>
          </div>

          {/* ปุ่ม Go back กดย้อนกลับไปหน้าเดิม */}
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full py-2 bg-white hover:bg-gray-50 text-black text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
            >
              Go back
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}