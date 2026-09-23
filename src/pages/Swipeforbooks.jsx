import { useState } from 'react';

export default function Swipeforbooks() {
  const bookList = [
    {
      id: 1,
      title: 'เขมจิราต้องรอด',
      category: 'Yaoi • Dark/Tragedy',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000'
    },
    {
      id: 2,
      title: 'สืบลับคดีพิศวง',
      category: 'Mystery • Thriller',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < bookList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      alert('ดูนิยายครบทุกเรื่องแล้วค่ะ!');
    }
  };

  const currentBook = bookList[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center py-6">
      {/* 1. ปุ่มสถานะด้านบน */}
      <button 
        type="button" 
        className="mb-4 flex items-center gap-1.5 bg-white text-black px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:bg-gray-50 transition"
      >
        <span>⏱️</span>
        <span>หยุดพักหรือประมวลผล</span>
      </button>

      {/* 2. การ์ดรูปปกนิยาย */}
      <div className="relative w-80 h-[480px] bg-black rounded-3xl overflow-hidden shadow-2xl">
        <img
          src={currentBook.image}
          alt={currentBook.title}
          className="w-full h-full object-cover"
        />

        {/* Gradient เงามืดเพื่อให้อ่านตัวหนังสือชัด */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

        {/* 3. รายละเอียดและปุ่มกด */}
        <div className="absolute bottom-6 left-0 right-0 px-6 flex flex-col items-center text-center">
          <h2 className="text-white text-base font-bold drop-shadow">
            {currentBook.title}
          </h2>
          <p className="text-gray-200 text-xs mt-0.5 mb-4 drop-shadow">
            {currentBook.category}
          </p>

          <div className="flex gap-3 w-full justify-center">
            {/* ปุ่ม Dislike */}
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 max-w-[110px] py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full flex items-center justify-center gap-1 transition shadow"
            >
              <span>✕</span> Dislike
            </button>

            {/* ปุ่ม Like */}
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 max-w-[110px] py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center gap-1 transition shadow"
            >
              <span>♥</span> Like
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}