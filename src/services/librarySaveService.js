import { supabase } from "../lib/supabase";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

async function request(path, options = {}) {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data?.session?.access_token;
  if (!token) throw new Error("กรุณาเข้าสู่ระบบก่อนบันทึกหนังสือ");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success !== true) {
    throw new Error(payload?.message || `Library API error (${response.status})`);
  }
  return payload;
}

export const getBookIdForLibrary = (book) => {
  const value = book?.BooksID ?? book?.books_id ?? book?.book_id ?? book?.id;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

export async function getLibraryShelves() {
  return (await request("/api/auth/shelves")).shelves || [];
}

export async function saveBookToLibrary(book, shelfType = "Want to Read") {
  const BooksID = getBookIdForLibrary(book);
  if (!BooksID) throw new Error("ไม่พบ BooksID ของหนังสือเล่มนี้");
  if (!["Want to Read", "Want to Buy"].includes(shelfType)) {
    throw new Error("ประเภทชั้นหนังสือไม่ถูกต้อง");
  }
  return request("/api/auth/shelves", {
    method: "POST",
    body: JSON.stringify({ BooksID, Shelve_Type: shelfType }),
  });
}

export async function removeBookFromLibrary(book, shelfType = "Want to Read") {
  const bookId = getBookIdForLibrary(book);
  if (!bookId) throw new Error("ไม่พบ BooksID ของหนังสือเล่มนี้");
  return request(`/api/auth/shelves/${bookId}?type=${encodeURIComponent(shelfType)}`, {
    method: "DELETE",
  });
}
