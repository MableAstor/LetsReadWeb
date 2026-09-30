import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Swipeforbooks() {
  const navigate = useNavigate();

  // ข้อมูลหนังสือพร้อมเรื่องย่อแต่ละเรื่อง
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
  const [showStopModal, setShowStopModal] = useState(false); // ควบคุมเปิด/ปิด Modal หยุดพัก
  const [showSynopsis, setShowSynopsis] = useState(false);   // 👈 1. State เปิด/ปิดเรื่องย่อ

  // ส่งผลลัพธ์ไปหน้าสรุป Result
  const goToResult = (finalLikedBooks) => {
    navigate('/Result', { 
      state: { likedBooks: finalLikedBooks } 
    });
  };

  // กดปุ่ม Like
  const handleLike = () => {
    setShowSynopsis(false);
    const newLikedList = [...likedBooks, bookList[currentIndex]];
    setLikedBooks(newLikedList);

    if (currentIndex < bookList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      alert(`🎉 คุณดูครบทุกเล่มแล้ว! เลือกถูกใจไปทั้งหมด ${newLikedList.length} เล่ม`);
      goToResult(newLikedList);
    }
  };

  // กดปุ่ม Dislike
  const handleDislike = () => {
    setShowSynopsis(false);
    if (currentIndex < bookList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      alert(`🎉 คุณดูครบทุกเล่มแล้ว! เลือกถูกใจไปทั้งหมด ${likedBooks.length} เล่ม`);
      goToResult(likedBooks);
    }
  };

  const currentBook = bookList[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center py-6 relative font-sans select-none min-h-screen bg-[#FCD8CD]">
      
      {/* ส่วนหัวแสดงปุ่มหยุดและตัวนับเล่ม */}
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
          Swipe : {currentIndex + 1} Like : {likedBooks.length}
        </span>
      </div>

      {/* กล่องการ์ดหนังสือสำหรับปัด */}
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

          {/* 👈 2. ปุ่มเปิดเรื่องย่อ (แสดงขึ้นมาชัดเจน) */}
          <button
            type="button"
            onClick={() => setShowSynopsis(true)}
            className="my-2.5 px-4 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full text-[11px] font-semibold border border-white/30 shadow transition cursor-pointer flex items-center gap-1"
          >
            <span>▲</span>
            <span>กดอ่านเรื่องย่อ</span>
          </button>

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
              className="flex-1 max-w-[110px] py-1.5 bg-[#00C471] hover:bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center gap-1 transition shadow cursor-pointer"
            >
              <span>♥</span> Like
            </button>
          </div>
        </div>

        {/* 👈 3. แผ่นเรื่องย่อสีขาวที่จะสไลด์ขึ้นมาเมื่อกดปุ่ม "กดอ่านเรื่องย่อ" */}
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

      {/* --- กล่อง Modal แจ้งเตือนเมื่อกดหยุดการประมวลผลก่อนครบ --- */}
      {showStopModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
            
            {/* ปุ่มปิด X */}
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
              {/* ปุ่มพักการปัด -> นำทางไปหน้า Swiperesume / Category */}
              <button
                type="button"
                onClick={() => {
                  setShowStopModal(false);
                  navigate('/category'); // 👈 ปรับ path ตามชื่อ Route หน้าพักการปัดของคุณ
                }}
                className="flex-1 py-2.5 bg-[#780000] hover:bg-red-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                พักการปัด
              </button>
              
              {/* ปุ่มวิเคราะห์ทันที -> ส่งข้อมูลที่มีไปประมวลผลที่หน้า Result */}
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