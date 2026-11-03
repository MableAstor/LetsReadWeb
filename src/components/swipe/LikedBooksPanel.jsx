
import { BookOpen, Check, Heart } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";

const getBookCategory = (book) =>
  book?.category ??
  book?.main_category ??
  book?.Main_Category ??
  book?.CATEGORY ??
  "";

export default function LikedBooksPanel({ likedBooks, swipedBooks }) {
  return (
    <Card className="flex w-full min-w-0 max-w-[480px] flex-col gap-0 rounded-[1.75rem] border border-white/60 bg-white/90 py-0 shadow-xl backdrop-blur-md lg:h-[550px] lg:max-w-[400px] lg:rounded-[2rem]">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />
            รายการที่ถูกใจ
          </CardTitle>

          <p className="mt-1 text-[11px] text-gray-500">
            บันทึกเล่มโปรดระหว่างการปัด
          </p>
        </div>

        <Badge
          variant="secondary"
          className="shrink-0 rounded-full bg-rose-100 px-3 text-xs font-bold text-rose-600"
        >
          {likedBooks.length}
        </Badge>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col px-4 py-3 sm:px-5">
        <ScrollArea className="h-[180px] w-full sm:h-[230px] lg:h-full">
          {likedBooks.length === 0 ? (
            <div className="flex min-h-[160px] flex-col items-center justify-center px-3 py-5 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-400">
                <BookOpen className="h-7 w-7" />
              </div>

              <p className="text-sm font-bold text-gray-600">
                ยังไม่มีเล่มที่ถูกใจ
              </p>

              <p className="mt-1 max-w-[220px] text-[11px] leading-relaxed text-gray-400">
                เมื่อเจอหนังสือที่ชอบ กดปุ่ม
                <span className="font-bold text-emerald-600">
                  {" "}
                  ♥ ถูกใจ{" "}
                </span>
                หรือปัดไปทางขวาเพื่อเก็บไว้ที่นี่
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 pr-3">
              {likedBooks.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="group flex min-w-0 items-center gap-3 rounded-2xl border border-gray-100 bg-white p-2.5 shadow-xs transition-colors hover:bg-rose-50/50"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-16 w-12 shrink-0 rounded-xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-gray-800">
                      {item.title}
                    </p>

                    <p className="mt-1 truncate text-[10px] text-gray-500">
                      {getBookCategory(item)}
                    </p>

                    <Badge
                      variant="secondary"
                      className="mt-2 rounded-full bg-emerald-50 text-[10px] text-emerald-600"
                    >
                      <Check className="h-3 w-3" />
                      Liked
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-4 py-3 text-[11px] sm:px-5">
        <span className="text-gray-500">ปัดแล้วทั้งหมด</span>

        <span className="font-bold text-gray-800">
          {swipedBooks.length} เล่ม
        </span>
      </div>
    </Card>
  );
}
