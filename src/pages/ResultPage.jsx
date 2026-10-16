
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Heart,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

// Book card shared by both sections
function ResultBookCard({ book, rank }) {
  return (
    <Card
      className="
        group min-w-0 gap-0
        overflow-hidden
        rounded-2xl border-0
        bg-white py-0
        shadow-sm transition-all
        duration-200
        hover:-translate-y-1
        hover:shadow-lg
        sm:rounded-3xl
      "
    >
      {/* Book cover */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
        <img
          src={book.image}
          alt={book.title}
          loading="lazy"
          className="
            h-full w-full
            object-cover
            transition-transform
            duration-300
            group-hover:scale-105
          "
        />

        {rank && (
          <Badge
            className="
              absolute left-2 top-2
              rounded-full border-0
              bg-white/95 px-2.5 py-1
              text-[10px] font-bold
              text-gray-800 shadow-sm
              hover:bg-white/95
              sm:left-3 sm:top-3
            "
          >
            {rank === 1
              ? "🥇 TOP 1"
              : rank === 2
              ? "🥈 TOP 2"
              : "🥉 TOP 3"}
          </Badge>
        )}
      </div>

      {/* Book information */}
      <CardContent
        className="
          min-w-0 space-y-1.5
          px-3 py-3
          sm:px-4 sm:py-4
        "
      >
        <h3
          className="
            line-clamp-2 min-h-[2.5em]
            break-words text-xs
            font-bold leading-snug
            text-gray-900
            sm:text-sm
          "
          title={book.title}
        >
          {book.title}
        </h3>

        <p
          className="
            line-clamp-2
            text-[10px] leading-relaxed
            text-gray-500
            sm:text-xs
          "
        >
          {book.category}
          {book.subCategory
            ? ` • ${book.subCategory}`
            : ""}
        </p>

        {book.author && (
          <p className="truncate text-[10px] text-gray-400 sm:text-xs">
            ผู้แต่ง: {book.author}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const likedBooks = Array.isArray(location.state?.likedBooks)
    ? location.state.likedBooks
    : [];

  const topBooks = likedBooks.slice(0, 3);

  // Mock discovery recommendation.
  // Keep the original fallback until a real
  // recommendation API is implemented.
  const surpriseBook = likedBooks[3] || {
    id: 99,
    title: "The Song of Achilles",
    category: "Historical • Romance",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600",
  };

  const handleRestart = () => {
    navigate("/swipe");
  };

  return (
    <main
      className="
        mx-auto flex w-full
        max-w-4xl min-w-0
        flex-col gap-6
        px-3 pt-4
        pb-[calc(110px+env(safe-area-inset-bottom))]
        font-sans
        sm:gap-8 sm:px-5 sm:pt-6
        lg:pb-12
      "
    >
      {/* Page heading */}
      <Card
        className="
          mx-auto w-full max-w-2xl
          gap-0 rounded-2xl
          border-0 bg-white
          py-0 shadow-sm
        "
      >
        <CardContent
          className="
            flex items-center
            justify-center gap-2
            px-4 py-4
            text-center
            sm:px-6
          "
        >
          <Sparkles className="h-5 w-5 shrink-0 text-amber-500" />

          <h1
            className="
              text-sm font-bold
              leading-relaxed
              text-gray-900
              sm:text-base
            "
          >
            สรุปผลการค้นหาหนังสือหมวดที่สนใจ
          </h1>
        </CardContent>
      </Card>

      {likedBooks.length === 0 ? (
        /* Empty state */
        <Card
          className="
            mx-auto mt-4 w-full
            max-w-md gap-4
            rounded-3xl border-0
            bg-white/90 py-7
            shadow-sm
            sm:py-9
          "
        >
          <CardContent
            className="
              flex flex-col items-center
              px-5 text-center
              sm:px-8
            "
          >
            <div
              className="
                mb-5 flex h-20 w-20
                items-center justify-center
                rounded-full bg-rose-50
              "
            >
              <BookOpen className="h-10 w-10 text-rose-300" />
            </div>

            <h2 className="text-base font-bold text-gray-800">
              ยังไม่มีหนังสือที่คุณกดถูกใจเลยค่ะ
            </h2>

            <p
              className="
                mt-2 text-xs
                leading-relaxed
                text-gray-500
                sm:text-sm
              "
            >
              ลองกลับไปปัดใหม่อีกครั้ง
              เพื่อค้นหาหนังสือเล่มโปรดของคุณนะคะ
            </p>

            <Button
              type="button"
              onClick={handleRestart}
              className="
                mt-6 h-10
                rounded-full
                bg-[#1877F2]
                px-6 text-xs
                font-bold text-white
                shadow-sm
                hover:bg-blue-600
                sm:text-sm
              "
            >
              <RefreshCcw className="h-4 w-4" />
              เริ่มค้นหาใหม่อีกครั้ง
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex w-full min-w-0 flex-col gap-8">
          {/* Result summary */}
          <div
            className="
              flex flex-wrap items-center
              justify-between gap-3
              rounded-2xl
              bg-white/70
              px-4 py-3
              sm:px-5
            "
          >
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />

              <span className="text-xs font-medium text-gray-700 sm:text-sm">
                หนังสือที่คุณถูกใจ
              </span>
            </div>

            <Badge
              variant="secondary"
              className="
                rounded-full
                bg-rose-100
                px-3 py-1
                text-xs font-bold
                text-rose-600
              "
            >
              {likedBooks.length} เล่ม
            </Badge>
          </div>

          {/* TOP 3 Books */}
          <section className="min-w-0 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>

              <h2
                className="
                  text-sm font-bold
                  text-gray-900
                  sm:text-base
                "
              >
                TOP 3 เล่ม ที่อาจจะตรงใจกับคุณ
              </h2>
            </div>

            <div
              className="
                grid min-w-0
                grid-cols-2 gap-3
                sm:grid-cols-3
                sm:gap-4
              "
            >
              {topBooks.map((book, index) => (
                <ResultBookCard
                  key={book.id ?? index}
                  book={book}
                  rank={index + 1}
                />
              ))}
            </div>
          </section>

          {/* Surprise Recommendation */}
          <section className="min-w-0 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />

              <h2
                className="
                  text-sm font-bold
                  text-gray-900
                  sm:text-base
                "
              >
                หมวดนอกสายตาที่คุณสนใจ
              </h2>
            </div>

            <Card
              className="
                w-full gap-0
                rounded-2xl border-0
                bg-white/75 py-0
                shadow-sm
                sm:rounded-3xl
              "
            >
              <CardContent className="p-4 sm:p-5">
                <div
                  className="
                    grid grid-cols-1
                    items-center gap-5
                    sm:grid-cols-[180px_minmax(0,1fr)]
                    sm:gap-6
                  "
                >
                  <div className="mx-auto w-full max-w-[180px] sm:mx-0">
                    <ResultBookCard book={surpriseBook} />
                  </div>

                  <div className="min-w-0 text-center sm:text-left">
                    <Badge
                      variant="secondary"
                      className="
                        rounded-full
                        bg-amber-100
                        text-[11px]
                        text-amber-800
                      "
                    >
                      <Sparkles className="h-3 w-3" />
                      Discover Something New
                    </Badge>

                    <h3
                      className="
                        mt-3 text-base
                        font-bold text-gray-900
                        sm:text-lg
                      "
                    >
                      ลองเปิดใจให้หนังสือแนวใหม่
                    </h3>

                    <p
                      className="
                        mt-2 text-xs
                        leading-relaxed
                        text-gray-500
                        sm:text-sm
                      "
                    >
                      บางครั้งหนังสือที่คุณอาจมองข้าม
                      อาจกลายเป็นเรื่องโปรดเล่มต่อไปก็ได้
                    </p>

                    <p
                      className="
                        mt-3 text-xs
                        font-medium text-gray-700
                      "
                    >
                      หนังสือแนะนำ: {surpriseBook.title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Restart */}
          <div className="flex justify-center pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleRestart}
              className="
                h-10 rounded-full
                border-gray-200
                bg-white px-6
                text-xs font-bold
                text-gray-800
                shadow-sm
                hover:bg-gray-50
                sm:text-sm
              "
            >
              <RefreshCcw className="h-4 w-4" />
              สไวป์ใหม่อีกครั้ง
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
