import { useLocation, useNavigate } from 'react-router-dom';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // ดึงรายการหนังสือที่ส่งมาจากหน้า Swipe (ถ้าไม่มีให้เป็นลิสต์ว่าง [])
  const likedBooks = location.state?.likedBooks || [];

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      
      {/* 1. กล่องสีขาวด้านบน */}
      <div className="w-full bg-white rounded-2xl p-8 shadow-md flex justify-center">
        <h1 className="text-xl font-bold text-gray-800">
          สรุปผลรายการหนังสือที่คุณสนใจ
        </h1> 
      </div>

      {/* 2. ตัวหนังสือเปล่าๆ ด้านล่าง */}
      <p className="mt-6 text-xl font-bold text-gray-800 text-center">
        จากรายการที่คุณชอบ ({likedBooks.length} เล่ม)
      </p>


    </div>
  );
}