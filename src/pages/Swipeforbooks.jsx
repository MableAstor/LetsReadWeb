
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { getNextBook } from "../services/recommendationService";

import {
  ArrowLeft,
  BookOpen,
  Clock3,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";

import {
  createSession,
  closeSession,
} from "../services/sessionService";

import { saveSwipeHistory } from "../services/swipeService";

import SwipeBookCard from "../components/swipe/SwipeBookCard";
import LikedBooksPanel from "../components/swipe/LikedBooksPanel";
import StopDialog from "../components/swipe/StopDialog";
import PauseDialog from "../components/swipe/PauseDialog";

import usePauseTimer from "../hooks/usePauseTimer";

// รองรับชื่อ field ที่อาจมาจาก API หลายรูปแบบ
const getBookCategory = (book) =>
  book?.category ??
  book?.main_category ??
  book?.Main_Category ??
  book?.CATEGORY ??
  "";

const getBookSubcategories = (book) => {
  const raw =
    book?.subCategory ??
    book?.subcategory ??
    book?.sub_category ??
    book?.Sub_Category ??
    book?.SUBCATEGORY ??
    "";

  if (Array.isArray(raw)) {
    return [...new Set(raw.map((item) => String(item).trim()).filter(Boolean))];
  }

  return [
    ...new Set(
      String(raw)
        .split(/[•,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
};
const getBookId = (book) =>
  book?.BooksID ??
  book?.books_id ??
  book?.book_id ??
  book?.id ??
  null;

export default function Swipeforbooks() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, profileLoading } = useAuth();

  // Session
  const [sessionId, setSessionId] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const sessionIdRef = useRef(null);
  const sessionPromiseRef = useRef(null);

  // Swipe gesture
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const pointerIdRef = useRef(null);
  const draggingRef = useRef(false);

  // Pause timer
  const {
    isPaused,
    showPauseModal,
    pauseExpired,
    pauseRemaining,
    formatPauseTime,
    startPause: startPauseTimer,
    resumeSwipe,
    openPauseModal,
    handlePauseOpenChange,
  } = usePauseTimer();

  // Recommendation data
  const routeState = location.state ?? {};

  const recommendationPool = Array.isArray(routeState.recommendationPool)
    ? routeState.recommendationPool
    : Array.isArray(routeState.bookList)
      ? routeState.bookList
      : [];

  const selectedCategories = Array.isArray(routeState.selectedCategories)
    ? routeState.selectedCategories
    : [];

  const selectedSubcategories = Array.isArray(routeState.selectedSubcategories)
    ? routeState.selectedSubcategories
    : [];

  const initialBook =
    routeState.initialBook ?? routeState.bookList?.[0] ?? null;

  const [currentBook, setCurrentBook] = useState(initialBook);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [likedBooks, setLikedBooks] = useState([]);
  const [dislikedBooks, setDislikedBooks] = useState([]);
  const [swipedBooks, setSwipedBooks] = useState([]);

  // Dialogs and recommendation status
  const [showStopModal, setShowStopModal] = useState(false);
  const [isSelectingNext, setIsSelectingNext] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");

  // สร้าง Session
  const ensureSession = async () => {
    if (!userId) {
      throw new Error("ไม่พบ UserID กรุณาเข้าสู่ระบบใหม่");
    }

    if (sessionIdRef.current) {
      return sessionIdRef.current;
    }

    if (sessionPromiseRef.current) {
      return sessionPromiseRef.current;
    }

    sessionPromiseRef.current = (async () => {
      const newSessionId = await createSession();

      sessionIdRef.current = newSessionId;
      setSessionId(newSessionId);

      return newSessionId;
    })();

    try {
      return await sessionPromiseRef.current;
    } catch (error) {
      sessionPromiseRef.current = null;
      throw error;
    }
  };

  // ปิด Session
  const closeCurrentSession = async () => {
    const activeSessionId = sessionIdRef.current;

    if (!activeSessionId || !userId) return;

    await closeSession(activeSessionId);

    console.log("[Session] Closed:", activeSessionId);
  };

  useEffect(() => {
    if (profileLoading) return;

    if (!userId) {
      setSessionLoading(false);
      return;
    }

    let cancelled = false;

    const startSession = async () => {
      try {
        setSessionLoading(true);
        await ensureSession();
      } catch (error) {
        console.error("[Session] Create failed:", error);
        toast.error(`สร้าง Session ไม่สำเร็จ: ${error.message}`);
      } finally {
        if (!cancelled) {
          setSessionLoading(false);
        }
      }
    };

    startSession();

    return () => {
      cancelled = true;
    };
  }, [userId, profileLoading]);

  // ไปหน้า Result
  const goToResult = async (
    finalLikes,
    finalDislikes = dislikedBooks,
    finalSwiped = swipedBooks,
  ) => {
    try {
      await closeCurrentSession();
    } catch (error) {
      console.error("[Session] Close failed:", error);
      toast.error("ปิด Session ไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ");
    }

    navigate("/Result", {
      state: {
        likedBooks: finalLikes,
        dislikedBooks: finalDislikes,
        swipedBooks: finalSwiped,
        recommendationPool,
        selectedCategories,
        selectedSubcategories,
        sessionId: sessionIdRef.current,
      },
    });
  };

  // Reset การลากการ์ด
  const resetDrag = () => {
    setDragX(0);
    dragOffsetRef.current = 0;
    pointerIdRef.current = null;
    draggingRef.current = false;
    setIsDragging(false);
  };

  // เริ่มพักการปัด
  const startPause = () => {
    resetDrag();
    setShowStopModal(false);
    startPauseTimer();
  };

  // วิเคราะห์ผลจากหน้าต่างพัก
  const analyzeFromPause = () => {
    goToResult(likedBooks, dislikedBooks, swipedBooks);
  };

  // เลือกหนังสือถัดไปจาก Python Recommendation
  const advanceAfterSwipe = async (action) => {
    if (!currentBook || isSelectingNext || isPaused) return;

    const updatedLikes =
      action === "like" ? [...likedBooks, currentBook] : likedBooks;

    const updatedDislikes =
      action === "dislike" ? [...dislikedBooks, currentBook] : dislikedBooks;

    const updatedSwiped = [...swipedBooks, currentBook];

    const apiBase = (
      import.meta.env.VITE_RECOMMENDER_API_URL || "http://127.0.0.1:8000"
    ).replace(/\/+$/, "");

    setIsSelectingNext(true);
    setRecommendationError("");

    try {
      const activeSessionId = await ensureSession();

      console.log("[DEBUG] Session ready:", activeSessionId);
      console.log("[DEBUG] Current book:", currentBook);
      console.log("[DEBUG] User ID:", userId);
      console.log("[DEBUG] Calling Python API:", `${apiBase}/next-book`);
      console.log("[FEEDBACK TEST]", {
  action,
  likes: updatedLikes.map((book) => ({
    title: book.title,
    subcategories: book.subcategories,
  })),
  dislikes: updatedDislikes.map((book) => ({
    title: book.title,
    subcategories: book.subcategories,
  })),
});

      const payload = await getNextBook({
        apiBase,
        likes: updatedLikes,
        dislikes: updatedDislikes,
        swiped: updatedSwiped,
        pool: recommendationPool,
        selectedCategories,
        selectedSubcategories,
      });

      console.log("[DEBUG] Python response:", payload);

      const bookId = getBookId(currentBook);

if (
  bookId === null ||
  bookId === undefined ||
  !Number.isSafeInteger(Number(bookId)) ||
  Number(bookId) <= 0
) {
  throw new Error(
    `ไม่พบ BooksID ที่ถูกต้อง: ${JSON.stringify(currentBook)}`
  );
}

await saveSwipeHistory({
  action,
  bookId: Number(bookId),
  sessionId: activeSessionId,
});

console.log("[DEBUG] Swipe history saved successfully");

      setLikedBooks(updatedLikes);
      setDislikedBooks(updatedDislikes);
      setSwipedBooks(updatedSwiped);

      if (!payload?.book) {
        resetDrag();
        await goToResult(updatedLikes, updatedDislikes, updatedSwiped);
        return;
      }

      setCurrentBook(payload.book);
      setCurrentIndex((previous) => previous + 1);

      resetDrag();
    } catch (error) {
      console.error("Failed to choose next book:", error);

      resetDrag();

      setRecommendationError(
        `${error?.message || "เรียก Python เพื่อเลือกหนังสือถัดไปไม่สำเร็จ"} กรุณาตรวจว่า recommendation-service ใช้โค้ดเวอร์ชันใหม่และยังรันอยู่`,
      );

      toast.error(error?.message || "ดำเนินการ Swipe ไม่สำเร็จ");
    } finally {
      setIsSelectingNext(false);
    }

    
  };

  const handleLike = () => advanceAfterSwipe("like");
  const handleDislike = () => advanceAfterSwipe("dislike");

  // เริ่มลากการ์ด
  const handlePointerDown = (event) => {
    if (
      isSelectingNext ||
      isPaused ||
      showStopModal ||
      showPauseModal ||
      !currentBook
    ) {
      return;
    }

    if (!event.isPrimary || event.button !== 0) return;

    if (
      event.target instanceof Element &&
      event.target.closest("button, a, input")
    ) {
      return;
    }

    pointerIdRef.current = event.pointerId;
    dragStartRef.current = event.clientX;
    dragOffsetRef.current = 0;
    draggingRef.current = true;

    setIsDragging(true);

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  // ขยับการ์ดตามนิ้วหรือเมาส์
  const handlePointerMove = (event) => {
    if (
      isPaused ||
      !draggingRef.current ||
      pointerIdRef.current !== event.pointerId
    ) {
      return;
    }

    const offset = event.clientX - dragStartRef.current;

    dragOffsetRef.current = offset;
    setDragX(offset);
  };

  // ปล่อยการ์ด
  const handlePointerUp = (event) => {
    if (
      isPaused ||
      pointerIdRef.current !== event.pointerId
    ) {
      return;
    }

    const offset = dragOffsetRef.current;

    draggingRef.current = false;
    pointerIdRef.current = null;
    setIsDragging(false);

    if (Math.abs(offset) >= 110) {
      const action = offset > 0 ? "like" : "dislike";

      setDragX(offset > 0 ? 600 : -600);

      advanceAfterSwipe(action);
    } else {
      setDragX(0);
      dragOffsetRef.current = 0;
    }
  };

  const handlePointerCancel = () => {
    resetDrag();
  };

  // ข้อมูลหนังสือปัจจุบัน
  const category = getBookCategory(currentBook);
  const subcategories = getBookSubcategories(currentBook);

  // กรณีไม่มีหนังสือให้แสดง
  if (recommendationPool.length === 0 || !currentBook) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gradient-to-tr from-[#ffe8df] via-[#fcd8cd] to-[#fdedcd] px-6 text-center font-sans">
        <BookOpen className="h-12 w-12 text-rose-400" />

        <h2 className="text-lg font-bold text-gray-800">
          ยังไม่มีหนังสือให้ปัด
        </h2>

        <p className="max-w-sm text-sm leading-relaxed text-gray-600">
          กรุณากลับไปเลือกหมวดหมู่หนังสืออีกครั้ง หากยังไม่พบหนังสือ
          โปรดตรวจสอบการโหลดข้อมูลจาก Supabase
        </p>

        <Button
          type="button"
          onClick={async () => {
            setShowStopModal(false);

            try {
              await closeCurrentSession();
            } catch (error) {
              console.error("[Session] Close failed:", error);
              toast.error("ปิด Session ไม่สำเร็จ");
              return;
            }

            navigate("/category");
          }}
          className="rounded-full bg-[#1D77FF] text-white hover:bg-blue-600"
        >
          กลับไปเลือกหมวดหมู่
        </Button>
      </div>
    );
  }

  return (
    <div
      className="
        relative isolate min-h-dvh w-full overflow-x-hidden
        bg-gradient-to-tr from-[#ffe8df] via-[#fcd8cd] to-[#fdedcd]
        px-3 pt-4 pb-[calc(100px+env(safe-area-inset-bottom))]
        font-sans sm:px-6 sm:py-6 lg:pb-8
      "
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute -top-20 -left-20 -z-10 h-80 w-80 rounded-full bg-pink-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-20 -z-10 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 -z-10 h-80 w-80 rounded-full bg-rose-200/30 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        {/* Header */}
        <header className="flex w-full flex-wrap items-center justify-between gap-2 pb-4 sm:gap-3 sm:pb-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-9 rounded-full border-white/70 bg-white/80 px-3 text-xs text-gray-700 shadow-xs hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            ย้อนกลับ
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (isPaused) {
                openPauseModal();
              } else {
                setShowStopModal(true);
              }
            }}
            disabled={isSelectingNext}
            className="h-9 rounded-full border-rose-100 bg-white px-3 text-xs text-gray-800 shadow-xs hover:bg-rose-50 sm:px-4"
          >
            <Clock3 className="h-4 w-4" />
            {isPaused ? "ดูเวลาพัก" : "หยุดพักหรือประมวลผล"}
          </Button>

          <Badge
            variant="secondary"
            className="hidden items-center gap-1.5 rounded-full bg-white/80 px-3 py-2 text-xs font-bold text-gray-800 shadow-xs sm:inline-flex"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            ค้นหาหนังสือที่ใช่
          </Badge>
        </header>

        {/* Main Layout */}
        <main className="grid w-full min-w-0 grid-cols-1 items-start justify-items-center gap-6 lg:grid-cols-2 lg:gap-8">
          {/* LEFT: Swipe Book */}
          <section className="flex w-full min-w-0 flex-col items-center gap-3">
            <SwipeBookCard
              currentBook={currentBook}
              category={category}
              subcategories={subcategories}
              likedCount={likedBooks.length}
              dragX={dragX}
              isDragging={isDragging}
              isSelectingNext={isSelectingNext}
              isPaused={isPaused}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onLike={handleLike}
              onDislike={handleDislike}
            />

            {/* Swipe Tip */}
            <div className="w-full max-w-[340px] space-y-2 text-center">
              <p className="rounded-full bg-white/60 px-3 py-2 text-[11px] text-gray-600">
                ปัดขวาเพื่อถูกใจ · ปัดซ้ายเพื่อข้าม
              </p>

              <p className="text-[10px] leading-relaxed text-gray-500">
                {isSelectingNext ? (
                  <span className="inline-flex items-center gap-2">
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    Python กำลังคำนวณจากการปัดล่าสุด...
                  </span>
                ) : (
                  "Python จะปรับการแนะนำหนังสือจากการเลือกของคุณ"
                )}
              </p>
            </div>

            {recommendationError && (
              <div
                role="alert"
                className="w-full max-w-[340px] rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-700"
              >
                {recommendationError}
              </div>
            )}
          </section>

          {/* RIGHT: Liked Books */}
          <LikedBooksPanel
            likedBooks={likedBooks}
            swipedBooks={swipedBooks}
          />
        </main>

        {/* Footer */}
        <footer className="mt-6 text-center text-[11px] font-medium text-gray-500">
          Let's Read — Find your next favorite story
        </footer>
      </div>

      {/* Stop / Analyze Dialog */}
      <StopDialog
        open={showStopModal}
        onOpenChange={setShowStopModal}
        onPause={startPause}
        onAnalyze={() => {
          setShowStopModal(false);
          goToResult(likedBooks, dislikedBooks, swipedBooks);
        }}
        isSelectingNext={isSelectingNext}
        likedCount={likedBooks.length}
      />

      {/* Pause Timer Dialog */}
      <PauseDialog
        open={showPauseModal}
        onOpenChange={handlePauseOpenChange}
        pauseRemaining={pauseRemaining}
        pauseExpired={pauseExpired}
        formatPauseTime={formatPauseTime}
        onResume={resumeSwipe}
        onAnalyze={analyzeFromPause}
        isSelectingNext={isSelectingNext}
      />
    </div>
  );
}
