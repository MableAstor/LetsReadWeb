import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Swipeforbooks() {
  const navigate = useNavigate();

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
  const [showStopModal, setShowStopModal] = useState(false); // ควบคุมการเปิด/ปิดแจ้งเตือนหยุดพัก

  // ส่งข้อมูลหนังสือที่กด Like ไปหน้า Result
  const goToResult = (finalLikedBooks) => {
    navigate('/Result', { 
      state: { likedBooks: finalLikedBooks } 
    });
  };

  // กดปุ่ม Like
  const handleLike = () => {
    const newLikedList = [...likedBooks, bookList[currentIndex]];
    setLikedBooks(newLikedList);

    if (currentIndex < bookList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // 👈 ปัดครบทั้งหมด: แจ้งเตือนก่อนแล้วค่อยพาไป
      alert(`🎉 คุณดูครบทุกเล่มแล้ว! เลือกถูกใจไปทั้งหมด ${newLikedList.length} เล่ม`);
      goToResult(newLikedList);
    }
  };

  // กดปุ่ม Dislike
  const handleDislike = () => {
    if (currentIndex < bookList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // 👈 ปัดครบทั้งหมด: แจ้งเตือนก่อนแล้วค่อยพาไป
      alert(`🎉 คุณดูครบทุกเล่มแล้ว! เลือกถูกใจไปทั้งหมด ${likedBooks.length} เล่ม`);
      goToResult(likedBooks);
    }
  };

  const currentBook = bookList[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center py-6 relative">
      
      {/* ส่วนหัวแสดงปุ่มหยุดและตัวนับเล่ม */}
      <div className="mb-4 flex items-center gap-2">
        <button 
          type="button" 
          onClick={() => setShowStopModal(true)} // 👈 เปิดกล่องแจ้งเตือนยืนยันหยุดพัก
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

      {/* --- กล่อง Modal แจ้งเตือนเมื่อกดหยุดการประมวลผลก่อนครบ --- */}
      {showStopModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
            
            {/* ปุ่มปิด X */}
            <button
              type="button"
              onClick={() => setShowStopModal(false)}
              className="absolute top-4 right-5 text-gray-500 hover:text-black text-xl font-bold"
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
                onClick={() => setShowStopModal(false)}
                className="flex-1 py-2 bg-[#780000] hover:bg-red-900 text-white rounded-xl text-xs font-bold transition"
              >
                พักการปัด
              </button>
              <button
                type="button"
                onClick={() => goToResult(likedBooks)}
                className="flex-1 py-2 bg-[#008000] hover:bg-green-700 text-white rounded-xl text-xs font-bold transition"
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