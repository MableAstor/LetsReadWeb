import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CategoryCard({ onSearch, maxSelect = 5 }) {
  const navigate = useNavigate();

  // 1. ตั้งค่าเริ่มต้นเป็นอาร์เรย์ว่าง [] เพื่อให้ยังไม่ถูกเลือกทั้งหมวดหลักและหมวดรอง
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // 2. รายการหมวดหลัก (ปรับตามหมวดหมู่สำรวจมาตรฐานของเว็บนิยาย/อ่านหนังสือ)
  const mainList = [
    'รักโรแมนติก',
    'แฟนตาซี',
    'กำลังภายใน',
    'สืบสวนสอบสวน',
    'ระทึกขวัญ/สยองขวัญ',
    'ไซไฟ/โลกอนาคต',
    'วาย (Yaoi / BL)',
    'ยูริ (Yuri / GL)',
    'พีเรียด/ย้อนยุค',
    'วรรณกรรม/ชีวิต'
  ];

  // 3. รายการหมวดรอง (Sub-genres ยอดนิยม)
  const subList = [
    'เกิดใหม่/ต่างโลก',
    'ระบบ/เกมออนไลน์',
    'โรงเรียน/มหาลัย',
    'ดราม่า/หน่วงตับ',
    'คอมเมดี้/ฟีลกู๊ด',
    'มาเฟีย/วงการมืด',
    'เอาชีวิตรอด',
    'สโลว์ไลฟ์'
  ];

  // ฟังก์ชันสลับการเลือก/ยกเลิกเลือก
  const toggleCategory = (tag, selectedList, setSelectedList) => {
    if (selectedList.includes(tag)) {
      setSelectedList(selectedList.filter((item) => item !== tag));
    } else {
      if (selectedList.length < maxSelect) {
        setSelectedList([...selectedList, tag]);
      } else {
        alert(`เลือกได้สูงสุด ${maxSelect} หมวดหมู่เท่านั้นค่ะ`);
      }
    }
  };

  const handleFindBook = () => {
    if (mainCategories.length === 0) {
      alert('กรุณาเลือกหมวดหลักอย่างน้อย 1 หมวดก่อนค้นหานะคะ');
      return;
    }

    if (onSearch) {
      onSearch({ main: mainCategories, sub: subCategories });
    }
   
    navigate('/swipeforbooks');
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-7 shadow-sm">
      
      {/* --- หมวดหมู่แถวที่ 1: หมวดหลัก --- */}
      <div className="space-y-3 mb-6">
        <h2 className="text-xs font-bold text-black">
          เลือกหมวดหลัก ( 1 - 5 หมวด )
        </h2>
        <div className="flex flex-wrap gap-2">
          {mainList.map((tag) => {
            const isActive = mainCategories.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleCategory(tag, mainCategories, setMainCategories)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1D77FF] text-white border-[#1D77FF] shadow-xs'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-gray-400'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- หมวดหมู่แถวที่ 2: หมวดรอง (แก้คำผิดจากหมวดหลักเป็นหมวดรอง) --- */}
      <div className="space-y-3 mb-8">
        <h2 className="text-xs font-bold text-black">
          เลือกหมวดรอง
        </h2>
        <div className="flex flex-wrap gap-2">
          {subList.map((tag) => {
            const isActive = subCategories.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleCategory(tag, subCategories, setSubCategories)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1D77FF] text-white border-[#1D77FF] shadow-xs'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-gray-400'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* ปุ่ม Find a Book */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleFindBook}
          className="bg-[#1D77FF] hover:bg-blue-600 text-white font-semibold text-xs px-8 py-2.5 rounded-full shadow-sm transition-all cursor-pointer"
        >
          Find a Book
        </button>
      </div>

    </div>
  );
}