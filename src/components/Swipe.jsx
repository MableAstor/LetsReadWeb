import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Swipeforbooks() {
  const navigate = useNavigate();

  // ข้อมูลหนังสือพร้อมเรื่องย่อ
  const bookList = [
    {
      id: 1,
      title: 'เขมจิราต้องรอด',
      category: 'Yaoi • Dark/Tragedy',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000',
      synopsis: 'เรื่องราวของเขมจิรา ชายหนุ่มที่เกิดมาพร้อมกับดวงชะตาต้องคำสาปของตระกูล ทุกคนที่เกิดมามักจะต้องพบกับจุดจบก่อนวัยเบญจเพส ทางรอดเดียวคือการผูกชะตาและพึ่งพาบารมีของผู้มีวิชาอาคมแก่กล้า ท่ามกลางอันตรายและเรื่องราวลี้ลับที่คืบคลานเข้ามาใกล้ทุกขณะ'
    },
    {
      id: 2,
      title: 'สืบลับคดีพิศวง',
      category: 'Mystery • Thriller',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000',
      synopsis: 'การสืบสวนคดีฆาตกรรมปริศนาในคฤหาสน์ปิดตาย ที่ซึ่งหลักฐานทุกอย่างชี้ไปยังสิ่งที่ไม่น่าจะเกิดขึ้นได้จริง'
    },
    {
      id: 3,
      title: 'บ้านวิกลคนประหลาด',
      category: 'Mystery • Thriller',
      image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000',
      synopsis: 'แผนผังบ้านหลังหนึ่งที่มีพื้นที่ว่างปริศนาซ่อนอยู่ นำไปสู่การขุดคุ้ยความลับดำมืดของครอบครัวที่ไม่มีใครกล้าพูดถึง'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedBooks, setLikedBooks] = useState([]);
  const [showSynopsis, setShowSynopsis] = useState(false); // 👈 State สำหรับเปิด/ปิดเรื่องย่อ

  const currentBook = bookList[currentIndex];

  const goToResult = (books) => {
    navigate('/Result', { 
      state: { likedBooks: books } 
    });
  };

  const handleStop = () => {
    goToResult(likedBooks);
  };

  const handleLike = () => {
    setShowSynopsis(false);
    const newLikedList = [...likedBooks, currentBook];
    setLikedBooks(newLikedList);

    if (currentIndex < bookList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      goToResult(newLikedList);
    }
  };

  const handleDislike = () => {
    setShowSynopsis(false);
    if (currentIndex < bookList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      goToResult(likedBooks);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCD8CD] flex flex-col items-center justify-center p-4 font-sans select-none">
      
      {/* 1. ปุ่มสถานะด้านบน */}
      <div className="mb-4 flex items-center gap-2">
        <button 
          type="button" 
          onClick={handleStop}
          className="flex items-center gap-1.5 bg-white text-black px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:bg-gray-50 transition cursor-pointer"
        >
          <span>⏱️</span>
          <span>หยุดพักหรือประมวลผล</span>
        </button>

        <span className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
          Swipe : {currentIndex + 1} Like : {likedBooks.length}
        </span>
      </div>

      {/* 2. การ์ดหนังสือ */}
      <div className="relative w-80 h-[480px] bg-black rounded-3xl overflow-hidden shadow-2xl">
        
        {/* ป้ายลำดับมุมขวาบน */}
        <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
          {currentIndex + 1} / {bookList.length}
        </div>

        {/* ภาพปก */}
        <img
          src={currentBook.image}
          alt={currentBook.title}
          className="w-full h-full object-cover"
        />

        {/* เงาดำด้านล่าง */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

        {/* ข้อมูลหนังสือและปุ่มด้านล่าง */}
        <div className="absolute bottom-5 left-0 right-0 px-6 flex flex-col items-center text-center z-10">
          <h2 className="text-white text-base font-bold drop-shadow">
            {currentBook.title}
          </h2>

          <p className="text-gray-300 text-xs mt-0.5 drop-shadow">
            {currentBook.category}
          </p>

          {/* 👈 ปุ่มเปิดเรื่องย่อที่เพิ่มเข้ามาใหม่ */}
          <button
            type="button"
            onClick={() => setShowSynopsis(true)}
            className="my-3 px-3.5 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full text-[11px] font-semibold border border-white/30 shadow transition cursor-pointer flex items-center gap-1"
          >
            <span>▲</span>
            <span>อ่านเรื่องย่อ</span>
          </button>

          {/* ปุ่ม Dislike และ Like */}
          <div className="flex gap-3 w-full justify-center">
            <button
              type="button"
              onClick={handleDislike}
              className="flex-1 max-w-[110px] py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full flex items-center justify-center gap-1 transition shadow cursor-pointer"
            >
              <span>✕</span> Dislike
            </button>

            <button
              type="button"
              onClick={handleLike}
              className="flex-1 max-w-[110px] py-2 bg-[#00C471] hover:bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center gap-1 transition shadow cursor-pointer"
            >
              <span>♥</span> Like
            </button>
          </div>
        </div>

        {/* 3. แผ่นเรื่องย่อที่จะสไลด์ขึ้นมาเมื่อกดปุ่ม "อ่านเรื่องย่อ" */}
        {showSynopsis && (
          <div className="absolute inset-x-0 bottom-0 h-[75%] bg-white rounded-t-3xl p-5 z-20 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b pb-2">
              <h3 className="text-xs font-bold text-gray-900">เรื่องย่อ : {currentBook.title}</h3>
              <button
                type="button"
                onClick={() => setShowSynopsis(false)}
                className="text-gray-400 hover:text-black font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto text-xs text-gray-700 leading-relaxed text-left pr-1">
              <p>{currentBook.synopsis}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}