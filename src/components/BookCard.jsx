import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

function BookCover({ book }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group relative mx-auto aspect-[3/4] w-full min-w-0 overflow-hidden rounded-lg bg-[#F7E4DE]">
      {!imageError && book.image ? (
        <img
          src={book.image}
          alt={`ปกหนังสือ ${book.title}`}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-[#9B8583]">
          ไม่พบรูปปกหนังสือ
        </div>
      )}
    </div>
  );
}

function getBookCategories(book) {
  // รองรับชื่อ field ที่พบได้บ่อย โดยไม่สร้างหมวดขึ้นเอง
  const raw = [
    book.category,
    book.categories,
    book.mainCategory,
    book.main_category,
    book.Main_Category,
    book.Category_Name,
    book.subcategory,
    book.subCategory,
    book.sub_category,
    book.Sub_Category,
    book.tags,
  ];
  const names = raw.flatMap((value) => {
    if (Array.isArray(value)) return value;
    return value == null ? [] : [value];
  }).flatMap((value) => {
    if (typeof value === "string") return [value];
    if (value && typeof value === "object") {
      return [value.name ?? value.Category_Name ?? value.category_name].filter(Boolean);
    }
    return [];
  });
  return [...new Set(names.map((name) => name.trim()).filter(Boolean))];
}

export function BookCard({ book, hasActions = false }) {
  if (!book) return null;
  const categories = getBookCategories(book);

  return (
    <Card className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-xl border-2 bg-white py-0 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <CardContent className={`min-w-0 p-2 sm:p-3 ${hasActions ? "pb-11 sm:pb-12" : "pb-3"}`}>
        <BookCover key={book.image} book={book} />

        {/* ชื่ออยู่ติดใต้ปก ไม่ถูกดันลงไปท้ายการ์ด */}
        <h3
          title={book.title}
          className="mt-2 line-clamp-2 min-w-0 break-words text-xs font-semibold leading-snug text-[#533C3E] sm:text-sm"
        >
          {book.title}
        </h3>

        {/* หมวดหนังสืออยู่ใต้ชื่อ */}
        {categories.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-start gap-1">
            {categories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="max-w-full whitespace-normal break-words rounded-full bg-[#FAEFEB] px-1.5 py-0.5 text-[10px] font-normal text-[#A36D70]"
              >
                {category}
              </Badge>
            ))}
          </div>
        )}

        {book.author && (
          <p className="mt-1.5 truncate text-[10px] text-[#9B8583] sm:text-xs">
            {book.author}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
