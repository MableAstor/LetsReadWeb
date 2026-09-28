import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. ดึงหนังสือที่ผู้ใช้กดถูกใจจริง ๆ จากหน้า Swipeforbooks
  const likedBooks = location.state?.likedBooks || [];

  // หนังสือแนะนำสำหรับ "หมวดนอกสายตาที่คุณสนใจ" (ตามรูปดีไซน์ The Song of Achilles)
  const surpriseBook = likedBooks[3] || {
    id: 99,
    title: 'The Song of Achilles',
    category: 'Historical • Romance',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600'
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center pb-16 px-4 font-sans">
      
      {/* 1. กล่องสีขาวแถบหัวข้อด้านบน */}
      <div className="w-full max-w-xl bg-white rounded-2xl py-3 px-6 shadow-sm flex items-center justify-center gap-2 mt-2">
        <span className="text-yellow-500 text-sm">✨</span>
        <h1 className="text-sm sm:text-base font-bold text-gray-900 tracking-wide">
          สรุปผลการค้นหาหนังสือหมวดที่สนใจ
        </h1> 
      </div>

      {/* ถ้าไม่มีหนังสือที่ถูกใจเลยแม้แต่เล่มเดียว */}
      {likedBooks.length === 0 ? (
        <div className="mt-12 bg-white/80 backdrop-blur-sm p-8 rounded-3xl text-center shadow-sm max-w-md w-full">
          <p className="text-base font-bold text-gray-800 mb-2">
            ยังไม่มีหนังสือที่คุณกดถูกใจเลยค่ะ
          </p>
          <p className="text-xs text-gray-500 mb-6">
            ลองกลับไปปัดใหม่อีกรอบเพื่อค้นหาหนังสือเล่มโปรดของคุณนะคะ
          </p>
          <button
            type="button"
            onClick={() => navigate('/swipeforbooks')}
            className="bg-[#1877F2] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow hover:bg-blue-600 transition cursor-pointer"
          >
            เริ่มค้นหาใหม่อีกครั้ง
          </button>
        </div>
      ) : (
        /* เมื่อมีหนังสือที่กดถูกใจ จะแสดงผลทั้ง TOP 3 และ หมวดนอกสายตา */
        <div className="w-full mt-8 flex flex-col">
          
          {/* --- 2. ส่วนแสดง TOP 3 เล่ม --- */}
          <div>
            <h2 className="text-xs font-bold text-gray-900 mb-3 tracking-wide">
              TOP 3 เล่ม ที่อาจจะตรงใจกับคุณ
            </h2>

            {/* ตารางแสดงการ์ด 3 คอลัมน์ */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {likedBooks.slice(0, 3).map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition duration-200"
                >
                  {/* รูปปกหนังสือ */}
                  <div className="w-full h-44 sm:h-56 overflow-hidden bg-gray-100">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* ชื่อเรื่อง และ หมวดหมู่ */}
                  <div className="p-3">
                    <h3 className="text-xs font-bold text-gray-900 truncate">
                      {book.title}
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                      {book.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- 3. ส่วนหมวดนอกสายตาที่คุณสนใจ (แสดงด้านล่างเสมอตามรูป) --- */}
          <div className="mt-8">
            <h2 className="text-xs font-bold text-gray-900 mb-3 tracking-wide">
              หมวดนอกสายตาที่คุณสนใจ
            </h2>
            
            <div className="w-1/3 pr-2">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition duration-200">
                <div className="w-full h-44 sm:h-56 overflow-hidden bg-gray-100">
                  <img
                    src={surpriseBook.image}
                    alt={surpriseBook.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-bold text-gray-900 truncate">
                    {surpriseBook.title}
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                    {surpriseBook.category}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ปุ่มสำหรับกลับไปสไวป์ใหม่อีกครั้ง */}
          <div className="flex justify-center mt-10">
            <button
              type="button"
              onClick={() => navigate('/swipeforbooks')}
              className="bg-white text-gray-800 hover:text-black hover:bg-gray-50 border border-gray-200 text-xs font-bold px-6 py-2.5 rounded-full shadow-sm transition cursor-pointer"
            >
              🔄 สไวป์ใหม่อีกครั้ง
            </button>
          </div>

        </div>
      )}

    </div>
  );
}