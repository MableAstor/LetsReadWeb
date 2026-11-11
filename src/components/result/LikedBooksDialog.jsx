import { Bookmark, Check, LoaderCircle } from "lucide-react";
import { getBookIdForLibrary } from "../../services/librarySaveService";

import { useEffect } from "react";
import { X, Heart } from "lucide-react";

const getBookTitle = (book) =>
  book?.title || book?.Books_Title || book?.Books_title || "ไม่ระบุชื่อหนังสือ";

const getBookImage = (book) =>
  book?.image ||
  book?.cover ||
  book?.Books_Cover ||
  book?.image_url ||
  "";

export default function LikedBooksDialog({ open, onClose, books = [], onSave, savedShelves = {}, savingBookId = null }) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#302923]/40 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="liked-books-title"
        className="flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[#eee5dc] bg-[#fffdf9] shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-[#eee8e1] px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f7e9e7]">
              <Heart className="h-5 w-5 fill-[#c98785] text-[#c98785]" />
            </div>

            <div className="min-w-0">
              <h2
                id="liked-books-title"
                className="text-sm font-bold text-[#403b37] sm:text-base"
              >
                หนังสือที่คุณถูกใจ
              </h2>
              <p className="text-xs text-[#a29589]">
                ทั้งหมด {books.length} เล่ม
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#8d8177] transition hover:bg-[#f3eee8] hover:text-[#403b37]"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="overflow-y-auto p-4 sm:p-6">
          {books.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#a29589]">
              ยังไม่มีหนังสือที่ถูกใจ
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {books.map((book, index) => {
                const title = getBookTitle(book);
                const image = getBookImage(book);

                return (
                  <article
                    key={book?.id ?? book?.BooksID ?? `${title}-${index}`}
                    className="min-w-0 overflow-hidden rounded-2xl border border-[#eee5dc] bg-white"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-[#f3eee8]">
                      {image ? (
                        <img
                          src={image}
                          alt={title}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl text-[#b6a99d]">
                          📖
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <h3
                        className="line-clamp-2 text-xs font-semibold leading-relaxed text-[#403b37] sm:text-sm"
                        title={title}
                      >
                        {title}
                      </h3>
                      {onSave && (
                        <div className="mt-3 space-y-2">
                          <button type="button"
                            disabled={!getBookIdForLibrary(book) || savingBookId !== null}
                            onClick={() => onSave(book, "Want to Read")}
                            className="flex w-full items-center justify-center gap-1 rounded-full bg-[#a87970] px-2 py-2 text-xs text-white disabled:opacity-50">
                            {savingBookId === getBookIdForLibrary(book) ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : savedShelves[String(getBookIdForLibrary(book))] === "Want to Read" ? <Check className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                            {savedShelves[String(getBookIdForLibrary(book))] === "Want to Read" ? "Saved" : "Want to Read"}
                          </button>
                          <button type="button"
                            disabled={!getBookIdForLibrary(book) || savingBookId !== null}
                            onClick={() => onSave(book, "Want to Buy")}
                            className="w-full rounded-full border border-[#e6d9cf] px-2 py-1.5 text-[11px] text-[#74675e] disabled:opacity-50">
                            {savedShelves[String(getBookIdForLibrary(book))] === "Want to Buy" ? "✓ Want to Buy" : "Want to Buy"}
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
