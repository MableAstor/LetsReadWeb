import { useCallback, useEffect, useState } from "react";

import {
  BookOpen,
  Bookmark,
} from "lucide-react";

import WanttoRead from "../components/Wanttoread.jsx";
import Savebookfrom from "../components/Savebookfrom";

import {
  getLibraryShelves,
  saveBookToLibrary,
  removeBookFromLibrary,
} from "../services/librarySaveService";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabase";

// API_URL
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api/auth";

// ======================================================
// INITIAL LIBRARY
// เหลือเพียง Saved Books และ Want to Read
// ======================================================
const initialLibrary = {
  wantToRead: [],
  savedBooks: [],
};

const tabs = [
  {
    value: "savedBooks",
    label: "Saved Books",
    icon: Bookmark,
  },
  {
    value: "wantToRead",
    label: "Want to Read",
    icon: BookOpen,
  },
];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("savedBooks");
  const [library, setLibrary] = useState(initialLibrary);

  const [savedLoading, setSavedLoading] = useState(true);
  const [savedError, setSavedError] = useState("");
  const [shelfLoading, setShelfLoading] = useState(true);
  const [shelfError, setShelfError] = useState("");
  const [busyBookId, setBusyBookId] = useState(null);

  // ======================================================
  // โหลด Saved Books จาก Backend
  // ======================================================
  const loadSavedBooks = useCallback(async () => {
    try {
      setSavedLoading(true);
      setSavedError("");

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.access_token) {
        setLibrary((prev) => ({
          ...prev,
          savedBooks: [],
        }));

        setSavedError("กรุณาเข้าสู่ระบบเพื่อดู Saved Books");
        return;
      }

      const response = await fetch(
        `${API_URL}/saved-reviews`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "โหลด Saved Books ไม่สำเร็จ"
        );
      }

      // แปลงข้อมูลรีวิวให้เข้ากับ Savebookfrom
      const entries = (
        Array.isArray(result.reviews) ? result.reviews : []
      ).map((item) => {
        const title = item.Book_Title || "Untitled book";

        // ใช้รูปจากรีวิวก่อน ถ้าไม่มีให้ใช้รูปปกจาก Books
        const imageUrl =
          item.Image_URL || item.Books_Cover || "";

        const tags = [
          item.Main_Category,
          item.Sub_Category,
        ].filter(Boolean);

        return {
          book: {
            id: `review-${item.ReviewsID}`,
            title,
            tags,
            cover: imageUrl,
            image: imageUrl,
            imageUrl,
            Books_Cover: imageUrl,
          },

          review: {
            // คงข้อมูลต้นฉบับจาก Backend
            ...item,

            // ข้อมูลที่ Savebookfrom ใช้งาน
            id: item.ReviewsID,
            username: item.User_Name || "Reader",
            bookTitle: title,
            mainCategory: item.Main_Category || "",
            subCategory: item.Sub_Category || "",
            rating: Number(item.Rating) || 0,
            reviewText: item.Review_Text || "",
            imageUrl: imageUrl || null,
            Saved_By_Me: true,
          },
        };
      });

      setLibrary((prev) => ({
        ...prev,
        savedBooks: entries,
      }));

      console.log(
        "[Library] Saved Books loaded:",
        entries.length
      );
    } catch (error) {
      console.error(
        "[Library] Load Saved Books error:",
        error
      );

      setSavedError(
        error.message || "โหลด Saved Books ไม่สำเร็จ"
      );
    } finally {
      setSavedLoading(false);
    }
  }, []);

  // โหลดรายการเมื่อเปิดหน้า Library
  useEffect(() => {
    loadSavedBooks();
  }, [loadSavedBooks]);

  // โหลดหนังสือที่ Save จากหน้า Result ในชั้น Want to Read
  const loadWantToRead = useCallback(async () => {
    setShelfLoading(true);
    setShelfError("");
    try {
      const shelves = await getLibraryShelves();
      const books = shelves
        .filter((shelf) => shelf.Shelve_Type === "Want to Read" && shelf.Book)
        .map((shelf) => ({
          ...shelf.Book,
          id: shelf.BooksID,
          BooksID: shelf.BooksID,
          title: shelf.Book.Books_title || "ไม่ระบุชื่อหนังสือ",
          cover: shelf.Book.Books_Cover || "",
          image: shelf.Book.Books_Cover || "",
          imageUrl: shelf.Book.Books_Cover || "",
          description: shelf.Book.Book_Synopsis || "",
        }));
      setLibrary((prev) => ({ ...prev, wantToRead: books }));
    } catch (error) {
      setShelfError(error.message || "โหลด Want to Read ไม่สำเร็จ");
    } finally {
      setShelfLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWantToRead();
  }, [loadWantToRead]);

  // โหลดข้อมูลใหม่ทุกครั้งที่กลับมาที่หน้า Library (เช่น หลัง Save จาก Result)
  useEffect(() => {
    const onFocus = () => {
      loadWantToRead();
      loadSavedBooks();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadWantToRead, loadSavedBooks]);

  const moveToWantToBuy = async (book) => {
    if (busyBookId !== null) return;
    setBusyBookId(book.id);
    try {
      await saveBookToLibrary(book, "Want to Buy");
      setLibrary((prev) => ({
        ...prev,
        wantToRead: prev.wantToRead.filter((item) => String(item.id) !== String(book.id)),
      }));
    } catch (error) {
      window.alert(error.message || "ย้ายหนังสือไม่สำเร็จ");
    } finally {
      setBusyBookId(null);
    }
  };

  // ======================================================
  // ตรวจสอบว่าเป็นรีวิวที่มาจากระบบ Save หรือไม่
  // ======================================================
  const isSavedReview = (book) =>
    String(book?.id ?? "").startsWith("review-");

  // ======================================================
  // ยกเลิกการบันทึกรีวิวใน Backend
  // ======================================================
  const unsaveReviewOnServer = async (book) => {
    if (!isSavedReview(book)) {
      return;
    }

    const reviewId = String(book.id).slice("review-".length);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    if (!session?.access_token) {
      throw new Error("กรุณาเข้าสู่ระบบใหม่");
    }

    const response = await fetch(
      `${API_URL}/reviews/${reviewId}/save`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
      throw new Error(
        result.message || "ยกเลิกการบันทึกไม่สำเร็จ"
      );
    }

    // ตรวจสอบว่า Backend ยกเลิก Save สำเร็จจริง
    if (result.saved !== false) {
      throw new Error("ไม่สามารถยกเลิกการบันทึกได้");
    }
  };

  // ======================================================
  // นำหนังสือออกจากรายการ
  // ======================================================
  const removeBook = async (listName, book) => {
    console.log("[Library] Remove clicked:", listName, book);

    if (!book?.id) {
      console.error(
        "[Library] ไม่พบ ID ของหนังสือที่ต้องการลบ",
        book
      );

      window.alert("ไม่พบ ID ของรายการที่ต้องการลบ");
      return;
    }

    // เก็บรายการเดิมไว้ เผื่อต้องคืนค่าหาก Backend ลบไม่สำเร็จ
    const previousItems = library[listName] ?? [];

    // นำรายการออกจากหน้าจอทันที
    setLibrary((prev) => ({
      ...prev,
      [listName]: (prev[listName] ?? []).filter((item) => {
        const actualBook = item?.book ?? item;

        return (
          String(actualBook?.id ?? "") !== String(book.id)
        );
      }),
    }));

    try {
      // ลบหนังสือจาก Supabase จริง ไม่ใช่ลบเฉพาะบนหน้าจอ
      if (listName === "savedBooks") {
        await unsaveReviewOnServer(book);
      } else if (listName === "wantToRead") {
        await removeBookFromLibrary(book, "Want to Read");
      }

      console.log(
        "[Library] Remove successful:",
        book.id
      );
    } catch (error) {
      console.error("[Library] Remove failed:", error);

      // หากลบใน Backend ไม่สำเร็จ ให้คืนรายการกลับมา
      setLibrary((prev) => ({
        ...prev,
        [listName]: previousItems,
      }));

      window.alert(
        error.message ||
          "นำรีวิวออกจาก Saved Books ไม่สำเร็จ กรุณาลองใหม่"
      );
    }
  };

  const markAsRead = (book) => {
    console.log("Mark as Read:", book);
  };

  const currentItems = library[activeTab] ?? [];

  return (
    <main
      className="
        mx-auto w-full max-w-5xl
        min-w-0 px-3 pt-4
        pb-[calc(110px+env(safe-area-inset-bottom))]
        sm:px-5 sm:pt-6
        lg:pb-10
      "
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Library
          </h1>

          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            จัดการหนังสือที่คุณบันทึกไว้
          </p>
        </div>

        <Badge variant="secondary" className="rounded-full">
          {currentItems.length} Books
        </Badge>
      </div>

      {/* Tabs */}
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-white/70 p-2 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.value;

          return (
            <Button
              key={tab.value}
              type="button"
              variant="ghost"
              onClick={() => setActiveTab(tab.value)}
              aria-pressed={selected}
              className={`
                flex h-auto min-h-14 min-w-0
                flex-col gap-1 rounded-xl
                px-1 py-2 text-[10px]
                sm:min-h-12 sm:flex-row
                sm:px-3 sm:text-sm
                ${
                  selected
                    ? "bg-[#FAEFEB] text-[#A36D70]"
                    : "text-muted-foreground"
                }
              `}
            >
              <Icon className="h-4 w-4 shrink-0" />

              <span className="text-center">
                {tab.label}
              </span>

              <span>({library[tab.value].length})</span>
            </Button>
          );
        })}
      </div>

      {/* Book Grid */}
      {activeTab === "savedBooks" && savedLoading ? (
        <div className="flex min-h-60 items-center justify-center rounded-2xl border border-dashed bg-white/70 p-6">
          <p className="text-sm text-muted-foreground">
            กำลังโหลด Saved Books...
          </p>
        </div>
      ) : activeTab === "savedBooks" && savedError ? (
        <div className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-white/70 p-6 text-center">
          <p className="text-sm text-red-600">
            {savedError}
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={loadSavedBooks}
          >
            Try again
          </Button>
        </div>
      ) : activeTab === "wantToRead" && shelfLoading ? (
        <div className="flex min-h-60 items-center justify-center rounded-2xl border border-dashed bg-white/70 p-6">
          <p className="text-sm text-muted-foreground">กำลังโหลด Want to Read...</p>
        </div>
      ) : activeTab === "wantToRead" && shelfError ? (
        <div className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-white/70 p-6 text-center">
          <p className="text-sm text-red-600">{shelfError}</p>
          <Button type="button" variant="outline" onClick={loadWantToRead}>Try again</Button>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-white/70 p-6 text-center">
          <BookOpen className="h-9 w-9 text-muted-foreground" />

          <p className="text-sm font-semibold">
            ยังไม่มีหนังสือในหมวดนี้
          </p>
        </div>
      ) : (
        <div
          className="
            grid w-full min-w-0
            grid-cols-2 items-start
            gap-x-3 gap-y-6
            sm:grid-cols-3 sm:gap-4
            lg:grid-cols-4
            xl:grid-cols-5
          "
        >
          {activeTab === "savedBooks" &&
            library.savedBooks.map((entry) => (
              <Savebookfrom
                key={entry.book.id}
                book={entry.book}
                review={entry.review}
                onMarkAsRead={markAsRead}
                onRemove={(book) =>
                  removeBook("savedBooks", book)
                }
              />
            ))}

          {activeTab === "wantToRead" &&
            library.wantToRead.map((book) => (
              <WanttoRead
                key={book.id}
                book={book}
                onMarkAsRead={markAsRead}
                onMoveToWantToBuy={moveToWantToBuy}
                onRemove={(book) => {
                  if (busyBookId === null) removeBook("wantToRead", book);
                }}
              />
            ))}
        </div>
      )}
    </main>
  );
}
