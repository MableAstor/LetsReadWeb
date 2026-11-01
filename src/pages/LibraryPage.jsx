import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  Bookmark,
  ShoppingBag,
} from "lucide-react";

import WanttoRead from "../components/Wanttoread.jsx";
import WanttoBuy from "../components/WanttoBuy";
import Savebookfrom from "../components/Savebookfrom";

import {
  viralBooks,
  topBooks,
  savedBooks,
} from "../data/books";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabase";

// แก้รูปแบบ API_URL ให้เป็น URL ปกติ
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api/auth";

const initialLibrary = {
  wantToRead: [...viralBooks],
  wantToBuy: savedBooks.slice(0, 2),
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
  {
    value: "wantToBuy",
    label: "Want to Buy",
    icon: ShoppingBag,
  },
];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("savedBooks");
  const [library, setLibrary] = useState(initialLibrary);

  const [savedLoading, setSavedLoading] = useState(true);
  const [savedError, setSavedError] = useState("");

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

      const response = await fetch(`${API_URL}/saved-reviews`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

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
        const imageUrl = item.Image_URL || item.Books_Cover || "";

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
            // เพื่อให้ ReviewCard แสดงรายละเอียดรีวิวได้ครบ
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

  // ตรวจสอบว่าเป็นรีวิวที่มาจากระบบ Save หรือไม่
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

  const sameBook = (a, b) =>
    String(a?.id) === String(b?.id);

  // ======================================================
  // ย้ายหนังสือระหว่างแท็บ
  // ======================================================
  const moveBook = async (book, targetTab) => {
    try {
      // ถ้าเป็นรีวิวที่บันทึกจาก Feed ให้ยกเลิก Save ก่อน
      await unsaveReviewOnServer(book);

      setLibrary((prev) => {
        const next = {
          wantToRead: prev.wantToRead.filter(
            (item) => !sameBook(item, book)
          ),
          wantToBuy: prev.wantToBuy.filter(
            (item) => !sameBook(item, book)
          ),
          savedBooks: prev.savedBooks.filter(
            (entry) => !sameBook(entry.book, book)
          ),
        };

        if (targetTab === "wantToBuy") {
          next.wantToBuy.push(book);
        }

        if (targetTab === "wantToRead") {
          next.wantToRead.push(book);
        }

        return next;
      });
    } catch (error) {
      console.error("[Library] Move book error:", error);
      window.alert(error.message || "ย้ายหนังสือไม่สำเร็จ");
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
      window.alert("ไม่พบข้อมูลรีวิวที่ต้องการลบ");
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
      // ยกเลิก Save ในฐานข้อมูลเมื่ออยู่ใน Saved Books
      if (listName === "savedBooks") {
        await unsaveReviewOnServer(book);
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
      <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl bg-white/70 p-2 shadow-sm">
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
                onMoveToWantToBuy={(book) =>
                  moveBook(book, "wantToBuy")
                }
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
                onMoveToWantToBuy={(item) =>
                  moveBook(item, "wantToBuy")
                }
                onMarkAsRead={markAsRead}
                onRemove={(book) => removeBook("wantToRead", book)}
              />
            ))}

          {activeTab === "wantToBuy" &&
            library.wantToBuy.map((book) => (
              <WanttoBuy
                key={book.id}
                book={book}
              />
            ))}
        </div>
      )}
    </main>
  );
}