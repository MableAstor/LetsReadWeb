import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookCard } from "../components/BookCard";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api/auth";

// ใช้ตรวจสอบสัปดาห์และเดือนตามเวลาไทย
function getBangkokPeriodKey(period) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = Number(parts.find((part) => part.type === "year").value);
  const month = Number(parts.find((part) => part.type === "month").value);
  const day = Number(parts.find((part) => part.type === "day").value);

  // รายเดือน
  if (period === "monthly") {
    return `${year}-${String(month).padStart(2, "0")}`;
  }

  // รายสัปดาห์ เริ่มวันจันทร์
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = date.getUTCDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;

  date.setUTCDate(date.getUTCDate() - daysSinceMonday);

  return date.toISOString().slice(0, 10);
}

export default function ViralBooksPage() {
  const [viralPeriod, setViralPeriod] = useState("weekly");
  const [viralBooks, setViralBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let controller;
    let currentPeriodKey = getBangkokPeriodKey(viralPeriod);

    // ดึงข้อมูลหนังสือ Viral จาก Backend
    const fetchViralBooks = async () => {
      controller?.abort();
      controller = new AbortController();

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/viral-books?period=${viralPeriod}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.error || "ไม่สามารถโหลดข้อมูลได้");
        }

        const books = Array.isArray(data) ? data : data.books;

        if (!Array.isArray(books)) {
          throw new Error("รูปแบบข้อมูลจาก Backend ไม่ถูกต้อง");
        }

        const formattedBooks = books.map((book) => {
          const reviewCount = Number(book.Review_Count) || 0;

          return {
            id: book.BooksID,
            title: book.Books_title || "Untitled book",
            image: book.Books_Cover || "",
            author: "",
            tags: [`${reviewCount} รีวิว`],
            reviewCount,
            synopsis: book.Book_Synopsis || "",
          };
        });

        setViralBooks(formattedBooks);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch Viral Books Error:", err);
          setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchViralBooks();

    // ตรวจสอบเมื่อเปลี่ยนสัปดาห์หรือเดือน
    const interval = setInterval(() => {
      const newPeriodKey = getBangkokPeriodKey(viralPeriod);

      if (newPeriodKey !== currentPeriodKey) {
        currentPeriodKey = newPeriodKey;
        fetchViralBooks();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      controller?.abort();
    };
  }, [viralPeriod]);

  return (
    <main className="mx-auto w-full min-w-0 max-w-screen-2xl px-3 py-6 pb-28">
      <div className="mb-6">
        <Link
          to="/"
          className="mb-3 inline-block text-sm text-[#C65B61] hover:underline"
        >
          ← กลับหน้าหลัก
        </Link>

        <h1 className="text-2xl font-bold text-[#533C3E]">
          หนังสือ Viral มาแรง 🔥
        </h1>

        <p className="mt-1 text-sm text-[#9B8583]">
          หนังสือที่ได้รับความนิยมจากจำนวนรีวิว
        </p>
      </div>

      {/* เลือกช่วงเวลาการจัดอันดับ */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setViralPeriod("weekly")}
          aria-pressed={viralPeriod === "weekly"}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            viralPeriod === "weekly"
              ? "bg-[#C65B61] text-white"
              : "bg-[#F8EEEE] text-[#9B8583] hover:bg-[#F2DDDD]"
          }`}
        >
          รายสัปดาห์
        </button>

        <button
          onClick={() => setViralPeriod("monthly")}
          aria-pressed={viralPeriod === "monthly"}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            viralPeriod === "monthly"
              ? "bg-[#C65B61] text-white"
              : "bg-[#F8EEEE] text-[#9B8583] hover:bg-[#F2DDDD]"
          }`}
        >
          รายเดือน
        </button>
      </div>

      {/* แสดงรายการหนังสือ */}
      {loading ? (
        <p className="py-10 text-center text-[#9B8583]">
          กำลังโหลดข้อมูลหนังสือ...
        </p>
      ) : error ? (
        <p className="py-10 text-center text-red-500">
          {error}
        </p>
      ) : viralBooks.length === 0 ? (
        <p className="py-10 text-center text-[#9B8583]">
          ยังไม่มีหนังสือในช่วงเวลานี้
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-7">
          {viralBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </main>
  );
}