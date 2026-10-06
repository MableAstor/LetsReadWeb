import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CategoryCard({ onSearch, maxSelect = 5 }) {
  const navigate = useNavigate();

  // 1. ตั้งค่าเริ่มต้นเป็นอาร์เรย์ว่าง []
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // ฐานข้อมูลหนังสือสำหรับกรองตามหมวดหมู่ที่เลือก
  const bookDatabase = [
    {
      id: 1,
      title: 'เขมจิราต้องรอด',
      category: 'วาย (Yaoi / BL)',
      subCategory: 'ดราม่า/หน่วงตับ',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000',
      synopsis: 'เรื่องราวของเขมจิรา ชายหนุ่มที่เกิดมาพร้อมกับดวงชะตาต้องคำสาปของตระกูล ทุกคนที่เกิดมามักจะต้องพบกับจุดจบก่อนวัยเบญจเพส ทางรอดเดียวคือการผูกชะตาและพึ่งพาบารมีของผู้มีวิชาอาคมแก่กล้า ท่ามกลางอันตรายและเรื่องราวลี้ลับที่คืบคลานเข้ามาใกล้ทุกขณะ'
    },
    {
      id: 2,
      title: 'สืบลับคดีพิศวง',
      category: 'สืบสวนสอบสวน',
      subCategory: 'เอาชีวิตรอด',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000',
      synopsis: 'การสืบสวนคดีฆาตกรรมปริศนาในคฤหาสน์ปิดตาย ที่ซึ่งหลักฐานทุกอย่างชี้ไปยังสิ่งที่ไม่น่าจะเกิดขึ้นได้จริง'
    },
    {
      id: 3,
      title: 'บ้านวิกลคนประหลาด',
      category: 'ระทึกขวัญ/สยองขวัญ',
      subCategory: 'ดราม่า/หน่วงตับ',
      image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000',
      synopsis: 'แผนผังบ้านหลังหนึ่งที่มีพื้นที่ว่างปริศนาซ่อนอยู่ นำไปสู่การขุดคุ้ยความลับดำมืดของครอบครัวที่ไม่มีใครกล้าพูดถึง'
    },
    {
      id: 4,
      title: 'เพราะเราคู่กัน',
      category: 'วาย (Yaoi / BL)',
      subCategory: 'โรงเรียน/มหาลัย',
      image: 'https://images.unsplash.com/photo-1532012164546-f432f2e37b73?q=80&w=1000',
      synopsis: 'เรื่องราวความรักสุดป่วนในรั้วมหาวิทยาลัย เมื่อต้องขอร้องให้หนุ่มฮอตมาแกล้งเป็นแฟนหลอกๆ จนกลายเป็นความรู้สึกจริง'
    },
    {
      id: 5,
      title: 'ราชันเร้นลับ',
      category: 'แฟนตาซี',
      subCategory: 'เกิดใหม่/ต่างโลก',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000',
      synopsis: 'โจวหมิงรุ่ยตื่นขึ้นมาในร่างของไคลน์ โมเร็ตติ ในโลกยุควิกตอเรียนที่เต็มไปด้วยเวทมนตร์ ปริศนา และเทพโบราณ'
    }
  ];

  // 2. รายการหมวดหลัก
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

  // 3. รายการหมวดรอง
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

    // กรองหนังสือตามหมวดหลักที่เลือก (ถ้าไม่มีเล่มไหนตรง ให้แสดงหนังสือทั้งหมดแทน)
    let filteredBooks = bookDatabase.filter((book) =>
      mainCategories.includes(book.category)
    );

    if (filteredBooks.length === 0) {
      filteredBooks = bookDatabase;
    }

    if (onSearch) {
      onSearch({ main: mainCategories, sub: subCategories });
    }
    
    // ส่งรายการหนังสือที่กรองแล้วไปยังหน้า Swipeforbooks
    navigate('/swipeforbooks', {
      state: { bookList: filteredBooks }
    });
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

      {/* --- หมวดหมู่แถวที่ 2: หมวดรอง --- */}
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