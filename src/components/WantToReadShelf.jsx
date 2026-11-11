import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import WanttoRead from "./Wanttoread";
import {
  getLibraryShelves,
  saveBookToLibrary,
  removeBookFromLibrary,
} from "../services/librarySaveService";

// Render this component in the Want to Read tab of My Library.
// The backend returns { BooksID, Shelve_Type, Book: { Books_title, Books_Cover, ... } }.
const toCardBook = (shelf) => ({
  ...shelf.Book,
  id: shelf.BooksID,
  BooksID: shelf.BooksID,
  title: shelf.Book?.Books_title || "ไม่ระบุชื่อหนังสือ",
  image: shelf.Book?.Books_Cover || "",
  cover: shelf.Book?.Books_Cover || "",
  description: shelf.Book?.Book_Synopsis || "",
});

export default function WantToReadShelf({ refreshKey = 0, onMarkAsRead }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const shelves = await getLibraryShelves();
      setBooks(shelves.filter((s) => s.Shelve_Type === "Want to Read" && s.Book).map(toCardBook));
    } catch (err) {
      setError(err.message || "โหลดชั้นหนังสือไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const update = async (book, action) => {
    setBusyId(book.BooksID);
    try {
      if (action === "move") {
        await saveBookToLibrary(book, "Want to Buy");
        toast.success("ย้ายไป Want to Buy แล้ว");
      } else {
        await removeBookFromLibrary(book, "Want to Read");
        toast.success("นำหนังสือออกจาก Library แล้ว");
      }
      setBooks((previous) => previous.filter((item) => item.BooksID !== book.BooksID));
    } catch (err) {
      toast.error(err.message || "ดำเนินการไม่สำเร็จ");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p className="py-8 text-center text-sm text-gray-500">กำลังโหลด Want to Read...</p>;
  if (error) return <div className="py-8 text-center text-sm text-red-600">{error}<button type="button" onClick={load} className="ml-3 underline">ลองอีกครั้ง</button></div>;
  if (!books.length) return <p className="py-8 text-center text-sm text-gray-500">ยังไม่มีหนังสือใน Want to Read — ไปที่หน้า Result แล้วกด Save to Library ได้เลย</p>;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {books.map((book) => (
        <div key={book.BooksID} className={busyId === book.BooksID ? "pointer-events-none opacity-60" : ""}>
          <WanttoRead
            book={book}
            onMoveToWantToBuy={() => update(book, "move")}
            onRemove={() => update(book, "remove")}
            onMarkAsRead={onMarkAsRead}
          />
        </div>
      ))}
    </div>
  );
}
