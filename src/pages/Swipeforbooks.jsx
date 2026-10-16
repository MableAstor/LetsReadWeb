
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Clock3,
  Heart,
  Sparkles,
  X,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { ScrollArea } from "../components/ui/scroll-area";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

const fallbackBooks = [
  {
    id: 1,
    title: "เขมจิราต้องรอด",
    category: "วาย (Yaoi / BL) • ดราม่า/หน่วงตับ",
    author: "คาลิ",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000",
    synopsis:
      "เรื่องราวของเขมจิรา ชายหนุ่มที่เกิดมาพร้อมกับดวงชะตาต้องคำสาปของตระกูล ทุกคนที่เกิดมามักจะต้องพบกับจุดจบก่อนวัยเบญจเพส ทางรอดเดียวคือการผูกชะตาและพึ่งพาบารมีของผู้มีวิชาอาคมแก่กล้า ท่ามกลางอันตรายและเรื่องราวลี้ลับที่คืบคลานเข้ามาใกล้ทุกขณะ",
  },
  {
    id: 2,
    title: "สืบลับคดีพิศวง",
    category: "สืบสวนสอบสวน • เอาชีวิตรอด",
    author: "กิมเมจิ",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000",
    synopsis:
      "การสืบสวนคดีฆาตกรรมปริศนาในคฤหาสน์ปิดตาย ที่ซึ่งหลักฐานทุกอย่างชี้ไปยังสิ่งที่ไม่น่าจะเกิดขึ้นได้จริง",
  },
  {
    id: 3,
    title: "บ้านวิกลคนประหลาด",
    category: "ระทึกขวัญ/สยองขวัญ • ดราม่า",
    author: "อุเก็ตสึ",
    image:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000",
    synopsis:
      "แผนผังบ้านหลังหนึ่งที่มีพื้นที่ว่างปริศนาซ่อนอยู่ นำไปสู่การขุดคุ้ยความลับดำมืดของครอบครัวที่ไม่มีใครกล้าพูดถึง",
  },
  {
    id: 4,
    title: "เพราะเราคู่กัน",
    category: "วาย (Yaoi / BL) • โรงเรียน/มหาลัย",
    author: "JittiRain",
    image:
      "https://images.unsplash.com/photo-1532012164546-f432f2e37b73?q=80&w=1000",
    synopsis:
      "เรื่องราวความรักสุดป่วนในรั้วมหาวิทยาลัย เมื่อต้องขอร้องให้หนุ่มฮอตมาแกล้งเป็นแฟนหลอกๆ จนกลายเป็นความรู้สึกจริง",
  },
  {
    id: 5,
    title: "ราชันเร้นลับ",
    category: "แฟนตาซี • เกิดใหม่/ต่างโลก",
    author: "อ้ายเชียนสุ่ยเตอะอูเจ๋ย",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000",
    synopsis:
      "โจวหมิงรุ่ยตื่นขึ้นมาในร่างของไคลน์ โมเร็ตติ ในโลกยุควิกตอเรียนที่เต็มไปด้วยเวทมนตร์ ปริศนา และเทพโบราณ",
  },
];

export default function Swipeforbooks() {
  const navigate = useNavigate();
  const location = useLocation();

  const books =
    Array.isArray(location.state?.bookList) &&
    location.state.bookList.length > 0
      ? location.state.bookList
      : fallbackBooks;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedBooks, setLikedBooks] = useState([]);
  const [showSynopsis, setShowSynopsis] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);

  const currentBook = books[currentIndex];
  const totalBooks = books.length;

  const progressPercent = Math.min(
    100,
    Math.round((currentIndex / totalBooks) * 100)
  );

  const goToResult = (finalLikes) => {
    navigate("/Result", {
      state: {
        likedBooks: finalLikes,
      },
    });
  };

  const handleLike = () => {
    if (!currentBook) return;

    setShowSynopsis(false);

    const updatedLikes = [...likedBooks, currentBook];

    setLikedBooks(updatedLikes);

    if (currentIndex < totalBooks - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      goToResult(updatedLikes);
    }
  };

  const handleDislike = () => {
    if (!currentBook) return;

    setShowSynopsis(false);

    if (currentIndex < totalBooks - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      goToResult(likedBooks);
    }
  };

  return (
    <div
      className="
        relative isolate
        min-h-dvh w-full
        overflow-x-hidden
        bg-gradient-to-tr
        from-[#ffe8df]
        via-[#fcd8cd]
        to-[#fdedcd]
        px-3 pt-4
        pb-[calc(100px+env(safe-area-inset-bottom))]
        font-sans
        sm:px-6 sm:py-6
        lg:pb-8
      "
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute -top-20 -left-20 -z-10 h-80 w-80 rounded-full bg-pink-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-20 -z-10 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 -z-10 h-80 w-80 rounded-full bg-rose-200/30 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        {/* Header */}
        <header
          className="
            flex w-full flex-wrap
            items-center justify-between
            gap-2 pb-4
            sm:gap-3 sm:pb-6
          "
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="
              h-9 rounded-full
              border-white/70
              bg-white/80
              px-3 text-xs
              text-gray-700
              shadow-xs
              hover:bg-white
            "
          >
            <ArrowLeft className="h-4 w-4" />
            ย้อนกลับ
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowStopModal(true)}
            className="
              h-9 rounded-full
              border-rose-100
              bg-white px-3
              text-xs text-gray-800
              shadow-xs
              hover:bg-rose-50
              sm:px-4
            "
          >
            <Clock3 className="h-4 w-4" />
            หยุดพักหรือประมวลผล
          </Button>

          <Badge
            variant="secondary"
            className="
              hidden items-center gap-1.5
              rounded-full
              bg-white/80 px-3 py-2
              text-xs font-bold
              text-gray-800 shadow-xs
              sm:inline-flex
            "
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            ค้นหาหนังสือที่ใช่
          </Badge>
        </header>

        {/* Main Layout */}
        <main
          className="
            grid w-full min-w-0
            grid-cols-1
            items-start justify-items-center
            gap-6
            lg:grid-cols-2
            lg:gap-8
          "
        >
          {/* LEFT: Swipe Book */}
          <section
            className="
              flex w-full min-w-0
              flex-col items-center
              gap-3
            "
          >
            {/* Progress */}
            <div className="w-full max-w-[340px]">
              <div
                className="
                  mb-2 flex items-center
                  justify-between gap-2
                  text-[11px] font-bold
                  text-gray-600
                "
              >
                <span>ความคืบหน้า</span>

                <span className="shrink-0">
                  เล่มที่ {Math.min(currentIndex + 1, totalBooks)}
                  {" "}จาก {totalBooks}
                </span>
              </div>

              <Progress
                value={progressPercent}
                className="h-2 "
              />
            </div>

            {/* Book Card */}
            <Card
              className="
                group relative
                w-full max-w-[340px]
                min-w-0
                aspect-[2/3]
                max-h-[510px]
                overflow-hidden
                rounded-[1.75rem]
                border-4 border-white/80
                bg-slate-900
                py-0
                shadow-2xl
                sm:rounded-[2.5rem]
              "
            >
              {/* Book Image */}
              <img
                src={currentBook?.image}
                alt={currentBook?.title || "Book cover"}
                className="
                  absolute inset-0
                  h-full w-full
                  object-cover
                  transition-transform
                  duration-500
                  group-hover:scale-105
                "
              />

              {/* Overlay */}
              <div
                className="
                  pointer-events-none
                  absolute inset-0
                  bg-gradient-to-t
                  from-black/95
                  via-black/45
                  to-black/10
                "
              />

              {/* Top Badges */}
              <div
                className="
                  absolute inset-x-3 top-3
                  z-10 flex items-start
                  justify-between gap-2
                  sm:inset-x-4 sm:top-4
                "
              >
                <Badge
                  className="
                    rounded-full
                    border border-white/20
                    bg-white/20 px-3 py-1
                    text-[10px] text-white
                    backdrop-blur-md
                    hover:bg-white/20
                  "
                >
                  🔥 กำลังปัด
                </Badge>

                <Badge
                  className="
                    rounded-full
                    bg-black/60 px-3 py-1
                    text-xs text-white
                    backdrop-blur-md
                    hover:bg-black/60
                  "
                >
                  {currentIndex + 1} / {totalBooks}
                </Badge>
              </div>

              {/* Book Information */}
              <div
                className="
                  absolute inset-x-0 bottom-0
                  z-10 flex flex-col
                  items-center
                  px-4 pb-4
                  text-center
                  sm:px-6 sm:pb-5
                "
              >
                <h2
                  className="
                    w-full break-words
                    text-base font-bold
                    leading-snug text-white
                    drop-shadow-md
                    sm:text-lg
                  "
                >
                  {currentBook?.title}
                </h2>

                <p
                  className="
                    mt-1 w-full
                    text-[11px] font-medium
                    leading-relaxed
                    text-amber-200
                    sm:text-xs
                  "
                >
                  {currentBook?.category}
                  {currentBook?.subCategory
                    ? ` • ${currentBook.subCategory}`
                    : ""}
                </p>

                {currentBook?.author && (
                  <p className="mt-1 text-[11px] text-gray-300">
                    ผู้แต่ง: {currentBook.author}
                  </p>
                )}

                {/* Synopsis Button */}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSynopsis(true)}
                  className="
                    mt-3 h-8 rounded-full
                    border border-white/40
                    bg-white/25 px-4
                    text-xs font-semibold
                    text-white backdrop-blur-md
                    hover:bg-white/35
                    hover:text-white
                  "
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  อ่านเรื่องย่อ
                </Button>

                {/* Swipe Actions */}
                <div
                  className="
                    mt-3 flex w-full
                    items-center justify-center
                    gap-3
                  "
                >
                  <Button
                    type="button"
                    onClick={handleDislike}
                    className="
                      h-10 min-w-0 flex-1
                      max-w-[120px]
                      rounded-xl
                      bg-rose-600
                      text-xs font-bold
                      text-white
                      shadow-md
                      hover:bg-rose-700
                      active:scale-95
                    "
                  >
                    <X className="h-4 w-4" />
                    ข้ามไป
                  </Button>

                  <Button
                    type="button"
                    onClick={handleLike}
                    className="
                      h-10 min-w-0 flex-1
                      max-w-[120px]
                      rounded-xl
                      bg-emerald-500
                      text-xs font-bold
                      text-white
                      shadow-md
                      hover:bg-emerald-600
                      active:scale-95
                    "
                  >
                    <Heart className="h-4 w-4 fill-current" />
                    ถูกใจ
                  </Button>
                </div>
              </div>

              {/* Synopsis Bottom Sheet */}
              {showSynopsis && (
                <div
                  className="
                    absolute inset-x-0 bottom-0
                    z-20 flex h-[80%]
                    min-h-0 flex-col
                    rounded-t-[2rem]
                    bg-white p-4
                    text-gray-900
                    shadow-2xl
                    animate-in
                    slide-in-from-bottom
                    duration-200
                    sm:p-6
                  "
                >
                  <div className="mx-auto mb-3 h-1 w-12 shrink-0 rounded-full bg-gray-200" />

                  <div
                    className="
                      mb-3 flex shrink-0
                      items-start justify-between
                      gap-2 border-b
                      border-gray-100 pb-3
                    "
                  >
                    <h3 className="min-w-0 break-words text-sm font-bold">
                      เรื่องย่อ : {currentBook?.title}
                    </h3>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSynopsis(false)}
                      aria-label="ปิดเรื่องย่อ"
                      className="h-7 w-7 shrink-0 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <ScrollArea className="min-h-0 flex-1">
                    <p
                      className="
                        pr-3 text-left
                        text-xs leading-relaxed
                        text-gray-700
                        whitespace-pre-wrap
                        sm:text-sm
                      "
                    >
                      {currentBook?.synopsis ||
                        "ยังไม่มีข้อมูลเรื่องย่อ"}
                    </p>
                  </ScrollArea>
                </div>
              )}
            </Card>

            {/* Swipe Tip */}
            <p
              className="
                max-w-full rounded-full
                bg-white/50 px-3 py-2
                text-center text-[10px]
                leading-relaxed
                text-gray-600
                sm:px-4
              "
            >
              💡 ทิป: เลือกเล่มที่ชอบเพื่อนำไปสรุปผลอันดับหนังสือ
            </p>
          </section>

          {/* RIGHT: Liked Books */}
          <Card
            className="
              flex w-full min-w-0
              max-w-[480px]
              flex-col gap-0
              rounded-[1.75rem]
              border border-white/60
              bg-white/90
              py-0 shadow-xl
              backdrop-blur-md
              lg:h-[550px]
              lg:max-w-[400px]
              lg:rounded-[2rem]
            "
          >
            <CardHeader
              className="
                flex flex-row items-start
                justify-between gap-3
                border-b border-gray-100
                px-4 py-4
                sm:px-5
              "
            >
              <div className="min-w-0">
                <CardTitle
                  className="
                    flex items-center gap-2
                    text-sm font-bold
                    text-gray-900
                  "
                >
                  <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />
                  รายการที่ถูกใจ
                </CardTitle>

                <p className="mt-1 text-[11px] text-gray-500">
                  บันทึกเล่มโปรดระหว่างการปัด
                </p>
              </div>

              <Badge
                variant="secondary"
                className="
                  shrink-0 rounded-full
                  bg-rose-100 px-3
                  text-xs font-bold
                  text-rose-600
                "
              >
                {likedBooks.length}
              </Badge>
            </CardHeader>

            <CardContent
              className="
                flex min-h-0 flex-1
                flex-col px-4 py-3
                sm:px-5
              "
            >
              <ScrollArea
                className="
                  h-[180px] w-full
                  sm:h-[230px]
                  lg:h-full
                "
              >
                {likedBooks.length === 0 ? (
                  <div
                    className="
                      flex min-h-[160px]
                      flex-col items-center
                      justify-center
                      px-3 py-5
                      text-center
                    "
                  >
                    <div
                      className="
                        mb-3 flex h-14 w-14
                        items-center justify-center
                        rounded-full bg-rose-50
                        text-rose-400
                      "
                    >
                      <BookOpen className="h-7 w-7" />
                    </div>

                    <p className="text-sm font-bold text-gray-600">
                      ยังไม่มีเล่มที่ถูกใจ
                    </p>

                    <p
                      className="
                        mt-1 max-w-[220px]
                        text-[11px] leading-relaxed
                        text-gray-400
                      "
                    >
                      เมื่อเจอนิยายที่ชอบ กดปุ่ม
                      <span className="font-bold text-emerald-600">
                        {" "}♥ ถูกใจ{" "}
                      </span>
                      เพื่อเก็บไว้ที่นี่
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 pr-3">
                    {likedBooks.map((item, index) => (
                      <div
                        key={`${item.id}-${index}`}
                        className="
                          group flex min-w-0
                          items-center gap-3
                          rounded-2xl border
                          border-gray-100
                          bg-white p-2.5
                          shadow-xs transition-colors
                          hover:bg-rose-50/50
                        "
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="
                            h-16 w-12 shrink-0
                            rounded-xl object-cover
                          "
                        />

                        <div className="min-w-0 flex-1">
                          <p
                            className="
                              truncate text-xs
                              font-bold text-gray-800
                            "
                          >
                            {item.title}
                          </p>

                          <p
                            className="
                              mt-1 truncate text-[10px]
                              text-gray-500
                            "
                          >
                            {item.category}
                          </p>

                          <Badge
                            variant="secondary"
                            className="
                              mt-2 rounded-full
                              bg-emerald-50
                              text-[10px]
                              text-emerald-600
                            "
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

            {/* Liked Summary */}
            <div
              className="
                flex items-center
                justify-between gap-2
                border-t border-gray-100
                px-4 py-3
                text-[11px]
                sm:px-5
              "
            >
              <span className="text-gray-500">
                ปัดแล้วทั้งหมด
              </span>

              <span className="font-bold text-gray-800">
                {currentIndex} เล่ม
              </span>
            </div>
          </Card>
        </main>

        {/* Footer */}
        <footer
          className="
            mt-6 text-center
            text-[11px] font-medium
            text-gray-500
          "
        >
          Let's Read — Find your next favorite story
        </footer>
      </div>

      {/* Stop / Analyze Dialog */}
      <Dialog
        open={showStopModal}
        onOpenChange={setShowStopModal}
      >
        <DialogContent
          className="
            !w-[calc(100vw-2rem)]
            !max-w-md
            max-h-[85dvh]
            overflow-y-auto
            rounded-2xl
            p-5
            sm:rounded-3xl
            sm:p-7
          "
        >
          <DialogHeader className="items-center text-center sm:text-center">
            <div
              className="
                mb-2 flex h-14 w-14
                items-center justify-center
                rounded-full bg-amber-50
                text-amber-500
              "
            >
              <Clock3 className="h-7 w-7" />
            </div>

            <DialogTitle
              className="
                text-center text-base
                font-bold leading-relaxed
                text-gray-900
              "
            >
              คุณต้องการที่จะหยุดปัดหาหนังสือใช่หรือไม่
            </DialogTitle>

            <DialogDescription
              className="
                text-center text-xs
                leading-relaxed
                text-gray-500
                sm:text-sm
              "
            >
              คุณสามารถกลับไปเลือกหมวดหมู่
              หรือส่งรายการหนังสือที่ถูกใจไปสรุปผลได้ทันที
              การพักจะยังไม่บันทึกความคืบหน้าอัตโนมัติ
            </DialogDescription>
          </DialogHeader>

          <DialogFooter
            className="
              mt-3 flex flex-col gap-2
              sm:flex-row sm:justify-center
            "
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowStopModal(false);
                navigate("/category");
              }}
              className="
                w-full rounded-xl
                border-rose-200
                bg-rose-50
                text-xs font-bold
                text-rose-700
                hover:bg-rose-100
                sm:flex-1
              "
            >
              พักการปัด
            </Button>

            <Button
              type="button"
              onClick={() => {
                setShowStopModal(false);
                goToResult(likedBooks);
              }}
              className="
                w-full rounded-xl
                bg-emerald-600
                text-xs font-bold
                text-white
                hover:bg-emerald-700
                sm:flex-1
              "
            >
              วิเคราะห์ทันที ({likedBooks.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
