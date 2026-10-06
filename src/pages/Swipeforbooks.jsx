import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Swipeforbooks() {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultBooks = [
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

  const bookList = (location.state?.bookList && location.state.bookList.length > 0)
    ? location.state.bookList
    : defaultBooks;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedBooks, setLikedBooks] = useState([]);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showSynopsis, setShowSynopsis] = useState(false);

  const currentBook = bookList[currentIndex] || bookList[bookList.length - 1];

  const goToResult = (finalLikedBooks) => {
    navigate('/Result', { 
      state: { likedBooks: finalLikedBooks } 
    });
  };

  const handleLike = () => {
    setShowSynopsis(false);
    const updatedLikes = [currentBook, ...likedBooks];
    setLikedBooks(updatedLikes);

    if (currentIndex < bookList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      goToResult(updatedLikes);
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
    <div className="min-h-screen bg-[#FCD8CD] flex items-center justify-center p-6 font-sans select-none relative">
      
      {/* ปรับ container กว้างขึ้นเป็น max-w-5xl และเพิ่ม gap-16 ถึง lg:gap-24 เพื่อเขยิบลิสต์ไปทางขวาชัดเจน */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-24 w-full max-w-5xl px-4">

        {/* ================= ฝั่งซ้าย: การ์ด SWIPE ================= */}
        <div className="flex flex-col items-center">
          
          <div className="mb-4 flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => setShowStopModal(true)} 
              className="flex items-center gap-1.5 bg-white text-black px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:bg-gray-100 transition cursor-pointer"
            >
              <span>⏱️</span>
              <span>หยุดพักหรือประมวลผล</span>
            </button>

            <span className="bg-white/80 text-black px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
              Swipe : {currentIndex + 1} / {bookList.length} | Like : {likedBooks.length}
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

            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

            <div className="absolute bottom-5 left-0 right-0 px-6 flex flex-col items-center text-center z-10">
              <h2 className="text-white text-base font-bold drop-shadow">
                {currentBook.title}
              </h2>
              <p className="text-gray-200 text-xs mt-0.5 drop-shadow">
                {currentBook.category}
              </p>

              <button
                type="button"
                onClick={() => setShowSynopsis(true)}
                className="my-2.5 px-4 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full text-[11px] font-semibold border border-white/30 shadow transition cursor-pointer flex items-center gap-1"
              >
                <span>▲</span>
                <span>กดอ่านเรื่องย่อ</span>
              </button>

              <div className="flex gap-3 w-full justify-center">
                <button
                  type="button"
                  onClick={handleDislike}
                  className="flex-1 max-w-[110px] py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full flex items-center justify-center gap-1 transition shadow cursor-pointer"
                >
                  <span>✕</span> Dislike
                </button>

                <button
                  type="button"
                  onClick={handleLike}
                  className="flex-1 max-w-[110px] py-1.5 bg-[#00C471] hover:bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center gap-1 transition shadow cursor-pointer"
                >
                  <span>♥</span> Like
                </button>
              </div>
            </div>

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

        {/* ================= ฝั่งขวา: แผงหนังสือที่กดใจแล้ว (เขยิบไปทางขวา) ================= */}
        <div className="w-80 h-[525px] bg-white rounded-3xl p-5 shadow-xl flex flex-col border border-stone-200 md:ml-auto">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <span>💖</span>
              <span>หนังสือที่ถูกใจแล้ว ({likedBooks.length})</span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto mt-3 flex flex-col gap-2.5 pr-1">
            {likedBooks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs text-center p-4">
                <span className="text-3xl mb-2">📖</span>
                <span className="font-semibold text-gray-600">ยังไม่มีหนังสือที่กดใจ</span>
                <span className="text-[11px] mt-1 text-gray-400">
                  เมื่อกดปุ่ม Like สีเขียว รายชื่อหนังสือจะมาโผล่ตรงนี้ทันที
                </span>
              </div>
            ) : (
              likedBooks.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center gap-3 bg-stone-50 hover:bg-stone-100 p-2.5 rounded-2xl border border-stone-100 shadow-xs transition"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-12 h-16 object-cover rounded-xl shrink-0 shadow-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">
                      {item.category}
                    </p>
                    <span className="inline-flex items-center text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1.5">
                      ♥ Liked
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {showStopModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
            <button
              type="button"
              onClick={() => setShowStopModal(false)}
              className="absolute top-4 right-5 text-gray-500 hover:text-black text-xl font-bold cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-gray-900 mb-3">
              คุณต้องการที่จะหยุดปัดหาหนังสือใช่หรือไม่
            </h3>
            
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              แจ้งให้ทราบก่อนว่าเราจะเก็บการปัดของคุณไว้เพียง 20 นาทีเท่านั้น หากครบกำหนดระบบจะทำการวิเคราะห์หนังสือทั้งหมดที่คุณได้ปัดไป คุณสามารถกลับมาปัดต่อหรือดูผลลัพธ์ได้ทุกเมื่อ
            </p>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setShowStopModal(false);
                  navigate('/category');
                }}
                className="flex-1 py-2.5 bg-[#780000] hover:bg-red-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                พักการปัด
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowStopModal(false);
                  goToResult(likedBooks);
                }}
                className="flex-1 py-2.5 bg-[#008000] hover:bg-green-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                วิเคราะห์ทันที
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}