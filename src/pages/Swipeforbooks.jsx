import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 1. นำเข้า useNavigate

export default function Swipeforbooks() {
  const navigate = useNavigate(); // 👈 2. ประกาศตัวแปร navigate

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
    },
    {
      id: 3,
      title: 'บ้านวิกลคนประหลาด',
      category: 'Mystery • Thriller',
      image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedBooks, setLikedBooks] = useState([]);

  // ฟังก์ชันพาไปหน้า Result พร้อมแนบรายการหนังสือที่ Like
  const goToResult = (books) => {
    // 👈 3. แก้เป็น /Result ให้ตรงกับที่ตั้งไว้ใน App.jsx
    navigate('/Result', { 
      state: { likedBooks: books } 
    });
  };

  // ฟังก์ชันเมื่อกดปุ่ม "หยุดพักหรือประมวลผล"
  const handleStop = () => {
    goToResult(likedBooks);
  };

  // ฟังก์ชันเมื่อกดปุ่ม Like (สีเขียว)
  const handleLike = () => {
    // เก็บเล่มปัจจุบันเข้า Array
    const newLikedList = [...likedBooks, bookList[currentIndex]];
    setLikedBooks(newLikedList);

    // เช็กว่าเล่มสุดท้ายหรือยัง
    if (currentIndex < bookList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      goToResult(newLikedList); // ถ้าครบแล้ว ส่งไปหน้า Result ทันที
    }
  };

  // ฟังก์ชันเมื่อกดปุ่ม Dislike (สีแดง)
  const handleDislike = () => {
    if (currentIndex < bookList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      goToResult(likedBooks); // ถ้าครบแล้ว ส่งไปหน้า Result ทันที
    }
  };

  const currentBook = bookList[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="mb-4 flex items-center gap-2">
        {/* 👈 4. ใส่ onClick={handleStop} ที่ปุ่มนี้ */}
        <button 
          type="button" 
          onClick={handleStop}
          className="flex items-center gap-1.5 bg-white text-black px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:bg-gray-100 transition cursor-pointer"
        >
          <span>⏱️</span>
          <span>หยุดพักหรือประมวลผล</span>
        </button>

        <span className="bg-white/80 text-black px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
          {currentIndex + 1} / {bookList.length} เรื่อง
        </span>
      </div>

      <div className="relative w-80 h-[480px] bg-black rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold">
          {currentIndex + 1} / {bookList.length}
        </div>

        <img
          src={currentBook.image}
          alt={currentBook.title}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

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
              onClick={handleDislike}
              className="flex-1 max-w-[110px] py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full flex items-center justify-center gap-1 transition shadow cursor-pointer"
            >
              <span>✕</span> Dislike
            </button>

            {/* ปุ่ม Like */}
            <button
              type="button"
              onClick={handleLike}
              className="flex-1 max-w-[110px] py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center gap-1 transition shadow cursor-pointer"
            >
              <span>♥</span> Like
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}