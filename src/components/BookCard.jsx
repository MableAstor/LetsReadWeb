import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

function BookCover({ book }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group relative mx-auto aspect-[3/4] w-full min-w-0 overflow-hidden rounded-2xl bg-[#F7E4DE] ring-1 ring-[#F0DDD7]">
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
    if (typeof value === "string") return value.split(/[,，、;|]+/).map((part) => part.trim()).filter(Boolean);
    if (value && typeof value === "object") {
      return String(value.name ?? value.Category_Name ?? value.category_name ?? "").split(/[,，、;|]+/).map((part) => part.trim()).filter(Boolean);
    }
    return [];
  });
  return [...new Set(names.map((name) => name.trim()).filter(Boolean))];
}

export function BookCard({ book, hasActions = false }) {
  if (!book) return null;
  const categories = getBookCategories(book);

  return (
    <Card className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[18px] border border-[#F0E0D9] bg-[#FFFCFA] py-0 shadow-none transition-all duration-200 hover:border-[#E7C7C4]">
      <CardContent className={`min-w-0 p-1.5 sm:p-2 ${hasActions ? "pb-11 sm:pb-12" : "pb-3"}`}>
        <BookCover key={book.image} book={book} />

        {/* ชื่ออยู่ติดใต้ปก ไม่ถูกดันลงไปท้ายการ์ด */}
        <h3
          title={book.title}
          className="mt-2 line-clamp-2 min-w-0 break-words text-xs font-semibold leading-snug text-[#674B50] sm:text-sm"
        >
          {book.title}
        </h3>

        {/* หมวดหนังสืออยู่ใต้ชื่อ */}
        {categories.length > 0 && (
          <div className="mt-2 flex min-w-0 flex-wrap items-start gap-x-1.5 gap-y-1.5">
            {categories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="inline-flex max-w-full min-w-0 rounded-full border-0 bg-[#FBEDEA] px-2 py-1 text-[10px] leading-tight font-medium text-[#A36D70] shadow-none"
              >
                <span className="block max-w-full truncate" title={category}>{category}</span>
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
