
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Search, BookOpen } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const bookDatabase = [
  {
    id: 1,
    title: "เขมจิราต้องรอด",
    category: "วาย (Yaoi / BL)",
    subCategory: "ดราม่า/หน่วงตับ",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000",
    synopsis:
      "เรื่องราวของเขมจิรา ชายหนุ่มที่เกิดมาพร้อมกับดวงชะตาต้องคำสาปของตระกูล ทุกคนที่เกิดมามักจะต้องพบกับจุดจบก่อนวัยเบญจเพส ทางรอดเดียวคือการผูกชะตาและพึ่งพาบารมีของผู้มีวิชาอาคมแก่กล้า ท่ามกลางอันตรายและเรื่องราวลี้ลับที่คืบคลานเข้ามาใกล้ทุกขณะ",
  },
  {
    id: 2,
    title: "สืบลับคดีพิศวง",
    category: "สืบสวนสอบสวน",
    subCategory: "เอาชีวิตรอด",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000",
    synopsis:
      "การสืบสวนคดีฆาตกรรมปริศนาในคฤหาสน์ปิดตาย ที่ซึ่งหลักฐานทุกอย่างชี้ไปยังสิ่งที่ไม่น่าจะเกิดขึ้นได้จริง",
  },
  {
    id: 3,
    title: "บ้านวิกลคนประหลาด",
    category: "ระทึกขวัญ/สยองขวัญ",
    subCategory: "ดราม่า/หน่วงตับ",
    image:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000",
    synopsis:
      "แผนผังบ้านหลังหนึ่งที่มีพื้นที่ว่างปริศนาซ่อนอยู่ นำไปสู่การขุดคุ้ยความลับดำมืดของครอบครัวที่ไม่มีใครกล้าพูดถึง",
  },
  {
    id: 4,
    title: "เพราะเราคู่กัน",
    category: "วาย (Yaoi / BL)",
    subCategory: "โรงเรียน/มหาลัย",
    image:
      "https://images.unsplash.com/photo-1532012164546-f432f2e37b73?q=80&w=1000",
    synopsis:
      "เรื่องราวความรักสุดป่วนในรั้วมหาวิทยาลัย เมื่อต้องขอร้องให้หนุ่มฮอตมาแกล้งเป็นแฟนหลอกๆ จนกลายเป็นความรู้สึกจริง",
  },
  {
    id: 5,
    title: "ราชันเร้นลับ",
    category: "แฟนตาซี",
    subCategory: "เกิดใหม่/ต่างโลก",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000",
    synopsis:
      "โจวหมิงรุ่ยตื่นขึ้นมาในร่างของไคลน์ โมเร็ตติ ในโลกยุควิกตอเรียนที่เต็มไปด้วยเวทมนตร์ ปริศนา และเทพโบราณ",
  },
];

const mainList = [
  "รักโรแมนติก",
  "แฟนตาซี",
  "กำลังภายใน",
  "สืบสวนสอบสวน",
  "ระทึกขวัญ/สยองขวัญ",
  "ไซไฟ/โลกอนาคต",
  "วาย (Yaoi / BL)",
  "ยูริ (Yuri / GL)",
  "พีเรียด/ย้อนยุค",
  "วรรณกรรม/ชีวิต",
];

const subList = [
  "เกิดใหม่/ต่างโลก",
  "ระบบ/เกมออนไลน์",
  "โรงเรียน/มหาลัย",
  "ดราม่า/หน่วงตับ",
  "คอมเมดี้/ฟีลกู๊ด",
  "มาเฟีย/วงการมืด",
  "เอาชีวิตรอด",
  "สโลว์ไลฟ์",
];

export default function CategoryCard({
  onSearch,
  maxSelect = 5,
}) {
  const navigate = useNavigate();

  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const toggleCategory = (tag, type) => {
    const selected =
      type === "main" ? mainCategories : subCategories;

    const setSelected =
      type === "main"
        ? setMainCategories
        : setSubCategories;

    if (selected.includes(tag)) {
      setSelected((prev) =>
        prev.filter((item) => item !== tag)
      );
      return;
    }

    if (selected.length >= maxSelect) {
      toast.warning(
        `เลือกได้สูงสุด ${maxSelect} หมวดหมู่เท่านั้นค่ะ`
      );
      return;
    }

    setSelected((prev) => [...prev, tag]);
  };

  const handleFindBook = () => {
    if (mainCategories.length === 0) {
      toast.warning(
        "กรุณาเลือกหมวดหลักอย่างน้อย 1 หมวดก่อนค้นหานะคะ"
      );
      return;
    }

    // Filter books by selected main categories
    let filteredBooks = bookDatabase.filter((book) =>
      mainCategories.includes(book.category)
    );

    // Preserve original fallback behavior
    if (filteredBooks.length === 0) {
      filteredBooks = bookDatabase;
    }

    if (onSearch) {
      onSearch({
        main: mainCategories,
        sub: subCategories,
      });
    }

    navigate("/swipeforbooks", {
      state: {
        bookList: filteredBooks,
      },
    });
  };

  const renderCategories = (list, selected, type) =>
    list.map((tag) => {
      const isActive = selected.includes(tag);

      return (
        <Badge
          key={tag}
          variant="outline"
          role="button"
          tabIndex={0}
          aria-pressed={isActive}
          onClick={() => toggleCategory(tag, type)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleCategory(tag, type);
            }
          }}
          className={`
            inline-flex min-h-9 max-w-full
            cursor-pointer items-center
            justify-center gap-1.5
            rounded-full border
            px-3 py-2
            text-[11px] font-medium
            leading-snug whitespace-normal
            transition-all select-none
            sm:min-h-9 sm:px-4 sm:text-xs

            ${
              isActive
                ? "border-[#1D77FF] bg-[#1D77FF] text-white hover:bg-blue-600"
                : "border-gray-200 bg-white text-gray-800 hover:border-gray-400 hover:bg-gray-50"
            }
          `}
        >
          {isActive && (
            <Check className="h-3 w-3 shrink-0" />
          )}

          <span className="break-words text-center">
            {tag}
          </span>
        </Badge>
      );
    });

  return (
    <Card
      className="
        mx-auto w-full max-w-2xl
        min-w-0 gap-0
        rounded-2xl border-0
        bg-white py-0 shadow-sm
        sm:rounded-3xl
      "
    >
      <CardHeader className="px-4 pt-5 pb-3 sm:px-7 sm:pt-7">
        <CardTitle
          className="
            flex items-center gap-2
            text-sm font-bold
            text-gray-900 sm:text-base
          "
        >
          <BookOpen className="h-4 w-4 text-[#1D77FF]" />
          เลือกหมวดหมู่หนังสือ
        </CardTitle>
      </CardHeader>

      <CardContent
        className="
          min-w-0 space-y-6
          px-4 pb-4
          sm:space-y-7 sm:px-7
        "
      >
        {/* Main Categories */}
        <section className="min-w-0 space-y-3">
          <div
            className="
              flex flex-wrap items-center
              justify-between gap-2
            "
          >
            <h2 className="text-xs font-bold text-gray-900 sm:text-sm">
              เลือกหมวดหลัก (1 - {maxSelect} หมวด)
            </h2>

            <Badge
              variant="secondary"
              className="rounded-full text-[10px]"
            >
              {mainCategories.length}/{maxSelect}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {renderCategories(
              mainList,
              mainCategories,
              "main"
            )}
          </div>
        </section>

        {/* Sub Categories */}
        <section className="min-w-0 space-y-3">
          <div
            className="
              flex flex-wrap items-center
              justify-between gap-2
            "
          >
            <h2 className="text-xs font-bold text-gray-900 sm:text-sm">
              เลือกหมวดรอง
            </h2>

            <Badge
              variant="secondary"
              className="rounded-full text-[10px]"
            >
              {subCategories.length}/{maxSelect}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {renderCategories(
              subList,
              subCategories,
              "sub"
            )}
          </div>
        </section>
      </CardContent>

      {/* Find Book Button */}
      <CardFooter
        className="
          flex justify-center
          px-4 pt-2 pb-5
          sm:px-7 sm:pb-7
        "
      >
        <Button
          type="button"
          onClick={handleFindBook}
          className="
            h-10 w-full rounded-full
            bg-[#1D77FF]
            px-8 text-xs font-semibold
            text-white shadow-sm
            hover:bg-blue-600
            sm:w-auto sm:min-w-40
          "
        >
          <Search className="h-4 w-4" />
          Find a Book
        </Button>
      </CardFooter>
    </Card>
  );
}
