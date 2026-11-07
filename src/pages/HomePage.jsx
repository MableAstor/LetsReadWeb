import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { BookCard } from "../components/BookCard";

import UserAvatar from "../components/UserAvatar";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api/auth";

// ======================================================
// ตรวจสอบเดือนปัจจุบันตามเวลาไทย
// ใช้ตรวจจับเมื่อเปลี่ยนเดือนเพื่อโหลด Viral Books ใหม่
// ======================================================

function getBangkokMonthKey() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find(
    (part) => part.type === "year"
  )?.value;

  const month = parts.find(
    (part) => part.type === "month"
  )?.value;

  return `${year}-${month}`;
}

// ======================================================
// HOME PAGE
// ======================================================

export default function HomePage() {
  const [viralBooks, setViralBooks] = useState([]);

  const [viralLoading, setViralLoading] = useState(true);
  const [viralError, setViralError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);
  const [limit, setLimit] = useState(4);

  // ======================================================
  // ปรับจำนวนหนังสือตามขนาดหน้าจอ
  // ======================================================

  useEffect(() => {
    const updateLimit = () => {
      if (window.innerWidth >= 1536) {
        setLimit(7);
      } else if (window.innerWidth >= 768) {
        setLimit(6);
      } else {
        setLimit(4);
      }
    };

    updateLimit();

    window.addEventListener("resize", updateLimit);

    return () => {
      window.removeEventListener("resize", updateLimit);
    };
  }, []);

  // ======================================================
  // โหลด Viral Books รายเดือนจาก Backend
  // GET /api/auth/viral-books
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    async function loadViralBooks() {
      setViralLoading(true);
      setViralError("");

      try {
        const response = await fetch(
          `${API_URL}/viral-books`
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "โหลดหนังสือ Viral ไม่สำเร็จ"
          );
        }

        if (!cancelled) {
          const formattedBooks = (
            Array.isArray(result.books) ? result.books : []
          ).map((book) => ({
            id: book.BooksID,
            title: book.Books_title || "Untitled book",
            image: book.Books_Cover || "",
            author: "",
            tags: [
              `${Number(book.Review_Count) || 0} รีวิว`,
            ],
            reviewCount: Number(book.Review_Count) || 0,
            synopsis: book.Book_Synopsis || "",
          }));

          setViralBooks(formattedBooks);
        }
      } catch (error) {
        console.error("[Home] Load Viral Books error:", error);

        if (!cancelled) {
          setViralBooks([]);

          setViralError(
            error.message || "ไม่สามารถโหลดหนังสือ Viral ได้"
          );
        }
      } finally {
        if (!cancelled) {
          setViralLoading(false);
        }
      }
    }

    loadViralBooks();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // ======================================================
  // ตรวจจับการเปลี่ยนเดือนตามเวลาไทย
  // หากขึ้นเดือนใหม่ ให้โหลด Viral Books ใหม่อัตโนมัติ
  // ======================================================

  useEffect(() => {
    let lastMonthKey = getBangkokMonthKey();

    const timerId = window.setInterval(() => {
      const nextMonthKey = getBangkokMonthKey();

      if (nextMonthKey !== lastMonthKey) {
        lastMonthKey = nextMonthKey;

        setReloadKey((key) => key + 1);

        console.log(
          "[Home] New month detected. Reloading Viral Books..."
        );
      }
    }, 30_000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  return (
    <div className="mx-auto box-border w-full min-w-0 max-w-6xl px-3 py-6 pb-28 font-sans">
      <div className="w-full min-w-0">
        {/* Viral Books */}
        <section className="w-full min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex min-w-0 items-center gap-2 text-lg font-bold text-[#533C3E]">
              หนังสือ Viral มาแรง
              <span>🔥</span>
            </h2>

            <div className="flex items-center gap-3">
              {/* แสดงช่วงเวลารายเดือน */}
              <span className="rounded-lg bg-[#FAEFEB] px-3 py-1.5 text-xs font-semibold text-[#A36D70]">
                Monthly
              </span>

              <Link
                to="/viral-books"
                className="shrink-0 text-sm font-medium text-[#C65B61] hover:underline"
              >
                ดูทั้งหมด →
              </Link>
            </div>
          </div>

          {/* Loading / Error / Empty / Books */}
          {viralLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              กำลังโหลดหนังสือ...
            </div>
          ) : viralError ? (
            <div className="py-8 text-center text-sm text-red-500">
              {viralError}
            </div>
          ) : viralBooks.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              ยังไม่มีรีวิวหนังสือในเดือนนี้
            </div>
          ) : (
            <div className="grid w-full min-w-0 grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 2xl:grid-cols-7">
              {viralBooks.slice(0, limit).map((book) => (
                <div key={book.id} className="min-w-0">
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}