import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookCard } from "../components/BookCard";

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
// VIRAL BOOKS PAGE
// ======================================================

export default function ViralBooksPage() {
  const [viralBooks, setViralBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // โหลด Viral Books รายเดือนจาก Backend
  // ======================================================

  useEffect(() => {
    let controller;
    let currentMonthKey = getBangkokMonthKey();

    // ดึงข้อมูลหนังสือ Viral จาก Backend
    const fetchViralBooks = async () => {
      // ยกเลิกคำขอก่อนหน้า หากมีการโหลดใหม่
      controller?.abort();

      const requestController = new AbortController();
      controller = requestController;

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/viral-books`,
          {
            signal: requestController.signal,
          }
        );

        const data = await response.json().catch(() => ({}));

        if (
          !response.ok ||
          data.success === false
        ) {
          throw new Error(
            data.message ||
              data.error ||
              "ไม่สามารถโหลดข้อมูลได้"
          );
        }

        // รองรับข้อมูลจาก Backend ทั้งแบบ Array และ Object
        const books = Array.isArray(data)
          ? data
          : data.books;

        if (!Array.isArray(books)) {
          throw new Error(
            "รูปแบบข้อมูลจาก Backend ไม่ถูกต้อง"
          );
        }

        const formattedBooks = books.map((book) => {
          const reviewCount =
            Number(book.Review_Count) || 0;

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

        if (!requestController.signal.aborted) {
          setViralBooks(formattedBooks);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(
            "[Viral Books] Fetch error:",
            err
          );

          setError(
            err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล"
          );
        }
      } finally {
        if (!requestController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    // โหลดข้อมูลครั้งแรก
    fetchViralBooks();

    // ======================================================
    // ตรวจจับการเปลี่ยนเดือนตามเวลาไทย
    // หากขึ้นเดือนใหม่ ให้โหลด Viral Books ใหม่
    // ======================================================

    const interval = window.setInterval(() => {
      const newMonthKey = getBangkokMonthKey();

      if (newMonthKey !== currentMonthKey) {
        currentMonthKey = newMonthKey;

        console.log(
          "[Viral Books] New month detected. Reloading..."
        );

        fetchViralBooks();
      }
    }, 30000);

    return () => {
      window.clearInterval(interval);
      controller?.abort();
    };
  }, []);

  return (
    <main className="mx-auto w-full min-w-0 max-w-screen-2xl px-3 py-6 pb-28">
      {/* Page Header */}
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

      {/* ======================================================
          แสดงช่วงเวลาการจัดอันดับรายเดือน
         ====================================================== */}

      <div className="mb-6 flex gap-2">
        <span
          className="
            rounded-full
            bg-[#C65B61]
            px-5 py-2
            text-sm font-medium
            text-white
          "
        >
          รายเดือน
        </span>
      </div>

      {/* ======================================================
          แสดงรายการหนังสือ
         ====================================================== */}

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
          ยังไม่มีหนังสือในเดือนนี้
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-7">
          {viralBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
            />
          ))}
        </div>
      )}
    </main>
  );
}