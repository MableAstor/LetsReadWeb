import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { BookCard } from "../components/BookCard";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api/auth";

// ======================================================
// ตรวจสอบรอบ Viral ตามเวลาไทย
// ======================================================
function getBangkokPeriodKey(period) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = Number(
    parts.find((part) => part.type === "year")?.value
  );

  const month = Number(
    parts.find((part) => part.type === "month")?.value
  );

  const day = Number(
    parts.find((part) => part.type === "day")?.value
  );

  if (period === "weekly") {
    const date = new Date(
      Date.UTC(year, month - 1, day)
    );

    const dayOfWeek = date.getUTCDay();
    const daysSinceMonday = (dayOfWeek + 6) % 7;

    date.setUTCDate(
      date.getUTCDate() - daysSinceMonday
    );

    return date.toISOString().slice(0, 10);
  }

  return `${year}-${String(month).padStart(2, "0")}`;
}

// ======================================================
// HOME PAGE
// ======================================================
export default function HomePage() {
  const [viralPeriod, setViralPeriod] = useState("weekly");

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
  // โหลด Viral Books จาก Backend
  // ======================================================
  useEffect(() => {
    let cancelled = false;

    async function loadViralBooks() {
      setViralLoading(true);
      setViralError("");

      try {
        const response = await fetch(
          `${API_URL}/viral-books?period=${viralPeriod}`
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
  }, [viralPeriod, reloadKey]);

  // ======================================================
  // ตรวจจับการเปลี่ยนสัปดาห์หรือเดือน
  // ======================================================
  useEffect(() => {
    let lastPeriodKey = getBangkokPeriodKey(viralPeriod);

    const timerId = window.setInterval(() => {
      const nextPeriodKey = getBangkokPeriodKey(viralPeriod);

      if (nextPeriodKey !== lastPeriodKey) {
        lastPeriodKey = nextPeriodKey;

        setReloadKey((key) => key + 1);

        console.log(
          `[Home] New ${viralPeriod} period detected. Reloading Viral Books...`
        );
      }
    }, 30_000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [viralPeriod]);

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

            <div className="flex items-center gap-2">
              {/* เลือกช่วงเวลา */}
              <div className="flex rounded-lg bg-[#FAEFEB] p-1">
                <button
                  type="button"
                  onClick={() => setViralPeriod("weekly")}
                  aria-pressed={viralPeriod === "weekly"}
                  className={`
                    rounded-md px-3 py-1.5 text-xs font-semibold
                    transition-colors
                    ${
                      viralPeriod === "weekly"
                        ? "bg-white text-[#A36D70] shadow-sm"
                        : "text-gray-500"
                    }
                  `}
                >
                  Weekly
                </button>

                <button
                  type="button"
                  onClick={() => setViralPeriod("monthly")}
                  aria-pressed={viralPeriod === "monthly"}
                  className={`
                    rounded-md px-3 py-1.5 text-xs font-semibold
                    transition-colors
                    ${
                      viralPeriod === "monthly"
                        ? "bg-white text-[#A36D70] shadow-sm"
                        : "text-gray-500"
                    }
                  `}
                >
                  Monthly
                </button>
              </div>

              <Link
                to="/viral-books"
                className="shrink-0 text-sm font-medium text-[#C65B61] hover:underline"
              >
                ดูทั้งหมด →
              </Link>
            </div>
          </div>

          {/* Loading */}
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
              ยังไม่มีรีวิวหนังสือในช่วงเวลานี้
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
