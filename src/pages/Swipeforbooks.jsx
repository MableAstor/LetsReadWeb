
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

import {
  saveSwipeHistory,
  rebuildPreferences,
} from "../services/swipeService";

import SwipeBookCard from "../components/swipe/SwipeBookCard";
import LikedBooksPanel from "../components/swipe/LikedBooksPanel";
import StopDialog from "../components/swipe/StopDialog";
import PauseDialog from "../components/swipe/PauseDialog";

import usePauseTimer from "../hooks/usePauseTimer";

// รองรับชื่อ field จาก API หลายรูปแบบ
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
    return [
      ...new Set(
        raw.map((item) => String(item).trim()).filter(Boolean)
      ),
    ];
  }

  return [
    ...new Set(
      String(raw)
        .split(/[•,]/)
        .map((item) => item.trim())
        .filter(Boolean)
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

  // ป้องกันการสร้าง Session ซ้ำ
  const [sessionLoading, setSessionLoading] = useState(true);
  const sessionIdRef = useRef(null);
  const sessionPromiseRef = useRef(null);
  const closingRef = useRef(null);

  // ป้องกันการส่ง Swipe ซ้ำ
  const busyRef = useRef(false);
  const pendingSwipeRef = useRef(null);

  // Drag state
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

  // ข้อมูลจากหน้าเลือกหมวดหมู่
  const routeState = location.state ?? {};

  const recommendationPool = Array.isArray(
    routeState.recommendationPool
  )
    ? routeState.recommendationPool
    : Array.isArray(routeState.bookList)
      ? routeState.bookList
      : [];

  const selectedCategories = Array.isArray(
    routeState.selectedCategories
  )
    ? routeState.selectedCategories
    : [];

  const selectedSubcategories = Array.isArray(
    routeState.selectedSubcategories
  )
    ? routeState.selectedSubcategories
    : [];

  const initialBook =
    routeState.initialBook ??
    routeState.bookList?.[0] ??
    null;

  const [currentBook, setCurrentBook] = useState(initialBook);

  const [likedBooks, setLikedBooks] = useState([]);
  const [dislikedBooks, setDislikedBooks] = useState([]);
  const [swipedBooks, setSwipedBooks] = useState([]);

  const [showStopModal, setShowStopModal] = useState(false);
  const [isSelectingNext, setIsSelectingNext] = useState(false);
  const [recommendationError, setRecommendationError] =
    useState("");

  // สร้าง Session หนึ่งครั้งต่อการเข้าใช้งานหน้านี้
  const ensureSession = async () => {
    if (!userId) {
      throw new Error(
        "กรุณาเข้าสู่ระบบก่อนเริ่มปัดหนังสือ"
      );
    }

    if (sessionIdRef.current) {
      return sessionIdRef.current;
    }

    if (sessionPromiseRef.current) {
      return sessionPromiseRef.current;
    }

    sessionPromiseRef.current = createSession()
      .then((newSessionId) => {
        sessionIdRef.current = newSessionId;
        return newSessionId;
      })
      .catch((error) => {
        sessionPromiseRef.current = null;
        throw error;
      });

    return sessionPromiseRef.current;
  };

  // ปิด Session
  const closeCurrentSession = async () => {
    if (
      !sessionIdRef.current &&
      sessionPromiseRef.current
    ) {
      await sessionPromiseRef.current;
    }

    if (!sessionIdRef.current) return;

    if (!closingRef.current) {
      closingRef.current = closeSession(
        sessionIdRef.current
      ).finally(() => {
        closingRef.current = null;
      });
    }

    return closingRef.current;
  };

  // เปิด Session เมื่อเข้าหน้า Swipe
  useEffect(() => {
    if (profileLoading) return;

    if (!userId) {
      setSessionLoading(false);
      return;
    }

    let active = true;

    setSessionLoading(true);

    ensureSession()
      .catch((error) => {
        if (active) {
          toast.error(
            `สร้าง Session ไม่สำเร็จ: ${error.message}`
          );
        }
      })
      .finally(() => {
        if (active) {
          setSessionLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [userId, profileLoading]);

  // ไปหน้า Result
  const goToResult = async (
    finalLikes,
    finalDislikes = dislikedBooks,
    finalSwiped = swipedBooks
  ) => {
    if (
      pendingSwipeRef.current &&
      !pendingSwipeRef.current.committed
    ) {
      setRecommendationError(
        "มีรายการ Swipe ที่ยังไม่ยืนยัน กรุณากดลองอีกครั้งก่อนดูผล"
      );
      return false;
    }

    try {
      await closeCurrentSession();
    } catch (error) {
      setRecommendationError(
        `ปิด Session ไม่สำเร็จ: ${error.message}`
      );
      toast.error(
        "ปิด Session ไม่สำเร็จ กรุณาลองอีกครั้ง"
      );
      return false;
    }

    navigate("/Result", {
      replace: true,
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

    return true;
  };

  // คืนค่าตำแหน่งการ์ด
  const resetDrag = () => {
    setDragX(0);
    dragOffsetRef.current = 0;
    pointerIdRef.current = null;
    draggingRef.current = false;
    setIsDragging(false);
  };

  const startPause = () => {
    resetDrag();
    setShowStopModal(false);
    startPauseTimer();
  };

  const analyzeFromPause = () => {
    goToResult(likedBooks, dislikedBooks, swipedBooks);
  };

  // ฟังก์ชันหลัก: บันทึก Swipe -> Preference -> Python
  const advanceAfterSwipe = async (action) => {
    if (
      busyRef.current ||
      !currentBook ||
      isPaused ||
      profileLoading ||
      sessionLoading ||
      !userId
    ) {
      resetDrag();
      return;
    }

    const bookId = getBookId(currentBook);

    if (
      !Number.isSafeInteger(Number(bookId)) ||
      Number(bookId) <= 0
    ) {
      setRecommendationError(
        "ข้อมูลหนังสือไม่มี BooksID ที่ถูกต้อง"
      );
      return;
    }

    busyRef.current = true;
    setIsSelectingNext(true);
    setRecommendationError("");

    try {
      let pending = pendingSwipeRef.current;

      if (
        pending &&
        (
          String(pending.bookId) !== String(bookId) ||
          pending.action !== action
        )
      ) {
        throw new Error(
          `Swipe ก่อนหน้านี้ยังไม่เสร็จ กรุณาลองทำรายการ ${pending.action} อีกครั้ง`
        );
      }

      // สร้าง requestId ครั้งเดียวต่อ Swipe
      if (!pending) {
        if (!globalThis.crypto?.randomUUID) {
          throw new Error(
            "Browser นี้ไม่รองรับการสร้าง requestId แบบปลอดภัย"
          );
        }

        pending = {
          action,
          bookId: Number(bookId),
          requestId: globalThis.crypto.randomUUID(),
          committed: false,
          preferences: null,

          updatedLikes:
            action === "like"
              ? [...likedBooks, currentBook]
              : likedBooks,

          updatedDislikes:
            action === "dislike"
              ? [...dislikedBooks, currentBook]
              : dislikedBooks,

          updatedSwiped: [
            ...swipedBooks,
            currentBook,
          ],
        };

        pendingSwipeRef.current = pending;
      }

      // STEP 1: บันทึก Swipe ก่อน
      if (!pending.committed) {
        const activeSessionId = await ensureSession();

        const result = await saveSwipeHistory({
          action: pending.action,
          bookId: pending.bookId,
          sessionId: activeSessionId,
          requestId: pending.requestId,
        });

        // เมื่อ Backend ยืนยันแล้ว ห้าม Insert ซ้ำ
        pending.committed = true;

        setLikedBooks(pending.updatedLikes);
        setDislikedBooks(pending.updatedDislikes);
        setSwipedBooks(pending.updatedSwiped);

        if (
          result.preferencesUpdated === true &&
          Array.isArray(result.preferences)
        ) {
          pending.preferences = result.preferences;
        }
      }

      // STEP 2: โหลด Preference หากยังไม่มี
      if (!Array.isArray(pending.preferences)) {
        pending.preferences = await rebuildPreferences();
      }

      // STEP 3: เรียก Python ด้วย preferences ล่าสุด
      const payload = await getNextBook({
        preferences: pending.preferences,
        swiped: pending.updatedSwiped,
        pool: recommendationPool,
        selectedCategories,
        selectedSubcategories,
      });

      // STEP 4: หนังสือหมดแล้ว ไปหน้า Result
      if (!payload.book) {
        const finished = await goToResult(
          pending.updatedLikes,
          pending.updatedDislikes,
          pending.updatedSwiped
        );

        if (finished) {
          pendingSwipeRef.current = null;
        }

        return;
      }

      // ป้องกัน Python ส่งหนังสือเล่มเก่ากลับมา
      if (
        pending.updatedSwiped.some(
          (item) =>
            String(getBookId(item)) ===
            String(getBookId(payload.book))
        )
      ) {
        throw new Error(
          "Recommendation API เลือกหนังสือที่ปัดไปแล้ว"
        );
      }

      // STEP 5: แสดงหนังสือถัดไป
      setCurrentBook(payload.book);
      pendingSwipeRef.current = null;

    } catch (error) {
      console.error("[SWIPE]", error);

      const pending = pendingSwipeRef.current;

      setRecommendationError(
        pending?.committed
          ? `บันทึก Swipe แล้ว แต่ยังเลือกหนังสือถัดไปไม่ได้: ${error.message} (กดลองต่อโดยไม่บันทึกซ้ำ)`
          : error.message ||
            "Swipe ไม่สำเร็จ กดลองใหม่"
      );

      toast.error(
        pending?.committed
          ? "บันทึก Swipe แล้ว กรุณากดลองต่อ"
          : error.message || "Swipe ไม่สำเร็จ"
      );
    } finally {
      resetDrag();
      busyRef.current = false;
      setIsSelectingNext(false);
    }
  };

  const handleLike = () => advanceAfterSwipe("like");
  const handleDislike = () => advanceAfterSwipe("dislike");

  // เริ่มลากการ์ด
  const handlePointerDown = (event) => {
    if (
      isSelectingNext ||
      sessionLoading ||
      profileLoading ||
      !userId ||
      isPaused ||
      showStopModal ||
      showPauseModal ||
      !currentBook ||
      pendingSwipeRef.current != null
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

  const handlePointerMove = (event) => {
    if (
      isPaused ||
      !draggingRef.current ||
      pointerIdRef.current !== event.pointerId
    ) {
      return;
    }

    const offset =
      event.clientX - dragStartRef.current;

    dragOffsetRef.current = offset;
    setDragX(offset);
  };

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
      const action =
        offset > 0 ? "like" : "dislike";

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

  const category = getBookCategory(currentBook);
  const subcategories = getBookSubcategories(currentBook);

  // กรณีไม่มีหนังสือ
  if (
    recommendationPool.length === 0 ||
    !currentBook
  ) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gradient-to-tr from-[#ffe8df] via-[#fcd8cd] to-[#fdedcd] px-6 text-center font-sans">
        <BookOpen className="h-12 w-12 text-rose-400" />

        <h2 className="text-lg font-bold text-gray-800">
          ยังไม่มีหนังสือให้ปัด
        </h2>

        <p className="max-w-sm text-sm leading-relaxed text-gray-600">
          กรุณากลับไปเลือกหมวดหมู่หนังสืออีกครั้ง
          หากยังไม่พบหนังสือ โปรดตรวจสอบการโหลดข้อมูลจาก Supabase
        </p>

        <Button
          type="button"
          onClick={async () => {
            setShowStopModal(false);

            try {
              await closeCurrentSession();
            } catch (error) {
              console.error(
                "[Session] Close failed:",
                error
              );
              toast.error(
                "ปิด Session ไม่สำเร็จ"
              );
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
        <header className="flex w-full flex-wrap items-center justify-between gap-2 pb-4 sm:gap-3 sm:pb-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
              if (busyRef.current) return;

              if (
                pendingSwipeRef.current &&
                !pendingSwipeRef.current.committed
              ) {
                setRecommendationError(
                  "กรุณายืนยัน Swipe ที่ค้างอยู่ก่อนย้อนกลับ"
                );
                return;
              }

              try {
                await closeCurrentSession();
                navigate("/category", {
                  replace: true,
                });
              } catch (error) {
                toast.error(
                  `ปิด Session ไม่สำเร็จ: ${error.message}`
                );
              }
            }}
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
            {isPaused
              ? "ดูเวลาพัก"
              : "หยุดพักหรือประมวลผล"}
          </Button>

          <Badge
            variant="secondary"
            className="hidden items-center gap-1.5 rounded-full bg-white/80 px-3 py-2 text-xs font-bold text-gray-800 shadow-xs sm:inline-flex"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            ค้นหาหนังสือที่ใช่
          </Badge>
        </header>

        <main className="grid w-full min-w-0 grid-cols-1 items-start justify-items-center gap-6 lg:grid-cols-2 lg:gap-8">
          <section className="flex w-full min-w-0 flex-col items-center gap-3">
            <SwipeBookCard
              currentBook={currentBook}
              category={category}
              subcategories={subcategories}
              likedCount={likedBooks.length}
              dragX={dragX}
              isDragging={isDragging}
              isSelectingNext={
                isSelectingNext ||
                sessionLoading ||
                !userId ||
                pendingSwipeRef.current != null
              }
              isPaused={isPaused}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onLike={handleLike}
              onDislike={handleDislike}
            />

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
                <p>{recommendationError}</p>

                {pendingSwipeRef.current && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isSelectingNext}
                    onClick={() =>
                      advanceAfterSwipe(
                        pendingSwipeRef.current.action
                      )
                    }
                    className="mt-2 rounded-full border-rose-300 bg-white text-rose-800"
                  >
                    ลองดำเนินการต่อ (ไม่บันทึกซ้ำ)
                  </Button>
                )}
              </div>
            )}
          </section>

          <LikedBooksPanel
            likedBooks={likedBooks}
            swipedBooks={swipedBooks}
          />
        </main>

        <footer className="mt-6 text-center text-[11px] font-medium text-gray-500">
          Let's Read — Find your next favorite story
        </footer>
      </div>

      <StopDialog
        open={showStopModal}
        onOpenChange={setShowStopModal}
        onPause={startPause}
        onAnalyze={() => {
          setShowStopModal(false);
          goToResult(
            likedBooks,
            dislikedBooks,
            swipedBooks
          );
        }}
        isSelectingNext={isSelectingNext}
        likedCount={likedBooks.length}
      />

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
