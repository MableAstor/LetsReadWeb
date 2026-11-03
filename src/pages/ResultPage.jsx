
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Heart,
  LoaderCircle,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

import ResultBookCard from "../components/result/ResultBookCard";
import LikedBooksDialog from "../components/result/LikedBooksDialog";
import ResultSection from "../components/result/ResultSection";

const API_BASE = (
  import.meta.env.VITE_RECOMMENDER_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const bookKey = (book) =>
  String(
    book?.id ??
      book?.BooksID ??
      book?.book_id ??
      book?.title ??
      book?.Books_Title ??
      ""
  );

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const routeState = location.state ?? {};

  const likedBooks = Array.isArray(routeState.likedBooks)
    ? routeState.likedBooks
    : [];

  const dislikedBooks = Array.isArray(routeState.dislikedBooks)
    ? routeState.dislikedBooks
    : [];

  const swipedBooks = Array.isArray(routeState.swipedBooks)
    ? routeState.swipedBooks
    : [];

  const recommendationPool = Array.isArray(routeState.recommendationPool)
    ? routeState.recommendationPool
    : [];

  const selectedCategories = Array.isArray(routeState.selectedCategories)
    ? routeState.selectedCategories
    : [];

  const selectedSubcategories = Array.isArray(routeState.selectedSubcategories)
    ? routeState.selectedSubcategories
    : [];

  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLikedBooks, setShowLikedBooks] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchRecommendations = async () => {
      setLoading(true);
      setError("");
      setResultData(null);

      if (likedBooks.length === 0) {
        setLoading(false);
        return;
      }

      if (recommendationPool.length === 0) {
        setError("ไม่พบรายการหนังสือสำหรับใช้แนะนำ");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/recommend`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            likes: likedBooks,
            dislikes: dislikedBooks,
            swiped: swipedBooks,
            pool: recommendationPool,
            selected_categories: selectedCategories,
            selected_subcategories: selectedSubcategories,
          }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          const detail = payload?.detail;

          throw new Error(
            typeof detail === "string"
              ? detail
              : `Recommendation API ตอบกลับ HTTP ${response.status}`
          );
        }

        if (active) {
          setResultData(payload);
        }
      } catch (err) {
        console.error("[Result] Recommendation error:", err);

        if (active) {
          setError(err.message || "ไม่สามารถโหลดผลการแนะนำหนังสือได้");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchRecommendations();

    return () => {
      active = false;
    };
  }, [
    likedBooks,
    dislikedBooks,
    swipedBooks,
    recommendationPool,
    selectedCategories,
    selectedSubcategories,
  ]);

  const handleRestart = () => {
    navigate("/swipe");
  };

  const recommendations = Array.isArray(resultData?.recommendations)
    ? resultData.recommendations
    : [];

  const discoveryBooks = Array.isArray(resultData?.discovery_books)
    ? resultData.discovery_books
    : Array.isArray(resultData?.discovery)
      ? resultData.discovery
      : [];

  // ใช้ TOP 3 จากผลลัพธ์ API ตามเดิม
  const topThree = recommendations.slice(0, 3);

  // ป้องกันหนังสือซ้ำระหว่าง TOP 3 กับ Discovery
  const topThreeKeys = new Set(topThree.map(bookKey));

  const additionalDiscoveryBooks = discoveryBooks.filter(
    (book) => !topThreeKeys.has(bookKey(book))
  );

  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden bg-[#faf7f2] px-3 pb-[calc(110px+env(safe-area-inset-bottom))] pt-5 font-sans sm:px-6 sm:pt-8 lg:pb-12">
      {/* Soft pastel background */}
      <div className="pointer-events-none absolute -left-28 -top-24 h-72 w-72 rounded-full bg-[#f4dfdc]/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-1/3 h-80 w-80 rounded-full bg-[#eee5d7]/60 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-7 sm:gap-9">
          
{/* Hero + Liked Books */}
<Card className="overflow-hidden rounded-3xl border border-[#eee5dc] bg-[#fffdf9] py-0 shadow-sm">
  <CardContent className="p-5 sm:p-7">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b69a8e] sm:text-xs">
          Your Reading Discovery
        </p>

        <h1 className="mt-2 text-xl font-bold tracking-tight text-[#403b37] sm:text-2xl">
          ผลการค้นหาหนังสือของคุณ
        </h1>

        <p className="mt-2 text-xs leading-relaxed text-[#9a8d82] sm:text-sm">
          หนังสือที่คัดสรรจากความสนใจและการเลือกของคุณ
        </p>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-4 rounded-2xl bg-[#f7eee9] p-3 sm:min-w-[210px] sm:flex-col sm:items-stretch sm:p-4">
        <div>
          <p className="text-xs text-[#9a8d82]">
            หนังสือที่คุณกดถูกใจ
          </p>

          <p className="mt-1 text-2xl font-bold text-[#a87970]">
            {likedBooks.length}
            <span className="ml-1 text-xs font-medium">เล่ม</span>
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setShowLikedBooks(true)}
          disabled={likedBooks.length === 0}
          className="h-9 rounded-full bg-[#a87970] px-4 text-xs font-semibold text-white hover:bg-[#946c64] disabled:opacity-50"
        >
          <Heart className="mr-1 h-3.5 w-3.5" />
          ดูรายการ
        </Button>
      </div>
    </div>
  </CardContent>
</Card>


        {/* Loading */}
        {loading && (
          <Card className="mx-auto w-full max-w-md rounded-3xl border-[#eee5dc] bg-white/90 shadow-sm">
            <CardContent className="flex flex-col items-center px-5 py-12 text-center">
              <LoaderCircle className="h-9 w-9 animate-spin text-[#bd9188]" />

              <h2 className="mt-4 text-sm font-semibold text-[#403b37]">
                กำลังค้นหาหนังสือที่เหมาะกับคุณ
              </h2>

              <p className="mt-2 text-xs text-[#a29589]">
                รอสักครู่นะคะ
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {!loading && error && (
          <Card className="mx-auto w-full max-w-md rounded-3xl border-[#ead9d5] bg-white shadow-sm">
            <CardContent className="flex flex-col items-center px-5 py-9 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f7e9e7]">
                <BookOpen className="h-7 w-7 text-[#bd8580]" />
              </div>

              <h2 className="mt-4 text-base font-bold text-[#403b37]">
                ไม่สามารถแสดงผลการแนะนำได้
              </h2>

              <p className="mt-2 break-words text-xs leading-relaxed text-[#a29589]">
                {error}
              </p>

              <Button
                type="button"
                onClick={handleRestart}
                className="mt-6 rounded-full bg-[#a87970] px-6 text-white hover:bg-[#946c64]"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                เริ่มค้นหาใหม่
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty liked books */}
        {!loading && !error && likedBooks.length === 0 && (
          <Card className="mx-auto w-full max-w-md rounded-3xl border-[#eee5dc] bg-white shadow-sm">
            <CardContent className="flex flex-col items-center px-5 py-10 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f7e9e7]">
                <Heart className="h-9 w-9 text-[#c98785]" />
              </div>

              <h2 className="mt-5 text-base font-bold text-[#403b37]">
                ยังไม่มีหนังสือที่ถูกใจ
              </h2>

              <p className="mt-2 text-xs leading-relaxed text-[#a29589] sm:text-sm">
                ลองกลับไปค้นหาและเลือกหนังสือที่สนใจอีกครั้งนะคะ
              </p>

              <Button
                type="button"
                onClick={handleRestart}
                className="mt-6 rounded-full bg-[#a87970] px-6 text-white hover:bg-[#946c64]"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                เริ่มค้นหาใหม่
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!loading && !error && likedBooks.length > 0 && (
          <>
            {/* TOP 3 first */}
            <ResultSection
              icon="🏆"
              title="TOP 3 เล่มที่อาจจะตรงใจกับคุณ"
              description="หนังสือที่ระบบแนะนำจากความสนใจของคุณ"
            >
              {topThree.length > 0 ? (
                <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
                  {topThree.map((book, index) => (
                    <ResultBookCard
                      key={bookKey(book) || index}
                      book={book}
                      rank={index + 1}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#e8ddd3] bg-white/70 px-4 py-8 text-center">
                  <p className="text-sm text-[#a29589]">
                    ยังไม่มีหนังสือในรายการ TOP 3
                  </p>
                </div>
              )}
            </ResultSection>

            {/* Discovery */}
            <ResultSection
              icon={<Sparkles className="h-5 w-5 text-[#b18c64]" />}
              title="Discovery — ลองค้นพบแนวใหม่"
              description="หนังสือเพิ่มเติมที่ระบบนำเสนอให้คุณได้ลองเปิดใจ"
            >
              {additionalDiscoveryBooks.length > 0 ? (
                <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
                  {additionalDiscoveryBooks.map((book, index) => (
                    <ResultBookCard
                      key={bookKey(book) || index}
                      book={book}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#e8ddd3] bg-white/70 px-4 py-8 text-center">
                  <p className="text-sm text-[#a29589]">
                    ยังไม่มีหนังสือ Discovery เพิ่มเติม
                  </p>
                </div>
              )}
            </ResultSection>

            {/* Restart */}
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleRestart}
                className="h-11 rounded-full border-[#e6d9cf] bg-white px-6 text-xs font-semibold text-[#74675e] shadow-sm hover:bg-[#f7eee9] sm:text-sm"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                เริ่มค้นหาหนังสือใหม่
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Liked books modal */}
      <LikedBooksDialog
        open={showLikedBooks}
        onClose={() => setShowLikedBooks(false)}
        books={likedBooks}
      />
    </main>
  );
}
