import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Swipeforbooks() {
  const navigate = useNavigate();
  const location = useLocation();

  const fallbackBooks = [
    {
      id: 1,
      title: 'เขมจิราต้องรอด',
      category: 'วาย (Yaoi / BL) • ดราม่า/หน่วงตับ',
      author: 'คาลิ',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000',
      synopsis: 'เรื่องราวของเขมจิรา ชายหนุ่มที่เกิดมาพร้อมกับดวงชะตาต้องคำสาปของตระกูล ทุกคนที่เกิดมามักจะต้องพบกับจุดจบก่อนวัยเบญจเพส ทางรอดเดียวคือการผูกชะตาและพึ่งพาบารมีของผู้มีวิชาอาคมแก่กล้า ท่ามกลางอันตรายและเรื่องราวลี้ลับที่คืบคลานเข้ามาใกล้ทุกขณะ'
    },
    {
      id: 2,
      title: 'สืบลับคดีพิศวง',
      category: 'สืบสวนสอบสวน • เอาชีวิตรอด',
      author: 'กิมเมจิ',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000',
      synopsis: 'การสืบสวนคดีฆาตกรรมปริศนาในคฤหาสน์ปิดตาย ที่ซึ่งหลักฐานทุกอย่างชี้ไปยังสิ่งที่ไม่น่าจะเกิดขึ้นได้จริง'
    },
    {
      id: 3,
      title: 'บ้านวิกลคนประหลาด',
      category: 'ระทึกขวัญ/สยองขวัญ • ดราม่า',
      author: 'อุเก็ตสึ',
      image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000',
      synopsis: 'แผนผังบ้านหลังหนึ่งที่มีพื้นที่ว่างปริศนาซ่อนอยู่ นำไปสู่การขุดคุ้ยความลับดำมืดของครอบครัวที่ไม่มีใครกล้าพูดถึง'
    },
    {
      id: 4,
      title: 'เพราะเราคู่กัน',
      category: 'วาย (Yaoi / BL) • โรงเรียน/มหาลัย',
      author: 'JittiRain',
      image: 'https://images.unsplash.com/photo-1532012164546-f432f2e37b73?q=80&w=1000',
      synopsis: 'เรื่องราวความรักสุดป่วนในรั้วมหาวิทยาลัย เมื่อต้องขอร้องให้หนุ่มฮอตมาแกล้งเป็นแฟนหลอกๆ จนกลายเป็นความรู้สึกจริง'
    },
    {
      id: 5,
      title: 'ราชันเร้นลับ',
      category: 'แฟนตาซี • เกิดใหม่/ต่างโลก',
      author: 'อ้ายเชียนสุ่ยเตอะอูเจ๋ย',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000',
      synopsis: 'โจวหมิงรุ่ยตื่นขึ้นมาในร่างของไคลน์ โมเร็ตติ ในโลกยุควิกตอเรียนที่เต็มไปด้วยเวทมนตร์ ปริศนา และเทพโบราณ'
    }
  ];

  const books = (location.state?.bookList && location.state.bookList.length > 0)
    ? location.state.bookList 
    : fallbackBooks;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedBooks, setLikedBooks] = useState([]);
  const [showSynopsis, setShowSynopsis] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);

  const currentBook = books[currentIndex] || books[0];
  const progressPercent = Math.round(((currentIndex) / books.length) * 100);

  const goToResult = (finalLikes) => {
    navigate('/Result', { 
      state: { likedBooks: finalLikes } 
    });
  };

  const handleLike = () => {
    setShowSynopsis(false);
    const updatedLikes = [...likedBooks, currentBook];
    setLikedBooks(updatedLikes);

    if (currentIndex < books.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      goToResult(updatedLikes);
    }
  };

  const handleDislike = () => {
    setShowSynopsis(false);
    if (currentIndex < books.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      goToResult(likedBooks);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#ffe8df] via-[#fcd8cd] to-[#fdedcd] flex flex-col items-center justify-between p-4 sm:p-6 font-sans select-none relative overflow-hidden">
      
      {/* --- วัตถุตกแต่งพื้นหลัง (Ambient Pastel Blurs) --- */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-pink-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* ================= 1. ส่วนแถบ Header ด้านบน ================= */}
      <header className="w-full max-w-5xl flex items-center justify-between z-10 py-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 bg-white/80 hover:bg-white text-gray-700 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs backdrop-blur-md transition cursor-pointer"
        >
          <span>←</span>
          <span>ย้อนกลับ</span>
        </button>

        {/* แถบแจ้งเตือนหยุดพัก */}
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={() => setShowStopModal(true)}
            className="flex items-center gap-1.5 bg-white hover:bg-rose-50 text-gray-800 px-4 py-1.5 rounded-full text-xs font-semibold shadow-xs transition cursor-pointer border border-rose-100"
          >
            <span>⏱️</span>
            <span>หยุดพักหรือประมวลผล</span>
          </button>
        </div>

        {/* ป้ายบอกสถานะรวม */}
        <div className="bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-xs flex items-center gap-2">
          <span className="text-amber-500">✨</span>
          <span>ค้นหาหนังสือที่ใช่</span>
        </div>
      </header>

      {/* ================= 2. พื้นที่เนื้อหาหลัก (การ์ด + แผงข้าง) ================= */}
      <main className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-8 z-10 my-auto py-4">
        
        {/* ================= ฝั่งซ้าย: การ์ด SWIPE ================= */}
        <div className="flex flex-col items-center">
          
          {/* Progress Bar ด้านบนการ์ด */}
          <div className="w-80 mb-3">
            <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1 px-1">
              <span>ความคืบหน้า</span>
              <span>เล่มที่ {currentIndex + 1} จาก {books.length}</span>
            </div>
            <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / books.length) * 100}%` }}
              />
            </div>
          </div>

          {/* การ์ดหนังสือ */}
          <div className="relative w-80 h-[480px] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/80 group">
            
            {/* ป้าย Badge ด้านบน */}
            <div className="absolute top-4 left-4 z-10 bg-white/20 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/20">
              🔥 กำลังปัด
            </div>

            <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
              {currentIndex + 1} / {books.length}
            </div>

            <img
              src={currentBook.image}
              alt={currentBook.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

            {/* ข้อมูลหนังสือและปุ่มด้านล่าง */}
            <div className="absolute bottom-5 left-0 right-0 px-6 flex flex-col items-center text-center z-10">
              <h2 className="text-white text-lg font-bold drop-shadow-md leading-tight">
                {currentBook.title}
              </h2>

              <p className="text-amber-200 text-xs mt-1 drop-shadow-sm font-medium">
                {currentBook.category}
              </p>

              {currentBook.author && (
                <p className="text-gray-300 text-[11px] mt-0.5 opacity-90">
                  ผู้แต่ง: {currentBook.author}
                </p>
              )}

              {/* ปุ่มเปิดเรื่องย่อ */}
              <button
                type="button"
                onClick={() => setShowSynopsis(true)}
                className="my-3 px-4 py-1.5 bg-white/25 hover:bg-white/35 backdrop-blur-md text-white rounded-full text-xs font-semibold border border-white/40 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>▲</span>
                <span>อ่านเรื่องย่อ</span>
              </button>

              {/* ปุ่ม Action ปัด */}
              <div className="flex gap-3.5 w-full justify-center mt-1">
                <button
                  type="button"
                  onClick={handleDislike}
                  className="flex-1 max-w-[115px] py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <span className="text-sm">✕</span> ข้ามไป
                </button>

                <button
                  type="button"
                  onClick={handleLike}
                  className="flex-1 max-w-[115px] py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <span className="text-sm">♥</span> ถูกใจ
                </button>
              </div>
            </div>

            {/* แผ่นเรื่องย่อ Bottom Sheet */}
            {showSynopsis && (
              <div className="absolute inset-x-0 bottom-0 h-[80%] bg-white rounded-t-[2rem] p-6 z-20 shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200">
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                  <h3 className="text-xs font-bold text-gray-900">เรื่องย่อ : {currentBook.title}</h3>
                  <button
                    type="button"
                    onClick={() => setShowSynopsis(false)}
                    className="text-gray-400 hover:text-black font-bold text-sm cursor-pointer p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="overflow-y-auto text-xs text-gray-700 leading-relaxed text-left pr-1 space-y-2">
                  <p>{currentBook.synopsis}</p>
                </div>
              </div>
            )}
          </div>

          {/* คำใบ้บอกปุ่มลัดด้านล่างการ์ด */}
          <div className="flex items-center gap-3 text-[10px] text-gray-500 font-medium mt-3 bg-white/40 px-4 py-1 rounded-full">
            <span>💡 ทิป: เลือกเล่มที่ชอบเพื่อนำไปสรุปผลอันดับหนังสือ</span>
          </div>

        </div>

        {/* ================= ฝั่งขวา: แผง Dashboard เก็บเล่มที่ชอบ ================= */}
        <div className="w-80 h-[525px] bg-white/90 backdrop-blur-md rounded-[2rem] p-5 shadow-xl flex flex-col border border-white/60">
          
          {/* Header ของแผงขวา */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <span>💖</span>
                <span>รายการที่ถูกใจ</span>
              </h3>
              <p className="text-[10px] text-gray-500 mt-0.5">บันทึกเล่มโปรดระหว่างการปัด</p>
            </div>
            <span className="bg-rose-100 text-rose-600 text-xs font-black px-2.5 py-1 rounded-full">
              {likedBooks.length}
            </span>
          </div>

          {/* รายการหนังสือที่ถูกใจ */}
          <div className="flex-1 overflow-y-auto mt-3 flex flex-col gap-2.5 pr-1">
            {likedBooks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs text-center p-4">
                <div className="w-16 h-16 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center text-2xl mb-3 shadow-inner">
                  📖
                </div>
                <span className="font-bold text-gray-600 text-sm">ยังไม่มีเล่มที่ถูกใจ</span>
                <span className="text-[11px] mt-1 text-gray-400 max-w-[180px]">
                  เมื่อเจอนิยายที่ชอบ กดปุ่ม <span className="text-emerald-600 font-bold">♥ ถูกใจ</span> เพื่อเก็บไว้ที่นี่
                </span>
              </div>
            ) : (
              likedBooks.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center gap-3 bg-white hover:bg-rose-50/50 p-2.5 rounded-2xl border border-gray-100 shadow-xs transition group"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-12 h-16 object-cover rounded-xl shrink-0 shadow-xs group-hover:scale-105 transition"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">
                      {item.category}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        ♥ Liked
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* กล่องสรุปสถานะด้านล่างแผงขวา */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <span className="text-gray-500">ปัดแล้วทั้งหมด</span>
            <span className="font-bold text-gray-800">{currentIndex} เล่ม</span>
          </div>

        </div>

      </main>

      {/* ================= 3. Footer เล็กๆ ด้านล่าง ================= */}
      <footer className="text-[11px] text-gray-500 font-medium z-10 pt-2">
        Let's Read — Find your next favorite story
      </footer>

      {/* Modal แจ้งเตือนหยุดพัก */}
      {showStopModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
            <button
              type="button"
              onClick={() => setShowStopModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-black text-xl font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
              ⏱️
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-2">
              คุณต้องการที่จะหยุดปัดหาหนังสือใช่หรือไม่
            </h3>
            
            <p className="text-xs text-gray-500 leading-relaxed mb-6 px-2">
              เราจะเก็บรายการหนังสือที่คุณเลือกไว้ 20 นาที คุณสามารถเลือกที่จะพักไว้ก่อน หรือส่งไปวิเคราะห์สรุปผลทันทีได้เลยค่ะ
            </p>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setShowStopModal(false);
                  navigate('/category');
                }}
                className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition cursor-pointer border border-rose-200"
              >
                พักการปัด
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowStopModal(false);
                  goToResult(likedBooks);
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-emerald-600/20"
              >
                วิเคราะห์ทันที ({likedBooks.length})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}