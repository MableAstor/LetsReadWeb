export default function BookSwipeCard() {
  // ฟังก์ชันเมื่อกด Like หรือ Dislike
  const handleDislike = () => {
    console.log('Disliked');
  };

  const handleLike = () => {
    console.log('Liked');
  };

  return (
    <div className="min-h-screen bg-[#FCD8CD] flex flex-col items-center justify-center p-4">
      {/* 1. ปุ่มสถานะด้านบน */}
      <button 
        type="button" 
        className="mb-4 flex items-center gap-1.5 bg-white text-black px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:bg-gray-50 transition"
      >
        <span>⏱️</span>
        <span>หยุดพักหรือประมวลผล</span>
      </button>

      {/* 2. ตัวการ์ดนิยาย */}
      <div className="relative w-80 h-[480px] bg-black rounded-3xl overflow-hidden shadow-2xl">
        {/* รูปหน้าปกนิยาย */}
        <img
          src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000" // แทนที่ด้วย URL รูปปกจริง
          alt="Book Cover"
          className="w-full h-full object-cover"
        />

        {/* Gradient เงามืดทับด้านล่างรูป เพื่อให้อ่านตัวหนังสือชัด */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* 3. รายละเอียดและปุ่มด้านล่างการ์ด */}
        <div className="absolute bottom-6 left-0 right-0 px-6 flex flex-col items-center text-center">
          {/* ชื่อเรื่อง */}
          <h2 className="text-white text-base font-bold drop-shadow">
            เขมจิราต้องรอด
          </h2>

          {/* หมวดหมู่ */}
          <p className="text-gray-200 text-xs mt-0.5 mb-4 drop-shadow">
            Yaoi • Dark/Tragedy
          </p>

          {/* ปุ่ม Dislike และ Like */}
          <div className="flex gap-3 w-full justify-center">
            {/* ปุ่ม X Dislike */}
            <button
              type="button"
              onClick={handleDislike}
              className="flex-1 max-w-[110px] py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full flex items-center justify-center gap-1 transition"
            >
              <span>✕</span> Dislike
            </button>

            {/* ปุ่ม Like */}
            <button
              type="button"
              onClick={handleLike}
              className="flex-1 max-w-[110px] py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center gap-1 transition"
            >
              <span>♥</span> Like
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}